# M2 — Job Description & Eligibility Engine

M2 is responsible for converting a job description into structured
requirements and determining whether students satisfy the hard
eligibility criteria.

## Responsibilities

M2 handles:

1. Job description requirement extraction
2. Student profile representation
3. Deterministic eligibility evaluation
4. Explainable eligibility decisions
5. Batch eligibility evaluation

M2 does NOT handle:

- Frontend/UI
- Candidate ranking
- Skill-gap analysis
- Interview scheduling
- Notifications
- Final hiring decisions

Those responsibilities belong to other modules.

---

## Architecture

```text
Job Description
      |
      v
 jd_parser.py
      |
      v
JobRequirements
      |
      +--------------------+
                           |
StudentProfile --------> eligibility.py
                           |
                           v
                   EligibilityResult
                           |
                  +--------+--------+
                  |                 |
                  v                 v
              Eligible          Ineligible
                                  + reasons