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
       // echo "Received message: $msg\n";
       // echo "Data: " . $data . "\n";
        if (!isset($data['roomId'], $data['action'])) return;

        switch ($data['action']) {

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

          if($client === $from) continue; 
            $client->send(json_encode($message));
        }
    
    }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        echo "Connection {$conn->resourceId} has disconnected\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "Error: {$e->getMessage()}\n";
        $conn->close();
    }
}

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
