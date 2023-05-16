// import express from "express";
// import cors from "cors";
// // import mysql from "mysql";
// import mysql from "mysql2/promise";
// import dotenv from "dotenv";

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());
// // const urlDb = `mysql://${process.env.MYSQL_USER}:${process.env.MYSQL_PASSWORD}@${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT}/${process.env.MYSQL_DATABASE}`;

// const urlDb = {
//   host: process.env.MYSQLHOST,
//   user: process.env.MYSQLUSER,
//   password: process.env.MYSQLPASSWORD,
//   database: process.env.MYSQLDATABASE,
//   port: process.env.MYSQLPORT,
// };
// const db = await mysql.createConnection(urlDb);
// db.connect((err) => {
//   if (err) {
//     console.error("Error connecting to the database:", err);
//     return;
//   }
//   console.log("Connected to the database!");
// });

// app.post("/createPost", (req, res) => {
//   console.log(req.body);
//   const text = req.body.text;
//   const timestamp = req.body.timestamp;
//   const elapsedTime = calculateElapsedTime(timestamp);

//   db.query(
//     "INSERT INTO posts (text,elapsedTime, timestamp ) VALUES (?, ?, ?)",
//     [text, elapsedTime, timestamp],
//     (err, result) => {
//       if (err) {
//         console.log(err);
//         res.status(500).send("Error inserting post");
//       } else {
//         console.log(err);
//         res.send("Post inserted");
//       }
//     }
//   );
// });

// const calculateElapsedTime = (timestamp) => {
//   const currentTime = new Date().getTime();
//   const timeDifference = currentTime - timestamp;
//   const secondsElapsed = Math.floor(timeDifference / 1000);
//   const minutesElapsed = Math.floor(timeDifference / (1000 * 60));

//   if (secondsElapsed < 10) {
//     return "Just now";
//   } else if (minutesElapsed < 1) {
//     return `${secondsElapsed} seconds ago`;
//   } else if (minutesElapsed === 1) {
//     return "1 minute ago";
//   } else {
//     return `${minutesElapsed} minutes ago`;
//   }
// };

// app.get("/posts", (req, res) => {
//   db.query("SELECT * FROM posts", (err, result) => {
//     if (err) {
//       console.log(err);
//     } else {
//       const updatedPosts = result.map((post) => {
//         return {
//           ...post,
//           elapsedTime: calculateElapsedTime(post.timestamp),
//         };
//       });
//       res.send(updatedPosts);
//     }
//   });
// });
// app.get("/test", (req, res) => {
//   res.send("testing");
// });

// app.get("/", (req, res) => {
//   res.send("homepage");
// });

// app.listen(process.env.PORT || 9000, "0.0.0.0", () => {
//   console.log("Server started");
// });
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

const createConnection = async () => {
  try {
    const connection = await mysql.createConnection(urlDb);
    console.log("Connected to the database!");
    return connection;
  } catch (err) {
    console.error("Error connecting to the database:", err);
    throw err;
  }
};

const dbPromise = createConnection();

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
