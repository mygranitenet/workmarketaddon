// CSS string (same as before, ensure it's complete in your actual script)
const customCss = `
    /* ... ALL YOUR CSS FROM V10 ... */
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
    .tech-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); display: none; justify-content: center; align-items: center; z-index: 10000; padding: 15px; box-sizing: border-box;}
    .tech-modal-content { background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); width: 100%; max-width: 750px; max-height: 90vh; overflow-y: auto; position: relative; font-size: 0.9rem; display: flex; flex-direction: column;}
    .tech-modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px; }
    .tech-modal-header h3 { margin: 0; }
    .tech-modal-close { font-size: 28px; font-weight: bold; color: #777; cursor: pointer; line-height: 1; background: none; border: none; padding: 0;}
    .tech-modal-close:hover { color: #333; }
    .tech-modal-body { flex-grow: 1; overflow-y: auto; padding-right: 10px; }
    .tech-modal-detail-grid { display: grid; grid-template-columns: minmax(200px, auto) 1fr; gap: 5px 10px; font-size: 0.9em;}
    .tech-modal-detail-grid dt { font-weight: bold; color: #444; padding-right: 10px; text-align: right; overflow-wrap: break-word; word-break: break-all;}
    .tech-modal-detail-grid dd { margin-left: 0; overflow-wrap: break-word; word-break: break-all;}
    .tech-modal-detail-grid .section-header-dt { grid-column: 1 / -1; background-color: #e9ecef; color: #495057; padding: 6px 8px; margin-top: 12px; font-weight: bold; border-radius: 3px; text-align: left; }
    .tech-modal-detail-grid .nested-object-dt { font-style: italic; color: #6c757d; text-align: right; padding-left: 15px;}
    .tech-modal-detail-grid .nested-object-dd { padding-left: 0; }
    .tech-modal-footer { border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px; text-align: right; }
    .tech-modal-nav-btn { padding: 8px 12px; margin-left: 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .tech-modal-nav-btn:disabled { background-color: #ccc; cursor: not-allowed; }
    .tech-modal-nav-btn:hover:not(:disabled) { background-color: #0056b3; }
    .overall-score-display { font-size: 1.1em; font-weight: bold; color: #17a2b8; margin-bottom: 10px; text-align: center; padding: 5px; background-color: #f8f9fa; border-radius: 4px;}
`;

