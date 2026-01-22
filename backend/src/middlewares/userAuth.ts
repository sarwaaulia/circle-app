import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import prisma from "../prisma/client";

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const token = req.headers?.authorization?.split(" ")[1]
    if(!token){
        res.status(401).json({message: `unauthorized`})
        return;
    }

     try {
        const decoded = verifyToken(token);
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                username: true,
                full_name: true,
                photo_profile: true,
            }
        })
        
        if(!user) {
            res.status(401).json({message: `user not found`})
        }
        
        (req as any).user = {
            ...user, 
            fullname: user?.full_name || user?.username || "User"
        }

        next()
    } catch (error) {
        res.status(401).json({message: `invalid token`})
        return;
    }
}
