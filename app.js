var express = require("express"),
    app = express(),
    server = require("http").createServer(app),
    io = require("socket.io").listen(server),
    mongoose = require('mongoose'),
    users = {};
 
 mongoose.connect("mongodb://localhost/chat",function(err){
     if(err)console.log(err);
     else console.log("Connected to mongodb successfully.");
 });
 
 var chatschema = mongoose.Schema({
     name: String,
     message: String,
     created: {type: Date,default:Date.now}
 });
 
 var Chat = mongoose.model('message',chatschema);
 
 app.configure(function() {   
    app.use(express.static(__dirname + '/public'));    
});
    
server.listen(3000);

app.get('/',function(req,res){
    res.sendfile(__dirname+"/index.html");
});

function updateUsersList(){        
         io.sockets.emit('usernames',Object.keys(users));            
}

io.sockets.on('connection',function(socket){
    
    var query = Chat.find({});
    query.sort('-created').limit(10).exec(function(err,docs){
        if(err) throw err;
        console.log('sent old messages');
        socket.emit('old messages',docs);
    });
    
    socket.on('new user',function(name,callback){
        //check whether user already exist or not
        if(name in users) callback(false);
        else{
            callback(true);
            socket.username = name;
            users[socket.username] = socket;
            updateUsersList();
        }          
    });  
    
    socket.on('send message',function(data,callback){
        var msg = data.trim();
        if(msg.substr(0,3)==='/w '){
            msg = msg.substr(3);
            var indexOf_space = msg.indexOf(' ');
            if(indexOf_space !== -1){
                var username = msg.substring(0,indexOf_space);
                var message = msg.substring(indexOf_space+1);
                if(username in users){
                    users[username].emit('whisper',{msg:message,name:socket.username});
                    console.log('Whisper');
                }else 
                    callback("Error! please enter valid username.");                
            }
            else
                callback('Error! please send message that you want to whisper to '+msg);
        }
        else 
            {   
                var newMsg = new Chat({message:msg,name:socket.username});
                newMsg.save(function(err){
                    if(err) throw err;
                    io.sockets.emit('new message',{msg:msg,name:socket.username});
                });
               
            };
        //send message to all except sender.
       // socket.broadcast.emit('message',data);
    });
    
    socket.on('disconnect',function(data){
        if(!socket.username)return;
        else{
            delete users[socket.username];
            updateUsersList();
        }
            
    });
    
});