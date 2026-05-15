-- Server Configuration (Static Settings)
INSERT INTO app_settings (key, value_int, value_text) VALUES
('maintenance_mode', 0, NULL),
('voting_enabled', 1, NULL),
('vote_start_at', 0, '2026-05-23 10:00:00+09'),
('vote_end_at', 0, '2026-05-24 14:00:00+09'),
('poll_interval_ms', 30000, NULL),
('booth_common_password', NULL, '{{BOOTH_PASSWORD}}')
ON CONFLICT (key) DO UPDATE SET
    value_text = EXCLUDED.value_text,
    value_int = CASE 
        WHEN EXCLUDED.value_text IS NOT NULL THEN app_settings.value_int
        ELSE EXCLUDED.value_int 
    END;
