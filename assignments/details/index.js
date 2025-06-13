// ==UserScript==
// @name         WorkMarket - Assignment Page Redesign
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Completely redesigns the assignment details page into a clean, modern dashboard, fetching all relevant data.
// @author       ilakskills
// @match        https://www.workmarket.com/assignments/details/*
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';
    const SCRIPT_PREFIX = '[WM REDESIGN V4.0]';
    console.log(`${SCRIPT_PREFIX} Script starting...`);

    // --- Helper function to inject CSS ---
    function addGlobalStyle(css) {
        const head = document.head || document.getElementsByTagName('head')[0];
        if (!head) { return; }
        const style = document.createElement('style');
        style.id = 'enhancer-redesign-style';
        style.innerHTML = css;
        head.appendChild(style);
    }

    // --- CSS for the new page layout ---
    const customCss = `
        /* Hide original content */
        .page-header, .row_details_assignment { display: none !important; }

        /* New Layout Styles */
        #enhancer-root { padding: 15px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
        #enhancer-container { display: flex; gap: 20px; }
        #enhancer-left-col { width: 320px; flex-shrink: 0; }
        #enhancer-right-col { flex-grow: 1; min-width: 0; /* Prevents flexbox overflow */ }
        
        /* Dashboard Card (Left Column) */
        .enhancer-card { background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .enhancer-card-header { padding: 12px 15px; border-bottom: 1px solid #e9ecef; font-size: 16px; font-weight: 600; color: #343a40; }
        .enhancer-card-body { padding: 15px; }

        /* Data Grid for Dashboard */
        .enhancer-dashboard-grid { display: grid; grid-template-columns: auto 1fr; gap: 10px 10px; align-items: center; }
        .enhancer-dashboard-grid dt { font-weight: 500; color: #6c757d; text-align: right; }
        .enhancer-dashboard-grid dd { font-weight: 500; color: #212529; word-break: break-word; }
        .enhancer-dashboard-grid dd.status { font-weight: 600; padding: 3px 8px; border-radius: 4px; color: #fff; text-align: center; }
        .enhancer-dashboard-grid dd.status-active { background-color: #28a745; }
        .enhancer-dashboard-grid dd.status-default { background-color: #6c757d; }
        .enhancer-dashboard-grid .section-title { grid-column: 1 / -1; font-size: 14px; font-weight: 600; color: #0056b3; margin-top: 10px; padding-bottom: 5px; border-bottom: 2px solid #0056b3; }
        
        /* Accordion (Right Column) */
        .enhancer-accordion-item { border: 1px solid #dee2e6; border-radius: 5px; margin-bottom: 10px; overflow: hidden; }
        .enhancer-accordion-header { background: #f8f9fa; cursor: pointer; padding: 12px 15px; width: 100%; border: none; text-align: left; font-size: 1rem; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }
        .enhancer-accordion-header:hover { background: #e9ecef; }
        .enhancer-accordion-header::after { content: '+'; font-size: 22px; transition: transform 0.2s; }
        .enhancer-accordion-header.active::after { transform: rotate(45deg); }
        .enhancer-accordion-content { padding: 0 15px; max-height: 0; overflow: hidden; transition: all 0.3s ease-in-out; }
        .enhancer-accordion-content.active { max-height: 5000px; padding: 15px; border-top: 1px solid #dee2e6;}

        /* Universal styles */
        .enhancer-loading, .enhancer-error { text-align: center; padding: 40px; font-size: 1.2rem; }
        .enhancer-error { color: #dc3545; }
        .enhancer-table { width: 100%; border-collapse: collapse; font-size: 0.9em; }
        .enhancer-table thead tr { background-color: #e9ecef; color: #495057; font-weight: 600; }
        .enhancer-table th, .enhancer-table td { padding: 10px; border: 1px solid #dee2e6; text-align: left; vertical-align: top;}
        .enhancer-table td a { color: #007bff; }
    `;

    class PageRedesigner {
        constructor() {
            this.workNumber = this.getWorkNumberFromURL();
            if (!this.workNumber) return;
            this.init();
        }

        getWorkNumberFromURL() {
            const pathParts = window.location.pathname.split('/');
            return pathParts.pop() || pathParts.pop();
        }

        async init() {
            console.log(`${SCRIPT_PREFIX} Initializing for Work Order #${this.workNumber}`);
            
            // Clean up previous instances and inject styles
            if (document.getElementById('enhancer-redesign-style')) document.getElementById('enhancer-redesign-style').remove();
            if (document.getElementById('enhancer-root')) document.getElementById('enhancer-root').remove();
            addGlobalStyle(customCss);

            const anchor = document.querySelector('div.main.container');
            if (!anchor) {
                console.error(`${SCRIPT_PREFIX} Main anchor .main.container not found.`);
                return;
            }

            const rootDiv = document.createElement('div');
            rootDiv.id = 'enhancer-root';
            rootDiv.innerHTML = `<div class="enhancer-loading">Loading Enhanced Dashboard...</div>`;
            anchor.prepend(rootDiv);

            try {
                const data = await this.fetchAllData();
                this.render(data);
            } catch (error) {
                rootDiv.innerHTML = `<div class="enhancer-error">Failed to load data: ${error.message}</div>`;
                console.error(`${SCRIPT_PREFIX} Error during fetch:`, error);
            }
        }

        async fetchAllData() {
            const endpoints = { details: '/v3/assignment/view', workers: '/v3/assignment-details/view-invited-workers', notes: '/v3/assignment/view-notes', log: '/v3/assignment-details/view-activity-log' };
            const requests = Object.values(endpoints).map(ep => this.apiPostRequest(ep, { workNumber: this.workNumber }));
            const results = await Promise.all(requests);
            return {
                details: results[0].result?.payload?.[0], workers: results[1].result?.payload?.[0],
                notes: results[2].result?.payload?.[0], log: results[3].result?.payload?.[0]
            };
        }

        async apiPostRequest(endpoint, payload) {
            const url = `https://www.workmarket.com${endpoint}`;
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API Error on ${endpoint}: ${response.status} ${response.statusText}`);
            return response.json();
        }

        render(data) {
            const rootDiv = document.getElementById('enhancer-root');
            rootDiv.innerHTML = `
                <div id="enhancer-container">
                    <div id="enhancer-left-col"></div>
                    <div id="enhancer-right-col"></div>
                </div>
            `;
            this.renderDashboard(data.details, document.getElementById('enhancer-left-col'));
            this.renderAccordion(data, document.getElementById('enhancer-right-col'));
        }

        renderDashboard(details, container) {
            if (!details) { container.innerHTML = '<div class="enhancer-error">Details missing.</div>'; return; }
            const scheduledDate = new Date(details.schedule.from).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
            const scheduledTime = new Date(details.schedule.from).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const dashboardHTML = `
                <div class="enhancer-card">
                    <div class="enhancer-card-header">${details.title}</div>
                    <div class="enhancer-card-body">
                        <dl class="enhancer-dashboard-grid">
                            <dt>Status:</dt>
                            <dd class="status status-${details.workStatus}">${details.workDisplayStatus}</dd>

                            <dt class="section-title" colspan="2">Schedule</dt>
                            <dt>Date:</dt><dd>${scheduledDate}</dd>
                            <dt>Time:</dt><dd>${scheduledTime} ${details.schedule.timeZone}</dd>
                            
                            <dt class="section-title" colspan="2">Location</dt>
                            <dt>Name:</dt><dd>${details.location.name}</dd>
                            <dt>Address:</dt><dd>${details.location.address.address1}<br>${details.location.address.city}, ${details.location.address.state} ${details.location.address.zipCode}</dd>
                            <dt>Contact:</dt><dd>${details.location.contact.firstName} ${details.location.contact.lastName}</dd>
                            
                            <dt class="section-title" colspan="2">Payment</dt>
                            <dt>Rate:</dt><dd>${this.formatValue(details.pricing.perHourPrice || details.pricing.flatPrice || 0, 'cost')} ${details.pricing.type === 'PER_HOUR' ? '/ hr' : '(Flat)'}</dd>
                            <dt>Budget:</dt><dd>${this.formatValue(details.pricing.budget, 'cost')}</dd>
                        </dl>
                    </div>
                </div>
            `;
            container.innerHTML = dashboardHTML;
        }

        renderAccordion(data, container) {
             const sections = [
                { id: 'applicants', label: `Applicants (${data.workers?.workers?.length || 0})`, renderer: this.renderWorkersTable, data: data.workers, active: true },
                { id: 'notes', label: `Notes (${data.notes?.notes?.length || 0})`, renderer: this.renderNotes, data: data.notes, active: false },
                { id: 'activity', label: `Activity Log (${data.log?.logEntries?.length || 0})`, renderer: this.renderActivityLog, data: data.log, active: false }
             ];
             
             sections.forEach(section => {
                 const contentHTML = section.renderer.call(this, section.data);
                 container.innerHTML += `
                    <div class="enhancer-accordion-item">
                        <button class="enhancer-accordion-header ${section.active ? 'active' : ''}">${section.label}</button>
                        <div class="enhancer-accordion-content ${section.active ? 'active' : ''}">${contentHTML}</div>
                    </div>
                 `;
             });
             
             container.querySelectorAll('.enhancer-accordion-header').forEach(header => {
                 header.addEventListener('click', () => {
                     header.classList.toggle('active');
                     header.nextElementSibling.classList.toggle('active');
                 });
             });
        }
        
        renderWorkersTable(data) {
            if (!data || !data.workers || data.workers.length === 0) return 'No applicants found.';
            let tableHTML = `<table class="enhancer-table"><thead><tr><th>Name/Company</th><th>Status</th><th>Distance</th><th>Overall Score</th></tr></thead><tbody>`;
            data.workers.forEach(worker => {
                const scores = this.calculateOverallScore(worker); const user = worker.user; const company = worker.company;
                const displayName = company.name === 'Sole Proprietor' ? `${user.firstName} ${user.lastName}` : company.name;
                tableHTML += `<tr><td><a href="/new-profile/${user.userUuid}" target="_blank"><strong>${displayName}</strong></a></td><td>${this.formatKey(worker.status)}</td><td>${this.formatValue(worker.distance, 'distance')}</td><td class="col-score">${scores.OverallScore}</td></tr>`;
            });
            return tableHTML + `</tbody></table>`;
        }
        
        renderNotes(data) {
            if (!data || !data.notes || data.notes.length === 0) return 'No notes found.';
            let tableHTML = `<table class="enhancer-table"><thead><tr><th>Date</th><th>Creator</th><th>Note</th></tr></thead><tbody>`;
            data.notes.forEach(note => { tableHTML += `<tr><td>${new Date(note.createdOn).toLocaleString()}</td><td>${note.creator.firstName} ${note.creator.lastName}</td><td>${note.note}</td></tr>`; });
            return tableHTML + `</tbody></table>`;
        }

        renderActivityLog(data) {
            if (!data || !data.logEntries || data.logEntries.length === 0) return 'No activity log entries found.';
            let tableHTML = `<table class="enhancer-table"><thead><tr><th>Date</th><th>Actor</th><th>Action</th></tr></thead><tbody>`;
            data.logEntries.forEach(entry => { tableHTML += `<tr><td>${new Date(entry.createdDate).toLocaleString()}</td><td>${entry.actor.firstName} ${entry.actor.lastName}</td><td class="col-log-text">${entry.text}</td></tr>`; });
            return tableHTML + `</tbody></table>`;
        }

        // UTILITY AND SCORING FUNCTIONS (UNCHANGED)
        formatKey(key) { if (!key) return ''; return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); }
        formatValue(value, key = '') {
            if (value === null || value === undefined || String(value).trim() === '') return 'N/A';
            if (typeof value === 'boolean') return value ? 'Yes' : 'No';
            const lowerKey = key.toLowerCase();
            if (typeof value === 'number') {
                if (lowerKey.includes('cost') || lowerKey.includes('budget') || lowerKey.includes('price')) return `$${value.toFixed(2)}`;
                if (lowerKey === 'distance') return `${value.toFixed(1)} mi`;
                return value.toFixed(2);
            }
            return String(value);
        }
        calculateOverallScore(techData, assignmentBudget = 350) {
            let CS = 50, DS = 0, SS = 50, OS = 0; const totalCost = techData.negotiation?.pricing?.total_cost;
            if (totalCost !== undefined && totalCost !== null) { CS = Math.max(0, (1 - (parseFloat(totalCost) / assignmentBudget)) * 100); }
            const distance = techData.distance;
            if (distance !== undefined && distance !== null) {
                if (distance <= 40) DS = Math.max(0, (1 - (distance / 80)) * 100); else if (distance <= 60) DS = 20; else if (distance <= 80) DS = 10; else DS = 0;
            }
            let CPS_Final = 50; const rscCompany = techData.resourceCompanyScoreCard?.scores; const rscIndividual = techData.resourceScoreCard;
            if (rscCompany) {
                const compCompletedNet90 = rscCompany.COMPLETED_WORK?.net90;
                if (compCompletedNet90 > 0) { const satNet90 = rscCompany.SATISFACTION_OVER_ALL?.net90 || 0; const onTimeNet90 = rscCompany.ON_TIME_PERCENTAGE?.net90 || 0; const reliabilityNet90Factor = Math.min(1, (compCompletedNet90 || 0) / 5); const negNet90Count = (rscCompany.CANCELLED_WORK?.net90 || 0) + (rscCompany.LATE_WORK?.net90 || 0) + (rscCompany.ABANDONED_WORK?.net90 || 0); CPS_Final = ((satNet90 * 0.45) + (onTimeNet90 * 0.35) + (reliabilityNet90Factor * 0.20) - (negNet90Count * 0.10)) * 100;
                } else if (rscCompany.COMPLETED_WORK?.all > 0) { const satAll = rscCompany.SATISFACTION_OVER_ALL?.all || 0; const onTimeAll = rscCompany.ON_TIME_PERCENTAGE?.all || 0; const reliabilityAllFactor = Math.min(1, (rscCompany.COMPLETED_WORK?.all || 0) / 5); const negAllCount = (rscCompany.CANCELLED_WORK?.all || 0) + (rscCompany.LATE_WORK?.all || 0) + (rscCompany.ABANDONED_WORK?.all || 0); const CPS_All_Raw = ((satAll * 0.45) + (onTimeAll * 0.35) + (reliabilityAllFactor * 0.20) - (negAllCount * 0.10)) * 100; CPS_Final = CPS_All_Raw * 0.85; }
            }
            let IPS = 50;
            if (rscIndividual?.ratingSummary?.count > 0) { const satInd = rscIndividual.ratingSummary.satisfactionRate || 0; const onTimeInd = rscIndividual.scores.ON_TIME_PERCENTAGE?.all || 0; const reliabilityIndFactor = Math.min(1, (rscIndividual.ratingSummary.count || 0) / 50); const negIndCount = (rscIndividual.scores.CANCELLED_WORK?.all || 0) + (rscIndividual.scores.LATE_WORK?.all || 0) + (rscIndividual.scores.ABANDONED_WORK?.all || 0); IPS = ((satInd * 0.40) + (onTimeInd * 0.30) + (reliabilityIndFactor * 0.30) - (negIndCount * 0.02)) * 100; }
            else if (techData.newUser === true) { IPS = 50; }
            if (rscCompany?.COMPLETED_WORK?.net90 > 0) SS = (CPS_Final * 0.80) + (IPS * 0.20); else if (rscCompany?.COMPLETED_WORK?.all > 0) SS = (CPS_Final * 0.65) + (IPS * 0.35); else SS = IPS;
            SS = Math.max(0, Math.min(100, SS)); CPS_Final = Math.max(0, Math.min(100, CPS_Final)); IPS = Math.max(0, Math.min(100, IPS)); CS = Math.max(0, Math.min(100, CS)); DS = Math.max(0, Math.min(100, DS));
            OS = (CS * 0.30) + (DS * 0.15) + (SS * 0.55); OS = Math.max(0, Math.min(100, OS));
            return { OverallScore: OS.toFixed(2), CostScore: CS.toFixed(2), DistanceScore: DS.toFixed(2), StatsScore: SS.toFixed(2), CPS_Final: CPS_Final.toFixed(2), IPS: IPS.toFixed(2) };
        }
    }

    // --- Script Entry Point & SPA Navigation Handler ---
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            onUrlChange();
        }
    }).observe(document.body, { subtree: true, childList: true });

    function onUrlChange() {
        setTimeout(() => {
            const rootEl = document.getElementById('enhancer-root');
            if (location.href.includes('/assignments/details/')) {
                if (!rootEl) new PageRedesigner();
            } else {
                if (rootEl) rootEl.remove();
            }
        }, 500);
    }
    
    onUrlChange();

})();
