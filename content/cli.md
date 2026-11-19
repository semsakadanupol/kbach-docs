---
title: CLI
description: npx @kbach/cli init sets Kbach up in an existing project, doctor checks a project that's already set up, and ai teaches your AI assistant Kbach's rules.
---

## init

```sh
npx @kbach/cli init
```

`init` reads your `package.json` to tell which framework the project uses, then:

| Framework | Installs | Changes |
| :-- | :-- | :-- |
| Vite | `@kbach/react` | Adds `kbach()` to `vite.config.ts` and `import './kbach.css'` to your entry file |
| Next.js | `@kbach/react` | Adds the plugin to `postcss.config.js` and the markers to `globals.css` |
| Expo | `@kbach/react-native` | Adds the Babel plugin to `babel.config.js`, or creates the file |
| React Native CLI | `@kbach/react-native` | The same, and offers to rebuild the Android app |

At the end it asks which dark-mode strategy you want, and whether to add Kbach's rules for AI assistants (see [ai](#ai)). It writes `kbach.config.js` only if you pick something other than the default and the file doesn't exist yet.

Edits keep your existing formatting and comments. If a config file has a shape the CLI doesn't recognize, it changes nothing and prints the snippet to add by hand. Running `init` again on a project that's set up changes nothing.

## doctor

```sh
npx @kbach/cli doctor
```

`doctor` only reads. It checks that:

- the right package is installed,
- the plugin is in `vite.config.ts`, `postcss.config.js` or `babel.config.js`,
- `kbach.css` exists and is imported (Vite), or the markers are in `globals.css` (Next.js),
- `kbach.config.js` parses,
- there's only one copy of `react` and `react-native` (React Native),
- the native module is in the last Android build (React Native CLI).

It exits with code `0` when everything passes and `1` when something fails, so it works as a CI step.

## ai {#ai}

```sh
npx @kbach/cli ai
```

AI assistants learned Tailwind CSS, not Kbach, so they write classes Kbach doesn't have. `ai` writes [Kbach's rules](/ai-assistants#give-it-the-rules) into the files AI tools read for project instructions:

| File | When |
| :-- | :-- |
| `AGENTS.md` | Always, created if missing. Codex, Copilot, Cursor, Gemini CLI and others read it |
| `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md` | Only if the project already has them |

The rules go in a marked section, and the rest of each file is left alone. Run it again after upgrading Kbach to get the latest rules; when they're already current, it changes nothing. Claude Code reads `CLAUDE.md` rather than `AGENTS.md`: if you use it without a `CLAUDE.md`, create one containing the line `@AGENTS.md`.

## Options

```text
kbach <init|doctor|ai> [--dry-run] [-y|--yes] [--pm <npm|pnpm|yarn|bun>] [--cwd <path>]
```

| Option | |
| :-- | :-- |
| `--dry-run` | Report what would change, without writing anything |
| `-y`, `--yes` | Take the default answer to every question |
| `--pm` | The package manager to use. By default it's detected from the lockfile |
| `--cwd` | Run in another folder, such as one app in a monorepo: `--cwd apps/web` |

Without a terminal, in CI for example, `init` takes the default answers on its own and says so. If it can't tell which framework a project uses, it stops rather than guess.

## Install it globally

```sh
npm install -g @kbach/cli
kbach doctor
```
