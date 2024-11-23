const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');

// 使用 Cloudflare 提供的原點證書
const server = https.createServer({
  cert: fs.readFileSync('C:/wamp64/bin/apache/apache2.4.59/conf/certs/server.pem'), // Cloudflare 原點證書路徑
  key: fs.readFileSync('C:/wamp64/bin/apache/apache2.4.59/conf/certs/server.key')    // 私鑰路徑
});

const wss = new WebSocket.Server({ server });

// 儲存聊天紀錄的文件
const chatLogFile = 'chat_log.txt';

wss.on('connection', (ws) => {
  console.log('Client connected');

  // 當有新客戶端連接時，將聊天紀錄發送給他
  fs.readFile(chatLogFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading chat log file:', err);
    } else {
      if (data) {
        const messages = data.split('\n').filter(line => line.trim() !== ''); // 按行分割，並過濾掉空行
        messages.forEach((message) => {
          ws.send(message); // 逐條發送消息給新連接的客戶端
        });
      }
    }
  });
  
  // 當收到新消息時，儲存到文件中並廣播給所有連接的客戶端
  ws.on('message', (message) => {
    console.log(`Received: ${message}`);

    let parsedMessage;
    try {
      parsedMessage = JSON.parse(message);
    } catch (error) {
      console.error('Failed to parse incoming message as JSON:', error);
      return;
    }

    // 將新消息附加到聊天紀錄文件中
    fs.appendFile(chatLogFile, `${message}\n`, (err) => {
      if (err) {
        console.error('Failed to write message to chat log file:', err);
      }
    });

    // 廣播消息給所有客戶端
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(parsedMessage));
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// 使用 HTTPS server 提供加密保護，並設定 WebSocket Server 的 port
server.listen(2053, () => {
  console.log('WebSocket server is running on wss://localhost:2053');
});
