import { describe, it, expect, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getScenes, POST as createScene } from '@/app/api/scenes/route';
import {
  GET as getSceneById,
  PUT as updateScene,
  DELETE as deleteScene,
} from '@/app/api/scenes/[id]/route';
import { GET as getTokens, POST as createToken } from '@/app/api/tokens/route';
import {
  GET as getTokenById,
  PUT as updateToken,
  DELETE as deleteToken,
} from '@/app/api/tokens/[id]/route';
import prisma from '@/lib/db/prisma';

describe('VTT Scenes & Tokens Persistence API', () => {
  const createdSceneIds: string[] = [];
  const createdTokenIds: string[] = [];

  afterEach(async () => {
    if (createdTokenIds.length > 0) {
      await prisma.token.deleteMany({
        where: { id: { in: createdTokenIds } },
      });
      createdTokenIds.length = 0;
    }

    if (createdSceneIds.length > 0) {
      await prisma.scene.deleteMany({
        where: { id: { in: createdSceneIds } },
      });
      createdSceneIds.length = 0;
    }
  });

  describe('Scene API endpoints', () => {
    it('POST /api/scenes: should create and persist a new tactical scene', async () => {
      const payload = {
        name: 'Masmorra dos Sussurros',
        gridWidth: 24,
        gridHeight: 18,
        backgroundUrl: '/maps/dungeon_arena.svg',
      };

      const req = new NextRequest('http://localhost:3000/api/scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const res = await createScene(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.name).toBe('Masmorra dos Sussurros');
      expect(json.data.gridWidth).toBe(24);
      expect(json.data.gridHeight).toBe(18);

      createdSceneIds.push(json.data.id);
    });

    it('POST /api/scenes: should return 400 when scene name is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const res = await createScene(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    it('GET /api/scenes: should retrieve list of scenes', async () => {
      const scene = await prisma.scene.create({
        data: { name: 'Arena de Testes' },
      });
      createdSceneIds.push(scene.id);

      const req = new NextRequest('http://localhost:3000/api/scenes');
      const res = await getScenes(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.some((s: { id: string }) => s.id === scene.id)).toBe(true);
    });

    it('GET /api/scenes/[id]: should return single scene or 404', async () => {
      const scene = await prisma.scene.create({
        data: { name: 'Câmara Secreta' },
      });
      createdSceneIds.push(scene.id);

      const req = new NextRequest(`http://localhost:3000/api/scenes/${scene.id}`);
      const res = await getSceneById(req, { params: { id: scene.id } });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.name).toBe('Câmara Secreta');

      // 404 for unknown
      const notFoundRes = await getSceneById(req, { params: { id: 'non-existent' } });
      expect(notFoundRes.status).toBe(404);
    });

    it('PUT /api/scenes/[id]: should update scene properties', async () => {
      const scene = await prisma.scene.create({
        data: { name: 'Nome Original', gridWidth: 10 },
      });
      createdSceneIds.push(scene.id);

      const req = new NextRequest(`http://localhost:3000/api/scenes/${scene.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Nome Atualizado', gridWidth: 30 }),
      });

      const res = await updateScene(req, { params: { id: scene.id } });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.name).toBe('Nome Atualizado');
      expect(json.data.gridWidth).toBe(30);
    });

    it('DELETE /api/scenes/[id]: should remove scene from database', async () => {
      const scene = await prisma.scene.create({
        data: { name: 'Cena Para Deletar' },
      });

      const req = new NextRequest(`http://localhost:3000/api/scenes/${scene.id}`, {
        method: 'DELETE',
      });

      const res = await deleteScene(req, { params: { id: scene.id } });
      expect(res.status).toBe(200);

      const inDb = await prisma.scene.findUnique({ where: { id: scene.id } });
      expect(inDb).toBeNull();
    });
  });

  describe('Token API endpoints', () => {
    let testSceneId: string;

    beforeEach(async () => {
      const scene = await prisma.scene.create({
        data: { name: 'Cena de Tokens' },
      });
      testSceneId = scene.id;
      createdSceneIds.push(scene.id);
    });

    it('POST /api/tokens: should create a token in the scene', async () => {
      const payload = {
        sceneId: testSceneId,
        name: 'Guerreiro de Valkaria',
        x: 4,
        y: 6,
        size: 'MEDIUM',
        pvCurrent: 35,
        pvMax: 35,
        color: '#DC2626',
      };

      const req = new NextRequest('http://localhost:3000/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const res = await createToken(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.name).toBe('Guerreiro de Valkaria');
      expect(json.data.x).toBe(4);
      expect(json.data.y).toBe(6);

      createdTokenIds.push(json.data.id);
    });

    it('POST /api/tokens: should reject missing sceneId or name', async () => {
      const req = new NextRequest('http://localhost:3000/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Sem Cena' }),
      });

      const res = await createToken(req);
      expect(res.status).toBe(400);
    });

    it('GET /api/tokens: should filter tokens by sceneId', async () => {
      const token = await prisma.token.create({
        data: {
          sceneId: testSceneId,
          name: 'Token Filtrado',
          x: 2,
          y: 2,
        },
      });
      createdTokenIds.push(token.id);

      const req = new NextRequest(`http://localhost:3000/api/tokens?sceneId=${testSceneId}`);
      const res = await getTokens(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.length).toBeGreaterThanOrEqual(1);
      expect(json.data.some((t: { id: string }) => t.id === token.id)).toBe(true);
    });

    it('PUT /api/tokens/[id]: should update token coordinates, HP, and conditions', async () => {
      const token = await prisma.token.create({
        data: {
          sceneId: testSceneId,
          name: 'Token Dinamico',
          x: 1,
          y: 1,
          pvCurrent: 20,
          pvMax: 20,
        },
      });
      createdTokenIds.push(token.id);

      const req = new NextRequest(`http://localhost:3000/api/tokens/${token.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          x: 7,
          y: 9,
          pvCurrent: 14,
          conditionsJson: ['Caído'],
        }),
      });

      const res = await updateToken(req, { params: { id: token.id } });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.x).toBe(7);
      expect(json.data.y).toBe(9);
      expect(json.data.pvCurrent).toBe(14);
      expect(json.data.conditionsJson).toContain('Caído');
    });

    it('DELETE /api/tokens/[id]: should remove token', async () => {
      const token = await prisma.token.create({
        data: {
          sceneId: testSceneId,
          name: 'Token a Deletar',
          x: 0,
          y: 0,
        },
      });

      const req = new NextRequest(`http://localhost:3000/api/tokens/${token.id}`, {
        method: 'DELETE',
      });

      const res = await deleteToken(req, { params: { id: token.id } });
      expect(res.status).toBe(200);

      const inDb = await prisma.token.findUnique({ where: { id: token.id } });
      expect(inDb).toBeNull();
    });
  });
});
