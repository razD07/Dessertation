const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { google } = require('googleapis');
const { uploadFile } = require("./googleDrive");

const app = express();
app.use(cors());
app.use(express.json());

const CONNECTION_STRING = "mongodb+srv://admin:chiraz1996@cluster0.ktvrcpe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DATABASENAME = "tester";
const JWT_SECRET = "jwt_secret";
let database;

const connectToDatabase = async () => {
  try {
    const client = await MongoClient.connect(CONNECTION_STRING);
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

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Central error handling middleware
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// Route for checking database connection status
app.get("/", (req, res) => {
  if (database) {
    res.send("Database connected successfully");
  } else {
    res.status(500).send("Database connection failed");
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
      const token = jwt.sign(
        { userId: result.insertedId, email, userType: "GP", name },
        JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      res.status(201).send({ message: "GP registered successfully",userType: "GP", token,userId:result.insertedId });
    } else {
      throw new Error("Failed to insert GP data");
    }
  } catch (error) {
    console.error("Error registering GP:", error);
    res.status(500).send({ error: "Cannot register GP" });
  }
});

app.post("/register/public", multer().none(), async (req, res) => {
  const { name, email, phoneNumber, address, dob, password } = req.body;
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
      dob,
      password: hashedPassword,
      registeredGP: null, // Initialize with no registered GP
      appointments: [], // Initialize with no appointments
    };
    const result = await database
      .collection("publicUsersCollection")
      .insertOne(publicData);

    if (result.insertedId) {
      const token = jwt.sign(
        { userId: result.insertedId, email, userType: "Public", name },
        JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      res
        .status(201)
        .send({ message: "Public user registered successfully", token,userType: "Public" ,userId: result.insertedId});
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

    res.send({
      message: "Login successful",
      token,
      userType,
      userId: user._id,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send({ error: "Login failed" });
  }
});

// Route to fetch the list of GPs
app.get("/api/gps", async (req, res) => {
  try {
    const gps = await database.collection("gpCollection").find({}).toArray();
    res.send(gps);
  } catch (error) {
    console.error("Error fetching GPs:", error);
    res.status(500).send({ error: "An error occurred while fetching GPs." });
  }
});

// Route to register a public user with a selected GP
app.post("/api/registerWithGP", async (req, res) => {
  const { publicUserId, gpId } = req.body;

  if (!publicUserId || !gpId) {
    return res
      .status(400)
      .send({ error: "Public user ID and GP ID are required" });
  }

  try {
    const publicUserCollection = database.collection("publicUsersCollection");

    // Update the registered GP for the public user
    await publicUserCollection.updateOne(
      { _id: new ObjectId(publicUserId) },
      { $set: { registeredGP: gpId } }
    );

    res.send({ message: "Successfully registered with GP" });
  } catch (error) {
    console.error("Error registering with GP:", error);
    res
      .status(500)
      .send({ error: "An error occurred while registering with GP" });
  }
});

// Route to fetch the list of public users registered to a specific GP
app.get("/api/publicUsers/:gpId", async (req, res) => {
  const { gpId } = req.params;
  console.log("gp", gpId);
  try {
    const publicUsers = await database
      .collection("publicUsersCollection")
      .find({ registeredGP: gpId })
      .toArray();

    res.send(publicUsers);
  } catch (error) {
    console.error("Error fetching public users:", error);
    res
      .status(500)
      .send({ error: "An error occurred while fetching public users." });
  }
});

// Route to fetch the registered GP for a specific public user
app.get("/api/registeredGP/:publicUserId", async (req, res) => {
  const { publicUserId } = req.params;

  try {
    const publicUser = await database
      .collection("publicUsersCollection")
      .findOne({ _id: new ObjectId(publicUserId) });

    if (publicUser && publicUser.registeredGP) {
      const gp = await database
        .collection("gpCollection")
        .findOne({ _id: new ObjectId(publicUser.registeredGP) });

      res.send(gp);
    } else {
      res.status(404).send({ error: "No registered GP found for this user." });
    }
  } catch (error) {
    console.error("Error fetching registered GP:", error);
    res
      .status(500)
      .send({ error: "An error occurred while fetching registered GP." });
  }
});

// Route to fetch the registered GP for a public user
app.get("/api/registeredGP/:publicUserId", async (req, res) => {
  const { publicUserId } = req.params;

  try {
    const publicUserCollection = database.collection("publicUsersCollection");
    const publicUser = await publicUserCollection.findOne({
      _id: new ObjectId(publicUserId),
    });

    if (!publicUser) {
      return res.status(404).send({ error: "Public user not found" });
    }

    if (!publicUser.registeredGP) {
      return res.status(404).send({ error: "No GP registered" });
    }

    const gpCollection = database.collection("gpCollection");
    const registeredGP = await gpCollection.findOne({
      _id: new ObjectId(publicUser.registeredGP),
    });

    res.send(registeredGP);
  } catch (error) {
    console.error("Error fetching registered GP:", error);
    res
      .status(500)
      .send({ error: "An error occurred while fetching the registered GP" });
  }
});

// Route to set GP availability
app.post("/api/setAvailability", async (req, res) => {
  const { gpId, availability } = req.body;

  if (!gpId || !availability) {
    return res.status(400).send({ error: "GP ID and availability are required" });
  }

  try {
    const formattedAvailability = {};

    // Ensure each day's availability is an array
    for (const day in availability) {
      if (availability[day] && typeof availability[day] === 'string') {
        formattedAvailability[day] = availability[day].split(',').map(slot => slot.trim());
      } else if (Array.isArray(availability[day])) {
        formattedAvailability[day] = availability[day];
      } else {
        formattedAvailability[day] = [];
      }
    }

    const gpCollection = database.collection("gpCollection");
    await gpCollection.updateOne(
      { _id: new ObjectId(gpId) },
      { $set: { availability: formattedAvailability } }
    );

    res.send({ message: "Availability set successfully" });
  } catch (error) {
    console.error("Error setting availability:", error);
    res.status(500).send({ error: "An error occurred while setting availability" });
  }
});

// Route to fetch GP availability
app.get("/api/getAvailability/:gpId", async (req, res) => {
  const { gpId } = req.params;

  try {
    const gpCollection = database.collection("gpCollection");
    const gp = await gpCollection.findOne({ _id: new ObjectId(gpId) });

    if (!gp) {
      return res.status(404).send({ error: "GP not found" });
    }

    res.send({ availability: gp.availability });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res
      .status(500)
      .send({ error: "An error occurred while fetching availability" });
  }
});

// Route to book an appointment
app.post("/api/bookAppointment", async (req, res) => {
  const { publicUserId, date, time } = req.body;

  if (!publicUserId || !date || !time) {
    return res.status(400).send({ error: "All fields are required" });
  }

  try {
    const publicUserCollection = database.collection("publicUsersCollection");
    const gpCollection = database.collection("gpCollection");

    const publicUser = await publicUserCollection.findOne({
      _id: new ObjectId(publicUserId),
    });

    if (!publicUser) {
      return res.status(404).send({ error: "Public user not found" });
    }

    if (publicUser.appointments && publicUser.appointments.length > 0) {
      return res.status(400).send({ error: "User already has an appointment" });
    }

    const dayOfWeek = new Date(date).toLocaleString("en-US", { weekday: "long" });
    const [start, end] = time.split(" - ");

    const gp = await gpCollection.findOne({ _id: new ObjectId(publicUser.registeredGP) });

    if (!gp) {
      return res.status(404).send({ error: "GP not found" });
    }

    // Split the availability slot for the appointment
    let newAvailability = [];
    gp.availability[dayOfWeek].forEach((slot) => {
      const splitSlots = splitSlot(slot, `${start}-${end}`);
      newAvailability = newAvailability.concat(splitSlots);
    });

    newAvailability = newAvailability.filter((slot) => slot !== "-");

    await gpCollection.updateOne(
      { _id: new ObjectId(publicUser.registeredGP) },
      { $set: { [`availability.${dayOfWeek}`]: newAvailability } }
    );

    await publicUserCollection.updateOne(
      { _id: new ObjectId(publicUserId) },
      { $push: { appointments: { date, time, gpId: publicUser.registeredGP } } }
    );

    res.send({ message: "Appointment booked successfully" });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).send({ error: "An error occurred while booking the appointment" });
  }
});

// Route to get upcoming appointments for a user (public or GP)
app.get("/api/upcomingAppointments/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const publicUserCollection = database.collection("publicUsersCollection");
    const gpCollection = database.collection("gpCollection");

    // Check if the user is a public user
    let user = await publicUserCollection.findOne({ _id: new ObjectId(userId) });

    if (user) {
      // If the user is a public user, return their upcoming appointments
      const upcomingAppointments = user.appointments || [];
      return res.send(upcomingAppointments);
    }

    // If not a public user, check if the user is a GP
    user = await gpCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // If the user is a GP, search for all public users' appointments associated with this GP
    const publicUsers = await publicUserCollection
      .find({ appointments: { $exists: true, $not: { $size: 0 } } })
      .toArray();

    // Filter appointments related to this GP
    const gpAppointments = [];
    publicUsers.forEach((publicUser) => {
      publicUser.appointments.forEach((appointment) => {
        if (appointment.gpId === userId) {
          gpAppointments.push({
            userName: publicUser.name,
            appointmentDate: appointment.date,
            appointmentTime: appointment.time,
          });
        }
      });
    });

    res.send(gpAppointments);
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    res.status(500).send({ error: "An error occurred while fetching upcoming appointments." });
  }
});


// Route to cancel an appointment
app.post("/api/cancelAppointment", async (req, res) => {
  const { publicUserId } = req.body;

  if (!publicUserId) {
    return res.status(400).send({ error: "Public user ID is required" });
  }

  try {
    const publicUserCollection = database.collection("publicUsersCollection");
    const gpCollection = database.collection("gpCollection");

    const publicUser = await publicUserCollection.findOne({
      _id: new ObjectId(publicUserId),
    });

    if (!publicUser || !publicUser.appointments || publicUser.appointments.length === 0) {
      return res.status(404).send({ error: "No appointment found to cancel" });
    }

    const appointment = publicUser.appointments[0]; // Assuming there's only one appointment
    const { date, time, gpId } = appointment;

    const dayOfWeek = new Date(date).toLocaleString("en-US", { weekday: "long" });
    const [start, end] = time.split(" - ");

    let availability = await gpCollection.findOne(
      { _id: new ObjectId(gpId) },
      { projection: { [`availability.${dayOfWeek}`]: 1 } }
    );

    // Push the canceled appointment time back into availability and merge slots
    availability = mergeSlots(availability.availability[dayOfWeek], `${start}-${end}`);

    await gpCollection.updateOne(
      { _id: new ObjectId(gpId) },
      { $set: { [`availability.${dayOfWeek}`]: availability } }
    );

    await publicUserCollection.updateOne(
      { _id: new ObjectId(publicUserId) },
      { $set: { appointments: [] } }
    );

    res.send({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).send({ error: "An error occurred while cancelling the appointment." });
  }
});

// Fetch user details by ID
app.get("/api/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const gpUser = await database.collection("gpCollection").findOne({ _id: new ObjectId(userId) });
    const publicUser = await database.collection("publicUsersCollection").findOne({ _id: new ObjectId(userId) });

    const user = gpUser || publicUser;
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.send(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).send({ error: "An error occurred while fetching user details." });
  }
});

