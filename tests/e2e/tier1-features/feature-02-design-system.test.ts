/**
 * E2E Tier 1 — Feature 2: High-Fantasy Design System
 * Opaque-box tests verifying Arton high-fantasy theme tokens, colors, and layout styling
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Feature 2: High-Fantasy Design System', () => {
  const rootDir = process.cwd();

  it('F2-T1: should define Tormenta color palette in tailwind.config.ts', () => {
    const tailwindPath = path.join(rootDir, 'tailwind.config.ts');
    expect(fs.existsSync(tailwindPath)).toBe(true);
    const content = fs.readFileSync(tailwindPath, 'utf-8');
    expect(content).toMatch(/arton/i);
    expect(content).toMatch(/gold/i);
    expect(content).toMatch(/mana/i);
    expect(content).toMatch(/parchment/i);
  });

  it('F2-T2: should configure globals.css with high-fantasy root variables or utility styles', () => {
    const cssPath = path.join(rootDir, 'src/app/globals.css');
    expect(fs.existsSync(cssPath)).toBe(true);
    const css = fs.readFileSync(cssPath, 'utf-8');
    expect(css).toContain('@tailwind');
    expect(css.length).toBeGreaterThan(100);
  });

  it('F2-T3: should define font families for fantasy headers and body text', () => {
    const tailwindPath = path.join(rootDir, 'tailwind.config.ts');
    const content = fs.readFileSync(tailwindPath, 'utf-8');
    expect(content).toMatch(/fontFamily|serif|cinzel|inter/i);
  });

  it('F2-T4: should configure dark mode support for immersive tabletop experience', () => {
    const tailwindPath = path.join(rootDir, 'tailwind.config.ts');
    const content = fs.readFileSync(tailwindPath, 'utf-8');
    expect(content).toMatch(/darkMode/);
  });

  it('F2-T5: should provide high-fantasy UI theme classes across the app dashboard', () => {
    const pagePath = path.join(rootDir, 'src/app/page.tsx');
    expect(fs.existsSync(pagePath)).toBe(true);
    const content = fs.readFileSync(pagePath, 'utf-8');
    expect(content).toMatch(/arton|gold|mana|parchment|bg-stone|bg-slate|text-amber/i);
  });
});
