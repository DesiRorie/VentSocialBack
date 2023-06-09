import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const urlDb = {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
};

const createPool = async () => {
  try {
    const pool = mysql.createPool(urlDb);
    const connection = await pool.getConnection();
    console.log("Connected to the database!");
    return connection;
  } catch (err) {
    console.error("Error connecting to the database:", err);
    throw err;
  }
};

const dbPromise = createPool();

app.post("/createPost", async (req, res) => {
  try {
    const db = await dbPromise;
    const text = req.body.text;
    const timestamp = req.body.timestamp;
    const elapsedTime = calculateElapsedTime(timestamp);

    await db.query(
      "INSERT INTO posts (text, elapsedTime, timestamp) VALUES (?, ?, ?)",
      [text, elapsedTime, timestamp]
    );
    db.release();
    res.send("Post inserted");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error inserting post");
  }
});

const calculateElapsedTime = (timestamp) => {
  const currentTime = new Date().getTime();
  const timeDifference = currentTime - timestamp;
  const secondsElapsed = Math.floor(timeDifference / 1000);
  const minutesElapsed = Math.floor(timeDifference / (1000 * 60));
  const hoursElapsed = Math.floor(timeDifference / (1000 * 60 * 60));
  const daysElapsed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  if (secondsElapsed < 10) {
    return "Just now";
  } else if (minutesElapsed < 1) {
    return `${secondsElapsed} seconds ago`;
  } else if (minutesElapsed === 1) {
    return "1 minute ago";
  } else if (hoursElapsed < 1) {
    return `${minutesElapsed} minutes ago`;
  } else if (hoursElapsed === 1) {
    return "1 hour ago";
  } else if (daysElapsed < 1) {
    return `${hoursElapsed} hours ago`;
  } else if (daysElapsed === 1) {
    return "1 day ago";
  } else {
    return `${daysElapsed} days ago`;
  }
};

app.get("/posts", async (req, res) => {
  try {
    const db = await dbPromise;
    const [result] = await db.query("SELECT * FROM posts");

    const updatedPosts = result.map((post) => ({
      ...post,
      elapsedTime: calculateElapsedTime(post.timestamp),
    }));

    res.send(updatedPosts);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error fetching posts");
  }
});

app.get("/test", (req, res) => {
  res.send("testing");
});

app.get("/", (req, res) => {
  res.send("homepage");
});

app.listen(process.env.PORT || 9000, "0.0.0.0", () => {
  console.log("Server started");
});
