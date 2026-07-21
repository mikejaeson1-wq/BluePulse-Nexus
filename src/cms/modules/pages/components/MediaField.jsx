import "./MediaField.css";

import {
    useState
} from "react";

import Button from "@shared/ui/Button";

import MediaPicker from "@cms/modules/media/components/MediaPicker";

import useMediaAsset from "@shared/hooks/useMediaAsset";

import {
    isImageAsset
} from "@shared/media/mediaService";

export default function MediaField({
    value = "",
    onChange
}) {
    const [
        pickerOpen,
        setPickerOpen
    ] = useState(false);

    const {
        asset,
        url,
        loading,
        error
    } = useMediaAsset(value);

    const hasImage =
        Boolean(
            asset &&
            url &&
            isImageAsset(asset)
        );

    function selectImage(reference) {
        onChange(reference);
    }

    function clearImage() {
        onChange("");
    }

    return (
        <div className="cms-media-field">
            <div className="cms-media-field__preview">
                {
                    loading && (
                        <div className="cms-media-field__placeholder">
                            Bild wird geladen …
                        </div>
                    )
                }

                {
                    !loading &&
                    hasImage && (
                        <img
                            src={url}
                            alt={
                                asset.altText ||
                                asset.name
                            }
                        />
                    )
                }

                {
                    !loading &&
                    !hasImage && (
                        <div className="cms-media-field__placeholder">
                            <i
                                className="bi bi-image"
                                aria-hidden="true"
                            />

                            <span>
                                Noch kein Bild ausgewählt
                            </span>
                        </div>
                    )
                }
            </div>

            {
                error && (
                    <small className="cms-media-field__error">
                        {error}
                    </small>
                )
            }

            {
                value && (
                    <code className="cms-media-field__reference">
                        {value}
                    </code>
                )
            }

            <div className="cms-media-field__actions">
                <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                        setPickerOpen(true)
                    }
                >
                    Bild auswählen
                </Button>

                {
                    value && (
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={clearImage}
                        >
                            Bild entfernen
                        </Button>
                    )
                }
            </div>

            {
                pickerOpen && (
                    <MediaPicker
                        open
                        value={value}
                        onSelect={
                            selectImage
                        }
                        onClose={() =>
                            setPickerOpen(false)
                        }
                    />
                )
            }
        </div>
    );
}