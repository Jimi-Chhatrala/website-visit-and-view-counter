const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const path = require("path");

app.use(cors());

app.get("/", (req, res) => {
  res.send({ message: "Serving...(1)" });
});

app.get("/read", (req, res) => {
  try {
    const json = fs.readFileSync(path.join(__dirname, "count.json"), "utf-8");
    const obj = JSON.parse(json);
    res.send(obj);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: err.message });
  }
});

app.get("/api", function (req, res) {
  if (req.url === "/favicon.ico") {
    return res.end();
  }

  try {
    const json = fs.readFileSync(path.join(__dirname, "count.json"), "utf-8");
    const obj = JSON.parse(json);

    obj.pageviews = obj.pageviews + 1;
    if (req.query.type === "visit-pageview") {
      obj.visits = obj.visits + 1;
    }

    const newJSON = JSON.stringify(obj);
    fs.writeFileSync(path.join(__dirname, "count.json"), newJSON);

    res.send(obj);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: err.message });
  }
});

app.listen(3002, () => {
  console.log("Server running on port 3002");
});
