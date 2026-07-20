
const questions = [
    {
        icon: "",
        question: "What is the capital of India?",
        answers: ["ranchi", "tirvanmalai", "Delhi", "Jaipur"],
        correctAnswer: "Delhi"
    },
    {
        icon: "",
        question: "Which is the largest 🪣 in the world?",
        answers: [
            "Indian ",
            "Atlantic",
            "Pacific ",
            "Arctic"
        ],
        correctAnswer: "Pacific "
    },
    {
        icon: "",
        question: "Who is the smartest in the world?",
        answers: ["Albert", "Nicola", "Elon", "Ayush"],
        correctAnswer: "Ayush"
    },
    {
        icon: "🧔🏼‍♀️",
        question: "What is Ayush to the People?",
        answers: ["A God", "A God", "A God", "A God"],
        correctAnswer: "A God"
    },
    {
        icon: "",
        question: "Wh0 is yoru God?",
        answers: ["Jesus", "zeus", "Narendra Modi", "Ayush"],
        correctAnswer: "Ayush"
    }
];

// Selecting elements with the DOM
const welcomeSection = document.getElementById("welcomeSection");
const quizSection = document.getElementById("quizSection");
const resultSection = document.getElementById("resultSection");

const usernameInput = document.getElementById("usernameInput");
const nameError = document.getElementById("nameError");
const startButton = document.getElementById("startButton");

const welcomeMessage = document.getElementById("welcomeMessage");
const questionNumber = document.getElementById("questionNumber");
const questionIcon = document.getElementById("questionIcon");
const questionText = document.getElementById("questionText");
const answerContainer = document.getElementById("answerContainer");

const scoreText = document.getElementById("scoreText");
const progressBar = document.getElementById("progressBar");
const feedbackMessage = document.getElementById("feedbackMessage");
const nextButton = document.getElementById("nextButton");

const finalMessage = document.getElementById("finalMessage");
const finalScore = document.getElementById("finalScore");
const resultComment = document.getElementById("resultComment");
const restartButton = document.getElementById("restartButton");

const themeButton = document.getElementById("themeButton");

// Quiz variables
let currentQuestionIndex = 0;
let score = 0;
let username = "";

// Start the quiz
startButton.addEventListener("click", startQuiz);

// Allow the user to press Enter
usernameInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        startQuiz();
    }
});

function startQuiz() {
    username = usernameInput.value.trim();

    if (username === "") {
        nameError.textContent = "Wow genius.";
        usernameInput.focus();
        return;
    }

    nameError.textContent = "";

    currentQuestionIndex = 0;
    score = 0;

    scoreText.textContent = score;
    welcomeMessage.textContent = `Player: ${username}`;

    welcomeSection.classList.add("hidden");
    resultSection.classList.add("hidden");
    quizSection.classList.remove("hidden");

    showQuestion();
}

// Display the current question
function showQuestion() {
    resetQuestion();

    const currentQuestion = questions[currentQuestionIndex];

    questionNumber.textContent =
        `Question ${currentQuestionIndex + 1} of ${questions.length}`;

    questionIcon.textContent = currentQuestion.icon;
    questionText.textContent = currentQuestion.question;

    const progress =
        ((currentQuestionIndex + 1) / questions.length) * 100;

    progressBar.style.width = `${progress}%`;

    currentQuestion.answers.forEach(function (answer) {
        const answerButton = document.createElement("button");

        answerButton.textContent = answer;
        answerButton.classList.add("answer-button");

        answerButton.addEventListener("click", function () {
            checkAnswer(answerButton, answer);
        });

        answerContainer.appendChild(answerButton);
    });
}

// Check the answer selected by the user
function checkAnswer(selectedButton, selectedAnswer) {
    const currentQuestion = questions[currentQuestionIndex];

    const allAnswerButtons =
        answerContainer.querySelectorAll(".answer-button");

    // Disable all answer buttons after one answer is selected
    allAnswerButtons.forEach(function (button) {
        button.disabled = true;
    });

    if (selectedAnswer === currentQuestion.correctAnswer) {
        selectedButton.classList.add("correct");

        feedbackMessage.textContent = "Correct, hehehehe! 🫂";
        feedbackMessage.classList.add("correct-text");

        score++;
        scoreText.textContent = score;
    } else {
        selectedButton.classList.add("incorrect");

        feedbackMessage.textContent =
            `Wrong, hahahahahaa! 🗣 .`;

        feedbackMessage.classList.add("incorrect-text");

        // Highlight the correct answer
        allAnswerButtons.forEach(function (button) {
            if (button.textContent === currentQuestion.correctAnswer) {
                button.classList.add("correct");
            }
        });
    }

    if (currentQuestionIndex === questions.length - 1) {
        nextButton.textContent = "Show Result";
    } else {
        nextButton.textContent = "Next Question";
    }

    nextButton.classList.remove("hidden");
}

// Remove data from the previous question
function resetQuestion() {
    answerContainer.innerHTML = "";

    feedbackMessage.textContent = "";
    feedbackMessage.classList.remove(
        "correct-text",
        "incorrect-text"
    );

    nextButton.classList.add("hidden");
}

// Move to next question
nextButton.addEventListener("click", function () {
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
});

// Display the final result
function showResult() {
    quizSection.classList.add("hidden");
    resultSection.classList.remove("hidden");

    finalMessage.textContent =
        `Quiz completed go away!!:`;

    finalScore.textContent = score;

    if (score === 5) {
        resultComment.textContent =
            "NERD!!!! 🥸";
    } else if (score >= 3) {
        resultComment.textContent =
            "NOT smart Enough 😔";
    } else {
        resultComment.textContent =
            "Stupid! HAHAAHAHAAHAAAAA!😏";
    }
}

// Restart quiz
restartButton.addEventListener("click", function () {
    currentQuestionIndex = 0;
    score = 0;
    username = "";

    usernameInput.value = "";
    nameError.textContent = "";
    progressBar.style.width = "0%";

    resultSection.classList.add("hidden");
    welcomeSection.classList.remove("hidden");

    usernameInput.focus();
});

// Light and dark mode
themeButton.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        themeButton.textContent = "Light Mode";
    } else {
        themeButton.textContent = "Dark Mode";
    }
});