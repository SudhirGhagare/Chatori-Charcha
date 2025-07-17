<?php
header('Content-Type: application/json');

$requestUri = $_SERVER['REQUEST_URI'];
$parsedUrl = parse_url($requestUri);
$path = trim($parsedUrl['path'], '/'); 
$pathParts = explode('/', $path);

if (count($pathParts) >= 3 && $pathParts[0] === 'api' && $pathParts[1] === 'v1') {
    $endpoint = $pathParts[2];
    $param = $pathParts[3] ?? null;

    switch ($endpoint) {
        case 'create_room':
            require 'create_room.php';
            break;

        case 'all-rooms':
            require 'all_rooms.php';
            break;

        case 'get-room':
            if ($param) {
                $_GET['roomId'] = $param;
            }
            require 'get_room.php';
            break;

        case 'get-message':
            require 'get_message.php';
            break; 
            
        case 'delete-message':
            require 'delete_message.php';
            break;    
             
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Unknown endpoint']);
            break;
    }
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Invalid request']);
}
?>

