-- Booth status
INSERT INTO stalls_status (stall_name) VALUES
('チュロス'), ('たこ焼き'), ('焼き鳥'), ('あんばやし'), ('大判焼き'),
('わたあめ'), ('焼きそば'), ('揚げパン・フルーツ飴・ラムネ'), ('ペットボトル飲料'), ('カステラ'),
('クロッフル'), ('唐揚げ'), ('フランクフルト'), ('どらやき・お茶'), ('お茶会～2日目のみ～'),
('たい焼き'), ('コーヒー・クレープ'), ('肉巻きおにぎり'), ('冥土カフェ'), ('めいどびより'), ('ポップコーン')
ON CONFLICT (stall_name) DO NOTHING;

-- Vote (booth)
INSERT INTO vote_targets (id, name, category, display_order) VALUES
('01', 'チュロス', 's', 1),
('02', 'たこ焼き', 's', 2),
('03', '焼き鳥', 's', 3),
('04', 'あんばやし', 's', 4),
('05', '大判焼き', 's', 5),
('06', 'わたあめ', 's', 6),
('07', '焼きそば', 's', 7),
('08', '揚げパン・フルーツ飴・ラムネ', 's', 8),
('09', 'ペットボトル飲料', 's', 9),
('10', 'カステラ', 's', 10),
('11', 'クロッフル', 's', 11),
('12', '唐揚げ', 's', 12),
('13', 'フランクフルト', 's', 13),
('14', 'どらやき・お茶', 's', 14),
('15', 'お茶会～2日目のみ～', 's', 15),
('16', 'たい焼き', 's', 16),
('17', 'コーヒー・クレープ', 's', 17),
('18', '肉巻きおにぎり', 's', 18),
('19', '冥土カフェ', 's', 19),
('20', 'めいどびより', 's', 20),
('21', 'ポップコーン', 's', 21)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category, display_order = EXCLUDED.display_order;

-- Vote (exhibition)
INSERT INTO vote_targets (id, name, category, display_order) VALUES
('31', 'VS嵐', 'e', 1),
('32', '恋みくじ・フォトスポット', 'e', 2),
('33', 'キッキングスナイパー', 'e', 3),
('34', '縁日(I3)', 'e', 4),
('35', '縁日(K3)', 'e', 5),
('36', 'お化け屋屋敷', 'e', 6),
('37', 'ゲーム・イラスト展示', 'e', 7),
('38', 'ロボット操作体験', 'e', 8),
('39', '新聞展示', 'e', 9),
('40', '部誌・読書スペース', 'e', 10),
('41', '書道作品展示', 'e', 11),
('42', '写真展示', 'e', 12),
('43', 'ジオラマ展示', 'e', 13),
('44', '全国高専のロボット展示', 'e', 14),
('45', '電子情報工学科展示', 'e', 15),
('46', '国際ビジネス学科紹介', 'e', 16),
('47', '機関実習室ツアー', 'e', 17),
('48', '操船シミュレータ体験など', 'e', 18),
('49', '若潮丸IV・V世の紹介など', 'e', 19),
('50', '写真展', 'e', 20),
('51', '本郷3学科紹介展示', 'e', 21),
('52', '専攻科活動紹介', 'e', 22)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category, display_order = EXCLUDED.display_order;

-- Server config
INSERT INTO app_settings (key, value_int, value_text) VALUES
('maintenance_mode', 0, NULL),
('voting_enabled', 1, NULL),
('vote_start_at', 0, '2026-05-23 10:00:00+09'),
('vote_end_at', 2147483647, '2026-05-24 14:00:00+09')
ON CONFLICT (key) DO UPDATE SET
    value_int = EXCLUDED.value_int,
    value_text = EXCLUDED.value_text;
