import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/user_auth";
import { registerSchema, loginSchema } from "../validation/auth_joi";

export const handleRegister = async (req: Request, res: Response): Promise<void> => {
	try {
		const { error } = registerSchema.validate(req.body);
		if (error) {
			res.status(400).json({ message: error.message });
			return;
		}

		const { username, full_name, email, password} = req.body;
		const photo_profile = req.file ? req.file.filename : undefined;

		const results = await registerUser(username, full_name, email, password, photo_profile)
		res.status(201).json({
			code: 201,
			status: `success`,
			message: `registration successfully! account finally created`,
			data: results,
		});
	} catch (error) {
		res.status(500).json({
			code: 500,
			status: `error`,
			message: `invalid register`,
		});
	}
};

export const handleLogin = async (req: Request, res: Response) => {
    try {
        const {error} = loginSchema.validate(req.body)
        if(error) {
            res.status(400).json({message: error.message})
            return;
        }

        const {email, password} = req.body
        const result = await loginUser(email, password)

        res.status(201).json({
			code: 201,
			status: `success`,
			message: `login success`,
			data: result,
		});
    } catch (error) {
		res.status(500).json({
			code: 500,
			status: `error`,
			message: `invalid login`,
		});
    }
}

export async function handleLogout(req: Request, res: Response) {

    res.json({ message : "Logout success"});
}