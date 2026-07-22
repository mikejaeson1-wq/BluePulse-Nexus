import {
    getPageRepository
} from "@shared/data/repositories";

import {
    removePageNavigation,
    synchronizePageNavigation
} from "@shared/navigation/pageNavigationSync";

const repository =
    getPageRepository();

async function synchronizeMutation(
    page,
    operation
) {
    if (!page?.id) {
        return page;
    }

    try {
        await synchronizePageNavigation(
            page
        );
    } catch (
        synchronizationError
    ) {
        console.error(
            `Die Navigation konnte nach „${operation}“ nicht synchronisiert werden.`,
            synchronizationError
        );
    }

    return page;
}

async function removeNavigationAfterMutation(
    pageId,
    operation
) {
    try {
        await removePageNavigation(
            pageId
        );
    } catch (
        synchronizationError
    ) {
        console.error(
            `Der Navigationspunkt konnte nach „${operation}“ nicht entfernt werden.`,
            synchronizationError
        );
    }
}

export function getPages() {
    const snapshot =
        repository.getSnapshot?.();

    return Array.isArray(
        snapshot
    )
        ? snapshot
        : [];
}

export function refreshPages(
    options = {}
) {
    return repository.getAll(
        options
    );
}

export function getPage(
    id
) {
    if (
        repository.mode ===
        "api"
    ) {
        return repository.getById(
            id
        );
    }

    const snapshot =
        repository
            .getByIdSnapshot?.(
                id
            );

    if (
        snapshot !==
            null &&
        snapshot !==
            undefined
    ) {
        return snapshot;
    }

    return repository.getById(
        id
    );
}

export function getPageById(
    id
) {
    return getPage(
        id
    );
}

export function getPageBySlug(
    slug
) {
    if (
        repository.mode ===
        "api"
    ) {
        return repository.getBySlug(
            slug
        );
    }

    const snapshot =
        repository
            .getBySlugSnapshot?.(
                slug
            );

    if (
        snapshot !==
            null &&
        snapshot !==
            undefined
    ) {
        return snapshot;
    }

    return repository.getBySlug(
        slug
    );
}

export function getPublishedPageBySlug(
    slug
) {
    if (
        repository.mode ===
        "api"
    ) {
        return repository
            .getPublishedBySlug(
                slug
            );
    }

    const snapshot =
        repository
            .getPublishedBySlugSnapshot?.(
                slug
            );

    if (
        snapshot !==
            null &&
        snapshot !==
            undefined
    ) {
        return snapshot;
    }

    return repository
        .getPublishedBySlug(
            slug
        );
}

export function generateSlug(
    value
) {
    return repository.generateSlug(
        value
    );
}

export function isSlugAvailable(
    slug,
    excludedPageId = null
) {
    return repository.isSlugAvailable(
        slug,
        excludedPageId
    );
}

export async function createPage(
    data
) {
    const page =
        await repository.create(
            data
        );

    return synchronizeMutation(
        page,
        "Seite erstellen"
    );
}

export async function updatePage(
    id,
    data
) {
    const page =
        await repository.update(
            id,
            data
        );

    return synchronizeMutation(
        page,
        "Seite speichern"
    );
}

export async function savePage(
    pageOrId,
    data
) {
    const page =
        await repository.save(
            pageOrId,
            data
        );

    return synchronizeMutation(
        page,
        "Seite speichern"
    );
}

export async function deletePage(
    id
) {
    const result =
        await repository.remove(
            id
        );

    await removeNavigationAfterMutation(
        id,
        "Seite löschen"
    );

    return result;
}

export function removePage(
    id
) {
    return deletePage(
        id
    );
}

export async function publishPage(
    id,
    data = {}
) {
    const page =
        await repository.publish(
            id,
            data
        );

    return synchronizeMutation(
        page,
        "Seite veröffentlichen"
    );
}

export async function unpublishPage(
    id,
    data = {}
) {
    const page =
        await repository.unpublish(
            id,
            data
        );

    return synchronizeMutation(
        page,
        "Veröffentlichung aufheben"
    );
}

export function duplicatePage(
    id
) {
    return repository.duplicate(
        id
    );
}

export function getPageVersions(
    id
) {
    if (
        typeof repository
            .getVersions !==
        "function"
    ) {
        return Promise.resolve(
            []
        );
    }

    return repository.getVersions(
        id
    );
}

export async function restorePageVersion(
    id,
    versionNumber
) {
    if (
        typeof repository
            .restoreVersion !==
        "function"
    ) {
        throw new Error(
            "Die Versionswiederherstellung ist nur im API-Modus verfügbar."
        );
    }

    const page =
        await repository.restoreVersion(
            id,
            versionNumber
        );

    return synchronizeMutation(
        page,
        "Seitenversion wiederherstellen"
    );
}

export function subscribeToPages(
    listener
) {
    return repository.subscribe(
        listener
    );
}