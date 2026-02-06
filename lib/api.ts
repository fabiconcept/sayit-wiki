import { getEncryptedUserId } from './userId';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

export class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = '/api/v1') {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const userId = getEncryptedUserId();
        
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(userId && { 'X-User-Id': userId }),
            ...options.headers,
        };

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers,
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Failed to connect to server',
                },
            };
        }
    }

    async getNotes(params?: { page?: number; limit?: number; sort?: string }) {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set('page', params.page.toString());
        if (params?.limit) queryParams.set('limit', params.limit.toString());
        if (params?.sort) queryParams.set('sort', params.sort);

        const query = queryParams.toString();
        return this.request(`/notes${query ? `?${query}` : ''}`);
    }

    async getNote(noteId: string) {
        return this.request(`/notes/${noteId}`);
    }

    async createNote(note: {
        content: string;
        backgroundColor: string;
        noteStyle: string;
        clipType: string;
        tilt: number;
        selectedFont: string;
    }) {
        return this.request('/notes', {
            method: 'POST',
            body: JSON.stringify(note),
        });
    }

    async deleteNote(noteId: string) {
        return this.request(`/notes/${noteId}`, {
            method: 'DELETE',
        });
    }

    async getComments(noteId: string, params?: { page?: number; limit?: number }) {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set('page', params.page.toString());
        if (params?.limit) queryParams.set('limit', params.limit.toString());

        const query = queryParams.toString();
        return this.request(`/notes/${noteId}/comments${query ? `?${query}` : ''}`);
    }

    async createComment(noteId: string, comment: {
        content: string;
        backgroundColor: string;
        noteStyle: string;
        selectedFont: string;
        tilt: number;
    }) {
        return this.request(`/notes/${noteId}/comments`, {
            method: 'POST',
            body: JSON.stringify(comment),
        });
    }

    async toggleLike(targetId: string, targetType: 'note' | 'comment') {
        return this.request('/likes', {
            method: 'POST',
            body: JSON.stringify({ targetId, targetType }),
        });
    }

    async trackView(noteId: string) {
        return this.request('/views', {
            method: 'POST',
            body: JSON.stringify({ noteId }),
        });
    }

    async reportContent(targetId: string, targetType: 'note' | 'comment', reason?: string) {
        return this.request('/reports', {
            method: 'POST',
            body: JSON.stringify({ targetId, targetType, reason }),
        });
    }

    async getReports(params?: { status?: string; type?: string; page?: number; limit?: number }) {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.set('status', params.status);
        if (params?.type) queryParams.set('type', params.type);
        if (params?.page) queryParams.set('page', params.page.toString());
        if (params?.limit) queryParams.set('limit', params.limit.toString());

        const query = queryParams.toString();
        return this.request(`/admin/reports${query ? `?${query}` : ''}`);
    }

    async ignoreReport(reportId: string) {
        return this.request(`/admin/reports/${reportId}/ignore`, {
            method: 'POST',
        });
    }

    async takedownReport(reportId: string) {
        return this.request(`/admin/reports/${reportId}/takedown`, {
            method: 'POST',
        });
    }
}

export const apiClient = new ApiClient();
