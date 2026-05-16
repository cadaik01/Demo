//Demo callback function

const fs = require('fs');

function handleFile(err,data){ //err = error
    if(err){
        console.log("Read file error" + err);
        return;
    }
    console.log(data.toString());
} //Cách viết chuẩn

console.log('Start...');

console.log('Read file 1');

fs.readFile('data1.txt', handleFile)//handleFile : tham số truyền vào

console.log('Read file 2');

// fs.readFile('data2.txt',handleFile)//handleFile : tham số truyền vào 

//Callback function: đọc file và xuất ra màn hình

//readFile khác với readFileSync: bất đồng bộ thì ko có trình tự, cái nào xong trc hiện trước

//around function
fs.readFile('data2.txt',(err,data) =>{
    if(err){
        console.log("read file error: "+ err)
        return
    }
    console.log(data.toString());
})
console.log('End. ')
