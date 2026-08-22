"""
Job Description parser for Module M2.

This module converts common plain-text Job Description patterns into
a structured JobRequirements object.

This is intentionally deterministic for the hackathon prototype.
It does not pretend to be a full NLP system.

A future LLM/NLP extractor can produce the same JobRequirements object
and replace or augment this parser without changing the eligibility engine.
"""

import re

from .models import JobRequirements


# ---------------------------------------------------------------------------
# Normalization helpers
# ---------------------------------------------------------------------------

def normalize_text(value: str) -> str:
    """Normalize whitespace and casing for comparison."""
    return re.sub(r"\s+", " ", value.strip()).lower()


def normalize_branch(branch: str) -> str:
    """
    Convert common branch names/abbreviations into a canonical form.
    """
    value = normalize_text(branch)

    aliases = {
        "cse": "cse",
        "computer science": "cse",
        "computer science engineering": "cse",
        "computer science and engineering": "cse",

        "it": "it",
        "information technology": "it",

        "ece": "ece",
        "electronics and communication": "ece",
        "electronics and communication engineering": "ece",

        "eee": "eee",
        "electrical and electronics": "eee",
        "electrical and electronics engineering": "eee",

        "me": "me",
        "mechanical": "me",
        "mechanical engineering": "me",

        "ce": "ce",
        "civil": "ce",
        "civil engineering": "ce",

        "ai": "ai",
        "artificial intelligence": "ai",

        "aiml": "aiml",
        "ai/ml": "aiml",
        "artificial intelligence and machine learning": "aiml",
    }

    return aliases.get(value, value)


def normalize_skill(skill: str) -> str:
    """Normalize a skill name for comparison."""
    value = normalize_text(skill)

    aliases = {
        "python programming": "python",
        "python": "python",

        "sql": "sql",
        "structured query language": "sql",

        "javascript": "javascript",
        "js": "javascript",

        "typescript": "typescript",
        "ts": "typescript",

        "reactjs": "react",
        "react.js": "react",
        "react": "react",

        "nodejs": "node.js",
        "node.js": "node.js",
        "node": "node.js",

        "machine learning": "machine learning",
        "ml": "machine learning",

        "artificial intelligence": "artificial intelligence",
        "ai": "artificial intelligence",

        "data structures": "data structures",
        "dsa": "data structures and algorithms",

        "data structures and algorithms": "data structures and algorithms",
    }

    return aliases.get(value, value)


# ---------------------------------------------------------------------------
# Extraction helpers
# ---------------------------------------------------------------------------

