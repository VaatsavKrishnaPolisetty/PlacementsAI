"""
Python AI Engine microservice for AI Campus Placement Operations.
Integrates Member 2 JD Parser and Eligibility Evaluator.
Exposes standard REST endpoints on port 8000.
"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

# Ensure imports work from features/jd eligibility/m2 or local package
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, "../.."))
m2_path = os.path.join(root_dir, "features", "jd eligibility")
if m2_path not in sys.path:
    sys.path.insert(0, m2_path)

try:
    from m2.jd_parser import parse_job_description
    from m2.eligibility import check_eligibility, check_eligibility_batch
    from m2.models import JobRequirements, StudentProfile
except ImportError:
    # Direct relative fallback
    from jd_parser import parse_job_description
    from eligibility import check_eligibility, check_eligibility_batch
    from models import JobRequirements, StudentProfile


class PlacementAIRequestHandler(BaseHTTPRequestHandler):
    def _send_json(self, status_code: int, data: dict):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path in ["/health", "/api/health"]:
            self._send_json(200, {
                "status": "ok",
                "service": "Python Placement AI Engine",
                "version": "1.0.0",
                "capabilities": ["jd_parsing", "eligibility_evaluation", "batch_verification"]
            })
        else:
            self._send_json(404, {"error": f"Path '{parsed.path}' not found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"

        try:
            body = json.loads(post_data) if post_data else {}
        except Exception as e:
            self._send_json(400, {"error": f"Invalid JSON payload: {str(e)}"})
            return

        try:
            if parsed.path in ["/api/jd/parse", "/parse-jd"]:
                text = body.get("text", "")
                if not text:
                    self._send_json(400, {"error": "Missing 'text' field in request body"})
                    return
                reqs = parse_job_description(text)
                self._send_json(200, {
                    "success": True,
                    "data": reqs.to_dict()
                })

            elif parsed.path in ["/api/eligibility/check", "/check-eligibility"]:
                student_data = body.get("student", {})
                job_data = body.get("jobRequirements", {})
                if not student_data or not job_data:
                    self._send_json(400, {"error": "Both 'student' and 'jobRequirements' are required"})
                    return

                student = StudentProfile(
                    student_id=student_data.get("studentId", student_data.get("student_id", "")),
                    name=student_data.get("name", ""),
                    cgpa=float(student_data.get("cgpa", 0.0)),
                    branch=student_data.get("branch", ""),
                    graduation_year=int(student_data.get("graduationYear", student_data.get("graduation_year", 2026))),
                    backlogs=int(student_data.get("backlogs", 0)),
                    skills=student_data.get("skills", [])
                )

                job = JobRequirements(
                    role=job_data.get("role", ""),
                    minimum_cgpa=float(job_data.get("minCGPA", job_data.get("minimum_cgpa", 0.0))) if (job_data.get("minCGPA") is not None or job_data.get("minimum_cgpa") is not None) else None,
                    allowed_branches=job_data.get("branches", job_data.get("allowed_branches", [])),
                    graduation_year=int(job_data.get("graduationYear", job_data.get("graduation_year", 2026))) if (job_data.get("graduationYear") is not None or job_data.get("graduation_year") is not None) else None,
                    maximum_backlogs=int(job_data.get("maxBacklogs", job_data.get("maximum_backlogs", 0))) if (job_data.get("maxBacklogs") is not None or job_data.get("maximum_backlogs") is not None) else None,
                    mandatory_skills=job_data.get("requiredSkills", job_data.get("mandatory_skills", [])),
                    preferred_skills=job_data.get("preferredSkills", job_data.get("preferred_skills", []))
                )

                result = check_eligibility(student, job)
                self._send_json(200, {
                    "success": True,
                    "data": result.to_dict()
                })

            elif parsed.path in ["/api/eligibility/batch", "/batch-eligibility"]:
                students_data = body.get("students", [])
                job_data = body.get("jobRequirements", {})
                if not isinstance(students_data, list) or not job_data:
                    self._send_json(400, {"error": "'students' array and 'jobRequirements' are required"})
                    return

                students = [
                    StudentProfile(
                        student_id=s.get("studentId", s.get("student_id", "")),
                        name=s.get("name", ""),
                        cgpa=float(s.get("cgpa", 0.0)),
                        branch=s.get("branch", ""),
                        graduation_year=int(s.get("graduationYear", s.get("graduation_year", 2026))),
                        backlogs=int(s.get("backlogs", 0)),
                        skills=s.get("skills", [])
                    )
                    for s in students_data
                ]

                job = JobRequirements(
                    role=job_data.get("role", ""),
                    minimum_cgpa=float(job_data.get("minCGPA", job_data.get("minimum_cgpa", 0.0))) if (job_data.get("minCGPA") is not None or job_data.get("minimum_cgpa") is not None) else None,
                    allowed_branches=job_data.get("branches", job_data.get("allowed_branches", [])),
                    graduation_year=int(job_data.get("graduationYear", job_data.get("graduation_year", 2026))) if (job_data.get("graduationYear") is not None or job_data.get("graduation_year") is not None) else None,
                    maximum_backlogs=int(job_data.get("maxBacklogs", job_data.get("maximum_backlogs", 0))) if (job_data.get("maxBacklogs") is not None or job_data.get("maximum_backlogs") is not None) else None,
                    mandatory_skills=job_data.get("requiredSkills", job_data.get("mandatory_skills", [])),
                    preferred_skills=job_data.get("preferredSkills", job_data.get("preferred_skills", []))
                )

                results = check_eligibility_batch(students, job)
                self._send_json(200, {
                    "success": True,
                    "count": len(results),
                    "data": [r.to_dict() for r in results]
                })

            else:
                self._send_json(404, {"error": f"Endpoint '{parsed.path}' not found"})

        except Exception as e:
            self._send_json(500, {"error": f"AI Processing Error: {str(e)}"})

    def log_message(self, format, *args):
        sys.stderr.write(f"🤖 [Python AI Engine] {self.address_string()} - {format % args}\n")


def run_server(port=8000):
    server_address = ("", port)
    httpd = HTTPServer(server_address, PlacementAIRequestHandler)
    print(f"🚀 Python Placement AI Engine running on http://localhost:{port}")
    print(f"❤️ Health check: http://localhost:{port}/health")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down Python AI Engine.")
        httpd.server_close()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    run_server(port)
