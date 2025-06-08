export function parseFullDateToParts(dateString) {
    if (!dateString) return { date: '', time: '', timezone: '', timestamp: 0 };
    const parts = { date: '', time: '', timezone: '', timestamp: 0 };
    const match = dateString.match(/(\w{3})\s(\d{1,2})\s(\d{1,2}:\d{2}\s(?:AM|PM))\s*(\w{3})?/);
    if (match) {
        parts.date = `${match[1]} ${match[2]}`; parts.time = match[3]; parts.timezone = match[4] || '';
    } else {
        const dateParts = dateString.split(' ');
        if (dateParts.length >= 2) parts.date = `${dateParts[0]} ${dateParts[1]}`;
        if (dateParts.length >= 4) parts.time = `${dateParts[2]} ${dateParts[3]}`;
    }
    const cleanedDateString = dateString.replace(/\s*(MST|PST|PDT|EST|EDT|CST|CDT|UTC)/, '').trim();
    let ts = Date.parse(cleanedDateString);
    if (isNaN(ts) && match) { const year = new Date().getFullYear(); ts = Date.parse(`${match[1]} ${match[2]}, ${year} ${match[3]}`); }
    parts.timestamp = isNaN(ts) ? 0 : ts; return parts;
}

export function parseLocationString(locationString) {
    if (!locationString) return { city: '', state: '', zip: '' };
    const parts = { city: '', state: '', zip: '' };
    const regex = /^(.*?),\s*([A-Za-z]{2})\s*([A-Za-z0-9\s-]{3,10})$/;
    const match = locationString.match(regex);
    if (match) {
        parts.city = match[1].trim(); parts.state = match[2].trim().toUpperCase(); parts.zip = match[3].trim().toUpperCase();
    } else {
        const commaParts = locationString.split(',');
        if (commaParts.length > 0) parts.city = commaParts[0].trim();
        if (commaParts.length > 1) {
            const stateZipPart = commaParts[1].trim(); const spaceParts = stateZipPart.split(/\s+/);
            if (spaceParts.length > 0 && spaceParts[0].length === 2 && /^[A-Za-z]+$/.test(spaceParts[0])) {
                parts.state = spaceParts[0].toUpperCase();
                if (spaceParts.length > 1) parts.zip = spaceParts.slice(1).join(' ');
            } else { parts.zip = stateZipPart; }
        }
    } return parts;
}

export function formatValue(value, key = '') {
    if (value === null || value === undefined || String(value).trim() === '') return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    const lowerKey = key.toLowerCase();
    if (typeof value === 'number' && (lowerKey.includes('price') || lowerKey.includes('cost') || lowerKey.includes('spend') || lowerKey.includes('fee'))) {
        return `$${value.toFixed(2)}`;
    }
    if (lowerKey === 'distance' && typeof value === 'number') return `${value.toFixed(1)} miles`;
    if (typeof value === 'number' && (lowerKey.includes('percentage') || lowerKey.includes('rate'))) {
         if (value >= 0 && value <= 1.0001 && !lowerKey.includes('rating')) { // Check if it's a typical 0-1 rate
            return `${(value * 100).toFixed(2)}%`;
         }
         return value.toFixed(2); // For other numbers that might be rates or just need formatting
    }
    return String(value);
}

export function addStylesOnce(cssString, scriptPrefix) {
    const styleId = 'customAssignmentsTableStyles_Global';
    if (document.getElementById(styleId)) { return; }
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = cssString;
    document.head.appendChild(styleElement);
    console.log(`${scriptPrefix} Global custom styles injected successfully.`);
}

export function modifyPageSizeSelectOnce(scriptPrefix) {
    const pageSizeSelect = document.getElementById('assignment_list_size');
    if (pageSizeSelect) {
        if (pageSizeSelect.dataset.modifiedByTransformer) { return; }
        console.log(`${scriptPrefix} Modifying #assignment_list_size select.`);
        const currentSelectedValue = pageSizeSelect.value;
        pageSizeSelect.innerHTML = '';
        let isCurrentSelectedStillAvailable = false;
        for (let i = 100; i <= 1000; i += 50) {
            const option = document.createElement('option'); option.value = i; option.textContent = i;
            if (String(i) === currentSelectedValue) { option.selected = true; isCurrentSelectedStillAvailable = true; }
            pageSizeSelect.appendChild(option);
        }
        if (!isCurrentSelectedStillAvailable && pageSizeSelect.options.length > 0) { /* Optional */ }
        pageSizeSelect.dataset.modifiedByTransformer = 'true';
        console.log(`${scriptPrefix} #assignment_list_size select modified.`);
    } else {
        console.warn(`${scriptPrefix} Warning: Select element #assignment_list_size not found for modification.`);
    }
}
