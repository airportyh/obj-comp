import { compare, Difference } from "./json-diff";

describe("json diff", () => {
    it("detects additional properties to object", () => {
        const source = {};
        const dest = {
            name: "John"
        };
        const result = compare(source, dest);
        expect(result).toEqual([
            {
                type: "addition",
                path: ["name"],
                value: "John"
            }
        ]);
    });

    it("detects removals of properties to object", () => {
        const source = {
            name: "John"
        };
        const dest = {};
        const result = compare(source, dest);
        expect(result).toEqual([
            {
                type: "deletion",
                path: ["name"]
            }
        ]);
    });

    it("detects replacements of property values", () => {
        const source = {
            name: "Bob"
        };
        const destination = {
            name: "Robert"
        };
        const result = compare(source, destination);
        expect(result).toEqual([
            {
                type: "replacement",
                path: ["name"],
                oldValue: "Bob",
                newValue: "Robert"
            }
        ]);
    });

    it("detects no change", () => {
        const source = {
            name: "Bob"
        };
        const destination = {
            name: "Bob"
        };
        const result = compare(source, destination);
        expect(result).toEqual([]);
    });

    it("works for multi-level changes", () => {
        const source = {
            name: {
                first: "Bob",
                last: "Sagat"
            }
        };
        const destination = {
            name: {
                first: "Bob",
                last: "Hope"
            }
        };
        const result = compare(source, destination);
        expect(result).toEqual([
            {
                type: "replacement",
                path: ["name", "last"],
                oldValue: "Sagat",
                newValue: "Hope"
            }
        ]);
    });

    it("works for a combination of changes", () => {
        const source = {
            name: {
                first: "Bob",
                last: "Sagat"
            }
        };
        const destination = {
            name: {
                first: "Robert",
                middle: "James"
            },
            age: 13
        };
        const result = compare(source, destination);
        expect(result).toEqual([
            {
                type: "addition",
                path: ["age"],
                value: 13
            },
            {
                type: "addition",
                path: ["name", "middle"],
                value: "James"
            },
            {
                type: "deletion",
                path: ["name", "last"]
            },
            {
                type: "replacement",
                path: ["name", "first"],
                oldValue: "Bob",
                newValue: "Robert"
            }
        ]);
    });

    it("can compare simple values", () => {
        expect(compare(1, 2)).toEqual([
            {
                type: "replacement",
                path: [],
                oldValue: 1,
                newValue: 2
            }
        ]);
        expect(compare(1, 1)).toEqual([]);
        expect(compare(true, true)).toEqual([]);
        expect(compare(true, 4)).toEqual([
            {
                type: "replacement",
                path: [],
                oldValue: true,
                newValue: 4
            }
        ]);
    });
});
