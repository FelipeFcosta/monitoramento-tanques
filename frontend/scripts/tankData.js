export const tanks = [
    // { id: 'T001', name: 'Tanque 0', level: 75, capacity: 1000, consumptionHistory: [980, 950, 920, 890, 860, 830, 800, 770], lat: -15.758902, lng: -47.870856 },
    // { id: 'T002', name: 'Tanque 2', level: 50, capacity: 1500, consumptionHistory: [1450, 1400, 1350, 1300, 1250, 1200, 1150, 1100], lat: -15.778902, lng: -47.870740 },
    // { id: 'T003', name: 'Tanque 3', level: 25, capacity: 2000, consumptionHistory: [1900, 1800, 1700, 1600, 1500, 1400, 1300, 1200], lat: -15.758902, lng: -47.855740 },
]

export const measurements = {}

export function calculateConsumptionRate(tank) {
    const history = tank.consumptionHistory
    if (history) {
        const dailyConsumption = history.map((val, index) => 
            index > 0 ? history[index-1] - val : 0
        ).slice(1)
        const avgConsumption = dailyConsumption.reduce((a, b) => a + b, 0) / dailyConsumption.length
        return avgConsumption.toFixed(2)
    }
    return 0
}

export function calculateRefillTime(tank) {
    const currentLevel = tank.level / 100 * tank.capacity
    const consumptionRate = calculateConsumptionRate(tank)
    return Math.floor(currentLevel / consumptionRate)
}