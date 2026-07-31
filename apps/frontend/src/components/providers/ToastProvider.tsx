"use client";

import { X } from "lucide-react";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import type React from "react";

export type ToastType = "success" | "error" | "info";

type Toast = {
	id: number;
	message: string;
	type: ToastType;
};

type ToastContextValue = {
	showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue>({
	showToast: () => {},
});

const toastClassNames: Record<ToastType, string> = {
	success: "border-emerald-300 bg-emerald-50 text-emerald-900",
	error: "border-red-300 bg-red-50 text-red-900",
	info: "border-blue-300 bg-blue-50 text-blue-900",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const dismissToast = useCallback((id: number) => {
		setToasts((current) => current.filter((toast) => toast.id !== id));
	}, []);

	const showToast = useCallback(
		(message: string, type: ToastType = "info") => {
			const id = Date.now() + Math.random();
			setToasts((current) => [...current, { id, message, type }]);
			window.setTimeout(() => dismissToast(id), 4000);
		},
		[dismissToast],
	);

	const value = useMemo(() => ({ showToast }), [showToast]);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<div
				aria-live="polite"
				aria-relevant="additions removals"
				className="fixed right-4 top-4 z-[80] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3"
			>
				{toasts.map((toast) => (
					<output
						key={toast.id}
						className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${toastClassNames[toast.type]}`}
					>
						<span className="min-w-0 flex-1">{toast.message}</span>
						<button
							type="button"
							aria-label="通知を閉じる"
							onClick={() => dismissToast(toast.id)}
							className="rounded p-0.5 opacity-70 transition hover:opacity-100"
						>
							<X className="h-4 w-4" />
						</button>
					</output>
				))}
			</div>
		</ToastContext.Provider>
	);
}

export function useToast() {
	return useContext(ToastContext);
}
