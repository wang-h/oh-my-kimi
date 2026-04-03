/**
 * Path utilities for oh-my-kimi.
 * Resolves provider home/config, skills, prompts, agents, and OMX state.
 */

import { createHash } from "crypto";
import { existsSync } from "fs";
import { readdir, readFile, realpath } from "fs/promises";
import { dirname, join } from "path";
import { homedir } from "os";
import { fileURLToPath } from "url";

export const PRIMARY_PROVIDER_NAME = "kimi";
export const PRIMARY_PROVIDER_DISPLAY_NAME = "Kimi Code CLI";
export const PRIMARY_PROVIDER_HOME_ENV = "KIMI_HOME";
export const PRIMARY_PROVIDER_HOME_DIRNAME = ".kimi";
export const PRIMARY_PROVIDER_PROJECT_DIRNAME = ".kimi";

export const LEGACY_PROVIDER_NAME = "codex";
export const LEGACY_PROVIDER_HOME_ENV = "CODEX_HOME";
export const LEGACY_PROVIDER_HOME_DIRNAME = ".codex";

/** Canonical provider home directory (~/.kimi/) with legacy CODEX_HOME fallback. */
export function providerHome(): string {
  return process.env[PRIMARY_PROVIDER_HOME_ENV]
    || process.env[LEGACY_PROVIDER_HOME_ENV]
    || join(homedir(), PRIMARY_PROVIDER_HOME_DIRNAME);
}

/** Legacy Codex home directory (~/.codex/) or CODEX_HOME. */
export function legacyCodexHome(): string {
  return process.env[LEGACY_PROVIDER_HOME_ENV] || join(homedir(), LEGACY_PROVIDER_HOME_DIRNAME);
}

/** Canonical provider config file path (~/.kimi/config.toml). */
export function providerConfigPath(): string {
  return join(providerHome(), "config.toml");
}

/** Canonical provider prompts directory (~/.kimi/prompts/). */
export function providerPromptsDir(): string {
  return join(providerHome(), "prompts");
}

/** Canonical provider native agents directory (~/.kimi/agents/). */
export function providerAgentsDir(providerHomeDir?: string): string {
  return join(providerHomeDir || providerHome(), "agents");
}

/** Project-level provider root (.kimi/). */
export function projectProviderRootDir(projectRoot?: string): string {
  return join(projectRoot || process.cwd(), PRIMARY_PROVIDER_PROJECT_DIRNAME);
}

/** Project-level provider native agents directory (.kimi/agents/). */
export function projectProviderAgentsDir(projectRoot?: string): string {
  return join(projectProviderRootDir(projectRoot), "agents");
}

/** User-level provider skills directory ($KIMI_HOME/skills, defaults to ~/.kimi/skills/). */
export function providerUserSkillsDir(): string {
  return join(providerHome(), "skills");
}

/** Project-level provider skills directory (.kimi/skills/). */
export function projectProviderSkillsDir(projectRoot?: string): string {
  return join(projectProviderRootDir(projectRoot), "skills");
}

/** Historical legacy user-level skills directory (~/.agents/skills/). */
export function legacyUserSkillsDir(): string {
  return join(homedir(), ".agents", "skills");
}

/**
 * Backward-compatible aliases retained while the rest of the codebase
 * migrates off Codex-specific helper names.
 */
export function codexHome(): string {
  return legacyCodexHome();
}

export function codexConfigPath(): string {
  return join(codexHome(), "config.toml");
}

export function codexPromptsDir(): string {
  return join(codexHome(), "prompts");
}

export function codexAgentsDir(codexHomeDir?: string): string {
  return join(codexHomeDir || codexHome(), "agents");
}

export function projectCodexAgentsDir(projectRoot?: string): string {
  return join(projectRoot || process.cwd(), LEGACY_PROVIDER_HOME_DIRNAME, "agents");
}

/** Legacy user-level skills directory ($CODEX_HOME/skills, defaults to ~/.codex/skills/). */
export function userSkillsDir(): string {
  return join(codexHome(), "skills");
}

/** Legacy project-level skills directory (.codex/skills/). */
export function projectSkillsDir(projectRoot?: string): string {
  return join(projectRoot || process.cwd(), LEGACY_PROVIDER_HOME_DIRNAME, "skills");
}

export type InstalledSkillScope = "project" | "user";

export interface InstalledSkillDirectory {
  name: string;
  path: string;
  scope: InstalledSkillScope;
}

export interface SkillRootOverlapReport {
  canonicalDir: string;
  legacyDir: string;
  canonicalExists: boolean;
  legacyExists: boolean;
  canonicalResolvedDir: string | null;
  legacyResolvedDir: string | null;
  sameResolvedTarget: boolean;
  canonicalSkillCount: number;
  legacySkillCount: number;
  overlappingSkillNames: string[];
  mismatchedSkillNames: string[];
}

