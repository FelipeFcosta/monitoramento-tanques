const express = require('express')
const http = require('http')
const db = require('./database.js')
const cors = require("cors")
const { Server } = require("socket.io");		// websocket for dynamic tank level update

const corsOptions = {
	origin:'*', 
	credentials:true,
	optionSuccessStatus:200,
}

const port = 3000

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
	cors: {
		origin: "http://localhost:5000",
		methods: ["GET", "POST"]
	}
})

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
	db.run(insertTank, [id, name, level, capacity, lat, lng], err => {
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
	const tank_id = req.params.id
	db.run('DELETE FROM tank WHERE id = ?', tank_id, (err) => {
		if (err) {
			res.status(400).json({"error": err.message})
			return
		}
		res.json({"message":"success tank deletion", changes: this.changes})
	})
})


// get measurements for a tank
app.get('/api/tanks/:tank_id/measurements', (req, res) => {
	const tank_id = req.params.tank_id
	db.all("SELECT * FROM measurement WHERE tank_id = ? ORDER BY timecode ASC", tank_id, (err, rows) => {
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
app.post('/api/tanks/:tank_id/measurements', (req, res) => {
	const { timecode, level, tank_id } = req.body
	const tank_id_param =  req.params.tank_id
	const insertTank = 'INSERT INTO measurement (timecode, level, tank_id) VALUES (?, ?, ?)'
	db.run(insertTank, [timecode, level, tank_id_param], err => {
		if (err) {
			res.status(400).json({"error": err.message})
			return
		}
		res.json({
			"message": "success measurement post",
			"data": { timecode, level, tank_id_param }
		})
		// notify client of new measurement performed
		io.emit('newMeasurement', { timecode, level, tank_id_param })
		console.log("newMeasurement emitted")
	})
})

// listener for socket connections
io.on('connection', (socket) => {
	console.log('New client connected')
	socket.on('disconnect', () => {
		console.log('Client disconnected')
	})
})

server.listen(port, () => {
	console.log(`Server running at http://127.0.0.1:${port}`)
})


