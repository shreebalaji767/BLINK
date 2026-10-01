  ] as [Tab, string, string][]).filter(([id]) => platformSettings[id] !== false);

  return <main className="blink-app">
    <header className="blink-topbar">
      <button className="blink-brand" onClick={() => navigateTab("camera")} aria-label="BLSSNVJ21 BLINK home">
        <img src="/icon.svg" alt="BLSSNVJ21 BLINK logo" width="40" height="40" />
        <span className="blink-brand-copy"><strong>BLSSNVJ21</strong><small>BLINK</small></span>
      </button>
      <div className="blink-top-actions">
        <button className="blink-round" onClick={() => navigateTab("friends")}>⌕</button><button className="blink-round" onClick={() => navigateTab("spotlight")}>▷</button><button className="blink-round" onClick={() => navigateTab("memories")}>▣</button>
        <button className="blink-round" onClick={() => notify(snaps.length ? snaps.length + " new Snap(s)" : "No new Snaps")}>♡</button>
        <SignOutButton />
      </div>
    </header>

    <section className="blink-content">
      {tab === "camera" && <div className="blink-camera-page">
        <div className="blink-camera-stage">
          {snapPreview ? <div className="blink-snap-preview">