import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/rolls/route';
import prisma from '@/lib/db/prisma';

describe('RollLog Persistence API (tests/unit/dice/api-rolls.test.ts)', () => {
  const createdIds: string[] = [];

  afterEach(async () => {
    // Clean up test roll logs created during test
    if (createdIds.length > 0) {
      await prisma.rollLog.deleteMany({
        where: { id: { in: createdIds } }
      });
      createdIds.length = 0;
    }
  });

  it('POST /api/rolls: should create and persist a new roll record', async () => {
    const payload = {
      senderName: 'Ladino Silencioso',
      system: 'T20',
      rollType: 'SKILL',
      expression: '1d20+12 # Furtividade',
      diceBreakdown: '[{"die":20,"result":15}]',
      total: 27,
      isCrit: false,
      isFumble: false,
      threatMargin: 20,
      label: 'Furtividade'
    };

    const req = new NextRequest('http://localhost:3000/api/rolls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.roll).toBeDefined();
    expect(data.roll.senderName).toBe('Ladino Silencioso');
    expect(data.roll.total).toBe(27);
    expect(data.roll.label).toBe('Furtividade');

    createdIds.push(data.roll.id);

    // Verify it exists in database
    const inDb = await prisma.rollLog.findUnique({
      where: { id: data.roll.id }
    });
    expect(inDb).not.toBeNull();
    expect(inDb?.expression).toBe('1d20+12 # Furtividade');
  });

  it('POST /api/rolls: should automatically evaluate formula if total is omitted', async () => {
    const payload = {
      expression: '1d20+7 # Ataque Automático',
      senderName: 'Paladino',
      system: 'T20'
    };

    const req = new NextRequest('http://localhost:3000/api/rolls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.roll.total).toBeGreaterThanOrEqual(8);
    expect(data.roll.total).toBeLessThanOrEqual(27);
    expect(data.roll.label).toBe('Ataque Automático');

    createdIds.push(data.roll.id);
  });

  it('POST /api/rolls: should return 400 when expression is missing or empty', async () => {
    const req = new NextRequest('http://localhost:3000/api/rolls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderName: 'Fantasma' })
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('obrigatória');
  });

  it('GET /api/rolls: should retrieve recent rolls with limit', async () => {
    // Insert a roll first
    const testRoll = await prisma.rollLog.create({
      data: {
        senderName: 'Testador',
        system: 'T20',
        rollType: 'CUSTOM',
        expression: '1d20',
        diceBreakdown: '[{"die":20,"result":10}]',
        total: 10,
        threatMargin: 20
      }
    });
    createdIds.push(testRoll.id);

    const req = new NextRequest('http://localhost:3000/api/rolls?limit=5');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.rolls)).toBe(true);
    expect(data.rolls.length).toBeGreaterThanOrEqual(1);

    const found = data.rolls.find((r: { id: string }) => r.id === testRoll.id);
    expect(found).toBeDefined();
    expect(found.senderName).toBe('Testador');
  });
});
