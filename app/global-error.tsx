"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body style={{margin:0,background:"#050507",color:"#fff",fontFamily:"system-ui,sans-serif"}}>
    <main style={{minHeight:"100svh",display:"grid",placeItems:"center",padding:24}}>
      <section style={{width:"min(460px,100%)",padding:28,border:"1px solid #282d38",borderRadius:24,background:"#0e1016",textAlign:"center"}}>
        <div style={{fontSize:34,fontWeight:900,letterSpacing:"-0.08em"}}>BLINK</div>
        <h1 style={{margin:"18px 0 8px"}}>BLINK needs a restart</h1>
        <p style={{color:"#8b93a5",lineHeight:1.6}}>A critical application error occurred.</p>
        <button type="button" onClick={() => reset()} style={{border:0,borderRadius:12,padding:"11px 16px",background:"#fff",color:"#090a0d",fontWeight:800,cursor:"pointer"}}>Try again</button>
      </section>
    </main>
  </body></html>;
}
