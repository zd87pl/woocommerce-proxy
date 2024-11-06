import axios from 'axios';
import { Route, ApiResponse } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const RouteService = {
    getRoutes: async (): Promise<Route[]> => {
        try {
            const response = await api.get<ApiResponse<Route[]>>('/routes');
            // Ensure we always return an array, even if data is undefined
            return Array.isArray(response?.data?.data) ? response.data.data : [];
        } catch (error) {
            console.error('Error fetching routes:', error);
            return [];
        }
    },

    createRoute: async (route: Omit<Route, '_id'>): Promise<Route> => {
        try {
            const response = await api.post<ApiResponse<Route>>('/routes', route);
            return response.data.data;
        } catch (error) {
            console.error('Error creating route:', error);
            throw error;
        }
    },

    updateRoute: async (id: string, route: Partial<Route>): Promise<Route> => {
        try {
            const response = await api.put<ApiResponse<Route>>(`/routes/${id}`, route);
            return response.data.data;
        } catch (error) {
            console.error('Error updating route:', error);
            throw error;
        }
    },

    deleteRoute: async (id: string): Promise<void> => {
        try {
            await api.delete(`/routes/${id}`);
        } catch (error) {
            console.error('Error deleting route:', error);
            throw error;
        }
    },
};

export default api;
