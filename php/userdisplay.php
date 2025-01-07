// userdisplay.php
<?php
include 'db_connect.php'; 
include 'session.php'; 

$data = json_decode(file_get_contents('php://input'), true); 
$username = $conn->real_escape_string($data['username']);  // 清理用戶名以防 SQL 注入

// 查詢用戶的個性簽名
$sql = "SELECT bio FROM users WHERE username = '$username'";
$result = $conn->query($sql);
$bio = '';
if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    $bio = $user['bio'];  
}

// 查詢用戶的標籤
$sqlTags = "SELECT tag FROM user_tags WHERE username = '$username'";
$resultTags = $conn->query($sqlTags);
$tags = [];  
if ($resultTags->num_rows > 0) {
    while ($row = $resultTags->fetch_assoc()) {
        $tags[] = $row['tag'];  
    }
}

// 返回 JSON 對象，包括個性簽名和標籤（如果查詢為空則返回空值）
echo json_encode(['success' => true, 'bio' => $bio, 'tags' => $tags]);

$conn->close();  // 關閉資料庫連接
?>