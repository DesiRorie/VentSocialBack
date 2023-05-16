import express from "express";
import cors from "cors";
import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const urlDb = `mysql://${process.env.MYSQL_USER}:${process.env.MYSQL_PASSWORD}@${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT}/${process.env.MYSQL_DATABASE}`;
// const urlDb = {
//   host: process.env.MYSQL_HOST,
//   user: process.env.MYSQL_USER,
//   password: process.env.MYSQL_PASSWORD,
//   database: process.env.MYSQL_DATABASE,
//   port: process.env.MYSQL_PORT,
// };
const db = mysql.createConnection(urlDb);

app.post("/createPost", (req, res) => {
  console.log(req.body);
  const text = req.body.text;
  const timestamp = req.body.timestamp;
  const elapsedTime = calculateElapsedTime(timestamp);

  db.query(
    "INSERT INTO posts (text,elapsedTime, timestamp ) VALUES (?, ?, ?)",
    [text, elapsedTime, timestamp],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error inserting post");
      } else {
        res.send("Post inserted");
      }
    }
  );
});

const calculateElapsedTime = (timestamp) => {
  const currentTime = new Date().getTime();
  const timeDifference = currentTime - timestamp;
  const secondsElapsed = Math.floor(timeDifference / 1000);
  const minutesElapsed = Math.floor(timeDifference / (1000 * 60));

  if (secondsElapsed < 10) {
    return "Just now";
  } else if (minutesElapsed < 1) {
    return `${secondsElapsed} seconds ago`;
  } else if (minutesElapsed === 1) {
    return "1 minute ago";
  } else {
    return `${minutesElapsed} minutes ago`;
  }
};

app.get("/posts", (req, res) => {
  db.query("SELECT * FROM posts", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      const updatedPosts = result.map((post) => {
        return {
          ...post,
          elapsedTime: calculateElapsedTime(post.timestamp),
        };
      });
      res.send(updatedPosts);
    }
  });
});

app.listen(process.env.PORT || PORT, () => {
  console.log("server started");
});
