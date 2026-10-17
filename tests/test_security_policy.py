import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
SOURCE = (ROOT / "backend" / "main.py").read_text(encoding="utf-8")

class NeuroFlowSecurityPolicyTests(unittest.TestCase):
    def test_development_server_is_loopback_only(self):
        self.assertIn('uvicorn.run("main:app", host="127.0.0.1"', SOURCE)
        self.assertNotIn('host="0.0.0.0"', SOURCE)

    def test_cors_is_restricted_to_local_frontend_origins(self):
        self.assertIn('LOCAL_FRONTEND_ORIGINS = {"http://localhost:5173", "http://127.0.0.1:5173"}', SOURCE)
        self.assertIn('allow_origins=list(LOCAL_FRONTEND_ORIGINS)', SOURCE)
        self.assertNotIn('allow_origins=["*"]', SOURCE)

    def test_nonlocal_browser_origins_are_rejected(self):
        self.assertIn('origin not in LOCAL_FRONTEND_ORIGINS', SOURCE)
        self.assertIn('status_code=403', SOURCE)

    def test_upload_is_bounded_and_oversize_status_is_preserved(self):
        self.assertIn('MAX_IMAGE_BYTES = 5 * 1024 * 1024', SOURCE)
        self.assertIn('file.read(MAX_IMAGE_BYTES + 1)', SOURCE)
        self.assertIn('status_code=413', SOURCE)
        self.assertIn('except HTTPException:', SOURCE)

if __name__ == "__main__":
    unittest.main()
