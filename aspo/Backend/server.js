const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "https://plania-frontend.vercel.app"], 
  credentials: true
}));
app.use(express.json());

// Routes imports
const userRoutes = require("./routes/userRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const studyPlanRoutes = require("./routes/studyPlanRoutes");
const progressRoutes = require("./routes/progressRoutes");
const aiDatasetRoutes = require("./routes/aiDatasetRoutes");

// Test route
app.get("/", (req, res) => {
  res.send("AI Study Planner Backend Running 🚀");
});

// Routes use
app.use("/api/users", userRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/study-plan", studyPlanRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/ai-dataset", aiDatasetRoutes);

// Server start
const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
