// ==UserScript==
// @name         WorkMarket - Enhanced Assignment Details
// @namespace    http://tampermonkey.net/
// @version      2.4
// @description  Fetches detailed assignment, worker, notes, and log data from v3 APIs and displays it in new tabs on the assignment details page.
// @author       ilakskills
// @match        https://www.workmarket.com/assignments/details/*
// @grant        GM_addStyle
// ==/UserScript==

(async function() {
    'use strict';
    const SCRIPT_PREFIX = '[WM DETAIL ENHANCER V2.4]';
    console.log(`${SCRIPT_PREFIX} Script starting...`);

    // --- Custom CSS for new tabs and content ---
    const customCss = `
        /* Tab and Content Styling */
        .enhancer-tab-content { padding: 15px; background-color: #fff; }
        .wm-tab--content:not(.-active) { display: none; } /* Ensure only active tab is shown */

        .enhancer-loading { font-style: italic; color: #888; padding: 20px; text-align: center; font-size: 1.2em; }
        .enhancer-error { color: #d9534f; font-weight: bold; }

        /* Generic Data Grid (for Details tab) */
        .enhancer-grid { display: grid; grid-template-columns: minmax(200px, max-content) 1fr; gap: 6px 12px; font-size: 0.9em; }
        .enhancer-grid dt { font-weight: bold; color: #444; text-align: right; grid-column: 1; }
        .enhancer-grid dd { margin-left: 0; grid-column: 2; word-break: break-word; }
        .enhancer-grid .section-header { grid-column: 1 / -1; background-color: #f7f7f7; color: #333; padding: 8px; margin-top: 15px; font-weight: bold; border-radius: 4px; text-align: left; border-bottom: 2px solid #e7e7e7;}
        .enhancer-grid .html-content { padding: 10px; border: 1px solid #eee; margin-top: 5px; background-color: #fdfdfd; max-height: 250px; overflow-y: auto; white-space: pre-wrap; }
        .enhancer-grid .html-content a { color: #337ab7; }
        .enhancer-grid ul { padding-left: 20px; margin-top: 0; }

        /* Table Styling (for Applicants, Notes, Log) */
        .enhancer-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.85em; box-shadow: 0 0 8px rgba(0,0,0,0.1); }
        .enhancer-table thead tr { background-color: #4A5568; color: #ffffff; text-align: left; }
        .enhancer-table th, .enhancer-table td { padding: 6px 8px; border: 1px solid #ddd; vertical-align: top; }
        .enhancer-table tbody tr:nth-of-type(even) { background-color: #f9f9f9; }
        .enhancer-table tbody tr:hover { background-color: #f1f1f1; }
        .enhancer-table td a { color: #337ab7; text-decoration: none; }
        .enhancer-table td a:hover { text-decoration: underline; }
        .enhancer-table .col-score { text-align: right; font-weight: bold; }
        .enhancer-table .col-log-text { white-space: pre-wrap; }
        .enhancer-table .col-log-text strong { font-weight: 600; color: #222; }
    `;

    class WorkMarketDetailEnhancer {
        constructor() {
            this.workNumber = this.getWorkNumberFromURL();
            if (!this.workNumber) {
                console.error(`${SCRIPT_PREFIX} Could not find workNumber in URL. Aborting.`);
                return;
            }
            console.log(`${SCRIPT_PREFIX} Found workNumber: ${this.workNumber}`);
            this.injectUI();
            this.fetchAllDataAndRender();
        }

        getWorkNumberFromURL() {
            const pathParts = window.location.pathname.split('/');
            return pathParts.pop() || pathParts.pop(); // Handles trailing slash
        }

        injectUI() {
            const tabContainer = document.querySelector('ul.wm-tabs');
            const tabContentContainer = document.querySelector('div.content');
            if (!tabContainer || !tabContentContainer) {
                console.error(`${SCRIPT_PREFIX} Could not find tab containers (ul.wm-tabs / div.content). Cannot inject UI.`);
                return;
            }

            tabContainer.querySelectorAll('.enhancer-injected-tab').forEach(el => el.remove());
            tabContentContainer.querySelectorAll('.enhancer-tab-content').forEach(el => el.remove());

            const tabInfo = [
                { id: 'enhanced-details', label: 'Enhanced Details' },
                { id: 'applicants', label: 'Applicants' },
                { id: 'notes', label: 'Notes' },
                { id: 'activity-log', label: 'Activity Log' }
            ];

            tabInfo.forEach((tab) => {
                const li = document.createElement('li');
                li.className = 'wm-tab enhancer-injected-tab';
                li.dataset.content = `#${tab.id}`;
                li.textContent = tab.label;
                tabContainer.appendChild(li);

                const pane = document.createElement('div');
                pane.id = tab.id;
                pane.className = 'wm-tab--content enhancer-tab-content';
                pane.innerHTML = `<div class="enhancer-loading">Loading ${tab.label}...</div>`;
                tabContentContainer.appendChild(pane);
            });

            // Re-initialize or delegate tab click events
            tabContainer.addEventListener('click', (e) => {
                const clickedTab = e.target.closest('.wm-tab');
                if (!clickedTab) return;
                
                const targetContentSelector = clickedTab.dataset.content;
                if (!targetContentSelector) return;

                // Deactivate all tabs and content
                tabContainer.querySelectorAll('.wm-tab').forEach(t => t.classList.remove('-active'));
                tabContentContainer.querySelectorAll('.wm-tab--content').forEach(c => c.classList.remove('-active'));
                
                // Activate the clicked one
                clickedTab.classList.add('-active');
                const contentPane = tabContentContainer.querySelector(targetContentSelector);
                if (contentPane) contentPane.classList.add('-active');
            });

            GM_addStyle(customCss);
            console.log(`${SCRIPT_PREFIX} UI injected successfully.`);
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
            const endpoints = {
                details: '/v3/assignment/view',
                workers: '/v3/assignment-details/view-invited-workers',
                notes: '/v3/assignment/view-notes',
                log: '/v3/assignment-details/view-activity-log'
            };
            const requests = Object.entries(endpoints).map(([key, endpoint]) =>
                this.apiPostRequest(endpoint, { workNumber: this.workNumber })
                .then(data => ({ status: 'fulfilled', value: data, key }))
                .catch(error => ({ status: 'rejected', reason: error, key }))
            );
            const results = await Promise.all(requests);
            results.forEach(result => {
                if (result.status === 'fulfilled') {
                    const payload = result.value.result?.payload?.[0];
                    if (!payload) { this.renderError(result.key, 'No payload in API response.'); return; }
                    switch (result.key) {
                        case 'details': this.renderAssignmentDetails(payload); break;
                        case 'workers': this.renderWorkersTable(payload); break;
                        case 'notes': this.renderNotes(payload); break;
                        case 'log': this.renderActivityLog(payload); break;
                    }
                } else {
                    console.error(`${SCRIPT_PREFIX} Failed to fetch data for ${result.key}:`, result.reason);
                    this.renderError(result.key, result.reason.message);
                }
            });
        }

        renderError(tabKey, errorMessage) {
            let paneId = tabKey === 'details' ? 'enhanced-details' : tabKey === 'workers' ? 'applicants' : tabKey === 'log' ? 'activity-log' : tabKey;
            const pane = document.getElementById(paneId);
            if (pane) pane.innerHTML = `<div class="enhancer-error">Error loading data: ${errorMessage}</div>`;
        }

        renderAssignmentDetails(data) {
            const container = document.getElementById('enhanced-details');
            if(!container) { console.error('Cannot find #enhanced-details container.'); return; }
            const grid = document.createElement('dl');
            grid.className = 'enhancer-grid';
            const createDtDd = (key, value, isHtml = false) => {
                if (value === null || value === undefined || value === '') return;
                grid.innerHTML += `<dt>${key}</dt><dd>${isHtml ? value : this.formatValue(value, key)}</dd>`;
            };
            const renderSection = (title, obj, fieldOrder = null) => {
                if (!obj || Object.keys(obj).length === 0) return;
                grid.innerHTML += `<dt class="section-header">${title}</dt><dd></dd>`;
                const keys = fieldOrder || Object.keys(obj);
                keys.forEach(key => { if (obj.hasOwnProperty(key)) createDtDd(this.formatKey(key) + ':', this.formatValue(obj[key], key)); });
            };
            createDtDd('Title:', data.title);
            createDtDd('Status:', data.workDisplayStatus);
            if(data.description) createDtDd('Description:', `<div class="html-content">${data.description}</div>`, true);
            if(data.instructions) createDtDd('Instructions:', `<div class="html-content">${data.instructions}</div>`, true);
            renderSection('Schedule', data.schedule);
            renderSection('Pricing', data.pricing, ['type', 'budget', 'workerMaxEarnings', 'perHourPrice', 'maxNumberOfHours', 'flatPrice']);
            renderSection('Payment Details', data.pricing?.payment);
            renderSection('Location', data.location?.address);
            renderSection('On-Site Contact', data.location?.contact);
            renderSection('Internal Owner', data.internalOwner);
            if (data.customFieldGroups?.length > 0) {
                 grid.innerHTML += '<dt class="section-header">Custom Fields</dt><dd></dd>';
                 data.customFieldGroups.forEach(group => group.fields.forEach(field => createDtDd(`${group.name} / ${field.name}:`, field.value)));
            }
            if (data.documents?.length > 0) {
                 let docLinks = data.documents.map(doc => `<li><a href="https://www.workmarket.com${doc.uri}" target="_blank">${doc.name}</a> ${doc.description ? `(${doc.description})` : ''}</li>`).join('');
                 grid.innerHTML += `<dt class="section-header">Documents</dt><dd><ul>${docLinks}</ul></dd>`;
            }
            if (data.deliverableRequirementGroup?.deliverableRequirements?.length > 0) {
                grid.innerHTML += '<dt class="section-header">Deliverables</dt><dd></dd>';
                if(data.deliverableRequirementGroup.instructions) createDtDd('Instructions:', `<div class="html-content">${data.deliverableRequirementGroup.instructions}</div>`, true);
                let delivItems = data.deliverableRequirementGroup.deliverableRequirements.map(d => `<li><strong>${d.numberOfFiles}x ${this.formatKey(d.type)}:</strong> ${d.instructions || ''}</li>`).join('');
                grid.innerHTML += `<dt></dt><dd><ul>${delivItems}</ul></dd>`;
            }
            container.innerHTML = '';
            container.appendChild(grid);
        }

        renderWorkersTable(data) {
            const container = document.getElementById('applicants');
            if(!container) { console.error('Cannot find #applicants container.'); return; }
            if (!data.workers || data.workers.length === 0) { container.innerHTML = 'No applicants or invited workers found.'; return; }
            let tableHTML = `<table class="enhancer-table"><thead><tr><th>Name / Company</th><th>Contact</th><th>Status</th><th>Distance</th><th>Overall Score</th><th>Stats</th></tr></thead><tbody>`;
            data.workers.forEach(worker => {
                const scores = this.calculateOverallScore(worker, data.budget || 350);
                const user = worker.user;
                const company = worker.company;
                const displayName = company.name === 'Sole Proprietor' ? `${user.firstName} ${user.lastName}` : company.name;
                let contactInfo = (user.email ? `<div><a href="mailto:${user.email}">${user.email}</a></div>` : '') +
                                  (user.phoneNumber?.phoneNumber ? `<div><a href="tel:${user.phoneNumber.phoneNumber}">${user.phoneNumber.phoneNumber}</a> (W)</div>` : '') +
                                  (user.mobilePhoneNumber?.phoneNumber ? `<div><a href="tel:${user.mobilePhoneNumber.phoneNumber}">${user.mobilePhoneNumber.phoneNumber}</a> (M)</div>` : '');
                const stats = `Cost: ${scores.CostScore}, Dist: ${scores.DistanceScore}, Perf: ${scores.StatsScore}<br/><small>(CPS: ${scores.CPS_Final}, IPS: ${scores.IPS})</small>`;
                tableHTML += `<tr><td><a href="https://www.workmarket.com/new-profile/${user.userUuid}" target="_blank"><strong>${displayName}</strong></a>${company.name !== 'Sole Proprietor' ? `<div><small>(${user.firstName} ${user.lastName})</small></div>` : ''}</td><td>${contactInfo}</td><td>${this.formatKey(worker.status)}</td><td>${this.formatValue(worker.distance, 'distance')}</td><td class="col-score">${scores.OverallScore}</td><td>${stats}</td></tr>`;
            });
            tableHTML += `</tbody></table>`;
            container.innerHTML = tableHTML;
        }

        renderNotes(data) {
            const container = document.getElementById('notes');
            if(!container) { console.error('Cannot find #notes container.'); return; }
            if (!data.notes || data.notes.length === 0) { container.innerHTML = 'No notes found.'; return; }
            let tableHTML = `<table class="enhancer-table"><thead><tr><th>Date</th><th>Creator</th><th>Note</th></tr></thead><tbody>`;
            data.notes.forEach(note => {
                tableHTML += `<tr><td>${new Date(note.createdOn).toLocaleString()}</td><td>${note.creator.firstName} ${note.creator.lastName}</td><td>${note.note}</td></tr>`;
            });
            tableHTML += `</tbody></table>`;
            container.innerHTML = tableHTML;
        }

        renderActivityLog(data) {
            const container = document.getElementById('activity-log');
            if(!container) { console.error('Cannot find #activity-log container.'); return; }
            if (!data.logEntries || data.logEntries.length === 0) { container.innerHTML = 'No activity log entries found.'; return; }
            let tableHTML = `<table class="enhancer-table"><thead><tr><th>Date</th><th>Actor</th><th>Action</th></tr></thead><tbody>`;
            data.logEntries.forEach(entry => {
                tableHTML += `<tr><td>${new Date(entry.createdDate).toLocaleString()}</td><td>${entry.actor.firstName} ${entry.actor.lastName}</td><td class="col-log-text">${entry.text}</td></tr>`;
            });
            tableHTML += `</tbody></table>`;
            container.innerHTML = tableHTML;
        }

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

    // --- Script Entry Point ---
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
                if (!document.querySelector('.enhancer-injected-tab')) {
                    new WorkMarketDetailEnhancer();
                }
            }
        }, 1000);
    }
    
    onUrlChange();

})();
