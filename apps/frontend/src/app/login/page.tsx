"use client";

import { logIn } from "@/services/auth/login";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/services/firebase";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await logIn(email, password);
      alert("ログイン成功");
      router.push("/");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      alert(`エラー: ${message}`);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      alert(
        "パスワード再設定リンクを送るにはメールアドレスを入力してください。"
      );
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("パスワード再設定用のメールを送信しました。");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      alert(`エラー: ${message}`);
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  return (
    <main
      id="main-content"
      className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-800 to-gray-900"
    >
      <div className="bg-[#fef3c7] border-2 border-[#fbbf24] rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#1e3a8a]">
          ログイン
        </h1>

        {/* メールアドレス */}
        <input
          className="w-full bg-white border border-gray-400 p-3 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-[#fbbf24] text-black"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* パスワード（表示切り替え付き） */}
        <div className="relative mb-6">
          <input
            className="w-full bg-white border border-gray-400 p-3 rounded focus:outline-none focus:ring-2 focus:ring-[#fbbf24] text-black pr-10"
            type={showPassword ? "text" : "password"}
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-800"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* ログインボタン */}
        <button
          className="w-full bg-[#1e3a8a] text-white py-3 rounded hover:bg-blue-800 transition duration-300 mb-3"
          onClick={handleLogin}
        >
          ログイン
        </button>

        {/* パスワード再設定 */}
        <button
          className="w-full bg-yellow-500 text-white py-3 rounded hover:bg-yellow-600 transition duration-300 mb-3"
          onClick={handlePasswordReset}
        >
          パスワードを忘れた方はこちら
        </button>

        {/* 戻るボタン */}
        <button
          className="w-full bg-gray-500 text-white py-3 rounded hover:bg-gray-600 transition duration-300"
          onClick={handleBack}
        >
          戻る
        </button>
      </div>
    </main>
  );
}
