const express = require('express');
const { request } = require('node:http');

const app = express();

const PORT = 3000;

//register middleware read json
app.use(express.json())

app.get('/',(req,res)=>{
    res.send("Hello")
});

app.get('/api/user', (req,res) =>{
    res.json({
        id:1,
        name: 'Manh',
        email: 'tranleminhanh123@gmail.com'
    })
})

app.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`);
})