const express = require('express');
const app = express();
app.use(express.json());
 
const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
 
const TAGS = [
  'A3001','A3002','A3003','A3004','A3005','A3006','A3007','A3009','A3010',
  'A3011','A3012','A3013','A3014','A3015','A3016','A3017','A5001','A5003',
  'A5004','A5005','A5006','A5007','A5008','A5009','A5010','A5011','A5012',
  'A5013','A5014','A5015','A5016','A5017','A5018','A5019','A5020','A5021',
  'A5023','A5024','A5025','A5026','A5027','A5028','A5029','A5030','A5031',
  'A5032','A5033','A5034','A5035','A5036','A5037','A5038','A5039','B5001',
  'B5002','C5001','C5002','C5003','C5004'
];
 
const audienceMap = {};
 
app.get('/', function(req, res) {
  res.status(200).send('OK');
});
 
app.post('/webhook', function(req, res) {
  res.status(200).send('OK');
  const events = req.body.events || [];
  events.forEach(function(event) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userId = event.source.userId;
      const text = event.message.text.trim().toUpperCase();
      console.log('收到訊息：', text, '來自：', userId);
      if (TAGS.includes(text)) {
        console.log('符合代號：', text);
        addToAudience(userId, text);
      }
    }
  });
});
 
async function addToAudience(userId, tag) {
  try {
    if (!audienceMap[tag]) {
      console.log('建立受眾群組：', tag);
      const audienceId = await createAudience(tag);
      if (audienceId) {
        audienceMap[tag] = audienceId;
        console.log('受眾群組建立成功：', tag, audienceId);
      } else {
        console.log('建立受眾群組失敗：', tag);
        return;
      }
    }
    await addUserToAudience(audienceMap[tag], userId, tag);
  } catch(err) {
    console.log('錯誤：', err.message);
  }
}
 
function createAudience(tag) {
  return new Promise(function(resolve, reject) {
    const https = require('https');
    const data = JSON.stringify({
      description: tag + ' 門市客人',
      isIfaAudience: false,
      audiences: []
    });
    const options = {
      hostname: 'api.line.me',
      path: '/v2/bot/audienceGroup/upload',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Length': Buffer.byteLength(data)
      }
    };
    const req = https.request(options, function(res) {
      let body = '';
      res.on('data', function(d) { body += d; });
      res.on('end', function() {
        console.log('建立受眾回應：', res.statusCode, body);
        try {
          const json = JSON.parse(body);
          resolve(json.audienceGroupId);
        } catch(e) {
          resolve(null);
        }
      });
    });
    req.on('error', function(e) {
      console.log('建立受眾錯誤：', e.message);
      resolve(null);
    });
    req.write(data);
    req.end();
  });
}
 
function addUserToAudience(audienceGroupId, userId, tag) {
  return new Promise(function(resolve, reject) {
    const https = require('https');
    const data = JSON.stringify({
      audienceGroupId: audienceGroupId,
      audiences: [{ id: userId }]
    });
    const options = {
      hostname: 'api.line.me',
      path: '/v2/bot/audienceGroup/upload',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Length': Buffer.byteLength(data)
      }
    };
    const req = https.request(options, function(res) {
      let body = '';
      res.on('data', function(d) { body += d; });
      res.on('end', function() {
        console.log('加入受眾回應：', res.statusCode, body, '用戶：', userId, '群組：', tag);
        resolve();
      });
    });
    req.on('error', function(e) {
      console.log('加入受眾錯誤：', e.message);
      resolve();
    });
    req.write(data);
    req.end();
  });
}
 
app.listen(process.env.PORT || 10000, '0.0.0.0', function() {
  console.log('Server started');
});
 


