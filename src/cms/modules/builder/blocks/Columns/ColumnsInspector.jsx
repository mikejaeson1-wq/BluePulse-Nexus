import ColumnAppearanceEditor from "./ColumnAppearanceEditor";
import ColumnsProperties from "./Properties";

export default function ColumnsInspector(
    props
) {
    return (
        <div className="builder-columns-inspector">
            <ColumnsProperties
                {
                    ...props
                }
            />

            <ColumnAppearanceEditor
                {
                    ...props
                }
            />
        </div>
    );
}