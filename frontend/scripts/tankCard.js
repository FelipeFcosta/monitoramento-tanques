import { highlightTank, removeMarker } from './map.js'
import { getConsumptionRateString, getCurrentLevel, getCurrentLevelPercentage, getRefillTimeString, measurements } from './tankData.js'
import { deleteTank } from './dashboard.js'

export function createTankCard(tank) {
    let refillTime = getRefillTimeString(tank)
    let consumptionRate = getConsumptionRateString(tank)

    const card = document.createElement('div')
    card.className = 'tank-card'
    card.id = `card-${tank.id}`
    card.innerHTML = `
        <h3>${tank.name}</h3>
        <div class="tank-info">
            <div class="tank-container">
                <div class="tank-level" style="height: ${getCurrentLevelPercentage(tank)}%;">
                    <span class="tank-percentage">${getCurrentLevelPercentage(tank)}%</span>
                </div>
            </div>
            <div class="consumption-analysis">
                <p>ID: T${tank.id}</p>
                <p>Capacidade: <strong><i>${tank.capacity}L</i></strong></p>
                <p id="current-level-${tank.id}">Nível atual: <strong><i>${getCurrentLevel(tank)}L</i></strong></p>
                <p id="consumption-${tank.id}">Taxa de Consumo: <strong><i>${consumptionRate}</i></strong></p>
                <p id="refill-${tank.id}">Reabastecer em: <strong><i>${refillTime}</i></strong></p>
            </div>
        </div>
        <div class="chart-container">
            <canvas id="chart-${tank.id}"></canvas>
        </div>
        <button class="stats-btn" style="display: none;">Stats</button>
        <span class="delete-btn" style="display: none;">&times;</span>
    `


    const deleteBtn = card.querySelector('.delete-btn')
    deleteBtn.addEventListener('click', (event) => {
        event.stopPropagation()
        deleteTank(tank)
    })

    const statsBtn = card.querySelector('.stats-btn')
    statsBtn.addEventListener('click', (event) => {
        event.stopPropagation()
        showStatsModal(tank)
    })

    card.addEventListener('click', (event) => {
        event.stopPropagation()
        card.classList.toggle('expanded')
        deleteBtn.style.display = card.classList.contains('expanded') ? 'block' : 'none'
        statsBtn.style.display = card.classList.contains('expanded') ? 'block' : 'none'
        if (card.classList.contains('expanded')) {
            createChart(tank)
        }
        highlightTank(tank)
    })

    return card
}


export function createChart(tank, chartId = `chart-${tank.id}`) {
    const ctx = document.getElementById(chartId)
    if (ctx.chart) {
        ctx.chart.destroy()
    }

    let levels = []
    let times = []

    if (measurements[tank.id]) {
        measurements[tank.id].forEach(m => {
            levels.push(m.level)
            times.push(new Date(`${m.timecode.split(' ')[0]}T${m.timecode.split(' ')[1]}`))
        })
    }

    ctx.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: times,
            datasets: [{
                label: 'Nível do Tanque',
                data: levels,
                borderColor: '#3498db',
                backgroundColor: '#3498db55',
                tension: 0.1,
                pointRadius: 3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            animation: false,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Nível (litros)'
                    }
                },
                x: {
                    type: 'time',
                    time: {
                        unit: 'second',
                        parser: 'dd-MM-yyyy HH:mm:ss',
                        displayFormats: {
                            day: 'dd-MM-yyyy',
                            hour: 'dd-MM-yyyy HH',
                            minute: 'dd-MM-yyyy HH:mm',
                            second: 'dd-MM-yyyy HH:mm:ss'

                        }
                    },
                    ticks: {
                        source: 'data',
                        autoSkip: false,
                        callback: function(value, index, values) {
                            if (chartId.startsWith('big')) {
                                const date = new Date(value)
                                const dateFormated = `${date.toLocaleDateString('pt-BR')} ${date.toISOString().slice(11,19)}`
                                return dateFormated;  // This will return "HH:mm"
                            }
                        }
                    }
                }
            }
        }
    })
}


function showStatsModal(tank) {
    const statsModal = document.getElementById('statsModal')
    const modalContent = statsModal.querySelector('.modal-stats-content')
    
    // Clear previous content
    modalContent.innerHTML = ''
    
    // Add close button
    const closeBtn = document.createElement('span')
    closeBtn.className = 'close'
    closeBtn.innerHTML = '&times;'
    closeBtn.onclick = () => statsModal.style.display = 'none'
    modalContent.appendChild(closeBtn)
    
    // Add title
    const title = document.createElement('h2')
    title.textContent = `Estatísticas para ${tank.name}`
    modalContent.appendChild(title)
    
    // Add big chart
    const chartContainer = document.createElement('div')
    chartContainer.className = 'big-chart-container'
    const canvas = document.createElement('canvas')
    canvas.id = `big-chart-${tank.id}`
    chartContainer.appendChild(canvas)
    modalContent.appendChild(chartContainer)
    
    // Create big chart using the existing createChart function
    createChart(tank, `big-chart-${tank.id}`)
    addTable(modalContent, tank)
    
    // show stats modal
    statsModal.style.display = 'block'
}

export function addTable(modalContent, tank) {
    const table = document.createElement('table')
    table.className = 'stats-table'
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Nível (litros)</th>
                <th>Nível (%)</th>
                <th>Timecode</th>
                <th>RTT</th>
            </tr>
        </thead>
        <tbody>
            ${measurements[tank.id].map(m => `
                <tr>
                    <td>M${m.id}</td>
                    <td>${m.level}</td>
                    <td>${((m.level / tank.capacity) * 100).toFixed(2)}</td>
                    <td>${m.timecode}</td>
                    <td>${m.rtt}</td>
                </tr>
            `).join('')}
        </tbody>
    `
    modalContent.appendChild(table)
}


export function addMeasurementToTable(tank, measurement) {
    const table = document.querySelector('.stats-table tbody');
    
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>M${measurement.id}</td>
        <td>${measurement.level}</td>
        <td>${((measurement.level / tank.capacity) * 100).toFixed(2)}</td>
        <td>${measurement.timecode}</td>
        <td>${measurement.rtt}</td>
    `;
    
    table.appendChild(newRow);
}
