# SPDX-License-Identifier: AGPL-3.0-only
from __future__ import annotations

from pathlib import Path

# Define list of excluded files, i.e., the ones which are manually adapted and therefore will not be generated, for each folder in a dict
excluded_files = {
    "controllers": set(),
    "models": {
        "compu_rational_coeffs_numerators_inner.py",
        "special_data_group_values_inner.py",
        "limit_value.py",
        "comparam_instance_value_any_of_inner.py",
        "comparam_instance_value.py",
        "function_node_group.py",
    },
}


def delete_files(folder: Path, excluded_filenames: set[str] | None = None) -> tuple[int, int]:
    excluded_filenames = excluded_filenames or set()
    deleted = 0
    skipped = 0

    if not folder.exists():
        print(f"Folder not found: {folder}")
        return deleted, skipped

    for item in folder.rglob("*"):
        if item.is_file():
            if item.name in excluded_filenames:
                skipped += 1
                continue
            item.unlink()
            deleted += 1

    return deleted, skipped


server_root = Path(__file__).resolve().parents[1]
controllers_dir = server_root / "diag_server" / "openapi_server" / "controllers"
models_dir = server_root / "diag_server" / "openapi_server" / "models"

deleted_controllers, skipped_controllers = delete_files(
    controllers_dir, excluded_files.get("controllers", set())
)
deleted_models, skipped_models = delete_files(models_dir, excluded_files.get("models", set()))

print(
    f"Controllers: deleted={deleted_controllers}, skipped={skipped_controllers}\n"
    f"Models: deleted={deleted_models}, skipped={skipped_models}"
)
