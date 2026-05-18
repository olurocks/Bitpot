import { useRequestDraw } from "@/hooks/useRequestDraw";

export function RequestDrawButton({ colors }: { colors: any }) {
  const {
    requestDraw,
    isPending,
    canRequest,
    disabledReason,
    drawReady,
    drawPending,
  } = useRequestDraw();

  if (!drawReady && !drawPending) return null;

  if (drawPending) {
    return (
      <span
        style={{
          backgroundColor: `${colors.accent}22`,
          color: colors.accent,
          borderRadius: "24px",
          padding: "12px 20px",
          fontWeight: 600,
          fontSize: "1rem",
        }}
      >
        ⏳ Awaiting Fulfillment
      </span>
    );
  }

  return (
    <button
      disabled={!canRequest || isPending}
      title={disabledReason ?? undefined}
      onClick={requestDraw}
      style={{
        backgroundColor: canRequest && !isPending ? colors.accent : "#888",
        color: colors.background,
        border: "none",
        padding: "12px 24px",
        fontSize: "1rem",
        fontWeight: 600,
        borderRadius: "24px",
        cursor: canRequest && !isPending ? "pointer" : "not-allowed",
        opacity: canRequest && !isPending ? 1 : 0.6,
        transition: "opacity 0.2s",
      }}
    >
      {isPending ? "Requesting..." : "🎲 Request Draw"}
    </button>
  );
}