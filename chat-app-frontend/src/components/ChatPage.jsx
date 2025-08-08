import { useEffect, useRef } from "react";
import { MdAttachFile, MdSend, MdAdd, MdDelete } from "react-icons/md";
import { RiCloseFill } from "react-icons/ri";
import { PiVideoCameraFill } from "react-icons/pi";
import { useState } from "react";
import useChatContext from "../context/chatContext";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { allRooms, deleteRoom } from "../services/RoomService";
import { timeAgo } from "../config/TimeHelpwe";
import img from "../assets/logo.png";
import sender from "../assets/sender.png";
import bg from "../assets/background.png";
import { createRoom } from "../services/RoomService";
import VideoCall from "./VideoCall";

const ChatPage = () => {
  const {
    roomId,
    currentUser,
    connected,
    grounpName,
    setGroupName,
    setConnected,
    setRoomId,
    setCurrentUser,
  } = useChatContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!connected) navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, roomId, currentUser]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);
  const [allGroupName, setAllGroupName] = useState([]);
  const socket = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editMessageId, setEditMessageId] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [topicName, setTopicName] = useState("");
  const [noGroupSelected, setNoGroupSelected] = useState(false);
  const [showCallUI, setShowCallUI] = useState(false);

  useEffect(() => {
    socket.current = new WebSocket("wss://7247636b9097.ngrok-free.app");

    socket.current.onopen = () => {
      console.log("Connected");
    };

    async function loadAllRooms() {
      try {
        const response = await allRooms();
        const rooms = response.rooms;
        const allRoomsList = rooms.map((room) => ({
          roomId: room.roomId,
          roomName: room.groupName,
        }));
        console.log("All Rooms: ", allRoomsList);
        setAllGroupName(allRoomsList);
      } catch (error) {
        console.log(error);
        toast.error("Server Side Error");
      }
    }

    if (connected) {
      loadAllRooms();
      connectWebSocket();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // scroll down
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const connectWebSocket = () => {
    socket.current.onmessage = (event) => {
      console.log("WebSocket message received:", event);
      const data = JSON.parse(event.data);
      switch (data.action) {
        case "message":
          console.log("Message received: ", data);
          setMessages((prev) => [...prev, data]);
          break;

        case "edit":
          setMessages((prev) =>
            prev.map((msg) =>
              msg.messageId === data.messageId
                ? { ...msg, content: data.content, edited_at: Date.now() }
                : msg
            )
          );
          break;

        case "delete":
          setMessages((prev) =>
            prev.filter((msg) => msg.messageId !== data.messageId)
          );
          break;

        case "image":
          setMessages((prev) => [...prev, data]);
          break;

        default:
          break;
      }
    };
  };

  const handleDelete = (messageId) => {
    const message = {
      action: "delete",
      roomId: roomId,
      messageId: messageId,
    };

    socket.current.send(JSON.stringify(message));
  };

  const handleEdit = (message) => {
    setInput(message.content);
    setIsEditing(true);
    setEditMessageId(message.messageId);
  };

  const handleRoomSwitch = (newRoomId, newRoomName) => {
    if (socket.current) {
      socket.current.close(); // Close existing WebSocket connection
    }

    setRoomId(newRoomId);
    setGroupName(newRoomName);
    setMessages([]); // Clear old messages
    setNoGroupSelected(false);

    // Reconnect and fetch messages for the new room
    const newSocket = new WebSocket("ws://192.168.1.138:8080");

    newSocket.onopen = () => {
      console.log("Connected to new room");
      newSocket.send(
        JSON.stringify({
          action: "join",
          roomId: newRoomId,
          sender: currentUser,
        })
      );
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.action) {
        case "message":
        case "image":
          setMessages((prev) => [...prev, data]);
          break;
        case "edit":
          setMessages((prev) =>
            prev.map((msg) =>
              msg.messageId === data.messageId
                ? { ...msg, content: data.content, edited_at: Date.now() }
                : msg
            )
          );
          break;
        case "delete":
          setMessages((prev) =>
            prev.filter((msg) => msg.messageId !== data.messageId)
          );
          break;
        default:
          break;
      }
    };

    newSocket.onclose = () => console.log("Socket closed");
    newSocket.onerror = (err) => console.error("Socket error:", err);

    socket.current = newSocket;
  };

  // send messages
  const sendMesssge = async () => {
    if (
      socket.current &&
      socket.current.readyState === WebSocket.OPEN &&
      input.trim()
    ) {
      if (isEditing) {
        const message = {
          action: "edit",
          roomId: roomId,
          messageId: editMessageId,
          content: input,
          sender: currentUser,
        };

        setIsEditing(false);
        setEditMessageId(null);
        socket.current.send(JSON.stringify(message));
      } else {
        const message = {
          action: "message",
          sender: currentUser,
          content: input,
          roomId: roomId,
        };
        socket.current.send(JSON.stringify(message));
        console.log("Message sent:", message);
      }

      setInput("");
    }
  };

  const handleDeleteRoom = async (roomId, roomName) => {
    if (
      window.confirm(`Are you sure you want to delete the room "${roomName}"?`)
    ) {
      try {
        const response = await deleteRoom(roomId);
        console.log("Delete Room Response: ", response);
        if (response.success) {
          toast.success("Room deleted successfully!");
          setAllGroupName((prev) =>
            prev.filter((room) => room.roomId !== roomId)
          );
          if (roomId === roomId) {
            setRoomId("");
            setGroupName("");
            setMessages([]);
            setNoGroupSelected(true);
          }
        } else {
          toast.error("Failed to delete room.");
        }
      } catch (error) {
        console.error("Error deleting room:", error);
        toast.error("Failed to delete room.");
      }
    }
  };

  const handleLogout = () => {
    socket.current.close();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    console.log("File selected:", file);
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Image = reader.result;

      const message = {
        action: "image",
        sender: currentUser,
        roomId: roomId,
        content: base64Image,
        created_at: Date.now(),
      };

      socket.current.send(JSON.stringify(message));
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="flex h-screen bg-[#FDF9F3]">
      {/* Sidebar */}
      <aside className="w-1/4 text-white shadow-lg border-r-2 border-[#845D1C] bg-white hidden md:block">
        <div className="flex  h-[10%] flex px-5 py-4 bg-white">
          <img src={img} className="h-20 w-22 align-center"></img>
          {/* <h2 className="text-2xl text-white font-bold m-2 truncate">Losuvidha's Charcha</h2> */}
        </div>

        <h3 className="text-xl text-[#845D1C] font-bold mb-4 border-b border-[#845D1C] pb-2 ms-4 mt-8 justify-between flex items-center">
          <span>Recent Topic's</span>
          <button
            onClick={() => setShowDialog(true)}
            className="text-[#845D1C] text-2xl hover:text-[#E48C52] transition me-4"
            title="Add New Room"
          >
            <MdAdd className="text-2xl" />
          </button>
        </h3>
        <ul className="space-y-3 ms-4 me-4">
          {allGroupName.map((room) => {
            const isActive = room.roomId === roomId;

            return (
              <li
                key={room.roomId}
                className={`transition p-3 rounded cursor-pointer flex justify-between items-center ${
                  isActive
                    ? "bg-[#E48C52] text-white font-bold"
                    : "bg-white border-[#845D1C] border-2 text-[#E48C52]"
                }`}
              >
                <span
                  className="flex-1 cursor-pointer"
                  onClick={() => handleRoomSwitch(room.roomId, room.roomName)}
                >
                  {room.roomName}
                </span>
                {isActive && (
                  <button
                    className="ml-2 text-white-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRoom(room.roomId, room.roomName);
                    }}
                    title="Delete Room"
                  >
                    <MdDelete className="h-6 w-6" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </aside>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md relative">
            <h2 className="text-xl font-bold text-[#845D1C] mb-4">
              Create New Topic
            </h2>
            <input
              type="text"
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="Enter new topic Name"
              className="w-full border border-[#845D1C] rounded p-2 mb-4 text-[#E48C52]  focus:outline-none caret-orange-500"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDialog(false)}
                className="text-[#E48C52] px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const response = await createRoom(topicName, currentUser);
                  console.log("Create Room Response: ", response);
                  if (response.success) {
                    toast.success("Room created successfully!");
                    setAllGroupName((prev) => [
                      ...prev,
                      { roomId: response.roomId, roomName: topicName },
                    ]);
                    setTopicName("");
                  } else {
                    toast.error("Failed to create room.");
                  }
                  setShowDialog(false);
                }}
                className="bg-[#845D1C] text-white px-4 py-2 rounded hover:bg-[#E48C52]"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {!noGroupSelected && (
          <header
            className="w-full  py-5 px-6 h-[10%] flex justify-between items-center"
            style={{
              backgroundImage: `url(${bg})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Room/User Name on the left */}
            <h1 className="text-xl font-semibold text-white">{grounpName}</h1>

            {/* Leave Group button on the right */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  socket.current.send(
                    JSON.stringify({
                      action: "join",
                      roomId,
                      user: currentUser,
                    })
                  );
                  setShowCallUI(true);
                }}
              >
                <PiVideoCameraFill
                  className="h-8 w-8 text-white me-4"
                  title="Video call"
                />
              </button>

            

              <button
                onClick={handleLogout}
                className="bg-white border-2 border-[#845D1C] text-[#845D1C] hover:bg-red-500 hover:text-white hover:border-red-500 px-4 py-2 rounded"
              >
                Quit Topic
              </button>
            </div>
          </header>
        )}

          {showCallUI && (
                <VideoCall
                  socket={socket}
                  roomId={roomId}
                  user={currentUser}
                />
              )}

        {/* Chat messages */}
        <main
          ref={chatBoxRef}
          className="flex-1 overflow-auto px-4 py-4 bg-[#FDF9F3] mb-4"
        >
          {messages.map(
            (message, index) => (
              console.log("message Index", index + "- " + message.content),
              (
                <div
                  key={index}
                  className={`flex ${
                    message.sender === currentUser
                      ? "justify-end"
                      : "justify-start mb-4"
                  }`}
                >
                  <div
                    className={`my-2 p-2 max-w-xs rounded ${
                      message.sender === currentUser
                        ? "bg-white border-2 border-[#845D1C] "
                        : "bg-[#E48C52] text-white"
                    }`}
                  >
                    <div className="relative group flex gap-4">
                      <img
                        className={`h-10 w-10 rounded-full ${
                          message.sender === currentUser
                            ? "border border-black "
                            : ""
                        }`}
                        src={sender}
                        alt=""
                      />
                      <div>
                        <p
                          className={` ${
                            message.sender === currentUser
                              ? "text-sm text-[#845D1C] font-bold"
                              : "text-white"
                          }`}
                        >
                          {message.sender}
                        </p>
                        {message.action === "image" ? (
                          <img
                            src={message.content}
                            alt="Sent"
                            className="h-28 w-28 rounded shadow m-2 object-cover"
                            onClick={() => setSelectedImage(message.content)}
                          />
                        ) : (
                          <p
                            className={` ${
                              message.sender === currentUser
                                ? "text-sm text-gray-500"
                                : "text-white"
                            }`}
                          >
                            {message.content}
                          </p>
                        )}
                        <div className="flex justify-end">
                          <p
                            className={` ${
                              message.sender === currentUser
                                ? "text-sm text-black"
                                : "text-sm text-white"
                            }`}
                          >
                            {timeAgo(message.created_at)}
                          </p>
                        </div>

                        {/* Show only if current user is the sender */}
                        {message.sender === currentUser && (
                          <div className="relative group">
                            {/* Hover Controls */}
                            <div className="absolute top-full mt-1 right-0 flex flex-row gap-2 opacity-0 group-hover:opacity-100 bg-gray-100 rounded-md p-2 shadow-lg transition-opacity z-50">
                              {message.action !== "image" && (
                                <button
                                  onClick={() => handleEdit(message)}
                                  className="text-xs text-[#845D1C] px-2 py-1 hover:bg-[#845D1C] hover:text-white rounded transition"
                                >
                                  Edit
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(message.messageId)}
                                className="text-xs text-[#845D1C]  hover:bg-[#845D1C]  hover:text-white  rounded px-3 py-1 transition-colors duration-200"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )
          )}
        </main>

        {selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative"
              onClick={(e) => e.stopPropagation()} // prevent modal close on image click
            >
              <img
                src={selectedImage}
                alt="Full view"
                className="max-h-[90vh] max-w-[90vw] rounded shadow-lg"
              />
              <button
                className="absolute top-2 right-2 w-10 h-10 bg-black bg-opacity-30 hover:bg-gray-700 text-white rounded-full flex items-center justify-center"
                onClick={() => setSelectedImage(null)}
              >
                <RiCloseFill className="h-8 w-8" />
              </button>
            </div>
          </div>
        )}

        {/* Message input */}
        <div className="h-1/16 px-10 py-6 ">
          <div className="h-full flex items-center gap-4 w-full">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMesssge();
              }}
              placeholder="Type your message here..."
              className="flex-1 px-4 py-2 rounded bg-white border-[#845D1C] caret-[#E48C52] border-2 text-black focus:outline-none"
            />
            <button
              className="bg-[#845D1C] h-10 w-10 rounded-full flex justify-center items-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <MdAttachFile size={18} />
            </button>
            <button
              onClick={sendMesssge}
              className="bg-[#845D1C] h-10 w-10 rounded-full flex justify-center items-center"
            >
              <MdSend size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
