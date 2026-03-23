# SPDX-License-Identifier: AGPL-3.0-only
import glob
from pathlib import Path

import requests
from requests.adapters import HTTPAdapter

s = requests.Session()
s.mount("http://localhost:8080", HTTPAdapter(max_retries=5))

# Load and upload all pdx files from pdx-input folder
search_str = "".join(["server/pdx-input", "/*.pdx"])
pdx_files = glob.glob(search_str)

for pdx_file in pdx_files:
    path_obj = Path(pdx_file)
    pdx_upload_files = {
        "file_content": (
            path_obj.name,
            path_obj.read_bytes(),
            "application/octet-stream",
        )
    }
    pdx_upload_data = {"name": path_obj.name}

    try:
        response = s.post(
            "http://localhost:8080/v1/diagnostic-data/PDX",
            data=pdx_upload_data,
            files=pdx_upload_files,
            timeout=5,
        )

        if response.status_code == 201:
            json_payload = response.json()
            assert json_payload
            assert "id" in json_payload

            print(
                f"Uploaded {path_obj.name} file was loaded. Access via database-id: {json_payload['id']}"
            )
        elif response.status_code >= 400:
            print(
                f"While uploading {path_obj.name} file something went wrong. Details: {response.text}"
            )
    except Exception as ex:
        print(ex)
