import {
    apiGet,
    apiPost
} from "@shared/data/api/apiClient";

import localFooterRepository from "@shared/data/repositories/local/footerRepository";
import localHomeLayoutRepository from "@shared/data/repositories/local/homeLayoutRepository";
import localPageRepository from "@shared/data/repositories/local/pageRepository";
import localSiteContentRepository from "@shared/data/repositories/local/siteContentRepository";
import localSiteNavigationRepository from "@shared/data/repositories/local/siteNavigationRepository";

import {
    getMediaAssets
} from "@shared/media/mediaService";

const MIGRATION_FORMAT =
    "bluepulse-browser-migration";

const MIGRATION_FORMAT_VERSION = 1;

function getSerializedSize(value) {
    const serializedValue =
        JSON.stringify(value);

    return new TextEncoder()
        .encode(
            serializedValue
        )
        .byteLength;
}

export async function inspectLocalBrowserData() {
    const siteContent =
        localSiteContentRepository
            .getSnapshot();

    const navigation =
        localSiteNavigationRepository
            .getSnapshot();

    const homeLayout =
        localHomeLayoutRepository
            .getSnapshot();

    const footer =
        localFooterRepository
            .getSnapshot();

    const pages =
        localPageRepository
            .getSnapshot();

    const mediaAssets =
        await getMediaAssets();

    const mediaTotalBytes =
        mediaAssets.reduce(
            (
                total,
                asset
            ) =>
                total +
                (
                    Number(
                        asset.size
                    ) || 0
                ),
            0
        );

    const snapshot = {
        format:
            MIGRATION_FORMAT,

        formatVersion:
            MIGRATION_FORMAT_VERSION,

        exportedAt:
            new Date()
                .toISOString(),

        siteContent,
        navigation,
        homeLayout,
        footer,
        pages,

        mediaSummary: {
            count:
                mediaAssets.length,

            totalBytes:
                mediaTotalBytes
        }
    };

    return {
        snapshot,

        summary: {
            siteContent:
                Object.keys(
                    siteContent
                ).length,

            pages:
                pages.length,

            publishedPages:
                pages.filter(
                    (page) =>
                        page.status ===
                        "published"
                ).length,

            draftPages:
                pages.filter(
                    (page) =>
                        page.status ===
                        "draft"
                ).length,

            mediaAssets:
                mediaAssets.length,

            mediaTotalBytes,

            payloadBytes:
                getSerializedSize(
                    snapshot
                )
        }
    };
}

export async function getApiMigrationStatus({
    signal
} = {}) {
    return apiGet(
        "/admin/migration/status",
        {
            signal
        }
    );
}

export async function migrateLocalBrowserData(
    snapshot
) {
    return apiPost(
        "/admin/migration/browser-data",
        snapshot
    );
}