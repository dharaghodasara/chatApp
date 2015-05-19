$(function(){
   var socket = io.connect(),
       $chats = $('#chats'),
       $messageform = $("#message-form"),
       $messageinput = $("#message"),
       $nameform = $("#name-form"),
       $name = $("#name"),
       $nameerror =$("#nameError"),
       $users = $("#users");       
   
   $nameform.submit(function(e){
       e.preventDefault();
       socket.emit('new user',$name.val(),function(data){
           if(data){
               $('#nameWrap').hide();
               $('#contentWrap').show();
           }else{
               $nameerror.html("username is already exists.Try again.");
           }
       });
       $name.val();
   });
   
   $messageform.submit(function(e){
       e.preventDefault();       
       socket.emit('send message',$messageinput.val(),function(data){           
            $chats.append("<span class='error'><b>" + data + "</span><br/>");
       });
       
       $messageinput.val("");
   });
   
    socket.on('usernames', function(data) {
        var html = "";
        for (var i = 0; i < data.length; i++) {
            html += data[i] + "<br/>";
        }
        $users.html(html);
    });
   
   socket.on('new message',function(data){       
       $chats.append("<span><b>" + data.name + " : </b>" + data.msg + "</span><br/>");
   });
   
   socket.on('whisper',function(data){       
       $chats.append("<span class='whisper'><b>" + data.name + " : </b>" + data.msg + "</span><br/>");
   });
   
   socket.on('old messages',function(docs){
       for(var i=docs.length-1;i>=0;i--)
        $chats.append("<span><b>" + docs[i].name + " : </b>" + docs[i].message + "</span><br/>");
   });
});