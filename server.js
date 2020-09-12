const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

//Init middleware
app.use(cors());

//Enable our backend to parse the body object of the route requests. We used to have to import body parser but now we can simply use this.
app.use(express.json({ extended: false }));

//Connect database
connectDB();

app.get("/", (req, res) => res.send("Backend is operational."));

//Define routes
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/users", require("./routes/api/users"));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
