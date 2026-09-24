import { apiClient } from './api.js';
import { renderBeanList, renderBeanDetails, applyTranslations } from './render.js';

// STATE
let currentBeanId = null;

// INIT
document.addEventListener('DOMContentLoaded', async () => {
    await loadList();
    handleLangChange('en');
});

// =========================================================
// EVENT LISTENERS
// =========================================================

// Language Switcher
document.getElementById('lang-select').addEventListener('change', (e) => handleLangChange(e.target.value));

const langSelect = document.getElementById('lang-select');
const langFlag = document.getElementById('current-lang-flag');
const langText = document.getElementById('lang-text');

function updateFlagIcon(lang) {
    const iconName = (lang === 'en') ? 'gb' : lang;

    langFlag.src = `assets/flags/${iconName}.svg`;

    langText.textContent = lang.toUpperCase();
}

langSelect.addEventListener('change', (e) => {
    const newLang = e.target.value;
    handleLangChange(newLang);
    updateFlagIcon(newLang);
});

// Init
updateFlagIcon('en');

// Toolbar Actions
document.getElementById('btn-add-bean').addEventListener('click', () => openModal());

document.getElementById('btn-delete').addEventListener('click', async () => {
    if(!currentBeanId) return;
    if(confirm('Are you sure you want to delete this bean?')) {
        await apiClient.deleteBean(currentBeanId);
        resetView();
        await loadList();
    }
});

document.getElementById('btn-edit').addEventListener('click', async () => {
    if(!currentBeanId) return;
    const bean = await apiClient.getBeanById(currentBeanId);
    openModal(bean);
});

// --- ВОТ ЭТА ВАЖНАЯ ЧАСТЬ, КОТОРАЯ МОГЛА ПРОПАСТЬ ---
document.getElementById('btn-cancel').addEventListener('click', closeModal);
// ----------------------------------------------------

// Form Submit
document.getElementById('bean-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        title: document.getElementById('form-title').value,
        country: document.getElementById('form-country').value,
        description: document.getElementById('form-description').value,
        imageUrl: document.getElementById('form-image').value,
        roasterComment: document.getElementById('form-comment').value,

        details: {
            process: document.getElementById('form-process').value,
            scaScore: Number(document.getElementById('form-score').value) || 0,
            region: document.getElementById('form-region').value || 'Unknown',
            variety: document.getElementById('form-variety').value.split(',').map(s => s.trim())
        },
        flavorProfile: {
            notes: document.getElementById('form-notes').value.split(',').map(s => s.trim()),
            acidity: Number(document.getElementById('form-acidity').value),
            sweetness: Number(document.getElementById('form-sweetness').value),
            bitterness: Number(document.getElementById('form-bitterness').value)
        }
    };

    const id = document.getElementById('form-id').value;

    if (id) {
        await apiClient.updateBean(id, formData);
    } else {
        await apiClient.createBean(formData);
    }

    closeModal();
    await loadList();
});

// Category Tabs (Bean / Beverage / Dessert)
// (Если у тебя в HTML есть эти кнопки, этот код нужен. Если нет - не помешает)
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Убираем active у всех
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        // Добавляем нажатой (ищем ближайшую кнопку, т.к. клик может быть по иконке внутри)
        const button = e.target.closest('.nav-btn');
        button.classList.add('active');

        // TODO: В Beta версии здесь будет фильтрация
        console.log('Filter by:', button.dataset.type);
    });
});


// =========================================================
// LOGIC FUNCTIONS
// =========================================================

async function loadList() {
    const listContainer = document.getElementById('bean-list');
    listContainer.innerHTML = '<div class="loading">Loading...</div>';

    const beans = await apiClient.getAllBeans();

    if (!beans || beans.length === 0) {
        listContainer.innerHTML = '<div class="empty-msg">No beans found. Add one!</div>';
        return;
    }

    renderBeanList(beans, async (id) => {
        currentBeanId = id;
        const bean = await apiClient.getBeanById(id);

        document.getElementById('placeholder-view').classList.add('hidden');
        document.getElementById('details-view').classList.remove('hidden');

        renderBeanDetails(bean);
    });
}

async function handleLangChange(lang) {
    const translations = await apiClient.getTranslations(lang);

    if(translations && Object.keys(translations).length > 0) {
        applyTranslations(translations);
    }
}

function resetView() {
    currentBeanId = null;
    document.getElementById('placeholder-view').classList.remove('hidden');
    document.getElementById('details-view').classList.add('hidden');
}

// =========================================================
// MODAL UTILS
// =========================================================

function openModal(bean = null) {
    console.log('open modal');
    const modal = document.getElementById('bean-modal');
    modal.classList.remove('hidden'); // Убираем класс hidden, чтобы показать окно

    if (bean) {
        document.getElementById('modal-title').textContent = 'Edit Item';
        document.getElementById('form-id').value = bean.id;

        // Basic
        document.getElementById('form-title').value = bean.title;
        document.getElementById('form-country').value = bean.country;
        document.getElementById('form-image').value = bean.imageUrl || 'assets/flags/default.svg';
        document.getElementById('form-description').value = bean.description;
        document.getElementById('form-comment').value = bean.roasterComment || '';

        // Details
        document.getElementById('form-score').value = bean.details.scaScore;
        document.getElementById('form-process').value = bean.details.process;
        document.getElementById('form-region').value = bean.details.region || '';
        document.getElementById('form-variety').value = bean.details.variety ? bean.details.variety.join(', ') : '';

        // Flavor
        document.getElementById('form-notes').value = bean.flavorProfile.notes.join(', ');
        document.getElementById('form-acidity').value = bean.flavorProfile.acidity;
        document.getElementById('form-sweetness').value = bean.flavorProfile.sweetness;
        document.getElementById('form-bitterness').value = bean.flavorProfile.bitterness;

    } else {
        document.getElementById('modal-title').textContent = 'Add New Item';
        document.getElementById('bean-form').reset();
        document.getElementById('form-id').value = '';

        // Defaults
        document.getElementById('form-image').value = 'assets/flags/default.svg';
        document.getElementById('form-acidity').value = 5;
        document.getElementById('form-sweetness').value = 5;
        document.getElementById('form-bitterness').value = 5;
    }
}

function closeModal() {
    const modal = document.getElementById('bean-modal');
    modal.classList.add('hidden'); // Добавляем класс hidden, чтобы скрыть
}