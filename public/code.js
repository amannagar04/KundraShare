(function(){
    let receiverID;
    const socket = io();

    function generateID(){
        return `${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}`;
    }

    document.querySelector("#sender-start-con-btn").addEventListener("click", function(){
        let joinID = generateID();
        document.querySelector("#join-id").innerHTML = `
            <b>Room ID</b>
            <span>${joinID}</span>
        `;
        socket.emit("sender-join", {
            uid: joinID
        });
    });

    socket.on("init", function(uid){
        receiverID = uid;
        document.querySelector(".join-screen").classList.remove("active");
        document.querySelector(".fs-screen").classList.add("active");
    });

    let fileData = {};

    document.querySelector("#file-input").addEventListener("change", function(e){
        let file = e.target.files[0];
        if(!file) return;

        let reader = new FileReader();
        reader.onload = function(e){
            let buffer = new Uint8Array(reader.result);
            let el = document.createElement("div");
            el.classList.add("item");
            el.innerHTML = `
                <div class="progress">0%</div>
                <div class="filename">${file.name}</div>
            `;
            document.querySelector(".files-list").appendChild(el);

            fileData = {
                metadata: {
                    filename: file.name,
                    total_buffer_size: buffer.length,
                    buffer_size: 1024
                },
                buffer,
                progress_node: el.querySelector(".progress")
            };

            socket.emit("file-meta", {
                uid: receiverID,
                metadata: fileData.metadata
            });
        };
        reader.readAsArrayBuffer(file);
    });

    socket.on("fs-share", function(){
        let chunk = fileData.buffer.slice(0, fileData.metadata.buffer_size);
        fileData.buffer = fileData.buffer.slice(fileData.metadata.buffer_size);

        let sent = fileData.metadata.total_buffer_size - fileData.buffer.length;
        fileData.progress_node.innerText = Math.trunc((sent / fileData.metadata.total_buffer_size) * 100) + "%";

        if (chunk.length > 0) {
            socket.emit("file-raw", {
                uid: receiverID,
                buffer: chunk
            });
        }
    });

})();
