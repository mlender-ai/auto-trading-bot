export default function Loading() {
  return (
    <main className="research-app research-fallback-shell">
      <section className="research-fallback-card loading">
        <div className="research-fallback-copy">
          <span className="section-kicker">Loading</span>
          <h1>브리핑을 준비하고 있습니다.</h1>
          <p>첫 화면에서 바로 읽을 수 있게 핵심 데이터만 먼저 정리하고 있습니다.</p>
        </div>

        <div className="research-loading-grid" aria-hidden="true">
          <div className="research-loading-card large" />
          <div className="research-loading-stack">
            <div className="research-loading-card" />
            <div className="research-loading-card" />
          </div>
        </div>
      </section>
    </main>
  );
}
