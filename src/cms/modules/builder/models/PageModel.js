export function createPage(title = "Neue Seite") {

    const now = new Date().toISOString();

    return {

        id: crypto.randomUUID(),

        title,

        slug: "startseite",

        status: "draft",

        published: false,

        createdAt: now,

        updatedAt: now,

        theme: null,

        blocks: []

    };

}