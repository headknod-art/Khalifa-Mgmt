import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const OPENSIGN_URL = process.env.OPENSIGN_URL || 'http://localhost:8080';
const OPENSIGN_APP_ID = process.env.OPENSIGN_APP_ID || process.env.APP_ID || 'opensign';
const OPENSIGN_MASTER_KEY = process.env.OPENSIGN_MASTER_KEY || process.env.MASTER_KEY || '';

// Prefer an uploads folder relative to the repository, not the process cwd.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = process.env.UPLOADS_DIR || path.resolve(__dirname, '..', 'uploads');

router.post('/upload-file/:docId', async (req, res) => {
  try {
    const { docId } = req.params;
    if (!docId) return res.status(400).json({ error: 'docId required' });

    const filePath = path.join(uploadsDir, docId);
    console.debug('[OpenSign] upload-file: looking for file at', filePath);
    if (!fs.existsSync(filePath)) {
      console.warn('[OpenSign] upload-file: file not found', filePath);
      return res.status(404).json({ error: 'file not found' });
    }

    const buf = fs.readFileSync(filePath);
    const fileBase64 = buf.toString('base64');
    const originalName = docId.split('-').slice(1).join('-') || docId;

    let targetSaveFile = '';
    if (OPENSIGN_URL.endsWith('/app')) {
      targetSaveFile = `${OPENSIGN_URL}/functions/saveFile`;
    } else {
      targetSaveFile = `${OPENSIGN_URL}/app/functions/saveFile`;
    }

    const payload = { fileBase64, fileName: originalName };
    const headers = {
      'Content-Type': 'application/json',
      'X-Parse-Application-Id': OPENSIGN_APP_ID,
    };
    if (OPENSIGN_MASTER_KEY) headers['X-Parse-Master-Key'] = OPENSIGN_MASTER_KEY;

    console.debug('[OpenSign] upload-file: POST', targetSaveFile, 'payload.size=', payload?.fileBase64?.length || 0);
    try {
      const r = await fetch(targetSaveFile, { method: 'POST', headers, body: JSON.stringify(payload) });
      const text = await r.text().catch(() => '');
      let json = {};
      try { json = text ? JSON.parse(text) : {}; } catch (e) { json = { raw: text }; }
      console.debug('[OpenSign] upload-file: response status=', r.status, 'body=', json);
      return res.status(r.status).json(json);
    } catch (err) {
      console.error('[OpenSign] upload-file: fetch error:', err?.message || err);
      return res.status(502).json({ error: 'saveFile call failed', details: err?.message || String(err) });
    }
  } catch (err) {
    console.error('upload-file error:', err);
    return res.status(500).json({ error: 'upload failed', details: err.message });
  }
});

