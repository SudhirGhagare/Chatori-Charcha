import { httpClient } from "../config/AxiosHelper";

export const createRoom = async (roomId, roomName) => {
  const payload = {
    roomId: roomId,
    roomName: roomName,
  };

  const resposne = await httpClient.post("/api/v1/rooms", payload, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
  return resposne.data;
};

export const allRooms = async () => {
  const response = await httpClient.get("/all");
  console.log("Response All Rooms: ", response.data);
  return response.data;
};

export const JoinRoom = async (roomId) => {
  const resposne = await httpClient.get(`/api/v1/rooms/${roomId}`);
  return resposne.data;
};

export const getMessages = async (roomId, size = 50, page = 0) => {
  const resposne = await httpClient.get(
    `/api/v1/rooms/${roomId}/messages?size=${size}&page=${page}`
  );
  return resposne.data;
};

export const getRooms = async () => {
  const resposne = await httpClient.get("api/v1/rooms");
  return resposne.data;
};
