const axios = require('axios');

async function testOllama() {
  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'llama2', // 模型名稱
      prompt: '午餐吃甚麼好 ,以中文簡短回答 ,聊天語氣',
      stream: false, // 關閉流式回應
    });

    // 獲取回應中的文本
    const aiReply = response.data.response || 'No reply received';
    console.log('Response from Ollama:', aiReply);
  } catch (error) {
    console.error('Error connecting to Ollama:', error.message);
  }
}

testOllama();
