// ==UserScript==
// @name         WorkMarket - Pop-up Detail Enhancer
// @version      3.3
// @description  Adds a button to show a pop-up modal with a user-friendly, single-page accordion view of all assignment data.
// @author       ilakskills
// @match        https://www.workmarket.com/assignments/details/*
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';
    const SCRIPT_PREFIX = '[WM POPUP ENHANCER V3.3]';
    console.log(`${SCRIPT_PREFIX} Script starting...`);

    function addGlobalStyle(css) {
        const head = document.head || document.getElementsByTagName('head')[0];
        if (!head) { return; }
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        head.appendChild(style);
    }

    const customCss = `
        #enhancer-trigger-btn { position: fixed; bottom: 20px; right: 20px; z-index: 9998; background-color: #0056b3; color: white; border: none; border-radius: 50%; width: 60px; height: 60px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); cursor: pointer; font-size: 24px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease-in-out; }
        #enhancer-trigger-btn:hover { background-color: #007bff; transform: scale(1.1); }

        .enhancer-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 9999; display: none; justify-content: center; align-items: center; }
        .enhancer-modal { position: absolute; background-color: #fff; border-radius: 8px; box-shadow: 0 5px 20px rgba(0,0,0,0.4); width: 90%; max-width: 1200px; height: 85vh; display: flex; flex-direction: column; }
        .enhancer-header { background-color: #343a40; color: white; padding: 10px 15px; border-top-left-radius: 8px; border-top-right-radius: 8px; display: flex; justify-content: space-between; align-items: center; cursor: move; }
        .enhancer-header h3 { margin: 0; font-size: 1.1rem; }
        .enhancer-close-btn { background: none; border: none; color: white; font-size: 24px; cursor: pointer; line-height: 1; }

        .enhancer-main-content { flex-grow: 1; overflow-y: auto; padding: 10px; }
        
        /* Accordion Styles */
        .enhancer-accordion-item { border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px; overflow: hidden; }
        .enhancer-accordion-header { background-color: #f7f7f7; color: #333; cursor: pointer; padding: 12px 15px; width: 100%; border: none; text-align: left; font-size: 16px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; }
        .enhancer-accordion-header:hover { background-color: #e9e9e9; }
        .enhancer-accordion-header::after { content: '+'; font-size: 20px; font-weight: bold; transition: transform 0.2s ease-in-out; }
        .enhancer-accordion-header.active::after { transform: rotate(45deg); }
        .enhancer-accordion-content { padding: 0 15px; max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out, padding 0.3s ease-out; background: #fff; }
        .enhancer-accordion-content.active { max-height: 2000px; /* Large enough for content */ padding: 15px; }

        /* General & Table Styles */
        .enhancer-loading { font-style: italic; color: #888; padding: 20px; text-align: center; font-size: 1.2em; }
        .enhancer-error { color: #d9534f; font-weight: bold; padding: 20px; }
        .enhancer-grid { display: grid; grid-template-columns: minmax(180px, max-content) 1fr; gap: 8px 15px; font-size: 0.9em; }
        .enhancer-grid dt { font-weight: bold; text-align: right; color: #555; }
        .enhancer-grid dd { word-break: break-word; }
        .enhancer-table { width: 100%; border-collapse: collapse; font-size: 0.85em; }
        .enhancer-table thead tr { background-color: #4A5568; color: #ffffff; }
        .enhancer-table th, .enhancer-table td { padding: 8px; border: 1px solid #ddd; text-align: left; vertical-align: top;}
        .enhancer-table tbody tr:nth-child(even) { background-color: #f9f9f9; }
    `;

    class WorkMarketPopupEnhancer {
        constructor() {
            this.workNumber = this.getWorkNumberFromURL();
            if (!this.workNumber) return;
            this.dataCache = null;
            this.isDragging = false;
            this.dragOffsetX = 0;
            this.dragOffsetY = 0;
            this.injectTrigger();
        }

        getWorkNumberFromURL() {
            const pathParts = window.location.pathname.split('/');
            return pathParts.pop() || pathParts.pop();
        }

        injectTrigger() {
            addGlobalStyle(customCss);
            const triggerBtn = document.createElement('button');
            triggerBtn.id = 'enhancer-trigger-btn';
            triggerBtn.innerHTML = '';
            triggerBtn.title = 'Show Enhanced Details';
            document.body.appendChild(triggerBtn);
            triggerBtn.addEventListener('click', () => this.showModal());
        }

        injectModal() {
            const overlay = document.createElement('div');
            overlay.id = 'enhancer-overlay';
            overlay.className = 'enhancer-overlay';
            overlay.innerHTML = `
                <div class="enhancer-modal" id="enhancer-modal">
                    <div class="enhancer-header" id="enhancer-header">
                        <h3>Enhanced Assignment Details (ID: ${this.workNumber})</h3>
                        <button class="enhancer-close-btn" title="Close">×</button>
                    </div>
                    <div class="enhancer-main-content" id="enhancer-main-content">
                        <div class="enhancer-loading">Fetching all data...</div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            overlay.querySelector('.enhancer-close-btn').addEventListener('click', () => this.hideModal());
            overlay.addEventListener('click', (e) => { if (e.target === overlay) this.hideModal(); });

            const modal = overlay.querySelector('#enhancer-modal');
            const header = overlay.querySelector('#enhancer-header');
            header.addEventListener('mousedown', this.onDragStart);
        }

        onDragStart = (e) => {
            this.isDragging = true;
            const modal = document.getElementById('enhancer-modal');
            this.dragOffsetX = e.clientX - modal.offsetLeft;
            this.dragOffsetY = e.clientY - modal.offsetTop;
            document.addEventListener('mousemove', this.onDrag);
            document.addEventListener('mouseup', this.onDragEnd);
        }
        onDrag = (e) => { if (this.isDragging) { const modal = document.getElementById('enhancer-modal'); modal.style.left = (e.clientX - this.dragOffsetX) + 'px'; modal.style.top = (e.clientY - this.dragOffsetY) + 'px'; }}
        onDragEnd = () => { this.isDragging = false; document.removeEventListener('mousemove', this.onDrag); document.removeEventListener('mouseup', this.onDragEnd); }

        showModal() {
            if (!document.getElementById('enhancer-overlay')) {
                this.injectModal();
            }
            document.getElementById('enhancer-overlay').style.display = 'flex';
            if (!this.dataCache) {
                this.fetchAllDataAndBuildUI();
            }
        }

        hideModal() {
            const overlay = document.getElementById('enhancer-overlay');
            if (overlay) overlay.style.display = 'none';
        }

        async fetchAllDataAndBuildUI() {
            const endpoints = { details: '/v3/assignment/view', workers: '/v3/assignment-details/view-invited-workers', notes: '/v3/assignment/view-notes', log: '/v3/assignment-details/view-activity-log' };
            try {
                const results = await Promise.all(Object.values(endpoints).map(ep => this.apiPostRequest(ep, { workNumber: this.workNumber })));
                this.dataCache = {
                    details: results[0].result?.payload?.[0], workers: results[1].result?.payload?.[0],
                    notes: results[2].result?.payload?.[0], log: results[3].result?.payload?.[0]
                };
                this.buildAccordionUI();
            } catch (error) {
                console.error(`${SCRIPT_PREFIX} Failed to fetch data:`, error);
                document.getElementById('enhancer-main-content').innerHTML = `<div class="enhancer-error">Failed to fetch data: ${error.message}</div>`;
            }
        }
        
        buildAccordionUI() {
            const mainContainer = document.getElementById('enhancer-main-content');
            mainContainer.innerHTML = ''; // Clear loading message

            const sectionInfo = [
                { id: 'details', label: 'Assignment Details', renderer: this.renderAssignmentDetails, data: this.dataCache.details, active: true },
                { id: 'applicants', label: `Applicants (${this.dataCache.workers?.workers?.length || 0})`, renderer: this.renderWorkersTable, data: this.dataCache.workers, active: true },
                { id: 'notes', label: `Notes (${this.dataCache.notes?.notes?.length || 0})`, renderer: this.renderNotes, data: this.dataCache.notes, active: false },
                { id: 'activity-log', label: `Activity Log (${this.dataCache.log?.logEntries?.length || 0})`, renderer: this.renderActivityLog, data: this.dataCache.log, active: false }
            ];

            sectionInfo.forEach(section => {
                const item = document.createElement('div');
                item.className = 'enhancer-accordion-item';

                const header = document.createElement('button');
                header.className = 'enhancer-accordion-header';
                header.textContent = section.label;

                const content = document.createElement('div');
                content.className = 'enhancer-accordion-content';

                item.appendChild(header);
                item.appendChild(content);
                mainContainer.appendChild(item);

                // Render content immediately
                section.renderer.call(this, section.data, content);

                if (section.active) {
                    header.classList.add('active');
                    content.classList.add('active');
                }

                header.addEventListener('click', () => {
                    header.classList.toggle('active');
                    content.classList.toggle('active');
                });
            });
        }
        
        async apiPostRequest(endpoint, payload) {
            const url = `https://www.workmarket.com${endpoint}`;
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json, text/plain, */*', 'X-Requested-With': 'XMLHttpRequest' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            return response.json();
        }

        // --- RENDER FUNCTIONS (now accept a container argument) ---
        renderAssignmentDetails(data, container) {
            if(!data) { container.innerHTML = '<div class="enhancer-error">No details data.</div>'; return; }
            const grid = document.createElement('dl'); grid.className = 'enhancer-grid';
            const createDtDd = (key, value, isHtml = false) => { if (value === null || value === undefined || value === '') return; grid.innerHTML += `<dt>${key}</dt><dd>${isHtml ? value : this.formatValue(value, key)}</dd>`; };
            createDtDd('Title:', data.title); createDtDd('Status:', data.workDisplayStatus); if(data.description) createDtDd('Description:', `<div class="html-content">${data.description}</div>`, true); if(data.instructions) createDtDd('Instructions:', `<div class="html-content">${data.instructions}</div>`, true);
            container.appendChild(grid);
        }

        renderWorkersTable(data, container) {
            if (!data || !data.workers || data.workers.length === 0) { container.innerHTML = 'No applicants found.'; return; }
            let tableHTML = `<table class="enhancer-table"><thead><tr><th>Name / Company</th><th>Contact</th><th>Status</th><th>Distance</th><th>Overall Score</th><th>Stats</th></tr></thead><tbody>`;
            data.workers.forEach(worker => {
                const scores = this.calculateOverallScore(worker); const user = worker.user; const company = worker.company;
                const displayName = company.name === 'Sole Proprietor' ? `${user.firstName} ${user.lastName}` : company.name;
                let contactInfo = (user.email ? `<div><a href="mailto:${user.email}">${user.email}</a></div>` : '') + (user.phoneNumber?.phoneNumber ? `<div>${user.phoneNumber.phoneNumber} (W)</div>` : '') + (user.mobilePhoneNumber?.phoneNumber ? `<div>${user.mobilePhoneNumber.phoneNumber} (M)</div>` : '');
                const stats = `Cost: ${scores.CostScore}, Dist: ${scores.DistanceScore}, Perf: ${scores.StatsScore}<br/><small>(CPS: ${scores.CPS_Final}, IPS: ${scores.IPS})</small>`;
                tableHTML += `<tr><td><a href="https://www.workmarket.com/new-profile/${user.userUuid}" target="_blank"><strong>${displayName}</strong></a>${company.name !== 'Sole Proprietor' ? `<div><small>(${user.firstName} ${user.lastName})</small></div>` : ''}</td><td>${contactInfo}</td><td>${this.formatKey(worker.status)}</td><td>${this.formatValue(worker.distance, 'distance')}</td><td class="col-score">${scores.OverallScore}</td><td>${stats}</td></tr>`;
            });
            container.innerHTML = tableHTML + `</tbody></table>`;
        }

        renderNotes(data, container) {
            if (!data || !data.notes || data.notes.length === 0) { container.innerHTML = 'No notes found.'; return; }
            let tableHTML = `<table class="enhancer-table"><thead><tr><th>Date</th><th>Creator</th><th>Note</th></tr></thead><tbody>`;
            data.notes.forEach(note => { tableHTML += `<tr><td>${new Date(note.createdOn).toLocaleString()}</td><td>${note.creator.firstName} ${note.creator.lastName}</td><td>${note.note}</td></tr>`; });
            container.innerHTML = tableHTML + `</tbody></table>`;
        }

        renderActivityLog(data, container) {
            if (!data || !data.logEntries || data.logEntries.length === 0) { container.innerHTML = 'No activity log entries found.'; return; }
            let tableHTML = `<table class="enhancer-table"><thead><tr><th>Date</th><th>Actor</th><th>Action</th></tr></thead><tbody>`;
            data.logEntries.forEach(entry => { tableHTML += `<tr><td>${new Date(entry.createdDate).toLocaleString()}</td><td>${entry.actor.firstName} ${entry.actor.lastName}</td><td class="col-log-text">${entry.text}</td></tr>`; });
            container.innerHTML = tableHTML + `</tbody></table>`;
        }
        
        // --- UTILITY AND SCORING FUNCTIONS ---
        formatKey(key) { if (!key) return ''; return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); }
        formatValue(value, key = '') { /* ... unchanged ... */ if (value === null || value === undefined || String(value).trim() === '') return 'N/A'; if (typeof value === 'boolean') return value ? 'Yes' : 'No'; const lowerKey = key.toLowerCase(); if (typeof value === 'number') { if (lowerKey.includes('price') || lowerKey.includes('cost') || lowerKey.includes('spend') || lowerKey.includes('fee') || lowerKey.includes('budget')) return `$${value.toFixed(2)}`; if (lowerKey === 'distance') return `${value.toFixed(1)} mi`; if ((lowerKey.includes('percentage') || lowerKey.includes('rate') || lowerKey.includes('ratio')) && !lowerKey.includes('rating')) { if (value >= 0 && value <= 1.000001) return `${(value * 100).toFixed(2)}%`; } return value.toFixed(2); } return String(value); }
        calculateOverallScore(techData, assignmentBudget = 350) { /* ... unchanged ... */ let CS = 50, DS = 0, SS = 50, OS = 0; const totalCost = techData.negotiation?.pricing?.total_cost; if (totalCost !== undefined && totalCost !== null) { CS = Math.max(0, (1 - (parseFloat(totalCost) / assignmentBudget)) * 100); } const distance = techData.distance; if (distance !== undefined && distance !== null) { if (distance <= 40) DS = Math.max(0, (1 - (distance / 80)) * 100); else if (distance <= 60) DS = 20; else if (distance <= 80) DS = 10; else DS = 0; } let CPS_Final = 50; const rscCompany = techData.resourceCompanyScoreCard?.scores; const rscIndividual = techData.resourceScoreCard; if (rscCompany) { const compCompletedNet90 = rscCompany.COMPLETED_WORK?.net90; if (compCompletedNet90 !== undefined && compCompletedNet90 !== null && compCompletedNet90 > 0) { const satNet90 = rscCompany.SATISFACTION_OVER_ALL?.net90 || 0; const onTimeNet90 = rscCompany.ON_TIME_PERCENTAGE?.net90 || 0; const reliabilityNet90Factor = Math.min(1, (compCompletedNet90 || 0) / 5); const negNet90Count = (rscCompany.CANCELLED_WORK?.net90 || 0) + (rscCompany.LATE_WORK?.net90 || 0) + (rscCompany.ABANDONED_WORK?.net90 || 0); CPS_Final = ((satNet90 * 0.45) + (onTimeNet90 * 0.35) + (reliabilityNet90Factor * 0.20) - (negNet90Count * 0.10)) * 100; } else if (rscCompany.COMPLETED_WORK?.all !== undefined && rscCompany.COMPLETED_WORK?.all > 0) { const satAll = rscCompany.SATISFACTION_OVER_ALL?.all || 0; const onTimeAll = rscCompany.ON_TIME_PERCENTAGE?.all || 0; const reliabilityAllFactor = Math.min(1, (rscCompany.COMPLETED_WORK?.all || 0) / 5); const negAllCount = (rscCompany.CANCELLED_WORK?.all || 0) + (rscCompany.LATE_WORK?.all || 0) + (rscCompany.ABANDONED_WORK?.all || 0); const CPS_All_Raw = ((satAll * 0.45) + (onTimeAll * 0.35) + (reliabilityAllFactor * 0.20) - (negAllCount * 0.10)) * 100; CPS_Final = CPS_All_Raw * 0.85; } } let IPS = 50; if (rscIndividual?.ratingSummary && rscIndividual?.scores) { if (rscIndividual.ratingSummary.count > 0) { const satInd = rscIndividual.ratingSummary.satisfactionRate || 0; const onTimeInd = rscIndividual.scores.ON_TIME_PERCENTAGE?.all || 0; const reliabilityIndFactor = Math.min(1, (rscIndividual.ratingSummary.count || 0) / 50); const negIndCount = (rscIndividual.scores.CANCELLED_WORK?.all || 0) + (rscIndividual.scores.LATE_WORK?.all || 0) + (rscIndividual.scores.ABANDONED_WORK?.all || 0); IPS = ((satInd * 0.40) + (onTimeInd * 0.30) + (reliabilityIndFactor * 0.30) - (negIndCount * 0.02)) * 100; } } else if (techData.newUser === true) { IPS = 50; } if (rscCompany?.COMPLETED_WORK?.net90 > 0) SS = (CPS_Final * 0.80) + (IPS * 0.20); else if (rscCompany?.COMPLETED_WORK?.all > 0) SS = (CPS_Final * 0.65) + (IPS * 0.35); else SS = IPS; SS = Math.max(0, Math.min(100, SS)); CPS_Final = Math.max(0, Math.min(100, CPS_Final)); IPS = Math.max(0, Math.min(100, IPS)); CS = Math.max(0, Math.min(100, CS)); DS = Math.max(0, Math.min(100, DS)); OS = (CS * 0.30) + (DS * 0.15) + (SS * 0.55); OS = Math.max(0, Math.min(100, OS)); return { OverallScore: OS.toFixed(2), CostScore: CS.toFixed(2), DistanceScore: DS.toFixed(2), StatsScore: SS.toFixed(2), CPS_Final: CPS_Final.toFixed(2), IPS: IPS.toFixed(2) }; }
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
            const enhancerBtn = document.getElementById('enhancer-trigger-btn');
            if (location.href.includes('/assignments/details/')) {
                if (!enhancerBtn) { new WorkMarketPopupEnhancer(); }
            } else {
                if (enhancerBtn) enhancerBtn.remove();
                const overlay = document.getElementById('enhancer-overlay');
                if (overlay) overlay.remove();
            }
        }, 500);
    }
    
    onUrlChange();

})();
