<?php
include 'db_connect.php'; //連接資料庫
include 'session.php'; //確保登入

$username = $_SESSION['username'];
$content = $_POST['content'];
$type = $_POST['type'];
$url = $_POST['url'] ?? null;

if ($type === 'image' && isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
    $uploadDir = '../post_picture/';  // 確保這個目錄存在且有寫入權限
    $imageName = time() . '_' . $_FILES['image']['name'];
    $uploadFile = $uploadDir . basename($imageName);
    if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadFile)) {
        $url = $uploadFile;  // 圖片上傳成功，保存圖片的URL
    }
}

// 將貼文數據插入到數據庫
$sql = "INSERT INTO Posts (username, content, type, url, created_at) VALUES (?, ?, ?, ?, NOW())";
$stmt = $conn->prepare($sql);
$stmt->bind_param('ssss', $username, $content, $type, $url);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    if ($type === 'share' && $url) {
        $updateShareCountSql = "UPDATE Posts SET share_count = share_count + 1 WHERE id = ?";
        $updateStmt = $conn->prepare($updateShareCountSql);
        $updateStmt->bind_param('i', $url);
        $updateStmt->execute();
    }
    echo json_encode(['success' => true, 'message' => '貼文發布成功']);
} else {
    echo json_encode(['success' => false, 'message' => '貼文發布失敗']);
}
$stmt->close();
$conn->close();
?>