"use client";

import {
	QUEST_STATUS_LABELS,
	QUEST_STATUS_VALUES,
	QUEST_TYPE_LABELS,
	QUEST_TYPE_VALUES,
	type QuestStatus,
	type QuestType,
} from "@quest-board/types";
import {
	Heading1,
	Link2,
	List,
	ListOrdered,
	Quote,
	Save,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
	DEFAULT_QUEST_FORM_DATA,
	type QuestFormData,
	type QuestFormErrors,
	applyMarkdownFormat,
	sanitizePastedText,
	validateQuestForm,
} from "./questEditorUtils";

type QuestEditorFormProps = {
	title: string;
	submitLabel: string;
	submittingLabel: string;
	draftStorageKey: string;
	initialData?: QuestFormData;
	onSubmit: (formData: QuestFormData) => Promise<void>;
	onClose: () => void;
};

const fieldBaseClassName =
	"w-full rounded-lg border-2 border-amber-300 bg-amber-50 px-3 py-2 text-slate-800 focus:border-yellow-400 focus:outline-none";

export const QuestEditorForm: React.FC<QuestEditorFormProps> = ({
	title,
	submitLabel,
	submittingLabel,
	draftStorageKey,
	initialData = DEFAULT_QUEST_FORM_DATA,
	onSubmit,
	onClose,
}) => {
	const [formData, setFormData] = useState<QuestFormData>(initialData);
	const [errors, setErrors] = useState<QuestFormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDraftRestored, setIsDraftRestored] = useState(false);
	const [initialSerialized, setInitialSerialized] = useState(
		JSON.stringify(initialData),
	);
	const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
	const isDraftReadyRef = useRef(false);
	// 最新の initialData を ref で保持し、draftStorageKey 変化時のみ再初期化する
	// (initialData の参照変化で誤って再初期化されることを防ぐ)
	const initialDataRef = useRef(initialData);
	initialDataRef.current = initialData;
	const dialogTitleId = `${draftStorageKey}-dialog-title`;

	// biome-ignore lint/correctness/useExhaustiveDependencies: draftStorageKey は quest 切り替えのトリガーとして意図的に使用
	useEffect(() => {
		const initial = initialDataRef.current;
		setFormData(initial);
		setErrors({});
		setInitialSerialized(JSON.stringify(initial));
		setIsDraftRestored(false);
		isDraftReadyRef.current = false;
	}, [draftStorageKey]);

	useEffect(() => {
		isDraftReadyRef.current = true;
		const savedDraft = window.localStorage.getItem(draftStorageKey);
		if (!savedDraft) return;

		try {
			const parsed = JSON.parse(savedDraft) as Partial<QuestFormData>;
			const initial = initialDataRef.current;
			const mergedData = { ...initial, ...parsed };
			if (JSON.stringify(mergedData) !== JSON.stringify(initial)) {
				setFormData(mergedData);
				setIsDraftRestored(true);
			}
		} catch (error) {
			console.error("下書き復元に失敗しました", error);
		}
	}, [draftStorageKey]);

	useEffect(() => {
		if (!isDraftReadyRef.current) return;
		window.localStorage.setItem(draftStorageKey, JSON.stringify(formData));
	}, [draftStorageKey, formData]);

	const isDirty = JSON.stringify(formData) !== initialSerialized;

	useEffect(() => {
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (!isDirty || isSubmitting) return;
			event.preventDefault();
			event.returnValue = "";
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [isDirty, isSubmitting]);

	const requestClose = () => {
		if (
			isDirty &&
			!window.confirm("未保存の変更があります。破棄して閉じますか？")
		) {
			return;
		}
		onClose();
	};

	const updateField = <K extends keyof QuestFormData>(
		field: K,
		value: QuestFormData[K],
	) => {
		setFormData((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	};

	const handleMarkdownInsert = (
		format: "heading" | "bullet" | "number" | "link" | "quote",
	) => {
		const textarea = descriptionRef.current;
		if (!textarea) return;

		const result = applyMarkdownFormat(
			formData.description,
			textarea.selectionStart,
			textarea.selectionEnd,
			format,
		);

		updateField("description", result.nextValue);

		window.requestAnimationFrame(() => {
			textarea.focus();
			textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
		});
	};

	const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
		event.preventDefault();
		const textarea = event.currentTarget;
		const sanitizedText = sanitizePastedText(
			event.clipboardData.getData("text/plain") ||
				event.clipboardData.getData("text"),
		);

		const nextValue = `${formData.description.slice(0, textarea.selectionStart)}${sanitizedText}${formData.description.slice(textarea.selectionEnd)}`;
		updateField("description", nextValue);

		window.requestAnimationFrame(() => {
			const nextCaret = textarea.selectionStart + sanitizedText.length;
			textarea.focus();
			textarea.setSelectionRange(nextCaret, nextCaret);
		});
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const validationErrors = validateQuestForm(formData);
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}

		setIsSubmitting(true);
		try {
			await onSubmit(formData);
			window.localStorage.removeItem(draftStorageKey);
			setInitialSerialized(JSON.stringify(formData));
			setIsDraftRestored(false);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: 背景クリックで閉じる操作はキーボードユーザーには Escape キーで代替
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			onClick={requestClose}
		>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation のみのハンドラー */}
			{/* biome-ignore lint/a11y/useSemanticElements: <dialog> への移行は別 issue で対応予定 */}
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby={dialogTitleId}
				className="mx-4 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border-4 border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100 p-6 pb-28 md:pb-6"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="mb-4 flex items-start justify-between">
					<div>
						<h2
							id={dialogTitleId}
							className="text-2xl font-bold text-slate-800 font-serif"
						>
							{title}
						</h2>
						<p className="mt-1 text-sm text-slate-600">
							入力内容は自動で下書き保存されます。
						</p>
					</div>
					<button
						type="button"
						onClick={requestClose}
						className="text-amber-600 transition hover:text-amber-800"
						aria-label="フォームを閉じる"
					>
						<X className="h-6 w-6" />
					</button>
				</div>

				{isDraftRestored && (
					<div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
						保存されていた下書きを復元しました。
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<label className="block">
							<span className="mb-1 block text-sm font-medium text-slate-800">
								タイトル *
							</span>
							<input
								type="text"
								value={formData.title}
								onChange={(event) => updateField("title", event.target.value)}
								className={fieldBaseClassName}
								placeholder="クエストのタイトル"
							/>
							{errors.title && (
								<p className="mt-1 text-sm text-red-600">{errors.title}</p>
							)}
						</label>

						<label className="block">
							<span className="mb-1 block text-sm font-medium text-slate-800">
								タイプ *
							</span>
							<select
								value={formData.type}
								onChange={(event) =>
									updateField("type", event.target.value as QuestType)
								}
								className={fieldBaseClassName}
							>
								{QUEST_TYPE_VALUES.map((type) => (
									<option key={type} value={type}>
										{QUEST_TYPE_LABELS[type]}
									</option>
								))}
							</select>
						</label>

						<label className="block">
							<span className="mb-1 block text-sm font-medium text-slate-800">
								ステータス
							</span>
							<select
								value={formData.status}
								onChange={(event) =>
									updateField("status", event.target.value as QuestStatus)
								}
								className={fieldBaseClassName}
							>
								{QUEST_STATUS_VALUES.map((status) => (
									<option key={status} value={status}>
										{QUEST_STATUS_LABELS[status]}
									</option>
								))}
							</select>
						</label>

						<label className="block">
							<span className="mb-1 block text-sm font-medium text-slate-800">
								最大参加者数 *
							</span>
							<input
								type="number"
								min="1"
								value={formData.maxParticipants}
								onChange={(event) =>
									updateField(
										"maxParticipants",
										Number.parseInt(event.target.value, 10) || 0,
									)
								}
								className={fieldBaseClassName}
							/>
							{errors.maxParticipants && (
								<p className="mt-1 text-sm text-red-600">
									{errors.maxParticipants}
								</p>
							)}
						</label>

						<label className="block">
							<span className="mb-1 block text-sm font-medium text-slate-800">
								開始日 *
							</span>
							<input
								type="date"
								value={formData.start_date}
								onChange={(event) =>
									updateField("start_date", event.target.value)
								}
								className={fieldBaseClassName}
							/>
							{errors.start_date && (
								<p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
							)}
						</label>

						<label className="block">
							<span className="mb-1 block text-sm font-medium text-slate-800">
								終了日 *
							</span>
							<input
								type="date"
								value={formData.end_date}
								min={formData.start_date || undefined}
								onChange={(event) =>
									updateField("end_date", event.target.value)
								}
								className={fieldBaseClassName}
							/>
							{errors.end_date && (
								<p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
							)}
						</label>

						<label className="block">
							<span className="mb-1 block text-sm font-medium text-slate-800">
								インセンティブ金額（円）
							</span>
							<input
								type="number"
								min="0"
								value={formData.incentive_amount || ""}
								onChange={(event) =>
									updateField(
										"incentive_amount",
										Number.parseInt(event.target.value, 10) || 0,
									)
								}
								className={fieldBaseClassName}
								placeholder="例: 50000"
							/>
						</label>

						<label className="block">
							<span className="mb-1 block text-sm font-medium text-slate-800">
								ポイント
							</span>
							<input
								type="number"
								min="0"
								value={formData.point_amount || ""}
								onChange={(event) =>
									updateField(
										"point_amount",
										Number.parseInt(event.target.value, 10) || 0,
									)
								}
								className={fieldBaseClassName}
								placeholder="例: 500"
							/>
						</label>
					</div>

					<div className="space-y-2">
						<div className="flex flex-wrap items-center gap-2">
							{[
								{ id: "heading", label: "見出し", icon: Heading1 },
								{ id: "bullet", label: "箇条書き", icon: List },
								{ id: "number", label: "番号付き", icon: ListOrdered },
								{ id: "link", label: "リンク", icon: Link2 },
								{ id: "quote", label: "引用", icon: Quote },
							].map((item) => {
								const Icon = item.icon;
								return (
									<button
										key={item.id}
										type="button"
										onClick={() =>
											handleMarkdownInsert(
												item.id as
													| "heading"
													| "bullet"
													| "number"
													| "link"
													| "quote",
											)
										}
										className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-yellow-400 hover:text-slate-900"
									>
										<Icon className="h-4 w-4" />
										<span>{item.label}</span>
									</button>
								);
							})}
						</div>

						<label className="block">
							<span className="mb-1 block text-sm font-medium text-slate-800">
								説明 *
							</span>
							<textarea
								ref={descriptionRef}
								rows={8}
								value={formData.description}
								onPaste={handlePaste}
								onChange={(event) =>
									updateField("description", event.target.value)
								}
								className={`${fieldBaseClassName} min-h-[220px]`}
								placeholder="クエストの詳細説明"
							/>
							{errors.description && (
								<p className="mt-1 text-sm text-red-600">
									{errors.description}
								</p>
							)}
						</label>
					</div>

					<label className="block">
						<span className="mb-1 block text-sm font-medium text-slate-800">
							タグ（カンマ区切り）
						</span>
						<input
							type="text"
							value={formData.tags}
							onChange={(event) => updateField("tags", event.target.value)}
							className={fieldBaseClassName}
							placeholder="例: React, TypeScript, フロントエンド"
						/>
					</label>

					<label className="block">
						<span className="mb-1 block text-sm font-medium text-slate-800">
							報酬備考
						</span>
						<input
							type="text"
							value={formData.note}
							onChange={(event) => updateField("note", event.target.value)}
							className={fieldBaseClassName}
							placeholder="報酬に関する備考"
						/>
					</label>

					<div className="hidden justify-end gap-2 md:flex">
						<button
							type="button"
							onClick={requestClose}
							className="rounded-lg bg-gray-500 px-4 py-2 text-white transition hover:bg-gray-600"
						>
							キャンセル
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
						>
							{isSubmitting ? submittingLabel : submitLabel}
						</button>
					</div>

					<div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur md:hidden">
						<div className="mx-auto flex max-w-3xl items-center gap-3">
							<button
								type="button"
								onClick={requestClose}
								className="flex-1 rounded-lg border border-slate-300 px-4 py-3 font-medium text-slate-700"
							>
								キャンセル
							</button>
							<button
								type="submit"
								disabled={isSubmitting}
								className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-50"
							>
								<Save className="h-4 w-4" />
								<span>{isSubmitting ? submittingLabel : submitLabel}</span>
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};
