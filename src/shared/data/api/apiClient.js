const rawApiBaseUrl =
    String(
        import.meta.env
            .VITE_API_BASE_URL ??
        "/api"
    ).trim();

const API_BASE_URL =
    rawApiBaseUrl.replace(
        /\/+$/,
        ""
    );

function createApiUrl(path) {
    const normalizedPath =
        String(path ?? "");

    if (
        normalizedPath.startsWith(
            "http://"
        ) ||
        normalizedPath.startsWith(
            "https://"
        )
    ) {
        return normalizedPath;
    }

    const pathWithSlash =
        normalizedPath.startsWith("/")
            ? normalizedPath
            : `/${normalizedPath}`;

    return `${API_BASE_URL}${pathWithSlash}`;
}

async function parseResponseBody(
    response
) {
    if (
        response.status === 204 ||
        response.status === 205
    ) {
        return null;
    }

    const contentType =
        response.headers.get(
            "content-type"
        ) ?? "";

    if (
        contentType.includes(
            "application/json"
        )
    ) {
        try {
            return await response.json();
        } catch {
            return null;
        }
    }

    try {
        return await response.text();
    } catch {
        return null;
    }
}

function getErrorMessage(
    response,
    payload
) {
    if (
        payload &&
        typeof payload === "object"
    ) {
        return (
            payload.message ??
            payload.error ??
            `API-Anfrage fehlgeschlagen: ${response.status}`
        );
    }

    if (
        typeof payload === "string" &&
        payload.trim()
    ) {
        return payload.trim();
    }

    return `API-Anfrage fehlgeschlagen: ${response.status} ${response.statusText}`;
}

export async function apiRequest(
    path,
    {
        method = "GET",
        body,
        headers = {},
        signal
    } = {}
) {
    const requestHeaders = {
        Accept:
            "application/json",
        ...headers
    };

    let requestBody = body;

    const isFormData =
        typeof FormData !==
            "undefined" &&
        body instanceof FormData;

    const isBlob =
        typeof Blob !==
            "undefined" &&
        body instanceof Blob;

    if (
        body !== undefined &&
        body !== null &&
        !isFormData &&
        !isBlob &&
        typeof body !== "string"
    ) {
        requestHeaders[
            "Content-Type"
        ] =
            requestHeaders[
                "Content-Type"
            ] ??
            "application/json";

        requestBody =
            JSON.stringify(body);
    }

    let response;

    try {
        response =
            await globalThis.fetch(
                createApiUrl(path),
                {
                    method,
                    body: requestBody,
                    headers:
                        requestHeaders,
                    signal,
                    credentials:
                        "include"
                }
            );
    } catch (error) {
        if (
            error?.name ===
            "AbortError"
        ) {
            throw error;
        }

        throw new Error(
            "Die Nexus-API ist derzeit nicht erreichbar."
        );
    }

    const payload =
        await parseResponseBody(
            response
        );

    if (!response.ok) {
        const apiError =
            new Error(
                getErrorMessage(
                    response,
                    payload
                )
            );

        apiError.status =
            response.status;

        apiError.payload =
            payload;

        throw apiError;
    }

    return payload;
}

export function apiGet(
    path,
    options = {}
) {
    return apiRequest(
        path,
        {
            ...options,
            method: "GET"
        }
    );
}

export function apiPost(
    path,
    body,
    options = {}
) {
    return apiRequest(
        path,
        {
            ...options,
            method: "POST",
            body
        }
    );
}

export function apiPut(
    path,
    body,
    options = {}
) {
    return apiRequest(
        path,
        {
            ...options,
            method: "PUT",
            body
        }
    );
}

export function apiPatch(
    path,
    body,
    options = {}
) {
    return apiRequest(
        path,
        {
            ...options,
            method: "PATCH",
            body
        }
    );
}

export function apiDelete(
    path,
    options = {}
) {
    return apiRequest(
        path,
        {
            ...options,
            method: "DELETE"
        }
    );
}