package com.asg.chat.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.asg.chat.entities.Message;
import com.asg.chat.entities.Room;
import com.asg.chat.repos.RoomRepository;

@RestController
@RequestMapping("/api/v1/rooms")
// @CrossOrigin("http://192.168.31.217:5173")
public class RoomController {

    private final RoomRepository roomRepository;

    public RoomController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    //create room
    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody Room newRoom) {

        if (roomRepository.findByRoomId(newRoom.getRoomId()) != null) {
            // room is already there
            return ResponseEntity.badRequest().body("Room Already exists");
        }

        // create new room
        Room room = new Room();
        room.setRoomId(newRoom.getRoomId());
        room.setRoomName(newRoom.getRoomName());
        Room savedRoom = roomRepository.save(room);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedRoom);

    }

    @GetMapping("/all")
    public ResponseEntity<List<Room>> getAllRooms() {
        List<Room> rooms = roomRepository.findAll();
        return ResponseEntity.ok(rooms);
    }


    //get room
    @GetMapping("/{roomId}")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId) {

        Room room = roomRepository.findByRoomId(roomId);

        if (room == null) {
            return ResponseEntity.badRequest().body("Room not found");
        }

        return ResponseEntity.ok(room);
    }

    //get messages of room
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<Message>> getMessages(@PathVariable String roomId,
            @RequestParam(value = "page", defaultValue = "0", required = false) int page,
            @RequestParam(value = "size", defaultValue = "20", required = false) int size) {

        Room room = roomRepository.findByRoomId(roomId);

        if (room == null) {
            return ResponseEntity.badRequest().build();
        }

        //get Messages
        List<Message> messages = room.getMessages();

        int start = Math.max(0, messages.size() - (page + 1) * size);
        int end = Math.min(messages.size(), (start + size));

        List<Message> paginatedMessages = messages.subList(start, end);

        return ResponseEntity.ok(paginatedMessages);

    }

    @GetMapping
    public ResponseEntity<List<Room>> getRooms(){
        List<Room> rooms = roomRepository.findAll();
        return ResponseEntity.ok(rooms);
    }

}
