<?php
include 'db_connect.php'; // 連接資料庫
include 'session.php'; // 確保登入

$input = json_decode(file_get_contents('php://input'), true);
$username = $_SESSION['username'];
$oldPassword = $input['oldpassword'] ?? '';
$newPassword = $input['newpassword'] ?? '';
$newBio = $input['bio'] ?? '';
$newEmail = $input['email'] ?? '';
$tags = $input['tags'] ?? [];

// 如果要更改密碼
if ($newPassword !== '') {
    // 獲取用戶的當前密碼哈希值並驗證舊密碼
    $selectStmt = $conn->prepare("SELECT password FROM users WHERE username = ?");
    $selectStmt->bind_param("s", $username);
    $selectStmt->execute();
    $selectStmt->bind_result($currentPasswordHash);
    $selectStmt->fetch();
    $selectStmt->close();

    if (!password_verify($oldPassword, $currentPasswordHash)) {
        echo json_encode(['success' => false, 'message' => '舊密碼錯誤']);
        exit();
    }

    // 更新密碼
    $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);
    $updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE username = ?");
    $updateStmt->bind_param("ss", $newPasswordHash, $username);
    $updateStmt->execute();
    $updateStmt->close();
}

// 更新其他個人信息
$updateStmt = $conn->prepare("UPDATE users SET bio = ?, email = ? WHERE username = ?");
$updateStmt->bind_param("sss", $newBio, $newEmail, $username);
$updateStmt->execute();
$updateStmt->close();

// 更新標籤
$conn->begin_transaction();

$deleteStmt = $conn->prepare("DELETE FROM User_Tags WHERE username = ?");
$deleteStmt->bind_param("s", $username);
$deleteStmt->execute();
$deleteStmt->close();

$insertStmt = $conn->prepare("INSERT INTO User_Tags (username, tag) VALUES (?, ?)");
foreach ($tags as $tag) {
    $insertStmt->bind_param("ss", $username, $tag);
    $insertStmt->execute();
}
$insertStmt->close();

$conn->commit();
$conn->close();

echo json_encode(['success' => true, 'message' => '個人資料和標籤更新成功']);
?>