import { Difference } from "../obj-comp";
import * as assert from "assert";

export function generateUpdatesInSQL(diffs: Difference[]): string {
    return diffs.map(generateUpdateInSQLForDifference).join("\n\n");
}

function generateUpdateInSQLForDifference(diff: Difference): string {
    if (diff.path.length === 1) {
        if (diff.type === "addition") {
            // Add a new table
            const [tableName] = diff.path;
            const tableDefinition = diff.value;
            const description = tableDefinition.description;
            const fields = Object.keys(tableDefinition.fields);
            const fieldStatements = fields.map((field) => {
                const fieldDef = tableDefinition.fields[field];
                return "\t" + getSQLColumnDef(field, fieldDef);
            }).join(",\n");
            const createTableStatement = `CREATE TABLE ${tableName} (\n${fieldStatements}  \n);`;
            const setCommentStatement = `COMMENT ON TABLE ${tableName} IS '${description}';`
            return createTableStatement + "\n" + setCommentStatement;
        } else if (diff.type === "deletion") {
            const [tableName] = diff.path;
            return `DROP TABLE ${tableName};`;
        } else {
            throw new Error(`Operation unsupported.`);
        }
    } else if (diff.path.length === 3) {
        const [tableName, tableDefProp, fieldName] = diff.path;
        assert.equal(tableDefProp, "fields");
        switch (diff.type) {
            case 'deletion':
                return `ALTER TABLE ${tableName} DROP COLUMN ${fieldName};`;
            case 'addition':
                return `ALTER TABLE ${tableName} ADD COLUMN ${getSQLColumnDef(fieldName, diff.value)};`;
            default:
                throw new Error("Not implemented.");
        }
    } else {
        console.warn(`Unsupported database mutation:`, diff);
        return '';
    }
}

function getSQLColumnDef(field, fieldDef): string {
    const modifiers = [];
    if (fieldDef.primary_key) {
        modifiers.push("PRIMARY KEY");
    }
    if (fieldDef.unique) {
        modifiers.push("UNIQUE");
    }
    if (fieldDef.required){
        modifiers.push("NOT NULL");
    }
    const type = getSQLType(fieldDef);
    let columnDef = `${field} ${type}`;
    if (modifiers.length > 0) {
        columnDef += ` ${modifiers.join(" ")}`;
    }
    return columnDef;
}

function getSQLType(fieldDef): string {
    switch (fieldDef.type) {
        case 'int':
            return 'int';
        case 'string':
            if (fieldDef.max_length) {
                return `varchar(${fieldDef.max_length})`;
            } else {
                return 'text';
            }
        case 'date':
            return 'date';
        default:
            throw new Error(`Unknown type ${fieldDef.type}`);
    }
}
