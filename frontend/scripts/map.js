let map
let markers = {}
let lastClickedTank = null


export function initMap() {
    map = L.map('map').setView([-15.762755, -47.868930], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

}


/**
 * Highlights the specified tank in map
 */
export function highlightTank(tank) {
    // Remove highlight from previously clicked tank
    if (lastClickedTank) {
        removeLastHighlight(lastClickedTank)
    }

    // Highlight new clicked tank
    lastClickedTank = tank
    const card = document.getElementById(`card-${tank.id}`)
    card.classList.add('highlighted')

    // Change map marker to red
    markers[tank.id].setIcon(L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    }))

}


function removeLastHighlight(lastClickedTank) {
    const lastCard = document.getElementById(`card-${lastClickedTank.id}`)
    lastCard.classList.remove('highlighted')
    markers[lastClickedTank.id].setIcon(L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    }))
}

export function addMarker(tank) {
    const marker = L.marker([tank.lat, tank.lng])
        .addTo(map)
        .bindPopup(`<b>${tank.name}</b><br>Nível: ${tank.level}%`)
    markers[tank.id] = marker
}

export function removeMarker(tank) {
    map.removeLayer(markers[tank.id])
    delete markers[tank.id]

    // Clear highlight if this was the last clicked tank
    if (lastClickedTank && lastClickedTank.id === tank.id) {
        lastClickedTank = null
    }
}
