const express = require('express');
const app = express();

app.get('/', function(req, res) {
  res.send('OK');
});

app.listen(process.env.PORT || 10000, '0.0.0.0', function() {
  console.log('Server started');
});
