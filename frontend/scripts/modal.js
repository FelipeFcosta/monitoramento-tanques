import { addNewTank } from './dashboard.js'
import { calculateCapacity, measurements } from './tankData.js'

let minimap
let minimapMarker

document.addEventListener('DOMContentLoaded', function() {
    const tankTypeSelect = document.getElementById('tankType');
    const horizontalDimensions = document.getElementById('horizontalDimensions');
    const verticalDimensions = document.getElementById('verticalDimensions');

    const tankDiameterInput = document.getElementById('tankDiameter');
    const tankLengthInput = document.getElementById('tankLength');
    const tankHeightInput = document.getElementById('tankHeight');
    const tankDiameterVerticalInput = document.getElementById('tankDiameterVertical');

    
    tankTypeSelect.addEventListener('change', function() {
        if (this.value === 'horizontalCylinder') {
            horizontalDimensions.style.display = 'flex';
            verticalDimensions.style.display = 'none';
        } else if (this.value === 'verticalCylinder') {
            horizontalDimensions.style.display = 'none';
            verticalDimensions.style.display = 'flex';
        } else {
            horizontalDimensions.style.display = 'none';
            verticalDimensions.style.display = 'none';
        }

    });

    const dimensionInputs = document.querySelectorAll('#horizontalDimensions input, #verticalDimensions input');
    dimensionInputs.forEach(input => {
        input.addEventListener('input', calculateMaxCapacity);
    });
});

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
            id: Number(document.getElementById('tank_id').value),
            name: document.getElementById('tankName').value,
            capacity: parseInt(document.getElementById('tankCapacity').value),
            type: document.getElementById('tankType').value,
            length: parseFloat(document.getElementById('tankLength').value),
            diameter: parseFloat(document.getElementById('tankDiameter').value),
            height: parseFloat(document.getElementById('tankHeight').value),
            lat: parseFloat(document.getElementById('tankLat').value),
            lng: parseFloat(document.getElementById('tankLng').value),
        }

        if (!newTank.lat || !newTank.lng) {
            newTank.lat = -15.762755
            newTank.lng = -47.868930
        }

        if (!newTank.length)   newTank.length = 1
        if (!newTank.diameter) newTank.diameter = 1
        if (!newTank.height)   newTank.height = 1
        if (!newTank.capacity) newTank.capacity = calculateCapacity(newTank);

        measurements[newTank.id] = []
        
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


function calculateMaxCapacity() {
    const tankType = document.getElementById('tankType').value;
    const capacityInput = document.getElementById('tankCapacity');
    let maxCapacity;

    if (tankType === 'horizontalCylinder') {
        const diameter = parseFloat(document.getElementById('tankDiameter').value) || 0
        const length = parseFloat(document.getElementById('tankLength').value) || 0
        const r = (diameter/2)

        maxCapacity = Math.PI * r*r * length
        console.log("maxCapacity: ", maxCapacity)

    } else if (tankType === 'verticalCylinder') {
        const height = parseFloat(document.getElementById('tankHeight').value) || 0
        const diameter = parseFloat(document.getElementById('tankDiameterVertical').value) || 0
        maxCapacity = Math.round(Math.PI * (diameter/2)*(diameter/2) * height)
    }

    maxCapacity = maxCapacity.toFixed(4)
    let maxCapacityLiters = 1000*maxCapacity;

    capacityInput.max = maxCapacityLiters;
    capacityInput.value = maxCapacityLiters;
}


function updateLatLng(latlng) {
    document.getElementById('tankLat').value = latlng.lat.toFixed(6)
    document.getElementById('tankLng').value = latlng.lng.toFixed(6)
}