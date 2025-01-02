import { securityMiddleware } from './middleware/security';

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 

app.use(securityMiddleware.helmet);
app.use(securityMiddleware.methodCheck);
app.use(securityMiddleware.authCheck); 