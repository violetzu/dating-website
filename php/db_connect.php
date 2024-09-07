<?php
// 設定資料庫連接參數
$servername = "localhost";
$username = "root";
$password = "!Zjcm7JRcYIQxsHV";
$dbname = "friends";

// 嘗試建立與資料庫的連線
$conn = new mysqli($servername, $username, $password, $dbname);

// 檢查連線是否成功
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>