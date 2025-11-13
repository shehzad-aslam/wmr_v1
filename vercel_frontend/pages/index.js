import Head from 'next/head'
import ImageUploader from '../components/ImageUploader'

export default function Home() {
  return (
    <div style={{maxWidth:980, margin:'32px auto', fontFamily:'system-ui,Arial'}}>
      <Head><title>Watermark Remover — Demo (Vercel)</title></Head>
      <h1>Watermark Remover — Vercel Demo</h1>
      <p style={{color:'#555'}}>This frontend runs on Vercel. Image processing is performed by your external backend (set BACKEND_URL).</p>
      <ImageUploader />
      <hr style={{marginTop:24}} />
      <p style={{color:'#777',fontSize:13}}>Note: do not upload copyrighted images without permission. Use for testing/education.</p>
    </div>
  )
}
