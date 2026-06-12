'use client';

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { ThemeProvider, createTheme, PaletteMode } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export interface ThemePreset {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  bgDark: string;
  bgDarkPaper: string;
  bgLight: string;
  bgLightPaper: string;
}

export const ThemePresets: ThemePreset[] = [
  { id: 'classic', name: 'Classic Squoosh', primary: '#3b82f6', secondary: '#6366f1', bgDark: '#090d16', bgDarkPaper: '#111827', bgLight: '#f8fafc', bgLightPaper: '#ffffff' },
  { id: 'emerald', name: 'Emerald Glow', primary: '#10b981', secondary: '#14b8a6', bgDark: '#022c22', bgDarkPaper: '#064e3b', bgLight: '#f0fdf4', bgLightPaper: '#ffffff' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', primary: '#ec4899', secondary: '#06b6d4', bgDark: '#0f051d', bgDarkPaper: '#1f0d3d', bgLight: '#fdf2f8', bgLightPaper: '#ffffff' },
  { id: 'synthwave', name: 'Synthwave Sunset', primary: '#f97316', secondary: '#d946ef', bgDark: '#1a0b2e', bgDarkPaper: '#2a124d', bgLight: '#fff7ed', bgLightPaper: '#ffffff' },
  { id: 'solarized', name: 'Solarized Ocean', primary: '#2aa198', secondary: '#268bd2', bgDark: '#002b36', bgDarkPaper: '#073642', bgLight: '#fdf6e3', bgLightPaper: '#eee8d5' },
  { id: 'nord', name: 'Nord Ice', primary: '#88c0d0', secondary: '#81a1c1', bgDark: '#2e3440', bgDarkPaper: '#3b4252', bgLight: '#eceff4', bgLightPaper: '#f8f9fb' },
  { id: 'dracula', name: 'Dracula Goth', primary: '#bd93f9', secondary: '#ff79c6', bgDark: '#282a36', bgDarkPaper: '#44475a', bgLight: '#f8f8f2', bgLightPaper: '#ffffff' },
  { id: 'deepocean', name: 'Deep Ocean', primary: '#0284c7', secondary: '#06b6d4', bgDark: '#0c4a6e', bgDarkPaper: '#0f766e', bgLight: '#f0f9ff', bgLightPaper: '#ffffff' },
  { id: 'forest', name: 'Forest Breeze', primary: '#22c55e', secondary: '#84cc16', bgDark: '#052e16', bgDarkPaper: '#14532d', bgLight: '#f0fdf4', bgLightPaper: '#ffffff' },
  { id: 'crimson', name: 'Crimson Flame', primary: '#ef4444', secondary: '#f59e0b', bgDark: '#450a0a', bgDarkPaper: '#7f1d1d', bgLight: '#fef2f2', bgLightPaper: '#ffffff' },
  { id: 'lavender', name: 'Lavender Dream', primary: '#8b5cf6', secondary: '#a78bfa', bgDark: '#1e1b4b', bgDarkPaper: '#312e81', bgLight: '#f5f3ff', bgLightPaper: '#ffffff' },
  { id: 'autumn', name: 'Autumn Gold', primary: '#ea580c', secondary: '#ca8a04', bgDark: '#431407', bgDarkPaper: '#7c2d12', bgLight: '#fff7ed', bgLightPaper: '#ffffff' },
  { id: 'midnightsky', name: 'Midnight Sky', primary: '#6366f1', secondary: '#3b82f6', bgDark: '#030712', bgDarkPaper: '#111827', bgLight: '#f3f4f6', bgLightPaper: '#ffffff' },
  { id: 'sakura', name: 'Sakura Pink', primary: '#f472b6', secondary: '#fb7185', bgDark: '#3b0722', bgDarkPaper: '#500732', bgLight: '#fff1f2', bgLightPaper: '#ffffff' },
  { id: 'slate', name: 'Slate Stone', primary: '#64748b', secondary: '#94a3b8', bgDark: '#0f172a', bgDarkPaper: '#1e293b', bgLight: '#f8fafc', bgLightPaper: '#ffffff' },
  { id: 'royal', name: 'Royal Gold', primary: '#eab308', secondary: '#ca8a04', bgDark: '#1c1917', bgDarkPaper: '#292524', bgLight: '#fef9c3', bgLightPaper: '#ffffff' },
  { id: 'coffee', name: 'Coffee Brew', primary: '#854d0e', secondary: '#a16207', bgDark: '#1c1917', bgDarkPaper: '#292524', bgLight: '#fef3c7', bgLightPaper: '#ffffff' },
  { id: 'matrix', name: 'Neon Matrix', primary: '#22c55e', secondary: '#00ff00', bgDark: '#000000', bgDarkPaper: '#0f0f0f', bgLight: '#f0fdf4', bgLightPaper: '#ffffff' },
  { id: 'retro', name: 'Retro Future', primary: '#0d9488', secondary: '#fbbf24', bgDark: '#111827', bgDarkPaper: '#1f2937', bgLight: '#f0fdfa', bgLightPaper: '#ffffff' },
  { id: 'coral', name: 'Pastel Coral', primary: '#f87171', secondary: '#2dd4bf', bgDark: '#1e293b', bgDarkPaper: '#334155', bgLight: '#fff1f1', bgLightPaper: '#ffffff' },
  { id: 'desert', name: 'Desert Sand', primary: '#d97706', secondary: '#b45309', bgDark: '#292524', bgDarkPaper: '#44403c', bgLight: '#fef3c7', bgLightPaper: '#ffffff' },
  { id: 'cybercity', name: 'Cyber City', primary: '#a855f7', secondary: '#22c55e', bgDark: '#090514', bgDarkPaper: '#150a2b', bgLight: '#faf5ff', bgLightPaper: '#ffffff' },
  { id: 'mint', name: 'Sea Mint', primary: '#10b981', secondary: '#06b6d4', bgDark: '#022c22', bgDarkPaper: '#0f766e', bgLight: '#f0fdf4', bgLightPaper: '#ffffff' },
  { id: 'tangerine', name: 'Tangerine', primary: '#f97316', secondary: '#ef4444', bgDark: '#2a0e03', bgDarkPaper: '#451a03', bgLight: '#fff7ed', bgLightPaper: '#ffffff' },
  { id: 'grape', name: 'Grape Soda', primary: '#7c3aed', secondary: '#0d9488', bgDark: '#170c3a', bgDarkPaper: '#2d1b6b', bgLight: '#f5f3ff', bgLightPaper: '#ffffff' },
  { id: 'steel', name: 'Steel Blue', primary: '#475569', secondary: '#64748b', bgDark: '#1e293b', bgDarkPaper: '#334155', bgLight: '#f1f5f9', bgLightPaper: '#ffffff' },
  { id: 'mono', name: 'Monochromatic', primary: '#000000', secondary: '#ffffff', bgDark: '#0a0a0a', bgDarkPaper: '#1c1c1c', bgLight: '#ffffff', bgLightPaper: '#f3f4f6' },
  { id: 'hyperlight', name: 'Hyper Light', primary: '#06b6d4', secondary: '#3b82f6', bgDark: '#020617', bgDarkPaper: '#0f172a', bgLight: '#ecfeff', bgLightPaper: '#ffffff' },
  { id: 'electric', name: 'Electric Violet', primary: '#8b5cf6', secondary: '#3b82f6', bgDark: '#0f0b29', bgDarkPaper: '#1f1654', bgLight: '#f5f3ff', bgLightPaper: '#ffffff' },
  { id: 'hotchili', name: 'Hot Chili', primary: '#dc2626', secondary: '#db2777', bgDark: '#1e0505', bgDarkPaper: '#3b0a0a', bgLight: '#fff1f1', bgLightPaper: '#ffffff' },
  { id: 'darkchoc', name: 'Dark Chocolate', primary: '#7c2d12', secondary: '#d97706', bgDark: '#170a04', bgDarkPaper: '#2a1206', bgLight: '#fff7ed', bgLightPaper: '#ffffff' },
  { id: 'lime', name: 'Lime Sherbet', primary: '#84cc16', secondary: '#0d9488', bgDark: '#1a2e05', bgDarkPaper: '#2d5308', bgLight: '#f7fee7', bgLightPaper: '#ffffff' },
  { id: 'peacock', name: 'Peacock Feather', primary: '#0284c7', secondary: '#16a34a', bgDark: '#082f49', bgDarkPaper: '#064e3b', bgLight: '#f0f9ff', bgLightPaper: '#ffffff' },
  { id: 'sunset', name: 'Sunset Gold', primary: '#f59e0b', secondary: '#ea580c', bgDark: '#291b00', bgDarkPaper: '#452a00', bgLight: '#fffbeb', bgLightPaper: '#ffffff' },
  { id: 'orchid', name: 'Orchid Garden', primary: '#d946ef', secondary: '#c084fc', bgDark: '#2e0854', bgDarkPaper: '#45107a', bgLight: '#fdf4ff', bgLightPaper: '#ffffff' },
  { id: 'stormy', name: 'Stormy Cloud', primary: '#475569', secondary: '#3b82f6', bgDark: '#0f172a', bgDarkPaper: '#1e293b', bgLight: '#f1f5f9', bgLightPaper: '#ffffff' },
  { id: 'moss', name: 'Forest Moss', primary: '#65a30d', secondary: '#15803d', bgDark: '#142206', bgDarkPaper: '#243c0a', bgLight: '#f7fee7', bgLightPaper: '#ffffff' },
  { id: 'velvet', name: 'Velvet Rose', primary: '#be123c', secondary: '#6d28d9', bgDark: '#1c030c', bgDarkPaper: '#3b061c', bgLight: '#fff1f2', bgLightPaper: '#ffffff' },
  { id: 'glacier', name: 'Glacier Frost', primary: '#06b6d4', secondary: '#e2e8f0', bgDark: '#083344', bgDarkPaper: '#164e63', bgLight: '#ecfeff', bgLightPaper: '#ffffff' },
  { id: 'volcano', name: 'Volcano Lava', primary: '#e11d48', secondary: '#111827', bgDark: '#0f0205', bgDarkPaper: '#290610', bgLight: '#fff1f2', bgLightPaper: '#ffffff' },
  { id: 'sky', name: 'Sky Blue', primary: '#0ea5e9', secondary: '#38bdf8', bgDark: '#075985', bgDarkPaper: '#0369a1', bgLight: '#e0f2fe', bgLightPaper: '#ffffff' },
  { id: 'lemon', name: 'Neon Lemon', primary: '#ca8a04', secondary: '#a3e635', bgDark: '#1e1b00', bgDarkPaper: '#3a3400', bgLight: '#fefce8', bgLightPaper: '#ffffff' },
  { id: 'plum', name: 'Plum Velvet', primary: '#86198f', secondary: '#c084fc', bgDark: '#2c0432', bgDarkPaper: '#4a0854', bgLight: '#fdf4ff', bgLightPaper: '#ffffff' },
  { id: 'copper', name: 'Copper Rust', primary: '#c2410c', secondary: '#854d0e', bgDark: '#2d0f04', bgDarkPaper: '#4e1b07', bgLight: '#fbe5e0', bgLightPaper: '#ffffff' },
  { id: 'bamboo', name: 'Bamboo Garden', primary: '#15803d', secondary: '#a16207', bgDark: '#062f1c', bgDarkPaper: '#0b4a2d', bgLight: '#f0fdf4', bgLightPaper: '#ffffff' },
  { id: 'abyss', name: 'Ocean Abyss', primary: '#0f766e', secondary: '#115e59', bgDark: '#042f2c', bgDarkPaper: '#0d5c56', bgLight: '#f0fdfa', bgLightPaper: '#ffffff' },
  { id: 'unicorn', name: 'Unicorn Dust', primary: '#f472b6', secondary: '#c084fc', bgDark: '#2c0c30', bgDarkPaper: '#44144b', bgLight: '#fff1f2', bgLightPaper: '#ffffff' },
  { id: 'sakura_breeze', name: 'Sakura Breeze', primary: '#fbcfe8', secondary: '#f472b6', bgDark: '#2d061c', bgDarkPaper: '#3f0c29', bgLight: '#fdf2f8', bgLightPaper: '#ffffff' },
  { id: 'neon_violet', name: 'Neon Violet', primary: '#a855f7', secondary: '#6366f1', bgDark: '#0b031c', bgDarkPaper: '#180a3a', bgLight: '#faf5ff', bgLightPaper: '#ffffff' },
  { id: 'crimson_forest', name: 'Crimson Forest', primary: '#e11d48', secondary: '#16a34a', bgDark: '#1c0209', bgDarkPaper: '#2e0b17', bgLight: '#fff1f2', bgLightPaper: '#ffffff' },
  { id: 'emerald_sun', name: 'Emerald Sun', primary: '#059669', secondary: '#d97706', bgDark: '#022c22', bgDarkPaper: '#044e3b', bgLight: '#f0fdf4', bgLightPaper: '#ffffff' },
  { id: 'electric_teal', name: 'Electric Teal', primary: '#0d9488', secondary: '#ec4899', bgDark: '#022d2c', bgDarkPaper: '#084c4a', bgLight: '#f2fbfb', bgLightPaper: '#ffffff' },
  { id: 'cyber_gold', name: 'Cyber Gold', primary: '#ca8a04', secondary: '#a855f7', bgDark: '#181504', bgDarkPaper: '#2c2607', bgLight: '#fefce8', bgLightPaper: '#ffffff' },
  { id: 'sunset_sky', name: 'Sunset Sky', primary: '#ea580c', secondary: '#3b82f6', bgDark: '#2a0e03', bgDarkPaper: '#451705', bgLight: '#fff7ed', bgLightPaper: '#ffffff' },
  { id: 'royal_indigo', name: 'Royal Indigo', primary: '#4338ca', secondary: '#eab308', bgDark: '#0f0b3c', bgDarkPaper: '#1d1675', bgLight: '#eef2ff', bgLightPaper: '#ffffff' },
  { id: 'warm_cedar', name: 'Warm Cedar', primary: '#b45309', secondary: '#15803d', bgDark: '#291102', bgDarkPaper: '#4a2205', bgLight: '#fdf8f2', bgLightPaper: '#ffffff' },
  { id: 'midnight_mint', name: 'Midnight Mint', primary: '#10b981', secondary: '#6366f1', bgDark: '#051b18', bgDarkPaper: '#0c3831', bgLight: '#eefdfa', bgLightPaper: '#ffffff' },
  { id: 'lavender_fields', name: 'Lavender Fields', primary: '#c084fc', secondary: '#fb7185', bgDark: '#221538', bgDarkPaper: '#372358', bgLight: '#faf5ff', bgLightPaper: '#ffffff' },
  { id: 'glacier_mint', name: 'Glacier Mint', primary: '#2dd4bf', secondary: '#60a5fa', bgDark: '#042f2e', bgDarkPaper: '#0d5c58', bgLight: '#f0fdfa', bgLightPaper: '#ffffff' },
  { id: 'amber_waves', name: 'Amber Waves', primary: '#f59e0b', secondary: '#f97316', bgDark: '#352101', bgDarkPaper: '#523402', bgLight: '#fffbeb', bgLightPaper: '#ffffff' },
  { id: 'dark_cyberpunk', name: 'Dark Cyberpunk', primary: '#f43f5e', secondary: '#06b6d4', bgDark: '#08000f', bgDarkPaper: '#140026', bgLight: '#fff1f2', bgLightPaper: '#ffffff' },
  { id: 'solarized_light', name: 'Solarized Sand', primary: '#b58900', secondary: '#859900', bgDark: '#002b36', bgDarkPaper: '#073642', bgLight: '#eee8d5', bgLightPaper: '#fdf6e3' },
  { id: 'monochromatic_dark', name: 'Ink & Paper', primary: '#18181b', secondary: '#71717a', bgDark: '#09090b', bgDarkPaper: '#18181b', bgLight: '#fafafa', bgLightPaper: '#ffffff' },
  { id: 'coffee_cream', name: 'Coffee Cream', primary: '#78350f', secondary: '#d97706', bgDark: '#1c0c04', bgDarkPaper: '#331b0c', bgLight: '#fffbeb', bgLightPaper: '#fef3c7' },
  { id: 'plum_velvet_soft', name: 'Plum Silk', primary: '#a21caf', secondary: '#f472b6', bgDark: '#300438', bgDarkPaper: '#4c0d58', bgLight: '#fdf4ff', bgLightPaper: '#ffffff' },
  { id: 'autumn_leaves', name: 'Autumn Leaves', primary: '#c2410c', secondary: '#ea580c', bgDark: '#2c0c00', bgDarkPaper: '#4c1700', bgLight: '#fff5f0', bgLightPaper: '#ffffff' },
  { id: 'steel_grey_contrast', name: 'Steel High-Contrast', primary: '#374151', secondary: '#9ca3af', bgDark: '#111827', bgDarkPaper: '#1f2937', bgLight: '#f9fafb', bgLightPaper: '#ffffff' },
  { id: 'matrix_digital_green', name: 'Matrix Digital', primary: '#10b981', secondary: '#34d399', bgDark: '#020604', bgDarkPaper: '#05100a', bgLight: '#ecfdf5', bgLightPaper: '#ffffff' },
  { id: 'orchid_purple_tint', name: 'Orchid Tint', primary: '#d946ef', secondary: '#a21caf', bgDark: '#2e0436', bgDarkPaper: '#4a0c56', bgLight: '#fdf4ff', bgLightPaper: '#ffffff' },
  { id: 'seafoam_dream', name: 'Seafoam Dream', primary: '#14b8a6', secondary: '#a7f3d0', bgDark: '#042f2e', bgDarkPaper: '#0f766e', bgLight: '#f0fdfa', bgLightPaper: '#ffffff' }
];

export const ColorModeContext = createContext({
  toggleColorMode: () => { },
  mode: 'dark' as PaletteMode,
  presetId: 'classic',
  setPresetId: (id: string) => { }
});

export const useColorMode = () => useContext(ColorModeContext);

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>('dark');
  const [presetId, setPresetId] = useState<string>('classic');

  useEffect(() => {
    const savedMode = localStorage.getItem('squoosh-theme') as PaletteMode;
    if (savedMode) setMode(savedMode);
    
    const savedPreset = localStorage.getItem('squoosh-preset-id');
    if (savedPreset) setPresetId(savedPreset);
  }, []);

  const activePreset = useMemo(() => {
    return ThemePresets.find(p => p.id === presetId) || ThemePresets[0];
  }, [presetId]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const nextMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('squoosh-theme', nextMode);
          return nextMode;
        });
      },
      mode,
      presetId,
      setPresetId: (id: string) => {
        setPresetId(id);
        localStorage.setItem('squoosh-preset-id', id);
      }
    }),
    [mode, presetId]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
              primary: { main: activePreset.primary, contrastText: '#ffffff' },
              secondary: { main: activePreset.secondary },
              background: {
                default: activePreset.bgLight,
                paper: activePreset.bgLightPaper,
              },
              text: {
                primary: '#0f172a',
                secondary: '#475569',
              },
              divider: 'rgba(0, 0, 0, 0.08)',
            }
            : {
              primary: { main: activePreset.primary, contrastText: '#ffffff' },
              secondary: { main: activePreset.secondary },
              background: {
                default: activePreset.bgDark,
                paper: activePreset.bgDarkPaper,
              },
              text: {
                primary: '#f3f4f6',
                secondary: '#9ca3af',
              },
              divider: 'rgba(255, 255, 255, 0.08)',
            }),
        },
        typography: {
          fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: { fontWeight: 800 },
          h2: { fontWeight: 700 },
          h3: { fontWeight: 700 },
          h4: { fontWeight: 600 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
          button: { textTransform: 'none', fontWeight: 600 },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                boxShadow: mode === 'light'
                  ? '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
                  : '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
                border: mode === 'light'
                  ? '1px solid rgba(0, 0, 0, 0.06)'
                  : '1px solid rgba(255, 255, 255, 0.06)',
                transition: 'box-shadow 0.3s ease, border-color 0.3s ease, background-color 0.3s ease',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                padding: '8px 16px',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-1px)',
                },
              },
            },
          },
        },
      }),
    [mode, activePreset]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
