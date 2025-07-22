import React, { useState } from "react";
import chatIcon from "../assets/lksalogo.png";
import toast from "react-hot-toast";
import { createRoom, JoinRoom } from "../services/RoomService";
import { useNavigate } from "react-router";
import useChatContext from "../context/chatContext";

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
    groupName: "",
  });
  const [activeTab, setActiveTab] = useState("join");

  const navigate = useNavigate();

  const { setRoomId, setCurrentUser, setConnected,grounpName, setGroupName} = useChatContext();

  const handleFromInputChange = (event) => {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
    console.log("details: ",detail)
  };

  const validateForm = () => {
    if (detail.userName === "") {
      toast.error("Invalid Input !!");
      return false;
    }
    return true;
  };

  const joinChat = async () => {
    if (validateForm()) {
      try {
        const room = await JoinRoom(detail.roomId, detail.userName);
        console.log("Room : ",room);
        toast.success("Group Joined..!!");
        setCurrentUser(detail.userName);
        setGroupName(room.groupName);
         console.log("Group Name: ", grounpName);
        setRoomId(detail.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        console.log(error);
        if (error.status == 400) toast.error(error.response.data);
        else toast.error("Something went wrong...");
      }
    }
  };

  const createGroup = async () => {
    if (validateForm()) {
      //create room
      try {
        const response = await createRoom(detail.groupName, detail.userName);
        console.log("Room : ",detail.groupName);
        toast.success("Group created successfully !!!");
        // join the chat
        setCurrentUser(detail.userName);
        setGroupName(detail.groupName);
        setRoomId(detail.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        console.log(error);
        if (error.status == 400) toast.error(error.response.data);
        else toast.error("Something went wrong...");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-10 dark:border-[#E48C52]  border w-full  flex flex-col gap-5 max-w-md rounded bg-white shadow">
        <div>
          <img src={chatIcon} className="w-24 mx-auto" />
        </div>

        <h1 className="text-2xl text-[#845D1C] font-semibold text-center">
          Loksuvidha's Charcha
        </h1>

        {/* Tabs */}
        <div className="flex justify-around mb-4">
          <button
            onClick={() => setActiveTab("join")}
            className={`w-1/2 py-2 rounded-l-lg ${
              activeTab === "join"
                ? "bg-[#E48C52] text-white border border-[#E48C52]"
                : "bg-white. text-[#E48C52]  border border-[#E48C52]"
            }`}
          >
            Join Group
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`w-1/2 py-2  rounded-r-lg ${
              activeTab === "create"
                ? "bg-[#E48C52] text-white border border-[#E48C52]"
                : "bg-white. text-[#E48C52]  border border-[#E48C52]"
             }`}
          >
            Create Topic
          </button>
        </div>

        <div>
          <label htmlFor="name" className="block text-[#845D1C] font-medium mb-2">
            Your Name
          </label>
          <input
            onChange={handleFromInputChange}
            value={detail.userName}
            name="userName"
            id="name"
            placeholder="Enter your name...."
            type="text"
            className="w-full  text-[#E48C52] bg-white px-4 py-2 border dark:border-[#845D1C] rounded-lg focus: outline-none focus:ring-2 focus:ring-[#845D1C] caret-orange-500"
          />
        </div>

        {activeTab === "create" && (
          <div>
            <label htmlFor="groupName" className="block text-[#845D1C] font-medium mb-2">
              Room Name
            </label>
            <input
              onChange={handleFromInputChange}
              value={detail.groupName}
              name="groupName"
              id="groupName"
              placeholder="Enter your room name...."
              type="text"
              className="w-full text-[#E48C52] bg-white px-4 py-2  border dark:border-[#845D1C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#845D1C] caret-orange-500"
            />
          </div>
        )}

        {activeTab === "join" && (
          <div>
            <label htmlFor="roomId" className="block text-[#845D1C] font-medium mb-2">
              Group ID
            </label>
            <input
              onChange={handleFromInputChange}
              value={detail.roomId}
              name="roomId"
              id="roomId"
              placeholder="Enter group id ...."
              type="text"
              className="w-full text-[#E48C52] bg-white px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#845D1C] caret-orange-500"
            />
          </div>
        )}

        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={activeTab === "join" ? joinChat : createGroup}
            className={`w-36 weight-1 text-sm py-2 rounded bg-[#E48C52]  text-center transition`}>
            {activeTab === "join" ? "Join Group" : "Create Topic"}
          </button>

          <button
            onClick={() => {
              navigate("/rooms");
            }}
            className="w-36 text-sm py-2  text-[#845D1C] rounded  border border-[#E48C52]  text-center transition"
          >
            Topic
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;
