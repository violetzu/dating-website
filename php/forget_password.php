<?php

require 'vendor/autoload.php'; // PHPMailer 的自動載入

header('Content-Type: application/json');

include 'db_connect.php'; //連接資料庫

date_default_timezone_set('Asia/Taipei');

$data = json_decode(file_get_contents('php://input'), true);
$username = $data['username'];

$stmt = $conn->prepare("SELECT id, username, email FROM Users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    $email = $user['email'];
    $token = bin2hex(random_bytes(16)); // 生成隨機 token

    // 保存 token 和過期時間
    $expiryTime = date("Y-m-d H:i:s", strtotime("+1 hour"));
    $insertStmt = $conn->prepare("INSERT INTO password_resets (username, token, expiry_time) VALUES (?, ?, ?)");
    $insertStmt->bind_param("sss", $username, $token, $expiryTime);
    $insertStmt->execute();
    $insertStmt->close();

    // 發送重置鏈接的電子郵件
    $resetLink = "https://marimo.idv.tw/reset_password?token=$token";
    include 'send_mail.php';
} else {
    echo json_encode(['message' => '找不到該用戶名']);
}

$stmt->close();
$conn->close();
?>
