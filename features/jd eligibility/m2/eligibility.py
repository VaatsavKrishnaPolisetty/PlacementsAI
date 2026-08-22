"""
Eligibility engine for Module M2.

This module performs deterministic eligibility checks against the
requirements extracted from a Job Description.

Hard requirements decide eligibility.
Preferred skills are informational only and never disqualify a student.
"""

from collections.abc import Iterable

from .jd_parser import normalize_branch, normalize_skill
from .models import EligibilityResult, JobRequirements, StudentProfile


def _normalized_skill_set(skills: Iterable[str]) -> set[str]:
    """Return a normalized set of student skills."""
    return {
        normalize_skill(skill)
        for skill in skills
        if isinstance(skill, str) and skill.strip()
    }


def _check_cgpa(
    student: StudentProfile,
    requirements: JobRequirements,
) -> tuple[bool, str | None]:
    """Check the student's CGPA against the minimum requirement."""

    if requirements.minimum_cgpa is None:
        return True, None

    if student.cgpa >= requirements.minimum_cgpa:
        return True, None

    return (
        False,
        f"CGPA {student.cgpa:.2f} is below the required "
        f"minimum of {requirements.minimum_cgpa:.2f}.",
    )


def _check_branch(
    student: StudentProfile,
    requirements: JobRequirements,
) -> tuple[bool, str | None]:
    """Check whether the student's branch is allowed."""

    if not requirements.allowed_branches:
        return True, None

    student_branch = normalize_branch(student.branch)

    if student_branch in requirements.allowed_branches:
        return True, None

    allowed = ", ".join(requirements.allowed_branches)

    return (
        False,
        f"Branch '{student.branch}' is not eligible. "
        f"Allowed branches: {allowed}.",
    )


def _check_graduation_year(
    student: StudentProfile,
    requirements: JobRequirements,
) -> tuple[bool, str | None]:
    """Check graduation year."""

    if requirements.graduation_year is None:
        return True, None

    if student.graduation_year == requirements.graduation_year:
        return True, None

    return (
        False,
        f"Graduation year {student.graduation_year} does not match "
        f"the required year {requirements.graduation_year}.",
    )


def _check_backlogs(
    student: StudentProfile,
    requirements: JobRequirements,
) -> tuple[bool, str | None]:
    """Check the student's number of backlogs."""

    if requirements.maximum_backlogs is None:
        return True, None

    if student.backlogs <= requirements.maximum_backlogs:
        return True, None

    return (
        False,
        f"Student has {student.backlogs} backlog(s), while the maximum "
        f"allowed is {requirements.maximum_backlogs}.",
    )


def _check_mandatory_skills(
    student: StudentProfile,
    requirements: JobRequirements,
) -> tuple[bool, list[str], list[str]]:
    """
    Check mandatory skills.

    Returns:
        passed, matched_skills, missing_skills
    """

    required = {
        normalize_skill(skill)
        for skill in requirements.mandatory_skills
        if skill.strip()
    }

    student_skills = _normalized_skill_set(student.skills)

    matched = sorted(required & student_skills)
    missing = sorted(required - student_skills)

    return not missing, matched, missing


def _get_preferred_matches(
    student: StudentProfile,
    requirements: JobRequirements,
) -> list[str]:
    """Return preferred skills possessed by the student."""

    preferred = {
        normalize_skill(skill)
        for skill in requirements.preferred_skills
        if skill.strip()
    }

    student_skills = _normalized_skill_set(student.skills)

    return sorted(preferred & student_skills)


def check_eligibility(
    student: StudentProfile,
    requirements: JobRequirements,
) -> EligibilityResult:
    """
    Evaluate one student against one set of job requirements.

    Eligibility is determined only by hard requirements:
        - CGPA
        - branch
        - graduation year
        - backlogs
        - mandatory skills

    Preferred skills do not affect eligibility.
    """

    cgpa_passed, cgpa_reason = _check_cgpa(student, requirements)
    branch_passed, branch_reason = _check_branch(student, requirements)
    year_passed, year_reason = _check_graduation_year(
        student,
        requirements,
    )
    backlog_passed, backlog_reason = _check_backlogs(
        student,
        requirements,
    )

    (
        mandatory_skills_passed,
        matched_mandatory,
        missing_mandatory,
    ) = _check_mandatory_skills(student, requirements)

    reasons: list[str] = []

    for reason in (
        cgpa_reason,
        branch_reason,
        year_reason,
        backlog_reason,
    ):
        if reason:
            reasons.append(reason)

    if missing_mandatory:
        reasons.append(
            "Missing mandatory skill(s): "
            + ", ".join(missing_mandatory)
            + "."
        )

    eligible = all(
        [
            cgpa_passed,
            branch_passed,
            year_passed,
            backlog_passed,
            mandatory_skills_passed,
        ]
    )

    return EligibilityResult(
        student_id=student.student_id,
        student_name=student.name,
        eligible=eligible,
        reasons=reasons,
        matched_mandatory_skills=matched_mandatory,
        missing_mandatory_skills=missing_mandatory,
        matched_preferred_skills=_get_preferred_matches(
            student,
            requirements,
        ),
        checks={
            "cgpa": cgpa_passed,
            "branch": branch_passed,
            "graduation_year": year_passed,
            "backlogs": backlog_passed,
            "mandatory_skills": mandatory_skills_passed,
        },
    )


def check_eligibility_batch(
    students: Iterable[StudentProfile],
    requirements: JobRequirements,
) -> list[EligibilityResult]:
    """Evaluate multiple students against the same job requirements."""

    return [
        check_eligibility(student, requirements)
        for student in students
    ]


def get_eligible_students(
    students: Iterable[StudentProfile],
    requirements: JobRequirements,
) -> list[StudentProfile]:
    """Return only students who satisfy all hard eligibility rules."""

    eligible_students = []

    for student in students:
        result = check_eligibility(student, requirements)

        if result.eligible:
            eligible_students.append(student)

    return eligible_students