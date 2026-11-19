import type { ComponentType } from 'react';
import { BoltIcon, BulbIcon, CodeIcon, GlobeIcon, InfoIcon, LayersIcon, PaletteIcon } from './icons';

// Each sidebar section's icon (the sidebar, a page's header). Keyed by the
// section titles in lib/docs.ts NAV.
export const SECTION_INFO: Record<string, { icon: ComponentType<{ className?: string }> }> = {
  'Getting started': { icon: BoltIcon },
  'Core concepts': { icon: BulbIcon },
  Platforms: { icon: GlobeIcon },
  Utilities: { icon: LayersIcon },
  Customization: { icon: PaletteIcon },
  'API reference': { icon: CodeIcon },
  Help: { icon: InfoIcon },
};
