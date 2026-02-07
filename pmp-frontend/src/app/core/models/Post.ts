export interface Post {
    id: number;
    name: string;
    message: string;
    read: boolean;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    creator: {
        id: number;
        name: string;
        email: string;
    };
}
