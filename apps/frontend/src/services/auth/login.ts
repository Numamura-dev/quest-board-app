import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export const logIn = async (email: string, password: string) => {
	const userCredential = await signInWithEmailAndPassword(
		auth,
		email,
		password,
	);
	return userCredential.user;
};
