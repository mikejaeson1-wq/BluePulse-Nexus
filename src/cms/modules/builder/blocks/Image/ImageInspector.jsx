import "./ImageInspector.css";

import ImageProperties from "./Properties";
import ImageShapeEditor from "./ImageShapeEditor";

export default function ImageInspector(
    props
) {
    return (
        <div className="builder-image-inspector">
            <ImageProperties
                {...props}
            />

            <ImageShapeEditor
                {...props}
            />
        </div>
    );
}