-- firebase_uid カラムを google_sub にリネームする。
-- 既存の認証紐付けデータはそのまま引き継がれる。
-- MySQL 8.0 以降の RENAME COLUMN / RENAME INDEX を使用。

ALTER TABLE `users` RENAME COLUMN `firebase_uid` TO `google_sub`;

ALTER TABLE `users` RENAME INDEX `users_firebase_uid_key` TO `users_google_sub_key`;
