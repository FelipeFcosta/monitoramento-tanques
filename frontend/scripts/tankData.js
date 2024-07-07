export const tanks = [
    // { id: 'T001', name: 'Tanque 0', level: 75, capacity: 1000, consumptionHistory: [980, 950, 920, 890, 860, 830, 800, 770], lat: -15.758902, lng: -47.870856 },
    // { id: 'T002', name: 'Tanque 2', level: 50, capacity: 1500, consumptionHistory: [1450, 1400, 1350, 1300, 1250, 1200, 1150, 1100], lat: -15.778902, lng: -47.870740 },
    // { id: 'T003', name: 'Tanque 3', level: 25, capacity: 2000, consumptionHistory: [1900, 1800, 1700, 1600, 1500, 1400, 1300, 1200], lat: -15.758902, lng: -47.855740 },
]

export const TankType = {
    HORIZONTAL_CYLINDER: "horizontal-cylinder",
    VERTICAL_CYLINDER: "vertical-cylindric",
};

export const measurements = {}


export function getRefillTimeString(tank) {
    const refillTimeS = calculateRefillTime(tank)
    const refillTimeM = refillTimeS / 60
    const refillTimeH = refillTimeM / 60
    const refillTimeD = refillTimeH / 24

    if (refillTimeM < 2)   return `${Math.floor(refillTimeS)} segundos`
    if (refillTimeH < 2)   return `${Math.floor(refillTimeM)} minutos`
    if (refillTimeD < 2)   return `${Math.floor(refillTimeH)} horas`
    else                   return `${Math.floor(refillTimeD)} dias`
}

export function getConsumptionRateString(tank) {
    const consumptionRate_L_S = calculateConsumptionRate(tank);
    const consumptionRate_L_M = consumptionRate_L_S * 60;
    const consumptionRate_L_H = consumptionRate_L_M * 60;
    const consumptionRate_L_D = consumptionRate_L_H * 24;

    if (consumptionRate_L_M > 100)      return `${consumptionRate_L_S.toFixed(1)} L/s`
    else if (consumptionRate_L_H > 100) return `${consumptionRate_L_M.toFixed(1)} L/min`
    else if (consumptionRate_L_D > 100) return `${consumptionRate_L_H.toFixed(1)} L/h`
    else                              return `${consumptionRate_L_D.toFixed(1)} L/dia`
}


export function calculateConsumptionRate(tank) {
    if (measurements[tank.id]) {
        const history = measurements[tank.id]
        const consumptionRates = history.map((measurement, index) => {
            if (index > 0) {
                const prevMeasurement = history[index - 1]
                const timeDiff = (new Date(measurement.timecode) - new Date(prevMeasurement.timecode)) / 1000; // time difference in seconds
                const levelDiff = calculateLevel(tank, prevMeasurement.distanceCm) - calculateLevel(tank, measurement.distanceCm)
                if (timeDiff != 0)
                    return levelDiff / timeDiff; // consumption rate per second
            }
            return 0
        }).slice(1);    // discard first element
        
        // average consumption rate
        const avgConsumptionRate = consumptionRates.reduce((a, b) => a + b, 0) / consumptionRates.length
        return avgConsumptionRate
    }
    return 0
}

export function calculateRefillTime(tank) {
    if (measurements[tank.id] && measurements[tank.id].length > 0) {
        const currentLevelLiters = getCurrentLevel(tank)
        const consumptionRate = calculateConsumptionRate(tank)
        console.log("consumptionRate", consumptionRate)
        if (consumptionRate != 0) {
            return Math.floor(currentLevelLiters / consumptionRate) // refill time in seconds
        }
    }
    return 0
}


export function calculateCapacity(tank) {
    let calculatedCapacity = 0
    if (tank.type == "horizontalCylinder") {
        let r = tank.diameter / 2
        let area = Math.PI * r * r
        calculatedCapacity = (area * tank.length).toFixed(4) * 1000
    } else if (tank.type == "verticalCylinder") {
        let r = tank.diameter / 2
        let area = Math.PI * r * r
        calculatedCapacity = (area * tank.height).toFixed(4) * 1000
    }

    tank.capacity = calculatedCapacity
    return calculatedCapacity
}


export function calculateLevel(tank, distanceCm) {
    let level = 0
    if (tank.type == "horizontalCylinder") {
        let filledHeight = tank.diameter - distanceCm/100.0
        let r = tank.diameter / 2
        let filledArea = Math.acos((r - filledHeight)/r) * r*r - (r - filledHeight) * Math.sqrt(2 * r * filledHeight - filledHeight*filledHeight)
        level = (filledArea * tank.length).toFixed(4) * 1000
    } else if (tank.type == "verticalCylinder") {
        let r = tank.diameter / 2
        let filledHeight = tank.height - distanceCm/100.0
        let area = Math.PI * r * r
        level = (area * filledHeight).toFixed(4) * 1000
    }

    return level
}

export function getCurrentLevel(tank) {
    let currentLevel = 0
    if (measurements[tank.id] && measurements[tank.id].length > 0) {
        let currentDistanceCm = measurements[tank.id][measurements[tank.id].length-1].distanceCm
        currentLevel = calculateLevel(tank, currentDistanceCm);
    }
    return currentLevel
}

export function getCurrentLevelPercentage(tank) {
    if (tank.capacity > 0) return Math.floor(100*getCurrentLevel(tank)/tank.capacity)
    return 0
}