import { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [roomId, setRoomId] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [connected, setConnected] = useState(false);
  const [grounpName, setGroupName] = useState("");

  
  return (
    <ChatContext.Provider
      value={{
        roomId,
        currentUser,
        connected,
        grounpName,
        setGroupName,
        setRoomId,
        setCurrentUser,
        setConnected,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

const useChatContext = () => useContext(ChatContext);
// eslint-disable-next-line react-refresh/only-export-components
export default useChatContext;

