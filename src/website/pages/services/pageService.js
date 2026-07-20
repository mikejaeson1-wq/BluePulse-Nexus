let pages = [];

export function getPages() {

    return [...pages];

}

export function getPage(id) {

    return pages.find(

        page => page.id === id

    );

}

export function generateSlug(title) {

    return title

        .toLowerCase()

        .trim()

        .replace(/ä/g, "ae")
        .replace(/ö/g, "oe")
        .replace(/ü/g, "ue")
        .replace(/ß/g, "ss")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

}

export function createPage(data) {

    const page = {

        id: crypto.randomUUID(),

        title: data.title,

        slug: generateSlug(data.title),

        template: data.template,

        status: "Entwurf",

        createdAt: new Date(),

        updatedAt: new Date()

    };

    pages.push(page);

    return page;

}

export function updatePage(id, data) {

    pages = pages.map(page => {

        if (page.id !== id) {

            return page;

        }

        return {

            ...page,

            ...data,

            updatedAt: new Date()

        };

    });

}

export function deletePage(id) {

    pages = pages.filter(

        page => page.id !== id

    );

}