import { AxiosInstance } from 'axios';

export class Authenticated {
    protected client: AxiosInstance;
    private interceptorIds: number[] = []; // Track all interceptor IDs

    constructor(client: AxiosInstance) {
        this.client = client;
    }

    public setToken(token: string | null) {
        // Remove all existing interceptors
        this.interceptorIds.forEach(id => {
            this.client.interceptors.request.eject(id);
        });
        this.interceptorIds = [];

        // Only add new interceptor if token exists
        if (token) {
            const id = this.client.interceptors.request.use((config) => {
                config.headers.Authorization = `Bearer ${token}`;
                return config;
            });
            this.interceptorIds.push(id);
        }
    }
} 