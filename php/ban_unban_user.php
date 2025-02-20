<?php
include 'db_connect.php'; // 連接資料庫
include 'session.php'; // 確保登入

$input = json_decode(file_get_contents('php://input'), true);
$user_id = intval($input['user_id']);
$user_identity = intval($input['user_identity']);


$stmt = $conn->prepare("UPDATE users 
                        SET identity = ? 
                        WHERE id = ? 
                        AND identity <> 0");

// 確定是停權還是解除
if ($user_identity == 1) { // 停權
    $new_identity = -1;
    $action = '已停權';
} elseif ($user_identity == -1) { // 解除停權
    $new_identity = 1;
    $action = '已解除停權';
} else {
    echo json_encode(['success' => false, 'message' => '管理員身分不可更動']);
    exit;
}

$stmt->bind_param('ii', $new_identity, $user_id);

// 執行語句
if ($stmt->execute() && $stmt->affected_rows > 0) {
    echo json_encode(['success' => true, 'message' => "用戶 {$user_id} {$action}"]);
} else {
    echo json_encode(['success' => false, 'message' => '權限變更失敗或無變更']);
}

$stmt->close();
$conn->close();
?>
