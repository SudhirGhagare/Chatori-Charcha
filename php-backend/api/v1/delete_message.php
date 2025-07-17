<?php

include '../../config/CORSConfig.php';
require '../../db/databaseConnect.php';
header('Content-Type: application/json');

$url = $_SERVER['REQUEST_URI'];
$path = parse_url($url, PHP_URL_PATH);
$pathParts = explode('/', $path);
$roomId = $pathParts[4] ?? null;
$messageId = $pathParts[6] ?? null;

 $stmt = $pdo->prepare("DELETE FROM messages WHERE room_id = :roomId AND message_id = :messageId");
    $stmt->bindParam(':roomId', $roomId);
    $stmt->bindParam(':messageId', $messageId);
    $stmt->execute();

echo json_encode([
    'roomId' => $roomId,
    'messageId' => $messageId
]);

?>
