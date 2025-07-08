package com.asg.chat.repos;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.asg.chat.entities.Room;

import java.util.List;

public interface RoomRepository extends MongoRepository<Room, String>{

    // Get room using room id
    Room findByRoomId(String roomId);
    List<Room> findAll();
}
