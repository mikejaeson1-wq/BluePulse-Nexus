import {
    getPageRepository
} from "@shared/data/repositories";

const repository =
    getPageRepository();

export function getPages() {
    const snapshot =
        repository.getSnapshot?.();

    if (snapshot !== null &&
        snapshot !== undefined) {
        return snapshot;
    }

    return repository.getAll();
}

export function getPage(id) {
    const snapshot =
        repository.getByIdSnapshot?.(
            id
        );

    if (snapshot !== null &&
        snapshot !== undefined) {
        return snapshot;
    }

    return repository.getById(
        id
    );
}

export function getPageById(id) {
    return getPage(id);
}

export function getPageBySlug(
    slug
) {
    const snapshot =
        repository.getBySlugSnapshot?.(
            slug
        );

    if (snapshot !== null &&
        snapshot !== undefined) {
        return snapshot;
    }

    return repository.getBySlug(
        slug
    );
}

export function getPublishedPageBySlug(
    slug
) {
    const snapshot =
        repository
            .getPublishedBySlugSnapshot?.(
                slug
            );

    if (snapshot !== null &&
        snapshot !== undefined) {
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

export function createPage(
    data
) {
    return repository.create(
        data
    );
}

export function updatePage(
    id,
    data
) {
    return repository.update(
        id,
        data
    );
}

export function savePage(
    pageOrId,
    data
) {
    return repository.save(
        pageOrId,
        data
    );
}

export function deletePage(id) {
    return repository.remove(
        id
    );
}

export function removePage(id) {
    return deletePage(id);
}

export function publishPage(
    id,
    data = {}
) {
    return repository.publish(
        id,
        data
    );
}

export function unpublishPage(
    id,
    data = {}
) {
    return repository.unpublish(
        id,
        data
    );
}

export function duplicatePage(id) {
    return repository.duplicate(
        id
    );
}

export function subscribeToPages(
    listener
) {
    return repository.subscribe(
        listener
    );
}