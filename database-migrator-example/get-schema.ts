const pgp = require('pg-promise')({});
import * as util from "util";

export async function getSchema(db: any): Promise<any> {
    const tables = await db.any(`select * from information_schema.tables where table_schema = 'public';`);
    const tableNames = tables.map(table => table.table_name);
    const allColumns = await db.any(`select * from information_schema.columns where table_schema = 'public';`);
    //console.log(allColumns);
    const constraints = await db.any(`select * from information_schema.constraint_column_usage where table_schema = 'public';`)
    //console.log("constraints", constraints);
    const typeAliases = {
        'integer': 'int',
        'character varying': 'string'
    };
    const tableDefs = tableNames.reduce((defs, tableName) => {
        const primaryKeyConstraint = constraints
            .filter((constraint) => constraint.table_name === tableName)[0];
        const fields = allColumns
            .filter((column) => column.table_name === tableName)
            .reduce((fields, column) => {
                const type = typeAliases[column.data_type] || column.data_type;
                const required = column.is_nullable === "NO";
                const fieldDef: any = {
                    type,
                    required
                };
                if (column.character_maximum_length) {
                    fieldDef.max_length = column.character_maximum_length;
                }
                if (primaryKeyConstraint && primaryKeyConstraint.column_name === column.column_name) {
                    fieldDef.primary_key = true;
                    delete fieldDef.required;
                }
                fields[column.column_name] = fieldDef;
                return fields;
            }, {});
        defs[tableName] = {
            fields
        };
        return defs;
    }, {});

    // add description
    for (let tableName in tableDefs) {
        const result = await db.one(`SELECT pg_catalog.obj_description('${tableName}'::regclass, 'pg_class');`);
        tableDefs[tableName].description = result.obj_description;
    }
    return tableDefs;
}

async function main() {
    const db = pgp('postgres://localhost:5432/play_db');
    const tableDefs = await getSchema(db);
    console.log(util.inspect(tableDefs, { depth: 10 }));

    process.exit();
}

//main().catch(err => console.log(err.stack));