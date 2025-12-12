// Quiz State
let quizData = {};
let quizQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let timerInterval = null;
let timeRemaining = 50 * 60; // 50 minutes in seconds
let quizStartTime = null;

// Section names mapping
const sectionMapping = {
    'ProgramLogic': 'Program Logic',
    'HTML': 'HTML',
    'CSS': 'CSS',
    'JS': 'JavaScript',
    'SQL': 'SQL',
    'PHP': 'PHP'
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadQuizData();
    checkForSavedProgress();
    setupEventListeners();
});

// Load quiz data from JSON file
async function loadQuizData() {
    try {
        const response = await fetch('quiz-data.json');
        quizData = await response.json();
    } catch (error) {
        console.error('Error loading quiz data:', error);
        alert('Error loading quiz data. Please refresh the page.');
    }
}

// Check for saved progress in localStorage
function checkForSavedProgress() {
    const savedState = localStorage.getItem('quizState');
    if (savedState) {
        const resumeBtn = document.getElementById('resumeQuizBtn');
        resumeBtn.style.display = 'inline-block';
    }
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('startQuizBtn').addEventListener('click', startNewQuiz);
    document.getElementById('resumeQuizBtn').addEventListener('click', resumeQuiz);
    document.getElementById('prevBtn').addEventListener('click', () => navigateQuestion(-1));
    document.getElementById('nextBtn').addEventListener('click', () => navigateQuestion(1));
    document.getElementById('submitBtn').addEventListener('click', submitQuiz);
    document.getElementById('retakeBtn').addEventListener('click', retakeQuiz);
    document.getElementById('reviewBtn').addEventListener('click', reviewAnswers);
}

// Start a new quiz
function startNewQuiz() {
    localStorage.removeItem('quizState');
    initializeQuiz();
    showScreen('quizScreen');
    startTimer();
}

// Resume saved quiz
function resumeQuiz() {
    const savedState = JSON.parse(localStorage.getItem('quizState'));
    if (savedState) {
        quizQuestions = savedState.questions;
        userAnswers = savedState.answers;
        currentQuestionIndex = savedState.currentIndex;
        timeRemaining = savedState.timeRemaining;
        quizStartTime = savedState.startTime;
        
        showScreen('quizScreen');
        displayQuestion();
        updateQuestionNavigator();
        startTimer();
    }
}

// Initialize quiz with random questions
function initializeQuiz() {
    quizQuestions = [];
    userAnswers = [];
    currentQuestionIndex = 0;
    timeRemaining = 50 * 60;
    quizStartTime = Date.now();

    // Select 10 random questions from each section
    const sections = ['ProgramLogic', 'HTML', 'CSS', 'JS', 'SQL', 'PHP'];
    
    sections.forEach(section => {
        const sectionQuestions = quizData[section];
        const selectedQuestions = getRandomQuestions(sectionQuestions, 10);
        selectedQuestions.forEach(q => {
            quizQuestions.push({
                ...q,
                section: section,
                sectionName: sectionMapping[section]
            });
        });
    });

    // Initialize user answers array
    userAnswers = new Array(quizQuestions.length).fill(null);
    
    displayQuestion();
    updateQuestionNavigator();
}

// Get random questions from an array
function getRandomQuestions(questions, count) {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// Display current question
function displayQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    
    // Update section and progress
    document.getElementById('currentSection').textContent = question.sectionName;
    document.getElementById('sectionLabel').textContent = question.sectionName;
    document.getElementById('questionProgress').textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
    
    // Update question text
    document.getElementById('questionText').textContent = question.question;
    
    // Display options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.textContent = option;
        
        // Check if this option was previously selected
        if (userAnswers[currentQuestionIndex] === index) {
            optionDiv.classList.add('selected');
        }
        
        optionDiv.addEventListener('click', () => selectOption(index));
        optionsContainer.appendChild(optionDiv);
    });
    
    // Update navigation buttons
    updateNavigationButtons();
    updateQuestionNavigator();
    
    // Save state
    saveQuizState();
}

// Select an option
function selectOption(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;
    
    // Update UI
    const options = document.querySelectorAll('.option');
    options.forEach((option, index) => {
        option.classList.toggle('selected', index === optionIndex);
    });
    
    updateQuestionNavigator();
    saveQuizState();
}

// Navigate between questions
function navigateQuestion(direction) {
    const newIndex = currentQuestionIndex + direction;
    if (newIndex >= 0 && newIndex < quizQuestions.length) {
        currentQuestionIndex = newIndex;
        displayQuestion();
    }
}

// Jump to specific question
function jumpToQuestion(index) {
    currentQuestionIndex = index;
    displayQuestion();
}

// Update navigation buttons
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    prevBtn.disabled = currentQuestionIndex === 0;
    
    if (currentQuestionIndex === quizQuestions.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    }
}