// Update user details
app.put("/api/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const { password, _id, ...updatedDetails } = req.body; // Exclude _id from the update

  try {
    if (password) {
      updatedDetails.password = await bcrypt.hash(password, 10);
    }

    const gpUser = await database.collection("gpCollection").findOne({ _id: new ObjectId(userId) });
    const publicUser = await database.collection("publicUsersCollection").findOne({ _id: new ObjectId(userId) });

    if (gpUser) {
      await database.collection("gpCollection").updateOne(
        { _id: new ObjectId(userId) },
        { $set: updatedDetails }
      );
    } else if (publicUser) {
      await database.collection("publicUsersCollection").updateOne(
        { _id: new ObjectId(userId) },
        { $set: updatedDetails }
      );
    } else {
      return res.status(404).send({ error: "User not found" });
    }

    res.send({ message: "User details updated successfully" });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).send({ error: "An error occurred while updating user details." });
  }
});


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "tempUploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Upload profile photo
app.post("/api/user/uploadPhoto/:userId", upload.single("profilePhoto"), async (req, res) => {
  const { userId } = req.params;

  if (!req.file) {
    return res.status(400).send({ error: "No file uploaded" });
  }

  try {
    const response = await uploadFile(req.file.path, req.file.filename);
    const profilePhotoUrl = response.url;

    const gpUser = await database.collection("gpCollection").findOne({ _id: new ObjectId(userId) });
    const publicUser = await database.collection("publicUsersCollection").findOne({ _id: new ObjectId(userId) });

    if (gpUser) {
      await database.collection("gpCollection").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { profilePhoto: profilePhotoUrl } }
      );
    } else if (publicUser) {
      await database.collection("publicUsersCollection").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { profilePhoto: profilePhotoUrl } }
      );
    } else {
      return res.status(404).send({ error: "User not found" });
    }

    // Delete the file from the server after uploading to Google Drive
    fs.unlinkSync(req.file.path);

    res.send({ message: "Profile photo uploaded successfully", profilePhotoUrl });
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    res.status(500).send({ error: "An error occurred while uploading profile photo." });
  }
});


