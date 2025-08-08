import React, { useEffect, useRef, useState } from "react";

const VideoCall = ({ socket, roomId, user }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const [callStarted, setCallStarted] = useState(false);

  const ICE_SERVERS = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    // if (!socket || !roomId || !user) return;

    socket.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.roomId !== roomId) return;

      switch (data.action) {
        case "offer":
          await handleReceiveOffer(data.payload);
          break;
        case "answer":
          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(data.payload)
          );
          break;
        case "ice-candidate":
          if (data.payload) {
            if (peerConnection.current.remoteDescription) {
              await peerConnection.current.addIceCandidate(
                new RTCIceCandidate(data.payload)
              );
            }
          }
          break;
        default:
          break;
      }
    };
  }, [socket]);

  const handleReceiveOffer = async (offer) => {
    await setupConnection({ isCaller: false });
    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(offer)
    );
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket.current.send(
      JSON.stringify({
        action: "answer",
        roomId,
        sender: user,
        payload: answer,
      })
    );
  };

  const setupConnection = async ({ isCaller }) => {
    peerConnection.current = new RTCPeerConnection(ICE_SERVERS);

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate:", event.candidate);
        socket.current.send(
          JSON.stringify({
            action: "ice-candidate",
            roomId,
            sender: user,
            payload: event.candidate,
          })
        );
      }
    };

    peerConnection.current.ontrack = (event) => {
      console.log("ontrack", event);
      const [remoteStream] = event.streams;

      // if (event.streams && event.streams[0] !== localVideoRef.current.srcObject) {
      //   remoteVideoRef.current.srcObject = event.streams[0];
      // }

      if (remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      } else {
        const newStream = new MediaStream([event.track]);
        remoteVideoRef.current.srcObject = newStream;
      }

    };

    if(isCaller){
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  }
  };

  const startCall = async () => {
    setCallStarted(true);
    await setupConnection({isCaller: true});

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.current.send(
      JSON.stringify({
        action: "offer",
        roomId,
        sender: user,
        payload: offer,
      })
    );
  };

  return (
    <div className="p-4 space-y-4">
      {!callStarted && (
        <button
          onClick={startCall}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Start Video Call
        </button>
      )}
      <div className="flex gap-4">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-1/2 rounded border"
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          controls
          className="w-1/2 rounded border"
        />
      </div>
    </div>
  );
};

export default VideoCall;
