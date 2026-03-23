# SPDX-License-Identifier: AGPL-3.0-only
from connexion.lifecycle import ConnexionRequest, ConnexionResponse

from diag_server.openapi_server.api_jsonifier import APIJsonifier
from diag_server.openapi_server.models.json_problem import JsonProblem

MESSAGE_400_BAD_REQUEST = "The request from the client was invalid or could not be served."
MESSAGE_401_UNAUTHORIZED = (
    "The access to the requested resource requires prior authentication. Either no "
    "authentication has been performed or the provided authentication is not"
    " valid (expired, malformed, incorrect credentials)."
)
MESSAGE_403_FORBIDDEN = "The access to the requested resource is forbidden."
MESSAGE_404_NOT_FOUND = "The requested resource could not be found."
MESSAGE_405_METHOD_NOT_ALLOWED = "The HTTP method is not supported by the target resource."
MESSAGE_406_NOT_ACCEPTABLE = "The requested resource representation is not supported."
MESSAGE_409_CONFLICT = (
    "The request could not be completed due to a conflict with the current state of the target "
    "resource. "
)
MESSAGE_415_UNSUPPORTED_MEDIA_TYPE = (
    "The request could not be serviced because the payload is in a format not "
    "supported by this method on the target resource. "
)
MESSAGE_500_INTERNAL_SERVER_ERROR = "An internal server error occurred."
MESSAGE_501_NOT_IMPLEMENTED = "The functionality to fulfill the request is not supported."
MESSAGE_502_BAD_GATEWAY = "The response received from an inbound server is invalid."
MESSAGE_503_SERVICE_UNAVAILABLE = "The server is currently unable to handle the request."
MESSAGE_504_GATEWAY_TIMEOUT = "No response received from upstream server in a given amount of time."

api_jsonifier = APIJsonifier()  # type: ignore[no-untyped-call]


def wrap_error_details(exception: Exception | str | None = None) -> str | None:
    if exception is not None:
        if isinstance(exception, Exception):
            return str(exception)
        return exception
    return None


def default204() -> ConnexionResponse:
    return ConnexionResponse(status_code=204, body=None)


def default400(
    request: ConnexionRequest | None = None, exception: Exception | str | None = None
) -> ConnexionResponse:
    error = JsonProblem(
        type="/problem/request",
        title="The request is invalid or incomplete",
        status=400,
        detail=MESSAGE_400_BAD_REQUEST,
        instance="/problem/request#bad-format",
        exception=wrap_error_details(exception),
    )

    return ConnexionResponse(
        status_code=400,
        body=api_jsonifier.dumps(data=error),
        content_type="application/problem+json",
    )


def default401(exception: Exception | str | None = None) -> ConnexionResponse:
    error = JsonProblem(
        type="/problem/authentication",
        title="The client is not authenticated",
        status=401,
        detail=MESSAGE_401_UNAUTHORIZED,
        exception=wrap_error_details(exception),
    )
    return ConnexionResponse(
        status_code=401,
        body=api_jsonifier.dumps(data=error),
        content_type="application/problem+json",
    )


def default403(exception: Exception | str | None = None) -> ConnexionResponse:
    error = JsonProblem(
        type="/problem/authorization",
        title="The client has not the required access rights or is not authorized",
        status=403,
        detail=MESSAGE_403_FORBIDDEN,
        exception=wrap_error_details(exception),
    )
    return ConnexionResponse(
        status_code=403,
        body=api_jsonifier.dumps(data=error),
        content_type="application/problem+json",
    )


def default404(
    request: ConnexionRequest | None = None, exception: Exception | str | None = None
) -> ConnexionResponse:
    error = JsonProblem(
        type="/problem/resource",
        title="The requested resource does not exists",
        status=404,
        detail=MESSAGE_404_NOT_FOUND,
        instance="/problem/resource#not-existing",
        exception=wrap_error_details(exception),
    )
    return ConnexionResponse(
        status_code=404,
        body=api_jsonifier.dumps(data=error),
        content_type="application/problem+json",
    )


