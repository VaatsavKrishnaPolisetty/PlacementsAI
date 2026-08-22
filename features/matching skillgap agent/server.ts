import { createServer } from 'node:http';
import { calculateReadiness, createReadinessPlan, matchCandidate, rankCandidates, rematchCandidates, type Job, type Student } from './src/matching.js';

const port = Number(process.env.PORT ?? 8787);

function send(response: import('node:http').ServerResponse, status: number, payload: unknown): void {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' });
  response.end(JSON.stringify(payload));
}

async function body(request: import('node:http').IncomingMessage): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type' });
    response.end();
    return;
  }
  try {
    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
    if (request.method === 'GET' && url.pathname === '/health') return send(response, 200, { status: 'ok', service: 'matching-agent' });
    if (request.method !== 'POST') return send(response, 404, { error: 'Route not found' });
    const input = await body(request);
    if (url.pathname === '/api/matching/run') {
      if (!Array.isArray(input.students) || !input.job) return send(response, 400, { error: 'students array and job are required' });
      return send(response, 200, { candidates: rankCandidates(input.students as Student[], input.job as Job) });
    }
    if (url.pathname === '/api/matching/rematch') {
      if (!Array.isArray(input.students) || !input.job || !input.unavailableStudentId) return send(response, 400, { error: 'students, job, and unavailableStudentId are required' });
      return send(response, 200, rematchCandidates(input.students as Student[], input.job as Job, input.unavailableStudentId));
    }
    if (url.pathname === '/api/readiness') {
      if (!input.student || !input.job) return send(response, 400, { error: 'student and job are required' });
      return send(response, 200, calculateReadiness(input.student as Student, input.job as Job));
    }
    if (url.pathname === '/api/skill-gaps') {
      if (!input.student || !input.job) return send(response, 400, { error: 'student and job are required' });
      const match = matchCandidate(input.student as Student, input.job as Job);
      return send(response, 200, createReadinessPlan(input.student.studentId, input.job.jobId, match.skillGaps, input.days ?? 3));
    }
    return send(response, 404, { error: 'Route not found' });
  } catch (error) {
    return send(response, 400, { error: error instanceof Error ? error.message : 'Invalid request' });
  }
});

server.listen(port, () => console.log(`Matching API listening on http://localhost:${port}`));
