import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "capital_quiz_db_user",
  host: "dpg-d48e1lodl3ps73bb8en0-a.singapore-postgres.render.com",
  database: "capital_quiz_db",
  password: "3wzJxOQO3aP65WLqmbCvEUJfVV8dgQhd",
  port: 5432,
  ssl: {
    rejectUnauthorized: false // important for Render
  }
});

const app = express();
const port = process.env.PORT || 3000;

// Connect to DB
db.connect(err => {
  if (err) {
    console.error("Database connection error:", err.stack);
  } else {
    console.log("Database connected successfully!");
  }
});

// Load quiz data
let quiz = [];
db.query("SELECT * FROM capitals", (err, res) => {
  if (err) {
    console.error("Error executing query:", err.stack);
  } else {
    quiz = res.rows;
  }
  // Don't close DB here; keep it open for later queries
  // db.end(); <- remove this line
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

let currentQuestion = {};

// GET home page
app.get("/", async (req, res) => {
  await nextQuestion();
  console.log(currentQuestion);
  res.render("index.ejs", { question: currentQuestion });
});

// POST answer
app.post("/submit", async (req, res) => {
  let answer = req.body.capital.trim();
  let isCorrect = false;
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    isCorrect = true;
  }

  const randomNickname =
    quizNicknames[Math.floor(Math.random() * quizNicknames.length)];

  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    nickname: randomNickname
  });
});

app.get("/next", (req, res) => {
  res.redirect("/");
});

async function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  currentQuestion = randomCountry;
};

const quizNicknames = [
  "Smarty Pants", "Brainiac", "Captain Clever", "Quiz Whiz", "Brainy Bunny",
  "Clever Cookie", "Knowledge Ninja", "Smarty McSmartyface", "Quiz Genius",
  "Thinky Pants", "Mind Explorer", "Captain Factoid", "Trivia Titan",
  "Professor Knowitall", "Brainy Bee", "Quizmaster", "Bright Brain", 
  "Captain Cortex", "Smartyboots", "The Knowledgeable", "Mind Marvel",
  "Quick Thinker", "Trivia Trooper", "Captain Noggin", "Clever Clogs",
  "Brainy Wren", "The Thinker", "Quiz Wizard", "Fact Finder", "Mind Magician"
];

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
