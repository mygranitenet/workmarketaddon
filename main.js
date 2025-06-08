(async function() {
    'use strict';
    const SCRIPT_PREFIX = '[WM TRANSFORMER V14.1COMPLETE]'; // Final version for this set of features
    console.log(`${SCRIPT_PREFIX} Script starting...`);

    // --- Global CSS String ---
    const customCss = `
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
        .overlay-filter-container { padding: 5px 10px; background-color: #f0f0f0; }
        .overlay-filter-input { width: 100%; box-sizing: border-box; padding: 4px 6px; margin-bottom: 6px; font-size: 0.9em; }
        .tech-detail-link { color: #007bff; text-decoration: none; cursor: pointer; }
        .tech-detail-link:hover { text-decoration: underline; }
        .cost-na { color: green; font-weight: bold; }
        .cost-value { color: red; font-weight: bold; }
        .value-yes { color: green; font-weight: bold; } /* For modal "Is Best Price: Yes" */

        /* Main Overlay Styles */
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

        /* Tech Modal Styles */
        .tech-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); display: none; justify-content: center; align-items: center; z-index: 10000; padding: 15px; box-sizing: border-box;}
        .tech-modal-content { background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); width: 100%; max-width: 800px; /* Wider for scores */ max-height: 90vh; overflow-y: auto; position: relative; font-size: 0.9rem; display: flex; flex-direction: column;}
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
        .tech-modal-footer { border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px; text-align: right; }
        .tech-modal-nav-btn { padding: 8px 12px; margin-left: 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .tech-modal-nav-btn:disabled { background-color: #ccc; cursor: not-allowed; }
        .tech-modal-nav-btn:hover:not(:disabled) { background-color: #0056b3; }
        .overall-score-display { font-size: 1.1em; font-weight: bold; color: #17a2b8; margin-bottom: 10px; text-align: center; padding: 5px; background-color: #f8f9fa; border-radius: 4px;}
    `;

    function addStylesOnce(cssString, scriptPrefix) {
        const styleId = 'customAssignmentsTableStyles_Global';
        if (document.getElementById(styleId)) { return; }
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = cssString;
        document.head.appendChild(styleElement);
        console.log(`${scriptPrefix} Global custom styles injected successfully.`);
    }

    function modifyPageSizeSelectOnce(scriptPrefix) {
        const pageSizeSelect = document.getElementById('assignment_list_size');
        if (pageSizeSelect) {
            console.log(`${scriptPrefix} Modifying #assignment_list_size select.`);
            const currentSelectedValue = pageSizeSelect.value; pageSizeSelect.innerHTML = ''; let isCurrentSelectedStillAvailable = false;
            for (let i = 100; i <= 1000; i += 50) { const option = document.createElement('option'); option.value = i; option.textContent = i; if (String(i) === currentSelectedValue) { option.selected = true; isCurrentSelectedStillAvailable = true; } pageSizeSelect.appendChild(option); }
            if (!isCurrentSelectedStillAvailable && pageSizeSelect.options.length > 0) { /* Potentially select first */ }
            console.log(`${scriptPrefix} #assignment_list_size select modified.`);
        } else { console.warn(`${scriptPrefix} Warning: Select element #assignment_list_size not found for modification.`); }
    }


class WorkMarketTransformer {
    constructor() {
        this.SCRIPT_PREFIX = SCRIPT_PREFIX;
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
        this.filterInput = null;
        this.filterQuery = '';
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
                // From your JSON, `status: "open"` is the invitation status.
                // `has_negotiation: true` AND a non-null `negotiation` object means they've interacted.
                const hasActiveNegotiation = w.has_negotiation === true && w.negotiation !== null;
                // Consider this "applied" for now. If `w.status` changes for applied users, incorporate that.
                const hasApplied = hasActiveNegotiation; // Removed && w.status === "open" as it might be too restrictive if status changes after interaction.
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

    calculateOverallScore(techData, assignmentBudget = 350) {
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
        if (assignmentNodes.length === 0) { console.warn(`${this.SCRIPT_PREFIX} extractAssignmentsData received 0 nodes. No data to process.`); return []; }
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
            else { console.warn(`${this.SCRIPT_PREFIX} Assignment item ${index + 1} (Title: ${data.title.substring(0,30)}...) has no ID.`); data.appliedCount = 0; data.applicantDetailsDisplay = 'No ID'; this.currentAssignmentTechsData[data.assignmentId || `no_id_${index}`] = []; }
            return data;
        });
        return Promise.all(assignmentsPromises);
    }

    renderTable(dataToRender, headersToRender, targetContainer) {
        if (!targetContainer) {
            console.error(`${this.SCRIPT_PREFIX} renderTable: Target container for table is not defined.`);
            return;
        }
        let filteredData = dataToRender;
        if (this.filterQuery) {
            const q = this.filterQuery;
            filteredData = dataToRender.filter(it => {
                return ['title','city','state','labels','assignmentId','siteName','status'].some(f => String(it[f] || '').toLowerCase().includes(q));
            });
        }
        targetContainer.innerHTML = '';
        const table = document.createElement('table');
        table.id = 'customAssignmentsTable_overlay';
        table.className = 'custom-sortable-table';

        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        headersToRender.forEach(headerInfo => {
            const th = document.createElement('th');
            th.className = headerInfo.className || '';
            if (headerInfo.sortable) {
                th.dataset.column = headerInfo.key;
                th.dataset.type = headerInfo.type;
                th.dataset.sortKey = headerInfo.sortKey || headerInfo.key;
                th.innerHTML = `${headerInfo.name} <span class="sort-arrow"></span>`;
                th.addEventListener('click', () => this.handleSort(headerInfo.key));
            } else {
                th.textContent = headerInfo.name;
            }
            headerRow.appendChild(th);
        });

        const tbody = table.createTBody();
        if (filteredData.length === 0) {
            const row = tbody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = headersToRender.length;
            cell.textContent = "No assignments found or processed.";
            cell.style.textAlign = "center";
            cell.style.padding = "20px";
        } else {
            filteredData.forEach((item) => {
                const row = tbody.insertRow();
                headersToRender.forEach(headerInfo => {
                    const cell = row.insertCell();
                    cell.className = headerInfo.className || '';
                    if (item.applicantDetailsDisplay === 'Loading...' && (headerInfo.key === 'applicantDetailsDisplay' || headerInfo.key === 'appliedCount')) {
                        cell.classList.add('loading-workers');
                    }
                    if (headerInfo.key === 'checkbox') {
                        const chk = document.createElement('input');
                        chk.type = 'checkbox';
                        chk.value = item.checkboxValue;
                        chk.checked = item.isChecked;
                        chk.name = "work_ids[]";
                        chk.id = `work_id_inj_overlay_${item.checkboxValue}`;
                        cell.appendChild(chk);
                    } else if (headerInfo.key === 'title') {
                        const link = document.createElement('a');
                        link.href = item.detailsLink;
                        link.textContent = item.title;
                        link.setAttribute('aria-label', item.ariaLabel || item.title);
                        link.className = 'tooltipped tooltipped-n';
                        cell.appendChild(link);
                    } else if (headerInfo.key === 'applicantDetailsDisplay') {
                        cell.innerHTML = item[headerInfo.key] || '';
                        cell.querySelectorAll('.tech-detail-link').forEach(link => {
                            link.addEventListener('click', (e) => {
                                e.preventDefault();
                                const assignmentId = e.target.dataset.assignmentId;
                                const techIndex = parseInt(e.target.dataset.techIndex, 10);
                                if (this.currentAssignmentTechsData[assignmentId] && this.currentAssignmentTechsData[assignmentId][techIndex] !== undefined) {
                                    this.showTechDetailsModal(this.currentAssignmentTechsData[assignmentId][techIndex], assignmentId, techIndex);
                                } else {
                                    console.error('Tech data not found for modal:', assignmentId, techIndex, this.currentAssignmentTechsData);
                                    alert('Error: Detailed tech data not found.');
                                }
                            });
                        });
                    } else {
                        cell.textContent = item[headerInfo.key] !== undefined ? String(item[headerInfo.key]) : '';
                    }
                });
            });
        }
        targetContainer.appendChild(table);
        this.updateSortIndicators();
    }
    handleSort(columnKey) { const header = this.activeTableHeaders.find(h => h.key === columnKey); if (!header || !header.sortable) return; if (this.tableData.some(item => item.applicantDetailsDisplay === 'Loading...') && (columnKey === 'applicantDetailsDisplay' || columnKey === 'appliedCount')) { console.log(`${this.SCRIPT_PREFIX} Worker data still loading, please wait to sort these columns.`); return; } if (this.currentSort.column === columnKey) { this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc'; } else { this.currentSort.column = columnKey; this.currentSort.direction = 'asc'; } this.sortData(); if (this.mainOverlayContentTarget) { this.renderTable(this.tableData, this.activeTableHeaders, this.mainOverlayContentTarget); } }
    sortData() { const { column, direction } = this.currentSort; const header = this.activeTableHeaders.find(h => h.key === column); if (!header || !header.sortable) return; const sortKey = header.sortKey || column; this.tableData.sort((a, b) => { let valA = a[sortKey]; let valB = b[sortKey]; if (sortKey === 'applicantDetailsDisplay' || sortKey === 'appliedCount') { const errorOrLoadingValues = ['error', 'fetch error', 'no id', 'loading...', '...']; if (sortKey === 'appliedCount') { if (typeof valA === 'string' && errorOrLoadingValues.includes(String(valA).toLowerCase())) { } else valA = Number(valA); if (typeof valB === 'string' && errorOrLoadingValues.includes(String(valB).toLowerCase())) { } else valB = Number(valB); } const isValALoadingError = typeof valA === 'string' && errorOrLoadingValues.includes(valA.toLowerCase()); const isValBLoadingError = typeof valB === 'string' && errorOrLoadingValues.includes(valB.toLowerCase()); if (isValALoadingError && !isValBLoadingError) return direction === 'asc' ? 1 : -1; if (!isValALoadingError && isValBLoadingError) return direction === 'asc' ? -1 : 1; if (isValALoadingError && isValBLoadingError) { valA = String(valA || '').toLowerCase(); valB = String(valB || '').toLowerCase(); } } if (typeof valA === 'string' && sortKey !== 'timestamp' && !(typeof valA === 'number')) valA = (valA || '').toLowerCase(); if (typeof valB === 'string' && sortKey !== 'timestamp' && !(typeof valB === 'number')) valB = (valB || '').toLowerCase(); if (valA < valB) return direction === 'asc' ? -1 : 1; if (valA > valB) return direction === 'asc' ? 1 : -1; return 0; }); }
    updateSortIndicators() { const table = document.getElementById('customAssignmentsTable_overlay'); if (!table) return; table.querySelectorAll('thead th .sort-arrow').forEach(arrow => arrow.className = 'sort-arrow'); const activeHeaderInfo = this.activeTableHeaders.find(h => h.key === this.currentSort.column); if (activeHeaderInfo && activeHeaderInfo.sortable) { const activeThArrow = table.querySelector(`thead th[data-column="${this.currentSort.column}"] .sort-arrow`); if (activeThArrow) activeThArrow.classList.add(this.currentSort.direction); } }
    createMainOverlay() {
        if (document.getElementById('wmTransformerOverlay')) {
            this.mainOverlay = document.getElementById('wmTransformerOverlay');
            this.mainOverlayContentTarget = this.mainOverlay.querySelector('.overlay-content');
            this.filterInput = this.mainOverlay.querySelector('.overlay-filter-input');
            console.log(`${this.SCRIPT_PREFIX} Main overlay already exists. Re-using (listeners might need re-attaching if this instance is new and old one was not cleaned properly).`);
            return;
        }

        this.mainOverlay = document.createElement('div');
        this.mainOverlay.id = 'wmTransformerOverlay';
        this.mainOverlay.className = 'wm-transformer-overlay';
        this.mainOverlay.style.display = 'none';

        const header = document.createElement('div');
        header.className = 'overlay-header';
        header.innerHTML = `<span>WorkMarket Enhanced Assignments</span><div class="overlay-controls"><button class="overlay-minimize-btn" title="Minimize">_</button><button class="overlay-maximize-btn" title="Maximize">□</button><button class="overlay-close-btn" title="Hide">X</button></div>`;

        const filterContainer = document.createElement('div');
        filterContainer.className = 'overlay-filter-container';
        this.filterInput = document.createElement('input');
        this.filterInput.type = 'text';
        this.filterInput.placeholder = 'Filter assignments...';
        this.filterInput.className = 'overlay-filter-input';
        filterContainer.appendChild(this.filterInput);

        this.mainOverlayContentTarget = document.createElement('div');
        this.mainOverlayContentTarget.className = 'overlay-content';
        this.mainOverlayContentTarget.id = 'assignment_list_results_overlay_content';

        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'overlay-resize-handle';

        this.mainOverlay.appendChild(header);
        this.mainOverlay.appendChild(filterContainer);
        this.mainOverlay.appendChild(this.mainOverlayContentTarget);
        this.mainOverlay.appendChild(resizeHandle);
        document.body.appendChild(this.mainOverlay);

        header.addEventListener('mousedown', this.startDragOverlayBound);
        resizeHandle.addEventListener('mousedown', this.startResizeOverlayBound);
        header.querySelector('.overlay-minimize-btn').addEventListener('click', () => this.mainOverlay.classList.toggle('minimized'));
        header.querySelector('.overlay-maximize-btn').addEventListener('click', () => this.toggleMaximizeOverlay());
        header.querySelector('.overlay-close-btn').addEventListener('click', () => { if(this.mainOverlay) this.mainOverlay.style.display = 'none'; });

        this.filterInput.addEventListener('input', () => {
            this.filterQuery = this.filterInput.value.toLowerCase();
            this.renderTable(this.tableData, this.activeTableHeaders, this.mainOverlayContentTarget);
        });

        console.log(`${this.SCRIPT_PREFIX} Main table overlay created.`);
    }
    startDragOverlay(e) { if (e.target.classList.contains('overlay-controls') || e.target.closest('.overlay-controls')) return; this.isDraggingOverlay = true; this.mainOverlay.style.userSelect = 'none'; this.overlayDragStartX = e.clientX - this.mainOverlay.offsetLeft; this.overlayDragStartY = e.clientY - this.mainOverlay.offsetTop; document.addEventListener('mousemove', this.doDragOverlayBound); document.addEventListener('mouseup', this.stopDragOverlayBound); }
    doDragOverlay(e) { if (!this.isDraggingOverlay || !this.mainOverlay) return; this.mainOverlay.style.left = (e.clientX - this.overlayDragStartX) + 'px'; this.mainOverlay.style.top = (e.clientY - this.overlayDragStartY) + 'px'; }
    stopDragOverlay() { this.isDraggingOverlay = false; if(this.mainOverlay) this.mainOverlay.style.userSelect = ''; document.removeEventListener('mousemove', this.doDragOverlayBound); document.removeEventListener('mouseup', this.stopDragOverlayBound); }
    startResizeOverlay(e) { this.isResizingOverlay = true; this.mainOverlay.style.userSelect = 'none'; this.overlayDragStartX = e.clientX; this.overlayDragStartY = e.clientY; this.overlayOriginalWidth = this.mainOverlay.offsetWidth; this.overlayOriginalHeight = this.mainOverlay.offsetHeight; document.addEventListener('mousemove', this.doResizeOverlayBound); document.addEventListener('mouseup', this.stopResizeOverlayBound); }
    doResizeOverlay(e) { if (!this.isResizingOverlay || !this.mainOverlay) return; const newWidth = this.overlayOriginalWidth + (e.clientX - this.overlayDragStartX); const newHeight = this.overlayOriginalHeight + (e.clientY - this.overlayDragStartY); this.mainOverlay.style.width = Math.max(300, newWidth) + 'px'; this.mainOverlay.style.height = Math.max(150, newHeight) + 'px'; }
    stopResizeOverlay() { this.isResizingOverlay = false; if(this.mainOverlay) this.mainOverlay.style.userSelect = ''; document.removeEventListener('mousemove', this.doResizeOverlayBound); document.removeEventListener('mouseup', this.stopResizeOverlayBound); }
    toggleMaximizeOverlay() { if (!this.mainOverlay) return; if (this.mainOverlay.classList.contains('maximized-true')) { this.mainOverlay.classList.remove('maximized-true'); this.mainOverlay.style.width = this.overlayPreMaximizeDimensions.width || '98%'; this.mainOverlay.style.height = this.overlayPreMaximizeDimensions.height || 'calc(100vh - 40px)'; this.mainOverlay.style.top = this.overlayPreMaximizeDimensions.top || '20px'; this.mainOverlay.style.left = this.overlayPreMaximizeDimensions.left || '1%'; this.overlayIsMaximized = false; } else { this.overlayPreMaximizeDimensions = { width: this.mainOverlay.style.width, height: this.mainOverlay.style.height, top: this.mainOverlay.style.top, left: this.mainOverlay.style.left, }; this.mainOverlay.classList.add('maximized-true'); this.overlayIsMaximized = true; } }

    createTechModal() {
        if (document.getElementById('techDetailModalOverlay')) return;
        const overlay = document.createElement('div'); overlay.id = 'techDetailModalOverlay'; overlay.className = 'tech-modal-overlay';
        overlay.addEventListener('click', (e) => { if (e.target === overlay) this.closeModal(); });
        const modalContent = document.createElement('div'); modalContent.className = 'tech-modal-content';
        modalContent.innerHTML = `
            <div class="tech-modal-header" id="techModalHeader">
                <h3>Technician / Company Details</h3>
                <button type="button" class="tech-modal-close" aria-label="Close">×</button>
            </div>
            <div class="tech-modal-body">
                <div class="tech-modal-assignment-link"></div>
                <div id="techModalScoreDisplay" class="overall-score-display" style="display:none;"></div>
                <div id="techModalDetailsGrid" class="tech-modal-detail-grid"></div>
            </div>
            <div class="tech-modal-footer">
                <button id="prevTechBtn" class="tech-modal-nav-btn">« Previous</button>
                <span id="techCounter" style="margin: 0 10px;"></span>
                <button id="nextTechBtn" class="tech-modal-nav-btn">Next »</button>
            </div>`;
        overlay.appendChild(modalContent); document.body.appendChild(overlay);
        modalContent.querySelector('.tech-modal-header').addEventListener('mousedown', this.startDragTechModalBound);
        overlay.querySelector('.tech-modal-close').addEventListener('click', () => this.closeModal());
        overlay.querySelector('#prevTechBtn').addEventListener('click', () => this.showPrevTech());
        overlay.querySelector('#nextTechBtn').addEventListener('click', () => this.showNextTech());
        // console.log(`${this.SCRIPT_PREFIX} Tech details modal structure created.`);
    }

    startDragTechModal(e) { if (e.target.classList.contains('tech-modal-close')) return; this.techModalIsDragging = true; const modalContent = e.currentTarget.closest('.tech-modal-content'); const modalOverlay = document.getElementById('techDetailModalOverlay'); if (!modalOverlay || !modalContent) return; modalOverlay.style.userSelect = 'none'; this.techModalDragStartX = e.clientX - modalContent.offsetLeft; this.techModalDragStartY = e.clientY - modalContent.offsetTop; document.addEventListener('mousemove', this.doDragTechModalBound); document.addEventListener('mouseup', this.stopDragTechModalBound); }
    doDragTechModal(e) { if (!this.techModalIsDragging) return; const modalContent = document.getElementById('techDetailModalOverlay')?.querySelector('.tech-modal-content'); if (!modalContent) return; modalContent.style.left = (e.clientX - this.techModalDragStartX) + 'px'; modalContent.style.top = (e.clientY - this.techModalDragStartY) + 'px'; }
    stopDragTechModal() { this.techModalIsDragging = false; const modalOverlay = document.getElementById('techDetailModalOverlay'); if(modalOverlay) modalOverlay.style.userSelect = ''; document.removeEventListener('mousemove', this.doDragTechModalBound); document.removeEventListener('mouseup', this.stopDragTechModalBound); }

        showTechDetailsModal(techFullDataWithScores, assignmentIdForModal, techIndexInAssignment) {
        this.currentModalAssignmentId = assignmentIdForModal;
        this.currentModalTechIndex = techIndexInAssignment;
        const techRawData = techFullDataWithScores;

        console.log(`${this.SCRIPT_PREFIX} Showing modal for tech (Assign: ${assignmentIdForModal}, Index: ${techIndexInAssignment}):`, techRawData.company_name || techRawData.name);

        let modalOverlay = document.getElementById('techDetailModalOverlay');
        if (!modalOverlay) { this.createTechModal(); modalOverlay = document.getElementById('techDetailModalOverlay'); }
        if (!modalOverlay) { console.error("Failed to get modal overlay in showTechDetailsModal"); return; }

        const modalBody = modalOverlay.querySelector('.tech-modal-body');
        const assignmentTitleLinkEl = modalBody.querySelector('.tech-modal-assignment-link');
        const modalScoreDisplay = modalOverlay.querySelector('#techModalScoreDisplay');
        const detailsGrid = modalOverlay.querySelector('#techModalDetailsGrid');
        detailsGrid.innerHTML = '';

        const currentAssignment = this.tableData.find(a => a.assignmentId === assignmentIdForModal);
        if (currentAssignment && assignmentTitleLinkEl) {
            assignmentTitleLinkEl.innerHTML = `<a href="${currentAssignment.detailsLink}" target="_blank" title="${currentAssignment.ariaLabel || currentAssignment.title}">View Assignment: ${currentAssignment.title}</a>`;
        } else if (assignmentTitleLinkEl) {
            assignmentTitleLinkEl.innerHTML = `Assignment ID: ${assignmentIdForModal}`;
        }

        if (techRawData.OverallScore !== undefined) {
            modalScoreDisplay.innerHTML = `Overall Score: ${techRawData.OverallScore}
                <span style="font-size:0.8em; display:block;">(Cost: ${techRawData.CostScore}, Dist: ${techRawData.DistanceScore}, Stats: ${techRawData.StatsScore})</span>
                <span style="font-size:0.7em; display:block; color: #6c757d;">CPS: ${techRawData.CPS_Final}, IPS: ${techRawData.IPS}</span>`;
            modalScoreDisplay.style.display = 'block';
        } else {
            modalScoreDisplay.style.display = 'none';
        }

        const prevBtn = modalOverlay.querySelector('#prevTechBtn');
        const nextBtn = modalOverlay.querySelector('#nextTechBtn');
        const counter = modalOverlay.querySelector('#techCounter');
        const techsForCurrentAssignment = this.currentAssignmentTechsData[assignmentIdForModal] || [];
        prevBtn.disabled = techIndexInAssignment <= 0;
        nextBtn.disabled = techIndexInAssignment >= techsForCurrentAssignment.length - 1;
        counter.textContent = `${techIndexInAssignment + 1} of ${techsForCurrentAssignment.length}`;

        // **** DEFINE priorityFields HERE ****
        const priorityFields = [
            { key: 'user_uuid', label: 'User Profile' }, { key: 'name', label: 'Contact Name' },
            { key: 'company_name', label: 'Company' }, { key: 'email', label: 'Email' },
            { key: 'work_phone', label: 'Work Phone' }, { key: 'mobile_phone', label: 'Mobile Phone' },
            { key: 'address', label: 'Address' }, { key: 'distance', label: 'Distance' },
            { key: 'status', label: 'Invitation Status' }, { key: 'sent_on', label: 'Sent On' },
            { key: 'declined_on', label: 'Declined On' }, { key: 'question_pending', label: 'Question Pending?' },
            { key: 'has_negotiation', label: 'Has Negotiation?' }, { key: 'schedule_conflict', label: 'Schedule Conflict?' }
        ];

        const renderKeyValuePair = (key, value, parentEl, isNested = false, path = '') => {
            const formattedValue = this.formatValue(value, key);
            const hideIfNo = ['question_pending', 'schedule_conflict', 'is_expired', 'is_schedule_negotiation', 'is_best_price', 'tiered_pricing_accepted'];

            if (formattedValue === 'N/A' && !(key === 'declined_on' && value === '')) { return; }
            if (hideIfNo.includes(key) && formattedValue === 'No') { return; }

            const dt = document.createElement('dt');
            // Use the label from priorityFields if available, otherwise generate one
            const priorityFieldEntry = priorityFields.find(pf => pf.key === key); // Check against the priorityFields defined in the outer scope
            dt.textContent = (priorityFieldEntry?.label || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())) + ':';

            if (isNested) dt.style.paddingLeft = '15px';
            const dd = document.createElement('dd');
            if (key === 'user_uuid') { dd.innerHTML = `<a href="https://www.workmarket.com/new-profile/${value}" target="_blank">${value}</a>`; }
            else if (key === 'email' && value) { const subject = encodeURIComponent(`Question regarding WO: ${currentAssignment?.title || this.currentModalAssignmentId || 'Assignment'}`); dd.innerHTML = `<a href="mailto:${value}?subject=${subject}&body=I have a question:">${value}</a>`; }
            else if ((key === 'work_phone' || key === 'mobile_phone') && value) { dd.innerHTML = `<a href="tel:${String(value).replace(/\D/g,'')}">${value}</a>`; }
            else if (key === 'address' && value) { dd.innerHTML = `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}" target="_blank">${value}</a>`; }
            else if (key === 'graniteTicket' && value && this.tableData.some(a => a.assignmentId === assignmentIdForModal && a.graniteTicket === value)) {
                dd.textContent = formattedValue; // Placeholder for actual ticket link
            } else {
                dd.textContent = formattedValue;
                if (key === 'is_best_price' && formattedValue === 'Yes') {
                    dd.classList.add('value-yes');
                }
            }
            parentEl.appendChild(dt); parentEl.appendChild(dd);
        };

        const renderSection = (title, dataObject, parentEl, isTopLevelSection = true, fieldOrder = null) => {
            if (!dataObject || Object.keys(dataObject).length === 0) return;
            if (isTopLevelSection) {
                const headerDt = document.createElement('dt');
                headerDt.className = 'section-header-dt'; headerDt.textContent = title;
                parentEl.appendChild(headerDt);
            }
            const keysToIterate = fieldOrder || Object.keys(dataObject);
            for (const key of keysToIterate) {
                if (dataObject.hasOwnProperty(key)) {
                    const value = dataObject[key];
                    if ((title.includes('Scorecard (For Your Company)') || title.includes('Scorecard (Overall Platform)')) && typeof value === 'object' && value !== null && value.hasOwnProperty('all')) {
                         renderKeyValuePair.call(this, key, value.all, parentEl, true, title + '.' + key);
                    }
                    else if (title.includes('Pricing') || (title === 'Negotiation Details' && key !== 'pricing') || title.includes('Rating Details') || (title.includes('Scorecard') && typeof value !== 'object')) {
                         if (typeof value !== 'object' || value === null) {
                            renderKeyValuePair.call(this, key, value, parentEl, true, title + '.' + key);
                         } else {
                            renderSection.call(this, key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value, parentEl, false);
                         }
                    }
                    else if (!isTopLevelSection && (typeof value !== 'object' || value === null)) {
                         renderKeyValuePair.call(this, key, value, parentEl, true, title + '.' + key);
                    }
                }
            }
        };

        priorityFields.forEach(pf => { if (techRawData.hasOwnProperty(pf.key)) { renderKeyValuePair.call(this, pf.key, techRawData[pf.key], detailsGrid, false, pf.key); } });

        if (techRawData.has_negotiation && techRawData.negotiation) {
            const negDetails = techRawData.negotiation;
            const negBooleans = ['is_expired', 'is_price_negotiation', 'is_schedule_negotiation', 'is_best_price', 'tiered_pricing_accepted'];
            let hasSignificantNegData = Object.keys(negDetails).some(k => {
                if (negBooleans.includes(k)) return negDetails[k] === true;
                if (k === 'pricing') return negDetails.pricing && Object.keys(negDetails.pricing).length > 0;
                return negDetails[k] !== null && String(negDetails[k]).trim() !== '';
            });
            if (hasSignificantNegData) {
                const negotiationFieldOrder = ['approval_status', 'requested_on_date', 'requested_on_fuzzy', 'is_expired', 'is_price_negotiation', 'is_schedule_negotiation', 'is_best_price', 'tiered_pricing_accepted', 'note']; // pricing is handled after
                renderSection.call(this, 'Negotiation Details', negDetails, detailsGrid, true, negotiationFieldOrder.filter(k => k !== 'pricing')); // Exclude pricing for now
                if (negDetails.pricing) {
                    renderSection.call(this, 'Pricing', negDetails.pricing, detailsGrid, false); // Render pricing under Negotiation Details
                }
            }
        }

        if (techRawData.resource_scorecard_for_company) { if (techRawData.resource_scorecard_for_company.values) { renderSection.call(this, 'Scorecard (For Your Company)', techRawData.resource_scorecard_for_company.values, detailsGrid); } if(techRawData.resource_scorecard_for_company.rating){renderSection.call(this, 'Company Rating Details', techRawData.resource_scorecard_for_company.rating, detailsGrid);} }
        if (techRawData.resource_scorecard) { if (techRawData.resource_scorecard.values) { renderSection.call(this, 'Scorecard (Overall Platform)', techRawData.resource_scorecard.values, detailsGrid); } if(techRawData.resource_scorecard.rating){renderSection.call(this, 'Overall Rating Details', techRawData.resource_scorecard.rating, detailsGrid);} }

        const keysToExclude = [ 'avatar_uri', 'avatar_asset_uri', 'user_uuid', 'encrypted_id', 'valuesWithStringKey', 'tieredPricingMetaData', 'labels', 'dispatcher', 'resource_scorecard_for_company', 'resource_scorecard', 'OverallScore', 'CostScore', 'DistanceScore', 'StatsScore', 'CPS_Final', 'IPS', 'assignmentId', 'raw_worker_data', 'user_id', 'user_number', 'latitude', 'longitude', 'new_user', 'rating_text', 'company_rating_text', 'lane', 'assign_to_first_to_accept', 'blocked', 'name', 'company_name', 'email', 'work_phone', 'mobile_phone', 'address', 'distance', 'status', 'sent_on', 'declined_on', 'question_pending', 'has_negotiation', 'schedule_conflict', 'negotiation', 'targeted' ];
        let hasOtherDetails = false; const otherDetailsFragment = document.createDocumentFragment();
        for (const key in techRawData) { if (techRawData.hasOwnProperty(key) && !keysToExclude.includes(key) && !priorityFields.find(pf => pf.key === key)) { const value = techRawData[key]; if (value !== null && value !== undefined && String(value).trim() !== '') { if(!hasOtherDetails){ const otherDt = document.createElement('dt'); otherDt.className = 'section-header-dt'; otherDt.textContent = 'Other Raw Details'; otherDetailsFragment.appendChild(otherDt); hasOtherDetails = true; } renderKeyValuePair.call(this, key, value, otherDetailsFragment, false, key); } } }
        if(hasOtherDetails) detailsGrid.appendChild(otherDetailsFragment);

        modalOverlay.style.display = 'flex';
    }

    showPrevTech() { if (this.currentModalAssignmentId && this.currentModalTechIndex > 0) { this.currentModalTechIndex--; const techData = this.currentAssignmentTechsData[this.currentModalAssignmentId][this.currentModalTechIndex]; this.showTechDetailsModal(techData, this.currentModalAssignmentId, this.currentModalTechIndex); } }
    showNextTech() { if (this.currentModalAssignmentId && this.currentAssignmentTechsData[this.currentModalAssignmentId] && this.currentModalTechIndex < this.currentAssignmentTechsData[this.currentModalAssignmentId].length - 1) { this.currentModalTechIndex++; const techData = this.currentAssignmentTechsData[this.currentModalAssignmentId][this.currentModalTechIndex]; this.showTechDetailsModal(techData, this.currentModalAssignmentId, this.currentModalTechIndex); } }
    closeModal() { const modalOverlay = document.getElementById('techDetailModalOverlay'); if (modalOverlay) { modalOverlay.style.display = 'none'; } }
    formatValue(value, key = '') { if (value === null || value === undefined || String(value).trim() === '') return 'N/A'; if (typeof value === 'boolean') return value ? 'Yes' : 'No'; const lowerKey = key.toLowerCase(); if (typeof value === 'number') { if (lowerKey.includes('price') || lowerKey.includes('cost') || lowerKey.includes('spend') || lowerKey.includes('fee')) { return `$${value.toFixed(2)}`; } if (lowerKey === 'distance') return `${value.toFixed(1)} miles`; if ((lowerKey.includes('percentage') || lowerKey.includes('rate') || lowerKey.includes('ratio')) && !lowerKey.includes('rating')) { if (value >= 0 && value <= 1.000001) { return `${(value * 100).toFixed(2)}%`; } } return value.toFixed(2); } return String(value); }

    waitForAssignmentsAndInitialize() {
        console.log(`${this.SCRIPT_PREFIX} Inside waitForAssignmentsAndInitialize. Watching container:`, this.originalResultsContainerSource);
        if (this.transformationInitialized && document.getElementById('customAssignmentsTable_overlay')) { console.log(`${this.SCRIPT_PREFIX} Transformation already ran and table exists. Exiting.`); return; }
        this.transformationInitialized = false; // Reset for potential re-run if observer fires multiple times before disconnect

        if (!this.originalResultsContainerSource) { console.error(`${this.SCRIPT_PREFIX} originalResultsContainerSource is null!`); return; }
        if (this.originalResultsContainerSource.querySelector(this.assignmentItemSelector)) {
            console.log(`${this.SCRIPT_PREFIX} Assignment items found on IMMEDIATE check inside waitForAssignments.`);
            if (!this.transformationInitialized) { this.transformationInitialized = true; this.initializeTransformationSequence().catch(err => console.error(`${this.SCRIPT_PREFIX} Error (immediate init):`, err)); }
            return;
        }
        if (this.observer) { this.observer.disconnect(); this.observer = null; console.log(`${this.SCRIPT_PREFIX} Disconnected previous observer.`);} // Disconnect any old observer
        this.observer = new MutationObserver((mutationsList, obs) => {
            if (this.transformationInitialized) { obs.disconnect(); this.observer = null; return; }
            if (this.originalResultsContainerSource.querySelector(this.assignmentItemSelector)) {
                console.log(`${this.SCRIPT_PREFIX} Assignment items DETECTED by MutationObserver.`);
                obs.disconnect(); this.observer = null;
                if (!this.transformationInitialized) {
                    this.transformationInitialized = true;
                    this.initializeTransformationSequence().catch(err => console.error(`${this.SCRIPT_PREFIX} Error (observer init):`, err));
                }
            }
        });
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
            else { console.warn(`${this.SCRIPT_PREFIX} Max polling attempts reached. Items NOT FOUND using "${this.assignmentItemSelector}". HTML:`, this.originalResultsContainerSource.innerHTML.substring(0, 1000) + "..."); if (this.mainOverlayContentTarget) { this.renderTable([], this.activeTableHeaders, this.mainOverlayContentTarget); if(this.mainOverlay) this.mainOverlay.style.display = 'flex'; } }
        };
        pollForItems();
    }

    async initializeTransformationSequence() {
        console.log(`${this.SCRIPT_PREFIX} Starting main transformation sequence...`);
        if (!this.originalResultsContainerSource) { console.error(`${this.SCRIPT_PREFIX} #assignment_list_results source is null. Aborting.`); return; }
        if (!this.mainOverlayContentTarget) { console.error(`${this.SCRIPT_PREFIX} Main overlay content target is not defined. Aborting.`); return; }
        this.activeTableHeaders = [ { key: 'checkbox', name: '', type: 'control', sortable: false, className: 'col-checkbox' }, { key: 'title', name: 'Title', type: 'string', sortable: true, className: 'col-title' }, { key: 'status', name: 'Status', type: 'string', sortable: true, className: 'col-status' }, { key: 'appliedCount', name: '#Apld', type: 'number', sortable: true, className: 'col-applied-count' }, { key: 'applicantDetailsDisplay', name: 'Top Applicants', type: 'string', sortable: true, className: 'col-applicant-display' }, { key: 'parsedDate', name: 'Date', type: 'date', sortable: true, sortKey: 'timestamp', className: 'col-parsed-date' }, { key: 'parsedTime', name: 'Time', type: 'string', sortable: true, sortKey: 'timestamp', className: 'col-parsed-time' }, { key: 'siteName', name: 'Site Name', type: 'string', sortable: true, className: 'col-site-name' }, { key: 'city', name: 'City', type: 'string', sortable: true, className: 'col-city' }, { key: 'state', name: 'ST', type: 'string', sortable: true, className: 'col-state' }, { key: 'zip', name: 'Zip', type: 'string', sortable: true, className: 'col-zip' }, { key: 'price', name: 'Price', type: 'number', sortable: true, sortKey: 'priceNumeric', className: 'col-price-col' }, { key: 'labels', name: 'Labels', type: 'string', sortable: true, className: 'col-labels' }, { key: 'graniteTicket', name: 'Ticket #', type: 'string', sortable: true, className: 'col-ticket' }, { key: 'assignmentId', name: 'Assign. ID', type: 'string', sortable: true, className: 'col-assign-id' }, { key: 'lastUpdateText', name: 'Last Update', type: 'string', sortable: true, className: 'col-updated' } ];
        const originalAssignmentNodes = Array.from(this.originalResultsContainerSource.querySelectorAll(this.assignmentItemSelector));
        // console.log(`${this.SCRIPT_PREFIX} Query in initializeTransformationSequence for nodes (selector: "${this.assignmentItemSelector}") found ${originalAssignmentNodes.length} items.`);
        if (originalAssignmentNodes.length === 0) { console.warn(`${this.SCRIPT_PREFIX} No assignment items found with selector "${this.assignmentItemSelector}". HTML:`, this.originalResultsContainerSource.innerHTML.substring(0, 500) + "..."); this.renderTable([], this.activeTableHeaders, this.mainOverlayContentTarget); if(this.mainOverlay) this.mainOverlay.style.display = 'flex'; return; }
        const initialTableData = originalAssignmentNodes.map(itemNode => { const data = {}; const getText = (selector) => itemNode.querySelector(selector)?.textContent.trim() || ''; data.title = getText('div[style="float: left;"] > strong > a .title'); data.assignmentId = itemNode.querySelector('.assignmentId')?.id || getText('ul.assignment-actions li.fr em').match(/Assign\. ID: (\d+)/)?.[1]; data.applicantDetailsDisplay = 'Loading...'; data.appliedCount = '...'; const fullDateString = getText('.date small.meta span'); const dateParts = this.parseFullDateToParts(fullDateString); if (dateParts && typeof dateParts === 'object') { data.parsedDate = dateParts.date; data.parsedTime = dateParts.time; data.timestamp = dateParts.timestamp; } else { data.parsedDate = 'N/A'; data.parsedTime = 'N/A'; data.timestamp = 0; } return data; });
        this.tableData = initialTableData; this.sortData(); this.renderTable(this.tableData, this.activeTableHeaders, this.mainOverlayContentTarget); if(this.mainOverlay) this.mainOverlay.style.display = 'flex';
        this.tableData = await this.extractAssignmentsData(originalAssignmentNodes);
        if (this.tableData.length === 0 && originalAssignmentNodes.length > 0) { console.warn(`${this.SCRIPT_PREFIX} Original nodes were found, but full extraction resulted in 0 items.`); } const defaultSortHeader = this.activeTableHeaders.find(h => h.key === this.currentSort.column && h.sortable); if (!defaultSortHeader) { const firstSortableColumn = this.activeTableHeaders.find(h => h.sortable); if (firstSortableColumn) { this.currentSort.column = firstSortableColumn.key; this.currentSort.direction = (firstSortableColumn.type === 'date' || firstSortableColumn.type === 'number') ? 'desc' : 'asc'; } } else { if (this.currentSort.column === 'timestamp') { const dateHeader = this.activeTableHeaders.find(h => h.sortKey === 'timestamp'); if (dateHeader) this.currentSort.column = dateHeader.key; } }
        this.sortData(); this.renderTable(this.tableData, this.activeTableHeaders, this.mainOverlayContentTarget);
        console.log(`${this.SCRIPT_PREFIX} All transformations complete. Final table rendered in overlay with ${this.tableData.length} assignments.`);
    }

} // End of WorkMarketTransformer class

// --- Script Entry Point ---
try {
    if (document.getElementById('assignment_list_results') &&
        (window.location.href.includes('/assignments') || window.location.href.includes('/workorders'))) {

        addStylesOnce(customCss, SCRIPT_PREFIX);
        modifyPageSizeSelectOnce(SCRIPT_PREFIX);

        console.log(`${SCRIPT_PREFIX} Conditions met. Creating/Re-creating new WorkMarketTransformer instance.`);
        if (window.WorkMarketTransformerInstance) {
            if (window.WorkMarketTransformerInstance.observer) {
                console.log(`${SCRIPT_PREFIX} Disconnecting previous observer.`);
                window.WorkMarketTransformerInstance.observer.disconnect();
            }
            if (window.WorkMarketTransformerInstance.mainOverlay) {
                console.log(`${SCRIPT_PREFIX} Removing previous main overlay.`);
                window.WorkMarketTransformerInstance.mainOverlay.remove();
            }
            const oldModal = document.getElementById('techDetailModalOverlay');
            if (oldModal) {
                console.log(`${SCRIPT_PREFIX} Removing previous tech modal.`);
                oldModal.remove();
            }
            window.WorkMarketTransformerInstance = null;
        }
        window.WorkMarketTransformerInstance = new WorkMarketTransformer();
    } else {
        console.log(`${SCRIPT_PREFIX} Not on a recognized assignments page or #assignment_list_results not found. Script will not run.`);
    }
} catch (e) {
    console.error(`${SCRIPT_PREFIX} CRITICAL ERROR DURING SCRIPT EXECUTION:`, e);
}
})();
