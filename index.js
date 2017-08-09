var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = [];

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
})

io.on('connection', function(socket) {
    console.log('a user connected');
    
    socket.on('disconnect', function() {
        var pos = users.indexOf(socket.nickName);
        users.splice(pos,1);
        socket.broadcast.emit('leave', 'system: ' + socket.nickName + ' leave', users)
    })
    socket.on('chat message', function(msg) {
        console.log(msg + socket.nickName);
        io.emit('chat message', socket.nickName + ': ' + msg);
    })
    socket.on('print name', function(nickName) {
        console.log(users);
        if(isReapt(nickName)) {
            io.emit('repeat', '昵称重复');
        }else {
            socket.nickName = nickName;
            users.push(nickName)
            io.emit('join', 'system: ' + nickName + ' join', users);
            socket.emit('login');
        }
    })
    socket.on('img', function (data) {
        io.emit('upload', data, socket.nickName);
    })
})

function isReapt(nickName) {
    for(var i in users){
        if(nickName === users[i]){
            return true
        }
    }
    return false;
}



http.listen(3000, function() {
    console.log('running')
})