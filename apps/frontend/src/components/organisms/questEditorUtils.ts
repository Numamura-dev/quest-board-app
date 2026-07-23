import { QuestStatus, QuestType } from "@quest-board/types";

export type QuestFormData = {
  title: string;
  description: string;
  type: QuestType;
  status: QuestStatus;
  maxParticipants: number;
  tags: string;
  start_date: string;
  end_date: string;
  incentive_amount: number;
  point_amount: number;
  note: string;
};

export type QuestFormErrors = Partial<
  Record<"title" | "description" | "start_date" | "end_date" | "maxParticipants", string>
>;

export const DEFAULT_QUEST_FORM_DATA: QuestFormData = {
  title: "",
  description: "",
  type: QuestType.Development,
  status: QuestStatus.Draft,
  maxParticipants: 5,
  tags: "",
  start_date: "",
  end_date: "",
  incentive_amount: 0,
  point_amount: 0,
  note: "",
};

export const sanitizePastedText = (input: string) =>
  input
    .replace(/\r\n/g, "\n")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[•●▪]/g, "-")
    .trim();

const wrapLinePrefix = (
  source: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string
) => {
  const selectedText = source.slice(selectionStart, selectionEnd) || "項目";
  const prefixed = selectedText
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");

  return {
    nextValue: `${source.slice(0, selectionStart)}${prefixed}${source.slice(selectionEnd)}`,
    selectionStart,
    selectionEnd: selectionStart + prefixed.length,
  };
};

export const applyMarkdownFormat = (
  source: string,
  selectionStart: number,
  selectionEnd: number,
  format: "heading" | "bullet" | "number" | "link" | "quote"
) => {
  const selectedText = source.slice(selectionStart, selectionEnd);

  switch (format) {
    case "heading": {
      const inserted = `## ${selectedText || "見出し"}`;
      return {
        nextValue: `${source.slice(0, selectionStart)}${inserted}${source.slice(selectionEnd)}`,
        selectionStart,
        selectionEnd: selectionStart + inserted.length,
      };
    }
    case "bullet":
      return wrapLinePrefix(source, selectionStart, selectionEnd, "- ");
    case "number": {
      const numberedText = (selectedText || "項目")
        .split("\n")
        .map((line, index) => `${index + 1}. ${line}`)
        .join("\n");
      return {
        nextValue: `${source.slice(0, selectionStart)}${numberedText}${source.slice(selectionEnd)}`,
        selectionStart,
        selectionEnd: selectionStart + numberedText.length,
      };
    }
    case "link": {
      const label = selectedText || "リンクテキスト";
      const inserted = `[${label}](https://)`;
      return {
        nextValue: `${source.slice(0, selectionStart)}${inserted}${source.slice(selectionEnd)}`,
        selectionStart,
        selectionEnd: selectionStart + inserted.length,
      };
    }
    case "quote":
      return wrapLinePrefix(source, selectionStart, selectionEnd, "> ");
  }
};

export const validateQuestForm = (formData: QuestFormData): QuestFormErrors => {
  const errors: QuestFormErrors = {};

  if (!formData.title.trim()) {
    errors.title = "タイトルは必須です";
  }

  if (!formData.description.trim()) {
    errors.description = "説明は必須です";
  }

  if (!formData.start_date) {
    errors.start_date = "開始日は必須です";
  }

  if (!formData.end_date) {
    errors.end_date = "終了日は必須です";
  }

  if (
    formData.start_date &&
    formData.end_date &&
    formData.end_date < formData.start_date
  ) {
    errors.end_date = "終了日は開始日以降を指定してください";
  }

  if (!Number.isFinite(formData.maxParticipants) || formData.maxParticipants < 1) {
    errors.maxParticipants = "最大参加者数は 1 以上にしてください";
  }

  return errors;
};
