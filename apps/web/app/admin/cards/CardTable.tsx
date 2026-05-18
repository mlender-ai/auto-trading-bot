"use client";

import { useState, useMemo } from "react";

interface CardWithCount {
  id: string;
  name: string;
  nameKo: string;
  arcana: string;
  number: number;
  keywords: unknown;
  keywordsKo: unknown;
  meaningUpright: string;
  meaningReversed: string;
  imageUrl: string;
  toneGuide: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { drawHistoryCards: number };
}

type SortKey = "number" | "name" | "usage";

export function CardTable({ cards }: { cards: CardWithCount[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [sortBy, setSortBy] = useState<SortKey>("number");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    nameKo: "",
    keywordsKo: "",
    meaningUpright: "",
    meaningReversed: "",
    toneGuide: "",
    imageUrl: "",
  });

  const totalUsage = useMemo(() => cards.reduce((s, c) => s + c._count.drawHistoryCards, 0), [cards]);

  const filtered = useMemo(() => {
    let result = cards.filter((c) => {
      if (filter !== "ALL" && c.status !== filter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return c.nameKo.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || (c.keywordsKo as string[]).some((kw) => kw.includes(q));
      }
      return true;
    });
    result = [...result].sort((a, b) => {
      if (sortBy === "number") return a.number - b.number;
      if (sortBy === "name") return a.nameKo.localeCompare(b.nameKo, "ko");
      return b._count.drawHistoryCards - a._count.drawHistoryCards;
    });
    return result;
  }, [cards, filter, searchQuery, sortBy]);

  const previewCard = previewId ? cards.find((c) => c.id === previewId) : null;

  function startEdit(card: CardWithCount) {
    setEditingId(card.id);
    setEditForm({
      nameKo: card.nameKo,
      keywordsKo: (card.keywordsKo as string[]).join(", "),
      meaningUpright: card.meaningUpright,
      meaningReversed: card.meaningReversed,
      toneGuide: card.toneGuide,
      imageUrl: card.imageUrl,
    });
  }

  async function saveCard(id: string) {
    setSaving(true);
    try {
      const payload: Record<string, string | string[]> = {
        nameKo: editForm.nameKo,
        meaningUpright: editForm.meaningUpright,
        meaningReversed: editForm.meaningReversed,
        toneGuide: editForm.toneGuide,
        imageUrl: editForm.imageUrl,
      };
      if (editForm.keywordsKo.trim()) {
        payload.keywordsKo = editForm.keywordsKo.split(",").map((kw) => kw.trim()).filter(Boolean);
      }
      await fetch(`/api/admin/cards/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setEditingId(null);
      window.location.reload();
    } catch {
      alert("저장 실패");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await fetch(`/api/admin/cards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    window.location.reload();
  }

  async function bulkToggle(status: "ACTIVE" | "INACTIVE") {
    const targets = cards.filter((c) => c.status !== status);
    if (targets.length === 0) return;
    if (!confirm(`${targets.length}장을 ${status === "ACTIVE" ? "활성화" : "비활성화"}하시겠습니까?`)) return;
    for (const card of targets) {
      await fetch(`/api/admin/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    }
    window.location.reload();
  }

  return (
    <>
      {/* 검색 + 필터 + 정렬 */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="카드 검색 (이름, 키워드)..."
          style={{ flex: 1, minWidth: 200, padding: "8px 12px", background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, color: "#f4f5f7", fontSize: 14 }}
        />
        <div style={{ display: "flex", gap: 4 }}>
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #333", background: filter === f ? "#3ecf8e" : "#1a1a1a", color: filter === f ? "#000" : "#ccc", cursor: "pointer", fontSize: 13 }}
            >
              {f === "ALL" ? "전체" : f === "ACTIVE" ? "활성" : "비활성"}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #333", background: "#1a1a1a", color: "#ccc", fontSize: 13 }}
        >
          <option value="number">번호순</option>
          <option value="name">이름순</option>
          <option value="usage">사용량순</option>
        </select>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={() => bulkToggle("ACTIVE")}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #333", background: "#1a1a1a", color: "#3ecf8e", cursor: "pointer", fontSize: 12 }}
          >
            전체 활성화
          </button>
          <button
            onClick={() => bulkToggle("INACTIVE")}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #333", background: "#1a1a1a", color: "#e16a5a", cursor: "pointer", fontSize: 12 }}
          >
            전체 비활성화
          </button>
        </div>
      </div>

      {/* 카드 미리보기 모달 */}
      {previewCard && (
        <div style={{ marginBottom: 24, padding: 24, background: "#111", borderRadius: 12, border: "1px solid #333" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: "#f4f5f7" }}>카드 미리보기</h3>
            <button onClick={() => setPreviewId(null)} style={{ background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 24 }}>
            <div style={{ width: 120, height: 180, background: "#0a0a0a", borderRadius: 10, border: "2px solid #3ecf8e", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 28 }}>{previewCard.number}</span>
              <span style={{ fontSize: 11, color: "#999" }}>{previewCard.nameKo}</span>
            </div>
            <div>
              <h4 style={{ color: "#f4f5f7", margin: "0 0 4px" }}>{previewCard.nameKo} ({previewCard.name})</h4>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {(previewCard.keywordsKo as string[]).map((kw) => (
                  <span key={kw} style={{ padding: "2px 8px", borderRadius: 4, background: "#222", color: "#bbb", fontSize: 12 }}>{kw}</span>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <span style={{ color: "#3ecf8e", fontSize: 12, fontWeight: 600 }}>↑ 정방향</span>
                  <p style={{ color: "#ccc", fontSize: 13, margin: "4px 0" }}>{previewCard.meaningUpright}</p>
                </div>
                <div>
                  <span style={{ color: "#e16a5a", fontSize: 12, fontWeight: 600 }}>↓ 역방향</span>
                  <p style={{ color: "#ccc", fontSize: 13, margin: "4px 0" }}>{previewCard.meaningReversed}</p>
                </div>
              </div>
              <div style={{ padding: 12, background: "#0a0a0a", borderRadius: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "#999" }}>톤 가이드</span>
                <p style={{ color: "#bbb", fontSize: 13, margin: "4px 0" }}>{previewCard.toneGuide}</p>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#999" }}>
                <span>사용 횟수: <strong style={{ color: "#f4f5f7" }}>{previewCard._count.drawHistoryCards}</strong></span>
                <span>전체 비율: <strong style={{ color: "#f4f5f7" }}>{totalUsage > 0 ? ((previewCard._count.drawHistoryCards / totalUsage) * 100).toFixed(1) : 0}%</strong></span>
                <span>상태: <strong style={{ color: previewCard.status === "ACTIVE" ? "#3ecf8e" : "#e16a5a" }}>{previewCard.status === "ACTIVE" ? "활성" : "비활성"}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="admin-card-grid">
        {filtered.map((card) => (
          <div key={card.id} className={`admin-card-item ${card.status === "INACTIVE" ? "inactive" : ""}`}>
            {editingId === card.id ? (
              <div className="admin-card-edit">
                <div className="admin-edit-field">
                  <label>한국어 이름</label>
                  <input
                    value={editForm.nameKo}
                    onChange={(e) => setEditForm({ ...editForm, nameKo: e.target.value })}
                  />
                </div>
                <div className="admin-edit-field">
                  <label>키워드 (쉼표 구분)</label>
                  <input
                    value={editForm.keywordsKo}
                    onChange={(e) => setEditForm({ ...editForm, keywordsKo: e.target.value })}
                    placeholder="새로운 시작, 즉흥성, 리스크"
                  />
                </div>
                <div className="admin-edit-field">
                  <label>정방향 의미</label>
                  <textarea
                    value={editForm.meaningUpright}
                    onChange={(e) => setEditForm({ ...editForm, meaningUpright: e.target.value })}
                  />
                </div>
                <div className="admin-edit-field">
                  <label>역방향 의미</label>
                  <textarea
                    value={editForm.meaningReversed}
                    onChange={(e) => setEditForm({ ...editForm, meaningReversed: e.target.value })}
                  />
                </div>
                <div className="admin-edit-field">
                  <label>톤 가이드</label>
                  <textarea
                    value={editForm.toneGuide}
                    onChange={(e) => setEditForm({ ...editForm, toneGuide: e.target.value })}
                  />
                </div>
                <div className="admin-edit-field">
                  <label>이미지 URL</label>
                  <input
                    value={editForm.imageUrl}
                    onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                  />
                </div>
                <div className="admin-edit-actions">
                  <button className="admin-btn admin-btn-primary" onClick={() => saveCard(card.id)} disabled={saving}>
                    {saving ? "저장 중..." : "저장"}
                  </button>
                  <button className="admin-btn admin-btn-ghost" onClick={() => setEditingId(null)}>취소</button>
                </div>
              </div>
            ) : (
              <>
                <div className="admin-card-header" style={{ cursor: "pointer" }} onClick={() => setPreviewId(previewId === card.id ? null : card.id)}>
                  <div className="admin-card-number">{card.number}</div>
                  <div className="admin-card-names">
                    <span className="admin-card-name-ko">{card.nameKo}</span>
                    <span className="admin-card-name-en">{card.name}</span>
                  </div>
                  <span className={`admin-status-dot ${card.status === "ACTIVE" ? "active" : "inactive"}`} />
                </div>
                <div className="admin-card-keywords">
                  {(card.keywordsKo as string[]).map((kw) => (
                    <span key={kw} className="admin-keyword-tag">{kw}</span>
                  ))}
                </div>
                <div className="admin-card-meanings">
                  <div className="admin-meaning">
                    <span className="admin-meaning-label">↑ 정방향</span>
                    <p>{card.meaningUpright}</p>
                  </div>
                  <div className="admin-meaning">
                    <span className="admin-meaning-label">↓ 역방향</span>
                    <p>{card.meaningReversed}</p>
                  </div>
                </div>
                <div className="admin-card-meta">
                  <span className="admin-meta-item">사용 {card._count.drawHistoryCards}회 ({totalUsage > 0 ? ((card._count.drawHistoryCards / totalUsage) * 100).toFixed(1) : 0}%)</span>
                  <span className="admin-meta-item">{card.toneGuide.slice(0, 30)}…</span>
                </div>
                <div className="admin-card-actions">
                  <button className="admin-btn admin-btn-sm" onClick={() => setPreviewId(card.id)}>미리보기</button>
                  <button className="admin-btn admin-btn-sm" onClick={() => startEdit(card)}>수정</button>
                  <button
                    className={`admin-btn admin-btn-sm ${card.status === "ACTIVE" ? "admin-btn-danger" : "admin-btn-success"}`}
                    onClick={() => toggleStatus(card.id, card.status)}
                  >
                    {card.status === "ACTIVE" ? "비활성화" : "활성화"}
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
