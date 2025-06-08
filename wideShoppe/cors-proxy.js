const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = 3000;

// Configurar CORS para permitir solicitações do localhost
app.use(cors({
  origin: 'http://127.0.0.1:5500',
  credentials: true
}));

// Configurar o middleware de proxy
const apiProxy = createProxyMiddleware({
  target: 'https://api.dnotas.com.br',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '' // Remover o prefixo /api antes de encaminhar para o servidor
  },
  onProxyRes: function(proxyRes, req, res) {
    // Adicionar cabeçalhos CORS na resposta
    proxyRes.headers['Access-Control-Allow-Origin'] = 'http://127.0.0.1:5500';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
  }
});

// Usar o proxy para todas as solicitações /api/*
app.use('/api', apiProxy);

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Proxy CORS rodando em http://localhost:${port}`);
  console.log(`Use http://localhost:${port}/api/... para acessar https://api.dnotas.com.br/...`);
}); 