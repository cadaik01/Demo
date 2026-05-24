const fs = require('fs');

function readFilePromise(filename) {
    // Wrap fs.readFile so we can use Promise chaining.//hàm dựng promise có hai tham số, resolve, reject cũng có tham số
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.toString());
            }
        });
    });
}

console.log('Begin.');

console.log('Read file 1');
readFilePromise('data1.txt')
    .then((data) => console.log(data))
    .catch((err) => console.log(err));

console.log('Read file 2');
readFilePromise('data2.txt')
    .then((data) => console.log(data))
    .catch((err) => console.log(err));

console.log('Done');