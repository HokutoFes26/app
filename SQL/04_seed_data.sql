-- Booth status
INSERT INTO stalls_status (stall_name) VALUES
('チュロス'), ('たこ焼き'), ('焼き鳥'), ('あんばやし'), ('大判焼き'),
('わたあめ'), ('焼きそば'), ('揚げパン・フルーツ飴・ラムネ'), ('ペットボトル飲料'), ('カステラ'),
('クロッフル'), ('唐揚げ'), ('フランクフルト'), ('どらやき・お茶'), ('お茶会'),
('たい焼き'), ('和茶輪茶'), ('肉巻きおにぎり'), ('冥土カフェ'), ('めいどびより'), ('ポップコーン')
ON CONFLICT (stall_name) DO NOTHING;

-- Vote (booth)
INSERT INTO vote_targets (name, category, display_order) VALUES
('チュロス', 'stall', 1),
('たこ焼き', 'stall', 2),
('焼き鳥', 'stall', 3),
('あんばやし', 'stall', 4),
('大判焼き', 'stall', 5),
('わたあめ', 'stall', 6),
('焼きそば', 'stall', 7),
('揚げパン・フルーツ飴・ラムネ', 'stall', 8),
('ペットボトル飲料', 'stall', 9),
('カステラ', 'stall', 10),
('クロッフル', 'stall', 11),
('唐揚げ', 'stall', 12),
('フランクフルト', 'stall', 13),
('どらやき・お茶', 'stall', 14),
('お茶会', 'stall', 15),
('たい焼き', 'stall', 16),
('和茶輪茶', 'stall', 17),
('肉巻きおにぎり', 'stall', 18),
('冥土カフェ', 'stall', 19),
('めいどびより', 'stall', 20),
('ポップコーン', 'stall', 21)
ON CONFLICT (name) DO NOTHING;

-- Vote (exhibition)
INSERT INTO vote_targets (name, category, display_order) VALUES
('VS嵐', 'exhibition', 1),
('恋みくじ・フォトスポット', 'exhibition', 2),
('キッキングスナイパー', 'exhibition', 3),
('縁日(I3)', 'exhibition', 4),
('縁日(K3)', 'exhibition', 5),
('お化け屋屋敷', 'exhibition', 6),
('ゲーム・イラスト展示', 'exhibition', 7),
('ロボット操作体験', 'exhibition', 8),
('新聞展示', 'exhibition', 9),
('部誌・読書スペース', 'exhibition', 10),
('書道作品展示', 'exhibition', 11),
('写真展示', 'exhibition', 12),
('ジオラマ展示', 'exhibition', 13),
('全国高専のロボット展示', 'exhibition', 14),
('電子情報工学科展示', 'exhibition', 15),
('国際ビジネス学科紹介', 'exhibition', 16),
('機関実習室ツアー', 'exhibition', 17),
('操船シミュレータ体験など', 'exhibition', 18),
('若潮丸IV・V世の紹介など', 'exhibition', 19),
('写真展', 'exhibition', 20),
('本郷3学科紹介展示', 'exhibition', 21),
('専攻科活動紹介', 'exhibition', 22)
ON CONFLICT (name) DO NOTHING;

-- Server config
INSERT INTO app_settings (key, value_int) VALUES
('maintenance_mode', 0),
('voting_enabled', 1)
ON CONFLICT (key) DO NOTHING;
