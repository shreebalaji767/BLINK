export default function Loading() {
  return <main aria-busy="true" aria-label="Loading BLINK" style={{minHeight:"100svh",display:"grid",placeItems:"center",background:"#050507",color:"#fff",padding:24}}>
    <div style={{textAlign:"center"}}><div style={{fontSize:34,fontWeight:900,letterSpacing:"-0.08em"}}>BLINK</div><p style={{margin:"8px 0 0",color:"#8b93a5"}}>Loading…</p></div>
  </main>;
}
