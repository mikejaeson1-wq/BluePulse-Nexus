async function fetchTextDocument(
    path,
    {
        signal
    } = {}
) {
    const response =
        await fetch(
            path,
            {
                method:
                    "GET",

                credentials:
                    "same-origin",

                headers: {
                    Accept:
                        "text/plain, application/xml;q=0.9, */*;q=0.8"
                },

                signal
            }
        );

    if (
        !response.ok
    ) {
        throw new Error(
            `${path} konnte nicht geladen werden. HTTP ${response.status}.`
        );
    }

    return response.text();
}

export function getRobotsText(
    options
) {
    return fetchTextDocument(
        "/robots.txt",
        options
    );
}

export function getSitemapXml(
    options
) {
    return fetchTextDocument(
        "/sitemap.xml",
        options
    );
}
