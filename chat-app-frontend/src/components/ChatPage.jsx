import { useEffect, useRef } from "react";
import { MdAttachFile, MdSend } from "react-icons/md";
import { useState } from "react";
import useChatContext from "../context/chatContext";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import {allRooms} from "../services/RoomService";
import {timeAgo} from "../config/TimeHelpwe";
import img from "../assets/logo.png";
import sender from "../assets/sender.png";
import bg from '../assets/background.png';

const ChatPage = () => {
  const {
    roomId,
    currentUser,
    connected,
    grounpName,
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

  useEffect(() => {
 
    socket.current = new WebSocket("ws://localhost:8080");
    
    socket.current.onopen = () => {
        console.log("Connected");
      };


    async function loadAllRooms() {
      try {
        const response = await allRooms();
        const rooms = response.rooms;
        const allRoomsList = 
          rooms.map((room) => ({
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
    };
   

  const handleDelete = (messageId) => {

    const message = {
      action: "delete",
      roomId: roomId,
      messageId: messageId
    };

    socket.current.send(JSON.stringify(message));

  };

  const handleEdit = (message) => {
    setInput(message.content);
    setIsEditing(true);
    setEditMessageId(message.messageId);
  };

  // send messages
  const sendMesssge = async () => {
    if (
      socket.current &&
      socket.current.readyState === WebSocket.OPEN &&
      input.trim()
    ) {
      if(isEditing){

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

      }else{
        const message = {
        action: "message",
        sender: currentUser,
        content: input,
        roomId: roomId,
      };
      socket.current.send(JSON.stringify(message));
      }
    
      setInput("");
    }
  };

  const handleLogout = () => {
    socket.current.close();
    setConnected(false);
    setIsOnline(false);
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

        <h3 className="text-xl text-[#845D1C] font-bold mb-4 border-b border-[#845D1C] pb-2 ms-4 mt-8">
          Recent Topic's
        </h3>
        <ul className="space-y-3 ms-4 me-4">
          {allGroupName.map((room) => (
            <li
              key={room.roomId}
              className="text-white bg-[#E48C52] transition p-3 rounded"
            >
              {room.roomName}
            </li>
          ))}
        </ul>
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
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
          <button
            onClick={handleLogout}
            className="bg-white border-2 border-[#845D1C] text-[#845D1C] hover:bg-red-500 hover:text-white hover:border-red-500 px-4 py-2 rounded"
          >
            Quit Topic
          </button>
        </header>

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
                            className="max-w-xs rounded shadow"
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
                              <button
                                onClick={() => handleEdit(message)}
                                className="text-xs text-[#845D1C] px-2 py-1 hover:bg-[#845D1C] hover:text-white rounded transition"
                              >
                                Edit
                              </button>
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
            <button className="bg-[#845D1C] h-10 w-10 rounded-full flex justify-center items-center"
            onClick={() => fileInputRef.current?.click()}>
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
