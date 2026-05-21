const queryString = require ('querystring');

const qs = "name=Manh&age=20&city=HCM";

const result = queryString.parse(qs);
console.log(result.name);

const result2= queryString.parse('tag=java&tag=c#&tag=sql');
console.log(result2);

//demo stringify

const obj ={
    name: 'Manh',
    position: "Student",
    city: "Ho Chi Minh City"
}
const result3 = queryString.stringify(obj);
console.log(result3);