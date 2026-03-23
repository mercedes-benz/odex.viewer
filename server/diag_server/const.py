# SPDX-License-Identifier: AGPL-3.0-only
import os
from enum import Enum

DEFAULT_DEV_UI_STATIC_EXPORT_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "viewer", "out")
)

DIAG_SERVER_LOG_LEVEL = os.environ.get("DIAG_SERVER_LOG_LEVEL", "DEBUG")
DIAG_SERVER_SOCKET_ADDRESS = os.environ.get("DIAG_SERVER_SOCKET_ADDRESS", "0.0.0.0")
DIAG_SERVER_HOST = os.environ.get("DIAG_SERVER_HOST", "localhost")
DIAG_SERVER_PORT = os.environ.get("DIAG_SERVER_PORT", 8080)
DIAG_SERVER_BASE_URI = f"http://{DIAG_SERVER_HOST}:{DIAG_SERVER_PORT}"
DIAG_UI_STATIC_EXPORT_PATH = os.environ.get(
    "DIAG_UI_STATIC_EXPORT_PATH", DEFAULT_DEV_UI_STATIC_EXPORT_PATH
)
DIAG_SERVER_SERVE_UI_ENABLED = os.environ.get("DIAG_SERVER_SERVE_UI_ENABLED", "true").lower() in (
    "yes",
    "true",
)


class DiagnosticDataTypes(Enum):
    PDX = "PDX"


UDS_SERVICE_MAPPINGS = {
    0x10: "Diagnostic Session Control",
    0x11: "ECU Reset",
    0x14: "Clear Diagnostic Information",
    0x19: "Read DTC Information",
    0x22: "Read Data By Identifier",
    0x23: "Read Memory By Address",
    0x24: "Read Scaling Data By Identifier",
    0x27: "Security Access",
    0x28: "Communication Control",
    0x29: "Authentication",
    0x2A: "Read Data By Identifier Periodic",
    0x2C: "Dynamically Define Data Identifier",
    0x2E: "Write Data By Identifier",
    0x2F: "Input Output Control By Identifier",
    0x31: "Routine Control",
    0x34: "Request Download",
    0x35: "Request Upload",
    0x36: "Transfer Data",
    0x37: "Request Transfer Exit",
    0x38: "Request File Transfer",
    0x3E: "Tester Present",
    0x3D: "Write Memory By Address",
    0x83: "Access Timing Parameters",
    0x84: "Secured Data Transmission",
    0x85: "Control DTC Settings",
    0x86: "Response On Event",
    0x87: "Link Control",
}
