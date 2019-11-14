import { compare, Difference } from "../json-diff";
import * as fs from "mz/fs";
import { generateUpdatesInSQL } from "./generate-updates";
import { getSchema } from "./get-schema";
const pgp = require('pg-promise')({});

async function main() {
    const source = process.argv[2];
    const destination = process.argv[3];
    if (!source || !destination) {
        console.log(`Usage: ts-node script-migration.ts <source> <destination>`);
        console.log(`Source or destination could either be a schema file written in JSON or a postgresql URL source as:`);
        console.log(`   postgres://localhost:5432/example_db`);
        return;
    }
    
    const sourceSchema = await loadSchema(source);
    const destinationSchema = await loadSchema(destination);
    
    const result = compare(sourceSchema, destinationSchema);
    console.log(generateUpdatesInSQL(result));
    process.exit();
}

async function loadSchema(identifier: string): Promise<any> {
    if (identifier.endsWith(".json")) {
        const json = (await fs.readFile(identifier)).toString();
        return JSON.parse(json);
    } else if (identifier.startsWith("postgres://")) {
        const db = pgp('postgres://localhost:5432/play_db');
        return await getSchema(db);
    }
}

main().catch(err => console.log(err.message));
