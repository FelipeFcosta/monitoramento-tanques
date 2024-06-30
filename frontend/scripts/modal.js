import { addNewTank } from './dashboard.js'

let minimap
let minimapMarker

export function setupModal() {
    const modal = document.getElementById('newTankModal')
    const closeBtn = modal.querySelector('.close')
    const form = document.getElementById('newTankForm')

    // close button click
    closeBtn.onclick = () => {
        modal.style.display = 'none'
        if (minimap) {
            minimap.remove()
            minimap = null
        }
    }
    // click outside modal
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none'
            if (minimap) {
                minimap.remove()
                minimap = null
            }
        }
    }

    form.onsubmit = (e) => {
        e.preventDefault()

        const newTank = {   // get new tank info from form
            id: Number(document.getElementById('tankId').value),
            name: document.getElementById('tankName').value,
            capacity: parseInt(document.getElementById('tankCapacity').value),
            level: Math.floor(Math.random() * 100),
            lat: parseFloat(document.getElementById('tankLat').value),
            lng: parseFloat(document.getElementById('tankLng').value)
        }

        measurements[newTank.id] = Array.from({length: 8}, () => Math.floor(Math.random() * newTank.capacity)),

        addNewTank(newTank)

        modal.style.display = 'none'
        if (minimap) {
            minimap.remove()
            minimap = null
        }
    }
}

export function openModal() {
    const modal = document.getElementById('newTankModal')
    modal.style.display = 'block'

    // Initialize minimap
    if (!minimap) {
        minimap = L.map('minimap').setView([-15.762755, -47.868930], 10)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(minimap)
        
        minimapMarker = L.marker([-15.762755, -47.868930], {draggable: true}).addTo(minimap)
        
        minimap.on('click', function(e) {
            minimapMarker.setLatLng(e.latlng)
            updateLatLng(e.latlng)
        })
        
        minimapMarker.on('dragend', function(e) {
            updateLatLng(e.target.getLatLng())
            
        })
    }
}


function updateLatLng(latlng) {
    document.getElementById('tankLat').value = latlng.lat.toFixed(6)
    document.getElementById('tankLng').value = latlng.lng.toFixed(6)
}