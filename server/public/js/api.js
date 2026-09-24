// =========================================================
// API CLIENT (MOCKED FOR FRONTEND TESTING)
// =========================================================

const API_BASE = 'http://localhost:3000/api';

export const apiClient = {
    // 1. GET LIST
    async getAllBeans() {
        const res = await fetch(`${API_BASE}/beans`);
        const response =  await res.json();

        if(response.type === 'success'){
            return response.data
        } else {
           return [];
        }
    },

    // 2. GET DETAILS
    async getBeanById(id) {
        const res = await fetch(`${API_BASE}/beans/${id}`);
        const response =  await res.json();

        if(response.type === 'success'){
            return response.data
        } else {
           return {};
        }
    },

    // 3. CREATE
    async createBean(beanData) {
        console.log('API: Creating bean...', beanData);

        const res = await fetch(`${API_BASE}/beans`, {
            method: 'POST',
            body: JSON.stringify(beanData)
        });
        const response =  await res.json();
    },

    // 4. UPDATE
    async updateBean(id, beanData) {
     const res = await fetch(`${API_BASE}/beans/${id}`, {
            method: 'PUT',
            body: JSON.stringify(beanData)
        });

        const data =  await res.json();
        console.log(data);
    },

    // 5. DELETE
    async deleteBean(id) {
     const res = await fetch(`${API_BASE}/beans/${id}`, {
            method: 'DELETE',
        });

        const data =  await res.json();
        console.log(data);
    },

    // 6. LOCALIZATION
    async getTranslations(lang) {
        const res = await fetch(`${API_BASE}/i18n/${lang}`);
        const response =  await res.json();

        if(response.type === 'success'){
            return response.data
        } else {
           return {};
        }
    }
};