/**
 * E2E Tier 1 — Feature 5: Vitest Test Suite Infrastructure
 * Opaque-box tests verifying runner configuration, path aliases, test harness, and execution contracts
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { SystemAdapter } from '../harness/system-adapter';
import { ReferenceOracle } from '../harness/reference-oracle';

describe('Feature 5: Vitest Test Suite Infrastructure', () => {
  const rootDir = process.cwd();

  it('F5-T1: should have vitest.config.ts configured with node environment and @/* alias', () => {
    const configPath = path.join(rootDir, 'vitest.config.ts');
    expect(fs.existsSync(configPath)).toBe(true);
    const content = fs.readFileSync(configPath, 'utf-8');
    expect(content).toContain("environment: 'node'");
    expect(content).toContain("globals: true");
    expect(content).toContain("'@': path.resolve");
  });

  it('F5-T2: should define test scripts in package.json', () => {
    const pkgPath = path.join(rootDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.scripts.test).toBe('vitest run');
  });

  it('F5-T3: should export full interface contracts from SystemAdapter matching PROJECT.md', () => {
    expect(typeof SystemAdapter.getAttributeModifier).toBe('function');
    expect(typeof SystemAdapter.calculatePvMax).toBe('function');
    expect(typeof SystemAdapter.calculatePmMax).toBe('function');
    expect(typeof SystemAdapter.canSpendPM).toBe('function');
    expect(typeof SystemAdapter.calculateDefense).toBe('function');
    expect(typeof SystemAdapter.calculateSkillBonus).toBe('function');
    expect(typeof SystemAdapter.calculateDerivedStats).toBe('function');
    expect(typeof SystemAdapter.calculateDistance).toBe('function');
    expect(typeof SystemAdapter.evaluateDiceExpression).toBe('function');
    expect(typeof SystemAdapter.applyDamage).toBe('function');
    expect(typeof SystemAdapter.sortInitiative).toBe('function');
  });

  it('F5-T4: should execute ReferenceOracle deterministic calculations without runtime exceptions', () => {
    const t20Mod = ReferenceOracle.getAttributeModifier('T20', 3);
    const trpgMod = ReferenceOracle.getAttributeModifier('TRPG', 16);
    expect(t20Mod).toBe(3);
    expect(trpgMod).toBe(3);

    const dist = ReferenceOracle.calculateDistance({ x: 0, y: 0 }, { x: 4, y: 3 }, 'chebyshev');
    expect(dist.cells).toBe(4);
    expect(dist.meters).toBe(6);
    expect(dist.rangeBand).toBe('Curto');
  });

  it('F5-T5: should verify TEST_INFRA.md documentation exists at project root', () => {
    const infraDocPath = path.join(rootDir, 'TEST_INFRA.md');
    expect(fs.existsSync(infraDocPath)).toBe(true);
    const content = fs.readFileSync(infraDocPath, 'utf-8');
    expect(content).toContain('31 Features');
    expect(content).toContain('Four-Tier Testing Methodology');
  });
});
