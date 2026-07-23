import type { FirebaseOptions } from "firebase/app";

const fallbackFirebaseConfig: FirebaseOptions = {
  apiKey: "local-dev-api-key",
  authDomain: "local-dev.firebaseapp.com",
  projectId: "local-dev-project",
  storageBucket: "local-dev.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:localdev",
};

type FirebaseEnv = Record<string, string | undefined>;

export const getMissingFirebaseEnvVars = (
  env: FirebaseEnv = process.env
): string[] => {
  const requiredEnvVars = {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  return Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);
};

export const resolveFirebaseConfig = (
  env: FirebaseEnv = process.env
): { config: FirebaseOptions; missingEnvVars: string[]; isFallback: boolean } => {
  const missingEnvVars = getMissingFirebaseEnvVars(env);

  if (missingEnvVars.length > 0) {
    return {
      config: fallbackFirebaseConfig,
      missingEnvVars,
      isFallback: true,
    };
  }

  return {
    config: {
      apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
    },
    missingEnvVars: [],
    isFallback: false,
  };
};
