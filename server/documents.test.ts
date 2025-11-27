import request from 'supertest';
import express from 'express';
import documentsRouter from './documents';
import fs from 'fs';
import path from 'path';

describe('Documents API', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/documents', documentsRouter);

  it('should upload a file', async () => {
    const res = await request(app)
      .post('/api/documents/upload')
      .attach('file', Buffer.from('test file'), 'test.txt');
    expect(res.status).toBe(200);
    expect(res.body.originalName).toBe('test.txt');
  });

  it('should list documents', async () => {
    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should download a document', async () => {
    // Upload a file first
    const uploadRes = await request(app)
      .post('/api/documents/upload')
      .attach('file', Buffer.from('download test'), 'download.txt');
    const id = uploadRes.body.id;
    const res = await request(app).get(`/api/documents/${id}`);
    expect(res.status).toBe(200);
    expect(res.header['content-disposition']).toContain('download.txt');
  });
});
