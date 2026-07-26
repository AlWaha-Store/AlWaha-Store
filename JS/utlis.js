// ============================================================
// UTILITY FUNCTIONS - دوال مساعدة عامة
// ============================================================

// ============================================================
// LOCAL STORAGE
// ============================================================

function getData(key, defaultVal = []) {
    try {
        const data = localStorage.getItem(key);
        if (data) {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : defaultVal;
        }
    } catch (e) {
        console.warn(`⚠️ Error reading ${key}:`, e);
    }
    return defaultVal;
}

function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error(`❌ Error saving ${key}:`, e);
        return false;
    }
}

function removeData(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        console.error(`❌ Error removing ${key}:`, e);
        return false;
    }
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

function showToast(message, type = 'success', icon = '') {
    const container = document.getElementById('toastContainer');
    if (!container) {
        console.warn('⚠️ Toast container not found');
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const defaultIcon = icon || (type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️');
    
    toast.innerHTML = `
        <span class="toast-icon">${defaultIcon}</span>
        <span class="toast-msg">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transition = '0.3s';
            setTimeout(() => {
                if (toast.parentElement) toast.remove();
            }, 300);
        }
    }, 3000);
}

// ============================================================
// DOM HELPERS
// ============================================================

function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}

function getElement(id) {
    return document.getElementById(id);
}

function getValue(id) {
    const el = getElement(id);
    return el ? el.value : '';
}

function setValue(id, value) {
    const el = getElement(id);
    if (el) el.value = value;
}

function getText(id) {
    const el = getElement(id);
    return el ? el.textContent : '';
}

function setText(id, text) {
    const el = getElement(id);
    if (el) el.textContent = text;
}

function getHTML(id) {
    const el = getElement(id);
    return el ? el.innerHTML : '';
}

function setHTML(id, html) {
    const el = getElement(id);
    if (el) el.innerHTML = html;
}

// ============================================================
// DATE HELPERS
// ============================================================

function formatDate(date, lang = 'ar') {
    if (!date) return '--';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '--';
    
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', options);
}

function formatDateShort(date, lang = 'ar') {
    if (!date) return '--';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '--';
    
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    
    return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', options);
}

function getNow() {
    return new Date().toISOString();
}

function getNowAr() {
    return formatDate(getNow());
}

// ============================================================
// STRING HELPERS
// ============================================================

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function truncate(str, length = 50) {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
}

function generateId(prefix = '') {
    return prefix + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
}

// ============================================================
// NUMBER HELPERS
// ============================================================

function formatCurrency(amount, lang = 'ar') {
    const currency = lang === 'ar' ? 'ج.م' : 'EGP';
    return amount.toFixed(2) + ' ' + currency;
}

function formatWeight(weight, lang = 'ar') {
    const unit = lang === 'ar' ? 'كجم' : 'kg';
    return weight.toFixed(2) + ' ' + unit;
}

// ============================================================
// EXPORT
// ============================================================

window.getData = getData;
window.saveData = saveData;
window.removeData = removeData;
window.showToast = showToast;
window.$ = $;
window.$$ = $$;
window.getElement = getElement;
window.getValue = getValue;
window.setValue = setValue;
window.getText = getText;
window.setText = setText;
window.getHTML = getHTML;
window.setHTML = setHTML;
window.formatDate = formatDate;
window.formatDateShort = formatDateShort;
window.getNow = getNow;
window.getNowAr = getNowAr;
window.capitalize = capitalize;
window.truncate = truncate;
window.generateId = generateId;
window.formatCurrency = formatCurrency;
window.formatWeight = formatWeight;

console.log('✅ Utils loaded'); 