// Update question navigator
function updateQuestionNavigator() {
    const grid = document.getElementById('questionGrid');
    
    // Only create buttons if they don't exist
    if (grid.children.length === 0) {
        quizQuestions.forEach((_, index) => {
            const btn = document.createElement('button');
            btn.className = 'question-nav-btn';
            btn.textContent = index + 1;
            btn.addEventListener('click', () => jumpToQuestion(index));
            grid.appendChild(btn);
        });
    }
    
    // Update button states
    const buttons = grid.querySelectorAll('.question-nav-btn');
    buttons.forEach((btn, index) => {
        btn.classList.remove('current', 'answered');
        
        if (index === currentQuestionIndex) {
            btn.classList.add('current');
        } else if (userAnswers[index] !== null) {
            btn.classList.add('answered');
        }
    });
}

// Timer functionality
function startTimer() {
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        // Warning at 5 minutes
        if (timeRemaining === 5 * 60) {
            alert('5 minutes remaining!');
        }
        
        // Warning at 1 minute
        if (timeRemaining === 60) {
            alert('1 minute remaining!');
        }
        
        // Time's up
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            alert('Time is up! Submitting your quiz...');
            submitQuiz();
        }
        
        saveQuizState();
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const timerElement = document.getElementById('timer');
    timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Add warning class when time is low
    if (timeRemaining <= 5 * 60) {
        timerElement.classList.add('timer-warning');
    }
}

// Save quiz state to localStorage
function saveQuizState() {
    const state = {
        questions: quizQuestions,
        answers: userAnswers,
        currentIndex: currentQuestionIndex,
        timeRemaining: timeRemaining,
        startTime: quizStartTime
    };
    localStorage.setItem('quizState', JSON.stringify(state));
}

// Submit quiz
function submitQuiz() {
    // Check if all questions are answered
    const unanswered = userAnswers.filter(a => a === null).length;
    
    if (unanswered > 0) {
        const confirm = window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`);
        if (!confirm) return;
    }
    
    clearInterval(timerInterval);
    calculateResults();
    showScreen('resultsScreen');
}

// Calculate and display results
function calculateResults() {
    let totalCorrect = 0;
    const sectionResults = {};
    const wrongAnswers = [];
    
    // Initialize section results
    Object.values(sectionMapping).forEach(name => {
        sectionResults[name] = { correct: 0, total: 0 };
    });
    
    // Calculate scores
    quizQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const correctAnswer = question.answerIndex;
        const isCorrect = userAnswer === correctAnswer;
        
        if (isCorrect) {
            totalCorrect++;
            sectionResults[question.sectionName].correct++;
        } else {
            wrongAnswers.push({
                question: question.question,
                section: question.sectionName,
                userAnswer: userAnswer !== null ? question.options[userAnswer] : 'Not answered',
                correctAnswer: question.options[correctAnswer],
                questionNumber: index + 1
            });
        }
        
        sectionResults[question.sectionName].total++;
    });
    
    // Display total score
    document.getElementById('totalScore').textContent = totalCorrect;
    const percentage = ((totalCorrect / quizQuestions.length) * 100).toFixed(1);
    document.getElementById('percentageScore').textContent = `${percentage}%`;
    
    // Display section breakdown
    displaySectionBreakdown(sectionResults);
    
    // Display wrong answers
    displayWrongAnswers(wrongAnswers);
    
    // Clear saved state
    localStorage.removeItem('quizState');
}

// Display section breakdown
function displaySectionBreakdown(sectionResults) {
    const container = document.getElementById('sectionBreakdown');
    container.innerHTML = '';
    
    Object.entries(sectionResults).forEach(([section, result]) => {
        const percentage = ((result.correct / result.total) * 100).toFixed(1);
        
        const card = document.createElement('div');
        card.className = 'section-card';
        card.innerHTML = `
            <div>
                <div class="section-name">${section}</div>
                <div class="section-percentage">${percentage}%</div>
            </div>
            <div class="section-score">${result.correct} / ${result.total}</div>
        `;
        container.appendChild(card);
    });
}

// Display wrong answers
function displayWrongAnswers(wrongAnswers) {
    const container = document.getElementById('wrongAnswers');
    container.innerHTML = '';
    
    if (wrongAnswers.length === 0) {
        container.innerHTML = '<div class="no-wrong-answers">🎉 Perfect! You got all questions correct!</div>';
        return;
    }
    
    wrongAnswers.forEach(item => {
        const card = document.createElement('div');
        card.className = 'wrong-answer-card';
        card.innerHTML = `
            <div class="wrong-answer-section">${item.section} - Question ${item.questionNumber}</div>
            <div class="wrong-answer-question">${item.question}</div>
            <div class="answer-comparison">
                <div class="your-answer">
                    <div class="answer-label">Your Answer:</div>
                    <div>${item.userAnswer}</div>
                </div>
                <div class="correct-answer">
                    <div class="answer-label">Correct Answer:</div>
                    <div>${item.correctAnswer}</div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Retake quiz
function retakeQuiz() {
    startNewQuiz();
}

// Review all answers
function reviewAnswers() {
    alert('Review feature: This would show all questions with your answers and correct answers. You can implement this based on your needs.');
}

// Show screen
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Handle page visibility (pause timer when tab is not visible)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && timerInterval) {
        // Save state when tab becomes hidden
        saveQuizState();
    }
});

// Handle page unload (save state)
window.addEventListener('beforeunload', (e) => {
    if (timerInterval) {
        saveQuizState();
        e.preventDefault();
        e.returnValue = '';
    }
});
