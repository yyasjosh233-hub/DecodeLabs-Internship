let currentInspection = null;
let currentStageIndex = 0;
let simItemCount = 0;

document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    initConveyorSimulator();
    initStageTabs();
    fetchStatsAndHistory();
    setupInputEvents();
});

/* -------------------------------------------------------------------------- */
/* CONVEYOR SIMULATOR (60 FPS CANVAS ANIMATION)                               */
/* -------------------------------------------------------------------------- */
function initConveyorSimulator() {
    const canvas = document.getElementById('conveyorCanvas');
    const ctx = canvas.getContext('2d');
    let xPos = 50;

    function render() {
        ctx.fillStyle = '#050811';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Conveyor Frame
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(0, 80, canvas.width, 100);

        // Draw Moving Rollers
        ctx.fillStyle = '#475569';
        for (let r = 0; r < canvas.width; r += 40) {
            ctx.beginPath();
            ctx.arc((r + (xPos % 40)) % canvas.width, 130, 8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw Moving Component on Belt
        ctx.save();
        ctx.translate(xPos % canvas.width, 130);
        ctx.rotate((xPos * 0.05));
        ctx.fillStyle = '#0284C7';
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Draw Overhead Camera & Scanning Laser Beam
        const camX = canvas.width / 2;
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 2;
        ctx.fillRect(camX - 30, 10, 60, 30);
        ctx.strokeRect(camX - 30, 10, 60, 30);

        // Laser scan cone
        ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
        ctx.beginPath();
        ctx.moveTo(camX, 40);
        ctx.lineTo(camX - 60, 180);
        ctx.lineTo(camX + 60, 180);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(camX, 40);
        ctx.lineTo(camX - 60, 180);
        ctx.moveTo(camX, 40);
        ctx.lineTo(camX + 60, 180);
        ctx.stroke();

        xPos += 2;
        if (xPos % canvas.width === 0) {
            simItemCount++;
            document.getElementById('sim-inspected-count').innerText = simItemCount;
        }

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

/* -------------------------------------------------------------------------- */
/* INPUT HANDLERS & UPLOAD                                                    */
/* -------------------------------------------------------------------------- */
function setupInputEvents() {
    // Tab switching
    document.getElementById('tab-btn-file').addEventListener('click', () => switchPane('file'));
    document.getElementById('tab-btn-camera').addEventListener('click', () => switchPane('camera'));
    document.getElementById('tab-btn-sample').addEventListener('click', () => switchPane('sample'));

    // File input & Drag drop
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            uploadImageFile(e.target.files[0]);
        }
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#00F0FF';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'rgba(0, 240, 255, 0.3)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'rgba(0, 240, 255, 0.3)';
        if (e.dataTransfer.files.length > 0) {
            uploadImageFile(e.dataTransfer.files[0]);
        }
    });

    // Generate samples button
    document.getElementById('btn-generate-samples').addEventListener('click', async () => {
        try {
            const res = await fetch('/api/generate-samples', { method: 'POST' });
            const data = await res.json();
            alert("Synthetic dataset samples refreshed successfully!");
        } catch (err) {
            alert("Failed to generate samples: " + err.message);
        }
    });

    // Search and filter
    document.getElementById('searchInput').addEventListener('input', fetchStatsAndHistory);
    document.getElementById('filterSelect').addEventListener('change', fetchStatsAndHistory);
}

function switchPane(pane) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.input-pane').forEach(p => p.classList.add('hidden'));

    document.getElementById(`tab-btn-${pane}`).classList.add('active');
    document.getElementById(`pane-${pane}`).classList.remove('hidden');
}

async function uploadImageFile(file) {
    const formData = new FormData();
    formData.append('image', file);
    runInspectionRequest('/api/inspect', { method: 'POST', body: formData });
}

async function loadSample(samplePath) {
    runInspectionRequest('/api/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sample_path: samplePath })
    });
}

async function runInspectionRequest(url, options) {
    try {
        const res = await fetch(url, options);
        const data = await res.json();

        if (data.error) {
            alert("Inspection Error: " + data.error);
            return;
        }

        currentInspection = data;
        displayInspectionResults(data);
        fetchStatsAndHistory();
    } catch (err) {
        alert("Failed to process inspection: " + err.message);
    }
}

/* -------------------------------------------------------------------------- */
/* 15-STAGE STAGE TABS & PIPELINE DISPLAY                                      */
/* -------------------------------------------------------------------------- */
function initStageTabs() {
    const bar = document.getElementById('stageTabsBar');
    bar.innerHTML = '';

    const stageNames = [
        "1. Read Image", "2. Grayscale", "3. Blur", "4. Threshold", "5. Morphology",
        "6. Edges", "7. Contours", "8. Hull", "9. Defects", "10. Bounding Box",
        "11. Dimensioning", "12. Shape", "13. Defect Detection", "14. Confidence", "15. Final Classification"
    ];

    stageNames.forEach((name, i) => {
        const btn = document.createElement('button');
        btn.className = `stage-tab-btn ${i === 0 ? 'active' : ''}`;
        btn.innerText = name;
        btn.onclick = () => selectStage(i);
        bar.appendChild(btn);
    });
}

