# SPDX-License-Identifier: AGPL-3.0-only
import os
import subprocess
import sys

# Path to the pre-build script
prebuild_script = os.path.abspath(os.path.join(os.path.dirname(__file__), "build_frontend.py"))

# Run the pre-build script
subprocess.check_call([sys.executable, prebuild_script])

# Run the build process in the server directory
server_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

subprocess.check_call([sys.executable, "-m", "build"], cwd=server_dir)
