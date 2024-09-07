<?php
session_start();

header("Content-Type: application/json");

if (!isset($_SESSION['username'])) {
    echo json_encode(['success' => false, 'message' => '未登入']);
    exit();
}

$username = $_SESSION['username'];

echo json_encode(['success' => true, 'username' => $username]);
?>