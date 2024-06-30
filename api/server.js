const express = require('express')
const db = require('./database.js')
const cors = require("cors")

const corsOptions ={
	origin:'*', 
	credentials:true,
	optionSuccessStatus:200,
}

const app = express()
const port = 3000

app.use(cors(corsOptions))

app.use(express.static('public'))
app.use(express.json())


// get tank list
app.get('/api/tanks', (req, res) => {
	db.all("SELECT * FROM tank", [], (err, rows) => {  // get all tanks at once
		if (err) {
			res.status(400).json({"error retrieving tanks": err.message})
			return
		}
		// return every tank instance
		res.json({
			"message": "success tank retrieval",
			"data": rows
		})
	})
})


// add new tank
app.post('/api/tanks', (req, res) => {
	const { id, name, level, capacity, lat, lng } = req.body
	const insertTank = 'INSERT INTO tank (id, name, level, capacity, lat, lng) VALUES (?, ?, ?, ?, ?, ?)'
	db.run(insertTank, [id, name, level, capacity, lat, lng], function(err) {
		if (err) {
			res.status(400).json({"error": err.message})
			return
		}
		res.json({
			"message": "success tank post",
			"data": { id, name, level, capacity, lat, lng }
		})
	})
})

// delete tank and its measurements
app.delete('/api/tanks/:id', (req, res) => {
	const tankId = req.params.id
	db.run('DELETE FROM tank WHERE id = ?', tankId, (err) => {
		if (err) {
			res.status(400).json({"error": err.message})
			return
		}
		res.json({"message":"success tank deletion", changes: this.changes})
	})
})


// get measurements for a tank
app.get('/api/tanks/:tankId/measurements', (req, res) => {
	const tankId = req.params.tankId
	db.all("SELECT * FROM measurement WHERE tank_id = ? ORDER BY timecode ASC", tankId, (err, rows) => {
		if (err) {
			res.status(400).json({"error retrieving measurements": err.message})
			return
		}
        res.json({
            "message": "success retrieving measurements",
            "data": rows
        })
	})
})


// add new measurement for a tank
app.post('/api/tanks/:tankId/measurements', (req, res) => {
	const { timecode, level, tank_id } = req.body
	const insertTank = 'INSERT INTO tank (timecode, level, tank_id) VALUES (?, ?, ?)'
	db.run(insertTank, [timecode, level, tank_id], function(err) {
		if (err) {
			res.status(400).json({"error": err.message})
			return
		}
		res.json({
			"message": "success measurement post",
			"data": { timecode, level, tank_id }
		})
	})
})



app.listen(port, () => {
	console.log(`Server running at http://127.0.0.1:${port}`)
})


