import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { WebVitalsReporter } from "@/components/atoms/WebVitalsReporter";

// useReportWebVitals のモック
const mockUseReportWebVitals = vi.fn();
vi.mock("next/web-vitals", () => ({
  useReportWebVitals: (cb: unknown) => mockUseReportWebVitals(cb),
}));

describe("WebVitalsReporter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("コンポーネントが null を返す", () => {
    const { container } = render(<WebVitalsReporter />);
    expect(container).toBeEmptyDOMElement();
  });

  it("useReportWebVitals にコールバック関数を渡す", () => {
    render(<WebVitalsReporter />);
    expect(mockUseReportWebVitals).toHaveBeenCalledWith(expect.any(Function));
  });

  it("useReportWebVitals が一度だけ呼ばれる", () => {
    render(<WebVitalsReporter />);
    expect(mockUseReportWebVitals).toHaveBeenCalledTimes(1);
  });

  describe("メトリクスのレポート (開発環境)", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "development");
    });

    it("コールバックが LCP メトリクスを受け取れる構造になっている", () => {
      render(<WebVitalsReporter />);
      const [reportCallback] = mockUseReportWebVitals.mock.calls[0];

      const consoleSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => undefined);
      reportCallback({ name: "LCP", value: 1000, id: "test-id", startTime: 0, label: "web-vital", attribution: {} });
      consoleSpy.mockRestore();

      expect(reportCallback).toBeInstanceOf(Function);
    });
  });
});
