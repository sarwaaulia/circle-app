import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET as string

export interface userPayload {
    id: number,
}

// sign token
export function signToken(payload: userPayload) {
    return jwt.sign(payload, JWT_SECRET, {expiresIn: `1h`})
}

// verify token
export function verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET) as userPayload;
}