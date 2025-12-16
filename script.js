const state = {

            phase: 'hardware',
            laptopView: 'front',
            soundCardInstalled: false,
            panelClosed: false,
            booted: false,
            driverInstalled: false,
            verified: false,
            steps: {
                flip: false, open: false, install: false, close: false, boot: false, settings: false, driver: false, verify: false
            }
        }

            ;

        function toggleSidebar() {
            const sidebar = document.getElementById('lab-sidebar');
            const mainContent = document.getElementById('main-content');
            const toggleBtn = document.getElementById('sidebar-toggle');

            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
            toggleBtn.classList.toggle('collapsed');

            if (sidebar.classList.contains('collapsed')) {
                toggleBtn.textContent = '☰';
            } else {
                toggleBtn.textContent = '✕';
            }
        }

        function updateClock() {
            const now = new Date();
            const h = now.getHours() % 12 || 12;
            const mins = now.getMinutes().toString().padStart(2, '0');
            const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
            document.getElementById('clock-time').textContent = h + ':' + mins + ' ' + ampm;
            document.getElementById('clock-date').textContent = (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear();
        }

        setInterval(updateClock, 1000);
        updateClock();

        function showLaptopView(view) {
            document.getElementById('laptop-front').classList.add('hidden');
            document.getElementById('laptop-back-closed').classList.add('hidden');
            document.getElementById('laptop-back-open').classList.add('hidden');
            document.getElementById('laptop-' + (view === 'front' ? 'front' : view === 'back-closed' ? 'back-closed' : 'back-open')).classList.remove('hidden');
        }

        function switchPhase(phase) {
            state.phase = phase;
            document.getElementById('hardware-phase').style.display = phase === 'hardware' ? 'flex' : 'none';
            document.getElementById('software-phase').style.display = phase === 'software' ? 'flex' : 'none';
            document.getElementById('tab-hardware').classList.toggle('active', phase === 'hardware');
            document.getElementById('tab-software').classList.toggle('active', phase === 'software');
            if (phase === 'software' && !state.booted) bootWindows();
        }

        function flipLaptop() {
            if (state.laptopView === 'front') {
                showLaptopView('back-closed');
                state.laptopView = 'back-closed';
                document.getElementById('btn-flip').textContent = '🖱️ Click to Close';
                document.getElementById('btn-open').style.display = 'inline-block';
                completeStep('flip');
            }

            else {
                showLaptopView('front');
                state.laptopView = 'front';
                document.getElementById('btn-flip').textContent = '🖱️ Click to Open';
                document.getElementById('btn-open').style.display = 'none';
            }
        }

        function openPanel() {
            if (state.laptopView === 'back-closed') {
                showLaptopView('back-open');
                state.laptopView = 'back-open';
                document.getElementById('laptop-slot').classList.add('active');
                document.getElementById('toolbox').style.display = 'flex';
                document.getElementById('btn-open').style.display = 'none';
                document.getElementById('btn-flip').style.display = 'none';
                completeStep('open');
            }
        }

        function closePanel() {
            if (state.soundCardInstalled) {
                showLaptopView('back-closed');
                state.laptopView = 'back-closed';
                state.panelClosed = true;
                document.getElementById('laptop-slot').style.display = 'none';
                document.getElementById('toolbox').style.display = 'none';
                document.getElementById('btn-close').style.display = 'none';
                document.getElementById('btn-continue').style.display = 'inline-block';
                document.getElementById('tab-software').disabled = false;
                completeStep('close');
            }
        }

        function dragStart(e) {
            e.target.classList.add('dragging');
            e.dataTransfer.setData('text/plain', 'sound-card');
        }

        function dragEnd(e) {
            e.target.classList.remove('dragging');
        }

        document.addEventListener('DOMContentLoaded', () => {
            const slot = document.getElementById('laptop-slot');

            slot.addEventListener('dragover', e => {
                e.preventDefault(); slot.style.borderColor = '#4ade80'; slot.style.background = 'rgba(34,197,94,0.4)';
            });

            slot.addEventListener('dragleave', () => {
                slot.style.borderColor = '#22c55e'; slot.style.background = 'rgba(34,197,94,0.2)';
            });

            slot.addEventListener('drop', e => {
                e.preventDefault(); if (e.dataTransfer.getData('text/plain') === 'sound-card') installSoundCard();
            });
        });

        function installSoundCard() {
            state.soundCardInstalled = true;
            document.getElementById('sound-card').classList.add('installed');
            const slot = document.getElementById('laptop-slot');
            slot.classList.add('filled');
            slot.innerHTML = '<img src="images/sound_card.png" class="installed-card" alt="Sound Card">';
            document.getElementById('btn-close').style.display = 'inline-block';
            completeStep('install');
        }

        function bootWindows() {
            setTimeout(() => {
                document.getElementById('boot-screen').classList.add('hidden');
                document.getElementById('win11-desktop').style.display = 'flex';
                state.booted = true;
                completeStep('boot');
            }

                , 2500);
        }

        function openSettings() {
            document.getElementById('settings-window').classList.add('show');
            completeStep('settings');
        }

        function closeSettings() {
            document.getElementById('settings-window').classList.remove('show');
        }

        function installDriver() {
            const btn = document.getElementById('install-driver-btn');
            btn.disabled = true;
            btn.textContent = '...';
            document.getElementById('install-progress-row').style.display = 'flex';
            let progress = 0;

            const interval = setInterval(() => {
                progress += 5;
                document.getElementById('driver-progress').style.width = progress + '%';

                if (progress >= 100) {
                    clearInterval(interval); finishDriverInstall();
                }
            }

                , 120);
        }

        function finishDriverInstall() {
            state.driverInstalled = true;
            document.getElementById('driver-status').textContent = 'Installed';
            document.getElementById('driver-action').innerHTML = '<span class="status-badge success">✓</span>';
            document.getElementById('install-progress-row').style.display = 'none';
            document.getElementById('sound-card-status').style.display = 'block';
            completeStep('driver');
        }

        function setDefault() {
            document.getElementById('output-device').textContent = 'Sound Blaster Audigy';
            state.verified = true;
            completeStep('verify');
            setTimeout(() => document.getElementById('win-notification').classList.add('show'), 300);
        }

        function closeNotification() {
            document.getElementById('win-notification').classList.remove('show');
        }

        function completeStep(stepId) {
            if (state.steps[stepId]) return;
            state.steps[stepId] = true;
            const stepCard = document.getElementById('step-' + stepId);

            if (stepCard) {
                stepCard.classList.add('completed');
                stepCard.querySelector('.step-status').textContent = 'Done';
            }

            const total = Object.keys(state.steps).length;
            const done = Object.values(state.steps).filter(Boolean).length;
            document.getElementById('progressBar').style.width = (done / total * 100) + '%';

            // Check if all tasks are completed
            if (done === total) {
                setTimeout(() => generateReport(), 1500);
            }
        }

        function generateReport() {
            const { jsPDF } = window.jspdf;

            var taskNames = {
                flip: 'Flip Laptop',
                open: 'Open the Motherboard',
                install: 'Install Sound Card',
                close: 'Close Panel',
                boot: 'Boot Windows 11',
                settings: 'Open Settings',
                driver: 'Install Driver',
                verify: 'Verify Installation'
            };

            var now = new Date();
            var dateStr = now.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            var reportContent = '';
            reportContent += 'SOUND CARD INSTALLATION LAB - REPORT\n\n';
            reportContent += 'Date: ' + dateStr + '\n';
            reportContent += 'Lab Title: Installing the Sound Card\n';
            reportContent += 'Status: COMPLETED\n\n';

            reportContent += 'TASK 1: HARDWARE INSTALLATION\n';
            reportContent += '--------------------------------\n';

            var hardwareTasks = ['flip', 'open', 'install', 'close'];
            for (var i = 0; i < hardwareTasks.length; i++) {
                var key = hardwareTasks[i];
                var status = state.steps[key] ? 'Done' : 'Pending';
                reportContent += (i + 1) + '. ' + taskNames[key] + ' - ' + status + '\n';
            }

            reportContent += '\nTASK 2: SOFTWARE INSTALLATION\n';
            reportContent += '--------------------------------\n';

            var softwareTasks = ['boot', 'settings', 'driver', 'verify'];
            for (var j = 0; j < softwareTasks.length; j++) {
                var skey = softwareTasks[j];
                var sstatus = state.steps[skey] ? 'Done' : 'Pending';
                reportContent += (j + 1) + '. ' + taskNames[skey] + ' - ' + sstatus + '\n';
            }

            reportContent += '\nRESULT\n';
            reportContent += '--------------------------------\n';
            reportContent += 'Total Tasks: 8\n';
            reportContent += 'Completed: 8\n';
            reportContent += 'Progress: 100%\n\n';
            reportContent += 'CONGRATULATIONS! Lab completed successfully!';

            // ✅ Create REAL PDF using jsPDF
            var doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            doc.setFont('courier');
            doc.setFontSize(10);

            var marginX = 10;
            var marginY = 10;
            var pageHeight = doc.internal.pageSize.height;

            var lines = doc.splitTextToSize(reportContent, 180);
            var cursorY = marginY;

            lines.forEach(function (line) {
                if (cursorY > pageHeight - 10) {
                    doc.addPage();
                    cursorY = marginY;
                }
                doc.text(line, marginX, cursorY);
                cursorY += 6;
            });

            doc.save('Sound_Card_Lab_Report_' + now.toISOString().slice(0, 10) + '.pdf');

            alert('🎉🎊 Congratulations! All tasks completed!\n\nYour PDF lab report has been downloaded successfully.');
            document.getElementById('restart-btn').style.display = 'block';
        }


        function resetLab() {
            // Reset state
            state.phase = 'hardware';
            state.laptopView = 'front';
            state.soundCardInstalled = false;
            state.panelClosed = false;
            state.booted = false;
            state.driverInstalled = false;
            state.verified = false;

            state.steps = {
                flip: false, open: false, install: false, close: false, boot: false, settings: false, driver: false, verify: false
            }

                ;

            // Reset progress bar
            document.getElementById('progressBar').style.width = '0%';

            // Reset all step cards
            document.querySelectorAll('.step-card').forEach(card => {
                card.classList.remove('completed');
                card.querySelector('.step-status').textContent = 'Pending';
            });

            // Reset hardware phase
            document.getElementById('laptop-front').classList.remove('hidden');
            document.getElementById('laptop-back-closed').classList.add('hidden');
            document.getElementById('laptop-back-open').classList.add('hidden');
            document.getElementById('laptop-slot').classList.remove('active', 'filled');
            document.getElementById('laptop-slot').style.display = '';
            document.getElementById('laptop-slot').innerHTML = '';
            document.getElementById('sound-card').classList.remove('installed');
            document.getElementById('toolbox').style.display = 'none';

            // Reset buttons
            document.getElementById('btn-flip').textContent = '🖱️ Click to Open';
            document.getElementById('btn-flip').style.display = 'inline-block';
            document.getElementById('btn-open').style.display = 'none';
            document.getElementById('btn-close').style.display = 'none';
            document.getElementById('btn-continue').style.display = 'none';

            // Reset software phase
            document.getElementById('boot-screen').classList.remove('hidden');
            document.getElementById('win11-desktop').style.display = 'none';
            document.getElementById('settings-window').classList.remove('show');
            document.getElementById('win-notification').classList.remove('show');

            // Reset settings window
            document.getElementById('output-device').textContent = 'Speakers (Realtek)';
            document.getElementById('driver-status').textContent = 'Driver not installed';
            document.getElementById('driver-action').innerHTML = '<button class="install-btn" id="install-driver-btn" onclick="installDriver()">Install</button>';
            document.getElementById('install-progress-row').style.display = 'none';
            document.getElementById('driver-progress').style.width = '0%';
            document.getElementById('sound-card-status').style.display = 'none';

            // Reset tabs
            document.getElementById('tab-hardware').classList.add('active');
            document.getElementById('tab-software').classList.remove('active');
            document.getElementById('tab-software').disabled = true;

            // Switch to hardware phase
            document.getElementById('hardware-phase').style.display = 'flex';
            document.getElementById('software-phase').style.display = 'none';

            // Hide restart button
            document.getElementById('restart-btn').style.display = 'none';

            alert('Lab has been reset! You can start again.');
        }
        /*
                (function () {
                    'use strict';
        
                    // 1. Right Click Disable
                    document.addEventListener('contextmenu', function (e) {
                        e.preventDefault();
                        alert('⚠️ Right click disabled hai!');
                        return true;
                    });
        
                    // 2. Keyboard Shortcuts Disable (F12, Ctrl+Shift+I, Ctrl+U, etc.)
                    document.addEventListener('keydown', function (e) {
        
                        // F12
                        if (e.key === 'F12') {
                            e.preventDefault();
                            return false;
                        }
        
                        // Ctrl+Shift+I (DevTools)
                        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                            e.preventDefault();
                            return true;
                        }
        
                        // Ctrl+Shift+J (Console)
                        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
                            e.preventDefault();
                            return true;
                        }
        
                        // Ctrl+U (View Source)
                        if (e.ctrlKey && e.key === 'u') {
                            e.preventDefault();
                            return false;
                        }
        
                        // Ctrl+Shift+C (Inspect Element)
                        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                            e.preventDefault();
                            return true;
                        }
        
                        // Ctrl+S (Save Page)
                        if (e.ctrlKey && e.key === 's') {
                            e.preventDefault();
                            return false;
                        }
                    });
        
                    // 3. Text Selection Disable
                    document.addEventListener('selectstart', function (e) {
                        e.preventDefault();
                        return true;
                    });
        
                    // 4. Copy Disable
                    document.addEventListener('copy', function (e) {
                        e.preventDefault();
                        return true;
                    });
        
                    // 5. Cut Disable
                    document.addEventListener('cut', function (e) {
                        e.preventDefault();
                        return true;
                    });
        
                    // 6. Detect DevTools
                    const devtools = /./;
        
                    devtools.toString = function () {
                        this.opened = true;
                    }
        
                        ;
        
                    const checkDevTools = setInterval(function () {
                        const widthThreshold = window.outerWidth - window.innerWidth > 160;
                        const heightThreshold = window.outerHeight - window.innerHeight > 160;
        
                        if (widthThreshold || heightThreshold) {
                            alert('⚠️ Developer Tools detect ho gaye hain!');
                            window.location.reload();
                        }
                    }
        
                        , 1000);
        
                    // 7. Console Clear
                    if (typeof console !== 'undefined') {
                        console.log = function () { }
        
                            ;
        
                        console.warn = function () { }
        
                            ;
        
                        console.error = function () { }
        
                            ;
        
                        console.info = function () { }
        
                            ;
        
                        console.debug = function () { }
        
                            ;
        
                        console.clear = function () { }
        
                            ;
                    }
        
        
                    // 9. CSS for Text Selection Disable
                    const style = document.createElement('style');
        
                    style.textContent = ` * {
                            -webkit-user-select: none !important;
                            -moz-user-select: none !important;
                            -ms-user-select: none !important;
                            user-select: none !important;
                            -webkit-touch-callout: none !important;
                        }
        
                        input, textarea {
                            -webkit-user-select: text !important;
                            -moz-user-select: text !important;
                            -ms-user-select: text !important;
                            user-select: text !important;
                        }
        
                        `;
                    document.head.appendChild(style);
        
                    // 10. Disable Print
                    window.addEventListener('beforeprint', function (e) {
                        e.preventDefault();
                        alert('⚠️ Print karna disabled hai!');
                        return false;
                    });
        
                    // 11. Clear Selection
                    window.addEventListener('load', function () {
                        document.body.addEventListener('mouseup', function () {
                            window.getSelection().removeAllRanges();
                        });
                    });
        
                })();*/
