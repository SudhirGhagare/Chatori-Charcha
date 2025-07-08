import React, { useEffect, useRef } from "react";
import { MdAttachFile, MdSend } from "react-icons/md";
import { useState } from "react";
import useChatContext from "../context/chatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { baseURL } from "../config/AxiosHelper";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { getMessages, allRooms } from "../services/RoomService";
import { timeAgo } from "../config/TimeHelpwe";
import img from "../assets/chat.png";
import sender from "../assets/sender.png";
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
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    async function loadMessages() {
      try {
        const messages = await getMessages(roomId);
    
        console.log(await allRooms());
        setMessages(messages);
      } catch (error) {
        console.log(error);
      }
    }

    if (connected) loadMessages();
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
  // stomp client init
  useEffect(() => {
    const connectWebSocket = () => {
      // sockJS object creation
      const sock = new SockJS(`${baseURL}/chat`);

      //create a client
      const client = Stomp.over(sock);
      client.connect({}, () => {
        setStompClient(client);

        toast.success("Connected to Websocket");

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          console.log(message);

          const newMessage = JSON.parse(message.body);

          setMessages((prev) => [...prev, newMessage]);
        });
      });
    };

    if (connected) connectWebSocket();
  }, [roomId, connected]);

  const handleDelete = (message) => {};

  const handleEdit = (message) => {};

  // send messages
  const sendMesssge = async () => {
    if (stompClient && connected && input.trim()) {
      // console.log(input);
      const message = {
        sender: currentUser,
        content: input,
        roomId: roomId,
      };

      stompClient.send(
        `/app/sendMessage/${roomId}`,
        {},
        JSON.stringify(message)
      );
      setInput("");
    }
  };

  const handleLogout = () => {
    stompClient.disconnect();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  };

  return (
    <div className="flex h-screen dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-1/4 bg-gray-700 text-white shadow-lg border-r-4  hidden md:block">
        <div className="flex dark:bg-gray-900 h-[10%]">
          <img src={img} className="p-4 "></img>
          <h1 className="text-2xl font-bold mt-4  p-2 ">Chatori Charcha</h1>
        </div>

        <h2 className="text-2xl font-bold mb-4 border-b border-teal-200 pb-2 ms-4 mt-8">
          Rooms
        </h2>
        <ul className="space-y-3 ms-4 me-4">
          <li className="hover:bg-orange-600 bg-gray-500 transition p-3 rounded cursor-pointer">
            Yash Rathod
          </li>
        </ul>
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <header className="dark:border-gray-700 w-full dark:bg-gray-900 py-5 px-6 h-[10%] flex justify-between items-center">
          {/* Room/User Name on the left */}
          <h1 className="text-xl font-semibold text-white">{grounpName}</h1>

          {/* Leave Group button on the right */}
          <button
            onClick={handleLogout}
            className="dark:bg-red-500 dark:hover:bg-red-700 px-4 py-2 rounded text-white"
          >
            Leave Group
          </button>
        </header>

        {/* Chat messages */}
        <main
          ref={chatBoxRef}
          className="flex-1 overflow-auto px-4 py-4 dark:bg-slate-800"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === currentUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`my-2 p-2 max-w-xs rounded ${
                  message.sender === currentUser
                    ? "bg-purple-500"
                    : "bg-blue-500"
                }`}
              >
                <div className="flex gap-4">
                  <img className="h-10 w-10" src={sender} alt="" />
                  <div>
                    <p className="text-sm font-bold">{message.sender}</p>
                    <p>{message.content}</p>
                    <p className="text-xs text-gray-300">
                      {timeAgo(message.timestamp)}
                    </p>

                    {/* Show only if current user is the sender */}
                    {message.sender === currentUser && (
                      <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(message)}
                          className="text-xs text-yellow-300 hover:text-yellow-400"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(message)}
                          className="text-xs text-red-400 hover:text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </main>

        {/* Message input */}
        <div className="h-16 px-10 py-2 bg-gray-900">
          <div className="h-full flex items-center gap-4 w-full">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMesssge();
              }}
              placeholder="Type your message here..."
              className="flex-1 px-4 py-2 rounded bg-gray-800 text-white focus:outline-none"
            />
            <button className="bg-green-600 h-10 w-10 rounded-full flex justify-center items-center">
              <MdAttachFile size={18} />
            </button>
            <button
              onClick={sendMesssge}
              className="bg-blue-600 h-10 w-10 rounded-full flex justify-center items-center"
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