(async function() { // IIFE starts here
    'use strict';
    const SCRIPT_PREFIX = '[WM TRANSFORMER CLASS V1.1.FULL]'; // Indicate it's the full class version
    console.log(`${SCRIPT_PREFIX} Script starting...`);

    // CSS is defined above the IIFE so the class can access it if it were inside,
    // but for simplicity, we'll just ensure addStyles is called.

class WorkMarketTransformer {
    constructor() {
        this.SCRIPT_PREFIX = SCRIPT_PREFIX; // Use the IIFE's SCRIPT_PREFIX
        console.log(`${this.SCRIPT_PREFIX} Initializing WorkMarketTransformer...`);
        this.originalResultsContainer = document.getElementById('assignment_list_results');
        this.pageSizeSelect = document.getElementById('assignment_list_size');
        this.tableData = [];
        this.currentSort = { column: 'timestamp', direction: 'desc' };
        this.activeTableHeaders = [];
        this.currentAssignmentTechsData = {};
        this.currentModalAssignmentId = null;
        this.currentModalTechIndex = -1;
        this.assignmentItemSelector = '.results-row.work';
        this.transformationInitialized = false;

        if (!this.originalResultsContainer) {
            console.error(`${this.SCRIPT_PREFIX} CRITICAL ERROR: Target container #assignment_list_results not found. Aborting.`);
            return;
        }
        this.addStyles(); // Call method
        this.modifyPageSizeSelect(); // Call method
        this.createTechModal();
        console.log(`${this.SCRIPT_PREFIX} Scheduling main transformation sequence...`);
        this.waitForAssignmentsAndInitialize();
    }

    addStyles() {
        console.log(`${this.SCRIPT_PREFIX} Applying custom CSS styles...`);
        const styleElement = document.createElement('style'); styleElement.id = 'customAssignmentsTableStyles';
        if (document.getElementById(styleElement.id)) { console.log(`${this.SCRIPT_PREFIX} Styles already injected.`); return; }
        styleElement.textContent = customCss; // Use the globally defined customCss
        document.head.appendChild(styleElement);
        console.log(`${this.SCRIPT_PREFIX} Custom styles injected successfully.`);
    }

    modifyPageSizeSelect() {
        if (this.pageSizeSelect) {
            console.log(`${this.SCRIPT_PREFIX} Modifying #assignment_list_size select.`);
            const currentSelectedValue = this.pageSizeSelect.value; this.pageSizeSelect.innerHTML = ''; let isCurrentSelectedStillAvailable = false;
            for (let i = 100; i <= 1000; i += 50) { const option = document.createElement('option'); option.value = i; option.textContent = i; if (String(i) === currentSelectedValue) { option.selected = true; isCurrentSelectedStillAvailable = true; } this.pageSizeSelect.appendChild(option); }
            if (!isCurrentSelectedStillAvailable && this.pageSizeSelect.options.length > 0) { /* Potentially select first */ }
            console.log(`${this.SCRIPT_PREFIX} #assignment_list_size select modified.`);
        } else { console.warn(`${this.SCRIPT_PREFIX} Warning: Select element #assignment_list_size not found during modification.`); }
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
            if (!response.ok) { console.error(`${this.SCRIPT_PREFIX} API Call [ERROR] - Failed for ${assignmentId}: ${response.status} ${response.statusText}. Response Text:`, responseText); return { count: 0, applicantDetailsDisplay: `Error ${response.status}`, top10TechsFullData: [] }; }
            const data = JSON.parse(responseText);
            let allFetchedWorkers = data.results || [];
            const totalFetchedInitially = allFetchedWorkers.length;
            const appliedWorkers = allFetchedWorkers.filter(w => {
                const isNotDeclined = w.declined_on === "";
                const hasActiveNegotiation = w.has_negotiation === true && w.negotiation !== null;
                // !!! UPDATE THIS `hasApplied` LOGIC BASED ON YOUR API'S ACTUAL FIELDS !!!
                const hasApplied = hasActiveNegotiation; // This is a placeholder, adjust as per your API
                return isNotDeclined && hasApplied;
            });
            appliedWorkers.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
            const top10WorkersRaw = appliedWorkers.slice(0, 10);
            const top10TechsFullData = top10WorkersRaw.map(w => { const techWithScore = { ...w, assignmentId: assignmentId }; const scores = this.calculateOverallScore(techWithScore); return { ...techWithScore, ...scores }; });
            const listItems = top10WorkersRaw.map((tech, index) => { let displayName = ''; if (tech.company_name && tech.company_name.toLowerCase() === 'sole proprietor') { displayName = tech.name || tech.company_name || 'N/A'; } else { displayName = tech.company_name || 'N/A'; if (tech.name && tech.name.toLowerCase() !== tech.company_name.toLowerCase()) { displayName += ` (${tech.name})`; } } const distance = (tech.distance !== undefined ? parseFloat(tech.distance).toFixed(1) + ' mi' : 'N/A'); const totalCostValue = tech.negotiation?.pricing?.total_cost; const totalCostDisplay = totalCostValue !== undefined ? `$${parseFloat(totalCostValue).toFixed(2)}` : 'N/A'; const costClass = totalCostValue !== undefined ? 'cost-value' : 'cost-na'; return `<li><span class="tech-detail-link" data-assignment-id="${assignmentId}" data-tech-index="${index}">${displayName}</span> (${distance}, <span class="${costClass}">Cost: ${totalCostDisplay}</span>)</li>`; });
            const applicantDetailsDisplay = top10TechsFullData.length > 0 ? `<ul>${listItems.join('')}</ul>` : (totalFetchedInitially > 0 ? 'None met filter criteria' : 'No applicants found');
            return { count: appliedWorkers.length, applicantDetailsDisplay: applicantDetailsDisplay, top10TechsFullData: top10TechsFullData };
        } catch (error) { console.error(`${this.SCRIPT_PREFIX} API Call [EXCEPTION] - Error fetching/parsing worker data for ${assignmentId}:`, error); console.error(`${this.SCRIPT_PREFIX} API Call [EXCEPTION] - Response text was:`, responseText); return { count: 0, applicantDetailsDisplay: 'Fetch/Parse Exception', top10TechsFullData: [] }; }
    }

    calculateOverallScore(techData, assignmentBudget = 350) {
        let CS = 50, DS = 0, SS = 50, OS = 0;
        const totalCost = techData.negotiation?.pricing?.total_cost; if (totalCost !== undefined && totalCost !== null) { CS = Math.max(0, (1 - (parseFloat(totalCost) / assignmentBudget)) * 100); }
        const distance = techData.distance; if (distance !== undefined && distance !== null) { if (distance <= 40) { DS = Math.max(0, (1 - (distance / 80)) * 100); } else if (distance <= 60) { DS = 20; } else if (distance <= 80) { DS = 10; } else { DS = 0; } }
        let CPS_Final = 50; const rscCompany = techData.resource_scorecard_for_company?.values; const rscIndividual = techData.resource_scorecard;
        if (rscCompany) { const compCompletedNet90 = rscCompany.COMPLETED_WORK?.net90; if (compCompletedNet90 !== undefined && compCompletedNet90 !== null && compCompletedNet90 > 0) { const satNet90 = rscCompany.SATISFACTION_OVER_ALL?.net90 || 0; const onTimeNet90 = rscCompany.ON_TIME_PERCENTAGE?.net90 || 0; const reliabilityNet90Factor = Math.min(1, (compCompletedNet90 || 0) / 5); const negNet90Count = (rscCompany.CANCELLED_WORK?.net90 || 0) + (rscCompany.LATE_WORK?.net90 || 0) + (rscCompany.ABANDONED_WORK?.net90 || 0); CPS_Final = ((satNet90 * 0.45) + (onTimeNet90 * 0.35) + (reliabilityNet90Factor * 0.20) - (negNet90Count * 0.10)) * 100; } else if (rscCompany.COMPLETED_WORK?.all !== undefined && rscCompany.COMPLETED_WORK?.all > 0) { const satAll = rscCompany.SATISFACTION_OVER_ALL?.all || 0; const onTimeAll = rscCompany.ON_TIME_PERCENTAGE?.all || 0; const reliabilityAllFactor = Math.min(1, (rscCompany.COMPLETED_WORK?.all || 0) / 5); const negAllCount = (rscCompany.CANCELLED_WORK?.all || 0) + (rscCompany.LATE_WORK?.all || 0) + (rscCompany.ABANDONED_WORK?.all || 0); const CPS_All_Raw = ((satAll * 0.45) + (onTimeAll * 0.35) + (reliabilityAllFactor * 0.20) - (negAllCount * 0.10)) * 100; CPS_Final = CPS_All_Raw * 0.85; } }
        let IPS = 50; if (rscIndividual?.rating && rscIndividual?.values) { if (rscIndividual.rating.count > 0) { const satInd = rscIndividual.rating.satisfactionRate || 0; const onTimeInd = rscIndividual.values.ON_TIME_PERCENTAGE?.all || 0; const reliabilityIndFactor = Math.min(1, (rscIndividual.rating.count || 0) / 50); const negIndCount = (rscIndividual.values.CANCELLED_WORK?.all || 0) + (rscIndividual.values.LATE_WORK?.all || 0) + (rscIndividual.values.ABANDONED_WORK?.all || 0); IPS = ((satInd * 0.40) + (onTimeInd * 0.30) + (reliabilityIndFactor * 0.30) - (negIndCount * 0.02)) * 100; } } else if (techData.new_user === true) { IPS = 50; }
        if (rscCompany?.COMPLETED_WORK?.net90 > 0) { SS = (CPS_Final * 0.80) + (IPS * 0.20); } else if (rscCompany?.COMPLETED_WORK?.all > 0) { SS = (CPS_Final * 0.65) + (IPS * 0.35); } else { SS = IPS; }
        SS = Math.max(0, Math.min(100, SS)); CPS_Final = Math.max(0, Math.min(100, CPS_Final)); IPS = Math.max(0, Math.min(100, IPS)); CS = Math.max(0, Math.min(100, CS)); DS = Math.max(0, Math.min(100, DS));
        OS = (CS * 0.30) + (DS * 0.15) + (SS * 0.55); OS = Math.max(0, Math.min(100, OS));
        return { OverallScore: OS.toFixed(2), CostScore: CS.toFixed(2), DistanceScore: DS.toFixed(2), StatsScore: SS.toFixed(2), CPS_Final: CPS_Final.toFixed(2), IPS: IPS.toFixed(2) };
    }

    async extractAssignmentsData(assignmentNodes) {
        // console.log(`${this.SCRIPT_PREFIX} Starting to extract assignment data from ${assignmentNodes.length} provided HTML nodes...`);
        if (assignmentNodes.length === 0) { console.warn(`${this.SCRIPT_PREFIX} extractAssignmentsData received 0 nodes. No data to process.`); return []; }
        const assignmentsPromises = assignmentNodes.map(async (itemNode, index) => {
            const data = {}; const getText = (selector, baseNode = itemNode, trim = true) => { const el = baseNode.querySelector(selector); let text = el ? el.textContent : ''; return trim ? text.trim() : text; }; const getAttribute = (selector, attribute, baseNode = itemNode) => { const el = baseNode.querySelector(selector); return el ? el.getAttribute(attribute) : ''; };
            data.checkboxValue = getAttribute('.results-select input[type="checkbox"]', 'value'); const originalCheckbox = itemNode.querySelector('.results-select input[type="checkbox"]'); data.isChecked = originalCheckbox ? originalCheckbox.checked : false; const titleLinkEl = itemNode.querySelector('div[style="float: left;"] > strong > a'); data.title = titleLinkEl ? titleLinkEl.querySelector('.title').textContent.trim() : 'N/A'; data.detailsLink = titleLinkEl ? titleLinkEl.href : '#'; data.ariaLabel = titleLinkEl ? titleLinkEl.getAttribute('aria-label') : data.title;
            const statusNode = itemNode.querySelector('.status'); let statusCombined = ''; if (statusNode) { let simpleStatusText = statusNode.textContent.trim().replace(/\n+/g, ' ').replace(/\s+/g, ' '); if (simpleStatusText.length > 0 && simpleStatusText.length < 20 && !statusNode.querySelector('p strong') && !statusNode.querySelector('span.label')) { statusCombined = simpleStatusText; } else { const statusStrongEl = statusNode.querySelector('p strong'); const statusLabelEl = statusNode.querySelector('span.label'); let parts = []; if (statusStrongEl) parts.push(statusStrongEl.textContent.trim()); if (statusLabelEl) parts.push(statusLabelEl.textContent.trim()); statusCombined = parts.join(' - '); } } data.status = statusCombined || 'N/A'; const fullDateString = getText('.date small.meta span'); const dateParts = this.parseFullDateToParts(fullDateString); data.parsedDate = dateParts.date; data.parsedTime = dateParts.time; data.timestamp = dateParts.timestamp; const fullLocationString = getText('.location small.meta').replace(/\s+/g, ' '); const locationParts = this.parseLocationString(fullLocationString); data.city = locationParts.city; data.state = locationParts.state; data.zip = locationParts.zip; data.price = getText('.price small.meta'); data.priceNumeric = parseFloat(String(data.price).replace(/[^0-9.-]+/g, "")) || 0; data.siteName = ''; data.graniteTicket = ''; const workDetailsMetas = Array.from(itemNode.querySelectorAll('.work-details > small.meta')); workDetailsMetas.forEach(metaEl => { const text = metaEl.textContent.trim(); if (text.startsWith('Location:')) data.siteName = text.substring('Location:'.length).trim(); else if (text.startsWith('Granite Ticket Number:')) data.graniteTicket = text.substring('Granite Ticket Number:'.length).trim(); }); const labelNodes = Array.from(itemNode.querySelectorAll('.assignment_labels .label')); data.labels = labelNodes.map(ln => ln.textContent.trim()).join(', '); if (!data.labels) data.labels = ''; const assignIdHiddenEl = itemNode.querySelector('.assignmentId'); if (assignIdHiddenEl && assignIdHiddenEl.id) { data.assignmentId = assignIdHiddenEl.id; } else { const assignIdMetaText = getText('ul.assignment-actions li.fr em'); const matchId = assignIdMetaText.match(/Assign\. ID: (\d+)/); data.assignmentId = matchId ? matchId[1] : (data.checkboxValue || null); }
            const updatedInfoText = getText('ul.assignment-actions li.fr em'); if (updatedInfoText) { data.lastUpdateText = updatedInfoText.split('|')[0].trim(); if (data.lastUpdateText.toLowerCase().includes('wolfanger')) { data.lastUpdateText = ''; } } else { data.lastUpdateText = ''; }
            data.appliedCount = '...'; data.applicantDetailsDisplay = 'Loading...';
            if (data.assignmentId) { const workerInfo = await this.fetchWorkerData(data.assignmentId); data.appliedCount = workerInfo.count; data.applicantDetailsDisplay = workerInfo.applicantDetailsDisplay; this.currentAssignmentTechsData[data.assignmentId] = workerInfo.top10TechsFullData; }
            else { console.warn(`${this.SCRIPT_PREFIX} Assignment item ${index + 1} (Title: ${data.title.substring(0,30)}...) has no ID. Skipping worker fetch.`); data.appliedCount = 0; data.applicantDetailsDisplay = 'No ID'; this.currentAssignmentTechsData[data.assignmentId || `no_id_${index}`] = []; }
            return data;
        });
        const extractedData = await Promise.all(assignmentsPromises);
        return extractedData;
    }

    renderTable(dataToRender, headersToRender, targetContainer) {
        targetContainer.innerHTML = ''; const table = document.createElement('table'); table.id = 'customAssignmentsTable'; table.className = 'custom-sortable-table'; const thead = table.createTHead(); const headerRow = thead.insertRow(); headersToRender.forEach(headerInfo => { const th = document.createElement('th'); th.className = headerInfo.className || ''; if (headerInfo.sortable) { th.dataset.column = headerInfo.key; th.dataset.type = headerInfo.type; th.dataset.sortKey = headerInfo.sortKey || headerInfo.key; th.innerHTML = `${headerInfo.name} <span class="sort-arrow"></span>`; th.addEventListener('click', () => this.handleSort(headerInfo.key)); } else { th.textContent = headerInfo.name; } headerRow.appendChild(th); }); const tbody = table.createTBody(); if (dataToRender.length === 0) { const row = tbody.insertRow(); const cell = row.insertCell(); cell.colSpan = headersToRender.length; cell.textContent = "No assignments found or processed."; cell.style.textAlign = "center"; cell.style.padding = "20px"; } else { dataToRender.forEach((item) => { const row = tbody.insertRow(); headersToRender.forEach(headerInfo => { const cell = row.insertCell(); cell.className = headerInfo.className || ''; if (item.applicantDetailsDisplay === 'Loading...' && (headerInfo.key === 'applicantDetailsDisplay' || headerInfo.key === 'appliedCount')) { cell.classList.add('loading-workers'); } if (headerInfo.key === 'checkbox') { const chk = document.createElement('input'); chk.type = 'checkbox'; chk.value = item.checkboxValue; chk.checked = item.isChecked; chk.name = "work_ids[]"; chk.id = `work_id_inj_${item.checkboxValue}`; cell.appendChild(chk); } else if (headerInfo.key === 'title') { const link = document.createElement('a'); link.href = item.detailsLink; link.textContent = item.title; link.setAttribute('aria-label', item.ariaLabel); link.className = 'tooltipped tooltipped-n'; cell.appendChild(link); } else if (headerInfo.key === 'applicantDetailsDisplay') { cell.innerHTML = item[headerInfo.key] || ''; cell.querySelectorAll('.tech-detail-link').forEach(link => { link.addEventListener('click', (e) => { const assignmentId = e.target.dataset.assignmentId; const techIndex = parseInt(e.target.dataset.techIndex, 10); if (this.currentAssignmentTechsData[assignmentId] && this.currentAssignmentTechsData[assignmentId][techIndex]) { this.showTechDetailsModal(this.currentAssignmentTechsData[assignmentId][techIndex], assignmentId, techIndex); } else { console.error('Tech data not found for modal:', assignmentId, techIndex, this.currentAssignmentTechsData); alert('Error: Detailed tech data not found.'); } }); }); } else { cell.textContent = item[headerInfo.key] !== undefined ? String(item[headerInfo.key]) : ''; } }); }); } targetContainer.appendChild(table); this.updateSortIndicators();
    }

    handleSort(columnKey) {
        const header = this.activeTableHeaders.find(h => h.key === columnKey); if (!header || !header.sortable) return; if (this.tableData.some(item => item.applicantDetailsDisplay === 'Loading...') && (columnKey === 'applicantDetailsDisplay' || columnKey === 'appliedCount')) { console.log(`${this.SCRIPT_PREFIX} Worker data still loading, please wait to sort these columns.`); return; } if (this.currentSort.column === columnKey) { this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc'; } else { this.currentSort.column = columnKey; this.currentSort.direction = 'asc'; } this.sortData(); if (this.originalResultsContainer) { this.renderTable(this.tableData, this.activeTableHeaders, this.originalResultsContainer); }
    }

    sortData() {
        const { column, direction } = this.currentSort; const header = this.activeTableHeaders.find(h => h.key === column); if (!header || !header.sortable) return; const sortKey = header.sortKey || column;
        this.tableData.sort((a, b) => { let valA = a[sortKey]; let valB = b[sortKey]; if (sortKey === 'applicantDetailsDisplay' || sortKey === 'appliedCount') { const errorOrLoadingValues = ['error', 'fetch error', 'no id', 'loading...', '...']; if (sortKey === 'appliedCount') { if (typeof valA === 'string' && errorOrLoadingValues.includes(String(valA).toLowerCase())) { } else valA = Number(valA); if (typeof valB === 'string' && errorOrLoadingValues.includes(String(valB).toLowerCase())) { } else valB = Number(valB); } const isValALoadingError = typeof valA === 'string' && errorOrLoadingValues.includes(valA.toLowerCase()); const isValBLoadingError = typeof valB === 'string' && errorOrLoadingValues.includes(valB.toLowerCase()); if (isValALoadingError && !isValBLoadingError) return direction === 'asc' ? 1 : -1; if (!isValALoadingError && isValBLoadingError) return direction === 'asc' ? -1 : 1; if (isValALoadingError && isValBLoadingError) { valA = String(valA || '').toLowerCase(); valB = String(valB || '').toLowerCase(); } } if (typeof valA === 'string' && sortKey !== 'timestamp' && !(typeof valA === 'number')) valA = (valA || '').toLowerCase(); if (typeof valB === 'string' && sortKey !== 'timestamp' && !(typeof valB === 'number')) valB = (valB || '').toLowerCase(); if (valA < valB) return direction === 'asc' ? -1 : 1; if (valA > valB) return direction === 'asc' ? 1 : -1; return 0; });
    }

    updateSortIndicators() {
        const table = document.getElementById('customAssignmentsTable'); if (!table) return; table.querySelectorAll('thead th .sort-arrow').forEach(arrow => arrow.className = 'sort-arrow'); const activeHeaderInfo = this.activeTableHeaders.find(h => h.key === this.currentSort.column); if (activeHeaderInfo && activeHeaderInfo.sortable) { const activeThArrow = table.querySelector(`thead th[data-column="${this.currentSort.column}"] .sort-arrow`); if (activeThArrow) activeThArrow.classList.add(this.currentSort.direction); }
    }

    createTechModal() {
        if (document.getElementById('techDetailModalOverlay')) return; const overlay = document.createElement('div'); overlay.id = 'techDetailModalOverlay'; overlay.className = 'tech-modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) this.closeModal(); }); const modalContent = document.createElement('div'); modalContent.className = 'tech-modal-content'; modalContent.innerHTML = ` <div class="tech-modal-header"> <h3>Technician / Company Details</h3> <button type="button" class="tech-modal-close" aria-label="Close">×</button> </div> <div class="tech-modal-body"> <div id="techModalScoreDisplay" class="overall-score-display" style="display:none;"></div> <div id="techModalDetailsGrid" class="tech-modal-detail-grid"></div> </div> <div class="tech-modal-footer"> <button id="prevTechBtn" class="tech-modal-nav-btn">« Previous</button> <span id="techCounter" style="margin: 0 10px;"></span> <button id="nextTechBtn" class="tech-modal-nav-btn">Next »</button> </div> `; overlay.appendChild(modalContent); document.body.appendChild(overlay); overlay.querySelector('.tech-modal-close').addEventListener('click', () => this.closeModal()); overlay.querySelector('#prevTechBtn').addEventListener('click', () => this.showPrevTech()); overlay.querySelector('#nextTechBtn').addEventListener('click', () => this.showNextTech()); console.log(`${this.SCRIPT_PREFIX} Tech details modal created.`);
    }

    showTechDetailsModal(techFullDataWithScores, assignmentIdForModal, techIndexInAssignment) {
        this.currentModalAssignmentId = assignmentIdForModal; this.currentModalTechIndex = techIndexInAssignment;
        const techRawData = techFullDataWithScores;
        // console.log(`${this.SCRIPT_PREFIX} Showing modal for tech (Assign: ${assignmentIdForModal}, Index: ${techIndexInAssignment}):`, techRawData.company_name || techRawData.name);

        let modalOverlay = document.getElementById('techDetailModalOverlay');
        if (!modalOverlay) { this.createTechModal(); modalOverlay = document.getElementById('techDetailModalOverlay'); }

        const modalScoreDisplay = modalOverlay.querySelector('#techModalScoreDisplay');
        const detailsGrid = modalOverlay.querySelector('#techModalDetailsGrid');
        detailsGrid.innerHTML = ''; // Clear previous details

        if (techRawData.OverallScore !== undefined) {
            modalScoreDisplay.innerHTML = `Overall Score: ${techRawData.OverallScore}
                <span style="font-size:0.8em; display:block;">
                (Cost: ${techRawData.CostScore}, Dist: ${techRawData.DistanceScore}, Stats: ${techRawData.StatsScore})
                </span>
                <span style="font-size:0.7em; display:block; color: #6c757d;">
                CPS: ${techRawData.CPS_Final}, IPS: ${techRawData.IPS}
                </span>`;
            modalScoreDisplay.style.display = 'block';
        } else {
            modalScoreDisplay.style.display = 'none';
        }

        const prevBtn = modalOverlay.querySelector('#prevTechBtn'); const nextBtn = modalOverlay.querySelector('#nextTechBtn'); const counter = modalOverlay.querySelector('#techCounter');
        const techsForCurrentAssignment = this.currentAssignmentTechsData[assignmentIdForModal] || [];
        prevBtn.disabled = techIndexInAssignment <= 0; nextBtn.disabled = techIndexInAssignment >= techsForCurrentAssignment.length - 1;
        counter.textContent = `${techIndexInAssignment + 1} of ${techsForCurrentAssignment.length}`;

        const renderObject = (obj, parentElement, indentLevel = 0) => {
            const keysToExclude = ['avatar_uri', 'avatar_asset_uri', 'encrypted_id', 'valuesWithStringKey', 'tieredPricingMetaData', 'labels', 'dispatcher', 'resource_scorecard_for_company', 'resource_scorecard', 'OverallScore', 'CostScore', 'DistanceScore', 'StatsScore', 'CPS_Final', 'IPS', 'assignmentId', 'raw_worker_data', 'user_id', 'user_number', 'latitude', 'longitude', 'new_user', 'rating_text', 'company_rating_text', 'lane', 'assign_to_first_to_accept', 'blocked', 'tieredPricingMetaData'];
            const priorityFields = [ { key: 'user_uuid', label: 'User Profile Link' }, { key: 'name', label: 'Contact Name' }, { key: 'company_name', label: 'Company' }, { key: 'email', label: 'Email' }, { key: 'work_phone', label: 'Work Phone' }, { key: 'mobile_phone', label: 'Mobile Phone' }, { key: 'address', label: 'Address' }, { key: 'distance', label: 'Distance' }, { key: 'status', label: 'Invitation Status' }, { key: 'sent_on', label: 'Sent On' }, { key: 'declined_on', label: 'Declined On' }, { key: 'question_pending', label: 'Question Pending?' }, { key: 'has_negotiation', label: 'Has Negotiation?' }, { key: 'schedule_conflict', label: 'Schedule Conflict?' } ];

            const createAndAppendDetail = (key, value, label) => {
                const valStr = this.formatValue(value, key);
                if (valStr === 'N/A') return; // Skip N/A values

                const dt = document.createElement('dt'); dt.textContent = (label || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())) + ':';
                const dd = document.createElement('dd');
                if (key === 'user_uuid') { dd.innerHTML = `<a href="https://www.workmarket.com/new-profile/${value}" target="_blank">${value}</a>`; }
                else if (key === 'email' && value) { const currentAssignment = this.tableData.find(a => a.assignmentId === this.currentModalAssignmentId); const subject = encodeURIComponent(`Question regarding WO: ${currentAssignment?.title || this.currentModalAssignmentId || 'Assignment'}`); dd.innerHTML = `<a href="mailto:${value}?subject=${subject}&body=I have a question:">${value}</a>`; }
                else if ((key === 'work_phone' || key === 'mobile_phone') && value) { dd.innerHTML = `<a href="tel:${String(value).replace(/\D/g,'')}">${value}</a>`; }
                else if (key === 'address' && value) { dd.innerHTML = `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}" target="_blank">${value}</a>`; }
                else { dd.textContent = valStr; }
                parentElement.appendChild(dt); parentElement.appendChild(dd);
            };

            priorityFields.forEach(pf => { if (obj.hasOwnProperty(pf.key)) { createAndAppendDetail(pf.key, obj[pf.key], pf.label); } });

            if (obj.has_negotiation && obj.negotiation) {
                const negHeaderDt = document.createElement('dt'); negHeaderDt.className = 'section-header-dt'; negHeaderDt.textContent = 'Negotiation Details'; parentElement.appendChild(negHeaderDt);
                // Iterate negotiation object specifically to control order and labels if needed, or use renderObject for full dump
                for(const negKey in obj.negotiation) { if(obj.negotiation.hasOwnProperty(negKey) && negKey !== 'pricing') createAndAppendDetail(negKey, obj.negotiation[negKey]); }
                if(obj.negotiation.pricing) {
                    const pricingHeaderDt = document.createElement('dt'); pricingHeaderDt.className = 'nested-object-dt'; pricingHeaderDt.textContent = 'Pricing (Negotiation)'; pricingHeaderDt.style.paddingLeft = '15px'; parentElement.appendChild(pricingHeaderDt);
                    for(const priceKey in obj.negotiation.pricing) { if(obj.negotiation.pricing.hasOwnProperty(priceKey)) createAndAppendDetail(priceKey, obj.negotiation.pricing[priceKey]); }
                }
            }

            if (obj.resource_scorecard_for_company && obj.resource_scorecard_for_company.values) { const rscCompHeader = document.createElement('dt'); rscCompHeader.className = 'section-header-dt'; rscCompHeader.textContent = 'Scorecard (For Your Company)'; parentElement.appendChild(rscCompHeader); renderObject(obj.resource_scorecard_for_company.values, parentElement, indentLevel + 1); }
            if (obj.resource_scorecard && obj.resource_scorecard.values) { const rscHeader = document.createElement('dt'); rscHeader.className = 'section-header-dt'; rscHeader.textContent = 'Scorecard (Overall Platform)'; parentElement.appendChild(rscHeader); renderObject(obj.resource_scorecard.values, parentElement, indentLevel + 1); }

            for (const key in obj) { if (obj.hasOwnProperty(key) && !keysToExclude.includes(key) && !priorityFields.find(pf => pf.key === key) && key !== 'negotiation' && key !== 'resource_scorecard' && key !== 'has_negotiation' && key !== 'resource_scorecard_for_company') { createAndAppendDetail(key, obj[key]); } }
        };
        renderObject(techRawData, detailsGrid);
        modalOverlay.style.display = 'flex';
    }

    showPrevTech() { if (this.currentModalAssignmentId && this.currentModalTechIndex > 0) { this.currentModalTechIndex--; const techData = this.currentAssignmentTechsData[this.currentModalAssignmentId][this.currentModalTechIndex]; this.showTechDetailsModal(techData, this.currentModalAssignmentId, this.currentModalTechIndex); } }
    showNextTech() { if (this.currentModalAssignmentId && this.currentAssignmentTechsData[this.currentModalAssignmentId] && this.currentModalTechIndex < this.currentAssignmentTechsData[this.currentModalAssignmentId].length - 1) { this.currentModalTechIndex++; const techData = this.currentAssignmentTechsData[this.currentModalAssignmentId][this.currentModalTechIndex]; this.showTechDetailsModal(techData, this.currentModalAssignmentId, this.currentModalTechIndex); } }
    closeModal() { const modalOverlay = document.getElementById('techDetailModalOverlay'); if (modalOverlay) { modalOverlay.style.display = 'none'; console.log(`${this.SCRIPT_PREFIX} Tech details modal closed.`); } }
    formatValue(value, key = '') { if (value === null || value === undefined || String(value).trim() === '') return 'N/A'; if (typeof value === 'boolean') return value ? 'Yes' : 'No'; const lowerKey = key.toLowerCase(); if (typeof value === 'number' && (lowerKey.includes('price') || lowerKey.includes('cost') || lowerKey.includes('spend') || lowerKey.includes('fee'))) { return `$${value.toFixed(2)}`; } if (lowerKey === 'distance' && typeof value === 'number') return `${value.toFixed(1)} miles`; if (typeof value === 'number' && (lowerKey.includes('percentage') || lowerKey.includes('rate'))) { if (value >= 0 && value <= 1.0001 && !lowerKey.includes('rating')) { return `${(value * 100).toFixed(2)}%`; } return value.toFixed(2); } return String(value); }

    async initializeTransformationSequence() {
        console.log(`${this.SCRIPT_PREFIX} Starting main transformation sequence...`);
        if (!this.originalResultsContainer) { console.error(`${this.SCRIPT_PREFIX} #assignment_list_results somehow became null. Aborting.`); return; }
        this.activeTableHeaders = [ { key: 'checkbox', name: '', type: 'control', sortable: false, className: 'col-checkbox' }, { key: 'title', name: 'Title', type: 'string', sortable: true, className: 'col-title' }, { key: 'status', name: 'Status', type: 'string', sortable: true, className: 'col-status' }, { key: 'appliedCount', name: '#Apld', type: 'number', sortable: true, className: 'col-applied-count' }, { key: 'applicantDetailsDisplay', name: 'Top Applicants', type: 'string', sortable: true, className: 'col-applicant-display' }, { key: 'parsedDate', name: 'Date', type: 'date', sortable: true, sortKey: 'timestamp', className: 'col-parsed-date' }, { key: 'parsedTime', name: 'Time', type: 'string', sortable: true, sortKey: 'timestamp', className: 'col-parsed-time' }, { key: 'siteName', name: 'Site Name', type: 'string', sortable: true, className: 'col-site-name' }, { key: 'city', name: 'City', type: 'string', sortable: true, className: 'col-city' }, { key: 'state', name: 'ST', type: 'string', sortable: true, className: 'col-state' }, { key: 'zip', name: 'Zip', type: 'string', sortable: true, className: 'col-zip' }, { key: 'price', name: 'Price', type: 'number', sortable: true, sortKey: 'priceNumeric', className: 'col-price-col' }, { key: 'labels', name: 'Labels', type: 'string', sortable: true, className: 'col-labels' }, { key: 'graniteTicket', name: 'Ticket #', type: 'string', sortable: true, className: 'col-ticket' }, { key: 'assignmentId', name: 'Assign. ID', type: 'string', sortable: true, className: 'col-assign-id' }, { key: 'lastUpdateText', name: 'Last Update', type: 'string', sortable: true, className: 'col-updated' } ];
        const originalAssignmentNodes = Array.from(this.originalResultsContainer.querySelectorAll(this.assignmentItemSelector));
        if (originalAssignmentNodes.length === 0) { console.warn(`${this.SCRIPT_PREFIX} No assignment items found with selector "${this.assignmentItemSelector}" in #assignment_list_results. HTML:`, this.originalResultsContainer.innerHTML.substring(0, 500) + "..."); this.renderTable([], this.activeTableHeaders, this.originalResultsContainer); return; }
        const initialTableData = originalAssignmentNodes.map(itemNode => { const data = {}; const getText = (selector) => itemNode.querySelector(selector)?.textContent.trim() || ''; data.title = getText('div[style="float: left;"] > strong > a .title'); data.assignmentId = itemNode.querySelector('.assignmentId')?.id || getText('ul.assignment-actions li.fr em').match(/Assign\. ID: (\d+)/)?.[1]; data.applicantDetailsDisplay = 'Loading...'; data.appliedCount = '...'; const fullDateString = getText('.date small.meta span'); const dateParts = this.parseFullDateToParts(fullDateString); if (dateParts && typeof dateParts === 'object') { data.parsedDate = dateParts.date; data.parsedTime = dateParts.time; data.timestamp = dateParts.timestamp; } else { data.parsedDate = 'N/A'; data.parsedTime = 'N/A'; data.timestamp = 0; } return data; });
        this.tableData = initialTableData; this.sortData(); this.renderTable(this.tableData, this.activeTableHeaders, this.originalResultsContainer);
        this.tableData = await this.extractAssignmentsData(originalAssignmentNodes);
        if (this.tableData.length === 0 && originalAssignmentNodes.length > 0) { console.warn(`${this.SCRIPT_PREFIX} Original nodes were found, but full extraction resulted in 0 items.`); }
        const defaultSortHeader = this.activeTableHeaders.find(h => h.key === this.currentSort.column && h.sortable); if (!defaultSortHeader) { const firstSortableColumn = this.activeTableHeaders.find(h => h.sortable); if (firstSortableColumn) { this.currentSort.column = firstSortableColumn.key; this.currentSort.direction = (firstSortableColumn.type === 'date' || firstSortableColumn.type === 'number') ? 'desc' : 'asc'; } } else { if (this.currentSort.column === 'timestamp') { const dateHeader = this.activeTableHeaders.find(h => h.sortKey === 'timestamp'); if (dateHeader) this.currentSort.column = dateHeader.key; } }
        this.sortData(); this.renderTable(this.tableData, this.activeTableHeaders, this.originalResultsContainer);
        console.log(`${this.SCRIPT_PREFIX} All transformations complete. Final table rendered with ${this.tableData.length} assignments.`);
    }

     waitForAssignmentsAndInitialize() {
        const observer = new MutationObserver((mutationsList, obs) => {
            if (this.originalResultsContainer.querySelector(this.assignmentItemSelector)) {
                console.log(`${this.SCRIPT_PREFIX} Assignment items detected by MutationObserver.`);
                obs.disconnect();
                if (!this.transformationInitialized) {
                    this.transformationInitialized = true;
                    this.initializeTransformationSequence().catch(err => {
                        console.error(`${this.SCRIPT_PREFIX} Error during initializeTransformationSequence (from observer):`, err);
                    });
                }
            }
        });
        observer.observe(this.originalResultsContainer, { childList: true, subtree: true });
        setTimeout(() => { // Fallback check
            if (!this.transformationInitialized && this.originalResultsContainer.querySelector(this.assignmentItemSelector)) {
                console.log(`${this.SCRIPT_PREFIX} Assignment items found on fallback check.`);
                observer.disconnect(); this.transformationInitialized = true;
                this.initializeTransformationSequence().catch(err => {
                    console.error(`${this.SCRIPT_PREFIX} Error during initializeTransformationSequence (from fallback):`, err);
                });
            } else if (!this.transformationInitialized) {
                console.log(`${this.SCRIPT_PREFIX} Still waiting for assignment items after initial timeout... Observer is active.`);
            }
        }, 1000); // Increased fallback timeout slightly
    }
} // End of WorkMarketTransformer class

// --- Script Entry Point ---
try {
    if (typeof window.WorkMarketTransformerInstance !== 'undefined' && window.WorkMarketTransformerInstance !== null) {
        console.log(`${SCRIPT_PREFIX} Instance already exists. Not re-initializing.`);
    } else {
        if (document.getElementById('assignment_list_results') && (window.location.href.includes('/assignments') || window.location.href.includes('/workorders'))) {
            console.log(`${SCRIPT_PREFIX} Conditions met. Creating new WorkMarketTransformer instance.`);
            window.WorkMarketTransformerInstance = new WorkMarketTransformer();
        } else {
            console.log(`${SCRIPT_PREFIX} Not on a recognized assignments page or #assignment_list_results not found. Script will not run.`);
        }
    }
} catch (e) {
    console.error(`${SCRIPT_PREFIX} CRITICAL ERROR DURING SCRIPT EXECUTION:`, e);
}

})(); // IIFE ends here
