(async function() {
    'use strict';
    const SCRIPT_PREFIX = '[WM TRANSFORMER V14-MODAL-UI]';
    console.log(`${SCRIPT_PREFIX} Script starting...`);

    // --- Global CSS String ---
    const customCss = `
        /* ... (Same as V12/V13, with potential minor tweaks if needed for new modal elements) ... */
        #assignment_list_results { font-family: Arial, sans-serif; }
        .custom-sortable-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.80em; box-shadow: 0 0 10px rgba(0,0,0,0.1); table-layout: auto; }
        .custom-sortable-table thead tr { background-color: #4A5568; color: #ffffff; text-align: left; }
        .custom-sortable-table th, .custom-sortable-table td { padding: 5px 6px; border: 1px solid #ddd; vertical-align: top; white-space: nowrap; }
        .custom-sortable-table td { white-space: normal; }
        .custom-sortable-table tbody tr:nth-of-type(even) { background-color: #f9f9f9; }
        .custom-sortable-table tbody tr:hover { background-color: #e9e9e9; }
        .custom-sortable-table th[data-column] { cursor: pointer; position: relative; }
        .custom-sortable-table th[data-column]:hover { background-color: #2D3748; }
        .custom-sortable-table th .sort-arrow { font-size: 0.8em; margin-left: 3px; display: inline-block; width: 1em; }
        .custom-sortable-table th .sort-arrow.asc::after { content: " \\25B2"; }
        .custom-sortable-table th .sort-arrow.desc::after { content: " \\25BC"; }
        .custom-sortable-table td a { color: #2b6cb0; text-decoration: none; }
        .custom-sortable-table td a:hover { text-decoration: underline; }
        .custom-sortable-table .col-checkbox { width: 25px; text-align: center; }
        .custom-sortable-table .col-title { min-width: 140px; white-space: normal; }
        .custom-sortable-table .col-status { min-width: 75px; }
        .custom-sortable-table .col-parsed-date { min-width: 65px; }
        .custom-sortable-table .col-parsed-time { min-width: 65px; }
        .custom-sortable-table .col-site-name { min-width: 120px; white-space: normal; }
        .custom-sortable-table .col-city { min-width: 70px; }
        .custom-sortable-table .col-state { min-width: 30px; }
        .custom-sortable-table .col-zip { min-width: 45px; }
        .custom-sortable-table .col-price-col { min-width: 55px; text-align: right;}
        .custom-sortable-table .col-applied-count { min-width: 40px; text-align: center; }
        .custom-sortable-table .col-applicant-display { min-width: 220px; white-space: normal; font-size: 0.9em; line-height: 1.3;}
        .custom-sortable-table .col-applicant-display ul { margin: 0; padding-left: 15px; list-style-type: disc; }
        .custom-sortable-table .col-applicant-display li { margin-bottom: 3px; }
        .custom-sortable-table .col-labels { min-width: 100px; white-space: normal; }
        .custom-sortable-table .col-ticket { min-width: 70px; }
        .custom-sortable-table .col-assign-id { min-width: 65px; }
        .custom-sortable-table .col-updated { min-width: 100px; }
        .custom-sortable-table .loading-workers { font-style: italic; color: #777; }
        .tech-detail-link { color: #007bff; text-decoration: none; cursor: pointer; }
        .tech-detail-link:hover { text-decoration: underline; }
        .cost-na { color: green; font-weight: bold; }
        .cost-value { color: red; font-weight: bold; }
        .wm-transformer-overlay { position: fixed; top: 20px; left: 1%; width: 98%; height: calc(100vh - 40px); max-width: none; max-height: none; background-color: #f8f9fa; border: 1px solid #ccc; box-shadow: 0 5px 15px rgba(0,0,0,0.2); z-index: 9998; display: none; flex-direction: column; border-radius: 8px; overflow: hidden; box-sizing: border-box; }
        .wm-transformer-overlay.minimized { height: 40px !important; width: 280px !important; bottom: 0; top: auto; left: 20px; overflow: hidden; }
        .wm-transformer-overlay.minimized .overlay-content, .wm-transformer-overlay.minimized .overlay-resize-handle { display: none; }
        .wm-transformer-overlay.maximized-true { top: 5px !important; left: 5px !important; width: calc(100vw - 10px) !important; height: calc(100vh - 10px) !important; border-radius: 0; }
        .overlay-header { background-color: #343a40; color: white; padding: 8px 12px; cursor: move; display: flex; justify-content: space-between; align-items: center; border-top-left-radius: 7px; border-top-right-radius: 7px; height: 40px; box-sizing: border-box; }
        .overlay-header span { font-weight: bold; }
        .overlay-controls button { background: none; border: none; color: white; font-size: 16px; margin-left: 8px; cursor: pointer; padding: 2px 5px; }
        .overlay-controls button:hover { background-color: rgba(255,255,255,0.2); }
        .overlay-content { padding: 10px; flex-grow: 1; overflow: auto; background-color: white; }
        .overlay-resize-handle { width: 15px; height: 15px; background-color: #ddd; position: absolute; right: 0; bottom: 0; cursor: nwse-resize; }
        .tech-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); display: none; justify-content: center; align-items: center; z-index: 10000; padding: 15px; box-sizing: border-box;}
        .tech-modal-content { background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); width: 100%; max-width: 800px; max-height: 90vh; overflow-y: auto; position: relative; font-size: 0.9rem; display: flex; flex-direction: column;}
        .tech-modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px; cursor: move; }
        .tech-modal-assignment-link { font-size: 0.8em; margin-bottom:10px; display:block; text-align:center; }
        .tech-modal-header h3 { margin: 0; flex-grow: 1; text-align: center; }
        .tech-modal-close { font-size: 28px; font-weight: bold; color: #777; cursor: pointer; line-height: 1; background: none; border: none; padding: 0;}
        .tech-modal-close:hover { color: #333; }
        .tech-modal-body { flex-grow: 1; overflow-y: auto; padding-right: 10px; }
        .tech-modal-detail-grid { display: grid; grid-template-columns: minmax(220px, auto) 1fr; /* Wider label column */ gap: 5px 10px; font-size: 0.9em;}
        .tech-modal-detail-grid dt { font-weight: bold; color: #444; padding-right: 10px; text-align: right; overflow-wrap: break-word; word-break: break-all;}
        .tech-modal-detail-grid dd { margin-left: 0; overflow-wrap: break-word; word-break: break-all;}
        .tech-modal-detail-grid .section-header-dt { grid-column: 1 / -1; background-color: #e9ecef; color: #495057; padding: 6px 8px; margin-top: 12px; font-weight: bold; border-radius: 3px; text-align: left; }
        .tech-modal-detail-grid .sub-section-dt { grid-column: 1 / -1; background-color: #f8f9fa; color: #333; padding: 4px 8px; margin-top: 6px; font-style: italic; border-radius: 2px; text-align: left; padding-left: 15px; }
        .tech-modal-detail-grid dd.value-yes { color: green; font-weight: bold; } /* For "Is Best Price: Yes" */
        .tech-modal-footer { border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px; text-align: right; }
        .tech-modal-nav-btn { padding: 8px 12px; margin-left: 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .tech-modal-nav-btn:disabled { background-color: #ccc; cursor: not-allowed; }
        .tech-modal-nav-btn:hover:not(:disabled) { background-color: #0056b3; }
        .overall-score-display { font-size: 1.1em; font-weight: bold; color: #17a2b8; margin-bottom: 10px; text-align: center; padding: 5px; background-color: #f8f9fa; border-radius: 4px;}
    `;

    function addStylesOnce(cssString, scriptPrefix) { /* ... same ... */ }
    function modifyPageSizeSelectOnce(scriptPrefix) { /* ... same ... */ }

class WorkMarketTransformer {
    // ... (Constructor and other methods like parseFullDateToParts, parseLocationString, API fetch, extract, table rendering, sorting, main overlay methods remain largely the same as V12.FINAL_FULL_CODE / V9.FULL_FIX) ...
    // Ensure these methods are complete. I'll only show the modified methods below.

    constructor() {
        this.SCRIPT_PREFIX = SCRIPT_PREFIX; // Use the global SCRIPT_PREFIX
        console.log(`${this.SCRIPT_PREFIX} Initializing WorkMarketTransformer class instance...`);

        this.originalResultsContainerSource = document.getElementById('assignment_list_results');
        this.tableData = [];
        this.currentSort = { column: 'timestamp', direction: 'desc' };
        this.activeTableHeaders = [];
        this.currentAssignmentTechsData = {};
        this.currentModalAssignmentId = null;
        this.currentModalTechIndex = -1;
        this.assignmentItemSelector = '.results-row.work';
        this.transformationInitialized = false;
        this.observer = null;

        this.mainOverlay = null;
        this.mainOverlayContentTarget = null;
        this.isDraggingOverlay = false; this.isResizingOverlay = false;
        this.overlayDragStartX = 0; this.overlayDragStartY = 0;
        this.overlayOriginalWidth = 0; this.overlayOriginalHeight = 0;
        this.overlayIsMaximized = false;
        this.overlayPreMaximizeDimensions = {};

        this.techModalIsDragging = false; this.techModalDragStartX = 0; this.techModalDragStartY = 0;

        this.doDragOverlayBound = this.doDragOverlay.bind(this);
        this.stopDragOverlayBound = this.stopDragOverlay.bind(this);
        this.doResizeOverlayBound = this.doResizeOverlay.bind(this);
        this.stopResizeOverlayBound = this.stopResizeOverlay.bind(this);
        this.doDragTechModalBound = this.doDragTechModal.bind(this);
        this.stopDragTechModalBound = this.stopDragTechModal.bind(this);

        if (!this.originalResultsContainerSource) {
            console.error(`${this.SCRIPT_PREFIX} CRITICAL ERROR: Source container #assignment_list_results not found. Aborting class initialization.`);
            return;
        }
        this.createMainOverlay();
        this.createTechModal();
        console.log(`${this.SCRIPT_PREFIX} Constructor finished. Setting up content observer/poller...`);
        this.waitForAssignmentsAndInitialize();
    }

    parseFullDateToParts(dateString) { if (!dateString) return { date: '', time: '', timezone: '', timestamp: 0 }; const parts = { date: '', time: '', timezone: '', timestamp: 0 }; const match = dateString.match(/(\w{3})\s(\d{1,2})\s(\d{1,2}:\d{2}\s(?:AM|PM))\s*(\w{3})?/); if (match) { parts.date = `${match[1]} ${match[2]}`; parts.time = match[3]; parts.timezone = match[4] || ''; } else { const dateParts = dateString.split(' '); if (dateParts.length >= 2) parts.date = `${dateParts[0]} ${dateParts[1]}`; if (dateParts.length >= 4) parts.time = `${dateParts[2]} ${dateParts[3]}`; } const cleanedDateString = dateString.replace(/\s*(MST|PST|PDT|EST|EDT|CST|CDT|UTC)/, '').trim(); let ts = Date.parse(cleanedDateString); if (isNaN(ts) && match) { const year = new Date().getFullYear(); ts = Date.parse(`${match[1]} ${match[2]}, ${year} ${match[3]}`); } parts.timestamp = isNaN(ts) ? 0 : ts; return parts; }
    parseLocationString(locationString) { if (!locationString) return { city: '', state: '', zip: '' }; const parts = { city: '', state: '', zip: '' }; const regex = /^(.*?),\s*([A-Za-z]{2})\s*([A-Za-z0-9\s-]{3,10})$/; const match = locationString.match(regex); if (match) { parts.city = match[1].trim(); parts.state = match[2].trim().toUpperCase(); parts.zip = match[3].trim().toUpperCase(); } else { const commaParts = locationString.split(','); if (commaParts.length > 0) parts.city = commaParts[0].trim(); if (commaParts.length > 1) { const stateZipPart = commaParts[1].trim(); const spaceParts = stateZipPart.split(/\s+/); if (spaceParts.length > 0 && spaceParts[0].length === 2 && /^[A-Za-z]+$/.test(spaceParts[0])) { parts.state = spaceParts[0].toUpperCase(); if (spaceParts.length > 1) parts.zip = spaceParts.slice(1).join(' '); } else { parts.zip = stateZipPart; } } } return parts; }

    async fetchWorkerData(assignmentId) {
        // ... (Same as V12, focusing on the hasApplied filter for correctness) ...
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
                // Filter based on 'has_negotiation' and existing 'negotiation' object from sample JSON
                const hasActiveNegotiation = w.has_negotiation === true && w.negotiation !== null;
                // And the top-level 'status' is 'open' (meaning the invitation to them is still active)
                const hasApplied = hasActiveNegotiation && w.status === "open";
                return isNotDeclined && hasApplied;
            });

            appliedWorkers.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
            const top10WorkersRaw = appliedWorkers.slice(0, 10);

            const top10TechsFullData = top10WorkersRaw.map(w => {
                const techWithScore = { ...w, assignmentId: assignmentId };
                const scores = this.calculateOverallScore(techWithScore);
                return { ...techWithScore, ...scores };
            });

            const listItems = top10WorkersRaw.map((tech, index) => {
                let displayName = ''; if (tech.company_name && tech.company_name.toLowerCase() === 'sole proprietor') { displayName = tech.name || tech.company_name || 'N/A'; } else { displayName = tech.company_name || 'N/A'; if (tech.name && tech.name.toLowerCase() !== tech.company_name.toLowerCase()) { displayName += ` (${tech.name})`; } }
                const distance = (tech.distance !== undefined ? parseFloat(tech.distance).toFixed(1) + ' mi' : 'N/A');
                const totalCostValue = tech.negotiation?.pricing?.total_cost;
                const totalCostDisplay = totalCostValue !== undefined ? `$${parseFloat(totalCostValue).toFixed(2)}` : 'N/A';
                const costClass = totalCostValue !== undefined ? 'cost-value' : 'cost-na';
                return `<li><span class="tech-detail-link" data-assignment-id="${assignmentId}" data-tech-index="${index}">${displayName}</span> (${distance}, <span class="${costClass}">Cost: ${totalCostDisplay}</span>)</li>`;
            });
            const applicantDetailsDisplay = top10TechsFullData.length > 0 ? `<ul>${listItems.join('')}</ul>` : (totalFetchedInitially > 0 ? 'None met filter criteria' : 'No applicants found');
            return { count: appliedWorkers.length, applicantDetailsDisplay: applicantDetailsDisplay, top10TechsFullData: top10TechsFullData };
        } catch (error) { console.error(`${this.SCRIPT_PREFIX} API Call [EXCEPTION] - Error fetching/parsing worker data for ${assignmentId}:`, error); console.error(`${this.SCRIPT_PREFIX} API Call [EXCEPTION] - Response text was:`, responseText); return { count: 0, applicantDetailsDisplay: 'Fetch/Parse Exception', top10TechsFullData: [] }; }
    }

    calculateOverallScore(techData, assignmentBudget = 350) { /* ... (Same as V10, ensure all paths are correct for your JSON) ... */
        let CS = 50, DS = 0, SS = 50, OS = 0;
        const totalCost = techData.negotiation?.pricing?.total_cost;
        if (totalCost !== undefined && totalCost !== null) { CS = Math.max(0, (1 - (parseFloat(totalCost) / assignmentBudget)) * 100); }
        const distance = techData.distance;
        if (distance !== undefined && distance !== null) { if (distance <= 40) { DS = Math.max(0, (1 - (distance / 80)) * 100); } else if (distance <= 60) { DS = 20; } else if (distance <= 80) { DS = 10; } else { DS = 0; } }
        let CPS_Final = 50; const rscCompany = techData.resource_scorecard_for_company?.values; const rscIndividual = techData.resource_scorecard;
        if (rscCompany) { const compCompletedNet90 = rscCompany.COMPLETED_WORK?.net90; if (compCompletedNet90 !== undefined && compCompletedNet90 !== null && compCompletedNet90 > 0) { const satNet90 = rscCompany.SATISFACTION_OVER_ALL?.net90 || 0; const onTimeNet90 = rscCompany.ON_TIME_PERCENTAGE?.net90 || 0; const reliabilityNet90Factor = Math.min(1, (compCompletedNet90 || 0) / 5); const negNet90Count = (rscCompany.CANCELLED_WORK?.net90 || 0) + (rscCompany.LATE_WORK?.net90 || 0) + (rscCompany.ABANDONED_WORK?.net90 || 0); CPS_Final = ((satNet90 * 0.45) + (onTimeNet90 * 0.35) + (reliabilityNet90Factor * 0.20) - (negNet90Count * 0.10)) * 100; } else if (rscCompany.COMPLETED_WORK?.all !== undefined && rscCompany.COMPLETED_WORK?.all > 0) { const satAll = rscCompany.SATISFACTION_OVER_ALL?.all || 0; const onTimeAll = rscCompany.ON_TIME_PERCENTAGE?.all || 0; const reliabilityAllFactor = Math.min(1, (rscCompany.COMPLETED_WORK?.all || 0) / 5); const negAllCount = (rscCompany.CANCELLED_WORK?.all || 0) + (rscCompany.LATE_WORK?.all || 0) + (rscCompany.ABANDONED_WORK?.all || 0); const CPS_All_Raw = ((satAll * 0.45) + (onTimeAll * 0.35) + (reliabilityAllFactor * 0.20) - (negAllCount * 0.10)) * 100; CPS_Final = CPS_All_Raw * 0.85; } }
        let IPS = 50; if (rscIndividual?.rating && rscIndividual?.values) { if (rscIndividual.rating.count > 0) { const satInd = rscIndividual.rating.satisfactionRate || 0; const onTimeInd = rscIndividual.values.ON_TIME_PERCENTAGE?.all || 0; const reliabilityIndFactor = Math.min(1, (rscIndividual.rating.count || 0) / 50); const negIndCount = (rscIndividual.values.CANCELLED_WORK?.all || 0) + (rscIndividual.values.LATE_WORK?.all || 0) + (rscIndividual.values.ABANDONED_WORK?.all || 0); IPS = ((satInd * 0.40) + (onTimeInd * 0.30) + (reliabilityIndFactor * 0.30) - (negIndCount * 0.02)) * 100; } } else if (techData.new_user === true) { IPS = 50; }
        if (rscCompany?.COMPLETED_WORK?.net90 > 0) { SS = (CPS_Final * 0.80) + (IPS * 0.20); } else if (rscCompany?.COMPLETED_WORK?.all > 0) { SS = (CPS_Final * 0.65) + (IPS * 0.35); } else { SS = IPS; }
        SS = Math.max(0, Math.min(100, SS)); CPS_Final = Math.max(0, Math.min(100, CPS_Final)); IPS = Math.max(0, Math.min(100, IPS)); CS = Math.max(0, Math.min(100, CS)); DS = Math.max(0, Math.min(100, DS));
        OS = (CS * 0.30) + (DS * 0.15) + (SS * 0.55); OS = Math.max(0, Math.min(100, OS));
        return { OverallScore: OS.toFixed(2), CostScore: CS.toFixed(2), DistanceScore: DS.toFixed(2), StatsScore: SS.toFixed(2), CPS_Final: CPS_Final.toFixed(2), IPS: IPS.toFixed(2) };
    }

    async extractAssignmentsData(assignmentNodes) {
        if (assignmentNodes.length === 0) { return []; }
        const assignmentsPromises = assignmentNodes.map(async (itemNode, index) => {
            const data = {}; const getText = (selector, baseNode = itemNode, trim = true) => { const el = baseNode.querySelector(selector); let text = el ? el.textContent : ''; return trim ? text.trim() : text; }; const getAttribute = (selector, attribute, baseNode = itemNode) => { const el = baseNode.querySelector(selector); return el ? el.getAttribute(attribute) : ''; };
            data.checkboxValue = getAttribute('.results-select input[type="checkbox"]', 'value'); data.isChecked = itemNode.querySelector('.results-select input[type="checkbox"]')?.checked || false;
            const titleLinkEl = itemNode.querySelector('div[style="float: left;"] > strong > a'); data.title = titleLinkEl ? titleLinkEl.querySelector('.title').textContent.trim() : 'N/A'; data.detailsLink = titleLinkEl ? titleLinkEl.href : '#';
            const statusNode = itemNode.querySelector('.status'); let statusCombined = ''; if (statusNode) { let simpleStatusText = statusNode.textContent.trim().replace(/\n+/g, ' ').replace(/\s+/g, ' '); if (simpleStatusText.length > 0 && simpleStatusText.length < 20 && !statusNode.querySelector('p strong') && !statusNode.querySelector('span.label')) { statusCombined = simpleStatusText; } else { const statusStrongEl = statusNode.querySelector('p strong'); const statusLabelEl = statusNode.querySelector('span.label'); let parts = []; if (statusStrongEl) parts.push(statusStrongEl.textContent.trim()); if (statusLabelEl) parts.push(statusLabelEl.textContent.trim()); statusCombined = parts.join(' - '); } } data.status = statusCombined || 'N/A';
            const fullDateString = getText('.date small.meta span'); const dateParts = this.parseFullDateToParts(fullDateString); data.parsedDate = dateParts.date; data.parsedTime = dateParts.time; data.timestamp = dateParts.timestamp;
            const fullLocationString = getText('.location small.meta').replace(/\s+/g, ' '); const locationParts = this.parseLocationString(fullLocationString); data.city = locationParts.city; data.state = locationParts.state; data.zip = locationParts.zip;
            data.price = getText('.price small.meta'); data.priceNumeric = parseFloat(String(data.price).replace(/[^0-9.-]+/g, "")) || 0;
            data.siteName = ''; data.graniteTicket = ''; const workDetailsMetas = Array.from(itemNode.querySelectorAll('.work-details > small.meta')); workDetailsMetas.forEach(metaEl => { const text = metaEl.textContent.trim(); if (text.startsWith('Location:')) data.siteName = text.substring('Location:'.length).trim(); else if (text.startsWith('Granite Ticket Number:')) data.graniteTicket = text.substring('Granite Ticket Number:'.length).trim(); });
            const labelNodes = Array.from(itemNode.querySelectorAll('.assignment_labels .label')); data.labels = labelNodes.map(ln => ln.textContent.trim()).join(', '); if (!data.labels) data.labels = '';
            const assignIdHiddenEl = itemNode.querySelector('.assignmentId'); if (assignIdHiddenEl && assignIdHiddenEl.id) { data.assignmentId = assignIdHiddenEl.id; } else { const assignIdMetaText = getText('ul.assignment-actions li.fr em'); const matchId = assignIdMetaText.match(/Assign\. ID: (\d+)/); data.assignmentId = matchId ? matchId[1] : (data.checkboxValue || null); }
            const updatedInfoText = getText('ul.assignment-actions li.fr em'); if (updatedInfoText) { data.lastUpdateText = updatedInfoText.split('|')[0].trim(); if (data.lastUpdateText.toLowerCase().includes('wolfanger')) { data.lastUpdateText = ''; } } else { data.lastUpdateText = ''; }
            data.appliedCount = '...'; data.applicantDetailsDisplay = 'Loading...';
            if (data.assignmentId) { const workerInfo = await this.fetchWorkerData(data.assignmentId); data.appliedCount = workerInfo.count; data.applicantDetailsDisplay = workerInfo.applicantDetailsDisplay; this.currentAssignmentTechsData[data.assignmentId] = workerInfo.top10TechsFullData; }
            else { data.appliedCount = 0; data.applicantDetailsDisplay = 'No ID'; this.currentAssignmentTechsData[data.assignmentId || `no_id_${index}`] = []; }
            return data;
        });
        return Promise.all(assignmentsPromises);
    }

    renderTable(dataToRender, headersToRender, targetContainer) { /* ... Same as V12 ... */ }
    handleSort(columnKey) { /* ... Same as V12 ... */ }
    sortData() { /* ... Same as V12 ... */ }
    updateSortIndicators() { /* ... Same as V12 ... */ }
    createMainOverlay() { /* ... Same as V12 ... */ }
    startDragOverlay(e) { /* ... Same as V12 ... */ }
    doDragOverlay(e) { /* ... Same as V12 ... */ }
    stopDragOverlay() { /* ... Same as V12 ... */ }
    startResizeOverlay(e) { /* ... Same as V12 ... */ }
    doResizeOverlay(e) { /* ... Same as V12 ... */ }
    stopResizeOverlay() { /* ... Same as V12 ... */ }
    toggleMaximizeOverlay() { /* ... Same as V12 ... */ }
    createTechModal() { /* ... Same as V12 ... */ }
    startDragTechModal(e) { /* ... Same as V12 ... */ }
    doDragTechModal(e) { /* ... Same as V12 ... */ }
    stopDragTechModal() { /* ... Same as V12 ... */ }

    showTechDetailsModal(techFullDataWithScores, assignmentIdForModal, techIndexInAssignment) {
        this.currentModalAssignmentId = assignmentIdForModal;
        this.currentModalTechIndex = techIndexInAssignment;
        const techRawData = techFullDataWithScores; // This object now includes calculated scores

        console.log(`${this.SCRIPT_PREFIX} Showing modal for tech (Assign: ${assignmentIdForModal}, Index: ${techIndexInAssignment}):`, techRawData.company_name || techRawData.name);

        let modalOverlay = document.getElementById('techDetailModalOverlay');
        if (!modalOverlay) { this.createTechModal(); modalOverlay = document.getElementById('techDetailModalOverlay'); }
        const modalHeaderH3 = modalOverlay.querySelector('.tech-modal-header h3');
        const modalBody = modalOverlay.querySelector('.tech-modal-body');
        const detailsGrid = modalOverlay.querySelector('#techModalDetailsGrid');
        const scoreDisplay = modalOverlay.querySelector('#techModalScoreDisplay');

        detailsGrid.innerHTML = ''; // Clear previous details

        // Add Assignment Title Link at the top of the modal body
        let assignmentTitleLink = modalBody.querySelector('.tech-modal-assignment-link');
        if (!assignmentTitleLink) {
            assignmentTitleLink = document.createElement('div');
            assignmentTitleLink.className = 'tech-modal-assignment-link';
            modalBody.insertBefore(assignmentTitleLink, scoreDisplay); // Insert before score display
        }
        const currentAssignment = this.tableData.find(a => a.assignmentId === assignmentIdForModal);
        assignmentTitleLink.innerHTML = currentAssignment ? `<a href="${currentAssignment.detailsLink}" target="_blank">View Assignment: ${currentAssignment.title}</a>` : `Assignment ID: ${assignmentIdForModal}`;


        if (techRawData.OverallScore !== undefined) {
            scoreDisplay.innerHTML = `Overall Score: ${techRawData.OverallScore}
                <span style="font-size:0.8em; display:block;">(Cost: ${techRawData.CostScore}, Dist: ${techRawData.DistanceScore}, Stats: ${techRawData.StatsScore})</span>
                <span style="font-size:0.7em; display:block; color: #6c757d;">CPS: ${techRawData.CPS_Final}, IPS: ${techRawData.IPS}</span>`;
            scoreDisplay.style.display = 'block';
        } else {
            scoreDisplay.style.display = 'none';
        }

        const prevBtn = modalOverlay.querySelector('#prevTechBtn');
        const nextBtn = modalOverlay.querySelector('#nextTechBtn');
        const counter = modalOverlay.querySelector('#techCounter');
        const techsForCurrentAssignment = this.currentAssignmentTechsData[assignmentIdForModal] || [];
        prevBtn.disabled = techIndexInAssignment <= 0;
        nextBtn.disabled = techIndexInAssignment >= techsForCurrentAssignment.length - 1;
        counter.textContent = `${techIndexInAssignment + 1} of ${techsForCurrentAssignment.length}`;

        const renderKeyValuePair = (key, value, parentEl, isNested = false, path = '') => {
            const formattedValue = this.formatValue(value, key);

            // Conditional hiding based on value for specific keys
            const hideIfNoOrNA = ['question_pending', 'schedule_conflict', 'is_expired', 'is_schedule_negotiation', 'is_best_price', 'tiered_pricing_accepted'];
            if (hideIfNoOrNA.includes(key) && (formattedValue === 'No' || formattedValue === 'N/A')) return;
            if (key === 'declined_on' && formattedValue === 'N/A') return;
            if (formattedValue === 'N/A' && key !== 'declined_on') return; // General hide for N/A, except for specific cases like declined_on


            const dt = document.createElement('dt');
            dt.textContent = (key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())) + ':';
            if (isNested) dt.style.paddingLeft = '15px';

            const dd = document.createElement('dd');
            if (key === 'user_uuid') { dd.innerHTML = `<a href="https://www.workmarket.com/new-profile/${value}" target="_blank">${value}</a>`; }
            else if (key === 'email' && value) { const subject = encodeURIComponent(`Question regarding WO: ${currentAssignment?.title || this.currentModalAssignmentId || 'Assignment'}`); dd.innerHTML = `<a href="mailto:${value}?subject=${subject}&body=I have a question:">${value}</a>`; }
            else if ((key === 'work_phone' || key === 'mobile_phone') && value) { dd.innerHTML = `<a href="tel:${String(value).replace(/\D/g,'')}">${value}</a>`; }
            else if (key === 'address' && value) { dd.innerHTML = `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}" target="_blank">${value}</a>`; }
            else if (key === 'graniteTicket' && value && this.tableData.some(a => a.assignmentId === assignmentIdForModal && a.graniteTicket === value)) { // Assuming graniteTicket is from main assignment
                // You'll need a base URL for your ticket system
                // dd.innerHTML = `<a href="YOUR_TICKET_SYSTEM_BASE_URL/${value}" target="_blank">${value}</a>`;
                dd.textContent = formattedValue; // For now, just text
            } else {
                dd.textContent = formattedValue;
                if (key === 'is_best_price' && formattedValue === 'Yes') {
                    dd.classList.add('value-yes'); // For green color
                }
            }
            parentEl.appendChild(dt); parentEl.appendChild(dd);
        };

        const renderSection = (title, dataObject, parentEl, isTopLevelSection = true, keysToRenderSpecifically = null) => {
            if (!dataObject || Object.keys(dataObject).length === 0) {
                // If it's a top-level section we expected but it's empty (e.g., negotiation when has_negotiation is false)
                // we might choose to not render the header either, or render "None".
                // Current logic: if dataObject is empty, just returns.
                return;
            }

            if (isTopLevelSection) {
                const headerDt = document.createElement('dt');
                headerDt.className = 'section-header-dt';
                headerDt.textContent = title;
                parentEl.appendChild(headerDt);
            }

            const keysToIterate = keysToRenderSpecifically || Object.keys(dataObject);

            for (const key of keysToIterate) {
                if (dataObject.hasOwnProperty(key)) {
                    const value = dataObject[key];
                    // For scorecard values, directly render the 'all' property if it exists
                    if ((title.includes('Scorecard (For Your Company)') || title.includes('Scorecard (Overall Platform)')) && typeof value === 'object' && value !== null && value.hasOwnProperty('all')) {
                         renderKeyValuePair.call(this, key, value.all, parentEl, true, title + '.' + key);
                    }
                    // For pricing (nested under negotiation) or rating (nested under scorecard)
                    else if ((title === 'Negotiation Details' && key === 'pricing') || (title.includes('Scorecard') && key === 'rating')) {
                         if (value && typeof value === 'object') { // Ensure value is an object before rendering as section
                            renderSection.call(this, key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value, parentEl, false); // Render as a sub-section
                         }
                    }
                    // For direct properties within Negotiation (not pricing), or direct properties of Scorecard (not values/rating)
                    else if (title === 'Negotiation Details' || title.includes('Rating Details')) {
                        renderKeyValuePair.call(this, key, value, parentEl, true, title + '.' + key);
                    }
                    // Fallback for other direct properties in nested objects (like resource_scorecard_for_company.values)
                    else if (!isTopLevelSection && (typeof value !== 'object' || value === null)) {
                         renderKeyValuePair.call(this, key, value, parentEl, true, title + '.' + key);
                    }
                }
            }
        };

        // Render priority fields first
        priorityFields.forEach(pf => { if (techRawData.hasOwnProperty(pf.key)) { renderKeyValuePair.call(this, pf.key, techRawData[pf.key], detailsGrid, false, pf.key); } });

        // Conditional Negotiation Section
        if (techRawData.has_negotiation && techRawData.negotiation) {
            const negDetails = techRawData.negotiation;
            // Check if there's anything to show besides booleans that are all false for the main negotiation flags
            const negBooleans = ['is_expired', 'is_price_negotiation', 'is_schedule_negotiation', 'is_best_price', 'tiered_pricing_accepted'];
            const hasSignificantNegData = Object.keys(negDetails).some(k => {
                if (negBooleans.includes(k)) return negDetails[k] === true; // Only show if true
                if (k === 'pricing') return negDetails.pricing && Object.keys(negDetails.pricing).length > 0; // Show if pricing exists
                return negDetails[k] !== null && String(negDetails[k]).trim() !== ''; // Show other non-null/empty fields
            });

            if (hasSignificantNegData) {
                const negHeaderDt = document.createElement('dt'); negHeaderDt.className = 'section-header-dt'; negHeaderDt.textContent = 'Negotiation Details'; detailsGrid.appendChild(negHeaderDt);
                const negFieldsOrder = ['approval_status', 'requested_on_date', 'requested_on_fuzzy', 'note', 'is_expired', 'is_price_negotiation', 'is_schedule_negotiation', 'is_best_price', 'tiered_pricing_accepted'];
                negFieldsOrder.forEach(negKey => {
                    if (negDetails.hasOwnProperty(negKey)) {
                        renderKeyValuePair.call(this, negKey, negDetails[negKey], detailsGrid, true, 'negotiation.' + negKey);
                    }
                });
                if (negDetails.pricing) {
                    renderSection.call(this, 'Pricing', negDetails.pricing, detailsGrid, false); // Render pricing at the end of negotiation
                }
            }
        }


        // Render Scorecards
        if (techRawData.resource_scorecard_for_company) {
            if (techRawData.resource_scorecard_for_company.values) { renderSection.call(this, 'Scorecard (For Your Company)', techRawData.resource_scorecard_for_company.values, detailsGrid); }
            if (techRawData.resource_scorecard_for_company.rating) { renderSection.call(this, 'Company Rating Details', techRawData.resource_scorecard_for_company.rating, detailsGrid); }
        }
        if (techRawData.resource_scorecard) {
            if (techRawData.resource_scorecard.values) { renderSection.call(this, 'Scorecard (Overall Platform)', techRawData.resource_scorecard.values, detailsGrid); }
            if (techRawData.resource_scorecard.rating) { renderSection.call(this, 'Overall Rating Details', techRawData.resource_scorecard.rating, detailsGrid); }
        }

        // Render other remaining properties (already filtered by renderKeyValuePair for N/A)
        const keysAlreadyRenderedOrExcluded = [ /* ... same as V9 ... */ ];
        // ... (rest of other details rendering logic from V9, ensuring renderKeyValuePair.call(this) is used) ...

        modalOverlay.style.display = 'flex';
    }

    showPrevTech() { /* ... same as V9 ... */ }
    showNextTech() { /* ... same as V9 ... */ }
    closeModal() { /* ... same as V9 ... */ }

    formatValue(value, key = '') {
        if (value === null || value === undefined || String(value).trim() === '') return 'N/A';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';

        const lowerKey = key.toLowerCase();
        if (typeof value === 'number') {
            if (lowerKey.includes('price') || lowerKey.includes('cost') || lowerKey.includes('spend') || lowerKey.includes('fee')) {
                return `$${value.toFixed(2)}`;
            }
            if (lowerKey === 'distance') return `${value.toFixed(1)} miles`;
            // For scorecard percentages (usually 0-1 range from API)
            if ((lowerKey.includes('percentage') || lowerKey.includes('rate') || lowerKey.includes('ratio')) && !lowerKey.includes('rating')) { // Avoid formatting 'rating: 4.5' as percentage
                 if (value >= 0 && value <= 1.000001) { // Allow for slight floating point inaccuracies if value is 1.0
                    return `${(value * 100).toFixed(2)}%`;
                }
            }
            return value.toFixed(2); // Default for other numbers
        }
        return String(value);
    }


    waitForAssignmentsAndInitialize() { /* ... same as V9 ... */ }
    attemptFallbackInitializationPolling(observerInstance) { /* ... same as V9 ... */ }
    async initializeTransformationSequence() { /* ... same as V9 ... */ }

} // End of WorkMarketTransformer class

