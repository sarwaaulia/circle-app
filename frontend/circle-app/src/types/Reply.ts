export interface Reply {
    id: number,
    content: string,
    image?: string,
    created_at: string,
    likesCount?: number,
    isLiked?: boolean,
    user: {
        id: number,
        username: string
        full_name: string,
        photo_profile: string
    }
}