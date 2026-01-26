export interface Thread {
    id: number,
    content: string,
    image?: string,
    number_of_replies: number,
    createdAt: string,
    likesCount?: number,
    isLiked?: boolean,
    full_name?: string,
    username?: string,
    photo_profile?: string,
    userId?: number
}