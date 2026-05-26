const fs = require('fs');

console.log('Begin. ')

console.log('Read file 1. ')
fs.readFile('data1.txt', (err,data)=>{
    if(err){
        console.error('Read file error!')
        return;
    }
    console.log(data.toString());
});

console.log('Read file 2. ')
fs.readFile('data2.txt', (err,data)=>{
    if(err){
        console.error('Read file error!')
        return;
    }
    console.log(data.toString());
});

console.log('Done. ')