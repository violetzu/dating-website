<?php
include 'db_connect.php'; // 連接資料庫
include 'session.php'; // 確保登入

$user_id = $input['user_id'];
$user_identity = $input['user_identity'];

$stmt = $conn->prepare("SET identity = ? FROM users WHERE id = ? AND identity <> 0"); //確保不會變更到管理員的帳號

// 確定是要停權還是解除
// (雖然可以用乘以-1的方式實作，而且管理員的0也通，但是應該還是這樣限制成固定答案比較保險)
if ($user_identity == 1){
    $stmt->bind_param('ii', -1, $user_id);
} elseif ($user_identity == -1){
    $stmt->bind_param('ii', 1, $user_id);
} else {
    echo json_encode(['success' => false, 'message' => '管理員身分不可更動.']);
}

$stmt->execute();

if ($stmt->affected_rows > 0){
    echo json_encode(['success' => true, 'message' => '權限變更成功.']);
} else {
    echo json_encode(['success' => false, 'message' => '權限變更失敗.']);
}

$stmt->close();  
$conn->close();  
?>