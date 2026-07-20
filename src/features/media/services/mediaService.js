import media from "../data/media.json";

export function getMedia() {

    return media;

}

export function getImages() {

    return media.filter(

        file => file.type === "image"

    );

}