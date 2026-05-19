const EventEmiter = require('events');

const myEmitter = new EventEmiter();


//đăng kí listen event
myEmitter.on('greeting', (name) =>{
    console.log('Welcom
        e ' + name);
});

//phát event

myEmitter.emit('greeting', 'MAnh');