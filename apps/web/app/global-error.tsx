"use client";

export default function GlobalError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body>
        <main className="research-app research-fallback-shell">
          <section className="research-fallback-card">
            <div className="research-fallback-copy">
              <span className="section-kicker">Global Recovery</span>
              <h1>브리핑 워크스페이스를 열지 못했습니다.</h1>
              <p>문제가 생겨도 빈 화면으로 끝나지 않도록 복구 화면을 준비했습니다. 다시 시도하거나 첫 화면으로 이동해 주세요.</p>
            </div>

            <div className="research-fallback-actions">
              <button className="api-button" onClick={() => reset()} type="button">
                다시 시도
              </button>
              <a className="api-button subtle" href="/">
                홈으로 가기
              </a>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
