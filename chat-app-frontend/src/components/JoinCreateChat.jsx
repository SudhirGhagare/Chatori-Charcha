import React, { useState } from "react";
import chatIcon from "../assets/chat.png";
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

  const navigate = useNavigate();

  const { setRoomId, setCurrentUser, setConnected, setGroupName} = useChatContext();

  const handleFromInputChange = (event) => {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  };

  const validateForm = () => {
    if (detail.roomId === "" || detail.userName === "") {
      toast.error("Invalid Input !!");
      return false;
    }
    return true;
  };

  const joinChat = async () => {
    if (validateForm()) {
      try {
        const room = await JoinRoom(detail.roomId);
        console.log("Room : ",room);
        toast.success("Group Joined..!!");
        setCurrentUser(room.userName);
        setGroupName(room.groupName);
        setRoomId(room.roomId);
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
        toast.success("Group created successfully !!!");
        // join the chat
        setCurrentUser(detail.userName);
        setGroupName(response.groupName);
        setRoomId(response.roomId);
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
      <div className="p-10 dark:border-gray-700  border w-full  flex flex-col gap-5 max-w-md rounded dark:bg-gray-900 shadow">
        <div>
          <img src={chatIcon} className="w-24 mx-auto" />
        </div>

        <h1
          onClick={() => {
            navigate("/about");
          }}
          className="text-2xl font-semibold text-center cursor-pointer"
        >
          Join Charcha
        </h1>

        <div className="">
          <label htmlFor="name" className="block font-medium mb-2">
            Your Name
          </label>
          <input
            onChange={handleFromInputChange}
            value={detail.userName}
            name="userName"
            id="name"
            placeholder="Enter your name...."
            type="text"
            className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-lg focus: outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="">
          <label htmlFor="name" className="block font-medium mb-2">
            Room Name
          </label>
          <input
            onChange={handleFromInputChange}
            value={detail.groupName}
            name="groupName"
            id="groupName"
            placeholder="Enter your room name...."
            type="text"
            className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-lg focus: outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="">
          <label htmlFor="name" className="block font-medium mb-2">
            Group Id
          </label>
          <input
            onChange={handleFromInputChange}
            value={detail.roomId}
            name="roomId"
            id="roomId"
            placeholder="Enter group id ...."
            type="text"
            className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-lg focus: outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* <div className='flex justify-center gap-5 mt-4'>
                    <button
                        onClick={joinChat}
                        className='px-3 py-2 dark:bg-blue-500 hover:dark:bg-blue-800 rounded'> Join Group</button>
                    <button
                        onClick={createGroup}
                        className='px-3 py-2 dark:bg-green-500 hover:dark:bg-green-800 rounded'> Create Group</button>
                    
                    <button
                        className='px-3 py-2 dark:bg-purple-500 hover:dark:bg-green-800 rounded'> Create Group</button>
                </div> */}

        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={joinChat}
            className="w-36 text-sm py-2 rounded bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 hover:dark:bg-blue-800  text-center transition"
          >
            Join Group
          </button>

          <button
            onClick={createGroup}
            className="w-36 text-sm py-2 rounded bg-green-600 dark:bg-green-500 hover:bg-green-700 hover:dark:bg-green-800  text-center transition"
          >
            Create Group
          </button>

          <button
            onClick={() => {
              navigate("/rooms");
            }}
            className="w-36 text-sm py-2 rounded bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 hover:dark:bg-purple-800  text-center transition"
          >
            Groups
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;
