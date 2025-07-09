package com.asg.chat.controllers;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import com.asg.chat.entities.Message;
import com.asg.chat.entities.Room;
import com.asg.chat.payload.MessageRequest;
import com.asg.chat.repos.RoomRepository;

@Controller
// @CrossOrigin("http://192.168.31.217:5173")
public class ChatController {

    private final RoomRepository roomRepository;

    public ChatController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    // This  method will used for both sending and publising messages 
    @MessageMapping("/sendMessage/{roomId}") // this url will recive messages url = /app/sendMessage/{roomId}
    @SendTo("/topic/room/{roomId}") // this url will publish that message and subsribe
    public Message sendMessage(
        @DestinationVariable String roomId,
        @RequestBody MessageRequest request){

           Room room = roomRepository.findByRoomId(request.getRoomId());

           Message message = new Message();
           message.setContent(request.getContent());
           message.setSender(request.getSender());
           message.setTimestamp(LocalDateTime.now());

           if(room != null){
            room.getMessages().add(message);
            roomRepository.save(room);
           }else{
            throw new RuntimeException("room not found");
           }

           return message;

    }

    @DeleteMapping("/{roomId}/messages/{index}")
    public ResponseEntity<?> deleteMessage(@PathVariable String roomId, @PathVariable int index) {

        Room room = roomRepository.findByRoomId(roomId);

        if (room == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Room not found");
        }

        List<Message> messages = room.getMessages();

        if (index < 0 || index >= messages.size()) {
            return ResponseEntity.badRequest().body("Invalid message index");
        }

        messages.remove(index);  // Remove the message by index
        room.setMessages(messages);
        roomRepository.save(room);

        return ResponseEntity.ok("Message deleted successfully");
    }

}
