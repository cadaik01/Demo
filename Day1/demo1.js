console.log("Hello World!");

let a = 5; 
let b = 10;
let c = a + b; 
console.log(`the result of ${a} + ${b} = ${c}`);
// console.log(`the result of ${a} + ${b} = ${a+b}`); //interpolation: dấu nháy ngược

function add (a,b){
    return a+b;
}
c = add (a,b);
// console.log(`the result of ${a} + ${b} = ${c}`);
console.log(`the result of ${a} + ${b} = ${add(a,b)}`); //có thể gọi hàm trong ${} luôn
//bắt đầu bằng nháy gì kết thúc bằng nháy đó, ko nhất thiết là nháy đôi - đơn hay ngược. nodejs ko có khái niệm kí tự- kể cả chuỗi
