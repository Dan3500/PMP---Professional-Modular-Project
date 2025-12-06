export interface User {
    id: number,
    name: string,
    email: string,
    roles: string[],
    created_at: string,
    updated_at: string,
    is_active: boolean,
}
