import "./MediaImage.css";

import useMediaAsset from "@shared/hooks/useMediaAsset";

import {
    isImageAsset,
    isMediaReference
} from "@shared/media/mediaService";

export default function MediaImage({
    reference,
    alt = "",
    className = "",
    loading = "lazy"
}) {
    const mediaResult =
        useMediaAsset(
            isMediaReference(reference)
                ? reference
                : ""
        );

    if (!reference) {
        return null;
    }

    const wrapperClassName = [
        "media-image",
        className
    ]
        .filter(Boolean)
        .join(" ");

    if (!isMediaReference(reference)) {
        return (
            <div className={wrapperClassName}>
                <img
                    src={reference}
                    alt={alt}
                    loading={loading}
                />
            </div>
        );
    }

    if (mediaResult.loading) {
        return (
            <div
                className={
                    `${wrapperClassName} media-image--loading`
                }
                aria-hidden="true"
            />
        );
    }

    if (
        !mediaResult.asset ||
        !mediaResult.url ||
        !isImageAsset(
            mediaResult.asset
        )
    ) {
        return null;
    }

    return (
        <div className={wrapperClassName}>
            <img
                src={mediaResult.url}
                alt={
                    alt ||
                    mediaResult.asset.altText ||
                    mediaResult.asset.name
                }
                loading={loading}
            />
        </div>
    );
}