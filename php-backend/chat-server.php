<?php
require __DIR__ . '/vendor/autoload.php';

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Chat implements MessageComponentInterface {
    protected $clients;
    protected $rooms;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        $this->rooms = [];
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        echo "New connection: {$conn->resourceId}\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $data = json_decode($msg, true);
        echo "Received message: {$msg}\n";
        if (!isset($data['roomId'], $data['action'])) return;

        $roomId = $data['roomId'] ?? null;

        switch ($data['action']) {

            case 'join':
                if (!$roomId) return;
                if (!isset($this->rooms[$roomId])) {
                    $this->rooms[$roomId] = new \SplObjectStorage;
                }
                $this->rooms[$roomId]->attach($from);
                $message = [
                    'action' => 'joined',
                    'roomId' => $roomId,
                    'user' => $data['user'] ?? null
                ];
                break;


            case 'offer':
            case 'answer':
            case 'ice-candidate':
                if (!$roomId) return;
                $message = [
                    'action' => $data['action'],
                    'roomId' => $roomId,
                    'sender' => $data['sender'] ?? null,
                    'payload' => $data['payload'] ?? null
                ];
                break;

            case 'message':
                $message = [
                    'action' => 'message',
                    'roomId' => $data['roomId'],
                    'sender' => $data['sender'],
                    'messageId' => uniqid(),
                    'content' => $data['content'],
                    'created_at' => time()
                ];
                break;

            case 'image':
            $message = [
                  'action' => 'image',
                  'roomId' => $data['roomId'],
                  'messageId' => uniqid(),
                  'sender' => $data['sender'],
                  'content' => $data['content'], 
                  'created_at' => time()
             ];
             break;    

            case 'edit':
                $message = [
                    'action' => 'edit',
                    'roomId' => $data['roomId'],
                    'messageId' => $data['messageId'],
                    'content' => $data['content'],
                    'created_at' => time()
                ];
                break;

            case 'delete':
                $message = [
                    'action' => 'delete',
                    'roomId' => $data['roomId'],
                    'messageId' => $data['messageId']
                ];
                break; 
                
            default:
                echo "Unknown action: {$data['action']}\n";
                return;    
        }  
    
        foreach ($this->clients as $client) {

            
            if (in_array($data['action'], ['offer', 'answer', 'ice-candidate']) && $client === $from) 
             continue;
            $client->send(json_encode($message));
        }
    
    }

public function onClose(ConnectionInterface $conn) {
    $this->clients->detach($conn);
    foreach ($this->rooms as $roomId => $clients) {
        if ($clients->contains($conn)) {
            $clients->detach($conn);
        }
    }
    echo "Connection {$conn->resourceId} has disconnected\n";
}

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "Error: {$e->getMessage()}\n";
        $conn->close();
    }
}
// use Ratchet\Server\IoServer;
// use Ratchet\Http\HttpServer;
// use Ratchet\WebSocket\WsServer;
// use React\Socket\SocketServer;
// use React\Socket\SecureServer;
// use React\EventLoop\Factory;

// $socket = new SocketServer('0.0.0.0:8080');

// $secureWebSocket = new SecureServer($socket, [
//     'local_cert' => __DIR__ . '/cert.pem',
//     'local_pk' => __DIR__ . '/key.pem',
//     'allow_self_signed' => true,
//     'verify_peer' => false
// ]);

// $server = IoServer::factory(
//     new HttpServer(new WsServer(new Chat())),
//     8080,
//     '0.0.0.0' 
// );

// $server = new IoServer(
//     new HttpServer(new WsServer(new Chat())),
//     8080
//    // $secureWebSocket
// );

// echo "WebSocket server started on port 8080...\n";
// $server->run();

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

$server = IoServer::factory(
    new HttpServer(new WsServer(new Chat())),
    8080
);

echo "WebSocket server started on port 8080...\n";
$server->run();

?>
