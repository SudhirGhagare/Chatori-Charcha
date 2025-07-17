<?php

$user = "root";
$password = "sudhir28";
$host = "localhost";
$database = "chatapp";
$charset = "utf8mb4";
$dsn = "mysql:host=$host;dbname=$database;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, 
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       
    PDO::ATTR_EMULATE_PREPARES   => false,                  
];

try {
    $pdo = new PDO($dsn, $user, $password, $options);
   
} catch (PDOException $e) {
    echo "❌ Connection failed: " . $e->getMessage();
}
?>