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

  // if (drawPending) {
  //   return (
  //     <span
  //       style={{
  //         backgroundColor: `${colors.accent}22`,
  //         color: colors.accent,
  //         borderRadius: "24px",
  //         padding: "12px 20px",
  //         fontWeight: 600,
  //         fontSize: "1rem",
  //       }}
  //     >
  //       ⏳ Awaiting Fulfillment
  //     </span>
  //   );
  // }

  return (
    <div
      style={{
        gridColumn: "1 / -1",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {drawReady && !drawPending && (
        <span
          style={{
            padding: "10px 18px",
            borderRadius: "24px",
            backgroundColor: `${colors.primary}22`,
            color: colors.primary,
            fontWeight: 700,
          }}
        >
          🎲 Draw starting...
        </span>
      )}

      {drawPending && (
        <span
          style={{
            padding: "10px 18px",
            borderRadius: "24px",
            backgroundColor: `${colors.accent}22`,
            color: colors.accent,
            fontWeight: 700,
          }}
        >
          ⏳ Selecting winner...
        </span>
      )}
    </div>
  );
}
