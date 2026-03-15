const express = require('express')
const cors = require('cors')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('trackr.json')
const db = low(adapter)

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('.'))

db.defaults({ jobs: [
  { id:'JOB-001', reg:'TS09AB1234', customer:'Ravi Kumar', phone:'9876500001', time:'2-4 hrs', status:'received' },
  { id:'JOB-002', reg:'AP28BV3312', customer:'Lakshmi Devi', phone:'9876500002', time:'1-2 hrs', status:'ready' }
]}).write()

app.get('/jobs', (req, res) => {
  res.json(db.get('jobs').value())
})

app.get('/jobs/:id', (req, res) => {
  const query = req.params.id.toUpperCase()
  const job = db.get('jobs').find(j =>
    j.id.toUpperCase() === query ||
    j.reg.toUpperCase() === query
  ).value()
  if (!job) return res.status(404).json({ error: 'Job not found' })
  res.json(job)
})

app.post('/jobs', (req, res) => {
  const { reg, customer, phone, time } = req.body
  const total = db.get('jobs').value().length
  const id = 'JOB-' + String(total + 1).padStart(3, '0')
  const newJob = { id, reg, customer, phone, time, status: 'received' }
  db.get('jobs').push(newJob).write()
  res.json(newJob)
})

app.patch('/jobs/:id/status', (req, res) => {
  const query = req.params.id.toUpperCase()
  const job = db.get('jobs').find(j =>
    j.id.toUpperCase() === query ||
    j.reg.toUpperCase() === query
  ).value()
  if (!job) return res.status(404).json({ error: 'Job not found' })
  db.get('jobs').find(j =>
    j.id.toUpperCase() === query
  ).assign({ status: req.body.status }).write()
  res.json({ message: 'Status updated', job })
})

app.listen(3000, () => console.log('Server started on http://localhost:3000'))
