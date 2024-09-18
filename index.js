import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

// PostgreSQL Client Configuration
const db = new pg.Client({
  user: "postgres",
  host: "Localhost",
  database: "postgres",
  password: "12345",
  port: "5432",
});

db.connect();

let totalCorrect = 0;
let currentQuestion = {};

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// GET home page
app.get("/", async (req, res) => {
  totalCorrect = 0;
  await nextQuestion(); // Get the next question from database
  // console.log(currentQuestion); // Log the current question
  res.render("index.ejs", { question: currentQuestion }); // Render the question to the client
});

// POST: Submit the answer
app.post("/submit", async (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect = false;

  // Check if the answer is correct
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    isCorrect = true;
  }

  // Fetch the next question and update UI
  await nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

// Function to fetch the next question from the database
async function nextQuestion() {
  try {
    // Query to get the latest questions and answers from the "capitals" table
    const result = await db.query("SELECT * FROM capitals ORDER BY id ASC");

    // If we have new questions, update the quiz array
    const rayan = result.rows.length;
    if (rayan) {
      const quiz = result.rows;
      console.log(rayan);
      // Randomly select one question from the database
      const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
      currentQuestion = randomCountry;

      // Log the new question
      console.log("New question selected: ", currentQuestion);
    } else {
      console.log("No questions found in the database");
    }
  } catch (err) {
    console.error("Error executing query: ", err.stack);
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