async function readInstalledSkillsFromDir(
  dir: string,
  scope: InstalledSkillScope,
): Promise<InstalledSkillDirectory[]> {
  if (!existsSync(dir)) return [];

  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      name: entry.name,
      path: join(dir, entry.name),
      scope,
    }))
    .filter((entry) => existsSync(join(entry.path, "SKILL.md")))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Installed skill directories in scope-precedence order.
 * Project skills win over user-level skills with the same directory basename.
 */
export async function listInstalledSkillDirectories(
  projectRoot?: string,
): Promise<InstalledSkillDirectory[]> {
  const orderedDirs: Array<{ dir: string; scope: InstalledSkillScope }> = [
    { dir: projectSkillsDir(projectRoot), scope: "project" },
    { dir: userSkillsDir(), scope: "user" },
  ];

  const deduped: InstalledSkillDirectory[] = [];
  const seenNames = new Set<string>();

  for (const { dir, scope } of orderedDirs) {
    const skills = await readInstalledSkillsFromDir(dir, scope);
    for (const skill of skills) {
      if (seenNames.has(skill.name)) continue;
      seenNames.add(skill.name);
      deduped.push(skill);
    }
  }

  return deduped;
}

export async function detectLegacySkillRootOverlap(
  canonicalDir = userSkillsDir(),
  legacyDir = legacyUserSkillsDir(),
): Promise<SkillRootOverlapReport> {
  const canonicalExists = existsSync(canonicalDir);
  const legacyExists = existsSync(legacyDir);
  const [canonicalSkills, legacySkills, canonicalResolvedDir, legacyResolvedDir] = await Promise.all([
    readInstalledSkillsFromDir(canonicalDir, "user"),
    readInstalledSkillsFromDir(legacyDir, "user"),
    canonicalExists ? realpath(canonicalDir).catch(() => null) : Promise.resolve(null),
    legacyExists ? realpath(legacyDir).catch(() => null) : Promise.resolve(null),
  ]);

  const canonicalHashes = await hashSkillDirectory(canonicalSkills);
  const legacyHashes = await hashSkillDirectory(legacySkills);
  const canonicalNames = new Set(canonicalSkills.map((skill) => skill.name));
  const legacyNames = new Set(legacySkills.map((skill) => skill.name));
  const overlappingSkillNames = [...canonicalNames]
    .filter((name) => legacyNames.has(name))
    .sort((a, b) => a.localeCompare(b));
  const mismatchedSkillNames = overlappingSkillNames.filter(
    (name) => canonicalHashes.get(name) !== legacyHashes.get(name),
  );
  const sameResolvedTarget =
    canonicalResolvedDir !== null &&
    legacyResolvedDir !== null &&
    canonicalResolvedDir === legacyResolvedDir;

  return {
    canonicalDir,
    legacyDir,
    canonicalExists,
    legacyExists,
    canonicalResolvedDir,
    legacyResolvedDir,
    sameResolvedTarget,
    canonicalSkillCount: canonicalSkills.length,
    legacySkillCount: legacySkills.length,
    overlappingSkillNames,
    mismatchedSkillNames,
  };
}

async function hashSkillDirectory(
  skills: InstalledSkillDirectory[],
): Promise<Map<string, string>> {
  const hashes = new Map<string, string>();

  for (const skill of skills) {
    try {
      const content = await readFile(join(skill.path, "SKILL.md"), "utf-8");
      hashes.set(skill.name, createHash("sha256").update(content).digest("hex"));
    } catch {
      // Ignore unreadable SKILL.md files; existence is enough for overlap detection.
    }
  }

  return hashes;
}

/** oh-my-kimi state directory (.omk/state/) */
export function omxStateDir(projectRoot?: string): string {
  return join(projectRoot || process.cwd(), ".omk", "state");
}

/** oh-my-kimi project memory file (.omk/project-memory.json) */
export function omxProjectMemoryPath(projectRoot?: string): string {
  return join(projectRoot || process.cwd(), ".omk", "project-memory.json");
}

/** oh-my-kimi notepad file (.omk/notepad.md) */
export function omxNotepadPath(projectRoot?: string): string {
  return join(projectRoot || process.cwd(), ".omk", "notepad.md");
}

/** oh-my-kimi plans directory (.omk/plans/) */
export function omxPlansDir(projectRoot?: string): string {
  return join(projectRoot || process.cwd(), ".omk", "plans");
}

/** oh-my-kimi logs directory (.omk/logs/) */
export function omxLogsDir(projectRoot?: string): string {
  return join(projectRoot || process.cwd(), ".omk", "logs");
}

/** Get the package root directory (where agents/, skills/, prompts/ live) */
export function packageRoot(): string {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const candidate = join(__dirname, "..", "..");
    if (existsSync(join(candidate, "package.json"))) {
      return candidate;
    }
    const candidate2 = join(__dirname, "..");
    if (existsSync(join(candidate2, "package.json"))) {
      return candidate2;
    }
  } catch {
    // fall through to cwd fallback
  }

  return process.cwd();
}
