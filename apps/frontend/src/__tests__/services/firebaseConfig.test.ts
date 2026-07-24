import { describe, expect, it } from "vitest";
import {
  getMissingFirebaseEnvVars,
  resolveFirebaseConfig,
} from "@/services/firebaseConfig";

describe("getMissingFirebaseEnvVars", () => {
  it("不足している Firebase env 名を返す", () => {
    expect(
      getMissingFirebaseEnvVars({
        NEXT_PUBLIC_FIREBASE_API_KEY: "api-key",
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: undefined,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "project-id",
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: undefined,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "sender-id",
        NEXT_PUBLIC_FIREBASE_APP_ID: undefined,
      })
    ).toEqual(["authDomain", "storageBucket", "appId"]);
  });
});

describe("resolveFirebaseConfig", () => {
  it("env が揃っていればその値を返す", () => {
    expect(
      resolveFirebaseConfig({
        NEXT_PUBLIC_FIREBASE_API_KEY: "api-key",
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "example.firebaseapp.com",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "project-id",
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "example.appspot.com",
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "sender-id",
        NEXT_PUBLIC_FIREBASE_APP_ID: "app-id",
      })
    ).toEqual({
      config: {
        apiKey: "api-key",
        authDomain: "example.firebaseapp.com",
        projectId: "project-id",
        storageBucket: "example.appspot.com",
        messagingSenderId: "sender-id",
        appId: "app-id",
      },
      missingEnvVars: [],
      isFallback: false,
    });
  });

  it("env が不足していればダミー設定へフォールバックする", () => {
    expect(
      resolveFirebaseConfig({
        NEXT_PUBLIC_FIREBASE_API_KEY: undefined,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: undefined,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: undefined,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: undefined,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: undefined,
        NEXT_PUBLIC_FIREBASE_APP_ID: undefined,
      })
    ).toEqual({
      config: {
        apiKey: "local-dev-api-key",
        authDomain: "local-dev.firebaseapp.com",
        projectId: "local-dev-project",
        storageBucket: "local-dev.appspot.com",
        messagingSenderId: "000000000000",
        appId: "1:000000000000:web:localdev",
      },
      missingEnvVars: [
        "apiKey",
        "authDomain",
        "projectId",
        "storageBucket",
        "messagingSenderId",
        "appId",
      ],
      isFallback: true,
    });
  });
});
