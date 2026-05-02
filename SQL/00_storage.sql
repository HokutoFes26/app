-- Storage bucket for lost items
INSERT INTO storage.buckets (id, name, public)
VALUES ('lost-items', 'lost-items', true)
ON CONFLICT (id) DO NOTHING;