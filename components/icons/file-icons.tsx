// file:components\icons\file-icons.tsx
import type { IconType } from 'react-icons';
import {
  SiHtml5,
  SiCss,
  SiSass,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiJson,
  SiYaml,
  SiToml,
  SiMarkdown,
  SiPython,
  SiRuby,
  SiGo,
  SiRust,
  SiOpenjdk,
  SiPhp,
  SiGnubash,
  SiMysql,
  SiSvg,
  SiNodedotjs,
  SiNpm,
  SiGit,
  SiReadme,
} from 'react-icons/si';
import { VscFile, VscJson, VscLock, VscSymbolFile, VscFileMedia } from 'react-icons/vsc';

interface IconEntry {
  icon: IconType;
  className: string;
}

/**
 * Extension → real brand/language icon (Simple Icons via react-icons),
 * not a generic shape. Keys are lowercase, no leading dot.
 */
const ICON_MAP: Record<string, IconEntry> = {
  // Web
  html: { icon: SiHtml5, className: 'text-orange-500/90 dark:text-orange-400/80' },
  css: { icon: SiCss, className: 'text-sky-500/90 dark:text-sky-400/80' },
  scss: { icon: SiSass, className: 'text-pink-500/90 dark:text-pink-400/80' },
  sass: { icon: SiSass, className: 'text-pink-500/90 dark:text-pink-400/80' },

  // JS/TS
  js: { icon: SiJavascript, className: 'text-yellow-500/90 dark:text-yellow-400/80' },
  mjs: { icon: SiJavascript, className: 'text-yellow-500/90 dark:text-yellow-400/80' },
  jsx: { icon: SiReact, className: 'text-cyan-500/90 dark:text-cyan-400/80' },
  ts: { icon: SiTypescript, className: 'text-blue-500/90 dark:text-blue-400/80' },
  tsx: { icon: SiReact, className: 'text-blue-500/90 dark:text-blue-400/80' },

  // Data / config
  json: { icon: SiJson, className: 'text-amber-500/90 dark:text-amber-400/80' },
  yml: { icon: SiYaml, className: 'text-purple-500/90 dark:text-purple-400/80' },
  yaml: { icon: SiYaml, className: 'text-purple-500/90 dark:text-purple-400/80' },
  toml: { icon: SiToml, className: 'text-purple-500/90 dark:text-purple-400/80' },
  env: { icon: VscLock, className: 'text-emerald-500/90 dark:text-emerald-400/80' },

  // Docs
  md: { icon: SiMarkdown, className: 'text-zinc-500 dark:text-zinc-400' },
  mdx: { icon: SiMarkdown, className: 'text-zinc-500 dark:text-zinc-400' },
  txt: { icon: VscFile, className: 'text-zinc-400 dark:text-zinc-500' },

  // Other languages
  py: { icon: SiPython, className: 'text-blue-500/90 dark:text-blue-400/80' },
  rb: { icon: SiRuby, className: 'text-red-500/90 dark:text-red-400/80' },
  go: { icon: SiGo, className: 'text-cyan-500/90 dark:text-cyan-400/80' },
  rs: { icon: SiRust, className: 'text-orange-500/90 dark:text-orange-400/80' },
  java: { icon: SiOpenjdk, className: 'text-red-500/90 dark:text-red-400/80' },
  php: { icon: SiPhp, className: 'text-indigo-500/90 dark:text-indigo-400/80' },
  sh: { icon: SiGnubash, className: 'text-emerald-500/90 dark:text-emerald-400/80' },
  sql: { icon: SiMysql, className: 'text-blue-500/90 dark:text-blue-400/80' },

  // Images / fonts (browsable, not editable)
  svg: { icon: SiSvg, className: 'text-violet-500/90 dark:text-violet-400/80' },
  png: { icon: VscFileMedia, className: 'text-violet-400/90 dark:text-violet-500/70' },
  jpg: { icon: VscFileMedia, className: 'text-violet-400/90 dark:text-violet-500/70' },
  jpeg: { icon: VscFileMedia, className: 'text-violet-400/90 dark:text-violet-500/70' },
  woff2: { icon: VscSymbolFile, className: 'text-zinc-400 dark:text-zinc-500' },
};

const SPECIAL_NAMES: Record<string, IconEntry> = {
  'readme.md': { icon: SiReadme, className: 'text-blue-500/90 dark:text-blue-400/80' },
  '.gitignore': { icon: SiGit, className: 'text-orange-500/90 dark:text-orange-400/80' },
  '.gitkeep': { icon: SiGit, className: 'text-zinc-300 dark:text-zinc-700' },
  'package.json': { icon: SiNpm, className: 'text-red-500/90 dark:text-red-400/80' },
  'package-lock.json': { icon: SiNpm, className: 'text-red-400/80 dark:text-red-500/60' },
  '.nvmrc': { icon: SiNodedotjs, className: 'text-green-500/90 dark:text-green-400/80' },
};

/**
 * Returns a real brand/language icon sized to match the tree's [17px]
 * icon convention. Falls back to a neutral generic file glyph (VscFile)
 * for any extension not in the map — never renders nothing.
 */
export function getFileIcon(filename: string): React.ReactElement {
  const lower = filename.toLowerCase();
  const special = SPECIAL_NAMES[lower];
  if (special) {
    const Icon = special.icon;
    return <Icon className={special.className} />;
  }

  const ext = lower.includes('.') ? lower.split('.').pop()! : '';
  const match = ICON_MAP[ext];
  const Icon = match?.icon ?? VscFile;
  const className = match?.className ?? 'text-zinc-400 dark:text-zinc-500';

  return <Icon className={className} />;
}