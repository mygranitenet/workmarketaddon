// ==UserScript==
// @name         WorkMarket - Pop-up Detail Enhancer
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Adds a button to show a pop-up modal with detailed assignment, worker, notes, and log data.
// @author       ilakskills
// @match        https://www.workmarket.com/assignments/details/*
// @grant        GM_addStyle
// ==/UserScript==

(async function() {
    'use strict';
    const SCRIPT_PREFIX = '[WM POPUP ENHANCER V3.0]';
    console.log(`${SCRIPT_PREFIX} Script starting...`);

    // --- CSS for the trigger button and the pop-up modal ---
    const customCss = `
        #enhancer-trigger-btn {
            position: fixed; bottom: 20px; right: 20px; z-index: 9998;
            background-color: #0056b3; color: white; border: none;
            border-radius: 50%; width: 60px; height: 60px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3); cursor: pointer;
            font-size: 24px; display: flex; align-items: center; justify-content: center;
            transition: all 0.2s ease-in-out;
        }
        #enhancer-trigger-btn:hover { background-color: #007bff; transform: scale(1.1); }

        .enhancer-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0,0,0,0.5); z-index: 9999;
            display: none; justify-content: center; align-items: center;
        }
        .enhancer-modal {
            position: absolute; /* Changed from relative for dragging */
            background-color: #f8f9fa; border-radius: 8px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.4);
            width: 90%; max-width: 1200px; height: 85vh;
            display: flex; flex-direction: column;
        }
        .enhancer-header {
            background-color: #343a40; color: white; padding: 10px 15px;
            border-top-left-radius: 8px; border-top-right-radius: 8px;
            display: flex; justify-content: space-between; align-items: center;
            cursor: move;
        }
        .enhancer-header h3 { margin: 0; font-size: 1.1rem; }
        .enhancer-close-btn { background: none; border: none; color: white; font-size: 24px; cursor: pointer; line-height: 1; }
        
        .enhancer-nav { display: flex; background-color: #e9ecef; border-bottom: 1px solid #ccc; flex-shrink: 0; }
        .enhancer-nav button { background: none; border: none; padding: 10px 15px; cursor: pointer; font-size: 14px; font-weight: 500; color: #495057; border-bottom: 3px solid transparent; }
        .enhancer-nav button:hover { background-color: #dde2e6; }
        .enhancer-nav button.active { font-weight: bold; color: #0056b3; border-bottom-color: #0056b3; }

        .enhancer-content-wrapper { flex-grow: 1; overflow-y: auto; background: #fff; }
        .enhancer-content { display: none; padding: 15px; }
        .enhancer-content.active { display: block; }

        .enhancer-loading { font-style: italic; color: #888; padding: 20px; text-align: center; font-size: 1.2em; }
        .enhancer-error { color: #d9534f; font-weight: bold; padding: 20px; }

        /* Table and Grid styles from previous version */
        .enhancer-grid { display: grid; grid-template-columns: minmax(200px, max-content) 1fr; gap: 6px 12px; font-size: 0.9em; }
        .enhancer-grid dt { font-weight: bold; text-align: right; }
        .enhancer-grid dd { word-break: break-word; }
        .enhancer-grid .section-header { grid-column: 1 / -1; background-color: #f0f0f0; padding: 8px; margin-top: 15px; font-weight: bold; border-radius: 4px; }
        .enhancer-table { width: 100%; border-collapse: collapse; font-size: 0.85em; }
        .enhancer-table thead tr { background-color: #4A5568; color: #ffffff; }
        .enhancer-table th, .enhancer-table td { padding: 8px; border: 1px solid #ddd; text-align: left; vertical-align: top;}
        .enhancer-table tbody tr:nth-of-type(even) { background-color: #f9f9f9; }
        .enhancer-table tbody tr:hover { background-color: #f1f1f1; }
        .enhancer-table td a { color: #0056b3; }
        .enhancer-table .col-score { text-align: right; font-weight: bold; }
        .enhancer-table .col-log-text { white-space: pre-wrap; word-break: break-word; }
    `;

    class WorkMarketPopupEnhancer {
        constructor() {
            this.workNumber = this.getWorkNumberFromURL();
            if (!this.workNumber) return;
            this.dataCache = null;
            this.isDragging = false;
            this.dragOffsetX = 0;
            this.dragOffsetY = 0;
            this.injectUI();
        }

        getWorkNumberFromURL() {
            const pathParts = window.location.pathname.split('/');
            return pathParts.pop() || pathParts.pop();
        }

        injectUI() {
            GM_addStyle(customCss);

            // Create Trigger Button
            const triggerBtn = document.createElement('button');
            triggerBtn.id = 'enhancer-trigger-btn';
            triggerBtn.innerHTML = ''; // Package icon
            triggerBtn.title = 'Show Enhanced Details';
            document.body.appendChild(triggerBtn);

            // Create Modal Structure
            const overlay = document.createElement('div');
            overlay.id = 'enhancer-overlay';
            overlay.className = 'enhancer-overlay';
            overlay.innerHTML = `
                <div class="enhancer-modal" id="enhancer-modal">
                    <div class="enhancer-header" id="enhancer-header">
                        <h3>Enhanced Assignment Details (ID: ${this.workNumber})</h3>
                        <button class="enhancer-close-btn" title="Close">×</button>
                    </div>
                    <div class="enhancer-nav" id="enhancer-nav"></div>
                    <div class="enhancer-content-wrapper" id="enhancer-content-wrapper"></div>
                </div>
            `;
            document.body.appendChild(overlay);

            // Add Event Listeners
            triggerBtn.addEventListener('click', () => this.showModal());
            overlay.querySelector('.enhancer-close-btn').addEventListener('click', () => this.hideModal());
            overlay.addEventListener('click', (e) => { if (e.target === overlay) this.hideModal(); });

            // Dragging logic
            const modal = overlay.querySelector('#enhancer-modal');
            const header = overlay.querySelector('#enhancer-header');
            header.addEventListener('mousedown', (e) => {
                this.isDragging = true;
                this.dragOffsetX = e.clientX - modal.offsetLeft;
                this.dragOffsetY = e.clientY - modal.offsetTop;
                document.addEventListener('mousemove', this.onDrag);
                document.addEventListener('mouseup', this.onDragEnd);
            });
        }

        onDrag = (e) => {
            if (!this.isDragging) return;
            const modal = document.getElementById('enhancer-modal');
            modal.style.left = (e.clientX - this.dragOffsetX) + 'px';
            modal.style.top = (e.clientY - this.dragOffsetY) + 'px';
        }

        onDragEnd = () => {
            this.isDragging = false;
            document.removeEventListener('mousemove', this.onDrag);
            document.removeEventListener('mouseup', this.onDragEnd);
        }

        showModal() {
            document.getElementById('enhancer-overlay').style.display = 'flex';
            if (!this.dataCache) {
                this.setupTabsAndFetchData();
            }
        }

        hideModal() {
            document.getElementById('enhancer-overlay').style.display = 'none';
        }

        setupTabsAndFetchData() {
            const navContainer = document.getElementById('enhancer-nav');
            const contentContainer = document.getElementById('enhancer-content-wrapper');
            navContainer.innerHTML = '';
            contentContainer.innerHTML = '<div class="enhancer-loading">Fetching all data...</div>';

            const tabInfo = [
                { id: 'details', label: 'Details' }, { id: 'applicants', label: 'Applicants' },
                { id: 'notes', label: 'Notes' }, { id: 'activity-log', label: 'Activity Log' }
            ];

            tabInfo.forEach((tab, index) => {
                const button = document.createElement('button');
                button.textContent = tab.label;
                button.dataset.target = `enhancer-content-${tab.id}`;
                navContainer.appendChild(button);

                const contentPane = document.createElement('div');
                contentPane.id = `enhancer-content-${tab.id}`;
                contentPane.className = 'enhancer-content';
                contentContainer.appendChild(contentPane);

                if (index === 0) {
                    button.classList.add('active');
                    contentPane.classList.add('active');
                }

                button.addEventListener('click', () => {
                    navContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                    contentContainer.querySelectorAll('.enhancer-content').forEach(cont => cont.classList.remove('active'));
                    button.classList.add('active');
                    document.getElementById(button.dataset.target).classList.add('active');
                });
            });

            this.fetchAllDataAndRender();
        }

        async apiPostRequest(endpoint, payload) {
            const url = `https://www.workmarket.com${endpoint}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json, text/plain, */*', 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            return response.json();
        }

        async fetchAllDataAndRender() {
            const contentContainer = document.getElementById('enhancer-content-wrapper');
            contentContainer.innerHTML = '<div class="enhancer-loading">Fetching all data...</div>';

            const endpoints = {
                details: '/v3/assignment/view',
                workers: '/v3/assignment-details/view-invited-workers',
                notes: '/v3/assignment/view-notes',
                log: '/v3/assignment-details/view-activity-log'
            };
            try {
                const results = await Promise.all(Object.values(endpoints).map(ep => this.apiPostRequest(ep, { workNumber: this.workNumber })));
                this.dataCache = {
                    details: results[0].result?.payload?.[0],
                    workers: results[1].result?.payload?.[0],
                    notes: results[2].result?.payload?.[0],
                    log: results[3].result?.payload?.[0]
                };

                contentContainer.innerHTML = ''; // Clear loading message
                this.setupTabsAndFetchData(); // Re-setup tabs and panes

                // Render content into the newly created panes
                this.renderAssignmentDetails(this.dataCache.details);
                this.renderWorkersTable(this.dataCache.workers);
                this.renderNotes(this.dataCache.notes);
                this.renderActivityLog(this.dataCache.log);

            } catch (error) {
                console.error(`${SCRIPT_PREFIX} Failed to fetch data:`, error);
                contentContainer.innerHTML = `<div class="enhancer-error">Failed to fetch data: ${error.message}</div>`;
            }
        }
        
        // --- RENDER FUNCTIONS ---
        // These now target the panes inside the modal
        renderAssignmentDetails(data) {
            const container = document.getElementById('enhancer-content-details');
            if(!container || !data) { container.innerHTML = '<div class="enhancer-error">Could not load assignment details.</div>'; return; }
            const grid = document.createElement('dl');
            grid.className = 'enhancer-grid';
            // (Same rendering logic as before, just putting it in the right container)
            const createDtDd = (key, value, isHtml = false) => { if (value === null || value === undefined || value === '') return; grid.innerHTML += `<dt>${key}</dt><dd>${isHtml ? value : this.formatValue(value, key)}</dd>`; };
            const renderSection = (title, obj, fieldOrder = null) => { if (!obj || Object.keys(obj).length === 0) return; grid.innerHTML += `<dt class="section-header">${title}</dt><dd></dd>`; const keys = fieldOrder || Object.keys(obj); keys.forEach(key => { if (obj.hasOwnProperty(key)) createDtDd(this.formatKey(key) + ':', this.formatValue(obj[key], key)); }); };
            createDtDd('Title:', data.title); createDtDd('Status:', data.workDisplayStatus); if(data.description) createDtDd('Description:', `<div class="html-content">${data.description}</div>`, true); if(data.instructions) createDtDd('Instructions:', `<div class="html-content">${data.instructions}</div>`, true); renderSection('Schedule', data.schedule); renderSection('Pricing', data.pricing, ['type', 'budget', 'workerMaxEarnings', 'perHourPrice', 'maxNumberOfHours', 'flatPrice']); renderSection('Payment Details', data.pricing?.payment); renderSection('Location', data.location?.address); renderSection('On-Site Contact', data.location?.contact); renderSection('Internal Owner', data.internalOwner);
            container.innerHTML = ''; container.appendChild(grid);
        }

        renderWorkersTable(data) {
            const container = document.getElementById('enhancer-content-applicants');
            if(!container || !data || !data.workers || data.workers.length === 0) { (container || {}).innerHTML = 'No applicants or invited workers found.'; return; }
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

        renderNotes(data) {
            const container = document.getElementById('enhancer-content-notes');
            if(!container || !data || !data.notes || data.notes.length === 0) { (container || {}).innerHTML = 'No notes found.'; return; }
            let tableHTML = `<table class="enhancer-table"><thead><tr><th>Date</th><th>Creator</th><th>Note</th></tr></thead><tbody>`;
            data.notes.forEach(note => { tableHTML += `<tr><td>${new Date(note.createdOn).toLocaleString()}</td><td>${note.creator.firstName} ${note.creator.lastName}</td><td>${note.note}</td></tr>`; });
            container.innerHTML = tableHTML + `</tbody></table>`;
        }

        renderActivityLog(data) {
            const container = document.getElementById('enhancer-content-activity-log');
            if(!container || !data || !data.logEntries || data.logEntries.length === 0) { (container || {}).innerHTML = 'No activity log entries found.'; return; }
            let tableHTML = `<table class="enhancer-table"><thead><tr><th>Date</th><th>Actor</th><th>Action</th></tr></thead><tbody>`;
            data.logEntries.forEach(entry => { tableHTML += `<tr><td>${new Date(entry.createdDate).toLocaleString()}</td><td>${entry.actor.firstName} ${entry.actor.lastName}</td><td class="col-log-text">${entry.text}</td></tr>`; });
            container.innerHTML = tableHTML + `</tbody></table>`;
        }

        // --- UTILITY AND SCORING FUNCTIONS ---
        formatKey(key) { if (!key) return ''; return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); }
        formatValue(value, key = '') {
            if (value === null || value === undefined || String(value).trim() === '') return 'N/A';
            if (typeof value === 'boolean') return value ? 'Yes' : 'No';
            const lowerKey = key.toLowerCase();
            if (typeof value === 'number') {
                if (lowerKey.includes('price') || lowerKey.includes('cost') || lowerKey.includes('spend') || lowerKey.includes('fee') || lowerKey.includes('budget')) return `$${value.toFixed(2)}`;
                if (lowerKey === 'distance') return `${value.toFixed(1)} mi`;
                if ((lowerKey.includes('percentage') || lowerKey.includes('rate') || lowerKey.includes('ratio')) && !lowerKey.includes('rating')) { if (value >= 0 && value <= 1.000001) return `${(value * 100).toFixed(2)}%`; }
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
                if (compCompletedNet90 !== undefined && compCompletedNet90 !== null && compCompletedNet90 > 0) {
                    const satNet90 = rscCompany.SATISFACTION_OVER_ALL?.net90 || 0; const onTimeNet90 = rscCompany.ON_TIME_PERCENTAGE?.net90 || 0; const reliabilityNet90Factor = Math.min(1, (compCompletedNet90 || 0) / 5); const negNet90Count = (rscCompany.CANCELLED_WORK?.net90 || 0) + (rscCompany.LATE_WORK?.net90 || 0) + (rscCompany.ABANDONED_WORK?.net90 || 0); CPS_Final = ((satNet90 * 0.45) + (onTimeNet90 * 0.35) + (reliabilityNet90Factor * 0.20) - (negNet90Count * 0.10)) * 100;
                } else if (rscCompany.COMPLETED_WORK?.all !== undefined && rscCompany.COMPLETED_WORK?.all > 0) {
                    const satAll = rscCompany.SATISFACTION_OVER_ALL?.all || 0; const onTimeAll = rscCompany.ON_TIME_PERCENTAGE?.all || 0; const reliabilityAllFactor = Math.min(1, (rscCompany.COMPLETED_WORK?.all || 0) / 5); const negAllCount = (rscCompany.CANCELLED_WORK?.all || 0) + (rscCompany.LATE_WORK?.all || 0) + (rscCompany.ABANDONED_WORK?.all || 0); const CPS_All_Raw = ((satAll * 0.45) + (onTimeAll * 0.35) + (reliabilityAllFactor * 0.20) - (negAllCount * 0.10)) * 100; CPS_Final = CPS_All_Raw * 0.85;
                }
            }
            let IPS = 50;
            if (rscIndividual?.ratingSummary && rscIndividual?.scores) {
                if (rscIndividual.ratingSummary.count > 0) {
                    const satInd = rscIndividual.ratingSummary.satisfactionRate || 0; const onTimeInd = rscIndividual.scores.ON_TIME_PERCENTAGE?.all || 0; const reliabilityIndFactor = Math.min(1, (rscIndividual.ratingSummary.count || 0) / 50); const negIndCount = (rscIndividual.scores.CANCELLED_WORK?.all || 0) + (rscIndividual.scores.LATE_WORK?.all || 0) + (rscIndividual.scores.ABANDONED_WORK?.all || 0); IPS = ((satInd * 0.40) + (onTimeInd * 0.30) + (reliabilityIndFactor * 0.30) - (negIndCount * 0.02)) * 100;
                }
            } else if (techData.newUser === true) { IPS = 50; }
            if (rscCompany?.COMPLETED_WORK?.net90 > 0) SS = (CPS_Final * 0.80) + (IPS * 0.20);
            else if (rscCompany?.COMPLETED_WORK?.all > 0) SS = (CPS_Final * 0.65) + (IPS * 0.35); else SS = IPS;
            SS = Math.max(0, Math.min(100, SS)); CPS_Final = Math.max(0, Math.min(100, CPS_Final)); IPS = Math.max(0, Math.min(100, IPS)); CS = Math.max(0, Math.min(100, CS)); DS = Math.max(0, Math.min(100, DS));
            OS = (CS * 0.30) + (DS * 0.15) + (SS * 0.55); OS = Math.max(0, Math.min(100, OS));
            return { OverallScore: OS.toFixed(2), CostScore: CS.toFixed(2), DistanceScore: DS.toFixed(2), StatsScore: SS.toFixed(2), CPS_Final: CPS_Final.toFixed(2), IPS: IPS.toFixed(2) };
        }
    }

    // --- Script Entry Point: Detect URL changes for SPA navigation ---
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
            if (location.href.includes('/assignments/details/')) {
                if (!document.getElementById('enhancer-trigger-btn')) {
                    new WorkMarketPopupEnhancer();
                }
            } else {
                const triggerBtn = document.getElementById('enhancer-trigger-btn');
                const overlay = document.getElementById('enhancer-overlay');
                if (triggerBtn) triggerBtn.remove();
                if (overlay) overlay.remove();
            }
        }, 500);
    }
    
    onUrlChange();

})();
