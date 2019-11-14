# obj-comp

This library compares two arbitrarily nested JavaScript objects and returns
an array of differences between the objects.

## Install

```
npm install obj-comp
```

## Example

```js
const { compare } = require("obj-comp");
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
console.log(result);
```

Output:
```
[ { type: 'addition', path: [ 'age' ], value: 13 },
  { type: 'addition', path: [ 'name', 'middle' ], value: 'James' },
  { type: 'deletion', path: [ 'name', 'last' ] },
  { type: 'replacement',
    path: [ 'name', 'first' ],
    oldValue: 'Bob',
    newValue: 'Robert' } ]
```

Comparisons are performed on nested objects, as deeply nested as you want.

## Difference Objects

The return value of the `compare` function is an array of `Difference` objects.
A `Difference` object is one of three types of objects: `Addition`, `Deletion`,
and `Replacement`. The TypeScript definition of these types is as follows:

```ts
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
```

In each of the 3 types, the `path` property is a string array that gives you
a sequence of property accesses to the difference that is described. The
`type` discriminator is one of 3 strings: "addition", "deletion", and "replacement"
and it lets you differentiate the 3 types of difference objects.

## Examples:

```
{ type: 'addition', path: [ 'age' ], value: 13 }
```

Says that the destination object has an additional `age` property compared to the source, and
its value is 13.

```
{ type: 'addition', path: [ 'name', 'middle' ], value: 'James' }
```

Says that the object within the destination's `name` property has an additional `middle`
property compared to the source, and its value is "James".

```
{ type: 'deletion', path: [ 'name', 'last' ] }
```

Says that the object within the destination's `name` property has the `last` property
deleted compared to the nested object within the source object.

```
{ type: 'replacement',
  path: [ 'name', 'first' ],
  oldValue: 'Bob',
  newValue: 'Robert' }
```

Says that the object within the destination's `name` property has its `first`
property's value replaced by the value "Robert", which used to be "Bob".

## Known Limitation

This library does not currently support arrays.

## Digging Deeper

If you'd like to learn more about this library, feel free to review:

* [test.ts](test.ts)
* [the source code](obj-comp.ts)
* As an example of what you can do with this library, here is an [example database migration tool](database-migrator-example) made with `obj-comp`.
