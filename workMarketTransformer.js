// workMarketTransformer.js
import { parseFullDateToParts, parseLocationString, formatValue as utilFormatValue } from './utils.js'; // Renamed to avoid conflict
import { calculateOverallScore } from './scoreCalculator.js';
import { UIManager } from './uiManager.js';

export class WorkMarketTransformer {
    constructor(scriptPrefix) {
        this.SCRIPT_PREFIX = scriptPrefix;
        console.log(`${this.SCRIPT_PREFIX} Initializing WorkMarketTransformer class instance...`);

        this.originalResultsContainerSource = document.getElementById('assignment_list_results');
        this.tableData = [];
        this.currentSort = { column: 'timestamp', direction: 'desc' };
        this.activeTableHeaders = [];
        this.currentAssignmentTechsData = {};
        this.assignmentItemSelector = '.results-row.work';
        this.transformationInitialized = false;
        this.observer = null;

        if (!this.originalResultsContainerSource) {
            console.error(`${this.SCRIPT_PREFIX} CRITICAL ERROR: Source container #assignment_list_results not found. Aborting.`);
            return;
        }

        this.ui = new UIManager(this.SCRIPT_PREFIX);
        this.mainOverlayContentTarget = this.ui.getMainOverlayContentTarget();

        console.log(`${this.SCRIPT_PREFIX} Constructor finished. Setting up content observer/poller...`);
        this.waitForAssignmentsAndInitialize();
    }

    // Use imported utils, assigning to class properties if needed or just calling directly
    parseFullDateToParts = parseFullDateToParts;
    parseLocationString = parseLocationString;
    formatValue = utilFormatValue; // Use the imported and renamed one
    calculateOverallScore = calculateOverallScore;

    async fetchWorkerData(assignmentId) {
        if (!assignmentId) { console.warn(`${this.SCRIPT_PREFIX} No assignment ID for fetching workers.`); return { count: 0, applicantDetailsDisplay: 'No ID', top10TechsFullData: [] }; }
        const url = `/assignments/${assignmentId}/workers?start=0&limit=50&sortColumn=NEGOTIATION_CREATED_ON&sortDirection=DESC`;
        let responseText = '';
        try {
            const response = await fetch(url, { headers: { 'Accept': 'application/json, text/plain, */*', 'X-Requested-With': 'XMLHttpRequest' } });
            responseText = await response.text();
            if (!response.ok) { console.error(`${this.SCRIPT_PREFIX} API Call [ERROR] - Failed for ${assignmentId}: ${response.status} ${response.statusText}. Response Text:`, responseText); return { count: 0, applicantDetailsDisplay: `Error ${response.status}`, top10TechsFullData: [] };}
            const data = JSON.parse(responseText);
            let allFetchedWorkers = data.results || [];
            const totalFetchedInitially = allFetchedWorkers.length;
            const appliedWorkers = allFetchedWorkers.filter(w => {
                const isNotDeclined = w.declined_on === "";
                const hasActiveNegotiation = w.has_negotiation === true && w.negotiation !== null;
                // Adjust this 'hasApplied' based on precise API logic for your "applied" state
                const hasApplied = hasActiveNegotiation && w.status === "open";
                return isNotDeclined && hasApplied;
            });
            appliedWorkers.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
            const top10WorkersRaw = appliedWorkers.slice(0, 10);
            const top10TechsFullData = top10WorkersRaw.map(w => { const techWithScore = { ...w, assignmentId: assignmentId }; const scores = this.calculateOverallScore(techWithScore); return { ...techWithScore, ...scores }; });
            const listItems = top10WorkersRaw.map((tech, index) => { let displayName = ''; if (tech.company_name && tech.company_name.toLowerCase() === 'sole proprietor') { displayName = tech.name || tech.company_name || 'N/A'; } else { displayName = tech.company_name || 'N/A'; if (tech.name && tech.name.toLowerCase() !== tech.company_name.toLowerCase()) { displayName += ` (${tech.name})`; } } const distance = (tech.distance !== undefined ? parseFloat(tech.distance).toFixed(1) + ' mi' : 'N/A'); const totalCostValue = tech.negotiation?.pricing?.total_cost ?? tech.total_cost; const totalCostDisplay = totalCostValue !== undefined ? `$${parseFloat(totalCostValue).toFixed(2)}` : 'N/A'; const costClass = totalCostValue !== undefined ? 'cost-value' : 'cost-na'; return `<li><span class="tech-detail-link" data-assignment-id="${assignmentId}" data-tech-index="${index}">${displayName}</span> (${distance}, <span class="${costClass}">Cost: ${totalCostDisplay}</span>)</li>`; });
            const applicantDetailsDisplay = top10TechsFullData.length > 0 ? `<ul>${listItems.join('')}</ul>` : (totalFetchedInitially > 0 ? 'None met filter criteria' : 'No applicants found');
            return { count: appliedWorkers.length, applicantDetailsDisplay: applicantDetailsDisplay, top10TechsFullData: top10TechsFullData };
        } catch (error) { console.error(`${this.SCRIPT_PREFIX} API Call [EXCEPTION] - Error fetching/parsing worker data for ${assignmentId}:`, error); console.error(`${this.SCRIPT_PREFIX} API Call [EXCEPTION] - Response text was:`, responseText); return { count: 0, applicantDetailsDisplay: 'Fetch/Parse Exception', top10TechsFullData: [] }; }
    }

