let fs = require('fs'); //fs = file system

console.log('Start....');

console.log('read file 1');
let s1 = fs.readFileSync('data1.txt');

console.log('result 1: ' + s1.toString()) //không dùng nháy ngược thì cộng chuỗi

console.log('read file 2');
let s2 = fs.readFileSync('data2.txt');

console.log('result 1: ' + s2.toString())//do readFileSync trả về buffer nên phải dùng toString
//Sync: hiện theo trình tự viết
console.log('End. ')