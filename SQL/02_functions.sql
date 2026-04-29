-- Get all data
CREATE OR REPLACE FUNCTION get_all_data()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    's', (SELECT COALESCE(json_agg(json_build_object('i', id, 'c', crowd_level, 'l', stock_level)), '[]'::json) FROM stalls_status),
    'n', (SELECT COALESCE(json_agg(json_build_object('i', id, 't', title, 'c', content, 'a', to_char(created_at, 'MMDDHH24MI'), 'r', edit_reason)), '[]'::json) FROM (SELECT * FROM news ORDER BY created_at DESC LIMIT 5) as news),
    'l', (SELECT COALESCE(json_agg(json_build_object('i', id, 'n', name, 'p', place, 'a', to_char(created_at, 'MMDDHH24MI'), 'r', edit_reason)), '[]'::json) FROM (SELECT * FROM lost_items ORDER BY created_at DESC LIMIT 10) as lost_items),
    'q', (SELECT COALESCE(json_agg(json_build_object('i', id, 't', text, 'w', answer, 'a', to_char(created_at, 'MMDDHH24MI'), 'r', edit_reason)), '[]'::json) FROM (SELECT * FROM questions ORDER BY created_at DESC LIMIT 20) as questions),
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

-- Vote
CREATE OR REPLACE FUNCTION vote_for_target(
    p_voter_id TEXT,
    p_target_id UUID,
    p_category TEXT
) RETURNS VOID AS $$
BEGIN
    DELETE FROM votes WHERE voter_id = p_voter_id AND category = p_category;
    INSERT INTO votes (voter_id, target_id, category)
    VALUES (p_voter_id, p_target_id, p_category);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vote results
DROP VIEW IF EXISTS vote_results;
CREATE VIEW vote_results
WITH (security_invoker = true)
AS
SELECT
    vt.category,
    vt.name,
    COUNT(v.id) as vote_count
FROM vote_targets vt
LEFT JOIN votes v ON vt.id = v.target_id
GROUP BY vt.category, vt.name, vt.display_order
ORDER BY vt.category, vote_count DESC, vt.display_order;
