import type { AnchorHTMLAttributes } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Header } from "@/components/organisms/Header";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => "/quests",
}));

vi.mock("firebase/auth", () => ({
  signOut: vi.fn(),
}));

vi.mock("@/services/firebase", () => ({
  auth: {},
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
  }),
}));

vi.mock("@/services/user", () => ({
  userService: {
    getCurrentUser: vi.fn(),
  },
}));

describe("Header", () => {
  it("モバイルメニュー内で Tab キー移動を循環させる", () => {
    render(<Header />);

    fireEvent.click(screen.getByRole("button", { name: "メニューを開閉する" }));

    const mobileNavigation = screen.getByRole("navigation", {
      name: "モバイルナビゲーション",
    });
    const questLink = within(mobileNavigation).getByRole("link", {
      name: "クエスト一覧",
    });
    const logoutButton = within(mobileNavigation).getByRole("button", {
      name: "ログアウト",
    });

    logoutButton.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(questLink);

    questLink.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(logoutButton);
  });

  it("Escape キーでモバイルメニューを閉じてトグルボタンへフォーカスを戻す", () => {
    render(<Header />);

    const toggleButton = screen.getByRole("button", { name: "メニューを開閉する" });
    fireEvent.click(toggleButton);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("navigation", { name: "モバイルナビゲーション" })).toBeNull();
    expect(document.activeElement).toBe(toggleButton);
  });
});
