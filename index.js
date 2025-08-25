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
app.use(express.json());
app.use(cors({
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
  credentials: true
}));
app.use(morgan("dev"));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// env variables
const HTTP_PORT = process.env.HTTP_PORT || 4000;
const HTTPS_PORT = process.env.HTTPS_PORT || 4443;

// SSL Certificate configuration
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.crt'))
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
