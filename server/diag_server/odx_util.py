# SPDX-License-Identifier: AGPL-3.0-only
from typing import cast

from odxtools.database import Database
from odxtools.diagservice import DiagService
from odxtools.parameters.codedconstparameter import CodedConstParameter

from diag_server import const


class DatabaseWithID(Database):
    """
    Subclass of the ODX Database class, which allows to store the perma_id of the database as an attribute of the object.
    This avoids storing the perma_id separately and allows easy access from any place where the database object is available.
    """

    def __init__(self, *, use_weakrefs: bool = True) -> None:
        super().__init__(use_weakrefs=use_weakrefs)
        self._odex_perma_id = ""

    @property
    def odex_perma_id(self) -> str:
        return self._odex_perma_id

    @odex_perma_id.setter
    def odex_perma_id(self, value: str) -> None:
        self._odex_perma_id = value


def get_uds_object_id(service: DiagService) -> int:
    """
    Returns the underling identifier of the data record (DID), routine or input-output-control for which the given
    ODX diagnostic service is defined.
    :param service: The diagnostic service to extract an object ID from.
    :return: The object ID underlying to the given diagnostic service.
    """
    if service.request is not None and len(service.request.parameters):
        for param in service.request.parameters:
            if param.semantic == "ID" and isinstance(param, CodedConstParameter):
                return cast(int, param.coded_value)

    return -1


def get_uds_service_id(service: DiagService) -> int:
    """
    Returns the underling UDS service identifier specified for the given ODX diagnostic service.
    :param service: The diagnostic service to extract an service ID from.
    :return: The service ID underlying to the given diagnostic service.
    """
    if service.request is not None and len(service.request.parameters):
        for param in service.request.parameters:
            if param.semantic == "SERVICE-ID" and isinstance(param, CodedConstParameter):
                return cast(int, param.coded_value)

    raise ValueError(f"Service {service} does not have a SERVICE-ID")


def get_uds_service_name(uds_service_id: int) -> str:
    service_name = "NON_RESOLVEABLE"
    if uds_service_id in const.UDS_SERVICE_MAPPINGS:
        service_name = const.UDS_SERVICE_MAPPINGS.get(uds_service_id, service_name)
    return service_name
