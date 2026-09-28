/**
 * E2E Tier 1 — Feature 1: Next.js App Router Scaffold
 * Opaque-box tests verifying application routes, layout contracts, and core configuration
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Feature 1: Next.js App Router Scaffold', () => {
  const rootDir = process.cwd();

  it('F1-T1: should have valid package.json with Next.js 14 and React 18', () => {
    const pkgPath = path.join(rootDir, 'package.json');
    expect(fs.existsSync(pkgPath)).toBe(true);
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.dependencies.next).toContain('14');
    expect(pkg.dependencies.react).toContain('18');
  });

  it('F1-T2: should configure strict TypeScript with @/* path aliases', () => {
    const tsconfigPath = path.join(rootDir, 'tsconfig.json');
    expect(fs.existsSync(tsconfigPath)).toBe(true);
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.paths['@/*']).toBeDefined();
  });

  it('F1-T3: should define root layout and application entry point', () => {
    const layoutPath = path.join(rootDir, 'src/app/layout.tsx');
    const pagePath = path.join(rootDir, 'src/app/page.tsx');
    expect(fs.existsSync(layoutPath)).toBe(true);
    expect(fs.existsSync(pagePath)).toBe(true);
  });

  it('F1-T4: should support high-level route segments for sheets, vtt, and compendium', () => {
    const appDir = path.join(rootDir, 'src/app');
    const entries = fs.readdirSync(appDir);
    expect(entries.some(e => e.includes('character') || e.includes('sheet'))).toBe(true);
    expect(entries.includes('vtt')).toBe(true);
    expect(entries.includes('compendium')).toBe(true);
  });

  it('F1-T5: should have Next.js configuration in next.config.mjs or next.config.js', () => {
    const configMjs = path.join(rootDir, 'next.config.mjs');
    const configJs = path.join(rootDir, 'next.config.js');
    expect(fs.existsSync(configMjs) || fs.existsSync(configJs)).toBe(true);
  });
});
