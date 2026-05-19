// const plus = require('./calc');

const {sub} = require('./calc'); //chỉ lấy đúng field trong {}

let a = 5;
let b = 10;

// let c = plus.add(a,b)

// console.log(`${a} + ${b} = ${c}`);

let d = sub(a,b)

console.log(`${a} - ${b} = ${d}`);