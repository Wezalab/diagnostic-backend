const express = require("express");
const morgan = require("morgan");

// app middlewares
const app = express();
app.use(morgan("dev"));

// env variables
const PORT = process.env.PORT || 4000;

// routes
app.use("/", (req, res) =>
  res.json("diagnostic api responding successfully ...")
);
app.use("/auth", require("./routes/auth-routes"));

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
