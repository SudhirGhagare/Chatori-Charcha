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
$requestUri = $_SERVER['REQUEST_URI'];
$parsedUrl = parse_url($requestUri);
$path = trim($parsedUrl['path'], '/'); 
$pathParts = explode('/', $path);

if (count($pathParts) >= 3 && $pathParts[0] === 'api' && $pathParts[1] === 'v1') {
    
    $endpoint = $pathParts[2];
    $roomId = $pathParts[3] ?? null;
    $username = $_GET['username'] ?? null;

}

try {

    $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM room WHERE roomId = ? AND userName = ?");
    $checkStmt->execute([$roomId, $username]);
    $userExists = $checkStmt->fetchColumn() > 0;

    if (!$userExists) {
        $updateStmt = $pdo->prepare("UPDATE room SET userName = ? WHERE roomId = ?");
        $updateStmt->execute([$username, $roomId]);
    }

    // Fetch all users in the room
    $usersStmt = $pdo->prepare("SELECT * FROM room WHERE roomId = ?");
    $usersStmt->execute([$roomId]);
    $room = $usersStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode($room);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error", "details" => $e->getMessage()]);
}
?>