import Link from "next/link";

export default function NotFound() {
  return (
    <main className="research-app research-fallback-shell">
      <section className="research-fallback-card">
        <div className="research-fallback-copy">
          <span className="section-kicker">Not Found</span>
          <h1>요청하신 리서치 페이지를 찾지 못했습니다.</h1>
          <p>티커나 섹터 코드가 바뀌었거나, 아직 이 브리핑에서 지원하지 않는 대상일 수 있습니다.</p>
        </div>

        <div className="research-fallback-actions">
          <Link className="api-button" href="/">
            홈으로 가기
          </Link>
        </div>
      </section>
    </main>
  );
}
