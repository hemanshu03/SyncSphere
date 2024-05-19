// static/app.js
document.addEventListener('DOMContentLoaded', function () {
    const startCallBtn = document.getElementById('start-call');
    const endCallBtn = document.getElementById('end-call');
    const localVideo = document.getElementById('local-video');
    const remoteVideo = document.getElementById('remote-video');

    let localStream;
    let peerConnection;

    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }, // Example STUN server
        ],
    };

    const constraints = { video: true, audio: true };

    startCallBtn.addEventListener('click', startCall);
    endCallBtn.addEventListener('click', endCall);

    const socket = io.connect('http://' + document.domain + ':' + location.port);

    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    async function startCall() {
        try {
            localStream = await navigator.mediaDevices.getUserMedia(constraints);
            localVideo.srcObject = localStream;

            peerConnection = new RTCPeerConnection(configuration);
            localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

            peerConnection.onicecandidate = handleICECandidateEvent;
            peerConnection.ontrack = handleTrackEvent;

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            socket.emit('offer', {'offer': offer});
            
        } catch (error) {
            console.error('Error accessing media devices:', error);
        }
    }

    function endCall() {
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
            localStream.getTracks().forEach(track => track.stop());
            localVideo.srcObject = null;
            remoteVideo.srcObject = null;
        }
    }

    function handleOffer(data) {
        const remoteDescription = new RTCSessionDescription(data.offer);
        peerConnection.setRemoteDescription(remoteDescription);

        const answer = peerConnection.createAnswer();
        peerConnection.setLocalDescription(answer);

        socket.emit('answer', {'answer': answer});
    }

    function handleAnswer(data) {
        const remoteDescription = new RTCSessionDescription(data.answer);
        peerConnection.setRemoteDescription(remoteDescription);
    }

    function handleICECandidateEvent(event) {
        if (event.candidate) {
            socket.emit('ice-candidate', {'candidate': event.candidate});
        }
    }

    function handleIceCandidate(data) {
        const candidate = new RTCIceCandidate(data.candidate);
        peerConnection.addIceCandidate(candidate);
    }

    function handleTrackEvent(event) {
        remoteVideo.srcObject = event.streams[0];
    }
});
