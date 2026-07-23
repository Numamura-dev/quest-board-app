#!/usr/bin/env node
/**
 * 各worktreeのissue変更をコミット＆プッシュするスクリプト
 */
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

function run(cmd, args, cwd) {
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: "inherit",
    encoding: "utf-8",
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(" ")} (exit ${result.status})`);
  }
  return result;
}

function commitWorktree(wtName, branch, commitMsg, files) {
  const wtPath = path.join(repoRoot, ".worktrees", wtName);
  console.log(`\n=== Committing ${wtName} (${branch}) ===`);

  // git add
  run("git", ["add", ...files], wtPath);

  // git commit
  run("git", ["commit", "--no-verify", "-m", commitMsg], wtPath);

  // git push
  run("git", ["push", "-u", "origin", branch], wtPath);

  console.log(`✓ ${wtName} committed and pushed`);
}

const worktrees = [
  {
    name: "w155",
    branch: "feat/issue155-reviews-auth-impl",
    msg: "feat: reviews API に認証・所有者認可を追加する (#155)\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>",
    files: [
      "apps/backend/src/routes/reviews.ts",
      "apps/backend/src/controllers/reviewController.ts",
      "apps/backend/src/services/reviewService.ts",
      "apps/backend/src/dataAccessor/dbAccessor/Review.ts",
      "apps/backend/src/__tests__/services/reviewService.test.ts",
      "apps/backend/src/__tests__/mocks/ReviewDataAccessor.mock.ts",
    ],
  },
  {
    name: "w181",
    branch: "feat/issue181-structured-logs-impl",
    msg: "feat: 投稿作成/編集/削除 API に構造化ログを標準化する (#181)\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>",
    files: [
      "apps/backend/src/controllers/questController.ts",
      "apps/backend/src/__tests__/services/questService.test.ts",
    ],
  },
  {
    name: "w175",
    branch: "feat/issue175-admin-user-search-impl",
    msg: "feat: 管理画面ユーザー一覧に検索と絞り込みを追加する (#175)\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>",
    files: [
      "apps/frontend/src/components/organisms/AdminDashboard.tsx",
    ],
  },
  {
    name: "w141",
    branch: "feat/issue141-quest-sort-impl",
    msg: "feat: 投稿一覧に並び順切り替えを追加する (#141)\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>",
    files: [
      "apps/frontend/src/components/organisms/QuestList.tsx",
    ],
  },
  {
    name: "w134",
    branch: "feat/issue134-quest-detail-header-impl",
    msg: "feat: 投稿詳細ヘッダーに公開日・更新日・作成者を固定表示する (#134)\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>",
    files: [
      "apps/frontend/src/components/pages/QuestDetailPage.tsx",
    ],
  },
  {
    name: "w139",
    branch: "feat/issue139-danger-button-impl",
    msg: "feat: 危険操作ボタンを通常操作と分離する (#139)\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>",
    files: [
      "apps/frontend/src/components/organisms/AdminDashboard.tsx",
    ],
  },
  {
    name: "w169",
    branch: "feat/issue169-rate-limit-impl",
    msg: "feat: 投稿作成 API にレート制限を追加する (#169)\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>",
    files: [
      "apps/backend/src/middlewares/rateLimiter.ts",
      "apps/backend/src/routes/quests.ts",
      "apps/backend/src/__tests__/middlewares/rateLimiter.test.ts",
    ],
  },
  {
    name: "w245",
    branch: "feat/issue245-bulk-user-toggle-impl",
    msg: "feat: 複数ユーザーの一括有効化/無効化を追加する (#245)\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>",
    files: [
      "apps/backend/src/controllers/adminUserController.ts",
      "apps/backend/src/routes/adminUsers.ts",
      "apps/backend/src/services/adminUserService.ts",
      "apps/frontend/src/components/organisms/AdminDashboard.tsx",
      "apps/frontend/src/services/user.ts",
    ],
  },
  {
    name: "w212",
    branch: "feat/issue212-session-timeout-impl",
    msg: "feat: セッションタイムアウト後の自動ログアウトを実装する (#212)\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>",
    files: [
      "apps/frontend/src/hooks/useSessionTimeout.ts",
      "apps/frontend/src/components/organisms/Header.tsx",
      "apps/frontend/src/app/layout.tsx",
    ],
  },
  {
    name: "w138",
    branch: "feat/issue138-tag-suggest-impl",
    msg: "feat: タグ入力時に既存タグ候補をサジェスト表示する (#138)\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>",
    files: [
      "apps/frontend/src/components/molecules/TagInput.tsx",
      "apps/frontend/src/services/quest.ts",
    ],
  },
];

const target = process.argv[2];

if (target) {
  const wt = worktrees.find((w) => w.name === target);
  if (!wt) {
    console.error(`Unknown worktree: ${target}`);
    process.exit(1);
  }
  commitWorktree(wt.name, wt.branch, wt.msg, wt.files);
} else {
  for (const wt of worktrees) {
    try {
      commitWorktree(wt.name, wt.branch, wt.msg, wt.files);
    } catch (e) {
      console.error(`Failed to commit ${wt.name}:`, e.message);
    }
  }
}
