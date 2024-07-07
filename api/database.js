
const sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "./tanks.db"


let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error(err.message)
    } else {
        console.log("conectado ao banco de dados 'tanks.db'")
    }
})

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS tank (
        id INTEGER PRIMARY KEY,
        name TEXT, 
        capacity INTEGER,
        type TEXT,
        diameter FLOAT,
        length FLOAT,
        height FLOAT,
        level INTEGER,
        lat REAL,
        lng REAL
    )`, (err) => {
        if (err) {
            console.error("Error creating 'tank' table:", err.message)
        } else {
            // table newly created, create mock rows
            const insertTank = 'INSERT INTO tank (id, name, capacity, type, diameter, length, height, lat, lng) VALUES (?,?,?,?,?,?,?,?,?)'
            db.run(insertTank, [1, "Tanque 1", 0, "horizontalCylinder", 0.9, 2.5, 0, -15.758902, -47.870856])
            // db.run(insertTank, [2, "Tanque 2", 1500, 50, -15.754902, -47.850740])
        }
    })


    db.run(`CREATE TABLE IF NOT EXISTS measurement (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timecode DATETIME,
        distanceCm INTEGER,
        tank_id INTEGER,
        rssi INTEGER,
        FOREIGN KEY(tank_id) REFERENCES tank(id) ON DELETE CASCADE
    )`, (err) => {
        if (err) {
            console.error("Error creating 'measurement' table:", err.message)
        } else {
            // table newly created, create mock rows
            const insertMeasurement = 'INSERT INTO measurement (timecode, distanceCm, tank_id, rssi) VALUES (?,?,?,?)'
            db.run(insertMeasurement, ["2024-01-01 10:00:00", 10, 1, -50])
            db.run(insertMeasurement, ["2024-01-01 10:01:00", 20, 1, -50])
            db.run(insertMeasurement, ["2024-01-01 10:02:00", 24, 1, -40])
            // db.run(insertMeasurement, ["2024-01-01 10:00:00", 1480, 2])
            // db.run(insertMeasurement, ["2024-01-01 10:01:00", 1350, 2])
            // db.run(insertMeasurement, ["2024-01-01 10:02:00", 1210, 2])
        }
    })
})

module.exports = db
