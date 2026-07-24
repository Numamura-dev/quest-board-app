"use client";

import React from "react";
import { History, X } from "lucide-react";

interface SearchHistoryDropdownProps {
  history: string[];
  onSelect: (keyword: string) => void;
  onClear: () => void;
  visible: boolean;
}

/**
 * 検索履歴ドロップダウンコンポーネント
 *
 * 検索窓フォーカス時に表示し、過去の検索ワードをクリックで再検索できる。
 */
const SearchHistoryDropdown: React.FC<SearchHistoryDropdownProps> = ({
  history,
  onSelect,
  onClear,
  visible,
}) => {
  if (!visible || history.length === 0) return null;

  return (
    <div
      className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50"
      role="listbox"
      aria-label="検索履歴"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700">
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <History className="w-3 h-3" />
          検索履歴
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
          aria-label="検索履歴を全件削除"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      {history.map((keyword) => (
        <button
          key={keyword}
          type="button"
          role="option"
          aria-selected={false}
          onClick={() => onSelect(keyword)}
          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2"
        >
          <History className="w-3 h-3 text-gray-500 flex-shrink-0" />
          <span className="truncate">{keyword}</span>
        </button>
      ))}
    </div>
  );
};

export default SearchHistoryDropdown;
