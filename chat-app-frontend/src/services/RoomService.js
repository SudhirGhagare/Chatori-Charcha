import { httpClient } from "../config/AxiosHelper";

export const createRoom = async (roomName, username) => {
  const payload = {
    username: username,
    roomName: roomName,
  };

  const resposne = await httpClient.post("/api/v1/create_room", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return resposne.data;
};

export const allRooms = async () => {
  const response = await httpClient.get("/api/v1/all-rooms");

  return response.data;
};

export const JoinRoom = async (roomId, username) => {
  const response = await httpClient.get(`/api/v1/get-room/${roomId}?username=${username}`);
  return response.data;
};

export const getMessages = async (roomId) => {
  const resposne = await httpClient.get(
    `/api/v1/get-message/${roomId}`
  );
  return resposne.data;
};

export const deleteMessage = async (roomId, messageId) => {
  const resposne = await httpClient.delete(
    `api/v1/delete-message/${roomId}/messages/${messageId}`
  );

  console.log("Delete Request: ", httpClient.baseURL + `/${roomId}/messages/${messageId}`);
  console.log("Delete Response: ", resposne.data);
  return resposne.data;
};

export const getRooms = async () => { 
  const resposne = await httpClient.get("api/v1/all-rooms");
  return resposne.data;
};
