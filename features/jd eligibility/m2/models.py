"""
Data models for Module M2: Job Description and Eligibility.

M2 is responsible for:
1. Representing job requirements extracted from a Job Description.
2. Representing student profiles.
3. Representing eligibility decisions and explanations.

These models are intentionally independent of the backend/orchestrator
so that M5 can integrate M2 later without depending on its internals.
"""

from dataclasses import asdict, dataclass, field
from typing import Any, Optional


@dataclass
class JobRequirements:
    """Structured requirements extracted from a job description."""

    role: str = ""

    # Academic requirements
    minimum_cgpa: Optional[float] = None
    allowed_branches: list[str] = field(default_factory=list)
    graduation_year: Optional[int] = None
    maximum_backlogs: Optional[int] = None

    # Skill requirements
    mandatory_skills: list[str] = field(default_factory=list)
    preferred_skills: list[str] = field(default_factory=list)

    # Useful metadata
    source_text: str = ""

    def to_dict(self) -> dict[str, Any]:
        """Convert requirements into a JSON-friendly dictionary."""
        return asdict(self)


@dataclass
class StudentProfile:
    """Student information required for eligibility evaluation."""

    student_id: str
    name: str

    cgpa: float
    branch: str
    graduation_year: int

    backlogs: int = 0
    skills: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        """Convert student profile into a JSON-friendly dictionary."""
        return asdict(self)


@dataclass
class EligibilityResult:
    """Result of evaluating one student against one job."""

    student_id: str
    student_name: str

    eligible: bool

    reasons: list[str] = field(default_factory=list)

    matched_mandatory_skills: list[str] = field(default_factory=list)
    missing_mandatory_skills: list[str] = field(default_factory=list)

    # Useful for M3 and the UI later.
    matched_preferred_skills: list[str] = field(default_factory=list)

    # Transparent summary of which hard rules passed/failed.
    checks: dict[str, bool] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        """Convert eligibility result into a JSON-friendly dictionary."""
        return asdict(self)