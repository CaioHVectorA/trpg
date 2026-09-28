/**
 * E2E Tier 1 — Feature 29: Comprehensive README & Docs
 * Opaque-box tests verifying architecture documentation, requirements, and environment setup
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Feature 29: Comprehensive README & Docs', () => {
  const rootDir = process.cwd();

  it('F29-T1: should maintain PROJECT.md master architecture and feature inventory', () => {
    const projectMdPath = path.join(rootDir, '.agents/teamwork/PROJECT.md');
    expect(fs.existsSync(projectMdPath)).toBe(true);
    const content = fs.readFileSync(projectMdPath, 'utf-8');
    expect(content).toContain('Tormenta 20 & TRPG Multi-System Web Platform');
    expect(content).toContain('Feature Inventory');
    expect(content).toContain('Interface Contracts');
  });

  it('F29-T2: should preserve ORIGINAL_REQUEST.md specifying requirements R1 to R6', () => {
    const origReqPath = path.join(rootDir, '.agents/teamwork/ORIGINAL_REQUEST.md');
    expect(fs.existsSync(origReqPath)).toBe(true);
    const content = fs.readFileSync(origReqPath, 'utf-8');
    expect(content).toMatch(/R1/);
    expect(content).toMatch(/R2/);
    expect(content).toMatch(/R3/);
    expect(content).toMatch(/R4/);
    expect(content).toMatch(/R5/);
    expect(content).toMatch(/R6/);
  });

  it('F29-T3: should maintain TEST_INFRA.md documenting the 4-tier testing methodology', () => {
    const testInfraPath = path.join(rootDir, 'TEST_INFRA.md');
    expect(fs.existsSync(testInfraPath)).toBe(true);
    const content = fs.readFileSync(testInfraPath, 'utf-8');
    expect(content).toContain('Tier 1 — Feature Coverage');
    expect(content).toContain('Tier 2 — Boundary & Corner Cases');
    expect(content).toContain('Tier 3 — Cross-Feature Combinations');
    expect(content).toContain('Tier 4 — Real-World Application Scenarios');
  });

  it('F29-T4: should document Supabase PostgreSQL migration path in Prisma documentation/schema', () => {
    const schemaPath = path.join(rootDir, 'prisma/schema.prisma');
    const content = fs.readFileSync(schemaPath, 'utf-8');
    expect(content).toMatch(/postgres/i);
    expect(content).toMatch(/supabase/i);
  });

  it('F29-T5: should provide environment variable templates in .env.example', () => {
    const envExamplePath = path.join(rootDir, '.env.example');
    expect(fs.existsSync(envExamplePath)).toBe(true);
    const content = fs.readFileSync(envExamplePath, 'utf-8');
    expect(content).toContain('DATABASE_URL');
  });
});
