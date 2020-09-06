const express = require('express');
const app = express();
const server = require('http').Server(app);
const { v4: uuidv4 } = require('uuid');
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const bodyParser = require('body-parser');
const peerServer = ExpressPeerServer(server, {
  debug: true
})
app.use('/peerjs', peerServer);

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: false}));

var roomID;

app.get('/', (req, res) => {
  res.render('createRoom');
  // res.redirect(`/${uuidv4()}`)
});

app.post('/',(req,res) => {
  // console.log(req.body.room_ID);
  roomID = req.body.room_ID
  console.log(roomID);
  console.log(`/r/${roomID}`);
  return res.redirect(`${roomID}`);

});

app.get('/:roomId', (req, res) => {
  console.log('/r/roomID');
  res.render('room', { roomId: 123 });
});

io.on('connection', socket => {
  
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);
    socket.on('message', (message) => {
      io.to(roomId).emit('createMessage', message);
    });

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    });

  });
});

const PORT = process.env.PORT || 3000;

server.listen(3000);