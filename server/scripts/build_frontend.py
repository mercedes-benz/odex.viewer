# SPDX-License-Identifier: AGPL-3.0-only
import os
import shutil
import subprocess
import sys
from pathlib import Path


def build_frontend(viewer_dir: str):
    npm = shutil.which("npm") or shutil.which("npm.cmd")

    try:
        if not npm:
            raise FileNotFoundError(
                "Could not find 'npm'. Install Node.js or properly add npm to PATH."
            )

        subprocess.run([npm, "install"], cwd=viewer_dir, check=True)
        subprocess.run([npm, "run", "build"], cwd=viewer_dir, check=True)
    except subprocess.CalledProcessError as e:
        print(
            "Error: Failed to build odex.viewer frontend. Make sure that node.js and npm are installed properly.",
            e,
        )
        sys.exit(1)
    except FileNotFoundError as e:
        print(
            "Error: Failed to build odex.viewer frontend. Please install Node.js to build the frontend.",
            e,
        )
        sys.exit(1)


def copy_frontent_files(viewer_dir: Path, server_dir: Path):
    shutil.copytree(
        (viewer_dir / "out").resolve(),
        (server_dir / "diag_server" / "openapi_server" / "frontend").resolve(),
        dirs_exist_ok=True,
    )

    print(f"All frontend files copied from {viewer_dir} to {server_dir}")


if __name__ == "__main__":
    server_dir = Path(os.path.abspath(__file__)).resolve().parent.parent
    viewer_dir = (server_dir.parent / "viewer").resolve()

    build_frontend(str(viewer_dir))
    copy_frontent_files(viewer_dir, server_dir)
