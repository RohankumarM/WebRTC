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

var roomID = {};
var join_Room_id;

app.get('/', (req, res) => {
  res.render('createRoom');
  // res.redirect(`/${uuidv4()}`)
});

app.post('/join_room', (req, res) => {
  join_Room_id = req.body.join_room_ID;
  if(join_Room_id == roomID){
  return res.redirect(`${join_Room_id}`);
  }
  else{
    
  }
});

app.post('/',(req,res) => {
  // console.log(req.body.room_ID);
  roomID = req.body.room_ID
  return res.redirect(`/${roomID}`);

});

app.get('/:room:username', (req, res) => { 
  res.render('room', { roomId: req.params.room });
});

io.on('connection', socket => {

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);
    socket.on('message', (message) => {
      io.to(roomId).emit('createMessage', message);
    });

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
    });

  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT);