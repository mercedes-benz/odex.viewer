# SPDX-License-Identifier: AGPL-3.0-only
# Manually changed file to handle "anyOf" schema definition for simple types
from typing import Union

ComparamInstanceValue = Union[str, list[str], list[dict]]
