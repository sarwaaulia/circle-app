import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/user_auth";
import { registerSchema, loginSchema, updateUserSchema } from "../validation/auth_joi";
import prisma from "../prisma/client";

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

export async function handleUpdateUser(req: Request, res: Response) {
  try {
    const { error } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const authUser = (req as any).user;
    const { full_name, username, bio } = req.body;
    const files = (req as any).files;
    const photo_profile = files && files['photo_profile'] ? files['photo_profile'][0].filename : undefined;
    const header = files && files['header'] ? files['header'][0].filename : undefined;

    // check username uniqueness
    if (username && username !== authUser.username) {
      const existing = await prisma.user.findFirst({ where: { username } });
      if (existing) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    const updateData: any = {};
    if (full_name !== undefined) updateData.full_name = full_name.trim();
    if (username !== undefined) updateData.username = username.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (photo_profile !== undefined) updateData.photo_profile = photo_profile;
    if (header !== undefined) updateData.header = header; 

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: updateData
    });

    // return data pengguna yang telah di bersihkan
    const userResponse = {
      id: updatedUser.id,
      username: updatedUser.username,
      full_name: updatedUser.full_name,
      email: updatedUser.email,
      photo_profile: updatedUser.photo_profile,
      bio: updatedUser.bio,
      header: updatedUser.header
    };

    res.json({ message: "Profile updated successfully", user: userResponse });
  } catch (err: any) {
    console.error('Update user error:', err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
}