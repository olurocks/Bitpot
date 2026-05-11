export function formatToken(value?: bigint, decimals = 18) {
  if (!value) return "0";

  const num = Number(value) / 10 ** decimals;

  if (num < 0.001) return "<0.001";
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });
}