function selectStage(index) {
    currentStageIndex = index;
    const allBtns = document.querySelectorAll('.stage-tab-btn');
    allBtns.forEach((b, idx) => {
        if (idx === index) {
            b.classList.add('active');
            b.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
        else b.classList.remove('active');
    });

    if (!currentInspection || !currentInspection.stages || !currentInspection.stages[index]) return;

    const st = currentInspection.stages[index];
    const previewImg = document.getElementById('stagePreviewImg');
    const previewBox = document.getElementById('previewBox');
    if (previewImg) {
        const imgSrc = st.preview || currentInspection.annotated_path || currentInspection.image_path || '';
        if (imgSrc) {
            previewImg.onload = function() {
                if (previewBox) previewBox.classList.add('has-image');
            };
            previewImg.onerror = function() {
                this.onerror = null;
                // Try annotated path as fallback
                const fallback = currentInspection.annotated_path || currentInspection.image_path;
                if (fallback && this.src !== fallback) {
                    this.src = fallback;
                } else {
                    if (previewBox) previewBox.classList.remove('has-image');
                }
            };
            previewImg.src = imgSrc;
        } else {
            if (previewBox) previewBox.classList.remove('has-image');
        }
    }

    document.getElementById('stageNumTag').innerText = `STAGE ${st.number}`;
    document.getElementById('stageTitle').innerText = st.name;
    document.getElementById('stageStatusBadge').innerText = st.status;
    document.getElementById('stageStatusBadge').className = `badge ${st.status === 'PASS' ? 'pass' : 'fail'}`;
    document.getElementById('stageTime').innerText = `${st.time_ms} ms`;
    document.getElementById('stageExplanation').innerText = st.explanation;

    // Update image matrix dimensions from stage data or inspection
    const matrixEl = document.getElementById('stageMatrix');
    if (matrixEl) {
        const m = currentInspection.measurements || {};
        const wPx = Math.round((m.width_mm || 0) / 0.25) || 400;
        const hPx = Math.round((m.height_mm || 0) / 0.25) || 400;
        matrixEl.innerText = `${wPx} x ${hPx}`;
    }
}

function displayInspectionResults(data) {
    // Store full data then select stage 15 by default
    selectStage(14);

    // Final result card banner
    const banner = document.getElementById('resultBanner');
    banner.className = `result-banner ${data.result === 'PASS' ? 'pass' : 'fail'}`;
    document.getElementById('resultStatusText').innerText = data.result;
    document.getElementById('resultDefectText').innerText = data.result === 'PASS' ? 'No Critical Defect' : `Defect: ${data.defect}`;

    document.getElementById('resConfidence').innerText = `${(data.confidence * 100).toFixed(1)}%`;
    document.getElementById('resProduct').innerText = data.product_type || 'Component';
    document.getElementById('resLatency').innerText = `${data.total_time_ms} ms`;

    // Measurements table
    const tbody = document.getElementById('dimTableBody');
    const m = data.measurements || {};
    tbody.innerHTML = `
        <tr><td>Width</td><td>${m.width_mm || 0} mm</td><td>±2.0 mm</td><td><span class="badge pass">PASS</span></td></tr>
        <tr><td>Height</td><td>${m.height_mm || 0} mm</td><td>±2.0 mm</td><td><span class="badge pass">PASS</span></td></tr>
        <tr><td>Area</td><td>${m.area_mm2 || 0} mm²</td><td>±50 mm²</td><td><span class="badge pass">PASS</span></td></tr>
        <tr><td>Perimeter</td><td>${m.perimeter_mm || 0} mm</td><td>±10 mm</td><td><span class="badge pass">PASS</span></td></tr>
    `;

    // Telemetry JSON View — strip large base64 previews so the viewer stays responsive
    const displayData = JSON.parse(JSON.stringify(data));
    if (displayData.stages) {
        displayData.stages = displayData.stages.map(s => ({
            ...s,
            preview: s.preview ? `[base64 image ~${Math.round(s.preview.length/1024)}KB]` : null
        }));
    }
    if (displayData.annotated_b64) displayData.annotated_b64 = '[base64 annotated image]';
    document.getElementById('jsonCodeView').innerText = JSON.stringify(displayData, null, 2);
}

/* -------------------------------------------------------------------------- */
/* STATS & HISTORY FETCH                                                      */
/* -------------------------------------------------------------------------- */
async function fetchStatsAndHistory() {
    try {
        const statsRes = await fetch('/api/stats');
        const stats = await statsRes.json();

        document.getElementById('kpi-total').innerText = stats.total_inspected;
        document.getElementById('kpi-passed').innerText = stats.passed_items;
        document.getElementById('kpi-failed').innerText = stats.failed_items;
        document.getElementById('kpi-accuracy').innerText = `${stats.accuracy_rate}%`;
        document.getElementById('kpi-latency').innerText = `${stats.average_latency} ms`;
        document.getElementById('kpi-confidence').innerText = `${stats.average_confidence}%`;

        document.getElementById('sim-proc-time').innerText = `${stats.average_latency} ms`;

        updateChartsData(stats);

        // Fetch History
        const search = document.getElementById('searchInput').value;
        const filter = document.getElementById('filterSelect').value;
        const historyRes = await fetch(`/api/history?search=${encodeURIComponent(search)}&filter=${encodeURIComponent(filter)}`);
        const history = await historyRes.json();

        const tbody = document.getElementById('historyTableBody');
        tbody.innerHTML = '';

        history.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${item.id}</strong></td>
                <td>${item.timestamp.replace('T', ' ').substring(0, 19)}</td>
                <td>${item.filename}</td>
                <td>${item.product_type}</td>
                <td><span class="badge ${item.result === 'PASS' ? 'pass' : 'fail'}">${item.result}</span></td>
                <td>${item.defect_type}</td>
                <td>${(item.confidence * 100).toFixed(1)}%</td>
                <td>${item.total_time_ms} ms</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="downloadSingleReport('${item.id}', 'pdf')">PDF</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error("Error fetching stats:", err);
    }
}

/* -------------------------------------------------------------------------- */
/* REPORT EXPORT ACTIONS                                                      */
/* -------------------------------------------------------------------------- */
function exportReport(format) {
    if (!currentInspection || !currentInspection.inspection_id) {
        alert("Please run an inspection first before downloading report.");
        return;
    }
    downloadSingleReport(currentInspection.inspection_id, format);
}

function downloadSingleReport(id, format) {
    window.open(`/api/report/${id}/${format}`, '_blank');
}

function copyJson() {
    const text = document.getElementById('jsonCodeView').innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert("Inspection JSON copied to clipboard!");
    });
}

