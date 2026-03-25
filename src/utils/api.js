// API utility for making authenticated requests to the backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://edupath-6djz.onrender.com';


class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Get auth token from localStorage
    getToken() {
        return localStorage.getItem('authToken');
    }

    // Set auth token in localStorage
    setToken(token) {
        localStorage.setItem('authToken', token);
    }

    // Remove auth token from localStorage
    removeToken() {
        localStorage.removeItem('authToken');
    }

    // Make HTTP request
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const token = this.getToken();

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // Add auth token if available
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    // GET request
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Auth endpoints
    auth = {
        register: (data) => this.post('/api/auth/register', data),
        login: (data) => this.post('/api/auth/login', data),
        logout: () => this.post('/api/auth/logout'),
        getProfile: () => this.get('/api/auth/me'),
    };

    // Student endpoints
    students = {
        getAll: () => this.get('/api/students'),
        getById: (id) => this.get(`/api/students/${id}`),
        update: (id, data) => this.put(`/api/students/${id}`, data),
        delete: (id) => this.delete(`/api/students/${id}`),
        updateLanguage: (id, language) => this.put(`/api/students/${id}/language`, { language }),
        addResource: (studentId, data) => this.post(`/api/students/${studentId}/resources`, data),
        removeResource: (studentId, resourceId) => this.delete(`/api/students/${studentId}/resources/${resourceId}`),
    };

    // Quiz endpoints
    quizzes = {
        getAll: (params) => {
            const query = new URLSearchParams(params).toString();
            return this.get(`/api/quizzes${query ? `?${query}` : ''}`);
        },
        getById: (id) => this.get(`/api/quizzes/${id}`),
        create: (data) => this.post('/api/quizzes', data),
        update: (id, data) => this.put(`/api/quizzes/${id}`, data),
        delete: (id) => this.delete(`/api/quizzes/${id}`),
        submitAttempt: (id, answers) => this.post(`/api/quizzes/${id}/attempt`, { answers }),
        getAttempts: (studentId) => this.get(`/api/quizzes/attempts/${studentId}`),
    };

    // Chat endpoints
    chat = {
        sendMessage: (message, language) => this.post('/api/chat', { message, language }),
        getHistory: (userId) => this.get(`/api/chat/history/${userId}`),
        clearHistory: (userId) => this.delete(`/api/chat/history/${userId}`),
    };

    // AI endpoints
    ai = {
        generateLearningPlan: (quizId, days) => this.post('/api/ai/generate-learning-plan', { quizId, days }),
        getLatestLearningPlan: () => this.get('/api/ai/learning-plan/latest'),
        getAllLearningPlans: () => this.get('/api/ai/learning-plans'),
        getLearningPlanById: (planId) => this.get(`/api/ai/learning-plan/${planId}`),
        deleteLearningPlan: (planId) => this.delete(`/api/ai/learning-plan/${planId}`),
        markResourceComplete: (planId, dayNumber, resourceIndex, completed) =>
            this.put(`/api/ai/learning-plan/${planId}/resource`, { dayNumber, resourceIndex, completed }),
        submitConfidence: (planId, confidenceLevel) =>
            this.put(`/api/ai/learning-plan/${planId}/confidence`, { confidenceLevel }),
    };

    // Admin endpoints
    admin = {
        getAllLearningPlans: () => this.get('/api/ai/admin/all-plans'),
    };
}

// Export singleton instance
const api = new ApiClient();
export default api;
