const express = require("express");
const path = require("path");

const app = express();
const server = require("http").createServer(app);

const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function(socket){
    socket.on("sender-join", function(data){
        socket.join(data.uid);
    });

    socket.on("receiver-join", function(data){
        socket.join(data.uid);
        socket.in(data.sender_uid).emit("init", data.uid);
    });

    socket.on("file-meta", function(data){
        socket.in(data.uid).emit("fs-meta", data.metadata);
    });

    socket.on("fs-start", function(data){
        socket.in(data.uid).emit("fs-share", {});
    });

    socket.on("file-raw", function(data){
        socket.in(data.uid).emit("fs-share", data.buffer);
    });
});



// server.listen(5000, () => {
//     console.log("Server is running on http://localhost:5000");
// });
server.listen(5000, "0.0.0.0", () => {
    console.log("Server is running on http://192.168.137.1:5000");
});

//  192.168.137.1