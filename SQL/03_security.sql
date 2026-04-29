-- Enable RLS
ALTER TABLE stalls_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Read (all users)
CREATE POLICY "Allow Public Read" ON stalls_status FOR SELECT USING (true);
CREATE POLICY "Allow Public Read" ON news FOR SELECT USING (true);
CREATE POLICY "Allow Public Read" ON lost_items FOR SELECT USING (true);
CREATE POLICY "Allow Public Read" ON questions FOR SELECT USING (true);
CREATE POLICY "Allow Public Read" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Allow Public Read" ON vote_targets FOR SELECT USING (true);

-- Insert (user for QA)
CREATE POLICY "Allow Public Insert" ON questions FOR INSERT WITH CHECK (true);

-- Write (admin/stall-admin)
CREATE POLICY "Allow Admin Update Stalls" ON stalls_status FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Write (admin for news/lost items)
CREATE POLICY "Allow Admin Full News" ON news FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow Admin Full LostItems" ON lost_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Write / Delete (admin for Q&A)
CREATE POLICY "Allow Admin Manage Questions" ON questions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow Admin Delete Questions" ON questions FOR DELETE TO authenticated USING (true);

-- Write (admin for server config / vote)
CREATE POLICY "Allow Admin Manage Settings" ON app_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow Admin Manage VoteTargets" ON vote_targets FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Read (admin for vote)
CREATE POLICY "Allow Admin Read Votes" ON votes FOR SELECT TO authenticated USING (true);