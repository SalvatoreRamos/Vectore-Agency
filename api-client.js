// API Configuration for Frontend
const API_CONFIG = {
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
};

// API Helper Functions
class VectoreAPI {
    constructor() {
        this.baseURL = API_CONFIG.baseURL;
        this.token = localStorage.getItem('authToken');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    // Remove authentication token
    removeToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    // Get headers with auth token
    getHeaders(customHeaders = {}) {
        const headers = { ...API_CONFIG.headers, ...customHeaders };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: this.getHeaders(options.headers)
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication
    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        if (data.token) {
            this.setToken(data.token);
        }
        return data;
    }

    async register(name, email, password) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
        if (data.token) {
            this.setToken(data.token);
        }
        return data;
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    logout() {
        this.removeToken();
    }

    // Products
    async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/products${queryString ? '?' + queryString : ''}`);
    }

    async getProduct(id) {
        return this.request(`/products/${id}`);
    }

    async createProduct(productData) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    async updateProduct(id, productData) {
        return this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    async deleteProduct(id) {
        return this.request(`/products/${id}`, {
            method: 'DELETE'
        });
    }

    async getFeaturedProducts() {
        return this.request('/products/featured/list');
    }

    async getProductsByCategory(category) {
        return this.request(`/products/category/${category}`);
    }

    // Orders
    async createOrder(orderData) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async getOrders(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/orders${queryString ? '?' + queryString : ''}`);
    }

    async getOrder(id) {
        return this.request(`/orders/${id}`);
    }

    async createStripePayment(orderId) {
        return this.request(`/orders/${orderId}/payment/stripe`, {
            method: 'POST'
        });
    }

    async confirmPayment(orderId, transactionId, paymentInfo) {
        return this.request(`/orders/${orderId}/payment/confirm`, {
            method: 'POST',
            body: JSON.stringify({ transactionId, paymentInfo })
        });
    }

    async updateOrderStatus(orderId, status, note) {
        return this.request(`/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, note })
        });
    }

    // Quotations
    async createQuotation(quotationData) {
        return this.request('/quotations', {
            method: 'POST',
            body: JSON.stringify(quotationData)
        });
    }

    async getQuotations(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/quotations${queryString ? '?' + queryString : ''}`);
    }

    async getQuotation(id) {
        return this.request(`/quotations/${id}`);
    }

    async updateQuotation(id, quotationData) {
        return this.request(`/quotations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(quotationData)
        });
    }

    async updateQuotationStatus(id, status) {
        return this.request(`/quotations/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    async acceptQuotation(id) {
        return this.request(`/quotations/${id}/accept`, {
            method: 'POST'
        });
    }

    async deleteQuotation(id) {
        return this.request(`/quotations/${id}`, {
            method: 'DELETE'
        });
    }

    // File Upload
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        return this.request('/upload/image', {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set Content-Type for FormData
        });
    }

    async uploadImages(files) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }

        return this.request('/upload/images', {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set Content-Type for FormData
        });
    }
}

// Create a global instance
const api = new VectoreAPI();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VectoreAPI, api };
}
