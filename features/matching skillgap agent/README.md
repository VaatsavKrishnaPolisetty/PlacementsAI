# AI Campus Placement Operations & Interview Coordination Agent

A dependency-free TypeScript matching module computes explainable candidate matches, rankings, placement-readiness scores, skill-gap plans, and dynamic rematches. Numeric scoring and ranking are deterministic; no final hiring decision is made.

## Commands

```bash
npm install
npm test
```

Run the full stack in two terminals:

```bash
# terminal 1: matching API
npm install
npm start

# terminal 2: React frontend
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend proxies `/api` requests to the matching API on port `8787`.

## Integration

Member 5 can call `matchCandidate`, `rankCandidates`, `calculateReadiness`, `createReadinessPlan`, and `rematchCandidates` from `src/matching.ts`. The API exposes `POST /api/matching/run`, `POST /api/matching/rematch`, `POST /api/readiness`, `POST /api/skill-gaps`, and `GET /health`. Persist `MatchResult` and readiness plans in the existing backend `matches` and `readiness_plans` models.

The matching weights default to core skills 50%, project relevance 20%, preferred skills 10%, academics 10%, and experience/certifications 10%, and can be overridden per call. Missing communication or mock-interview values use a neutral score of 50 and are reported in `dataAvailability` rather than presented as observed evidence.
