"use client";

import { useReportWebVitals } from "next/web-vitals";
import type { NextWebVitalsMetric } from "next/app";

/**
 * Web Vitals (LCP, FID/INP, CLS, FCP, TTFB) の計測と記録を行うクライアントコンポーネント
 *
 * Next.js の useReportWebVitals フックを利用してコアメトリクスを取得し、
 * 開発環境ではコンソールへ出力、本番環境では外部サービスへの送信に対応できる構造にする。
 */

type Rating = "good" | "needs-improvement" | "poor";

const THRESHOLDS: Record<string, { good: number; poor: number }> = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

function getRating(name: string, value: number): Rating {
  const threshold = THRESHOLDS[name];
  if (!threshold) return "good";
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

function reportMetric(metric: NextWebVitalsMetric): void {
  const { name, value, id } = metric;
  const rating = getRating(name, value);

  if (process.env.NODE_ENV === "development") {
    const emoji =
      rating === "good" ? "OK" : rating === "needs-improvement" ? "WARN" : "NG";
    console.log(
      `[Web Vitals] [${emoji}] ${name}: ${value.toFixed(2)} (${rating}) [id: ${id}]`
    );
  }

  // 本番環境での送信先の例 (Google Analytics 4):
  // if (process.env.NODE_ENV === 'production' && typeof window.gtag === 'function') {
  //   window.gtag('event', name, {
  //     event_category: 'Web Vitals',
  //     event_label: id,
  //     value: Math.round(name === 'CLS' ? value * 1000 : value),
  //     non_interaction: true,
  //   });
  // }
}

export function WebVitalsReporter(): null {
  useReportWebVitals(reportMetric);
  return null;
}
