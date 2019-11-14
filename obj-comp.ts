import isObject from "lodash/isObject";
import difference from "lodash/difference";
import intersection from "lodash/intersection";

export type Difference = Addition | Deletion | Replacement;

type Addition = {
    type: "addition",
    path: string[],
    value: any
};

type Deletion = {
    type: "deletion",
    path: string[],
};

type Replacement = {
    type: "replacement",
    path: string[],
    oldValue: any,
    newValue: any
};

export function compare(source: any, destination: any): Difference[] {
    return compareAt([], source, destination);
}

function compareAt(path: string[], source: any, destination: any): Difference[] {
    if (isObject(source) && isObject(destination)) {
        return compareObjectsAt(path, source, destination);
    } else {
        if (source === destination) {
            return [];
        } else {
            return [
                {
                    type: "replacement",
                    path: path,
                    oldValue: source,
                    newValue: destination
                }
            ];
        }
    }
}

function compareObjectsAt(path: string[], source: any, destination: any): Difference[] {
    const sourceKeys = Object.keys(source);
    const destinationKeys = Object.keys(destination);
    const sourceOnlyKeys = difference(sourceKeys, destinationKeys);
    const commonKeys = intersection(sourceKeys, destinationKeys);
    const destinationOnlyKeys = difference(destinationKeys, sourceKeys);
    const additions = destinationOnlyKeys.map((key) => ({
        type: "addition",
        path: [...path, key],
        value: destination[key]
    }));
    const removals = sourceOnlyKeys.map((key) => ({
        type: "deletion",
        path: [...path, key]
    }));
    const commonKeysComparisonNeeded = commonKeys
        .filter((key) =>
            source[key] !== destination[key]);

    const childDiffs = commonKeysComparisonNeeded
        .reduce((diffs, key) => {
            const result = compareAt([...path, key], source[key], destination[key]);
            return [
                ...result,
                ...diffs
            ];
        }, []);
    return [
        ...additions,
        ...removals,
        ...childDiffs
    ];
}
