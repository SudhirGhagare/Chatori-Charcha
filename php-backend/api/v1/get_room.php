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
$roomId = $_GET['roomId'] ?? null;
try {
    $stmt = $pdo->prepare("SELECT * FROM room WHERE roomId = ?");
    $stmt->execute([$roomId]);
    $room = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($room) {
        echo json_encode($room);
    } else {
        http_response_code(404);
        echo json_encode(["error" => "Room not found"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error", "details" => $e->getMessage()]);
}
?>
