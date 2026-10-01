"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("BLINK route error", error); }, [error]);
  return <main style={pageStyle}><section style={cardStyle} role="alert">
    <div style={logoStyle}>BLINK</div><h1 style={titleStyle}>Something went wrong</h1>
    <p style={mutedStyle}>The page hit an unexpected error. Please try again.</p>
    <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
      <button type="button" onClick={() => reset()} style={primaryStyle}>Try again</button>
      <a href="/" style={secondaryStyle}>Go home</a>
    </div>
  </section></main>;
}
const pageStyle: React.CSSProperties={minHeight:"100svh",display:"grid",placeItems:"center",background:"#050507",color:"#fff",padding:24};
const cardStyle: React.CSSProperties={width:"min(460px,100%)",padding:28,border:"1px solid #282d38",borderRadius:24,background:"#0e1016",textAlign:"center"};
const logoStyle: React.CSSProperties={fontSize:34,fontWeight:900,letterSpacing:"-0.08em"};
const titleStyle: React.CSSProperties={margin:"18px 0 8px",fontSize:28,letterSpacing:"-0.04em"};
const mutedStyle: React.CSSProperties={color:"#8b93a5",lineHeight:1.6,marginBottom:22};
const primaryStyle: React.CSSProperties={border:0,borderRadius:12,padding:"11px 16px",background:"#fff",color:"#090a0d",fontWeight:800,cursor:"pointer"};
const secondaryStyle: React.CSSProperties={border:"1px solid #303542",borderRadius:12,padding:"11px 16px",color:"#fff",textDecoration:"none"};
