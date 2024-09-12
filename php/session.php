<?php
session_start();  // 啟動 session

header("Content-Type: application/json");

// 檢查用戶是否已經登入
if (!isset($_SESSION['username'])) {
    // 如果 session 中沒有 username，表示用戶未登入
    echo json_encode(['success' => false, 'message' => '未登入']);  // 返回 JSON 對象，通知未登入
    exit();  // 終止進一步執行
}
?>