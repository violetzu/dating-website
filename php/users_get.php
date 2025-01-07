<?php
include 'db_connect.php'; // 連接資料庫
include 'session.php'; // 確保使用者已登入


try {
    // 使用準備語句查詢用戶基本資訊和詳細資訊
    $query = "
        SELECT 
            u.id, 
            u.username, 
            u.identity, 
            u.email, 
            u.bio, 
            GROUP_CONCAT(t.tag SEPARATOR ',') AS tags 
        FROM 
            users u 
        LEFT JOIN 
            user_tags t 
        ON 
            u.username = t.username 
        GROUP BY 
            u.id ";
    
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception('準備語句失敗: ' . $conn->error);
    }

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $users = [];

        // 將查詢結果轉為陣列
        while ($row = $result->fetch_assoc()) {
            $users[] = [
                'id' => $row['id'],
                'username' => $row['username'],
                'identity' => $row['identity'],
                'email' => $row['email'],
                'bio' => $row['bio'],
                'tags' => $row['tags'] ? explode(',', $row['tags']) : [], // 將標籤字串轉為陣列
            ];
        }

        // 返回 JSON 結果
        echo json_encode(['success' => true, 'users' => $users]);
    } else {
        throw new Exception('執行查詢失敗: ' . $stmt->error);
    }

    // 釋放資源
    $stmt->close();
} catch (Exception $e) {
    // 返回錯誤訊息
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

// 關閉資料庫連線
$conn->close();
?>
