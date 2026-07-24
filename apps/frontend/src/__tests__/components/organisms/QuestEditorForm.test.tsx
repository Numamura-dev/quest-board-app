import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QuestEditorForm } from "@/components/organisms/QuestEditorForm";
import {
  DEFAULT_QUEST_FORM_DATA,
  applyMarkdownFormat,
  validateQuestForm,
} from "@/components/organisms/questEditorUtils";

describe("QuestEditorForm", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("必須項目が空のときにバリデーションエラーを表示する", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <QuestEditorForm
        title="新しいクエストを作成"
        submitLabel="クエストを作成"
        submittingLabel="作成中..."
        draftStorageKey="quest-editor:test-required"
        onSubmit={onSubmit}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getAllByRole("button", { name: "クエストを作成" })[0]);

    expect(await screen.findByText("タイトルは必須です")).toBeInTheDocument();
    expect(screen.getByText("説明は必須です")).toBeInTheDocument();
    expect(screen.getByText("開始日は必須です")).toBeInTheDocument();
    expect(screen.getByText("終了日は必須です")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("Markdown ツールバーで見出し記法を挿入できる", () => {
    render(
      <QuestEditorForm
        title="新しいクエストを作成"
        submitLabel="クエストを作成"
        submittingLabel="作成中..."
        draftStorageKey="quest-editor:test-markdown"
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        onClose={vi.fn()}
      />
    );

    const textarea = screen.getByLabelText("説明 *") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "本文" } });
    textarea.setSelectionRange(0, 2);

    fireEvent.click(screen.getByRole("button", { name: /見出し/ }));

    expect(textarea.value).toContain("## 本文");
  });

  it("リンク挿入時に編集前提のプレースホルダーを使う", () => {
    const result = applyMarkdownFormat("詳細はこちら", 0, 0, "link");

    expect(result.nextValue).toContain("[リンクテキスト](https://)");
  });

  it("貼り付け時に不要な書式を除去する", () => {
    render(
      <QuestEditorForm
        title="新しいクエストを作成"
        submitLabel="クエストを作成"
        submittingLabel="作成中..."
        draftStorageKey="quest-editor:test-paste"
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        onClose={vi.fn()}
      />
    );

    const textarea = screen.getByLabelText("説明 *") as HTMLTextAreaElement;
    fireEvent.paste(textarea, {
      clipboardData: {
        getData: () => "• テスト\u200B\n\n\n次の行",
      },
    });

    expect(textarea.value).toBe("- テスト\n\n次の行");
  });

  it("保存済みの下書きを復元し、送信中はボタンを無効化する", async () => {
    window.localStorage.setItem(
      "quest-editor:test-draft",
      JSON.stringify({
        ...DEFAULT_QUEST_FORM_DATA,
        title: "保存済みタイトル",
        description: "保存済み本文",
        start_date: "2026-03-01",
        end_date: "2026-03-10",
      })
    );

    let resolveSubmit: (() => void) | undefined;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        })
    );

    render(
      <QuestEditorForm
        title="新しいクエストを作成"
        submitLabel="クエストを作成"
        submittingLabel="作成中..."
        draftStorageKey="quest-editor:test-draft"
        onSubmit={onSubmit}
        onClose={vi.fn()}
      />
    );

    expect(await screen.findByDisplayValue("保存済みタイトル")).toBeInTheDocument();
    expect(screen.getByText("保存されていた下書きを復元しました。")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "クエストを作成" })[0]);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(
        screen.getAllByRole("button", { name: "作成中..." })[0]
      ).toBeDisabled();
    });

    await act(async () => {
      resolveSubmit?.();
    });
  });

  it("保存済み下書きがなくても入力内容を自動保存する", async () => {
    render(
      <QuestEditorForm
        title="新しいクエストを作成"
        submitLabel="クエストを作成"
        submittingLabel="作成中..."
        draftStorageKey="quest-editor:test-autosave"
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        onClose={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText("タイトル *"), {
      target: { value: "新規タイトル" },
    });

    await waitFor(() => {
      expect(
        JSON.parse(
          window.localStorage.getItem("quest-editor:test-autosave") ?? "{}"
        ).title
      ).toBe("新規タイトル");
    });
  });

  it("終了日が開始日より前ならバリデーションエラーを返す", () => {
    const errors = validateQuestForm({
      ...DEFAULT_QUEST_FORM_DATA,
      title: "クエスト",
      description: "説明",
      start_date: "2026-03-10",
      end_date: "2026-03-01",
    });

    expect(errors.end_date).toBe("終了日は開始日以降を指定してください");
  });
});
