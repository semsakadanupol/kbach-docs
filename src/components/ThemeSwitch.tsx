import { clsx, useTheme, type ThemeMode } from '@kbach/react';
import { MonitorIcon, MoonIcon, SunIcon } from './icons';

const OPTIONS: { mode: ThemeMode; label: string; icon: typeof SunIcon }[] = [
  { mode: 'light', label: 'Light', icon: SunIcon },
  { mode: 'system', label: 'System', icon: MonitorIcon },
  { mode: 'dark', label: 'Dark', icon: MoonIcon },
];

/** Light / system / dark, through useTheme() from @kbach/react. */
export function ThemeSwitch() {
  const { mode, setMode } = useTheme();
  return (
    <div role="radiogroup" aria-label="Color theme" className="flex items-center gap-0.5 rounded-full border border-line bg-panel p-0.5">
      {OPTIONS.map(({ mode: m, label, icon: Icon }) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={mode === m}
          aria-label={label}
          title={label}
          onClick={() => setMode(m)}
          className={clsx(
            'grid size-7 pointer-coarse:size-9 place-items-center rounded-full text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-gold',
            mode === m ? 'bg-card text-accent shadow-xs ring-1 ring-line' : 'text-faint hover:text-ink active:text-ink',
          )}
        >
          <Icon />
        </button>
      ))}
    </div>
  );
}
