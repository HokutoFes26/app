-- Get all data
CREATE OR REPLACE FUNCTION get_all_data()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    's', (SELECT COALESCE(json_agg(json_build_object('i', id, 'c', crowd_level, 'l', stock_level)), '[]'::json) FROM stalls_status),
    'n', (SELECT COALESCE(json_agg(json_build_object('i', id, 't', title, 'c', content, 'a', to_char(created_at AT TIME ZONE 'Asia/Tokyo', 'MMDDHH24MI'), 'r', edit_reason)), '[]'::json) FROM (SELECT * FROM news ORDER BY created_at DESC LIMIT 20) as news),
    'l', (SELECT COALESCE(json_agg(json_build_object('i', id, 'n', name, 'p', place, 'a', to_char(created_at AT TIME ZONE 'Asia/Tokyo', 'MMDDHH24MI'), 'r', edit_reason, 'f', photo_path)), '[]'::json) FROM (SELECT * FROM lost_items ORDER BY created_at DESC LIMIT 20) as lost_items),
    'config', (SELECT COALESCE(json_object_agg(key, value_int), '{}'::json) FROM app_settings)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get booth data
CREATE OR REPLACE FUNCTION get_stalls_only()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    's', (SELECT COALESCE(json_agg(json_build_object('i', id, 'c', crowd_level, 'l', stock_level)), '[]'::json) FROM stalls_status)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vote RPC
CREATE OR REPLACE FUNCTION vote_for_target(
    p_voter_id TEXT,
    p_target_id TEXT,
    p_category TEXT,
    p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_start_at INT;
    v_end_at INT;
    v_voting_enabled INT;
    v_now INT;
    v_client_ip TEXT;
    v_last_vote_time TIMESTAMPTZ;
BEGIN
    SELECT value_int INTO v_start_at FROM app_settings WHERE key = 'vote_start_at';
    SELECT value_int INTO v_end_at FROM app_settings WHERE key = 'vote_end_at';
    SELECT value_int INTO v_voting_enabled FROM app_settings WHERE key = 'voting_enabled';
    v_now := EXTRACT(EPOCH FROM now())::INT;

    -- T1: Time & Enable check
    IF v_voting_enabled IS NULL OR v_voting_enabled <> 1 THEN
        RAISE EXCEPTION '投票は現在受け付けておりません';
    END IF;
    IF v_start_at IS NULL OR v_end_at IS NULL THEN
        RAISE EXCEPTION '投票設定が見つかりません';
    END IF;
    IF v_now < v_start_at OR v_now > v_end_at THEN
        RAISE EXCEPTION '投票期間外です';
    END IF;

    -- T4: Existence check
    IF NOT EXISTS (SELECT 1 FROM vote_targets WHERE id = p_target_id AND category = p_category) THEN
        RAISE EXCEPTION '無効な投票先です';
    END IF;

    -- T3: Rate Limit based on voter_id & IP Safety Net
    v_client_ip := current_setting('request.headers', true)::json->>'x-forwarded-for';
    IF v_client_ip IS NOT NULL AND v_client_ip ~ ',' THEN
        v_client_ip := split_part(v_client_ip, ',', 1);
    END IF;
    IF v_client_ip IS NULL THEN v_client_ip := p_voter_id; END IF;

    SELECT MAX(created_at) INTO v_last_vote_time FROM votes WHERE voter_id = p_voter_id;
    IF v_last_vote_time IS NOT NULL AND (now() - v_last_vote_time) < interval '5 seconds' THEN
        RAISE EXCEPTION '連打は禁止されています。数秒後に再試行してください。';
    END IF;

    -- Vote execution
    DELETE FROM votes WHERE voter_id = p_voter_id AND category = p_category;
    INSERT INTO votes (voter_id, target_id, category, ip_address, user_agent)
    VALUES (p_voter_id, p_target_id, p_category, v_client_ip, LEFT(p_user_agent, 500));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_my_votes(p_voter_id TEXT)
RETURNS TABLE (category TEXT, target_id TEXT) AS $$
BEGIN
    RETURN QUERY SELECT v.category, v.target_id FROM votes v WHERE v.voter_id = p_voter_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vote time synchronization (T4)
CREATE OR REPLACE FUNCTION fn_sync_app_settings_time()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.key IN ('vote_start_at', 'vote_end_at') THEN
        IF NEW.value_text IS NOT NULL AND NEW.value_text <> '' THEN
            IF NEW.value_text ~ '^\d{4}-\d{2}-\d{2}' THEN
                BEGIN
                    NEW.value_int := EXTRACT(EPOCH FROM NEW.value_text::timestamptz)::int;
                EXCEPTION WHEN OTHERS THEN
                    RAISE EXCEPTION 'Date convertion error: %', NEW.value_text;
                END;
            ELSE
                RAISE EXCEPTION 'Invalid date format (YYYY-MM-DD): %', NEW.value_text;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_sync_app_settings_time ON app_settings;
CREATE TRIGGER tr_sync_app_settings_time
BEFORE INSERT OR UPDATE ON app_settings
FOR EACH ROW
EXECUTE FUNCTION fn_sync_app_settings_time();

-- Vote results view
DROP VIEW IF EXISTS vote_results CASCADE;
CREATE VIEW vote_results
WITH (security_invoker = true)
AS
SELECT
    vt.id,
    vt.category,
    COUNT(vo.id) as vote_count
FROM vote_targets vt
LEFT JOIN votes vo ON vt.id = vo.target_id
GROUP BY vt.id, vt.category, vt.display_order
ORDER BY vt.category, vote_count DESC, vt.display_order;

CREATE OR REPLACE FUNCTION export_vote_data()
RETURNS json AS $$
DECLARE
    v_admin_email TEXT;
BEGIN
  IF auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION '閲覧権限がありません';
  END IF;

  RETURN (
    SELECT json_agg(json_build_object(
      'voter_id', v.voter_id,
      'target_name', vt.name,
      'category', v.category,
      'ip', v.ip_address,
      'ua', v.user_agent,
      'time', v.created_at AT TIME ZONE 'Asia/Tokyo'
    ) ORDER BY v.created_at DESC)
    FROM votes v
    LEFT JOIN vote_targets vt ON v.target_id = vt.id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vote results summary (Rank, Category, Name, Votes)
CREATE OR REPLACE FUNCTION get_vote_results_summary()
RETURNS json AS $$
BEGIN
  IF auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION '閲覧権限がありません';
  END IF;

  RETURN (
    SELECT json_agg(json_build_object(
      'rank', rank,
      'category', category,
      'name', name,
      'votes', vote_count
    ))
    FROM (
      SELECT
        vt.name,
        vt.category,
        COUNT(vo.id) as vote_count,
        RANK() OVER (PARTITION BY vt.category ORDER BY COUNT(vo.id) DESC) as rank
      FROM vote_targets vt
      LEFT JOIN votes vo ON vt.id = vo.target_id
      GROUP BY vt.id, vt.name, vt.category
      ORDER BY vt.category, rank ASC
    ) ranked_results
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit suspicious votes
CREATE OR REPLACE FUNCTION audit_suspicious_votes()
RETURNS json AS $$
BEGIN
  IF auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION '閲覧権限がありません';
  END IF;

  RETURN (
    SELECT json_build_object(
      'suspicious_ips', (
        SELECT COALESCE(json_agg(json_build_object(
          'ip', ip_address,
          'voter_count', voter_count,
          'vote_count', vote_count,
          'unique_devices', device_count,
          'risk_level', risk_level,
          'targets', target_names
        )), '[]'::json)
        FROM (
          SELECT 
            v.ip_address,
            COUNT(DISTINCT v.voter_id) as voter_count,
            COUNT(v.id) as vote_count,
            COUNT(DISTINCT v.user_agent) as device_count,
            CASE 
              WHEN COUNT(DISTINCT v.voter_id) >= 50 AND COUNT(DISTINCT v.user_agent) <= 3 THEN 'HIGH (Script Suspect)'
              WHEN COUNT(DISTINCT v.voter_id) >= 100 THEN 'MEDIUM (High Volume IP)'
              ELSE 'LOW (Shared IP)'
            END as risk_level,
            string_agg(DISTINCT vt.name, ', ') as target_names
          FROM votes v
          JOIN vote_targets vt ON v.target_id = vt.id
          GROUP BY v.ip_address
          HAVING COUNT(DISTINCT v.voter_id) >= 30
          ORDER BY voter_count DESC
        ) ip_audit
      ),
      'rapid_votes', (
        SELECT COALESCE(json_agg(json_build_object(
          'time_bucket', time_bucket,
          'category', category,
          'vote_count', vote_count
        )), '[]'::json)
        FROM (
          SELECT 
            to_char(created_at, 'YYYY-MM-DD HH24:MI') as time_bucket,
            category,
            COUNT(*) as vote_count
          FROM votes
          GROUP BY time_bucket, category
          HAVING COUNT(*) >= 30
          ORDER BY time_bucket DESC
        ) rapid_audit
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vote results
CREATE OR REPLACE FUNCTION get_vote_results_compressed()
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT json_agg(json_build_object(
      'c', category,
      'i', id,
      'v', vote_count
    ))
    FROM vote_results
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;