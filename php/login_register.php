<?php
// 啟用 session
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include 'db_connect.php';

$input = json_decode(file_get_contents('php://input'), true); 

// 獲取用戶名和密碼參數
$user = $input['username'] ?? '';
$pass = $input['password'] ?? '';

// 如果用戶名和密碼都不為空
if (!empty($user) && !empty($pass)) {
    // 使用預處理語句查詢用戶
    $stmt = $conn->prepare("SELECT password, identity FROM users WHERE username = ?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        // 用戶存在，檢查密碼是否正確
        $stmt->bind_result($hashedPassword, $identity);
        $stmt->fetch();

        if (password_verify($pass, $hashedPassword)) {
            // 檢查身份，如果是 0 表示管理員
            if ($identity == 0) {
                $_SESSION['username'] = $user;
                echo json_encode(['success' => true, 'action' => 'admin']);
            } elseif ($identity == 1){
                // 普通用户登录
                $_SESSION['username'] = $user;
                echo json_encode(['success' => true, 'action' => 'login']);
            } elseif ($identity == -1){
                // $_SESSION['username'] = $user;
                echo json_encode(['success' => true, 'action' => 'ban']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => '密碼錯誤']);
        }
    } else {
        // 用戶不存在，新增用戶
        $hashedPassword = password_hash($pass, PASSWORD_DEFAULT);
        $stmt->close();

        // 默認新增用戶為普通用户（identity = 1）
        $identity = 1;
        $stmt = $conn->prepare("INSERT INTO users (username, password, identity) VALUES (?, ?, ?)");
        $stmt->bind_param("ssi", $user, $hashedPassword, $identity);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            // 設置 session 變數
            $_SESSION['username'] = $user;
            echo json_encode(['success' => true, 'action' => 'register']);
        } else {
            echo json_encode(['success' => false, 'message' => '註冊失敗']);
        }
    }
    $stmt->close();
} else {
    // 如果用戶名或密碼為空
    echo json_encode(['success' => false, 'message' => '缺少用戶名或密碼']);
    exit;
}

$conn->close();
?>