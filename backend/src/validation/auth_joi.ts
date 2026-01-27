import Joi from "joi";

export const registerSchema = Joi.object({
    username: Joi.string().min(3).max(30).alphanum().required(),
    email: Joi.string().email().required(),
    full_name: Joi.string().min(5).required(),
    password: Joi.string().min(6).alphanum().required()
})

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
})

export const updateUserSchema = Joi.object({
    full_name: Joi.string().optional(),
    username: Joi.string().min(1).max(50).optional(),
    bio: Joi.string().max(500).optional()
});

export const createThreadSchema = Joi.object({
    content: Joi.string().required()
})

export const updateThreadSchema =  Joi.object({
    content: Joi.string().required(),
    image:  Joi.string().optional()
})

export const createThreadReplySchema = Joi.object({
    content: Joi.string().required(),
    image: Joi.string().optional()
})

export const updateThreadReplySchema = Joi.object({
    content: Joi.string().optional(),
    image: Joi.string().optional()
})