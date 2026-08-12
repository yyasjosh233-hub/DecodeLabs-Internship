let passFailChartInstance = null;
let defectChartInstance = null;

function initCharts() {
    const pfCtx = document.getElementById('passFailChart').getContext('2d');
    passFailChartInstance = new Chart(pfCtx, {
        type: 'doughnut',
        data: {
            labels: ['PASS', 'FAIL'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#10B981', '#EF4444'],
                borderColor: '#0F172A',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#94A3B8', font: { family: 'JetBrains Mono' } } }
            }
        }
    });

    const dfCtx = document.getElementById('defectChart').getContext('2d');
    defectChartInstance = new Chart(dfCtx, {
        type: 'bar',
        data: {
            labels: ['Tooth', 'Broken', 'Crack', 'Scratch', 'Screw', 'Shape', 'Dims'],
            datasets: [{
                label: 'Defect Count',
                data: [0, 0, 0, 0, 0, 0, 0],
                backgroundColor: '#0284C7',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { ticks: { color: '#94A3B8', font: { family: 'JetBrains Mono', size: 9 } } },
                y: { ticks: { color: '#94A3B8', font: { family: 'JetBrains Mono' } }, beginAtZero: true }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function updateChartsData(stats) {
    if (!passFailChartInstance || !defectChartInstance) return;

    passFailChartInstance.data.datasets[0].data = [stats.passed_items, stats.failed_items];
    passFailChartInstance.update();

    const df = stats.defect_distribution || {};
    const labels = [
        "Missing Gear Tooth",
        "Broken Gear Tooth",
        "Crack Detection",
        "Surface Scratch",
        "Missing Component",
        "Wrong Shape",
        "Incorrect Dimensions"
    ];
    const data = labels.map(l => df[l] || 0);

    defectChartInstance.data.labels = ['M-Tooth', 'B-Tooth', 'Crack', 'Scratch', 'Screw', 'Shape', 'Dims'];
    defectChartInstance.data.datasets[0].data = data;
    defectChartInstance.update();
}