    async extractAssignmentsData(assignmentNodes) {
        if (assignmentNodes.length === 0) { console.warn(`${this.SCRIPT_PREFIX} extractAssignmentsData received 0 nodes.`); return []; }
        const assignmentsPromises = assignmentNodes.map(async (itemNode, index) => {
            const data = {}; const getText = (selector, baseNode = itemNode, trim = true) => { const el = baseNode.querySelector(selector); let text = el ? el.textContent : ''; return trim ? text.trim() : text; }; const getAttribute = (selector, attribute, baseNode = itemNode) => { const el = baseNode.querySelector(selector); return el ? el.getAttribute(attribute) : ''; };
            data.checkboxValue = getAttribute('.results-select input[type="checkbox"]', 'value'); const originalCheckbox = itemNode.querySelector('.results-select input[type="checkbox"]'); data.isChecked = originalCheckbox ? originalCheckbox.checked : false; const titleLinkEl = itemNode.querySelector('div[style="float: left;"] > strong > a'); data.title = titleLinkEl ? titleLinkEl.querySelector('.title').textContent.trim() : 'N/A'; data.detailsLink = titleLinkEl ? titleLinkEl.href : '#'; data.ariaLabel = titleLinkEl ? titleLinkEl.getAttribute('aria-label') : data.title;
            const statusNode = itemNode.querySelector('.status'); let statusCombined = ''; if (statusNode) { let simpleStatusText = statusNode.textContent.trim().replace(/\n+/g, ' ').replace(/\s+/g, ' '); if (simpleStatusText.length > 0 && simpleStatusText.length < 20 && !statusNode.querySelector('p strong') && !statusNode.querySelector('span.label')) { statusCombined = simpleStatusText; } else { const statusStrongEl = statusNode.querySelector('p strong'); const statusLabelEl = statusNode.querySelector('span.label'); let parts = []; if (statusStrongEl) parts.push(statusStrongEl.textContent.trim()); if (statusLabelEl) parts.push(statusLabelEl.textContent.trim()); statusCombined = parts.join(' - '); } } data.status = statusCombined || 'N/A'; const fullDateString = getText('.date small.meta span'); const dateParts = this.parseFullDateToParts(fullDateString); data.parsedDate = dateParts.date; data.parsedTime = dateParts.time; data.timestamp = dateParts.timestamp; const fullLocationString = getText('.location small.meta').replace(/\s+/g, ' '); const locationParts = this.parseLocationString(fullLocationString); data.city = locationParts.city; data.state = locationParts.state; data.zip = locationParts.zip; data.price = getText('.price small.meta'); data.priceNumeric = parseFloat(String(data.price).replace(/[^0-9.-]+/g, "")) || 0; data.siteName = ''; data.graniteTicket = ''; const workDetailsMetas = Array.from(itemNode.querySelectorAll('.work-details > small.meta')); workDetailsMetas.forEach(metaEl => { const text = metaEl.textContent.trim(); if (text.startsWith('Location:')) data.siteName = text.substring('Location:'.length).trim(); else if (text.startsWith('Granite Ticket Number:')) data.graniteTicket = text.substring('Granite Ticket Number:'.length).trim(); }); const labelNodes = Array.from(itemNode.querySelectorAll('.assignment_labels .label')); data.labels = labelNodes.map(ln => ln.textContent.trim()).join(', '); if (!data.labels) data.labels = ''; const assignIdHiddenEl = itemNode.querySelector('.assignmentId'); if (assignIdHiddenEl && assignIdHiddenEl.id) { data.assignmentId = assignIdHiddenEl.id; } else { const assignIdMetaText = getText('ul.assignment-actions li.fr em'); const matchId = assignIdMetaText.match(/Assign\. ID: (\d+)/); data.assignmentId = matchId ? matchId[1] : (data.checkboxValue || null); }
            const updatedInfoText = getText('ul.assignment-actions li.fr em'); if (updatedInfoText) { data.lastUpdateText = updatedInfoText.split('|')[0].trim(); if (data.lastUpdateText.toLowerCase().includes('wolfanger')) { data.lastUpdateText = ''; } } else { data.lastUpdateText = ''; }
            data.appliedCount = '...'; data.applicantDetailsDisplay = 'Loading...';
            if (data.assignmentId) { const workerInfo = await this.fetchWorkerData(data.assignmentId); data.appliedCount = workerInfo.count; data.applicantDetailsDisplay = workerInfo.applicantDetailsDisplay; this.currentAssignmentTechsData[data.assignmentId] = workerInfo.top10TechsFullData; }
            else { console.warn(`${this.SCRIPT_PREFIX} Assignment item ${index + 1} (Title: ${data.title.substring(0,30)}...) has no ID.`); data.appliedCount = 0; data.applicantDetailsDisplay = 'No ID'; this.currentAssignmentTechsData[data.assignmentId || `no_id_${index}`] = []; }
            return data;
        });
        const extractedData = await Promise.all(assignmentsPromises);
        return extractedData;
    }

