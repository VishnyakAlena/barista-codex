import { apiClient } from './api.js';
import { renderBeanList, renderBeanDetails, applyTranslations } from './render.js';

// STATE
let allBeansCached = []; 
let currentBeanId = null;

// INIT
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type') || 'all';

    currentBeanId = localStorage.getItem('activeBeanId');

    document.querySelectorAll('.category-nav__btn').forEach(btn => {
        const btnType = btn.dataset.type ? btn.dataset.type.toLowerCase() : 'all';
        if (btnType === typeParam.toLowerCase()) {
            btn.classList.add('category-nav__btn--active');
        } else {
            btn.classList.remove('category-nav__btn--active');
        }
    });

    await loadList(typeParam);

    if (currentBeanId) {
        await handleBeanSelection(currentBeanId);
    }
});

// =========================================================
// EVENT LISTENERS
// =========================================================

// Language Switcher
const langSelect = document.getElementById('lang-select');
const langFlag = document.getElementById('current-lang-flag');
const langText = document.getElementById('lang-text');

function updateFlagIcon(lang) {
    const iconName = (lang === 'en') ? 'gb' : lang;
    langFlag.src = `assets/flags/${iconName}.svg`;
    langText.textContent = lang.toUpperCase();
}

langSelect.addEventListener('change', async (e) => {
    const newLang = e.target.value;
    updateFlagIcon(newLang);

    const translationsPromise = apiClient.getTranslations(newLang);

    let beanPromise = null;
    if (typeof currentBeanId !== 'undefined' && currentBeanId) {
        beanPromise = apiClient.getBeanById(currentBeanId);
    }

    const [translations, fullBean] = await Promise.all([
        translationsPromise,
        beanPromise
    ]);

    const activeNavBtn = document.querySelector('.category-nav__btn--active');
    
    const currentFilterType = activeNavBtn && activeNavBtn.dataset.type 
        ? activeNavBtn.dataset.type.toLowerCase() 
        : 'all';

    await loadList(currentFilterType);

    if (fullBean) {
        renderBeanDetails(fullBean, translations);
    }
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
        const activeNavBtn = document.querySelector('.category-nav__btn--active');
        const currentFilterType = activeNavBtn && activeNavBtn.dataset.type ? activeNavBtn.dataset.type.toLowerCase() : 'all';
        await loadList(currentFilterType);
    }
});

document.getElementById('btn-edit').addEventListener('click', async () => {
    if(!currentBeanId) return;
    const bean = await apiClient.getBeanById(currentBeanId);
    openModal(bean);
});

document.getElementById('btn-cancel').addEventListener('click', closeModal);
// ----------------------------------------------------

// Form Submit
document.getElementById('bean-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const englishText = document.getElementById('form-description-en').value.trim();
    const italianText = document.getElementById('form-description-it').value.trim();
    const bulgarianText = document.getElementById('form-description-bg').value.trim();

    const formData = {
        title: document.getElementById('form-title').value,
        type: document.getElementById('form-type').value,
        country: document.getElementById('form-country').value,
        description: {
            en: englishText,            
            it: italianText || englishText, 
            bg: bulgarianText || englishText 
        },
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
    const activeNavBtn = document.querySelector('.category-nav__btn--active');
    const currentFilterType = activeNavBtn && activeNavBtn.dataset.type ? activeNavBtn.dataset.type.toLowerCase() : 'all';
    await loadList(currentFilterType);
});

// Category Tabs (Bean / Beverage / Dessert)
document.querySelectorAll('.category-nav__btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        // Добавляем нажатой (ищем ближайшую кнопку, т.к. клик может быть по иконке внутри)
        const button = e.target.closest('.category-nav__btn');
        if (!button) return;

        // Убираем active у всех
        document.querySelectorAll('.category-nav__btn').forEach(b => b.classList.remove('category-nav__btn--active'));
        
        button.classList.add('category-nav__btn--active');

        // TODO: В Beta версии здесь будет фильтрация
        const selectedType = button.dataset.type ? button.dataset.type.toLowerCase() : 'all';
        console.log('Фильтрация по типу:', selectedType);

        const urlObj = new URL(window.location.href);
        if (selectedType === 'all') {
            urlObj.searchParams.delete('type'); 
        } else {
            urlObj.searchParams.set('type', selectedType); 
        }
        
        window.history.replaceState({}, '', urlObj.pathname + urlObj.search);
        
        if (currentBeanId) {
            const openedBean = allBeansCached.find(b => b.id === currentBeanId);
            
            if (openedBean) {
                const openedBeanType = (openedBean.type || 'bean').toLowerCase();
                if (selectedType !== 'all' && openedBeanType !== selectedType) {
                    resetView();
                }
            }
        }

        try {
            await loadList(selectedType);
        } catch (error) {
            console.error("Ошибка при отправке запроса фильтрации:", error);
        }
    });
});


