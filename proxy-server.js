const express = require('express');
const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

const app = express();
const port = 3001;

// Initialize Google Auth
const auth = new GoogleAuth();

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Proxy all requests to Cloud Run
app.use('/api/invoice-api-stub', async (req, res) => {
  try {
    // Get ID token for Cloud Run
    const client = await auth.getIdTokenClient('https://invoice-api-stub-hibcblchwq-uc.a.run.app');
    const headers = await client.getRequestHeaders();
    
    // Forward request to Cloud Run
    const response = await axios({
      method: req.method,
      url: `https://invoice-api-stub-hibcblchwq-uc.a.run.app${req.path.replace('/api/invoice-api-stub', '')}`,
      headers: {
        ...headers,
        'Content-Type': req.headers['content-type'] || 'application/json'
      },
      data: req.body,
      params: req.query
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Proxy server error', message: error.message });
    }
  }
});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});