    renderTable(dataToRender, headersToRender, targetContainer) {
        if (!targetContainer) { console.error(`${this.SCRIPT_PREFIX} renderTable: Target container is not defined or null.`); return; }
        targetContainer.innerHTML = ''; const table = document.createElement('table'); table.id = 'customAssignmentsTable_overlay'; table.className = 'custom-sortable-table'; const thead = table.createTHead(); const headerRow = thead.insertRow(); headersToRender.forEach(headerInfo => { const th = document.createElement('th'); th.className = headerInfo.className || ''; if (headerInfo.sortable) { th.dataset.column = headerInfo.key; th.dataset.type = headerInfo.type; th.dataset.sortKey = headerInfo.sortKey || headerInfo.key; th.innerHTML = `${headerInfo.name} <span class="sort-arrow"></span>`; th.addEventListener('click', () => this.handleSort(headerInfo.key)); } else { th.textContent = headerInfo.name; } headerRow.appendChild(th); }); const tbody = table.createTBody(); if (dataToRender.length === 0) { const row = tbody.insertRow(); const cell = row.insertCell(); cell.colSpan = headersToRender.length; cell.textContent = "No assignments found or processed."; cell.style.textAlign = "center"; cell.style.padding = "20px"; } else { dataToRender.forEach((item) => { const row = tbody.insertRow(); headersToRender.forEach(headerInfo => { const cell = row.insertCell(); cell.className = headerInfo.className || ''; if (item.applicantDetailsDisplay === 'Loading...' && (headerInfo.key === 'applicantDetailsDisplay' || headerInfo.key === 'appliedCount')) { cell.classList.add('loading-workers'); } if (headerInfo.key === 'checkbox') { const chk = document.createElement('input'); chk.type = 'checkbox'; chk.value = item.checkboxValue; chk.checked = item.isChecked; chk.name = "work_ids[]"; chk.id = `work_id_inj_overlay_${item.checkboxValue}`; cell.appendChild(chk); } else if (headerInfo.key === 'title') { const link = document.createElement('a'); link.href = item.detailsLink; link.textContent = item.title; link.setAttribute('aria-label', item.ariaLabel); link.className = 'tooltipped tooltipped-n'; cell.appendChild(link); } else if (headerInfo.key === 'applicantDetailsDisplay') { cell.innerHTML = item[headerInfo.key] || ''; cell.querySelectorAll('.tech-detail-link').forEach(link => { link.addEventListener('click', (e) => { e.preventDefault(); const assignmentId = e.target.dataset.assignmentId; const techIndex = parseInt(e.target.dataset.techIndex, 10); const techData = this.currentAssignmentTechsData[assignmentId]?.[techIndex]; if (techData) { this.ui.setCurrentTechModalNavContext(assignmentId, techIndex, () => this.showPrevTechInModal(), () => this.showNextTechInModal()); this.ui.displayTechModal(techData, item.title, techIndex, (this.currentAssignmentTechsData[assignmentId] || []).length, () => this.showPrevTechInModal(), () => this.showNextTechInModal(), this.formatValue.bind(this) ); } else { console.error('Tech data not found for modal:', assignmentId, techIndex, this.currentAssignmentTechsData); alert('Error: Detailed tech data not found.'); } }); }); } else { cell.textContent = item[headerInfo.key] !== undefined ? String(item[headerInfo.key]) : ''; } }); }); } targetContainer.appendChild(table); this.updateSortIndicators();
    }