def default405(exception: Exception | str | None = None) -> ConnexionResponse:
    error = JsonProblem(
        type="/problem/resource",
        title="The HTTP method is not allowed",
        status=405,
        detail=MESSAGE_405_METHOD_NOT_ALLOWED,
        instance="/problem/resource#method-not-allowed",
        exception=wrap_error_details(exception),
    )
    return ConnexionResponse(
        status_code=405,
        body=api_jsonifier.dumps(data=error),
        content_type="application/problem+json",
    )


def default406(exception: Exception | str | None = None) -> ConnexionResponse:
    error = JsonProblem(
        type="/problem/resource",
        title="The resource representation is not supported",
        status=406,
        detail=MESSAGE_406_NOT_ACCEPTABLE,
        instance="/problem/resource#unsupported-represenation",
        exception=wrap_error_details(exception),
    )
    return ConnexionResponse(
        status_code=406,
        body=api_jsonifier.dumps(data=error),
        content_type="application/problem+json",
    )


def default409(exception: Exception | str | None = None) -> ConnexionResponse:
    error = JsonProblem(
        type="/problem/resource",
        title="The resource is locked or otherwise in use",
        status=409,
        detail=MESSAGE_409_CONFLICT,
        instance="/problem/resource#access-conflict",
        exception=wrap_error_details(exception),
    )
    return ConnexionResponse(
        status_code=409,
        body=api_jsonifier.dumps(data=error),
        content_type="application/problem+json",
    )


def default415(exception: Exception | str | None = None) -> ConnexionResponse:
    error = JsonProblem(
        type="/problem/request",
        title="The request has an unsupported representation",
        status=415,
        detail=MESSAGE_415_UNSUPPORTED_MEDIA_TYPE,
        instance="/problem/request#media-type",
        exception=wrap_error_details(exception),
    )
    return ConnexionResponse(status_code=415, body=api_jsonifier.dumps(data=error))


def default500(
    request: ConnexionRequest | None = None, exception: Exception | str | None = None
) -> ConnexionResponse:
    error = JsonProblem(
        type="/problem/server",
        title="The server had an unexpected exception",
        status=500,
        detail=MESSAGE_500_INTERNAL_SERVER_ERROR,
        instance="/problem/server#error",
        exception=wrap_error_details(exception),
    )
    return ConnexionResponse(
        status_code=500,
        body=api_jsonifier.dumps(data=error),
        content_type="application/problem+json",
    )


def default501(exception: Exception | str | None = None) -> ConnexionResponse:
    error = JsonProblem(
        type="/problem/server",
        title="The requested functionality is not implemented",
        status=501,
        detail=MESSAGE_501_NOT_IMPLEMENTED,
        instance="/problem/server#not-implemented",
        exception=wrap_error_details(exception),
    )
    return ConnexionResponse(
        status_code=501,
        body=api_jsonifier.dumps(data=error),
        content_type="application/problem+json",
    )


def default502(exception: Exception | str | None = None) -> ConnexionResponse:
    error = JsonProblem(
        type="/problem/server",
        title="The internal forwarding and request processing caused a failure",
        status=502,
        detail=MESSAGE_502_BAD_GATEWAY,
        instance="/problem/server#gateway",
        exception=wrap_error_details(exception),
    )
    return ConnexionResponse(
        status_code=502,
        body=api_jsonifier.dumps(data=error),
        content_type="application/problem+json",
    )


def default503(exception: Exception | str | None = None) -> ConnexionResponse:
    error = JsonProblem(
        type="/problem/server",
        title="The required service is unavailable",
        status=503,
        detail=MESSAGE_503_SERVICE_UNAVAILABLE,
        instance="/problem/server#no-service",
        exception=wrap_error_details(exception),
    )
    return ConnexionResponse(
        status_code=503,
        body=api_jsonifier.dumps(data=error),
        content_type="application/problem+json",
    )


def default504(exception: Exception | str | None = None) -> ConnexionResponse:
    error = JsonProblem(
        type="/problem/server",
        title="The server was not able to fulfill the request in time",
        status=504,
        detail=MESSAGE_504_GATEWAY_TIMEOUT,
        instance="/problem/server#timeout",
        exception=wrap_error_details(exception),
    )
    return ConnexionResponse(
        status_code=504,
        body=api_jsonifier.dumps(data=error),
        content_type="application/problem+json",
    )
