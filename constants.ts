import { reward } from "viem/tempo/actions";

export const themeColors = {
  light: {
    background: "#F7F8FA",
    surface: "#FFFFFF",
    elevatedSurface: "#FCFCFD",
    cardBorder: "#2b5681",
    divider: "#DCE4EA",

    primary: "#00B7B3",
    primaryHover: "#00A3A0",
    primaryPressed: "#008B88",

    secondary: "#021B52",
    accent: "#62D8A5",
    reward: "#F8BC1C",

    textPrimary: "#081225",
    textSecondary: "#516072",
    textTertiary: "#7E8A9A",

    white: "#FFFFFF",

    success: "#22C55E",
    warning: "#F8BC1C",
    error: "#EF4444",
    info: "#00B7B3",
  },

  dark: {
    background: "#07101F",
    surface: "#0D172A",
    elevatedSurface: "#122038",
    cardBorder: "#1D3152",
    divider: "#203250",

    secondary: "#21D4CF",
    primaryHover: "#3EE5E0",
    primaryPressed: "#14B8B3",

    primary: "#067954",
    accent: "#62D8A5",
    reward: "#FFC83D",

    textPrimary: "#F5F9FF",
    textSecondary: "#B7C5D9",
    textTertiary: "#7D8BA1",

    white: "#FFFFFF",

    success: "#34D399",
    warning: "#FFC83D",
    error: "#FB7185",
    info: "#21D4CF",
  },
};

export type ThemeType = keyof typeof themeColors;
