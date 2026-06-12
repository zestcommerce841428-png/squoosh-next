'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Fab,
  Drawer,
  IconButton,
  Typography,
  Tabs,
  Tab,
  Stack,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  Tooltip,
  Divider,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
} from '@mui/material';
import { useColorMode, ThemePresets } from './ThemeRegistry';

// SVG Icons
const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"></line>
    <polyline points="5 12 12 5 19 12"></polyline>
  </svg>
);

const ArrowDownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <polyline points="19 12 12 19 5 12"></polyline>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

const Volume2Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
  </svg>
);

export default function FloatingDashboard() {
  const { mode, toggleColorMode, presetId, setPresetId } = useColorMode();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);

  // 70+ Accessibility Settings Object
  const [settings, setSettings] = useState({
    // Typo (15 options)
    fontSize: 100,
    letterSpacing: 0,
    lineHeight: 1.5,
    wordSpacing: 0,
    dyslexicFont: false,
    boldText: false,
    uppercaseText: false,
    lowercaseText: false,
    capitalizeText: false,
    underlineLinks: false,
    textShadow: false,
    sansSerifOnly: false,
    justifyText: false,
    largeLineGap: false,
    hideItalics: false,

    // Visuals & Filters (15 options)
    highContrast: false,
    extremeContrast: false,
    monochrome: false,
    invertColors: false,
    protanopia: false,
    deuteranopia: false,
    tritanopia: false,
    achromatopsia: false,
    tintMode: 'none', // none, warm, cool, rose, amber, green
    tintOpacity: 15,
    brightnessBoost: false,
    dimScreen: false,
    reduceGlares: false,
    photoNegative: false,
    grayScaleMask: false,

    // Guidance & Cursor Aids (15 options)
    bigCursor: false,
    gigaCursor: false,
    cursorHighlight: false,
    cursorCrosshair: false,
    readingRuler: false,
    readingSpotlight: false,
    rulerColor: '#3b82f6',
    rulerHeight: 4,
    spotlightHeight: 120,
    hoverOutline: false,
    keyboardFocusIndicator: false,
    tableRowHighlight: false,
    pageBorder: false,
    hideBackgrounds: false,
    structuralGrid: false,

    // Motor & Control (15 options)
    largeTargets: false,
    extraPadding: false,
    disableHoverTransitions: false,
    reduceAnimations: false,
    constantBorders: false,
    clickThresholdIncrease: false,
    keyboardNavOutline: false,
    freezeGifs: false,
    scrollSpeedLock: false,
    disableDoubleClicks: false,
    blockFlashyAnimations: false,
    stickyHeaders: false,
    simpleLayout: false,
    showControlGuides: false,
    accessibleInputs: false,

    // Speech & Sound (10 options)
    clickAudioBeep: false,
    ttsHoverSpeak: false,
    ttsSpeed: 1.0,
    ttsPitch: 1.0,
    speakKeysPressed: false,
    soundConfirmations: false,
    voiceMuteAll: false,
    speechDoubleTab: false,
    ambientWhiteNoise: false,
    autoScrollMode: false,
  });

  // Cursor Tracking State for Ruler & Circle overlays
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Update mouse coordinates for overlays
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Text to Speech Voice Synthesis
  const speakText = (text: string) => {
    try {
      if (typeof window === 'undefined' || !window.speechSynthesis || settings.voiceMuteAll) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = settings.ttsSpeed;
      utterance.pitch = settings.ttsPitch;
      window.speechSynthesis.speak(utterance);
    } catch (_) {}
  };

  // Sound generator for Click Audio Beep
  const playBeep = (freq = 440, type: OscillatorType = 'sine', duration = 0.08) => {
    if (typeof window === 'undefined' || settings.voiceMuteAll) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  };

  // Keyboard and Click sound listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (settings.speakKeysPressed) {
        speakText(`Key ${e.key}`);
      }
    };
    const handleClick = (e: MouseEvent) => {
      if (settings.clickAudioBeep) {
        playBeep(520, 'triangle', 0.1);
      }
      if (settings.soundConfirmations && e.target) {
        const el = e.target as HTMLElement;
        const text = el.innerText || el.getAttribute('aria-label') || 'element';
        speakText(`Clicked ${text.slice(0, 30)}`);
      }
    };
    const handleMouseOver = (e: MouseEvent) => {
      if (settings.ttsHoverSpeak && e.target) {
        const el = e.target as HTMLElement;
        if (el.innerText && el.innerText.trim().length > 0) {
          const text = el.innerText.trim();
          // Read up to 100 characters on hover
          speakText(text.slice(0, 100));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [settings]);

  // Inject CSS rules reactively on settings updates
  useEffect(() => {
    const styleId = 'squoosh-accessibility-style';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    let css = '';

    // Typo Enhancements
    if (settings.fontSize !== 100) {
      css += `html { font-size: ${settings.fontSize}% !important; }\n`;
    }
    if (settings.letterSpacing > 0) {
      css += `body, p, span, h1, h2, h3, h4, h5, h6, button, input, select, textarea { letter-spacing: ${settings.letterSpacing}px !important; }\n`;
    }
    if (settings.lineHeight !== 1.5) {
      css += `body, p, span, h1, h2, h3, h4, h5, h6 { line-height: ${settings.lineHeight} !important; }\n`;
    }
    if (settings.wordSpacing > 0) {
      css += `body, p, span, h1, h2, h3, h4, h5, h6 { word-spacing: ${settings.wordSpacing}px !important; }\n`;
    }
    if (settings.dyslexicFont) {
      css += `body, p, span, h1, h2, h3, h4, h5, h6, button, input, select { font-family: 'OpenDyslexic', 'Comic Sans MS', sans-serif !important; }\n`;
    }
    if (settings.boldText) {
      css += `body, p, span, h1, h2, h3, h4, h5, h6, button, a { font-weight: bold !important; }\n`;
    }
    if (settings.uppercaseText) {
      css += `body, p, span, h1, h2, h3, h4, h5, h6, button, a { text-transform: uppercase !important; }\n`;
    }
    if (settings.lowercaseText) {
      css += `body, p, span, h1, h2, h3, h4, h5, h6, button, a { text-transform: lowercase !important; }\n`;
    }
    if (settings.capitalizeText) {
      css += `body, p, span, h1, h2, h3, h4, h5, h6, button, a { text-transform: capitalize !important; }\n`;
    }
    if (settings.underlineLinks) {
      css += `a { text-decoration: underline !important; text-decoration-thickness: 2px !important; }\n`;
    }
    if (settings.textShadow) {
      css += `body, p, span, h1, h2, h3, h4, h5, h6 { text-shadow: 1px 1px 2px rgba(0,0,0,0.6) !important; }\n`;
    }
    if (settings.sansSerifOnly) {
      css += `* { font-family: 'Outfit', sans-serif !important; }\n`;
    }
    if (settings.justifyText) {
      css += `p, span { text-align: justify !important; }\n`;
    }
    if (settings.largeLineGap) {
      css += `p { margin-bottom: 2em !important; }\n`;
    }
    if (settings.hideItalics) {
      css += `em, i { font-style: normal !important; font-weight: bold !important; }\n`;
    }

    // Colorblind Filters
    let filterVal = '';
    if (settings.highContrast) {
      filterVal += 'contrast(130%) ';
    }
    if (settings.extremeContrast) {
      filterVal += 'contrast(180%) ';
    }
    if (settings.monochrome) {
      filterVal += 'grayscale(100%) ';
    }
    if (settings.invertColors) {
      filterVal += 'invert(100%) ';
    }
    if (settings.protanopia) {
      css += `html { filter: url('#protanopia-filter') !important; }\n`;
    } else if (settings.deuteranopia) {
      css += `html { filter: url('#deuteranopia-filter') !important; }\n`;
    } else if (settings.tritanopia) {
      css += `html { filter: url('#tritanopia-filter') !important; }\n`;
    } else if (settings.achromatopsia) {
      filterVal += 'grayscale(100%) ';
    }

    if (filterVal) {
      css += `html { filter: ${filterVal.trim()} !important; }\n`;
    }

    if (settings.brightnessBoost) {
      css += `html { filter: brightness(120%) !important; }\n`;
    }
    if (settings.dimScreen) {
      css += `html { filter: brightness(80%) !important; }\n`;
    }
    if (settings.reduceGlares) {
      css += `html { filter: contrast(90%) brightness(95%) !important; }\n`;
    }
    if (settings.photoNegative) {
      css += `img, canvas { filter: invert(100%) !important; }\n`;
    }

    // Guidance & Cursor
    if (settings.bigCursor) {
      css += `* { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M0 0l16 16-5.5.5L16 28 8 32l-5.5-11.5L0 21z' fill='%23fff' stroke='%23000' stroke-width='2'/%3E%3C/svg%3E"), auto !important; }\n`;
    } else if (settings.gigaCursor) {
      css += `* { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Cpath d='M0 0l32 32-11 1L32 56 16 64l-11-23L0 42z' fill='%23ffff00' stroke='%23000' stroke-width='3'/%3E%3C/svg%3E"), auto !important; }\n`;
    }
    if (settings.hoverOutline) {
      css += `*:hover { outline: 2px dashed #a855f7 !important; outline-offset: 2px !important; }\n`;
    }
    if (settings.keyboardFocusIndicator) {
      css += `*:focus { outline: 4px solid #ef4444 !important; outline-offset: 4px !important; }\n`;
    }
    if (settings.tableRowHighlight) {
      css += `tr:hover { background-color: rgba(234, 179, 8, 0.2) !important; }\n`;
    }
    if (settings.pageBorder) {
      css += `body { border: 12px solid #ef4444 !important; min-height: 100vh; }\n`;
    }
    if (settings.hideBackgrounds) {
      css += `* { background-image: none !important; }\n`;
    }
    if (settings.structuralGrid) {
      css += `* { border: 1px dotted rgba(99, 102, 241, 0.4) !important; }\n`;
    }

    // Motor control
    if (settings.largeTargets) {
      css += `button, a, input, select { min-width: 48px !important; min-height: 48px !important; }\n`;
    }
    if (settings.extraPadding) {
      css += `button, a { padding: 16px 24px !important; }\n`;
    }
    if (settings.disableHoverTransitions) {
      css += `* { transition: none !important; hover: none !important; transform: none !important; }\n`;
    }
    if (settings.reduceAnimations) {
      css += `* { animation: none !important; transition: none !important; }\n`;
    }
    if (settings.constantBorders) {
      css += `button, input, select { border: 2px solid currentColor !important; }\n`;
    }
    if (settings.keyboardNavOutline) {
      css += `button, a, input { outline: 3px solid #10b981 !important; }\n`;
    }
    if (settings.accessibleInputs) {
      css += `input, select, textarea { background: #fff !important; color: #000 !important; border: 3px solid #000 !important; font-size: 1.25rem !important; }\n`;
    }

    css += `@keyframes pulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.45); opacity: 0; } }\n`;

    styleEl.innerHTML = css;
  }, [settings]);

  const updateSetting = (key: keyof typeof settings, val: any) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <>
      {/* Floating Settings & Scroll Buttons */}
      {/* Left side floating buttons: WhatsApp and Settings Toggler */}
      <Box sx={{ position: 'fixed', bottom: 24, left: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Tooltip title="Chat on WhatsApp (Naushad Alam)" placement="right">
          <Fab
            onClick={() => window.open("https://wa.me/917492068998?text=Hello%20Naushad%20Alam,%20I%20am%20visiting%20Squoosh%20Next%20and%20would%20like%20to%20connect!", "_blank")}
            sx={{
              backgroundColor: '#25D366',
              color: '#fff',
              boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              position: 'relative',
              '&:hover': { 
                transform: 'scale(1.15) rotate(5deg)', 
                backgroundColor: '#128C7E',
                boxShadow: '0 12px 30px rgba(18, 140, 126, 0.6)'
              },
              // Pulsing green halo outline
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '50%',
                border: '2px solid #25D366',
                animation: 'pulse 2s infinite',
                pointerEvents: 'none',
              }
            }}
          >
            <WhatsAppIcon />
          </Fab>
        </Tooltip>

        <Tooltip title="Accessibility Options & Themes" placement="right">
          <Fab
            color="primary"
            aria-label="accessibility options and themes dashboard"
            onClick={() => setOpen(true)}
            sx={{
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'scale(1.1)' },
            }}
          >
            <SettingsIcon />
          </Fab>
        </Tooltip>
      </Box>

      {/* Right side floating buttons: Scroll guides */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Tooltip title="Scroll to Top" placement="left">
          <Fab
            size="small"
            color="secondary"
            aria-label="scroll to top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            sx={{
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'scale(1.1)' },
            }}
          >
            <ArrowUpIcon />
          </Fab>
        </Tooltip>

        <Tooltip title="Scroll to Bottom" placement="left">
          <Fab
            size="small"
            color="secondary"
            aria-label="scroll to bottom"
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            sx={{
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'scale(1.1)' },
            }}
          >
            <ArrowDownIcon />
          </Fab>
        </Tooltip>
      </Box>

      {/* SVG Color Blindness Filters Definition */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="protanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.567, 0.433, 0,     0, 0
                      0.558, 0.442, 0,     0, 0
                      0,     0.242, 0.758, 0, 0
                      0,     0,     0,     1, 0"
            />
          </filter>
          <filter id="deuteranopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.625, 0.375, 0,   0, 0
                      0.7,   0.3,   0,   0, 0
                      0,     0.3,   0.7, 0, 0
                      0,     0,     0,   1, 0"
            />
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.95, 0.05,  0,     0, 0
                      0,    0.433, 0.567, 0, 0
                      0,    0.475, 0.525, 0, 0
                      0,    0,     0,     1, 0"
            />
          </filter>
        </defs>
      </svg>

      {/* RULER AID OVERLAY */}
      {settings.readingRuler && (
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            top: mousePos.y - settings.rulerHeight / 2,
            height: `${settings.rulerHeight}px`,
            backgroundColor: settings.rulerColor,
            zIndex: 9999,
            pointerEvents: 'none',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)',
          }}
        />
      )}

      {/* CIRCLE HIGHLIGHT AID OVERLAY */}
      {settings.cursorHighlight && (
        <Box
          sx={{
            position: 'fixed',
            left: mousePos.x - 40,
            top: mousePos.y - 40,
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: '4px solid #f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            zIndex: 9999,
            pointerEvents: 'none',
            boxShadow: '0 0 15px rgba(245,158,11,0.5)',
          }}
        />
      )}

      {/* CURSOR CROSSHAIR OVERLAY */}
      {settings.cursorCrosshair && (
        <>
          <Box sx={{ position: 'fixed', left: 0, right: 0, top: mousePos.y, height: '1px', borderTop: '1px dashed #ef4444', zIndex: 9999, pointerEvents: 'none' }} />
          <Box sx={{ position: 'fixed', left: mousePos.x, top: 0, bottom: 0, width: '1px', borderLeft: '1px dashed #ef4444', zIndex: 9999, pointerEvents: 'none' }} />
        </>
      )}

      {/* READING SPOTLIGHT MASK OVERLAY */}
      {settings.readingSpotlight && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 9998,
            background: `radial-gradient(ellipse 260px ${settings.spotlightHeight}px at ${mousePos.x}px ${mousePos.y}px, transparent 100%, rgba(0,0,0,0.7) 100%)`,
          }}
        />
      )}

      {/* SCREEN TINT OVERLAY */}
      {settings.tintMode !== 'none' && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 9997,
            backgroundColor:
              settings.tintMode === 'warm' ? '#ea580c' :
              settings.tintMode === 'cool' ? '#3b82f6' :
              settings.tintMode === 'rose' ? '#ec4899' :
              settings.tintMode === 'amber' ? '#f59e0b' : '#10b981',
            opacity: settings.tintOpacity / 100,
          }}
        />
      )}

      {/* Settings Panel Drawer */}
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 460 },
            p: 3,
            backgroundColor: 'background.paper',
            boxShadow: '10px 0 40px rgba(0,0,0,0.2)',
          },
        }}
      >
        <Stack spacing={2} sx={{ height: '100%' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
              Accessibility & Style Panel
            </Typography>
            <IconButton onClick={() => setOpen(false)} size="medium">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider />

          {/* Navigation Tabs */}
          <Tabs
            value={tab}
            onChange={(_, val) => setTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Theme Engine" />
            <Tab label="Text" />
            <Tab label="Visuals" />
            <Tab label="Cursor & Guide" />
            <Tab label="Control & Audio" />
          </Tabs>

          {/* Tab Content Box */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
            {/* 1. Theme Engine Tab */}
            {tab === 0 && (
              <Stack spacing={3} sx={{ pt: 1 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                    Core Mode Toggler
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={toggleColorMode}
                    sx={{ py: 1.5, fontWeight: 700 }}
                  >
                    Switch to {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </Button>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
                    Select Theme Preset ({ThemePresets.length} available)
                  </Typography>
                  <Grid container spacing={1.5}>
                    {ThemePresets.map((preset) => (
                      <Grid item xs={6} key={preset.id}>
                        <Card
                          variant="outlined"
                          onClick={() => {
                            setPresetId(preset.id);
                            speakText(`Activated theme ${preset.name}`);
                          }}
                          sx={{
                            p: 1.5,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            borderColor: presetId === preset.id ? 'primary.main' : 'divider',
                            borderWidth: presetId === preset.id ? '2px' : '1px',
                            backgroundColor: mode === 'dark' ? preset.bgDarkPaper : preset.bgLightPaper,
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            },
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: mode === 'dark' ? '#fff' : '#000' }}>
                            {preset.name}
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: preset.primary }} />
                            <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: preset.secondary }} />
                          </Stack>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Stack>
            )}

            {/* 2. Text & Typography Tab */}
            {tab === 1 && (
              <Stack spacing={2.5} sx={{ pt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Typography Resizing & Enhancing (15 Options)
                </Typography>

                <Box>
                  <Typography variant="caption" color="text.secondary">Font Size: {settings.fontSize}%</Typography>
                  <Slider
                    min={80}
                    max={200}
                    step={10}
                    value={settings.fontSize}
                    onChange={(_, val) => updateSetting('fontSize', val)}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Letter Spacing: {settings.letterSpacing}px</Typography>
                  <Slider
                    min={0}
                    max={8}
                    value={settings.letterSpacing}
                    onChange={(_, val) => updateSetting('letterSpacing', val)}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Line Height: {settings.lineHeight}</Typography>
                  <Slider
                    min={1.2}
                    max={2.5}
                    step={0.1}
                    value={settings.lineHeight}
                    onChange={(_, val) => updateSetting('lineHeight', val)}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Word Spacing: {settings.wordSpacing}px</Typography>
                  <Slider
                    min={0}
                    max={12}
                    value={settings.wordSpacing}
                    onChange={(_, val) => updateSetting('wordSpacing', val)}
                  />
                </Box>

                <FormControlLabel
                  control={<Switch checked={settings.dyslexicFont} onChange={(e) => updateSetting('dyslexicFont', e.target.checked)} />}
                  label="Dyslexic Friendly Font"
                />
                <FormControlLabel
                  control={<Switch checked={settings.boldText} onChange={(e) => updateSetting('boldText', e.target.checked)} />}
                  label="Bold Document Text"
                />
                <FormControlLabel
                  control={<Switch checked={settings.uppercaseText} onChange={(e) => updateSetting('uppercaseText', e.target.checked)} />}
                  label="FORCE UPPERCASE TEXT"
                />
                <FormControlLabel
                  control={<Switch checked={settings.lowercaseText} onChange={(e) => updateSetting('lowercaseText', e.target.checked)} />}
                  label="force lowercase text"
                />
                <FormControlLabel
                  control={<Switch checked={settings.capitalizeText} onChange={(e) => updateSetting('capitalizeText', e.target.checked)} />}
                  label="Force Capitalize Text"
                />
                <FormControlLabel
                  control={<Switch checked={settings.underlineLinks} onChange={(e) => updateSetting('underlineLinks', e.target.checked)} />}
                  label="Underline All Links"
                />
                <FormControlLabel
                  control={<Switch checked={settings.textShadow} onChange={(e) => updateSetting('textShadow', e.target.checked)} />}
                  label="Enhanced Text Shadows"
                />
                <FormControlLabel
                  control={<Switch checked={settings.sansSerifOnly} onChange={(e) => updateSetting('sansSerifOnly', e.target.checked)} />}
                  label="Enforce Sans-Serif Only"
                />
                <FormControlLabel
                  control={<Switch checked={settings.justifyText} onChange={(e) => updateSetting('justifyText', e.target.checked)} />}
                  label="Justify All Text Blocks"
                />
                <FormControlLabel
                  control={<Switch checked={settings.largeLineGap} onChange={(e) => updateSetting('largeLineGap', e.target.checked)} />}
                  label="Increase Paragraph Gap"
                />
                <FormControlLabel
                  control={<Switch checked={settings.hideItalics} onChange={(e) => updateSetting('hideItalics', e.target.checked)} />}
                  label="De-italicize text"
                />
              </Stack>
            )}

            {/* 3. Visual & Colors Tab */}
            {tab === 2 && (
              <Stack spacing={2.5} sx={{ pt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Visual Aids & Contrast Filters (15 Options)
                </Typography>

                <FormControlLabel
                  control={<Switch checked={settings.highContrast} onChange={(e) => updateSetting('highContrast', e.target.checked)} />}
                  label="Contrast Boost (+30%)"
                />
                <FormControlLabel
                  control={<Switch checked={settings.extremeContrast} onChange={(e) => updateSetting('extremeContrast', e.target.checked)} />}
                  label="Extreme Contrast Contrast (+80%)"
                />
                <FormControlLabel
                  control={<Switch checked={settings.monochrome} onChange={(e) => updateSetting('monochrome', e.target.checked)} />}
                  label="Monochrome Screen"
                />
                <FormControlLabel
                  control={<Switch checked={settings.invertColors} onChange={(e) => updateSetting('invertColors', e.target.checked)} />}
                  label="Invert Color Spectrum"
                />

                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Colorblind Simulator</Typography>

                <FormControlLabel
                  control={<Switch checked={settings.protanopia} onChange={(e) => {
                    updateSetting('protanopia', e.target.checked);
                    if (e.target.checked) {
                      updateSetting('deuteranopia', false);
                      updateSetting('tritanopia', false);
                    }
                  }} />}
                  label="Protanopia Simulator"
                />
                <FormControlLabel
                  control={<Switch checked={settings.deuteranopia} onChange={(e) => {
                    updateSetting('deuteranopia', e.target.checked);
                    if (e.target.checked) {
                      updateSetting('protanopia', false);
                      updateSetting('tritanopia', false);
                    }
                  }} />}
                  label="Deuteranopia Simulator"
                />
                <FormControlLabel
                  control={<Switch checked={settings.tritanopia} onChange={(e) => {
                    updateSetting('tritanopia', e.target.checked);
                    if (e.target.checked) {
                      updateSetting('protanopia', false);
                      updateSetting('deuteranopia', false);
                    }
                  }} />}
                  label="Tritanopia Simulator"
                />
                <FormControlLabel
                  control={<Switch checked={settings.achromatopsia} onChange={(e) => updateSetting('achromatopsia', e.target.checked)} />}
                  label="Achromatopsia Simulator"
                />

                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Screen Tint & Ambient Light Filters</Typography>

                <FormControl size="small" fullWidth>
                  <InputLabel>Tint Color Filter</InputLabel>
                  <Select
                    value={settings.tintMode}
                    label="Tint Color Filter"
                    onChange={(e) => updateSetting('tintMode', e.target.value)}
                  >
                    <MenuItem value="none">Disabled</MenuItem>
                    <MenuItem value="warm">Warm Orange (Sepia)</MenuItem>
                    <MenuItem value="cool">Cool Blue (Reading Aid)</MenuItem>
                    <MenuItem value="rose">Rose Tint</MenuItem>
                    <MenuItem value="amber">Amber Glow</MenuItem>
                    <MenuItem value="green">Chlorophyll Green</MenuItem>
                  </Select>
                </FormControl>

                {settings.tintMode !== 'none' && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Tint Opacity: {settings.tintOpacity}%</Typography>
                    <Slider
                      min={5}
                      max={40}
                      value={settings.tintOpacity}
                      onChange={(_, val) => updateSetting('tintOpacity', val)}
                    />
                  </Box>
                )}

                <FormControlLabel
                  control={<Switch checked={settings.brightnessBoost} onChange={(e) => updateSetting('brightnessBoost', e.target.checked)} />}
                  label="Boost Display Luminance"
                />
                <FormControlLabel
                  control={<Switch checked={settings.dimScreen} onChange={(e) => updateSetting('dimScreen', e.target.checked)} />}
                  label="Dim Screen Mode"
                />
                <FormControlLabel
                  control={<Switch checked={settings.reduceGlares} onChange={(e) => updateSetting('reduceGlares', e.target.checked)} />}
                  label="Soft Tone Eye Protection"
                />
                <FormControlLabel
                  control={<Switch checked={settings.photoNegative} onChange={(e) => updateSetting('photoNegative', e.target.checked)} />}
                  label="Invert Embedded Media Only"
                />
                <FormControlLabel
                  control={<Switch checked={settings.grayScaleMask} onChange={(e) => updateSetting('grayScaleMask', e.target.checked)} />}
                  label="Highlight Interactive Areas"
                />
              </Stack>
            )}

            {/* 4. Cursor & Guidance Aids Tab */}
            {tab === 3 && (
              <Stack spacing={2.5} sx={{ pt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Focus Guides & Cursor Overlays (15 Options)
                </Typography>

                <FormControlLabel
                  control={<Switch checked={settings.bigCursor} onChange={(e) => {
                    updateSetting('bigCursor', e.target.checked);
                    if (e.target.checked) updateSetting('gigaCursor', false);
                  }} />}
                  label="Large White Pointer"
                />
                <FormControlLabel
                  control={<Switch checked={settings.gigaCursor} onChange={(e) => {
                    updateSetting('gigaCursor', e.target.checked);
                    if (e.target.checked) updateSetting('bigCursor', false);
                  }} />}
                  label="Extra Large Yellow Pointer"
                />
                <FormControlLabel
                  control={<Switch checked={settings.cursorHighlight} onChange={(e) => updateSetting('cursorHighlight', e.target.checked)} />}
                  label="Yellow Circle Pointer Focus"
                />
                <FormControlLabel
                  control={<Switch checked={settings.cursorCrosshair} onChange={(e) => updateSetting('cursorCrosshair', e.target.checked)} />}
                  label="Fullscreen Cursor Crosshairs"
                />
                <FormControlLabel
                  control={<Switch checked={settings.readingRuler} onChange={(e) => updateSetting('readingRuler', e.target.checked)} />}
                  label="Horizontal Reading Ruler"
                />

                {settings.readingRuler && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Ruler Height: {settings.rulerHeight}px</Typography>
                    <Slider
                      min={2}
                      max={12}
                      value={settings.rulerHeight}
                      onChange={(_, val) => updateSetting('rulerHeight', val)}
                    />
                  </Box>
                )}

                <FormControlLabel
                  control={<Switch checked={settings.readingSpotlight} onChange={(e) => updateSetting('readingSpotlight', e.target.checked)} />}
                  label="Focused Reading Spotlight Mask"
                />

                {settings.readingSpotlight && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Spotlight Size: {settings.spotlightHeight}px</Typography>
                    <Slider
                      min={60}
                      max={240}
                      value={settings.spotlightHeight}
                      onChange={(_, val) => updateSetting('spotlightHeight', val)}
                    />
                  </Box>
                )}

                <FormControlLabel
                  control={<Switch checked={settings.hoverOutline} onChange={(e) => updateSetting('hoverOutline', e.target.checked)} />}
                  label="Outline Elements on Hover"
                />
                <FormControlLabel
                  control={<Switch checked={settings.keyboardFocusIndicator} onChange={(e) => updateSetting('keyboardFocusIndicator', e.target.checked)} />}
                  label="Heavy Focus Indicator"
                />
                <FormControlLabel
                  control={<Switch checked={settings.tableRowHighlight} onChange={(e) => updateSetting('tableRowHighlight', e.target.checked)} />}
                  label="Highlight Table Rows on Hover"
                />
                <FormControlLabel
                  control={<Switch checked={settings.pageBorder} onChange={(e) => updateSetting('pageBorder', e.target.checked)} />}
                  label="Outer Screen Border Alert"
                />
                <FormControlLabel
                  control={<Switch checked={settings.hideBackgrounds} onChange={(e) => updateSetting('hideBackgrounds', e.target.checked)} />}
                  label="Strip Layout Background Images"
                />
                <FormControlLabel
                  control={<Switch checked={settings.structuralGrid} onChange={(e) => updateSetting('structuralGrid', e.target.checked)} />}
                  label="Draw CSS Layout Border Grids"
                />
              </Stack>
            )}

            {/* 5. Motor Control & Speech Audio Tab */}
            {tab === 4 && (
              <Stack spacing={2.5} sx={{ pt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Motor Control & TTS/Sound Feedback (25 Options)
                </Typography>

                <FormControlLabel
                  control={<Switch checked={settings.largeTargets} onChange={(e) => updateSetting('largeTargets', e.target.checked)} />}
                  label="Enlarge Target Touch Areas"
                />
                <FormControlLabel
                  control={<Switch checked={settings.extraPadding} onChange={(e) => updateSetting('extraPadding', e.target.checked)} />}
                  label="Expand Button Paddings"
                />
                <FormControlLabel
                  control={<Switch checked={settings.disableHoverTransitions} onChange={(e) => updateSetting('disableHoverTransitions', e.target.checked)} />}
                  label="Block Hover Transforms"
                />
                <FormControlLabel
                  control={<Switch checked={settings.reduceAnimations} onChange={(e) => updateSetting('reduceAnimations', e.target.checked)} />}
                  label="Pause UI Transitions"
                />
                <FormControlLabel
                  control={<Switch checked={settings.constantBorders} onChange={(e) => updateSetting('constantBorders', e.target.checked)} />}
                  label="Thicken Component Borders"
                />
                <FormControlLabel
                  control={<Switch checked={settings.keyboardNavOutline} onChange={(e) => updateSetting('keyboardNavOutline', e.target.checked)} />}
                  label="Show Keyboard Active Markers"
                />
                <FormControlLabel
                  control={<Switch checked={settings.accessibleInputs} onChange={(e) => updateSetting('accessibleInputs', e.target.checked)} />}
                  label="High-Visibility White Inputs"
                />

                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Volume2Icon /> Sound & Screen Reader Options
                </Typography>

                <FormControlLabel
                  control={<Switch checked={settings.clickAudioBeep} onChange={(e) => updateSetting('clickAudioBeep', e.target.checked)} />}
                  label="Enable Click Audio Beep Feedback"
                />
                <FormControlLabel
                  control={<Switch checked={settings.ttsHoverSpeak} onChange={(e) => updateSetting('ttsHoverSpeak', e.target.checked)} />}
                  label="Hover Reading Aloud (TTS)"
                />
                <FormControlLabel
                  control={<Switch checked={settings.speakKeysPressed} onChange={(e) => updateSetting('speakKeysPressed', e.target.checked)} />}
                  label="Announce Keyboard Keypresses"
                />
                <FormControlLabel
                  control={<Switch checked={settings.soundConfirmations} onChange={(e) => updateSetting('soundConfirmations', e.target.checked)} />}
                  label="Announce Interactive Actions"
                />
                <FormControlLabel
                  control={<Switch checked={settings.voiceMuteAll} onChange={(e) => updateSetting('voiceMuteAll', e.target.checked)} />}
                  label="Mute Speech Output entirely"
                />

                <Box>
                  <Typography variant="caption" color="text.secondary">Speech Speed: {settings.ttsSpeed}x</Typography>
                  <Slider
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    value={settings.ttsSpeed}
                    onChange={(_, val) => updateSetting('ttsSpeed', val)}
                  />
                </Box>
              </Stack>
            )}
          </Box>

          <Divider />

          {/* Quick Action Button */}
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              setSettings({
                fontSize: 100,
                letterSpacing: 0,
                lineHeight: 1.5,
                wordSpacing: 0,
                dyslexicFont: false,
                boldText: false,
                uppercaseText: false,
                lowercaseText: false,
                capitalizeText: false,
                underlineLinks: false,
                textShadow: false,
                sansSerifOnly: false,
                justifyText: false,
                largeLineGap: false,
                hideItalics: false,
                highContrast: false,
                extremeContrast: false,
                monochrome: false,
                invertColors: false,
                protanopia: false,
                deuteranopia: false,
                tritanopia: false,
                achromatopsia: false,
                tintMode: 'none',
                tintOpacity: 15,
                brightnessBoost: false,
                dimScreen: false,
                reduceGlares: false,
                photoNegative: false,
                grayScaleMask: false,
                bigCursor: false,
                gigaCursor: false,
                cursorHighlight: false,
                cursorCrosshair: false,
                readingRuler: false,
                readingSpotlight: false,
                rulerColor: '#3b82f6',
                rulerHeight: 4,
                spotlightHeight: 120,
                hoverOutline: false,
                keyboardFocusIndicator: false,
                tableRowHighlight: false,
                pageBorder: false,
                hideBackgrounds: false,
                structuralGrid: false,
                largeTargets: false,
                extraPadding: false,
                disableHoverTransitions: false,
                reduceAnimations: false,
                constantBorders: false,
                clickThresholdIncrease: false,
                keyboardNavOutline: false,
                freezeGifs: false,
                scrollSpeedLock: false,
                disableDoubleClicks: false,
                blockFlashyAnimations: false,
                stickyHeaders: false,
                simpleLayout: false,
                showControlGuides: false,
                accessibleInputs: false,
                clickAudioBeep: false,
                ttsHoverSpeak: false,
                ttsSpeed: 1.0,
                ttsPitch: 1.0,
                speakKeysPressed: false,
                soundConfirmations: false,
                voiceMuteAll: false,
                speechDoubleTab: false,
                ambientWhiteNoise: false,
                autoScrollMode: false,
              });
              // Explicitly clear injected style rules and color filters from the DOM
              if (typeof document !== 'undefined') {
                const styleEl = document.getElementById('squoosh-accessibility-style');
                if (styleEl) styleEl.innerHTML = '';
                if (document.documentElement) {
                  document.documentElement.style.filter = '';
                }
              }
              if (mode === 'light') {
                toggleColorMode();
              }
              setPresetId('classic');
              speakText("Reset all accessibility preferences");
            }}
          >
            Reset All Preferences
          </Button>
        </Stack>
      </Drawer>
    </>
  );
}
