// schema
import 'dotenv/config';
import bcrypt from "bcrypt";
import prisma from "../prisma/client";
import { signToken, userPayload } from "../utils/jwt";

interface AuthResponse {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  photo_profile: string | null;
  token: string;
}

export async function registerUser(
	username: string,
	full_name: string,
	email: string,
	password: string,
	photo_profile?: string,
	createdBy: string = 'system'
) : Promise<AuthResponse> {
	if (!email.match("@") || password.length < 6)
		throw new Error("email or password are invalid");

	const hashed = await bcrypt.hash(password, 10);

	const userExist = await prisma.user.findUnique({ where: { email } });
	if (userExist) throw new Error("user already registered");

	const user = await prisma.user.create({
		data: {
			username,
			full_name,
			email,
			password: hashed,
			photo_profile: photo_profile || null,
		},
	});

	// token jwt
	const payload: userPayload = { id: user.id };
	const token = signToken(payload);

	return {
		user_id: user.id,
		username: user.username,
		full_name: user.full_name,
		email: user.email,
		photo_profile: user.photo_profile ? `${process.env.DATABASE_URL}/uploads/${user.photo_profile}` : null,
		token,
	};
}

export async function loginUser(
	email: string,
	password: string,
): Promise<AuthResponse> {
	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) throw new Error("user not found");

	if (!user?.password) throw new Error("password did not match");

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) throw new Error("password incorrect");

	const payload: userPayload = { id: user.id };
	const token = signToken(payload);

	return {
		user_id: user.id,
		username: user.username,
		full_name: user.full_name,
		email: user.email,
		photo_profile: user.photo_profile ? `${user.photo_profile}` : null,
		token,
	};
}