function downloadJsonFile() {
    if (!currentInspection || !currentInspection.inspection_id) return;
    downloadSingleReport(currentInspection.inspection_id, 'json');
}

/* -------------------------------------------------------------------------- */
/* CAMERA STOP / START / CAPTURE CONTROLS                                     */
/* -------------------------------------------------------------------------- */

let currentCameraSource = 'server'; // 'server' or 'webrtc'
let webrtcStream = null;

function _setCameraUIState(streaming) {
    const btnStop   = document.getElementById('btnCameraStop');
    const btnStart  = document.getElementById('btnCameraStart');
    const dot       = document.getElementById('camStatusDot');
    const label     = document.getElementById('camStatusLabel');
    const overlay   = document.getElementById('streamPausedOverlay');
    const feedImg   = document.getElementById('liveFeedImg');
    const overlayLabel = document.getElementById('streamOverlayLabel');

    if (streaming) {
        if (btnStop)  btnStop.classList.remove('hidden');
        if (btnStart) btnStart.classList.add('hidden');
        if (dot)   dot.classList.remove('paused');
        if (label) {
            label.classList.remove('paused');
            label.textContent = 'STREAM ACTIVE';
        }
        if (overlay) overlay.classList.add('hidden');
        if (overlayLabel) {
            overlayLabel.textContent = currentCameraSource === 'webrtc'
                ? 'BROWSER WEBRTC LIVE STREAM ACTIVE'
                : 'OPENCV OPTICAL STREAM ACTIVE';
        }
        if (currentCameraSource === 'server' && feedImg) {
            feedImg.src = '/video_feed?t=' + Date.now();
        }
    } else {
        if (btnStop)  btnStop.classList.add('hidden');
        if (btnStart) btnStart.classList.remove('hidden');
        if (dot)   dot.classList.add('paused');
        if (label) {
            label.classList.add('paused');
            label.textContent = 'STREAM PAUSED';
        }
        if (overlay) overlay.classList.remove('hidden');
        if (overlayLabel) overlayLabel.textContent = 'CAMERA PAUSED';
    }
}

