"use client";

export function PaginationControls({
  page,
  totalPages,
  onNext,
  onPrev,
  colors,
}: {
  page: number;
  totalPages: number;
  onNext: () => void;
  onPrev: () => void;
  colors: any;
}) {
  if (totalPages <= 1) return null;

  const btnStyle = (disabled: boolean) => ({
    background: "none",
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: "8px",
    padding: "6px 14px",
    color: colors.textSecondary,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    fontWeight: 600,
  });

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "12px",
      padding: "16px",
      borderTop: `1px solid ${colors.cardBorder}`,
    }}>
      <button onClick={onPrev} disabled={page === 0} style={btnStyle(page === 0)}>
        ← Prev
      </button>
      <span style={{ fontSize: "0.85rem", color: colors.textSecondary, fontWeight: 600 }}>
        {page + 1} / {totalPages}
      </span>
      <button onClick={onNext} disabled={page === totalPages - 1} style={btnStyle(page === totalPages - 1)}>
        Next →
      </button>
    </div>
  );
}