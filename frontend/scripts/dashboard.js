import { addMarker, initMap, removeMarker } from './map.js'
import { tanks, measurements } from './tankData.js'
import { createChart, createTankCard } from './tankCard.js'
import { openModal, setupModal } from './modal.js'

export function initializeDashboard() {

    initMap()

    const tanksOverview = document.getElementById('tanks-overview')

    // fetch tanks
    fetch('http://localhost:3000/api/tanks')
        .then(response => response.json())
        .then(data => {
            data.data.forEach(tank => {
                tanks.push(tank)
                addMarker(tank)

                const card = createTankCard(tank)
                tanksOverview.appendChild(card, tanksOverview.lastElementChild)

                updateTankMeasurements(tank)
            })

            const addButton = createAddTankButton()
            tanksOverview.appendChild(addButton)

        })
    
    setupModal()
}

function createAddTankButton() {
    const button = document.createElement('div')
    button.className = 'add-tank-btn'
    button.innerHTML = '+'
    button.addEventListener('click', openModal)
    return button
}

export function addNewTank(tank) {
    fetch('http://localhost:3000/api/tanks', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tank)
    })
    .then(response => response.json())
    .then(data => {
        const newTank = data.data
        tanks.push(newTank)
        addMarker(newTank)
        const card = createTankCard(newTank)
        const tanksOverview = document.getElementById('tanks-overview')
        tanksOverview.insertBefore(card, tanksOverview.lastElementChild)
    
        document.getElementById('newTankForm').reset()
    })
}

export function updateTankMeasurements(tank) {
    measurements[tank.id] = []
    console.log(tank)
    fetch(`http://localhost:3000/api/tanks/${tank.id}/measurements`)
        .then(response => response.json())
        .then(data => {
            data.data.forEach(measurement => {
                measurements[tank.id].push(measurement)
            })

            console.log("tank", tank.id, "measurements: ", measurements[tank.id])
            createChart(tank)
        })
        
}


export function deleteTank(tank) {

    fetch(`http://localhost:3000/api/tanks/${tank.id}`, {
        method: "DELETE",
    })
    .then(response => response.json())
    .then(data => {
        console.log("data:", data)
        // remove the tank from the tanks array
        tanks.splice(tanks.findIndex(t => t.id === tank.id), 1)

        removeMarker(tank)

        // remove tank card from DOM
        const card = document.getElementById(`card-${tank.id}`)
        card.remove()
    })
}
