import pytest

from m2.eligibility import check_eligibility, check_eligibility_batch
from m2.models import JobRequirements, StudentProfile


@pytest.fixture
def requirements():
    return JobRequirements(
        role="Software Engineer",
        minimum_cgpa=8.0,
        allowed_branches=["cse", "it"],
        graduation_year=2027,
        maximum_backlogs=0,
        mandatory_skills=["python", "sql"],
        preferred_skills=["aws", "react"],
    )


def make_student(**overrides):
    data = {
        "student_id": "S001",
        "name": "Rahul",
        "cgpa": 8.5,
        "branch": "CSE",
        "graduation_year": 2027,
        "backlogs": 0,
        "skills": ["Python", "SQL"],
    }

    data.update(overrides)
    return StudentProfile(**data)


def test_fully_eligible_student(requirements):
    result = check_eligibility(
        make_student(),
        requirements,
    )

    assert result.eligible is True
    assert result.reasons == []
    assert result.missing_mandatory_skills == []
    assert result.checks["cgpa"] is True
    assert result.checks["branch"] is True
    assert result.checks["graduation_year"] is True
    assert result.checks["backlogs"] is True
    assert result.checks["mandatory_skills"] is True


def test_exact_cgpa_boundary_is_eligible(requirements):
    student = make_student(cgpa=8.0)

    result = check_eligibility(student, requirements)

    assert result.eligible is True
    assert result.checks["cgpa"] is True


def test_cgpa_below_requirement_is_ineligible(requirements):
    student = make_student(cgpa=7.99)

    result = check_eligibility(student, requirements)

    assert result.eligible is False
    assert result.checks["cgpa"] is False
    assert any("CGPA" in reason for reason in result.reasons)


def test_branch_is_case_and_name_normalized(requirements):
    student = make_student(
        branch="Computer Science and Engineering",
    )

    result = check_eligibility(student, requirements)

    assert result.eligible is True
    assert result.checks["branch"] is True


def test_wrong_branch_is_ineligible(requirements):
    student = make_student(branch="ECE")

    result = check_eligibility(student, requirements)

    assert result.eligible is False
    assert result.checks["branch"] is False


def test_wrong_graduation_year_is_ineligible(requirements):
    student = make_student(graduation_year=2028)

    result = check_eligibility(student, requirements)

    assert result.eligible is False
    assert result.checks["graduation_year"] is False


def test_allowed_backlog_boundary_is_eligible():
    requirements = JobRequirements(
        maximum_backlogs=2,
    )

    student = make_student(backlogs=2)

    result = check_eligibility(student, requirements)

    assert result.eligible is True
    assert result.checks["backlogs"] is True


def test_too_many_backlogs_are_ineligible():
    requirements = JobRequirements(
        maximum_backlogs=0,
    )

    student = make_student(backlogs=1)

    result = check_eligibility(student, requirements)

    assert result.eligible is False
    assert result.checks["backlogs"] is False


def test_missing_mandatory_skill_is_ineligible(requirements):
    student = make_student(skills=["Python"])

    result = check_eligibility(student, requirements)

    assert result.eligible is False
    assert result.checks["mandatory_skills"] is False
    assert "sql" in result.missing_mandatory_skills


def test_skill_normalization(requirements):
    student = make_student(
        skills=["PYTHON", "Structured Query Language"],
    )

    result = check_eligibility(student, requirements)

    assert result.eligible is True
    assert set(result.matched_mandatory_skills) == {
        "python",
        "sql",
    }


def test_preferred_skill_does_not_affect_eligibility(requirements):
    student = make_student(
        skills=["Python", "SQL"],
    )

    result = check_eligibility(student, requirements)

    assert result.eligible is True
    assert result.matched_preferred_skills == []


def test_preferred_skill_is_reported_when_present(requirements):
    student = make_student(
        skills=["Python", "SQL", "AWS"],
    )

    result = check_eligibility(student, requirements)

    assert result.eligible is True
    assert result.matched_preferred_skills == ["aws"]


def test_multiple_failures_are_reported(requirements):
    student = make_student(
        cgpa=6.5,
        branch="ECE",
        graduation_year=2028,
        backlogs=2,
        skills=[],
    )

    result = check_eligibility(student, requirements)

    assert result.eligible is False
    assert result.checks["cgpa"] is False
    assert result.checks["branch"] is False
    assert result.checks["graduation_year"] is False
    assert result.checks["backlogs"] is False
    assert result.checks["mandatory_skills"] is False

    assert len(result.reasons) >= 5


def test_batch_eligibility(requirements):
    students = [
        make_student(
            student_id="S001",
            name="Eligible Student",
        ),
        make_student(
            student_id="S002",
            name="Low CGPA Student",
            cgpa=6.5,
        ),
        make_student(
            student_id="S003",
            name="Wrong Branch Student",
            branch="ECE",
        ),
    ]

    results = check_eligibility_batch(
        students,
        requirements,
    )

    assert len(results) == 3
    assert results[0].eligible is True
    assert results[1].eligible is False
    assert results[2].eligible is False