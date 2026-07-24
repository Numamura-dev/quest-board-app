-- クエスト一覧取得クエリのパフォーマンス最適化のため複合インデックスを追加する
-- 対象クエリ:
--   1. WHERE deleted_at IS NULL ORDER BY start_date DESC
--   2. WHERE deleted_at IS NULL AND status = ? ORDER BY start_date DESC
--   3. WHERE status = ? ORDER BY start_date DESC (管理者用・削除済み含む)

-- CreateIndex: 論理削除フィルター + 開始日ソート（ステータス絞りなし）
CREATE INDEX `quests_deleted_at_start_date_idx` ON `quests`(`deleted_at`, `start_date`);

-- CreateIndex: 論理削除フィルター + ステータス絞り込み + 開始日ソート
CREATE INDEX `quests_deleted_at_status_start_date_idx` ON `quests`(`deleted_at`, `status`, `start_date`);

-- CreateIndex: ステータス絞り込み + 開始日ソート（管理者用・削除済み含む）
CREATE INDEX `quests_status_start_date_idx` ON `quests`(`status`, `start_date`);
