(async function() { // IIFE starts here
    'use strict';
    const SCRIPT_PREFIX = '[WM TRANSFORMER V11.1-OVERLAY]'; // Incremented version
    console.log(`${SCRIPT_PREFIX} Script starting...`);

    // --- 1. CSS Definition (remains at the top of IIFE) ---
    const customCss = `
        /* ... ALL YOUR CSS FROM V11 ... */
        #assignment_list_results { /* Original container might be hidden or ignored now */ }
        .wm-transformer-overlay { position: fixed; top: 50px; left: 50px; width: 80vw; max-width: 1200px; height: 70vh; max-height: 800px; background-color: #f8f9fa; border: 1px solid #ccc; box-shadow: 0 5px 15px rgba(0,0,0,0.2); z-index: 9998; display: flex; flex-direction: column; border-radius: 8px; overflow: hidden; }
        .wm-transformer-overlay.minimized { height: 40px !important; width: 250px !important; overflow: hidden; }
        .wm-transformer-overlay.minimized .overlay-content { display: none; }
        .wm-transformer-overlay.minimized .overlay-resize-handle { display: none; }
        .overlay-header { background-color: #343a40; color: white; padding: 8px 12px; cursor: move; display: flex; justify-content: space-between; align-items: center; border-top-left-radius: 7px; border-top-right-radius: 7px; height: 40px; box-sizing: border-box; }
        .overlay-header span { font-weight: bold; }
        .overlay-controls button { background: none; border: none; color: white; font-size: 16px; margin-left: 8px; cursor: pointer; padding: 2px 5px; }
        .overlay-controls button:hover { background-color: rgba(255,255,255,0.2); }
        .overlay-content { padding: 10px; flex-grow: 1; overflow: auto; background-color: white; }
        .overlay-resize-handle { width: 15px; height: 15px; background-color: #ddd; position: absolute; right: 0; bottom: 0; cursor: nwse-resize; }
        .tech-modal-overlay { z-index: 9999 !important; }
        .tech-modal-content { cursor: default; /* Let header be draggable for modal */ }
        .tech-modal-header { cursor: move; /* Make modal header draggable */ }
        /* ... (Rest of your existing table and modal CSS) ... */
    `;

    // --- Global-like Helper Functions (defined within IIFE) ---
    function addStylesGlobal(cssString, prefix) {
        const styleElement = document.createElement('style'); styleElement.id = 'customAssignmentsTableStyles';
        if (document.getElementById(styleElement.id)) { console.log(`${prefix} Styles already injected.`); return; }
        styleElement.textContent = cssString; document.head.appendChild(styleElement);
        console.log(`${prefix} Custom styles injected successfully.`);
    }

    function modifyPageSizeSelectGlobal(prefix) {
        const pageSizeSelect = document.getElementById('assignment_list_size');
        if (pageSizeSelect) {
            console.log(`${prefix} Modifying #assignment_list_size select.`);
            const currentSelectedValue = pageSizeSelect.value; pageSizeSelect.innerHTML = ''; let isCurrentSelectedStillAvailable = false;
            for (let i = 100; i <= 1000; i += 50) { const option = document.createElement('option'); option.value = i; option.textContent = i; if (String(i) === currentSelectedValue) { option.selected = true; isCurrentSelectedStillAvailable = true; } pageSizeSelect.appendChild(option); }
            if (!isCurrentSelectedStillAvailable && pageSizeSelect.options.length > 0) { /* Potentially select first */ }
            console.log(`${prefix} #assignment_list_size select modified.`);
        } else { console.warn(`${prefix} Warning: Select element #assignment_list_size not found.`); }
    }


class WorkMarketTransformer {
    constructor() {
        this.SCRIPT_PREFIX = SCRIPT_PREFIX; // Use the IIFE's SCRIPT_PREFIX
        console.log(`${this.SCRIPT_PREFIX} Initializing WorkMarketTransformer...`);
        this.originalResultsContainerSource = document.getElementById('assignment_list_results');
        // this.pageSizeSelect is handled globally now
        this.tableData = [];
        this.currentSort = { column: 'timestamp', direction: 'desc' };
        this.activeTableHeaders = [];
        this.currentAssignmentTechsData = {};
        this.currentModalAssignmentId = null;
        this.currentModalTechIndex = -1;
        this.assignmentItemSelector = '.results-row.work';
        this.transformationInitialized = false;

        this.mainOverlay = null;
        this.mainOverlayContentTarget = null;
        this.isDraggingOverlay = false;
        this.isResizingOverlay = false;
        this.overlayDragStartX = 0;
        this.overlayDragStartY = 0;
        this.overlayOriginalX = 0; // Not strictly needed for basic drag if we don't reset to original
        this.overlayOriginalY = 0; // Not strictly needed
        this.overlayOriginalWidth = 0;
        this.overlayOriginalHeight = 0;

        // Bound event handlers for overlay
        this.doDragOverlayBound = this.doDragOverlay.bind(this);
        this.stopDragOverlayBound = this.stopDragOverlay.bind(this);
        this.doResizeOverlayBound = this.doResizeOverlay.bind(this);
        this.stopResizeOverlayBound = this.stopResizeOverlay.bind(this);

        // Bound event handlers for tech modal (if making it draggable separately)
        this.techModalIsDragging = false;
        this.techModalDragStartX = 0;
        this.techModalDragStartY = 0;
        this.doDragTechModalBound = this.doDragTechModal.bind(this);
        this.stopDragTechModalBound = this.stopDragTechModal.bind(this);


        if (!this.originalResultsContainerSource) {
            console.error(`${this.SCRIPT_PREFIX} CRITICAL ERROR: Source container #assignment_list_results not found. Aborting.`);
            return;
        }
        // Styles and pageSizeSelect modification are now called globally before class instantiation

        this.createMainOverlay();
        this.createTechModal();
        console.log(`${this.SCRIPT_PREFIX} Scheduling main transformation sequence via waitForAssignmentsAndInitialize...`);
        this.waitForAssignmentsAndInitialize();
    }

    // Methods are part of the class
    parseFullDateToParts(dateString) { /* ... Same as V10 ... */ if (!dateString) return { date: '', time: '', timezone: '', timestamp: 0 }; const parts = { date: '', time: '', timezone: '', timestamp: 0 }; const match = dateString.match(/(\w{3})\s(\d{1,2})\s(\d{1,2}:\d{2}\s(?:AM|PM))\s*(\w{3})?/); if (match) { parts.date = `${match[1]} ${match[2]}`; parts.time = match[3]; parts.timezone = match[4] || ''; } else { const dateParts = dateString.split(' '); if (dateParts.length >= 2) parts.date = `${dateParts[0]} ${dateParts[1]}`; if (dateParts.length >= 4) parts.time = `${dateParts[2]} ${dateParts[3]}`; } const cleanedDateString = dateString.replace(/\s*(MST|PST|PDT|EST|EDT|CST|CDT|UTC)/, '').trim(); let ts = Date.parse(cleanedDateString); if (isNaN(ts) && match) { const year = new Date().getFullYear(); ts = Date.parse(`${match[1]} ${match[2]}, ${year} ${match[3]}`); } parts.timestamp = isNaN(ts) ? 0 : ts; return parts; }
    parseLocationString(locationString) { /* ... Same as V10 ... */ if (!locationString) return { city: '', state: '', zip: '' }; const parts = { city: '', state: '', zip: '' }; const regex = /^(.*?),\s*([A-Za-z]{2})\s*([A-Za-z0-9\s-]{3,10})$/; const match = locationString.match(regex); if (match) { parts.city = match[1].trim(); parts.state = match[2].trim().toUpperCase(); parts.zip = match[3].trim().toUpperCase(); } else { const commaParts = locationString.split(','); if (commaParts.length > 0) parts.city = commaParts[0].trim(); if (commaParts.length > 1) { const stateZipPart = commaParts[1].trim(); const spaceParts = stateZipPart.split(/\s+/); if (spaceParts.length > 0 && spaceParts[0].length === 2 && /^[A-Za-z]+$/.test(spaceParts[0])) { parts.state = spaceParts[0].toUpperCase(); if (spaceParts.length > 1) parts.zip = spaceParts.slice(1).join(' '); } else { parts.zip = stateZipPart; } } } return parts; }
    async fetchWorkerData(assignmentId) { /* ... Same as V10 (ensure filter is correct) ... */ if (!assignmentId) { console.warn(`${this.SCRIPT_PREFIX} No assignment ID for fetching workers.`); return { count: 0, applicantDetailsDisplay: 'No ID', top10TechsFullData: [] }; } const url = `/assignments/${assignmentId}/workers?start=0&limit=50&sortColumn=NEGOTIATION_CREATED_ON&sortDirection=DESC`; let responseText = ''; try { const response = await fetch(url, { headers: { 'Accept': 'application/json, text/plain, */*', 'X-Requested-With': 'XMLHttpRequest' } }); responseText = await response.text(); if (!response.ok) { console.error(`${this.SCRIPT_PREFIX} API Call [ERROR] - Failed for ${assignmentId}: ${response.status} ${response.statusText}. Response Text:`, responseText); return { count: 0, applicantDetailsDisplay: `Error ${response.status}`, top10TechsFullData: [] };} const data = JSON.parse(responseText); let allFetchedWorkers = data.results || []; const totalFetchedInitially = allFetchedWorkers.length; const appliedWorkers = allFetchedWorkers.filter(w => { const isNotDeclined = w.declined_on === ""; const hasActiveNegotiation = w.has_negotiation === true && w.negotiation !== null; const hasApplied = hasActiveNegotiation; return isNotDeclined && hasApplied; }); appliedWorkers.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity)); const top10WorkersRaw = appliedWorkers.slice(0, 10); const top10TechsFullData = top10WorkersRaw.map(w => { const techWithScore = { ...w, assignmentId: assignmentId }; const scores = this.calculateOverallScore(techWithScore); return { ...techWithScore, ...scores }; }); const listItems = top10WorkersRaw.map((tech, index) => { let displayName = ''; if (tech.company_name && tech.company_name.toLowerCase() === 'sole proprietor') { displayName = tech.name || tech.company_name || 'N/A'; } else { displayName = tech.company_name || 'N/A'; if (tech.name && tech.name.toLowerCase() !== tech.company_name.toLowerCase()) { displayName += ` (${tech.name})`; } } const distance = (tech.distance !== undefined ? parseFloat(tech.distance).toFixed(1) + ' mi' : 'N/A'); const totalCostValue = tech.negotiation?.pricing?.total_cost; const totalCostDisplay = totalCostValue !== undefined ? `$${parseFloat(totalCostValue).toFixed(2)}` : 'N/A'; const costClass = totalCostValue !== undefined ? 'cost-value' : 'cost-na'; return `<li><span class="tech-detail-link" data-assignment-id="${assignmentId}" data-tech-index="${index}">${displayName}</span> (${distance}, <span class="${costClass}">Cost: ${totalCostDisplay}</span>)</li>`; }); const applicantDetailsDisplay = top10TechsFullData.length > 0 ? `<ul>${listItems.join('')}</ul>` : (totalFetchedInitially > 0 ? 'None met filter criteria' : 'No applicants found'); return { count: appliedWorkers.length, applicantDetailsDisplay: applicantDetailsDisplay, top10TechsFullData: top10TechsFullData }; } catch (error) { console.error(`${this.SCRIPT_PREFIX} API Call [EXCEPTION] - Error fetching/parsing worker data for ${assignmentId}:`, error); console.error(`${this.SCRIPT_PREFIX} API Call [EXCEPTION] - Response text was:`, responseText); return { count: 0, applicantDetailsDisplay: 'Fetch/Parse Exception', top10TechsFullData: [] }; } }
    calculateOverallScore(techData, assignmentBudget = 350) { /* ... Same as V10 ... */ }
    async extractAssignmentsData(assignmentNodes) { /* ... Same as V10 ... */ }
    renderTable(dataToRender, headersToRender, targetContainer) { /* ... Same as V10 ... */ }
    handleSort(columnKey) { /* ... Same as V10 ... */ }
    sortData() { /* ... Same as V10 ... */ }
    updateSortIndicators() { /* ... Same as V10 ... */ }

    createMainOverlay() {
        if (document.getElementById('wmTransformerOverlay')) return;
        console.log(`${this.SCRIPT_PREFIX} Creating main table overlay...`);
        this.mainOverlay = document.createElement('div'); this.mainOverlay.id = 'wmTransformerOverlay'; this.mainOverlay.className = 'wm-transformer-overlay'; this.mainOverlay.style.display = 'none'; // Initially hidden
        const header = document.createElement('div'); header.className = 'overlay-header';
        header.innerHTML = `<span>WorkMarket Enhanced Assignments</span><div class="overlay-controls"><button class="overlay-minimize-btn" title="Minimize">_</button><button class="overlay-maximize-btn" title="Maximize">□</button><button class="overlay-close-btn" title="Hide">X</button></div>`;
        this.mainOverlayContentTarget = document.createElement('div'); this.mainOverlayContentTarget.className = 'overlay-content'; this.mainOverlayContentTarget.id = 'assignment_list_results_overlay_content';
        const resizeHandle = document.createElement('div'); resizeHandle.className = 'overlay-resize-handle';
        this.mainOverlay.appendChild(header); this.mainOverlay.appendChild(this.mainOverlayContentTarget); this.mainOverlay.appendChild(resizeHandle);
        document.body.appendChild(this.mainOverlay);
        header.addEventListener('mousedown', this.startDragOverlay.bind(this));
        resizeHandle.addEventListener('mousedown', this.startResizeOverlay.bind(this));
        header.querySelector('.overlay-minimize-btn').addEventListener('click', () => this.mainOverlay.classList.toggle('minimized'));
        header.querySelector('.overlay-maximize-btn').addEventListener('click', () => this.toggleMaximizeOverlay());
        header.querySelector('.overlay-close-btn').addEventListener('click', () => { if(this.mainOverlay) this.mainOverlay.style.display = 'none'; });
        console.log(`${this.SCRIPT_PREFIX} Main table overlay created.`);
    }

    startDragOverlay(e) { if (e.target.classList.contains('overlay-controls') || e.target.closest('.overlay-controls')) return; this.isDraggingOverlay = true; this.mainOverlay.style.userSelect = 'none'; this.overlayDragStartX = e.clientX - this.mainOverlay.offsetLeft; this.overlayDragStartY = e.clientY - this.mainOverlay.offsetTop; document.addEventListener('mousemove', this.doDragOverlayBound); document.addEventListener('mouseup', this.stopDragOverlayBound); }
    doDragOverlay(e) { if (!this.isDraggingOverlay || !this.mainOverlay) return; this.mainOverlay.style.left = (e.clientX - this.overlayDragStartX) + 'px'; this.mainOverlay.style.top = (e.clientY - this.overlayDragStartY) + 'px'; }
    stopDragOverlay() { this.isDraggingOverlay = false; if(this.mainOverlay) this.mainOverlay.style.userSelect = ''; document.removeEventListener('mousemove', this.doDragOverlayBound); document.removeEventListener('mouseup', this.stopDragOverlayBound); }
    startResizeOverlay(e) { this.isResizingOverlay = true; this.mainOverlay.style.userSelect = 'none'; this.overlayDragStartX = e.clientX; this.overlayDragStartY = e.clientY; this.overlayOriginalWidth = this.mainOverlay.offsetWidth; this.overlayOriginalHeight = this.mainOverlay.offsetHeight; document.addEventListener('mousemove', this.doResizeOverlayBound); document.addEventListener('mouseup', this.stopResizeOverlayBound); }
    doResizeOverlay(e) { if (!this.isResizingOverlay || !this.mainOverlay) return; const newWidth = this.overlayOriginalWidth + (e.clientX - this.overlayDragStartX); const newHeight = this.overlayOriginalHeight + (e.clientY - this.overlayDragStartY); this.mainOverlay.style.width = Math.max(300, newWidth) + 'px'; this.mainOverlay.style.height = Math.max(150, newHeight) + 'px'; }
    stopResizeOverlay() { this.isResizingOverlay = false; if(this.mainOverlay) this.mainOverlay.style.userSelect = ''; document.removeEventListener('mousemove', this.doResizeOverlayBound); document.removeEventListener('mouseup', this.stopResizeOverlayBound); }
    toggleMaximizeOverlay() { if (!this.mainOverlay) return; if (this.mainOverlay.classList.contains('maximized')) { this.mainOverlay.classList.remove('maximized'); this.mainOverlay.style.width = this.overlayPreMaximizeWidth || '80vw'; this.mainOverlay.style.height = this.overlayPreMaximizeHeight || '70vh'; this.mainOverlay.style.top = this.overlayPreMaximizeTop || '50px'; this.mainOverlay.style.left = this.overlayPreMaximizeLeft || '50px'; } else { this.overlayPreMaximizeWidth = this.mainOverlay.style.width; this.overlayPreMaximizeHeight = this.mainOverlay.style.height; this.overlayPreMaximizeTop = this.mainOverlay.style.top; this.overlayPreMaximizeLeft = this.mainOverlay.style.left; this.mainOverlay.classList.add('maximized'); this.mainOverlay.style.width = '98vw'; this.mainOverlay.style.height = '95vh'; this.mainOverlay.style.top = '10px'; this.mainOverlay.style.left = '1vw'; } }


    createTechModal() {
        if (document.getElementById('techDetailModalOverlay')) return;
        const overlay = document.createElement('div'); overlay.id = 'techDetailModalOverlay'; overlay.className = 'tech-modal-overlay';
        overlay.addEventListener('click', (e) => { if (e.target === overlay) this.closeModal(); });
        const modalContent = document.createElement('div'); modalContent.className = 'tech-modal-content';
        modalContent.innerHTML = ` <div class="tech-modal-header" id="techModalHeader"> <h3>Technician / Company Details</h3> <button type="button" class="tech-modal-close" aria-label="Close">×</button> </div> <div class="tech-modal-body"> <div id="techModalScoreDisplay" class="overall-score-display" style="display:none;"></div> <div id="techModalDetailsGrid" class="tech-modal-detail-grid"></div> </div> <div class="tech-modal-footer"> <button id="prevTechBtn" class="tech-modal-nav-btn">« Previous</button> <span id="techCounter" style="margin: 0 10px;"></span> <button id="nextTechBtn" class="tech-modal-nav-btn">Next »</button> </div> `;
        overlay.appendChild(modalContent); document.body.appendChild(overlay);
        modalContent.querySelector('.tech-modal-header').addEventListener('mousedown', this.startDragTechModal.bind(this)); // Make header draggable
        overlay.querySelector('.tech-modal-close').addEventListener('click', () => this.closeModal());
        overlay.querySelector('#prevTechBtn').addEventListener('click', () => this.showPrevTech());
        overlay.querySelector('#nextTechBtn').addEventListener('click', () => this.showNextTech());
        console.log(`${this.SCRIPT_PREFIX} Tech details modal structure created.`);
    }

    startDragTechModal(e) { if (e.target.classList.contains('tech-modal-close')) return; this.techModalIsDragging = true; const modal = document.getElementById('techDetailModalOverlay'); modal.style.userSelect = 'none'; this.techModalDragStartX = e.clientX - modal.offsetLeft; this.techModalDragStartY = e.clientY - modal.offsetTop; document.addEventListener('mousemove', this.doDragTechModalBound); document.addEventListener('mouseup', this.stopDragTechModalBound); }
    doDragTechModal(e) { if (!this.techModalIsDragging) return; const modal = document.getElementById('techDetailModalOverlay'); modal.style.left = (e.clientX - this.techModalDragStartX) + 'px'; modal.style.top = (e.clientY - this.techModalDragStartY) + 'px'; }
    stopDragTechModal() { this.techModalIsDragging = false; const modal = document.getElementById('techDetailModalOverlay'); if(modal) modal.style.userSelect = ''; document.removeEventListener('mousemove', this.doDragTechModalBound); document.removeEventListener('mouseup', this.stopDragTechModalBound); }


    showTechDetailsModal(techFullDataWithScores, assignmentIdForModal, techIndexInAssignment) { /* ... Same as V10 ... */ }
    showPrevTech() { /* ... Same as V10 ... */ }
    showNextTech() { /* ... Same as V10 ... */ }
    closeModal() { /* ... Same as V10 ... */ }
    formatValue(value, key = '') { /* ... Same as V10 ... */ }
    waitForAssignmentsAndInitialize() { /* ... Same as V10 ... */ }
    attemptFallbackInitialization(observerInstance) { /* ... Same as V10 ... */ }
    async initializeTransformationSequence() { /* ... Same as V10 (targets this.mainOverlayContentTarget for renderTable) ... */ }

} // End of WorkMarketTransformer class

// --- Script Entry Point ---
try {
    if (typeof window.WorkMarketTransformerInstance !== 'undefined' && window.WorkMarketTransformerInstance !== null) {
        console.log(`${SCRIPT_PREFIX} Instance already exists. Not re-initializing.`);
    } else {
        if (document.getElementById('assignment_list_results') && (window.location.href.includes('/assignments') || window.location.href.includes('/workorders'))) {
            addStylesGlobal(customCss, SCRIPT_PREFIX); // Pass prefix for logging consistency
            modifyPageSizeSelectGlobal(SCRIPT_PREFIX);
            console.log(`${SCRIPT_PREFIX} Conditions met. Creating new WorkMarketTransformer instance.`);
            window.WorkMarketTransformerInstance = new WorkMarketTransformer();
        } else {
            console.log(`${SCRIPT_PREFIX} Not on a recognized assignments page or #assignment_list_results not found. Script will not run.`);
        }
    }
} catch (e) {
    console.error(`${SCRIPT_PREFIX} CRITICAL ERROR DURING SCRIPT EXECUTION:`, e);
}

})();