def _extract_role(text: str) -> str:
    """Extract a common job title."""
    patterns = [
        r"(?:job\s*title|role|position)\s*[:\-]\s*(.+)",
        r"(?:hiring\s+for)\s*[:\-]?\s*(.+)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            value = match.group(1).splitlines()[0].strip()
            return value

    return ""


def _extract_cgpa(text: str) -> float | None:
    """Extract minimum CGPA from common JD wording."""
    patterns = [
        r"(?:minimum|min|min\.?)\s*cgpa\s*(?:of|is|:|>=|>|=)?\s*(\d+(?:\.\d+)?)",
        r"cgpa\s*(?:>=|>|is|:|of)?\s*(\d+(?:\.\d+)?)",
        r"cgpa\s*(?:should\s*be|must\s*be)\s*(?:at\s*least\s*)?(\d+(?:\.\d+)?)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return float(match.group(1))

    return None


def _extract_graduation_year(text: str) -> int | None:
    """Extract a graduation/pass-out year."""
    patterns = [
        r"(?:graduation|graduate|passing|pass[-\s]?out)\s*(?:year)?"
        r"\s*(?:is|:|-|=)?\s*(20\d{2})",

        r"(?:batch|class\s+of)\s*(?:of|:|-)?\s*(20\d{2})",

        r"(20\d{2})\s*(?:graduates|graduating)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return int(match.group(1))

    return None


def _extract_backlog_limit(text: str) -> int | None:
    """
    Extract maximum allowed backlogs.

    Examples:
        No backlogs -> 0
        Backlogs allowed: 0 -> 0
        Maximum 2 backlogs -> 2
    """

    no_backlog_patterns = [
        r"\bno\s+backlogs?\b",
        r"\bzero\s+backlogs?\b",
        r"\bno\s+active\s+backlogs?\b",
    ]

    for pattern in no_backlog_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return 0

    patterns = [
        r"(?:maximum|max|up\s*to)\s*(\d+)\s*(?:active\s*)?backlogs?",
        r"backlogs?\s*(?:allowed|permitted)\s*[:\-]?\s*(\d+)",
        r"backlogs?\s*(?:must\s*be|should\s*be|<=|<|=)\s*(\d+)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return int(match.group(1))

    return None


def _extract_branches(text: str) -> list[str]:
    """Extract branches from common branch requirement statements."""
    patterns = [
        r"(?:eligible|allowed|required)\s+branches?\s*[:\-]\s*(.+)",
        r"branches?\s*[:\-]\s*(.+)",
    ]

    raw_value = None

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            raw_value = match.group(1).splitlines()[0].strip()
            break

    if not raw_value:
        return []

    # Remove common trailing sections that belong to another requirement.
    raw_value = re.split(
        r"\s+(?:with|and\s+minimum|having|requiring)\s+",
        raw_value,
        maxsplit=1,
        flags=re.IGNORECASE,
    )[0]

    pieces = re.split(r"[,/|;]+|\s+or\s+|\s+and\s+", raw_value, flags=re.IGNORECASE)

    branches = []

    for piece in pieces:
        piece = piece.strip(" .:-")

        if not piece:
            continue

        normalized = normalize_branch(piece)

        # Avoid accidentally treating generic text as a branch.
        valid_codes = {
            "cse",
            "it",
            "ece",
            "eee",
            "me",
            "ce",
            "ai",
            "aiml",
        }

        if normalized in valid_codes:
            branches.append(normalized)

    return list(dict.fromkeys(branches))


def _extract_skill_section(text: str, labels: list[str]) -> list[str]:
    """
    Extract comma/slash separated skills following a known label.

    Example:
        Required skills: Python, SQL, DSA
    """
    label_pattern = "|".join(re.escape(label) for label in labels)

    pattern = rf"(?:{label_pattern})\s*skills?\s*[:\-]\s*(.+)"

    match = re.search(pattern, text, re.IGNORECASE)

    if not match:
        return []

    value = match.group(1).splitlines()[0].strip()

    # Stop before another recognizable requirement section.
    value = re.split(
        r"\s+(?=(?:preferred|required|mandatory|eligible|allowed|minimum)"
        r"\s+(?:skills?|branches?|cgpa|qualification))",
        value,
        maxsplit=1,
        flags=re.IGNORECASE,
    )[0]

    pieces = re.split(r"[,/|;]+", value)

    skills = []

    for piece in pieces:
        piece = piece.strip(" .:-")

        if piece:
            skills.append(normalize_skill(piece))

    return list(dict.fromkeys(skills))


# ---------------------------------------------------------------------------
# Public parser
# ---------------------------------------------------------------------------

def parse_job_description(text: str) -> JobRequirements:
    """
    Parse a plain-text Job Description into JobRequirements.

    The parser recognizes common explicit patterns such as:

        Minimum CGPA: 8.0
        CGPA >= 8
        Branches: CSE, IT
        Graduation year: 2027
        No backlogs
        Maximum 2 backlogs
        Required skills: Python, SQL
        Mandatory skills: Python, SQL
        Preferred skills: AWS, React
    """

    if not isinstance(text, str):
        raise TypeError("Job description must be a string.")

    if not text.strip():
        raise ValueError("Job description cannot be empty.")

    requirements = JobRequirements(
        role=_extract_role(text),
        minimum_cgpa=_extract_cgpa(text),
        allowed_branches=_extract_branches(text),
        graduation_year=_extract_graduation_year(text),
        maximum_backlogs=_extract_backlog_limit(text),
        mandatory_skills=_extract_skill_section(
            text,
            ["required", "mandatory"],
        ),
        preferred_skills=_extract_skill_section(
            text,
            ["preferred"],
        ),
        source_text=text,
    )

    # Preferred skills should never duplicate mandatory skills.
    requirements.preferred_skills = [
        skill
        for skill in requirements.preferred_skills
        if skill not in requirements.mandatory_skills
    ]

    return requirements