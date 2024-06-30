import { highlightTank, removeMarker } from './map.js'
import { calculateConsumptionRate, calculateRefillTime, measurements } from './tankData.js'
import { deleteTank } from './dashboard.js'

export function createTankCard(tank) {
    const card = document.createElement('div')
    card.className = 'tank-card'
    card.id = `card-${tank.id}`
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
                <p consumption-${tank.id}>Taxa de Consumo: ${calculateConsumptionRate(tank)}L/dia</p>
                <p refill-${tank.id}>Reabastecimento em: ${calculateRefillTime(tank)} dias</p>
            </div>
        </div>
        <div class="chart-container">
            <canvas id="chart-${tank.id}"></canvas>
        </div>
        <span class="delete-btn" style="display: none;">&times;</span>
    `

    const deleteBtn = card.querySelector('.delete-btn')
    deleteBtn.addEventListener('click', (event) => {
        event.stopPropagation()
        deleteTank(tank)
    })

    card.addEventListener('click', (event) => {
        event.stopPropagation()
        card.classList.toggle('expanded')
        deleteBtn.style.display = card.classList.contains('expanded') ? 'block' : 'none'
        if (card.classList.contains('expanded')) {
            createChart(tank)
        }
        highlightTank(tank)
    })

    return card
}


export function createChart(tank) {
    const ctx = document.getElementById(`chart-${tank.id}`)
    if (ctx.chart) {
        ctx.chart.destroy()
    }

    let levels = []
    let xAxis = []
    if (measurements[tank.id]) {
        levels = measurements[tank.id].map(m => m.level)
        xAxis = measurements[tank.id].map(m => m.timecode.split(" ")[1])
        console.log(levels)
        console.log(xAxis)
    }

    ctx.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xAxis,
            datasets: [{
                label: 'Nível do Tanque',
                data: levels,
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
    })
}
