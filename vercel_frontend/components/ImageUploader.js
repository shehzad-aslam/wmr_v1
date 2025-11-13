import {useState, useRef} from 'react'

export default function ImageUploader(){
  const [origSrc, setOrigSrc] = useState(null)
  const [maskSrc, setMaskSrc] = useState(null)
  const [resultSrc, setResultSrc] = useState(null)
  const fileRef = useRef(null)
  const [loading, setLoading] = useState(false)

  function handleFile(e){
    const f = e.target.files?.[0]
    if(!f) return
    setOrigSrc(URL.createObjectURL(f))
    setMaskSrc(null)
    setResultSrc(null)
  }

  async function postToApi(route, file, extra={}){
    const fd = new FormData()
    fd.append('image', file)
    if(extra.mask) fd.append('mask', extra.mask)
    const res = await fetch(route, {method:'POST', body:fd})
    if(!res.ok) throw new Error('Server error: '+res.status)
    const blob = await res.blob()
    return blob
  }

  async function detectMask(){
    if(!fileRef.current.files?.[0]) return alert('Choose file first')
    setLoading(true)
    try{
      const blob = await postToApi('/api/detect-mask', fileRef.current.files[0])
      setMaskSrc(URL.createObjectURL(blob))
    }catch(err){
      alert('Detect failed: '+err.message)
    }finally{ setLoading(false) }
  }

  async function inpaint(){
    if(!fileRef.current.files?.[0]) return alert('Choose file first')
    setLoading(true)
    try{
      let maskFile = null
      if(maskSrc){
        const resp = await fetch(maskSrc)
        const ab = await resp.blob()
        maskFile = new File([ab], 'mask.png', {type:ab.type})
      }
      const blob = await postToApi('/api/inpaint', fileRef.current.files[0], {mask: maskFile})
      setResultSrc(URL.createObjectURL(blob))
    }catch(err){
      alert('Inpaint failed: '+err.message)
    }finally{ setLoading(false) }
  }

  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18}}>
      <div>
        <div style={{marginBottom:8}}>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} />
        </div>

        <div style={{display:'flex', gap:8}}>
          <button onClick={detectMask} disabled={loading}>Detect Mask</button>
          <button onClick={inpaint} disabled={loading}>Inpaint</button>
        </div>

        <div style={{marginTop:12}}>
          <div style={{marginBottom:8}}>Original</div>
          <div style={{border:'1px solid #eee', padding:8, minHeight:200, display:'flex', alignItems:'center', justifyContent:'center'}}>
            {origSrc ? <img src={origSrc} style={{maxWidth:'100%', maxHeight:360}}/> : <span style={{color:'#999'}}>No image selected</span>}
          </div>
        </div>
      </div>

      <div>
        <div style={{marginBottom:8}}>Mask (overlay)</div>
        <div style={{border:'1px solid #eee', padding:8, minHeight:200, display:'flex', alignItems:'center', justifyContent:'center', position:'relative'}}>
          {maskSrc ? <img src={maskSrc} style={{maxWidth:'100%', maxHeight:360}}/> : <span style={{color:'#999'}}>No mask yet</span>}
        </div>

        <div style={{marginTop:12}}>
          <div style={{marginBottom:8}}>Result</div>
          <div style={{border:'1px solid #eee', padding:8, minHeight:200, display:'flex', alignItems:'center', justifyContent:'center'}}>
            {resultSrc ? <img src={resultSrc} style={{maxWidth:'100%', maxHeight:360}}/> : <span style={{color:'#999'}}>No result yet</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
