require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
const cors = require("cors");
const { MongoClient } = require("mongodb");

app.use(cors());

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017";
const client = new MongoClient(mongoUri);

let db, countersCollection;

async function connectToMongo() {
  await client.connect();
  db = client.db("analyticsDB");
  countersCollection = db.collection("counters");

  // Ensure there's an initial document in the collection
  const initialData = { pageviews: 0, visits: 0 };
  await countersCollection.updateOne(
    { _id: "counters" },
    { $setOnInsert: initialData },
    { upsert: true }
  );
}

connectToMongo().catch(console.error);

app.get("/", (req, res) => {
  res.send({ message: "Serving..." });
});

app.get("/read", async (req, res) => {
  try {
    const counters = await countersCollection.findOne({ _id: "counters" });
    res.send(counters);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: err.message });
  }
});

app.get("/api", async (req, res) => {
  if (req.url === "/favicon.ico") {
    return res.end();
  }

  try {
    const update = {
      $inc: { pageviews: 1 },
    };

    if (req.query.type === "visit-pageview") {
      update.$inc.visits = 1;
    }

    await countersCollection.updateOne({ _id: "counters" }, update);

    const counters = await countersCollection.findOne({ _id: "counters" });
    res.send(counters);
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

// Function to make HTTP requests at regular intervals
async function hitURL() {
  try {
    const response = await axios.get(
      "https://node-server-fawn.vercel.app/read"
    );
    console.log("API Response:", response.data);
  } catch (error) {
    console.error("Error hitting URL:", error);
  }
}

// Set an interval to hit the URL every 5 minutes (300000 milliseconds)
setInterval(hitURL, 180000);
