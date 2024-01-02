const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// app middlewares
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// env variables
const PORT = process.env.PORT || 4000;

// routes
app.use("/test", (req, res) =>
  res.json("diagnostic api responding successfully ...")
);
app.use("/auth", require("./routes/auth-routes"));
app.use("/api/projects", require("./routes/project-routes"));
app.use("/api/business-canevas", require("./routes/business-canevas-routes"));

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
  // connect to the db
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to DB ..."))
    .catch((err) =>
      console.error("Error connecting to the DB xxx ", err.message)
    );
});
