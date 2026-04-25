"use client";

export default function Error({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="research-app research-fallback-shell">
      <section className="research-fallback-card">
        <div className="research-fallback-copy">
          <span className="section-kicker">Temporary Issue</span>
          <h1>화면을 다시 불러오지 못했습니다.</h1>
          <p>데이터를 다시 정리해 안전하게 보여드릴 수 있도록 준비 중입니다. 아래에서 다시 시도하거나 홈으로 이동해 주세요.</p>
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
  );
}