    handleSort(columnKey) {
        const header = this.activeTableHeaders.find(h => h.key === columnKey); if (!header || !header.sortable) return;
        if (this.tableData.some(item => item.applicantDetailsDisplay === 'Loading...') && (columnKey === 'applicantDetailsDisplay' || columnKey === 'appliedCount')) { console.log(`${this.SCRIPT_PREFIX} Worker data still loading, please wait to sort these columns.`); return; }
        if (this.currentSort.column === columnKey) { this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc'; } else { this.currentSort.column = columnKey; this.currentSort.direction = 'asc'; }
        this.sortData(); if (this.mainOverlayContentTarget) { this.renderTable(this.tableData, this.activeTableHeaders, this.mainOverlayContentTarget); }
    }

    sortData() {
        const { column, direction } = this.currentSort; const header = this.activeTableHeaders.find(h => h.key === column); if (!header || !header.sortable) return; const sortKey = header.sortKey || column;
        this.tableData.sort((a, b) => { let valA = a[sortKey]; let valB = b[sortKey]; if (sortKey === 'applicantDetailsDisplay' || sortKey === 'appliedCount') { const errorOrLoadingValues = ['error', 'fetch error', 'no id', 'loading...', '...']; if (sortKey === 'appliedCount') { if (typeof valA === 'string' && errorOrLoadingValues.includes(String(valA).toLowerCase())) { } else valA = Number(valA); if (typeof valB === 'string' && errorOrLoadingValues.includes(String(valB).toLowerCase())) { } else valB = Number(valB); } const isValALoadingError = typeof valA === 'string' && errorOrLoadingValues.includes(valA.toLowerCase()); const isValBLoadingError = typeof valB === 'string' && errorOrLoadingValues.includes(valB.toLowerCase()); if (isValALoadingError && !isValBLoadingError) return direction === 'asc' ? 1 : -1; if (!isValALoadingError && isValBLoadingError) return direction === 'asc' ? -1 : 1; if (isValALoadingError && isValBLoadingError) { valA = String(valA || '').toLowerCase(); valB = String(valB || '').toLowerCase(); } } if (typeof valA === 'string' && sortKey !== 'timestamp' && !(typeof valA === 'number')) valA = (valA || '').toLowerCase(); if (typeof valB === 'string' && sortKey !== 'timestamp' && !(typeof valB === 'number')) valB = (valB || '').toLowerCase(); if (valA < valB) return direction === 'asc' ? -1 : 1; if (valA > valB) return direction === 'asc' ? 1 : -1; return 0; });
    }

    updateSortIndicators() {
        const table = document.getElementById('customAssignmentsTable_overlay'); if (!table) return; table.querySelectorAll('thead th .sort-arrow').forEach(arrow => arrow.className = 'sort-arrow'); const activeHeaderInfo = this.activeTableHeaders.find(h => h.key === this.currentSort.column); if (activeHeaderInfo && activeHeaderInfo.sortable) { const activeThArrow = table.querySelector(`thead th[data-column="${this.currentSort.column}"] .sort-arrow`); if (activeThArrow) activeThArrow.classList.add(this.currentSort.direction); }
    }

    showPrevTechInModal() {
        if (this.ui.currentModalAssignmentId && this.ui.currentModalTechIndex > 0) {
            this.ui.currentModalTechIndex--;
            const techData = this.currentAssignmentTechsData[this.ui.currentModalAssignmentId]?.[this.ui.currentModalTechIndex];
            if (techData) this.ui.displayTechModal(techData, this.tableData.find(a => a.assignmentId === this.ui.currentModalAssignmentId)?.title, this.ui.currentModalTechIndex, (this.currentAssignmentTechsData[this.ui.currentModalAssignmentId] || []).length, () => this.showPrevTechInModal(), () => this.showNextTechInModal(), this.formatValue.bind(this));
        }
    }
    showNextTechInModal() {
        const techsForCurrentAssignment = this.currentAssignmentTechsData[this.ui.currentModalAssignmentId] || [];
        if (this.ui.currentModalAssignmentId && this.ui.currentModalTechIndex < techsForCurrentAssignment.length - 1) {
            this.ui.currentModalTechIndex++;
            const techData = techsForCurrentAssignment[this.ui.currentModalTechIndex];
            if (techData) this.ui.displayTechModal(techData, this.tableData.find(a => a.assignmentId === this.ui.currentModalAssignmentId)?.title, this.ui.currentModalTechIndex, techsForCurrentAssignment.length, () => this.showPrevTechInModal(), () => this.showNextTechInModal(), this.formatValue.bind(this));
        }
    }


    waitForAssignmentsAndInitialize() {
        console.log(`${this.SCRIPT_PREFIX} Inside waitForAssignmentsAndInitialize. Watching container:`, this.originalResultsContainerSource);
        if (this.transformationInitialized) { console.log(`${this.SCRIPT_PREFIX} Transformation already ran.`); return; }
        if (!this.originalResultsContainerSource) { console.error(`${this.SCRIPT_PREFIX} originalResultsContainerSource is null!`); return; }
        if (this.originalResultsContainerSource.querySelector(this.assignmentItemSelector)) {
            console.log(`${this.SCRIPT_PREFIX} Assignment items found on IMMEDIATE check inside waitForAssignments.`);
            if (!this.transformationInitialized) { this.transformationInitialized = true; this.initializeTransformationSequence().catch(err => console.error(`${this.SCRIPT_PREFIX} Error (immediate init):`, err)); }
            return;
        }
        this.observer = new MutationObserver((mutationsList, obs) => { if (this.transformationInitialized) { obs.disconnect(); this.observer = null; return; } if (this.originalResultsContainerSource.querySelector(this.assignmentItemSelector)) { console.log(`${this.SCRIPT_PREFIX} Assignment items DETECTED by MutationObserver.`); obs.disconnect(); this.observer = null; if (!this.transformationInitialized) { this.transformationInitialized = true; this.initializeTransformationSequence().catch(err => console.error(`${this.SCRIPT_PREFIX} Error (observer init):`, err)); } } });
        try { this.observer.observe(this.originalResultsContainerSource, { childList: true, subtree: true }); console.log(`${this.SCRIPT_PREFIX} MutationObserver started.`); }
        catch (e) { console.error(`${this.SCRIPT_PREFIX} ERROR starting MutationObserver:`, e); this.observer = null; this.attemptFallbackInitializationPolling(null); return; }
        setTimeout(() => { if (!this.transformationInitialized) { this.attemptFallbackInitializationPolling(this.observer); } }, 2000);
    }

    attemptFallbackInitializationPolling(observerInstance) {
        if (this.transformationInitialized) { if (observerInstance) observerInstance.disconnect(); return; }
        console.log(`${this.SCRIPT_PREFIX} Starting fallback polling.`);
        let pollAttempts = 0; const maxPollAttempts = 20; const pollInterval = 500;
        const pollForItems = () => {
            if (this.transformationInitialized) { if (observerInstance) observerInstance.disconnect(); return; }
            pollAttempts++;
            if (this.originalResultsContainerSource.querySelector(this.assignmentItemSelector)) {
                console.log(`${this.SCRIPT_PREFIX} Assignment items FOUND by polling (attempt #${pollAttempts}).`);
                if (observerInstance) observerInstance.disconnect(); this.transformationInitialized = true;
                this.initializeTransformationSequence().catch(err => console.error(`${this.SCRIPT_PREFIX} Error (polling init):`, err));
            } else if (pollAttempts < maxPollAttempts) { setTimeout(pollForItems, pollInterval); }
            else { console.warn(`${this.SCRIPT_PREFIX} Max polling attempts reached. Items NOT FOUND using "${this.assignmentItemSelector}". HTML:`, this.originalResultsContainerSource.innerHTML.substring(0, 1000) + "..."); if (this.mainOverlayContentTarget) { this.renderTable([], this.activeTableHeaders, this.mainOverlayContentTarget); if(this.ui.mainOverlay) this.ui.showMainOverlay(); } }
        };
        pollForItems();
    }

    async initializeTransformationSequence() {
        console.log(`${this.SCRIPT_PREFIX} Starting main transformation sequence...`);
        if (!this.originalResultsContainerSource) { console.error(`${this.SCRIPT_PREFIX} #assignment_list_results source is null. Aborting.`); return; }
        if (!this.mainOverlayContentTarget) { console.error(`${this.SCRIPT_PREFIX} Main overlay content target is not defined. Aborting.`); return; }
        this.activeTableHeaders = [ { key: 'checkbox', name: '', type: 'control', sortable: false, className: 'col-checkbox' }, { key: 'title', name: 'Title', type: 'string', sortable: true, className: 'col-title' }, { key: 'status', name: 'Status', type: 'string', sortable: true, className: 'col-status' }, { key: 'appliedCount', name: '#Apld', type: 'number', sortable: true, className: 'col-applied-count' }, { key: 'applicantDetailsDisplay', name: 'Top Applicants', type: 'string', sortable: true, className: 'col-applicant-display' }, { key: 'parsedDate', name: 'Date', type: 'date', sortable: true, sortKey: 'timestamp', className: 'col-parsed-date' }, { key: 'parsedTime', name: 'Time', type: 'string', sortable: true, sortKey: 'timestamp', className: 'col-parsed-time' }, { key: 'siteName', name: 'Site Name', type: 'string', sortable: true, className: 'col-site-name' }, { key: 'city', name: 'City', type: 'string', sortable: true, className: 'col-city' }, { key: 'state', name: 'ST', type: 'string', sortable: true, className: 'col-state' }, { key: 'zip', name: 'Zip', type: 'string', sortable: true, className: 'col-zip' }, { key: 'price', name: 'Price', type: 'number', sortable: true, sortKey: 'priceNumeric', className: 'col-price-col' }, { key: 'labels', name: 'Labels', type: 'string', sortable: true, className: 'col-labels' }, { key: 'graniteTicket', name: 'Ticket #', type: 'string', sortable: true, className: 'col-ticket' }, { key: 'assignmentId', name: 'Assign. ID', type: 'string', sortable: true, className: 'col-assign-id' }, { key: 'lastUpdateText', name: 'Last Update', type: 'string', sortable: true, className: 'col-updated' } ];
        const originalAssignmentNodes = Array.from(this.originalResultsContainerSource.querySelectorAll(this.assignmentItemSelector));
        if (originalAssignmentNodes.length === 0) { console.warn(`${this.SCRIPT_PREFIX} No assignment items found with selector "${this.assignmentItemSelector}". HTML:`, this.originalResultsContainerSource.innerHTML.substring(0, 500) + "..."); this.renderTable([], this.activeTableHeaders, this.mainOverlayContentTarget); if(this.ui.mainOverlay) this.ui.showMainOverlay(); return; }
        const initialTableData = originalAssignmentNodes.map(itemNode => { const data = {}; const getText = (selector) => itemNode.querySelector(selector)?.textContent.trim() || ''; data.title = getText('div[style="float: left;"] > strong > a .title'); data.assignmentId = itemNode.querySelector('.assignmentId')?.id || getText('ul.assignment-actions li.fr em').match(/Assign\. ID: (\d+)/)?.[1]; data.applicantDetailsDisplay = 'Loading...'; data.appliedCount = '...'; const fullDateString = getText('.date small.meta span'); const dateParts = this.parseFullDateToParts(fullDateString); if (dateParts && typeof dateParts === 'object') { data.parsedDate = dateParts.date; data.parsedTime = dateParts.time; data.timestamp = dateParts.timestamp; } else { data.parsedDate = 'N/A'; data.parsedTime = 'N/A'; data.timestamp = 0; } return data; });
        this.tableData = initialTableData; this.sortData(); this.renderTable(this.tableData, this.activeTableHeaders, this.mainOverlayContentTarget); if(this.ui.mainOverlay) this.ui.showMainOverlay();
        this.tableData = await this.extractAssignmentsData(originalAssignmentNodes);
        if (this.tableData.length === 0 && originalAssignmentNodes.length > 0) { console.warn(`${this.SCRIPT_PREFIX} Original nodes were found, but full extraction resulted in 0 items.`); }
        const defaultSortHeader = this.activeTableHeaders.find(h => h.key === this.currentSort.column && h.sortable); if (!defaultSortHeader) { const firstSortableColumn = this.activeTableHeaders.find(h => h.sortable); if (firstSortableColumn) { this.currentSort.column = firstSortableColumn.key; this.currentSort.direction = (firstSortableColumn.type === 'date' || firstSortableColumn.type === 'number') ? 'desc' : 'asc'; } } else { if (this.currentSort.column === 'timestamp') { const dateHeader = this.activeTableHeaders.find(h => h.sortKey === 'timestamp'); if (dateHeader) this.currentSort.column = dateHeader.key; } }
        this.sortData(); this.renderTable(this.tableData, this.activeTableHeaders, this.mainOverlayContentTarget);
        console.log(`${this.SCRIPT_PREFIX} All transformations complete. Final table rendered in overlay with ${this.tableData.length} assignments.`);
    }
} // End of WorkMarketTransformer class

// --- Script Entry Point ---
try {
    if (typeof window.WorkMarketTransformerInstance !== 'undefined' && window.WorkMarketTransformerInstance !== null) {
        console.log(`${SCRIPT_PREFIX} Instance already exists. Not re-initializing.`);
    } else {
        if (document.getElementById('assignment_list_results') &&
            (window.location.href.includes('/assignments') || window.location.href.includes('/workorders'))) {

            addStylesOnce(customCss, SCRIPT_PREFIX); // Global CSS
            modifyPageSizeSelectOnce(SCRIPT_PREFIX); // Global Select Modification

            console.log(`${SCRIPT_PREFIX} Global setup complete. Creating new WorkMarketTransformer instance.`);
            window.WorkMarketTransformerInstance = new WorkMarketTransformer(); // Create instance
        } else {
            console.log(`${SCRIPT_PREFIX} Not on a recognized assignments page or #assignment_list_results not found. Script will not run.`);
        }
    }
} catch (e) {
    console.error(`${SCRIPT_PREFIX} CRITICAL ERROR DURING SCRIPT EXECUTION:`, e);
}

})();
