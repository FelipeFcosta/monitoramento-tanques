const tanks = [
    { id: 'T001', name: 'Tanque 1', level: 75, capacity: 1000, consumptionHistory: [980, 950, 920, 890, 860, 830, 800, 770], lat: -23.550520, lng: -46.633308 },
    { id: 'T002', name: 'Tanque 2', level: 50, capacity: 1500, consumptionHistory: [1450, 1400, 1350, 1300, 1250, 1200, 1150, 1100], lat: -23.555170, lng: -46.640740 },
    { id: 'T003', name: 'Tanque 3', level: 25, capacity: 2000, consumptionHistory: [1900, 1800, 1700, 1600, 1500, 1400, 1300, 1200], lat: -23.561170, lng: -46.655740 }
];

let map;

let lastClickedTank = null;
let markers = {};

function initMap() {
    map = L.map('map').setView([-23.550520, -46.633308], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    tanks.forEach(tank => {
        const marker = L.marker([tank.lat, tank.lng])
            .addTo(map)
            .bindPopup(`<b>${tank.name}</b><br>Nível: ${tank.level}%`);
        markers[tank.id] = marker;
    });
}

function createTankCard(tank) {
    const card = document.createElement('div');
    card.className = 'tank-card';
    card.id = `card-${tank.id}`;
    card.innerHTML = `
        <h3>${tank.name}</h3>
        <p>ID: ${tank.id}</p>
        <div class="tank-info">
            <div class="tank-container">
                <div class="tank-level" style="height: ${tank.level}%;">
                    <span class="tank-percentage">${tank.level}%</span>
                </div>
            </div>
            <div class="consumption-analysis">
                <p>Capacidade: ${tank.capacity}L</p>
                <p>Taxa de Consumo: ${calculateConsumptionRate(tank)}L/dia</p>
                <p>Reabastecimento em: ${calculateRefillTime(tank)} dias</p>
            </div>
        </div>
        <div class="chart-container">
            <canvas id="chart-${tank.id}"></canvas>
        </div>
        <button class="delete-btn" style="display: none;">✖</button>
    `;

    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        deleteTank(tank);
    });

    card.addEventListener('click', (event) => {
        event.stopPropagation();
        card.classList.toggle('expanded');
        deleteBtn.style.display = card.classList.contains('expanded') ? 'block' : 'none';
        if (card.classList.contains('expanded')) {
            createChart(tank);
        }
        highlightTank(tank);
    });

    return card;
}

function deleteTank(tank) {
    // Remove the tank from the tanks array
    const index = tanks.findIndex(t => t.id === tank.id);
    if (index > -1) {
        tanks.splice(index, 1);
    }

    // Remove the marker from the map
    map.removeLayer(markers[tank.id]);
    delete markers[tank.id];

    // Remove the tank card from the DOM
    const card = document.getElementById(`card-${tank.id}`);
    card.remove();

    // Clear highlight if this was the last clicked tank
    if (lastClickedTank && lastClickedTank.id === tank.id) {
        lastClickedTank = null;
    }
}

function removeLastHighlight() {
    const lastCard = document.getElementById(`card-${lastClickedTank.id}`);
    lastCard.classList.remove('highlighted');
    markers[lastClickedTank.id].setIcon(L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    }));
}

function highlightTank(tank) {
    // Remove highlight from previously clicked tank
    if (lastClickedTank) {
        removeLastHighlight()
    }

    // Highlight new clicked tank
    lastClickedTank = tank;
    const card = document.getElementById(`card-${tank.id}`);
    card.classList.add('highlighted');

    // Change map marker to red
    markers[tank.id].setIcon(L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    }));
}

function calculateConsumptionRate(tank) {
    const history = tank.consumptionHistory;
    const dailyConsumption = history.map((val, index) => 
        index > 0 ? history[index-1] - val : 0
    ).slice(1);
    const avgConsumption = dailyConsumption.reduce((a, b) => a + b, 0) / dailyConsumption.length;
    return avgConsumption.toFixed(2);
}

function calculateRefillTime(tank) {
    const currentLevel = tank.level / 100 * tank.capacity;
    const consumptionRate = calculateConsumptionRate(tank);
    return Math.floor(currentLevel / consumptionRate);
}

function createChart(tank) {
    const ctx = document.getElementById(`chart-${tank.id}`);
    if (ctx.chart) {
        ctx.chart.destroy();
    }
    ctx.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['7 dias', '6 dias', '5 dias', '4 dias', '3 dias', '2 dias', '1 dia', 'Hoje'],
            datasets: [{
                label: 'Nível do Tanque',
                data: tank.consumptionHistory,
                borderColor: '#3498db',
                backgroundColor: '#3498db55',
                tension: 0.1,
                pointRadius: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createAddTankButton() {
    const button = document.createElement('div');
    button.className = 'add-tank-btn';
    button.innerHTML = '+';
    button.addEventListener('click', addNewTank);
    return button;
}

function addNewTank() {
    const newTankId = `T00${tanks.length + 1}`;
    const newTank = {
        id: newTankId,
        name: `Tanque ${tanks.length + 1}`,
        level: Math.floor(Math.random() * 100),
        capacity: 1000 + Math.floor(Math.random() * 1000),
        consumptionHistory: Array.from({length: 8}, () => Math.floor(Math.random() * 1000)),
        lat: -23.550520 + (Math.random() - 0.5) * 0.02,
        lng: -46.633308 + (Math.random() - 0.5) * 0.02
    };

    tanks.push(newTank);

    const marker = L.marker([newTank.lat, newTank.lng])
        .addTo(map)
        .bindPopup(`<b>${newTank.name}</b><br>Nível: ${newTank.level}%`);
    markers[newTank.id] = marker;

    const card = createTankCard(newTank);
    const tanksOverview = document.getElementById('tanks-overview');
    tanksOverview.insertBefore(card, tanksOverview.lastElementChild);
}


function initializeDashboard() {
    const tanksOverview = document.getElementById('tanks-overview');
    tanks.forEach(tank => {
        const card = createTankCard(tank);
        tanksOverview.appendChild(card);
    });

    const addButton = createAddTankButton();
    tanksOverview.appendChild(addButton);
}

window.addEventListener('load', () => {
    initMap();
    initializeDashboard();
});