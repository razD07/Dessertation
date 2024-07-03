const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const CONNECTION_STRING =
  "mongodb+srv://admin:chiraz1996@cluster0.ktvrcpe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DATABASENAME = "tester";
const JWT_SECRET = "your_jwt_secret"; // Change this to a more secure secret
let database;

const connectToDatabase = async () => {
  try {
    const client = await MongoClient.connect(CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    database = client.db(DATABASENAME);
    console.log("Connected to database successfully");
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1); // Exit the process if the database connection fails
  }
};

connectToDatabase();

app.listen(5038, () => {
  console.log("Server is running on port 5038");
});

// Route for checking database connection status
app.get("/", (req, res) => {
  if (database) {
    res.send("Database connected successfully");
  } else {
    res.status(500).send("Database connection failed");
  }
});

// Define routes after successful database connection
app.get("/Tester/GetTest", async (req, res) => {
  try {
    const result = await database
      .collection("testerCollection")
      .find({})
      .toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send({ error: "An error occurred while fetching data." });
  }
});

app.post("/Tester/AddTest", multer().none(), async (req, res) => {
  try {
    const numOfDocs = await database
      .collection("testerCollection")
      .countDocuments({});
    await database.collection("testerCollection").insertOne({
      id: (numOfDocs + 1).toString(),
      description: req.body.newNotes,
    });
    res.json("Added Successfully");
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).send({ error: "Cannot add data" });
  }
});

app.delete("/Tester/DeleteTest", async (req, res) => {
  try {
    await database.collection("testerCollection").deleteOne({
      id: req.query.id,
    });
    res.json("Deleted Successfully");
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).send({ error: "Cannot delete data" });
  }
});

// New route to check if a user already exists
app.get("/checkUserExists", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).send({ error: "Email query parameter is required" });
  }

  try {
    const existingUser =
      (await database.collection("gpCollection").findOne({ email })) ||
      (await database.collection("publicUsersCollection").findOne({ email }));
    debugger;
    if (existingUser) {
      return res.status(200).send({ exists: true });
    }

    res.status(200).send({ exists: false });
  } catch (error) {
    console.error("Error checking user existence:", error);
    res
      .status(500)
      .send({ error: "An error occurred while checking user existence" });
  }
});

// New routes for GP and Public registration
app.post("/register/gp", multer().none(), async (req, res) => {
  const { name, email, clinicName, phoneNumber, address, password } = req.body;
  if (!password || password.length < 6) {
    return res
      .status(400)
      .send({ error: "Password must be at least 6 characters long" });
  }
  try {
    const existingUser = await database
      .collection("gpCollection")
      .findOne({ email });
    if (existingUser) {
      return res.status(400).send({ error: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const gpData = {
      name,
      email,
      clinicName,
      phoneNumber,
      address,
      password: hashedPassword,
    };
    const result = await database.collection("gpCollection").insertOne(gpData);

    if (result.insertedId) {
      res.status(201).send({ id: result.insertedId, ...gpData });
    } else {
      throw new Error("Failed to insert GP data");
    }
  } catch (error) {
    console.error("Error registering GP:", error);
    res.status(500).send({ error: "Cannot register GP" });
  }
});

app.post("/register/public", multer().none(), async (req, res) => {
  const { name, email, phoneNumber, address, password } = req.body;
  if (!password || password.length < 6) {
    return res
      .status(400)
      .send({ error: "Password must be at least 6 characters long" });
  }
  try {
    const existingUser = await database
      .collection("publicUsersCollection")
      .findOne({ email });
    if (existingUser) {
      return res.status(400).send({ error: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const publicData = {
      name,
      email,
      phoneNumber,
      address,
      password: hashedPassword,
    };
    const result = await database
      .collection("publicUsersCollection")
      .insertOne(publicData);

    if (result.insertedId) {
      res.status(201).send({ id: result.insertedId, ...publicData });
    } else {
      throw new Error("Failed to insert public user data");
    }
  } catch (error) {
    console.error("Error registering public user:", error);
    res.status(500).send({ error: "Cannot register public user" });
  }
});

// Login route
app.post("/login", multer().none(), async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists in either gpCollection or publicUsersCollection
    const gpUser = await database.collection("gpCollection").findOne({ email });
    const publicUser = await database
      .collection("publicUsersCollection")
      .findOne({ email });

    let user = gpUser || publicUser;
    let userType = gpUser ? "GP" : publicUser ? "Public" : null;

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // Check if password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).send({ error: "Invalid password" });
    }

    // Create a JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, userType, name: user.name },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.send({ message: "Login successful", token, userType });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send({ error: "Login failed" });
  }
});
