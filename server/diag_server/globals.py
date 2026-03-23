# SPDX-License-Identifier: AGPL-3.0-only
import logging

from diag_server import const

logging.basicConfig(
    format="%(asctime)s [%(name)s]: %(levelname)s : %(message)s", level=logging.INFO
)

# restrict third-party loggers
logging.getLogger("odxtools").setLevel(level=logging.WARNING)
logging.getLogger("connexion").setLevel(level=logging.WARNING)

# configuration of 'diag-data-server' logger
logger = logging.getLogger("diag-data-server")
logger.setLevel(level=const.DIAG_SERVER_LOG_LEVEL)
