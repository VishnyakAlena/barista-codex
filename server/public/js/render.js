/**
 * Renders the sidebar list
 */

export function renderBeanList(beans, onSelect, translations) {
    const currentLang = document.getElementById('lang-select').value || 'en';
    const listContainer = document.getElementById('bean-list');
    listContainer.innerHTML = '';

    beans.forEach(bean => {
        const item = document.createElement('div');
        item.className = 'card-item';
        // Если bean.id равен currentId - можно добавить класс active,
        // но логика active реализуется через клик ниже.

        const imgUrl = bean.imageUrl || 'assets/flags/default.svg';

        const typeKey = `ui.${(bean.type || 'bean').toLowerCase()}`;

        item.innerHTML = `
            <div class="card-text">
                <h2>${bean.title}</h2>
                <p class="detail-type" data-i18n="${typeKey}">${bean.type}</p>
                <p>${(bean.description?.[currentLang]?.substring(0, 60) || bean.description?.['en']?.substring(0, 60) || '')}...</p>
            </div>
            <div class="card-flag-wrap">
                <img src="${imgUrl}" class="card-flag" alt="Flag">
            </div>
        `;

        item.onclick = () => {
            document.querySelectorAll('.card-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            onSelect(bean.id);
        };
        
        listContainer.appendChild(item);
    });
    applyTranslations(translations);
}

/**
 * Renders the detail view
 */
export function renderBeanDetails(bean, translations) {
    if (!bean) return;
    const currentLang = document.getElementById('lang-select').value || 'en';
    // Top Info
    setText('detail-title', bean.title);
    const typeKey = `ui.${(bean.type || 'bean').toLowerCase()}`; 
    const typeEl = document.getElementById('detail-type');

    if (typeEl) {
        typeEl.setAttribute('data-i18n', typeKey);
        typeEl.textContent = bean.type || 'Bean';
    }

    // Flag in detail view
    const flagImg = document.getElementById('detail-flag-img');
    if(flagImg) flagImg.src = bean.imageUrl || 'assets/flags/default.svg';

    setText('detail-description', bean.description[currentLang] || bean.description['en']);

    // Attributes
    setText('detail-region', bean.details.region);
    setText('detail-process', bean.details.process);

    // Flavor tags
    setText('detail-tags', bean.flavorProfile.notes.join(', '));

    // Scores
    setText('detail-sweetness', `${bean.flavorProfile.sweetness}/10`);
    setText('detail-acidity', `${bean.flavorProfile.acidity}/10`);
    setText('detail-bitterness', `${bean.flavorProfile.bitterness}/10`);

    setText('detail-variety', bean.details.variety ? bean.details.variety.join(', ') : '-');
    setText('detail-score', bean.details.scaScore);

    // Comment
    setText('detail-comment', `«${bean.roasterComment || 'No comment'}»`);

    // Recipes logic
    const v60 = bean.recipes.find(r => r.method === 'V60');
    const espresso = bean.recipes.find(r => r.method === 'Espresso');

    renderRecipeText('rec-v60-text', v60);
    renderRecipeText('rec-espresso-text', espresso);

    applyTranslations(translations);
}

function renderRecipeText(elementId, recipe) {
    const el = document.getElementById(elementId);
    if (!recipe) {
        el.textContent = 'Not available';
        return;
    }

    let html = `
        <div><b>Grind:</b> ${recipe.grindSize}</div>
        <div><b>Time:</b> ${recipe.timeTotal}</div>
        <div><b>In:</b> ${recipe.doseIn}g | <b>Out:</b> ${recipe.doseOut}g | <b>Temp:</b> ${recipe.waterTemp}°C</div>
        <div style="margin-top:8px;">
    `;

    if(recipe.steps && recipe.steps.length > 0) {
        recipe.steps.forEach(step => {
            html += `<div>• ${step}</div>`;
        });
    }
    html += `</div>`;

    el.innerHTML = html;
}

export function applyTranslations(translations) {
    if (!translations) return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');

        if (translations[key]) {
            el.textContent = translations[key].target;
        }
    });
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}