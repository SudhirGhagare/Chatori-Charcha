import React, { use, useEffect, useRef, useState } from "react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { ImPhoneHangUp } from "react-icons/im";
import { FaVideo, FaVideoSlash } from "react-icons/fa";

const VideoCall = ({
  socket,
  roomId,
  user,
  isIncomingCall,
  pendingOffer,
  setIncomingCall,
  setShowCallUI,
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(new MediaStream());
  const peerConnection = useRef(null);
  const localStreamRef = useRef(null);
  const [callStarted, setCallStarted] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const ICE_SERVERS = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // Clean up and reset everything
  const cleanupConnection = () => {
    if (peerConnection.current) {
      peerConnection.current
        .getSenders()
        .forEach((sender) => sender.track?.stop());
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    remoteVideoRef.current = new MediaStream();
    setCallStarted(false);
  };

  useEffect(() => {

    if (isIncomingCall) {
      handleReceiveOffer(pendingOffer);
      setCallStarted(true);
      setIncomingCall(false);
      setShowCallUI(true);
    } else {
      startCall();
    }

    return () => {
      cleanupConnection();
      if (socket.current) {
        socket.current.close();
        socket.current = null;
      }
    };
  }, []);

  useEffect(() => {
    socket.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.roomId !== roomId) return;

      switch (data.action) {
        // case "offer":
        //   setIncomingCall(true);
        //   setPendingOffer(data.payload);
        //   break;
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

    return () => {
      cleanupConnection();
    };
  }, [socket]);

  useEffect(() => {
    console.log("Remote stream updated:", remoteStream);
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      console.log("Remote video stream set.", remoteVideoRef.current.srcObject);
    }
  }, [remoteStream]);

  const handleReceiveOffer = async (offer) => {
    await setupConnection();
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

  const setupConnection = async () => {

      peerConnection.current = new RTCPeerConnection(ICE_SERVERS);

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
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
      const [remoteStream] = event.streams;
      console.log("Remote stream received:", remoteStream);
      if (remoteStream) {
        setRemoteStream(remoteStream);
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;

      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  const startCall = async () => {
    setCallStarted(true);
    await setupConnection();

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

  // Toggle mic
  const toggleMic = () => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
    }
  };

  // Toggle camera
  const toggleCam = () => {
    if (!localStreamRef.current) return;
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCamOn(videoTrack.enabled);
    }
  };

  // Hang up
  const hangUp = () => {
    setIncomingCall(false);
    setShowCallUI(false);
    cleanupConnection();
    socket.current.send(
      JSON.stringify({
        action: "hangup",
        roomId,
        sender: user,
      })
    );
  };

  return (
    <div className="p-4 space-y-4">
      {/* {!callStarted && (
        <button
          onClick={startCall}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Start Video Call
        </button>
      )} */}

      {callStarted && (
        <div className="flex gap-4">
          {/* Local Video Container */}
          <div className="relative w-1/2">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded border"
            />
            {!micOn && (
              <div className="absolute top-2 right-2 bg-gray-700 text-white text-s bold px-2 py-1 rounded">
                Mic Off
              </div>
            )}
          </div>

          {/* Remote Video Container */}
          <div className="relative w-1/2">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full rounded border"
            />
          </div>
        </div>
      )}

      {callStarted && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={toggleMic}
            className={`w-12 h-12 flex items-center justify-center rounded-full  bg-[#845D1C] text-white`}
          >
            {micOn ? (
              <FaMicrophone size={20} />
            ) : (
              <FaMicrophoneSlash size={20} />
            )}
          </button>
          <button
            onClick={toggleCam}
            className={`w-12 h-12 flex items-center justify-center rounded-full bg-[#845D1C] text-white`}
          >
            {camOn ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
          </button>
          <button
            onClick={hangUp}
            className="w-12 h-12 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-700"
          >
            <ImPhoneHangUp size={20} className="flex justify-center" />
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
