const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const chatPeer = new Peer(undefined,{
    host:'/',
    port:'3001'
});
const chatVideo = document.createElement('video');
chatVideo.muted = true;

const peers={};
navigator.mediaDevices.getUserMedia({video:true,audio:true}).then((stream)=>{
    addVidStream(chatVideo,stream);
    chatPeer.on('call',(call)=>{
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream',userVidStream=>{
            addVidStream(video,userVidStream);
        });
    });
    socket.on('user-connected',userId=>{
        addUser(userId,stream);
    });
});

socket.on('user-disconnected',userId=>{
    if(peers[userId]) peers[userId].close();
});

chatPeer.on('open',id=>{
    socket.emit('join-room',ROOM_ID,id);
});


const addUser=(userId,stream)=>{
    const call = chatPeer.call(userId,stream);
    const video = document.createElement('video');
    call.on('stream',userVidStream=>{
        addVidStream(video,userVidStream);
    });
    call.on('close',()=>{
        video.remove();
    });

    peers[userId]=call;
};

const addVidStream =(video,stream)=>{
    video.srcObject = stream;
    video.addEventListener('loadedmetadata',()=>{
        video.play();
    });

    videoGrid.append(video);
};

