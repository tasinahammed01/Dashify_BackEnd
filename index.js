const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5500;
const uri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

console.log(process.env.USER_NAME);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect(); // Optional if not required for your setup

    const passCollection = client.db("dashify").collection("eventsCollenction");

    // GET - read all events
    app.get("/events", async (req, res) => {
      const result = await passCollection.find().toArray();
      res.send(result);
    });

    // POST - create a new event
    app.post("/events", async (req, res) => {
      const newItem = req.body;
      const result = await passCollection.insertOne(newItem);
      res.send(result);
    });

    // DELETE - remove an event by ID
    app.delete("/events/:id", async (req, res) => {
      const eventId = req.params.id;
      try {
        const result = await passCollection.deleteOne({
          _id: new ObjectId(eventId),
        });

        if (result.deletedCount === 1) {
          res.status(200).send({ message: "Event deleted successfully!" });
        } else {
          res.status(404).send({ message: "Event not found!" });
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).send({ message: "Failed to delete event." });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Don't close the client here if you want to keep server alive
    // await client.close();
  }
}
run().catch(console.dir);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
