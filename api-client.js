// API Configuration for Vectore Corporate Platform (Web, Admin & Client Hub)
const API_CONFIG = {
    baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? (window.location.port === '3000' ? '/api' : 'http://localhost:3000/api')
        : '/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json'
    }
};

class VectoreAPI {
    constructor() {
        this.baseURL = API_CONFIG.baseURL;
        this.token = localStorage.getItem('authToken') || localStorage.getItem('vectore_token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
        localStorage.setItem('vectore_token', token);
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('vectore_token');
        localStorage.removeItem('vectore_user');
    }

    getHeaders(customHeaders = {}) {
        const headers = { ...customHeaders };
        const activeToken = this.token || localStorage.getItem('authToken') || localStorage.getItem('vectore_token');
        if (activeToken) {
            headers['Authorization'] = `Bearer ${activeToken}`;
        }
        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = this.getHeaders(options.headers || {});

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

    // ===================================
    // AUTHENTICATION (Admin + Client Hub + Vectore Flow SSO)
    // ===================================
    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        if (data.token) {
            this.setToken(data.token);
            if (data.user) localStorage.setItem('vectore_user', JSON.stringify(data.user));
        }
        return data;
    }

    async loginWithGoogle(credential) {
        const data = await this.request('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ credential })
        });
        if (data.token) {
            this.setToken(data.token);
            if (data.user) localStorage.setItem('vectore_user', JSON.stringify(data.user));
        }
        return data;
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    logout() {
        this.removeToken();
    }

    // ===================================
    // SITE CONFIG (Hero, Sectors, Corporate Info)
    // ===================================
    async getSiteConfig() {
        return this.request('/site-config');
    }

    async updateSiteConfig(configData) {
        return this.request('/site-config', {
            method: 'PUT',
            body: JSON.stringify(configData)
        });
    }

    async resetHeroBackground() {
        return this.request('/site-config/reset-hero-bg', {
            method: 'POST'
        });
    }

    // ===================================
    // B2B QUOTATIONS & LEADS CRM
    // ===================================
    async createQuotation(quotationData, useKeepalive = false) {
        return this.request('/quotations', {
            method: 'POST',
            body: JSON.stringify(quotationData),
            ...(useKeepalive ? { keepalive: true } : {})
        });
    }

    async getLeads() {
        return this.request('/contact/admin/leads');
    }

    async updateLead(id, leadData) {
        return this.request(`/contact/admin/leads/${id}`, {
            method: 'PUT',
            body: JSON.stringify(leadData)
        });
    }

    // ===================================
    // CORPORATE CLIENT PORTAL & PRIVATE TICKETS
    // ===================================
    async getMyClientProjects() {
        return this.request('/client-portal/my-projects');
    }

    async reviewDeliverable(projectId, deliverableId, status, feedback = '') {
        return this.request(`/client-portal/projects/${projectId}/deliverables/${deliverableId}/review`, {
            method: 'POST',
            body: JSON.stringify({ status, feedback })
        });
    }

    async getPaymentTicket(token) {
        return this.request(`/client-portal/ticket/${token}`);
    }

    async payTicketWithCulqi(token, payload) {
        return this.request(`/client-portal/ticket/${token}/pay`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    async getAdminClientProjects() {
        return this.request('/client-portal/admin/projects');
    }

    async createAdminClientProject(projectData) {
        return this.request('/client-portal/admin/projects', {
            method: 'POST',
            body: JSON.stringify(projectData)
        });
    }

    async updateAdminClientProject(id, projectData) {
        return this.request(`/client-portal/admin/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(projectData)
        });
    }

    async deleteAdminClientProject(id) {
        return this.request(`/client-portal/admin/projects/${id}`, {
            method: 'DELETE'
        });
    }

    // ===================================
    // IN-HOUSE WORKSHOP & SOLUTIONS
    // ===================================
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

    // ===================================
    // PORTFOLIO (White-Label NDA Support)
    // ===================================
    async getProjects(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/projects${queryString ? '?' + queryString : ''}`);
    }

    async getAdminProjects() {
        return this.request('/projects/admin/all');
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

    // ===================================
    // TESTIMONIALS
    // ===================================
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

    // ===================================
    // FILE UPLOAD (Cloudinary)
    // ===================================
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        return this.request('/upload/image', {
            method: 'POST',
            body: formData,
            headers: {}
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
            headers: {}
        });
    }

    // ===================================
    // VECTORE FLOW (SOFTWARE) ASSETS
    // ===================================
    async getSoftwareAssets() {
        return this.request('/software');
    }

    async createSoftwareAsset(assetData) {
        return this.request('/software', {
            method: 'POST',
            body: JSON.stringify(assetData)
        });
    }

    async deleteSoftwareAsset(id) {
        return this.request(`/software/${id}`, {
            method: 'DELETE'
        });
    }
}

const api = new VectoreAPI();
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VectoreAPI, api };
}
