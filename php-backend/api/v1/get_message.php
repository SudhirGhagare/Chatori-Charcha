<?php

header('Content-Type: application/json');
include '../../config/CORSConfig.php';
require '../../db/databaseconnect.php';

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if (preg_match('#^/api/v1/get-message/([a-f0-9]{32})$#', $path, $matches)) {
   
    $roomId = $matches[1];
    $stmt = $pdo->prepare("SELECT message_id,sender,content,message_type,media_url,created_at 
                            FROM messages WHERE room_id = :roomId");
    $stmt->execute(['roomId' => $roomId]);
    $message = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($message) {
        echo json_encode([
            'room_id' => $roomId,
            'message' => $message
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'error' => 'Message not found',
            'room_id' => $roomId
        ]);
    }
    
} else {
    http_response_code(404);
    echo json_encode([
        'error' => 'Route not found',
        'path' => $path
    ]);
}

?>