function splitSlot(slot, appointmentTime) {
  const [slotStart, slotEnd] = slot.split("-");
  const [appStart, appEnd] = appointmentTime.split("-");

  if (slotStart <= appStart && slotEnd >= appEnd) {
    return [`${slotStart}-${appStart}`, `${appEnd}-${slotEnd}`];
  }

  return [slot];
}

function mergeSlots(slots, canceledTime) {
  slots.push(canceledTime);
  slots.sort((a, b) => {
    const [aStart] = a.split("-");
    const [bStart] = b.split("-");
    return new Date(`1970-01-01T${aStart}Z`) - new Date(`1970-01-01T${bStart}Z`);
  });

  const merged = [];
  let current = slots[0];

  for (let i = 1; i < slots.length; i++) {
    const [currentStart, currentEnd] = current.split("-");
    const [nextStart, nextEnd] = slots[i].split("-");

    if (currentEnd === nextStart) {
      current = `${currentStart}-${nextEnd}`;
    } else {
      merged.push(current);
      current = slots[i];
    }
  }
  merged.push(current);

  return merged;
}

// Submit review and rating
app.post("/api/review", async (req, res) => {
  const { userId, gpId, rating, review } = req.body;

  if (!userId || !gpId || rating == null || !review) {
    return res.status(400).send({ error: "All fields are required" });
  }

  try {
    const publicUserCollection = database.collection("publicUsersCollection");
    const gpCollection = database.collection("gpCollection");

    const publicUser = await publicUserCollection.findOne({ _id: new ObjectId(userId) });
    const gp = await gpCollection.findOne({ _id: new ObjectId(gpId) });

    if (!publicUser || !gp) {
      return res.status(404).send({ error: "User or GP not found" });
    }

    if (publicUser.registeredGP !== gpId) {
      return res.status(403).send({ error: "User is not registered with this GP" });
    }

    const reviewData = {
      gpId,
      rating,
      review,
      userName: publicUser.name,
      userProfilePhoto: publicUser.profilePhoto,
      date: new Date()
    };

    await publicUserCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { reviews: reviewData } }
    );

    res.send({ message: "Review submitted successfully" });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).send({ error: "An error occurred while submitting the review" });
  }
});

// Fetch GP reviews and average rating
app.get("/api/gp/reviews/:gpId", async (req, res) => {
  const { gpId } = req.params;

  try {
    const publicUserCollection = database.collection("publicUsersCollection");
    const reviews = await publicUserCollection
      .aggregate([
        { $match: { "reviews.gpId": gpId } },
        { $unwind: "$reviews" },
        { $match: { "reviews.gpId": gpId } },
        {
          $lookup: {
            from: "publicUsersCollection",
            localField: "_id",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },
        {
          $group: {
            _id: null,
            reviews: {
              $push: {
                rating: "$reviews.rating",
                review: "$reviews.review",
                userName: "$user.name",
                userProfilePhoto: "$user.profilePhoto"
              }
            },
            averageRating: { $avg: "$reviews.rating" }
          }
        }
      ])
      .toArray();

    const result = reviews[0] || { reviews: [], averageRating: 0 };
    res.send(result);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).send({ error: "An error occurred while fetching reviews" });
  }
});


module.exports = app;
