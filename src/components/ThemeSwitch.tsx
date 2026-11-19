import { clsx, useTheme, type ThemeMode } from '@kbach/react';
import { MonitorIcon, MoonIcon, SunIcon } from './icons';
import { useT } from '../lib/i18n';

const OPTIONS: { mode: ThemeMode; label: string; icon: typeof SunIcon }[] = [
  { mode: 'light', label: 'Light', icon: SunIcon },
  { mode: 'system', label: 'System', icon: MonitorIcon },
  { mode: 'dark', label: 'Dark', icon: MoonIcon },
];

/** Light / system / dark, through useTheme() from @kbach/react. */
export function ThemeSwitch() {
  const { mode, setMode } = useTheme();
  const t = useT();
  return (
    <div role="radiogroup" aria-label={t('Color theme')} className="flex items-center gap-0.5 rounded-full border border-line bg-panel p-0.5">
      {OPTIONS.map(({ mode: m, label, icon: Icon }) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={mode === m}
          aria-label={t(label)}
          title={t(label)}
          onClick={() => setMode(m)}
          className={clsx(
            'grid size-7 place-items-center rounded-full text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-gold',
            mode === m ? 'bg-card text-accent shadow-xs ring-1 ring-line' : 'text-faint hover:text-ink',
          )}
        >
          <Icon />
        </button>
      ))}
    </div>
  );
}
