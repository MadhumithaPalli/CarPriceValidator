import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.get("/api", (req, res) => {
  res.send("Server is up and running");
});

const PORT = process.env.PORT || 5069;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
