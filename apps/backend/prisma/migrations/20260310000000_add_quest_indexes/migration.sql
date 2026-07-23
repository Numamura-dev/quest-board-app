-- AddIndex: quests テーブルのクエリ最適化インデックス追加
-- Issue #226: 投稿一覧 - DBインデックスの最適化

-- ステータス + 論理削除フラグの複合インデックス
-- 用途: 公開中クエスト一覧取得 (status = 'active' AND deleted_at IS NULL)
CREATE INDEX `quests_status_deleted_at_idx` ON `quests`(`status`, `deleted_at`);

-- 論理削除フラグ + 開始日時の複合インデックス
-- 用途: 未削除クエストの開始日時降順ソート (deleted_at IS NULL ORDER BY start_date DESC)
CREATE INDEX `quests_deleted_at_start_date_idx` ON `quests`(`deleted_at`, `start_date`);

-- 終了日インデックス
-- 用途: 期間絞り込み (end_date >= NOW())
CREATE INDEX `quests_end_date_idx` ON `quests`(`end_date`);
