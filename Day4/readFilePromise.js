const fs = require('fs');

function readFilePromise(filename) {
    return new Promise((resolve, reject) => {//Promise là 1 class - đang tạo đối tượng (Object) từ 1 class - có 2 tham số resolve và reject
        //resolve và reject là 2 hàm khác
        fs.readFile(filename, (err, data) => {
            if (err) {
                reject(err); //truyền lỗi vào hàm reject
            }
            else {
                resolve(data.toString());//truyền data vào hàm resolve dể đọc
            }
        })
    })
}
console.log('Begin. ')

readFilePromise('data1.txt')
    .then((data) => console.log(data))
    .catch((err) => console.log(err))

readFilePromise('data2.txt')
    .then((data) => console.log(data))
    .catch((err) => console.log(err))

console.log('Done. ')