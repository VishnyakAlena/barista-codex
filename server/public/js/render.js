/**
 * Renders the sidebar list
 */
export function renderBeanList(beans, onSelect) {
    const listContainer = document.getElementById('bean-list');
    listContainer.innerHTML = '';

    beans.forEach(bean => {
        const item = document.createElement('div');
        item.className = 'card-item';
        // Если bean.id равен currentId - можно добавить класс active,
        // но логика active реализуется через клик ниже.

        const imgUrl = bean.imageUrl || 'assets/flags/default.svg';

        item.innerHTML = `
            <div class="card-text">
                <h2>${bean.title}</h2>
                <p>${bean.description.substring(0, 60)}...</p>
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
}

/**
 * Renders the detail view
 */
export function renderBeanDetails(bean) {
    // Top Info
    setText('detail-title', bean.title);

    // Flag in detail view
    const flagImg = document.getElementById('detail-flag-img');
    if(flagImg) flagImg.src = bean.imageUrl || 'assets/flags/default.svg';

    setText('detail-description', bean.description);

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