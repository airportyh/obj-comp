import { getSchema } from "./get-schema";
import * as fs from "fs";
import { compare } from "../obj-comp";

const pgp = require('pg-promise')({});

async function main() {
    const db = pgp('postgres://localhost:5432/play_db');
    const schemaV2 = JSON.parse(fs.readFileSync("./example/schema-v2.json").toString());
    const schema = await getSchema(db);
    const result = compare(schema, schemaV2);
    console.log(result);
    process.exit();
}

main().catch(err => console.log(err.message));
