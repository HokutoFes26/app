-- Enable RLS
ALTER TABLE stalls_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Read (all users)
DROP POLICY IF EXISTS "Allow Public Read Stalls" ON stalls_status;
CREATE POLICY "Allow Public Read Stalls" ON stalls_status FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow Public Read News" ON news;
CREATE POLICY "Allow Public Read News" ON news FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow Public Read LostItems" ON lost_items;
CREATE POLICY "Allow Public Read LostItems" ON lost_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow Public Read Questions" ON questions;
CREATE POLICY "Allow Public Read Questions" ON questions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow Public Read Settings" ON app_settings;
CREATE POLICY "Allow Public Read Settings" ON app_settings FOR SELECT USING (key NOT IN ('booth_common_password'));
DROP POLICY IF EXISTS "Allow Admin Read All Settings" ON app_settings;
CREATE POLICY "Allow Admin Read All Settings" ON app_settings FOR SELECT TO authenticated USING (auth.jwt()->>'email' = '{{ADMIN_EMAIL}}');
DROP POLICY IF EXISTS "Allow Public Read VoteTargets" ON vote_targets;
CREATE POLICY "Allow Public Read VoteTargets" ON vote_targets FOR SELECT USING (true);

-- Insert (user for QA)
DROP POLICY IF EXISTS "Allow Public Insert Questions" ON questions;
CREATE POLICY "Allow Public Insert Questions" ON questions FOR INSERT WITH CHECK (true);

-- Write (admin/stall-admin)
DROP POLICY IF EXISTS "Allow Admin Update Stalls" ON stalls_status;
CREATE POLICY "Allow Admin Update Stalls" ON stalls_status FOR UPDATE TO authenticated USING (auth.jwt()->>'email' = '{{ADMIN_EMAIL}}' OR auth.jwt()->>'email' = '{{BOOTH_ADMIN_EMAIL}}') WITH CHECK (auth.jwt()->>'email' = '{{ADMIN_EMAIL}}' OR auth.jwt()->>'email' = '{{BOOTH_ADMIN_EMAIL}}');

-- Write (admin for news/lost items)
DROP POLICY IF EXISTS "Allow Admin Full News" ON news;
CREATE POLICY "Allow Admin Full News" ON news FOR ALL TO authenticated USING (auth.jwt()->>'email' = '{{ADMIN_EMAIL}}') WITH CHECK (auth.jwt()->>'email' = '{{ADMIN_EMAIL}}');
DROP POLICY IF EXISTS "Allow Admin Full LostItems" ON lost_items;
CREATE POLICY "Allow Admin Full LostItems" ON lost_items FOR ALL TO authenticated USING (auth.jwt()->>'email' = '{{ADMIN_EMAIL}}') WITH CHECK (auth.jwt()->>'email' = '{{ADMIN_EMAIL}}');

-- Write / Delete (admin for Q&A)
DROP POLICY IF EXISTS "Allow Admin Manage Questions" ON questions;
CREATE POLICY "Allow Admin Manage Questions" ON questions FOR UPDATE TO authenticated USING (auth.jwt()->>'email' = '{{ADMIN_EMAIL}}') WITH CHECK (auth.jwt()->>'email' = '{{ADMIN_EMAIL}}');
DROP POLICY IF EXISTS "Allow Admin Delete Questions" ON questions;
CREATE POLICY "Allow Admin Delete Questions" ON questions FOR DELETE TO authenticated USING (auth.jwt()->>'email' = '{{ADMIN_EMAIL}}');

-- Write (admin for server config / vote)
DROP POLICY IF EXISTS "Allow Admin Update Settings" ON app_settings;
CREATE POLICY "Allow Admin Update Settings" ON app_settings FOR UPDATE TO authenticated USING (auth.jwt()->>'email' = '{{ADMIN_EMAIL}}') WITH CHECK (auth.jwt()->>'email' = '{{ADMIN_EMAIL}}');
DROP POLICY IF EXISTS "Allow Admin Full Settings" ON app_settings;
CREATE POLICY "Allow Admin Full Settings" ON app_settings FOR ALL TO authenticated USING (auth.jwt()->>'email' = '{{ADMIN_EMAIL}}') WITH CHECK (auth.jwt()->>'email' = '{{ADMIN_EMAIL}}');
DROP POLICY IF EXISTS "Allow Admin Manage VoteTargets" ON vote_targets;
CREATE POLICY "Allow Admin Manage VoteTargets" ON vote_targets FOR ALL TO authenticated USING (auth.jwt()->>'email' = '{{ADMIN_EMAIL}}') WITH CHECK (auth.jwt()->>'email' = '{{ADMIN_EMAIL}}');

-- Security: Explicitly block anonymous updates to app_settings (T4)
CREATE OR REPLACE FUNCTION fn_block_anon_update()
RETURNS TRIGGER AS $$
BEGIN
    IF auth.role() = 'anon' THEN
        RAISE EXCEPTION 'Security Violation:';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_block_anon_update ON app_settings;
CREATE TRIGGER tr_block_anon_update BEFORE UPDATE ON app_settings
FOR EACH ROW EXECUTE FUNCTION fn_block_anon_update();

-- Read (admin for vote)
DROP POLICY IF EXISTS "Allow Admin Read Votes" ON votes;
CREATE POLICY "Allow Admin Read Votes" ON votes FOR SELECT TO authenticated USING (auth.jwt()->>'email' = '{{ADMIN_EMAIL}}');

-- Lost images storage
DROP POLICY IF EXISTS "Allow authenticated users to upload lost items" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload lost items"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lost-items');

DROP POLICY IF EXISTS "Allow authenticated users to select lost items" ON storage.objects;
CREATE POLICY "Allow authenticated users to select lost items"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'lost-items');

DROP POLICY IF EXISTS "Allow authenticated users to update lost items" ON storage.objects;
CREATE POLICY "Allow authenticated users to update lost items"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'lost-items');

DROP POLICY IF EXISTS "Allow authenticated users to delete lost items" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete lost items"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'lost-items');