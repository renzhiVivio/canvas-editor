const express = require('express');
const path = require('path');
const app = express();

const http = require('http');

//const target = "https://localhost:9093";
//app.use('/*', createProxyMiddleware({target: target, changeOrigin: true,secure:false}));

app.use(express.static(path.join(__dirname, 'build')));
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const httpsServer = http.createServer(app);
httpsServer.listen(17781);