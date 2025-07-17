<?php 

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once '../../db/databaseConnect.php';

$data = json_decode(file_get_contents("php://input"), true);
$username = $data['username'] ?? null;
$roomName = $data['roomName'] ?? null;


if (!$username || !$roomName) {
    http_response_code(400);
    echo json_encode(['error' => 'Username and RoomName required']);
    exit;
}

$roomId = md5(strtolower(trim($roomName . '_' . $username)));

$stmt = $pdo->prepare("SELECT * FROM room WHERE roomId = ?");
$stmt->execute([$roomId]);
$existingRoom = $stmt->fetch();

if ($existingRoom) {
    echo json_encode([
        'message' => 'Room already exists',
        'roomId' => $roomId
    ]);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO room (roomId, groupName, userName) VALUES (?, ?, ?)");
$stmt->execute([$roomId, $roomName, $username]);

echo json_encode([
    'message' => 'Room created successfully',
    'roomId' => $roomId
]);

?>