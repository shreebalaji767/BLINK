import Link from "next/link";

export default function NotFound() {
  return <main style={{minHeight:"100svh",display:"grid",placeItems:"center",background:"#050507",color:"#fff",padding:24}}>
    <section style={{width:"min(460px,100%)",padding:28,border:"1px solid #282d38",borderRadius:24,background:"#0e1016",textAlign:"center"}}>
      <div style={{fontSize:34,fontWeight:900,letterSpacing:"-0.08em"}}>BLINK</div>
      <p style={{margin:"18px 0 6px",color:"#8b93a5",fontWeight:800}}>404</p><h1 style={{margin:0}}>Page not found</h1>
      <p style={{color:"#8b93a5",lineHeight:1.6}}>That BLINK page does not exist or is no longer available.</p>
      <Link href="/" style={{display:"inline-block",marginTop:8,borderRadius:12,padding:"11px 16px",background:"#fff",color:"#090a0d",fontWeight:800}}>Go home</Link>
    </section>
  </main>;
}
