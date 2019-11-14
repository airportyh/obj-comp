const { compare } = require("./obj-comp");

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
