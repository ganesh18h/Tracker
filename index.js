const express = require('express')
const cors = require('cors')
const { createClient } = require('@supabase/supabase-js')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('.'))

const supabase = createClient(
  'https://mkbkbxhnfziouextqwsa.supabase.co',
  'sb_publishable_FPMDun6m0OHYoO47QYveCw_-EDgfLxa'
)

app.get('/jobs/:id', async (req, res) => {
  const query = req.params.id.toUpperCase().trim()
  console.log('Searching for:', JSON.stringify(query))
  const { data, error } = await supabase.from('jobs').select('*')
  if (error) return res.status(500).json({ error: error.message })
  console.log('All regs:', data.map(j => JSON.stringify(j.reg)))
  const job = data.find(j =>
    j.id.toUpperCase().trim() === query ||
    j.reg.toUpperCase().trim() === query
  )
  console.log('Found job:', job ? job.id : 'NOT FOUND')
  if (!job) return res.status(404).json({ error: 'Job not found' })
  res.json(job)
})

app.post('/jobs', async (req, res) => {
  const { reg, customer, phone, time } = req.body
  const { data: all } = await supabase.from('jobs').select('id')
  const id = 'JOB-' + String((all?.length || 0) + 1).padStart(3, '0')
  const { data, error } = await supabase.from('jobs').insert([
    { id, reg, customer, phone, time, status: 'received', reason: null }
  ]).select()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data[0])
})

app.patch('/jobs/:id/status', async (req, res) => {
  const id = decodeURIComponent(req.params.id).trim()
  const status = req.body.status
  console.log('PATCH status — id:', JSON.stringify(id), 'status:', status)
  const { data, error } = await supabase
    .from('jobs')
    .update({ status })
    .eq('id', id)
    .select()
  console.log('Result — rows:', data?.length, data)
  if (error) return res.status(500).json({ error: error.message })
  if (!data || data.length === 0) return res.status(404).json({ error: 'Job not found — id did not match' })
  res.json({ message: 'Status updated', rowsUpdated: data.length, data })
})

app.patch('/jobs/:id/reason', async (req, res) => {
  const id = decodeURIComponent(req.params.id).trim()
  const reason = req.body.reason
  console.log('PATCH reason — id:', JSON.stringify(id), 'reason:', reason)
  const { data, error } = await supabase
    .from('jobs')
    .update({ reason })
    .eq('id', id)
    .select()
  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: 'Reason updated', rowsUpdated: data?.length })
})

app.listen(3000, () => console.log('Server started on http://localhost:3000'))
