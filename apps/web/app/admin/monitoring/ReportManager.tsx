"use client";

import { useState } from "react";

interface ReportItem {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  userEmail: string;
  drawTicker: string;
  drawHeadline: string;
}

export function ReportManager({ reports }: { reports: ReportItem[] }) {
  const [processing, setProcessing] = useState<string | null>(null);

  async function resolveReport(id: string, newStatus: "REVIEWED" | "RESOLVED") {
    setProcessing(id);
    try {
      await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      window.location.reload();
    } catch {
      alert("처리 실패");
    } finally {
      setProcessing(null);
    }
  }

  if (reports.length === 0) {
    return <p className="admin-empty admin-empty-good">미처리 신고 없음</p>;
  }

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>종목</th>
          <th>헤드라인</th>
          <th>사유</th>
          <th>신고자</th>
          <th>일시</th>
          <th>조치</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((r) => (
          <tr key={r.id}>
            <td><span className="admin-ticker">{r.drawTicker}</span></td>
            <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>
              {r.drawHeadline}
            </td>
            <td style={{ fontSize: 12 }}>{r.reason}</td>
            <td style={{ fontSize: 11 }}>{r.userEmail}</td>
            <td style={{ fontSize: 11 }}>{new Date(r.createdAt).toLocaleString("ko-KR")}</td>
            <td>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  className="admin-btn admin-btn-sm"
                  disabled={processing === r.id}
                  onClick={() => resolveReport(r.id, "REVIEWED")}
                >
                  검토완료
                </button>
                <button
                  className="admin-btn admin-btn-sm admin-btn-success"
                  disabled={processing === r.id}
                  onClick={() => resolveReport(r.id, "RESOLVED")}
                >
                  해결
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
