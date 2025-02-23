import { describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import { Authenticated } from './authenticated';
import type { AxiosInstance } from 'axios';

describe('Authenticated', () => {
    let client: AxiosInstance;
    let authenticated: Authenticated;

    beforeEach(() => {
        client = axios.create();
        authenticated = new Authenticated(client);
    });

    it('should add Authorization header when setting token', async () => {
        // Arrange
        const token = 'test-token';
        
        // Act
        authenticated.setToken(token);
        
        // Assert
        // @ts-expect-error Accessing internal axios property for testing
        const request = await client.interceptors.request.handlers[0].fulfilled({
            headers: {}
        });
        expect(request.headers.Authorization).toBe(`Bearer ${token}`);
    });

    it('should remove Authorization header when clearing token', async () => {
        // Arrange
        authenticated.setToken('initial-token');
        
        // Act
        authenticated.setToken(null);

        // Arrange
        authenticated.setToken('initial-token');

        // Act
        authenticated.setToken(null);

        // Arrange
        authenticated.setToken('initial-token');

        // Act
        authenticated.setToken(null);
        
        // Assert
        const interceptors = client.interceptors.request as any;
        expect(interceptors.handlers.filter(Boolean)).toHaveLength(0);
    });

    it('should replace existing token when setting new token', async () => {
        // Arrange
        authenticated.setToken('old-token');
        
        // Act
        authenticated.setToken('new-token');
        
        // Assert
        // @ts-expect-error Accessing internal axios property for testing
        const handlers = client.interceptors.request.handlers;
        const activeHandler = handlers.find(Boolean);
        const request = await activeHandler.fulfilled({
            headers: {}
        });
        expect(request.headers.Authorization).toBe('Bearer new-token');
        expect(handlers.filter(Boolean)).toHaveLength(1);
    });
}); 