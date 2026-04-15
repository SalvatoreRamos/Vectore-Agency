// API Configuration for Frontend
const API_CONFIG = {
    baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? (window.location.port === '3000' ? '/api' : 'http://localhost:3000/api')
        : '/api',
    timeout: 15000,
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
        const headers = { ...customHeaders };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        const headers = this.getHeaders(options.headers || {});

        // Add JSON content type if body is object and not FormData
        if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                let messages = [];
                if (data.message) messages.push(data.message);
                if (data.error) messages.push(data.error);
                if (data.errors && Array.isArray(data.errors)) {
                    messages.push(data.errors.map(e => e.msg || e.message || 'Validation error').join(', '));
                }
                const errorMsg = messages.join(' - ');
                throw new Error(errorMsg || 'Request failed');
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

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    // El login con Google y registro de usuarios han sido removidos para simplificar el flujo.


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

    // Projects (Portfolio)
    async getProjects() {
        return this.request('/projects');
    }

    async createProject(projectData) {
        return this.request('/projects', {
            method: 'POST',
            body: JSON.stringify(projectData)
        });
    }

    async updateProject(id, projectData) {
        return this.request(`/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(projectData)
        });
    }

    async deleteProject(id) {
        return this.request(`/projects/${id}`, {
            method: 'DELETE'
        });
    }

    async getFeaturedProducts() {
        return this.request('/products/featured/list');
    }

    async getProductsByCategory(category) {
        return this.request(`/products/category/${category}`);
    }

    // Testimonials
    async getTestimonials() {
        return this.request('/testimonials');
    }

    async getAllTestimonials() {
        return this.request('/testimonials/all');
    }

    async createTestimonial(testimonialData) {
        return this.request('/testimonials', {
            method: 'POST',
            body: JSON.stringify(testimonialData)
        });
    }

    async updateTestimonial(id, testimonialData) {
        return this.request(`/testimonials/${id}`, {
            method: 'PUT',
            body: JSON.stringify(testimonialData)
        });
    }

    async deleteTestimonial(id) {
        return this.request(`/testimonials/${id}`, {
            method: 'DELETE'
        });
    }

    // La creación de órdenes y procesamiento de pagos han sido removidos.

    // La gestión detallada de cotizaciones ha sido removida.

    // Contact
    async sendContactMessage(contactData) {
        return this.request('/contact', {
            method: 'POST',
            body: JSON.stringify(contactData)
        });
    }

    // Leads / Brief Inbox
    async getLeads() {
        return this.request('/contact/admin/leads', {
            headers: this.getHeaders()
        });
    }

    async updateLead(id, leadData) {
        return this.request(`/contact/admin/leads/${id}`, {
            method: 'PUT',
            body: JSON.stringify(leadData),
            headers: this.getHeaders()
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

    // ===================================
    // EVENTS ENDPOINTS
    // ===================================
    async getEvents() {
        return this.request('/events', { // Admin route to get all events
            headers: this.getHeaders()
        });
    }

    async createEvent(eventData) {
        return this.request('/events', {
            method: 'POST',
            body: JSON.stringify(eventData),
            headers: this.getHeaders()
        });
    }

    async updateEvent(id, eventData) {
        return this.request(`/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(eventData),
            headers: this.getHeaders()
        });
    }

    async deleteEvent(id) {
        return this.request(`/events/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
    }

    async drawWinner(id) {
        return this.request(`/events/${id}/draw`, {
            method: 'POST',
            headers: this.getHeaders()
        });
    }

    // ===================================
    // VECTORE FLOW (SOFTWARE) ENDPOINTS
    // ===================================
    async getSoftwareAssets() {
        return this.request('/software');
    }

    async createSoftwareAsset(assetData) {
        return this.request('/software', {
            method: 'POST',
            body: JSON.stringify(assetData),
            headers: this.getHeaders()
        });
    }

    async deleteSoftwareAsset(id) {
        return this.request(`/software/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
    }

}

// Create a global instance
const api = new VectoreAPI();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VectoreAPI, api };
}
