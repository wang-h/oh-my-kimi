import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import TOML from '@iarna/toml';

describe('version sync contract', () => {
  it('keeps package.json, workspace metadata, and Rust members aligned for releases', () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8')) as { version: string };
    const workspace = TOML.parse(readFileSync(join(process.cwd(), 'Cargo.toml'), 'utf-8')) as {
      workspace?: { package?: { version?: string }; members?: string[] };
    };
    const explore = TOML.parse(readFileSync(join(process.cwd(), 'crates', 'omk-explore', 'Cargo.toml'), 'utf-8')) as {
      package?: { version?: string | { workspace?: boolean } };
    };
    const runtimeCore = TOML.parse(
      readFileSync(join(process.cwd(), 'crates', 'omk-runtime-core', 'Cargo.toml'), 'utf-8'),
    ) as { package?: { version?: string | { workspace?: boolean } } };
    const mux = TOML.parse(readFileSync(join(process.cwd(), 'crates', 'omk-mux', 'Cargo.toml'), 'utf-8')) as {
      package?: { version?: string | { workspace?: boolean } };
    };
    const runtime = TOML.parse(readFileSync(join(process.cwd(), 'crates', 'omk-runtime', 'Cargo.toml'), 'utf-8')) as {
      package?: { version?: string | { workspace?: boolean } };
    };
    const sparkshell = TOML.parse(readFileSync(join(process.cwd(), 'crates', 'omk-sparkshell', 'Cargo.toml'), 'utf-8')) as {
      package?: { version?: string | { workspace?: boolean } };
    };

    assert.equal(workspace.workspace?.package?.version, pkg.version);
    assert.deepEqual(workspace.workspace?.members, [
      'crates/omk-explore',
      'crates/omk-mux',
      'crates/omk-runtime-core',
      'crates/omk-runtime',
      'crates/omk-sparkshell',
    ]);
    assert.deepEqual(explore.package?.version, { workspace: true });
    assert.deepEqual(runtimeCore.package?.version, { workspace: true });
    assert.deepEqual(mux.package?.version, { workspace: true });
    assert.deepEqual(runtime.package?.version, { workspace: true });
    assert.deepEqual(sparkshell.package?.version, { workspace: true });
  });
});
