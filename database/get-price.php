<?php
// Файл get-prices.php

header('Content-Type: application/json');

$code = isset($_GET['code']) ? $_GET['code'] : '';

// Підключення до бази даних
$connection = new mysqli('macbook-pro.es', 'u442243092_macbookbot', '>>jtC143d;Z', 'u442243092_macbookbot');

if ($connection->connect_error) {
    die('Connection failed: ' . $connection->connect_error);
}

// Запит до бази даних для отримання цін
$query = "SELECT Price_stavit_na_sait FROM uc WHERE Cod = ?";
$stmt = $connection->prepare($query);
$stmt->bind_param("s", $code);
$stmt->execute();
$result = $stmt->get_result();
if ($price = $result->fetch_assoc()) {
    echo json_encode(['price' => $price['Price_stavit_na_sait']]);
} else {
    echo json_encode(['price' => null]);
}

// Закриття з'єднання
$connection->close();



// Файл get-prices.php

// header('Content-Type: application/json');

// $logfile = 'logfile.log'; 

// $code = isset($_GET['code']) ? $_GET['code'] : '';

// // Підключення до бази даних
// $connection = new mysqli('macbook-pro.es', 'u442243092_macbookbot', '>>jtC143d;Z', 'u442243092_macbookbot');

// if ($connection->connect_error) {
//     error_log("Connection failed: " . $connection->connect_error, 3, $logfile);
//     die(json_encode(['error' => 'Database connection failed']));
// }

// // Запит до бази даних для отримання цін
// $query = "SELECT Price_stavit_na_sait FROM uc WHERE Cod = ?";
// $stmt = $connection->prepare($query);

// if (false === $stmt) {
//     error_log("Prepare failed: " . $connection->error, 3, $logfile);
//     die(json_encode(['error' => 'Query preparation failed']));
// }

// $stmt->bind_param("s", $code);
// if (!$stmt->execute()) {
//     error_log("Execute failed: " . $stmt->error, 3, $logfile);
//     die(json_encode(['error' => 'Query execute failed']));
// }

// $result = $stmt->get_result();
// if ($result === false) {
//     error_log("Getting result failed: " . $stmt->error, 3, $logfile);
//     die(json_encode(['error' => 'Getting result failed']));
// }

// if ($price = $result->fetch_assoc()) {
//     echo json_encode(['price' => $price['Price_stavit_na_sait']]);
// } else {
//     echo json_encode(['price' => null]);
// }

// // Закриття з'єднання
// $connection->close();
?>


