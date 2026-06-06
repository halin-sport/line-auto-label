const express = require('express');
const app = express();
app.use(express.json());

const CHANNEL_ACCESS_TOKEN = 'TOKEN';

const TAGS = [
  'A3001','A3002','A3003','A3004','A3005','A3006','A3007','A3009','A3010',
  'A3011','A3012','A3013','A3014','A3015','A3016','A3017','A5001','A5003',
  'A5004','A5005','A5006','A5007','A5008','A5009','A5010','A5011','A5012',
  'A5013','A5014','A5015','A5016','A5017','A5018','A5019','A5020','A5021',
  'A5023','A5024','A5025','A5026','A5027','A5028','A5029','A5030','A5031',
  'A5032','A5033','A5034','A5035','A5036','A5037','A5038','A5039','B5001',
  'B5002','C5001','C5002','C5003','C5004'
];

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
      if (TAGS.includes(text)) {
        addLabel(userId, text);
      }
    }
  });
});

function addLabel(userId, label) {
  const https = require('https');
  const data = JSON.stringify({ labels: [label] });
  const options = {
    hostname: 'api.line.me',
    path: '/v2/bot/chat/' + userId + '/labels',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
      'Content-Length': Buffer.byteLength(data)
    }
  };
  const req = https.request(options);
  req.write(data);
  req.end();
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', function() {
  console.log('Server running on port ' + PORT);
});
