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
app.use("/api/entreprises", require("./routes/entreprise-routes"));
app.use("/api/business-canevas", require("./routes/business-canevas-routes"));

app.use("/api/coaching", require("./routes/coaching-routes"));
app.use("/api/session", require("./routes/session-routes"));
app.use("/api/goal", require("./routes/goal-routes"));
app.use("/api/action", require("./routes/action-routes"));
app.use("/api/social", require("./routes/social-routes"));
app.use("/api/attachement", require("./routes/attachement-routes"));

app.listen(PORT, async () => {
  console.log(`Listening on port ${PORT}`);
  console.log(`Listening on port ${process.env.url}`);
  // connect to the db

  // await mongoose
  //   .connect(process.env.url)
  //   .then(() => console.log("Connected to DB ..."))
  //   .catch((err) =>
  //     console.error("Error connecting to the DB xxx ", err.message)
  //   );

  // setTimeout(function () {
  //   mongoose
  //     .connect(process.env.url)
  //     .then(() => console.log("Connected to DB ..."))
  //     .catch((err) =>
  //       console.error("Error connecting to the DB xxx ", err.message)
  //     );
  // }, 60000);

  
		let timeout = 25;
		while (mongoose.connection.readyState === 0) {
			if (timeout === 0) {
				console.log('timeout');
				throw new Error(
					'timeout occured with mongoose connection',
				);
			}
			await mongoose.connect(process.env.url, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			});
			timeout--;
		}
		console.log(
			'Database connection status:',
			mongoose.connection.readyState,
		);
	
});
