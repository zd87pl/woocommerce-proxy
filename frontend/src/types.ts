export interface Route {
    _id?: string;
    path: string;
    targetUrl: string;
    isEnabled: boolean;
    description?: string;
}

export interface ApiResponse<T> {
    data: T;
    error?: string;
}
