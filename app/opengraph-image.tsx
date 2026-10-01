import { ImageResponse } from "next/og";

export const alt = "BLINK — Camera, Chat & Stories";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",padding:"80px",background:"#050507",color:"#fff",fontFamily:"Arial"}}>
      <div style={{fontSize:42,fontWeight:800,letterSpacing:"-0.06em"}}>BLINK</div>
      <div style={{fontSize:76,fontWeight:800,letterSpacing:"-0.05em",marginTop:24}}>Camera, Chat & Stories</div>
      <div style={{fontSize:32,color:"#aab1c0",marginTop:28}}>Connect. Share. Blink.</div>
    </div>,
    size
  );
}
