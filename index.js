const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const https = require("https");
const http = require("http");
const fs = require("fs");
require("dotenv").config();

// app middlewares
const app = express();

// Trust proxy for production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(express.json({ limit: '10mb' }));

// Production-ready CORS configuration
const corsOptions = {
  origin: [
    'https://alphanew.coach',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://46.202.168.1:3000',
    'https://46.202.168.1:4443',
    'https://46.202.168.1:3000',
    'https://localhost:3000',
    'https://localhost:3001'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Security headers for production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
}

// Logging - production vs development
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// env variables
const HTTP_PORT = process.env.HTTP_PORT || 4000;
const HTTPS_PORT = process.env.HTTPS_PORT || 4443;

// SSL Certificate configuration
const sslKeyPath = process.env.SSL_KEY_PATH || 'ssl/server.key';
const sslCertPath = process.env.SSL_CERT_PATH || 'ssl/server.crt';

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, sslKeyPath)),
  cert: fs.readFileSync(path.join(__dirname, sslCertPath))
};

// routes
app.use("/test", (req, res) =>
  res.json("diagnostic api responding successfully ...")
);
app.use("/auth", require("./routes/auth-routes"));
app.use("/api/projects", require("./routes/project-routes"));
app.use("/api/entreprises", require("./routes/entreprise-routes"));
app.use("/api/business-canevas", require("./routes/business-canevas-routes"));

app.use("/api/coaching", require("./routes/coaching-routes"));
app.use("/api/session", require("./routes/session-routes"));
app.use("/api/goal", require("./routes/goal-routes"));
app.use("/api/action", require("./routes/action-routes"));
app.use("/api/social", require("./routes/social-routes"));
app.use("/api/attachement", require("./routes/attachement-routes"));
app.use("/api/evaluation", require("./routes/evaluation-routes"));
app.use("/api/answer", require("./routes/answer-routes"));
app.use("/api/invoice", require("./routes/invoice-routes"));
app.use("/api/upload", require("./routes/upload-routes"));
app.use("/api/coaching-requests", require("./routes/coaching_request_routes"));

// Database connection function
const connectToDatabase = async () => {
  let timeout = 25;
  while (mongoose.connection.readyState === 0) {
    if (timeout === 0) {
      console.log('timeout');
      throw new Error('timeout occured with mongoose connection');
    }
    await mongoose.connect(process.env.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    timeout--;
  }
  console.log('Database connection status:', mongoose.connection.readyState);
};

// Create HTTP server
const httpServer = http.createServer(app);
httpServer.listen(HTTP_PORT, async () => {
  console.log(`🌐 HTTP Server listening on port ${HTTP_PORT}`);
  console.log(`📡 HTTP URL: http://46.202.168.1:${HTTP_PORT}`);
  await connectToDatabase();
});

// Create HTTPS server
const httpsServer = https.createServer(sslOptions, app);
httpsServer.listen(HTTPS_PORT, () => {
  console.log(`🔒 HTTPS Server listening on port ${HTTPS_PORT}`);
  console.log(`🔐 HTTPS URL: https://46.202.168.1:${HTTPS_PORT}`);
  console.log(`✅ SSL Certificate loaded successfully`);
});
