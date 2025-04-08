const express = require("express");
const { Appwrite } = require("appwrite");
const cors = require("cors");
require("dotenv").config();


const app = express();
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  })
);

// Initialize Appwrite
const appwrite = new Appwrite()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);


// ----------------------
// Routes Implementation
// ----------------------

// 1. landing page route
app.get("/", (req, res) => {
  res.send("Welcome to AceHack API!");
});

// 2. login route
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Authenticate user
    const session = await appwrite.account.createSession(email, password);

    res.status(200).json(session);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

//3. logout route
app.post("/api/logout", async (req, res) => {
  try {
    const { userId } = req.body;

    // Delete session
    await appwrite.account.deleteSession(userId);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. register route
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Create Appwrite user
    const user = await appwrite.account.create(
      ID.unique(),
      email,
      password,
      name
    );

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. generatw AI design route
app.post("/api/generate-design", async (req, res) => {
  try {
    const { userId, prompt } = req.body;

    // 1. Store user selfie (mock implementation)
    const file = await appwrite.storage.createFile(
      "user-selfies",
      ID.unique(),
      req.files.selfie
    );

    // 2. Generate design (mock AI integration)
    const designFile = await appwrite.storage.createFile(
      "design-outputs",
      ID.unique(),
      Buffer.from("mock-design-data")
    );

    // 3. Save to database
    const design = await appwrite.database.createDocument(
      "designs",
      ID.unique(),
      {
        userId,
        prompt,
        imageUrl: designFile.$id,
      }
    );

    res.json(design);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. tailor connect route
app.get("/api/nearby-tailors", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    const tailors = await appwrite.database.listDocuments("tailors", [
      Query.near("location", lat, lng, 10), // 10km radius
    ]);

    res.json(tailors.documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const rateLimit = require("express-rate-limit");
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
