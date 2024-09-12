<?php
include 'session.php';  // 包含 session 管理檔案

$username = $_SESSION['username'];  // 從 session 中獲取用戶名

echo json_encode(['success' => true, 'username' => $username]);  // 輸出用戶名
?>