// =========================================================
// LOGIC FUNCTIONS
// =========================================================

async function loadList(type='all') {
    const listContainer = document.getElementById('bean-list');
    listContainer.innerHTML = '<div class="loading">Loading...</div>';

    const beans = await apiClient.getAllBeans(type);
    allBeansCached = beans;

    if (!beans || beans.length === 0) {
        listContainer.innerHTML = '<div class="empty-msg">No beans found. Add one!</div>';
        return;
    }

    const currentLang = document.getElementById('lang-select').value || 'en';
    const translations = await apiClient.getTranslations(currentLang);

    renderBeanList(beans, handleBeanSelection, translations, currentBeanId);
}

async function handleBeanSelection(id) {
    currentBeanId = id;
    
    const currentLang = document.getElementById('lang-select').value || 'en';
    const bean = await apiClient.getBeanById(id, currentLang);
    const translations = await apiClient.getTranslations(currentLang);

    document.getElementById('placeholder-view').classList.add('hidden');
    document.getElementById('details-view').classList.remove('hidden');

    renderBeanDetails(bean, translations);
}

export async function handleLangChange(lang) {
    const translations = await apiClient.getTranslations(lang);

    if(translations && Object.keys(translations).length > 0) {
        applyTranslations(translations);
    }
}

function resetView() {
    currentBeanId = null;
    localStorage.removeItem('activeBeanId');
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

    const currentLang = document.getElementById('lang-select').value || 'en';
    syncFormTabWithLanguage(currentLang);

    if (bean) {
        document.getElementById('modal-title').textContent = 'Edit Item';
        document.getElementById('form-id').value = bean.id;

        // Basic
        document.getElementById('form-title').value = bean.title;
        document.getElementById('form-type').value = bean.type || 'Bean';
        document.getElementById('form-country').value = bean.country;
        document.getElementById('form-image').value = bean.imageUrl || 'assets/flags/default.png';

        document.getElementById('form-description-en').value = bean.description?.en || '';
        document.getElementById('form-description-it').value = bean.description?.it || '';
        document.getElementById('form-description-bg').value = bean.description?.bg || '';

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
        document.getElementById('form-type').value = 'Bean';
        document.getElementById('form-image').value = 'assets/flags/default.svg';
        document.getElementById('form-acidity').value = 5;
        document.getElementById('form-sweetness').value = 5;
        document.getElementById('form-bitterness').value = 5;
    }
}

// Функция для принудительного переключения вкладки описания на язык страницы
function syncFormTabWithLanguage(lang) {
    document.querySelectorAll('.language-tabs__btn').forEach(b => b.classList.remove('language-tabs__btn--active'));
    
    const targetTab = document.querySelector(`.language-tabs__btn[data-lang="${lang}"]`);
    if (targetTab) {
        targetTab.classList.add('language-tabs__btn--active');
    }

    document.querySelectorAll('.language-tabs__content').forEach(c => c.style.display = 'none');
    
    const targetContent = document.getElementById(`content-desc-${lang}`);
    if (targetContent) {
        targetContent.style.display = 'block';
    }
}

// Переключение языковых вкладок внутри модального окна описания
document.querySelectorAll('.language-tabs__btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.language-tabs__btn').forEach(b => b.classList.remove('language-tabs__btn--active'));
        
        const clickedBtn = e.target;
        clickedBtn.classList.add('language-tabs__btn--active');

        document.querySelectorAll('.language-tabs__content').forEach(content => {
            content.style.display = 'none';
        });

        const targetLang = clickedBtn.dataset.lang;
        const targetContent = document.getElementById(`content-desc-${targetLang}`);
        if (targetContent) {
            targetContent.style.display = 'block';
        }
    });
});

function closeModal() {
    const modal = document.getElementById('bean-modal');
    modal.classList.add('hidden'); // Добавляем класс hidden, чтобы скрыть
    const currentLang = document.getElementById('lang-select').value || 'en';
    syncFormTabWithLanguage(currentLang);
}