router.post('/requests', express.json(), async (req, res) => {
  try {
    const { documentId, recipientEmail } = req.body || {};
    if (!documentId) return res.status(400).json({ error: 'documentId required' });
    if (!recipientEmail) return res.status(400).json({ error: 'recipientEmail required' });

    const filePath = path.join(uploadsDir, documentId);
    console.debug('[OpenSign] requests: resolving filePath for', documentId);
    if (!fs.existsSync(filePath)) {
      console.warn('[OpenSign] requests: file not found', filePath);
      return res.status(404).json({ error: 'file not found' });
    }
    const buf = fs.readFileSync(filePath);
    const originalName = documentId.split('-').slice(1).join('-') || documentId;

    let parseBase = OPENSIGN_URL;
    if (!parseBase.endsWith('/app')) parseBase = `${parseBase.replace(/\/$/, '')}/app`;

    const uploadUrl = `${parseBase}/files/${encodeURIComponent(originalName)}`;
    const uploadHeaders = {
      'X-Parse-Application-Id': OPENSIGN_APP_ID,
      'Content-Type': 'application/octet-stream',
    };
    if (OPENSIGN_MASTER_KEY) uploadHeaders['X-Parse-Master-Key'] = OPENSIGN_MASTER_KEY;

    console.debug('[OpenSign] requests: POST', uploadUrl, 'headers:', Object.keys(uploadHeaders));
    const uploadResp = await fetch(uploadUrl, { method: 'POST', headers: uploadHeaders, body: buf });
    const uploadText = await uploadResp.text().catch(() => '');
    if (!uploadResp.ok) {
      console.error('[OpenSign] requests: upload failed status=', uploadResp.status, 'body=', uploadText);
      const err = uploadText || 'upload failed';
      return res.status(502).json({ error: 'upload failed', details: err });
    }
    let uploadJson = {};
    try { uploadJson = uploadText ? JSON.parse(uploadText) : {}; } catch (e) { uploadJson = { raw: uploadText }; }
    const fileUrl = uploadJson?.url || uploadJson?.fileUrl || '';
    console.debug('[OpenSign] requests: uploaded fileUrl=', fileUrl);

    const createDocUrl = `${parseBase}/classes/contracts_Document`;
    const docBody = {
      Name: originalName,
      URL: fileUrl,
      Note: '',
      SentToOthers: true,
      Placeholders: [ { email: recipientEmail, Role: 'signer' } ],
      Signers: [],
    };
    const createHeaders = {
      'X-Parse-Application-Id': OPENSIGN_APP_ID,
      'Content-Type': 'application/json',
    };
    if (OPENSIGN_MASTER_KEY) createHeaders['X-Parse-Master-Key'] = OPENSIGN_MASTER_KEY;

    const createResp = await fetch(createDocUrl, { method: 'POST', headers: createHeaders, body: JSON.stringify(docBody) });
    const createText = await createResp.text().catch(() => '');
    if (!createResp.ok) {
      console.error('[OpenSign] requests: create doc failed status=', createResp.status, 'body=', createText);
      const err = createText || 'create doc failed';
      return res.status(502).json({ error: 'create doc failed', details: err });
    }
    let createJson = {};
    try { createJson = createText ? JSON.parse(createText) : {}; } catch (e) { createJson = { raw: createText }; }
    const objectId = createJson?.objectId;
    console.debug('[OpenSign] requests: created document', objectId, createJson);

    const clientHost = process.env.OPENSIGN_CLIENT_URL || 'http://localhost:3000';
    const token = Buffer.from(`${objectId}/${recipientEmail}`).toString('base64');
    const signingUrl = `${clientHost.replace(/\/$/, '')}/login/${token}`;

    return res.status(200).json({ objectId, signingUrl, fileUrl, raw: createJson });
  } catch (err) {
    console.error('requests handler error:', err);
    return res.status(500).json({ error: 'request failed', details: err.message });
  }
});

function stripPrefix(originalUrl) {
  return originalUrl.replace(/^\/api\/opensign/, '');
}

router.use(async (req, res) => {
  try {
    const targetPath = stripPrefix(req.originalUrl);
    const targetUrl = `${OPENSIGN_URL}${targetPath}`;
    const headers = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (!k) continue;
      if (k.toLowerCase() === 'host') continue;
      headers[k] = v;
    }

    const method = req.method.toUpperCase();
    const opts = { method, headers };

    if (method !== 'GET' && method !== 'HEAD') {
      const ct = req.headers['content-type'] || '';
      if (ct.includes('application/json')) {
        opts.body = JSON.stringify(req.body || {});
        opts.headers['content-type'] = 'application/json';
      } else if (ct.includes('application/x-www-form-urlencoded')) {
        opts.body = Object.keys(req.body || {}).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(req.body[k])}`).join('&');
        opts.headers['content-type'] = 'application/x-www-form-urlencoded';
      } else {
        return res.status(501).json({ error: 'Proxy for this content-type not implemented. Use the OpenSign service directly or extend this proxy.' });
      }
    }

    const r = await fetch(targetUrl, opts);
    res.status(r.status);
    r.headers.forEach((v, k) => {
      if (k.toLowerCase() === 'content-length') return;
      res.setHeader(k, v);
    });
    const buf = await r.arrayBuffer();
    return res.send(Buffer.from(buf));
  } catch (err) {
    console.error('OpenSign proxy error:', err);
    return res.status(502).json({ error: 'Bad Gateway', details: err.message });
  }
});

export default router;
