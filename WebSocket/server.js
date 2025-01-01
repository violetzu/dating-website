const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');
const axios = require('axios');

// 使用 Cloudflare 提供的原點證書
const server = https.createServer({
  cert: fs.readFileSync('C:/wamp64/bin/apache/apache2.4.59/conf/certs/server.pem'), // Cloudflare 原點證書路徑
  key: fs.readFileSync('C:/wamp64/bin/apache/apache2.4.59/conf/certs/server.key')    // 私鑰路徑
});

const wss = new WebSocket.Server({ server });

// 儲存聊天紀錄的文件
const chatLogFile = 'chat_log.txt';

// AI 回應函數
async function handleCommand(command, ws, username) {
  // 廣播使用者的原始指令
  const userCommandMessage = JSON.stringify({ username, message: command });
  broadcastMessage(userCommandMessage);

  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'llama2', // 模型名稱
      prompt: command.substring(1), // 去除 '/' 的內容作為 prompt
      stream: false, // 關閉流式回應
    });

    const aiReply = response.data.response || 'AI 沒有回應';
    const aiMessage = JSON.stringify({ username: 'AI', message: aiReply });

    // 廣播 AI 回應
    broadcastMessage(aiMessage);
  } catch (error) {
    console.error('Error connecting to Ollama:', error.message);
    const errorMessage = JSON.stringify({ username: 'AI', message: 'AI 無法回應，請稍後再試。' });
    ws.send(errorMessage);
  }
}

// 廣播訊息給所有客戶端
function broadcastMessage(message) {
  // 儲存訊息到聊天紀錄文件
  fs.appendFile(chatLogFile, `${message}\n`, (err) => {
    if (err) {
      console.error('Failed to write message to chat log file:', err);
    }
  });

  // 廣播訊息
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on('connection', (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`Client connected: ${clientIP}`);

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

  // 當收到新消息時，儲存到文件中並廣播或處理命令
  ws.on('message', async (message) => {
    console.log(`Received from ${clientIP}: ${message}`);

    let parsedMessage;
    try {
      parsedMessage = JSON.parse(message);
    } catch (error) {
      console.error('Failed to parse incoming message as JSON:', error);
      return;
    }

    const { username, message: userMessage } = parsedMessage;

    if (userMessage.startsWith('/')) {
      // 處理命令並廣播原始指令
      await handleCommand(userMessage, ws, username);
    } else {
      // 廣播一般訊息
      broadcastMessage(message);
    }
  });

  ws.on('close', () => {
    console.log(`Client disconnected: ${clientIP}`);
  });
});

// 使用 HTTPS server 提供加密保護，並設定 WebSocket Server 的 port
server.listen(2053, () => {
  console.log('WebSocket server is running on wss://localhost:2053');
});