// --- Script Entry Point --- (Same as V12.SPLIT)
try {
    // Remove the instance check to always re-run
    // if (typeof window.WorkMarketTransformerInstance !== 'undefined' && window.WorkMarketTransformerInstance !== null) {
    //     console.log(`${SCRIPT_PREFIX} Instance already exists. Not re-initializing.`);
    // } else {
        if (document.getElementById('assignment_list_results') &&
            (window.location.href.includes('/assignments') || window.location.href.includes('/workorders'))) {

            addStylesOnce(customCss, SCRIPT_PREFIX);
            modifyPageSizeSelectOnce(SCRIPT_PREFIX);

            console.log(`${SCRIPT_PREFIX} Conditions met. Creating/Re-creating new WorkMarketTransformer instance.`);
            if (window.WorkMarketTransformerInstance && window.WorkMarketTransformerInstance.observer) {
                console.log(`${SCRIPT_PREFIX} Disconnecting previous observer.`);
                window.WorkMarketTransformerInstance.observer.disconnect();
                window.WorkMarketTransformerInstance.observer = null;
            }
            const oldOverlay = document.getElementById('wmTransformerOverlay');
            if (oldOverlay) oldOverlay.remove();
            const oldModal = document.getElementById('techDetailModalOverlay');
            if (oldModal) oldModal.remove();

            window.WorkMarketTransformerInstance = new WorkMarketTransformer();
        } else {
            console.log(`${SCRIPT_PREFIX} Not on a recognized assignments page or #assignment_list_results not found. Script will not run.`);
        }
    // }
} catch (e) {
    console.error(`${SCRIPT_PREFIX} CRITICAL ERROR DURING SCRIPT EXECUTION:`, e);
}

})();
