<?php 
include_once '../../config/CORSConfig.php';
require_once '../../db/databaseConnect.php';

$stmt = $pdo->query("SELECT * FROM room");
$rooms = $stmt->fetchAll();
if ($rooms) {
    echo json_encode([
        'message' => 'Rooms fetched successfully',
        'rooms' => $rooms
    ]);
} else {
    echo json_encode([
        'message' => 'No rooms found'
    ]);
}

?>