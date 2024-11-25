<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <title>哈希值生成器</title>
</head>
<body>
    <h1>哈希值生成器</h1>
    <form method="POST" action="">
        <label for="password">輸入密碼:</label>
        <input type="password" id="password" name="password" required>
        <button type="submit">生成哈希值</button>
    </form>

    <?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $password = $_POST['password'];

        if (!empty($password)) {
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            echo "<h2>生成的哈希值:</h2>";
            echo "<p>哈希值: $hashedPassword</p>";
            echo "<p>哈希值長度: " . strlen($hashedPassword) . "</p>";
        } else {
            echo "<p>請輸入密碼。</p>";
        }
    }
    ?>
</body>
</html>