async function switchCameraSource(source) {
    currentCameraSource = source;
    const btnServer = document.getElementById('btnSourceServer');
    const btnWebRTC = document.getElementById('btnSourceWebRTC');
    const feedImg   = document.getElementById('liveFeedImg');
    const videoElem = document.getElementById('webcamVideo');

    if (source === 'webrtc') {
        if (btnServer) btnServer.classList.remove('active', 'btn-primary');
        if (btnServer) btnServer.classList.add('btn-secondary');
        if (btnWebRTC) btnWebRTC.classList.add('active', 'btn-primary');
        if (btnWebRTC) btnWebRTC.classList.remove('btn-secondary');

        if (feedImg)   feedImg.classList.add('hidden');
        if (videoElem) videoElem.classList.remove('hidden');

        try {
            if (!webrtcStream) {
                webrtcStream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } });
            }
            videoElem.srcObject = webrtcStream;
            await videoElem.play();
            _setCameraUIState(true);
        } catch (err) {
            console.error('WebRTC Camera Error:', err);
            alert('Browser webcam access error: ' + err.message + '\nSwitching to OpenCV stream.');
            switchCameraSource('server');
        }
    } else {
        if (btnServer) btnServer.classList.add('active', 'btn-primary');
        if (btnServer) btnServer.classList.remove('btn-secondary');
        if (btnWebRTC) btnWebRTC.classList.remove('active', 'btn-primary');
        if (btnWebRTC) btnWebRTC.classList.add('btn-secondary');

        if (videoElem) {
            videoElem.classList.add('hidden');
            if (videoElem.srcObject) {
                videoElem.srcObject.getTracks().forEach(t => t.stop());
                videoElem.srcObject = null;
            }
            webrtcStream = null;
        }
        if (feedImg) feedImg.classList.remove('hidden');
        _setCameraUIState(true);
    }
}

async function scanServerCamera() {
    try {
        const res = await fetch('/api/camera/scan', { method: 'POST' });
        const data = await res.json();
        if (data.available) {
            alert(`Real physical webcam detected and opened on Camera Index ${data.camera_index}!`);
        } else {
            alert('No physical webcam found on indices 0..3.\n\nTip: You can use "Browser Webcam (WebRTC)" mode to connect your browser webcam directly!');
        }
        switchCameraSource('server');
    } catch (err) {
        alert('Failed to scan camera: ' + err.message);
    }
}

async function stopCamera() {
    if (currentCameraSource === 'webrtc') {
        const videoElem = document.getElementById('webcamVideo');
        if (videoElem && videoElem.srcObject) {
            videoElem.pause();
        }
        _setCameraUIState(false);
        return;
    }
    try {
        await fetch('/api/camera/stop', { method: 'POST' });
        _setCameraUIState(false);
    } catch (err) {
        console.error('Stop camera error:', err);
    }
}

async function startCamera() {
    if (currentCameraSource === 'webrtc') {
        const videoElem = document.getElementById('webcamVideo');
        if (videoElem) {
            if (!videoElem.srcObject && webrtcStream) {
                videoElem.srcObject = webrtcStream;
            }
            await videoElem.play();
        }
        _setCameraUIState(true);
        return;
    }
    try {
        await fetch('/api/camera/start', { method: 'POST' });
        _setCameraUIState(true);
    } catch (err) {
        console.error('Start camera error:', err);
    }
}

async function captureSnapshot() {
    const feedImg   = document.getElementById('liveFeedImg');
    const videoElem = document.getElementById('webcamVideo');
    const btn       = document.getElementById('btnSnapshot');

    const isWebRTC = currentCameraSource === 'webrtc' && videoElem && !videoElem.classList.contains('hidden');
    const targetSource = isWebRTC ? videoElem : feedImg;

    if (!targetSource || (isWebRTC ? !videoElem.srcObject : !feedImg.src)) {
        alert('No live feed available to capture.');
        return;
    }

    const origText = btn.innerHTML;
    btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> CAPTURING...';
    btn.disabled = true;

    try {
        const canvas = document.createElement('canvas');
        if (isWebRTC) {
            canvas.width  = videoElem.videoWidth  || 640;
            canvas.height = videoElem.videoHeight || 480;
        } else {
            canvas.width  = feedImg.naturalWidth  || 640;
            canvas.height = feedImg.naturalHeight || 480;
        }
        const ctx = canvas.getContext('2d');
        ctx.drawImage(targetSource, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
            if (!blob) {
                alert('Could not capture frame.');
                btn.innerHTML = origText;
                btn.disabled = false;
                return;
            }
            const formData = new FormData();
            formData.append('image', blob, 'snapshot.jpg');

            const res = await fetch('/api/inspect', {
                method: 'POST',
                body: formData,
            });
            const result = await res.json();
            if (result.error) throw new Error(result.error);

            currentInspection = result;
            displayInspectionResults(result);
            fetchStatsAndHistory();

            btn.innerHTML = origText;
            btn.disabled = false;
        }, 'image/jpeg', 0.92);

    } catch (err) {
        console.error('Snapshot error:', err);
        alert('Capture failed: ' + err.message);
        btn.innerHTML = origText;
        btn.disabled = false;
    }
}

