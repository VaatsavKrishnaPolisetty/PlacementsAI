"""
M2: Job Description and Eligibility module.
"""

from .eligibility import (
    check_eligibility,
    check_eligibility_batch,
    get_eligible_students,
)
from .jd_parser import parse_job_description
from .models import (
    EligibilityResult,
    JobRequirements,
    StudentProfile,
)

__all__ = [
    "JobRequirements",
    "StudentProfile",
    "EligibilityResult",
    "parse_job_description",
    "check_eligibility",
    "check_eligibility_batch",
    "get_eligible_students",
]