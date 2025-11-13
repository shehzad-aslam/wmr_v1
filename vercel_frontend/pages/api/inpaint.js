import fetch from 'node-fetch'
import FormData from 'form-data'

export const config = { api: { bodyParser: false } }

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).end('Method not allowed')
  const backend = process.env.BACKEND_URL
  if(!backend) return res.status(500).json({error:'BACKEND_URL not configured'})

  try{
    const form = new FormData()
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const buffer = Buffer.concat(chunks)
    const contentType = req.headers['content-type'] || 'application/octet-stream'
    form.append('image', buffer, { filename:'upload.png', contentType })
    const forward = await fetch(`${backend.replace(/\/$/,'')}/inpaint`, { method:'POST', body: form })
    const arrayBuf = await forward.arrayBuffer()
    const buf = Buffer.from(arrayBuf)
    res.setHeader('Content-Type', forward.headers.get('content-type') || 'image/png')
    res.send(buf)
  }catch(err){
    console.error(err)
    res.status(500).json({error: String(err)})
  }
}
