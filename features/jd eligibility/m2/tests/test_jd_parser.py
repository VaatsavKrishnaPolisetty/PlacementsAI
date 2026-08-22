from m2.jd_parser import parse_job_description


def test_parse_complete_job_description():
    jd = """
    Role: Software Engineer
    Minimum CGPA: 8.0
    Eligible branches: CSE, IT
    Graduation year: 2027
    No backlogs
    Required skills: Python, SQL, DSA
    Preferred skills: AWS, React
    """

    requirements = parse_job_description(jd)

    assert requirements.role == "Software Engineer"
    assert requirements.minimum_cgpa == 8.0
    assert requirements.allowed_branches == ["cse", "it"]
    assert requirements.graduation_year == 2027
    assert requirements.maximum_backlogs == 0

    assert requirements.mandatory_skills == [
        "python",
        "sql",
        "data structures and algorithms",
    ]

    assert requirements.preferred_skills == [
        "aws",
        "react",
    ]


def test_parse_cgpa_greater_than_or_equal():
    jd = "CGPA >= 8.5"

    requirements = parse_job_description(jd)

    assert requirements.minimum_cgpa == 8.5


def test_parse_maximum_backlogs():
    jd = "Maximum 2 backlogs allowed."

    requirements = parse_job_description(jd)

    assert requirements.maximum_backlogs == 2


def test_parse_allowed_branches_with_slashes():
    jd = "Allowed branches: CSE/IT/ECE"

    requirements = parse_job_description(jd)

    assert requirements.allowed_branches == [
        "cse",
        "it",
        "ece",
    ]


def test_parse_skill_case_normalization():
    jd = """
    Mandatory skills: Python, SQL
    Preferred skills: React.js, AWS
    """

    requirements = parse_job_description(jd)

    assert requirements.mandatory_skills == [
        "python",
        "sql",
    ]

    assert requirements.preferred_skills == [
        "react",
        "aws",
    ]


def test_preferred_duplicate_is_removed():
    jd = """
    Mandatory skills: Python, SQL
    Preferred skills: Python, AWS
    """

    requirements = parse_job_description(jd)

    assert requirements.mandatory_skills == [
        "python",
        "sql",
    ]

    assert requirements.preferred_skills == [
        "aws",
    ]


def test_empty_jd_is_rejected():
    try:
        parse_job_description("")
        assert False, "Expected ValueError"
    except ValueError:
        pass


def test_non_string_jd_is_rejected():
    try:
        parse_job_description(None)
        assert False, "Expected TypeError"
    except TypeError:
        pass