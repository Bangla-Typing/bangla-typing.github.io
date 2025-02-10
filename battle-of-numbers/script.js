// Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyA8uYNEVttie_giIhhLX48UkWOVV5f6QRA",
	authDomain: "battle-of-numbers.firebaseapp.com",
	databaseURL: "https://battle-of-numbers-default-rtdb.firebaseio.com",
	projectId: "battle-of-numbers",
	storageBucket: "battle-of-numbers.firebasestorage.app",
	messagingSenderId: "367778784964",
	appId: "1:367778784964:web:6087befbf8a2637c5b8b91",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// DOM Elements
const loginButton = document.getElementById("loginButton");
const userProfile = document.getElementById("userProfile");
const userPhoto = document.getElementById("userPhoto");
const userName = document.getElementById("userName");
const gameSetup = document.getElementById("gameSetup");
const setupForm = document.getElementById("setupForm");
const gameRoom = document.getElementById("gameRoom");
const joinWithCodePanel = document.getElementById("joinRoom");

//variables
let localGameState = {};
let currentQuestionAnswered = false;

// Google Sign In
loginButton.addEventListener("click", () => {
	const provider = new firebase.auth.GoogleAuthProvider();
	auth
		.signInWithPopup(provider)
		.then((result) => {
			console.log("Successfully signed in");
			localStorage.setItem("lastLogin", Date.now());
		})
		.catch((error) => {
			console.error("Error signing in:", error);
		});
});

// Game Setup Form Handler
setupForm.addEventListener("submit", (e) => {
	e.preventDefault();
	const formData = new FormData(setupForm);
	const operations = formData.getAll("operations");
	const questionCount = formData.get("questionCount");
	const timePerQuestion = formData.get("timePerQuestion");

	if (operations.length === 0) {
		alert("Please select at least one operation");
		return;
	}

	createGameRoom({
		operations,
		questionCount,
		timePerQuestion,
		createdBy: auth.currentUser.uid,
		status: "waiting",
	});
});

// Generate and store questions when creating game room
function createGameRoom(gameConfig) {
	const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
	currentGameId = roomCode;

	// Generate all questions upfront
	const questions = generateQuestion(gameConfig.operations, gameConfig.questionCount);

	const updates = {};
	updates[`/games/${roomCode}`] = {
		...gameConfig,
		questions: questions,
		status: "waiting",
		players: {
			[auth.currentUser.uid]: {
				name: auth.currentUser.displayName,
				score: 0,
				gameComplete: false,
			},
		},
	};

	database
		.ref()
		.update(updates)
		.then(() => {
			document.getElementById("roomCode").textContent = roomCode;
			gameSetup.classList.add("hidden");
			document.getElementById("roomCodeDisplay").classList.remove("hidden");

			// Set up onDisconnect for the current player
			const currentPlayerRef = database.ref(`/games/${roomCode}/players/${auth.currentUser.uid}`);
			currentPlayerRef.onDisconnect().remove();

			// Listen for players node becoming empty and delete room
			const playersRef = database.ref(`/games/${roomCode}/players`);
			playersRef.on("value", (snapshot) => {
				const players = snapshot.val();
				if (!players || Object.keys(players).length === 0) {
					database
						.ref(`/games/${roomCode}`)
						.remove()
						.then(() => {
							console.log("Room deleted as all players left.");
						})
						.catch((error) => {
							console.error("Error deleting room:", error);
						});
				}
			});

			// Listen for opponent joining
			listenForOpponent(roomCode);

			// Listen only for player joins
			listenForOpponent(roomCode);
		});
}

// Listen for opponent joining
function listenForOpponent(roomCode) {
	//mark current room as inprogress
	const scoreRef = database.ref(`games/${roomCode}/status`);
	scoreRef.set("inprogress");

	const playersRef = database.ref(`/games/${roomCode}/players`);
	const listener = playersRef.on("value", (snapshot) => {
		const players = snapshot.val();
		if (players && Object.keys(players).length === 2) {
			// Stop listening for further updates
			playersRef.off("value");

			// Start game countdown
			document.getElementById("roomCodeDisplay").classList.add("hidden");
			document.getElementById("joinRoom").classList.add("hidden");

			showCountdown(5, () => {
				gameRoom.classList.remove("hidden");
				initializeGame(roomCode);
			});
		}
	});
}

// Countdown display before game starts
function showCountdown(seconds, callback) {
	const countdownDiv = document.getElementById("countdown-div");
	countdownDiv.classList.remove("hidden");

	const interval = setInterval(() => {
		seconds--;
		if (seconds > 0) {
			countdownDiv.querySelector("#countdown-seconds").textContent = seconds;
		} else {
			clearInterval(interval);
			countdownDiv.classList.add("hidden");
			callback();
		}
	}, 1000);
}

// Initialize game with local state management
function initializeGame(roomCode) {
	localGameState = {
		roomCode,
		currentQuestionIndex: 0,
		questions: [],
		timePerQuestion: 0,
		score: 0,
	};

	// Fetch game configuration and questions once
	database
		.ref(`/games/${roomCode}`)
		.once("value")
		.then((snapshot) => {
			const gameData = snapshot.val();
			localGameState.questions = gameData.questions;
			localGameState.timePerQuestion = gameData.timePerQuestion;

			// Start first question
			displayQuestion(localGameState);

			// Listen only for score updates
			listenForScoreUpdates(roomCode);
		});
	console.log(localGameState); //remove later
}

// Display question and handle timer locally
function displayQuestion(gameState) {
	if (gameState.currentQuestionIndex >= gameState.questions.length) {
		endGame();
		return;
	}

	const question = gameState.questions[gameState.currentQuestionIndex];
	console.log(question);
	document.getElementById("questionDisplay").textContent = question.question;
	currentQuestionAnswered = false; //to keep track if current quesiton has been answered.

	// Reset and start timer
	startTimer(gameState.timePerQuestion);
}

function startTimer(timePerQuestion) {
	clearInterval(timer);

	const progressRing = document.querySelector("#progress-ring");
	const countdownText = document.querySelector("#countdown-text");

	const radius = 80; // Change the radius to match the SVG circle
	const fullDashArray = 2 * Math.PI * radius; // Calculate circumference for new radius
	progressRing.style.strokeDasharray = fullDashArray; // Set full ring
	progressRing.style.strokeDashoffset = fullDashArray; // Start from full (ring is complete)

	timeLeft = timePerQuestion;

	timer = setInterval(() => {
		timeLeft--;

		// Calculate percentage and adjust stroke-dashoffset
		const percentage = Math.max(0, timeLeft / timePerQuestion);
		const dashOffset = fullDashArray * (1 - percentage);
		progressRing.style.strokeDashoffset = dashOffset; // Decrease the offset

		// Update countdown text
		countdownText.textContent = timeLeft;

		// Update ring color based on time remaining
		if (percentage > 0.6) {
			progressRing.style.stroke = "var(--primary-color)"; // Default color
		} else if (percentage > 0.3) {
			progressRing.style.stroke = "var(--accent-color)";
		} else {
			progressRing.style.stroke = "#f44336"; // Red for critical time
		}

		if (timeLeft <= 0) {
			progressRing.style.strokeDashoffset = fullDashArray; // Ensure it's empty
			clearInterval(timer);
			handleTimeUp();
		}
	}, 1000);
}

// Only listen for score updates from other players
function listenForScoreUpdates(roomCode) {
	database.ref(`/games/${roomCode}/players`).on("value", (snapshot) => {
		const players = snapshot.val();
		updateScoreboard(players);

		// Check if opponent left during the game
		if (players && Object.keys(players).length < 2) {
			handleOpponentLeft(roomCode);
		}
	});
}

function handleOpponentLeft(roomCode) {
	const userId = auth.currentUser.uid;

	// Update the game state to mark the remaining player as the winner
	const gameRef = database.ref(`/games/${roomCode}`);
	gameRef.once("value").then((snapshot) => {
		const gameData = snapshot.val();
		if (!gameData || !gameData.players) return;

		// Check if the remaining player is the current user
		const players = Object.keys(gameData.players);
		if (players.length === 1 && players[0] === userId) {
			// Mark the game as complete and the remaining player as the winner
			gameRef
				.update({
					status: "completed",
					winner: userId,
					players: {
						[userId]: {
							...gameData.players[userId],
							gameComplete: true,
						},
					},
				})
				.then(() => {
					// Notify the player they won
					//alert("Your opponent has left the game. You win!");
					endGame(); // Call your existing endGame function to handle the UI
				});
		}
	});
}

// Event listener for answer input
document.getElementById("answerInput").addEventListener("keypress", (e) => {
	if (e.key === "Enter") {
		const answer = parseInt(e.target.value);
		handleAnswer(answer);
		e.target.value = "";
	}
});

// Handle answer checking locally
function handleAnswer(userAnswer) {
	const answerFeedback = document.getElementById("answerFeedback");
	const currentQuestion = localGameState.questions[localGameState.currentQuestionIndex];

	currentQuestionAnswered = true;

	var correct = parseInt(userAnswer) == parseInt(currentQuestion.answer);
	if (correct) {
		const points = calculateScore(timeLeft, currentQuestion.score);
		localGameState.score += points;

		// Only update score in Firebase
		updateScore(parseInt(localGameState.score));

		document.getElementById("correctSound").play();
		answerFeedback.textContent = "Correct!";
		answerFeedback.className = "answer-feedback correct";
	} else {
		document.getElementById("incorrectSound").play();
		answerFeedback.textContent = "Incorrect!";
		answerFeedback.className = "answer-feedback incorrect";
	}

	console.log("user answer:" + userAnswer, "correct:" + correct, "score:" + localGameState.score);

	// Move to next question locally
	nextQuestion();
}

// Stats and Leaderboard System
class StatsSystem {
	constructor() {
		this.statsRef = database.ref("playerStats");
		this.leaderboardRef = database.ref("leaderboard");
	}

	async updatePlayerStats(playerId, gameResult) {
		// // console.log(new Date().toLocaleTimeString() + " update player stat ");
		const statsRef = this.statsRef.child(playerId);
		const snapshot = await statsRef.once("value");
		const currentStats = snapshot.val() || {
			gamesPlayed: 0,
			gamesWon: 0,
			totalScore: 0,
		};

		const updates = {
			gamesPlayed: currentStats.gamesPlayed + 1,
			gamesWon: currentStats.gamesWon + (gameResult.won ? 1 : 0),
			totalScore: currentStats.totalScore + gameResult.score,
		};

		await statsRef.update(updates);
		this.updateLeaderboard(playerId, gameResult.score);
		this.displayPlayerStats(playerId);
	}

	async updateLeaderboard(playerId, score) {
		// // console.log(new Date().toLocaleTimeString() + " update leaderboard ");
		const player = await database.ref(`users/${playerId}`).once("value");
		const playerData = player.val();

		const leaderboardEntry = {
			name: playerData.displayName,
			photoURL: playerData.photoURL,
			score: score,
			timestamp: firebase.database.ServerValue.TIMESTAMP,
		};

		// Keep only top 10 scores
		const leaderboardSnapshot = await this.leaderboardRef.orderByChild("score").limitToLast(10).once("value");
		const scores = [];
		leaderboardSnapshot.forEach((child) => {
			scores.push({
				key: child.key,
				...child.val(),
			});
		});

		if (scores.length < 10 || score > scores[0].score) {
			const newScoreRef = this.leaderboardRef.push();
			await newScoreRef.set(leaderboardEntry);
		}
	}

	async displayPlayerStats(playerId) {
		// // console.log(new Date().toLocaleTimeString() + " display player stat ");
		const statsRef = this.statsRef.child(playerId);
		const snapshot = await statsRef.once("value");
		const stats = snapshot.val();

		if (stats) {
			document.getElementById("gamesPlayed").textContent = stats.gamesPlayed;
			document.getElementById("winRate").textContent = `${((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1)}%`;
			document.getElementById("avgScore").textContent = Math.round(stats.totalScore / stats.gamesPlayed);
		}
	}

	displayLeaderboard() {
		// // console.log(new Date().toLocaleTimeString() + " display leader board ");
		this.leaderboardRef
			.orderByChild("score")
			.limitToLast(10)
			.on("value", (snapshot) => {
				const leaderboardList = document.getElementById("leaderboardList");
				leaderboardList.innerHTML = "";

				const scores = [];
				snapshot.forEach((child) => {
					scores.push(child.val());
				});

				scores.reverse().forEach((entry, index) => {
					const item = document.createElement("div");
					item.className = "leaderboard-item";
					item.innerHTML = `
                                <div>
                                    <span>${index + 1}.</span>
                                    <img src="${entry.photoURL}" alt="" style="width: 24px; height: 24px; border-radius: 50%; margin: 0 5px;">
                                    <span>${entry.name}</span>
                                </div>
                                <div>${entry.score}</div>
                            `;
					leaderboardList.appendChild(item);
				});
			});
	}
}

function generateQuestion(operators, numQuestions) {
	const questions = [];

	// 10-level difficulty configuration
	const config = {
		"+": { max: [20, 30, 50, 70, 90, 120, 150, 180, 200, 250] },
		"-": { max: [20, 30, 50, 70, 90, 120, 150, 180, 200, 250] },
		"*": { max: [5, 6, 7, 8, 9, 10, 12, 14, 15, 15] },
		"/": {
			maxDivisor: [5, 5, 6, 7, 8, 9, 10, 12, 15, 15],
			maxQuotient: [5, 6, 7, 8, 9, 10, 12, 12, 15, 15],
		},
	};

	for (let i = 1; i <= numQuestions; i++) {
		const levelIndex = Math.min(Math.floor((i - 1) / 5), 9); // 10 levels (0-9)
		const operator = operators[Math.floor(Math.random() * operators.length)];
		const score = levelIndex + 1; // Score based on difficulty level

		let question, answer;

		switch (operator) {
			case "+":
				const a = randInt(1, config["+"].max[levelIndex]);
				const b = randInt(1, config["+"].max[levelIndex]);
				question = `${a} + ${b}`;
				answer = a + b;
				break;

			case "-":
				let c = randInt(1, config["-"].max[levelIndex]);
				let d = randInt(1, config["-"].max[levelIndex]);
				[c, d] = c >= d ? [c, d] : [d, c]; // Ensure non-negative result
				question = `${c} - ${d}`;
				answer = c - d;
				break;

			case "*":
				const e = randInt(1, config["*"].max[levelIndex]);
				const f = randInt(1, config["*"].max[levelIndex]);
				question = `${e} × ${f}`;
				answer = e * f;
				break;

			case "/":
				const divisor = randInt(1, config["/"].maxDivisor[levelIndex]);
				const quotient = randInt(1, config["/"].maxQuotient[levelIndex]);
				const dividend = divisor * quotient;
				question = `${dividend} ÷ ${divisor}`;
				answer = quotient;
				break;
		}

		questions.push({ question, answer, score });
	}

	return questions;
}

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calculateScore(timeLeft, score) {
	// // console.log(new Date().toLocaleTimeString() + " calculate score ");
	// Base score (100) plus bonus for quick answers
	return Math.round(score + timeLeft * 5);
}

// Timer control functions
let timerPaused = false;
let remainingTime = 0;
let timerInterval;

function endGame() {
	gameEnded = true;
	let opponentID = null;
	let opponentName = null;

	const userId = auth.currentUser.uid;
	const gameRef = database.ref(`games/${currentGameId}`);
	const playerRef = gameRef.child(`players/${userId}`);

	playerRef.child("gameComplete").set(true);

	gameRef.on("value", (snapshot) => {
		const gameData = snapshot.val();
		if (!gameData || !gameData.players) return;

		const players = Object.entries(gameData.players);
		const currentPlayer = players.find(([id]) => id === userId)[1];
		const opponent = players.find(([id]) => id !== userId)?.[1];
		// Check if the game was completed due to the opponent leaving
		if (gameData.status === "completed" && gameData.winner === userId) {
			const gameOverScreen = document.querySelector("#gameOverScreen");
			gameOverScreen.classList.remove("hidden");

			// Display the win message
			gameOverScreen.innerHTML = `
				<h2>Your opponent has left the game.</h2>
				<p>You win by default!</p>
				<p>Your Score: ${currentPlayer.score}</p>
				<button onclick="goBackToSetup()" class="auth-button">Back to Setup</button>
	`;
			gameRef.off("value"); // Stop listening when the game ends
			database.ref(`/games/${currentGameId}/players`).off(); // Stop listening to player updates
		} else {
			//  Correct opponent ID
			opponentID = opponent ? Object.keys(gameData.players).find((id) => id !== userId) : null;
			opponentName = opponent ? opponent.name : "Opponent";

			//save info to windows for better access
			window.opponentID = opponentID;
			window.opponentName = opponentName;

			console.log("Your ID:", userId);
			console.log("Opponent ID:", opponentID);

			if (!opponent) console.log("no opponent found");

			const currentPlayerScore = currentPlayer.score;
			const otherPlayerScore = opponent.score;
			const opponentFinished = opponent.gameComplete;

			const gameOverScreen = document.querySelector("#gameOverScreen");
			gameOverScreen.classList.remove("hidden");
			let htmlCode = "";

			if (!opponentFinished) {
				gameOverScreen.innerHTML = `
				<h2>Waiting for opponent to finish...</h2>
				<p>Your Score: ${currentPlayerScore}</p>
				<p>Opponent's Current Score: ${otherPlayerScore}</p>
			`;
			} else {
				let resultMessage = currentPlayerScore > otherPlayerScore ? "win" : currentPlayerScore < otherPlayerScore ? "loss" : "tie";

				if (resultMessage == "win") {
					htmlCode = `
				<img id="winLosePhoto" src="pic/winner.jpg" alt="Win/lose Photo" style="width: auto; height: 200px">
				<div id="win-loss">You Won!</div>
				<div style="display: flex; width: 100%; background: rgb(231 224 194); justify-content: space-between; padding: 10px; border-radius: 10px">
				<div style="width: 40%; border-radius: 10px; padding: 10px; text-align: center">
				<div style="font-size: 2em">Difference:</div>
				</div>
				<div style="width: 58%; background: rgb(255 255 255); border-radius: 10px; padding: 10px; text-align: center">
				<div style="font-size: 2em">${currentPlayerScore - otherPlayerScore}</div>
				</div>
				</div>
				
				<div id="score-container" style="display: flex; width: 100%; background: rgb(255 215 61); /* height: 10vh; */ justify-content: space-between; padding: 10px; border-radius: 10px">
				<div style="width: 49%;background: #fff900;border-radius: 10px;padding: 10px;text-align: center;font-weight: bold;">
				<div id="score" style="font-size: 2em; /* width: 48%; */ /* background: rgb(255, 255, 255); */ /* height: 10vh; */ /* text-align: left; */">${currentPlayerScore}</div>
				<p>Your Score</p>
				</div>
				<div style="width: 49%; background: #ff9a9a; border-radius: 10px; padding: 10px; text-align: center">
				<div id="opponent-score" style="font-size: 2em; /* width: 48%; */ /* height: 10vh; */ /* background: rgb(255, 255, 255); */ /* text-align: right; */">${otherPlayerScore}</div>
				<p>Opponent's Score</p>
				</div>
				</div>
				<div style="font-size: 2em; margin: 10px; color: rgb(0 64 255)" id="playAgainMsg"></div>
				<button id="requestPlayAgainBtn" onclick="requestPlayAgain()" class="auth-button">Play Again</button>
				`;
				} else if ((resultMessage = "loss")) {
					htmlCode = `
				<img id="winLosePhoto" src="pic/lose.jpg" alt="Win/lose Photo" style="width: auto; height: 200px;" title="">
				<div id="win-loss" style="font-weight: bold;  color: red;">You Lose</div>
				<div style="display: flex;width: 100%;background: rgb(255 61 61);justify-content: space-between;padding: 10px;border-radius: 10px">
				<div style="width: 40%; border-radius: 10px; padding: 10px; text-align: center">
				<div style="font-size: 2em">Difference:</div>
				</div>
				<div style="width: 58%; background: rgb(255 255 255); border-radius: 10px; padding: 10px; text-align: center">
				<div style="font-size: 2em;font-weight: bold;">${otherPlayerScore - currentPlayerScore}</div>
				</div>
				</div>
				
				<div id="score-container" style="display: flex;width: 100%;background: rgb(255 88 6);/* height: 10vh; */justify-content: space-between;padding: 10px;border-radius: 10px">
				<div style="width: 49%;background: #ff9a9a;border-radius: 10px;padding: 10px;text-align: center;font-weight: bold;">
				<div id="score" style="font-size: 2em; /* width: 48%; */ /* background: rgb(255, 255, 255); */ /* height: 10vh; */ /* text-align: left; */">${currentPlayerScore}</div>
				<p>Your Score</p>
				</div>
				<div style="width: 49%;background: #fff900;border-radius: 10px;padding: 10px;text-align: center">
				<div id="opponent-score" style="font-size: 2em; /* width: 48%; */ /* height: 10vh; */ /* background: rgb(255, 255, 255); */ /* text-align: right; */">${otherPlayerScore}</div>
				<p>Opponent's Score</p>
				</div>
				</div>
				<div style="font-size: 2em; margin: 10px; color: rgb(0 64 255)" id="playAgainMsg"></div>
				<button id="requestPlayAgainBtn" onclick="requestPlayAgain()" class="auth-button">Play Again</button>
				`;
				} else {
					htmlCode = `
				<img id="winLosePhoto" src="pic/tie.jpg" alt="Win/lose Photo" style="width: auto; height: 200px;" title="">
				<div id="win-loss" style="font-weight: bold;  color: red;">It's a Tie!</div>
				<div style="display: flex;width: 100%;background: rgb(255 61 61);justify-content: space-between;padding: 10px;border-radius: 10px">
				<div style="width: 40%; border-radius: 10px; padding: 10px; text-align: center">
				<div style="font-size: 2em">Difference:</div>
				</div>
				<div style="width: 58%; background: rgb(255 255 255); border-radius: 10px; padding: 10px; text-align: center">
				<div style="font-size: 2em;font-weight: bold;">${otherPlayerScore - currentPlayerScore}</div>
				</div>
				</div>
				
				<div id="score-container" style="display: flex;width: 100%;background: rgb(255 88 6);/* height: 10vh; */justify-content: space-between;padding: 10px;border-radius: 10px">
				<div style="width: 49%;background: #fff900;border-radius: 10px;padding: 10px;text-align: center;font-weight: bold;">
				<div id="score" style="font-size: 2em; /* width: 48%; */ /* background: rgb(255, 255, 255); */ /* height: 10vh; */ /* text-align: left; */">${currentPlayerScore}</div>
				<p>Your Score</p>
				</div>
				<div style="width: 49%;background: #fff900;border-radius: 10px;padding: 10px;text-align: center">
				<div id="opponent-score" style="font-size: 2em; /* width: 48%; */ /* height: 10vh; */ /* background: rgb(255, 255, 255); */ /* text-align: right; */">${otherPlayerScore}</div>
				<p>Opponent's Score</p>
				</div>
				</div>
				<div style="font-size: 2em; margin: 10px; color: rgb(0 64 255)" id="playAgainMsg"></div>
				<button id="requestPlayAgainBtn" onclick="requestPlayAgain()" class="auth-button">Play Again</button>
				`;
				}

				gameOverScreen.innerHTML = htmlCode;
				// Ensure opponentID is valid before calling function
				if (window.opponentID) {
					console.log("listener called");
					listenForRequestToPlayAgain(window.opponentID, window.opponentName);
				}
				gameRef.off("value"); // Stop listening when the game ends
				database.ref(`/games/${currentGameId}/players`).off(); // Stop listening to player updates
			}

			document.querySelector(".container").appendChild(gameOverScreen);
		}
	});

	gameRoom.classList.add("hidden");
}

function listenForRequestToPlayAgain(opponentID, opponentName) {
	const gameRef = database.ref(`games/${currentGameId}/playAgainRequests/${opponentID}`);

	gameRef.on("value", (snapshot) => {
		const request = snapshot.val();
		console.log(request);
		if (request === true) {
			document.getElementById("playAgainMsg").innerHTML = opponentName + " wants to play again.";
			document.getElementById("requestPlayAgainBtn").innerText = "Accept Request";
			gameRef.off("value");
		}
	});
}

function requestPlayAgain() {
	const requestBtn = document.getElementById("requestPlayAgainBtn");

	//set button text based on request
	if (requestBtn.innerText == "Accept Request") {
		requestBtn.innerText = "Accepted...";
	} else {
		requestBtn.innerText = "Request Sent";
	}
	//change button text

	requestBtn.disabled = true;

	const userId = auth.currentUser.uid;
	const gameRef = database.ref(`games/${currentGameId}/playAgainRequests`);

	// Set the current player as wanting to play again
	gameRef.child(userId).set(true);

	// Listen for both players agreeing
	gameRef.on("value", (snapshot) => {
		const requests = snapshot.val();
		if (requests && Object.keys(requests).length === 2) {
			startNewGame();
		} else {
			// Notify the other player wants to play again
			if (document.getElementById("playAgainMsg").innerHTML.length < 5) {
				document.getElementById("playAgainMsg").innerHTML = "Waiting for opponent to accept...";
			}
		}
	});
}

function startNewGame() {
	localGameState = {};
	gameEnded = false;
	currentQuestionAnswered = false;

	const gameRef = database.ref(`games/${currentGameId}`);

	gameRef.once("value").then((snapshot) => {
		const gameData = snapshot.val();
		const newQuestions = generateQuestion(gameData.operations, gameData.questionCount);

		// Reset game state
		gameRef.update({
			questions: newQuestions,
			status: "inprogress",
			playAgainRequests: null,
			players: {
				[auth.currentUser.uid]: { name: auth.currentUser.displayName, score: 0, gameComplete: false },
				...Object.keys(gameData.players).reduce((obj, playerId) => {
					if (playerId !== auth.currentUser.uid) {
						obj[playerId] = { name: gameData.players[playerId].name, score: 0, gameComplete: false };
					}
					return obj;
				}, {}),
			},
		});

		// Start countdown again
		document.querySelector("#gameOverScreen").classList.add("hidden");
		showCountdown(5, () => {
			gameRoom.classList.remove("hidden");
			initializeGame(currentGameId);
		});
	});
}

function updateScoreboard(players) {
	// // console.log(new Date().toLocaleTimeString() + "update scoreborad");
	const player1Score = document.getElementById("player1Score");
	const player2Score = document.getElementById("player2Score");

	// Convert players object to array for easier handling
	const playersArray = Object.entries(players);

	if (playersArray.length >= 1) {
		// Update first player score
		const player1 = playersArray[0];
		player1Score.textContent = `${player1[1].name}: ${player1[1].score || 0}`;

		if (player1[0] === auth.currentUser.uid) {
			player1Score.style.fontWeight = "bold";
			player1Score.style.color = "var(--primary-color)";
		}
	}

	if (playersArray.length >= 2) {
		// Update second player score
		const player2 = playersArray[1];
		player2Score.textContent = `${player2[1].name}: ${player2[1].score || 0}`;

		if (player2[0] === auth.currentUser.uid) {
			player2Score.style.fontWeight = "bold";
			player2Score.style.color = "var(--primary-color)";
		}
	}
}

function updateScore(points) {
	const scoreRef = database.ref(`games/${currentGameId}/players/${auth.currentUser.uid}/score`);

	scoreRef
		.set(points)
		.then(() => {
			console.log("Score updated to:", points);
		})
		.catch((error) => {
			console.error("Error updating score:", error);
		});
}

function goBackToSetup() {
	const gameOverScreen = document.querySelector("#gameOverScreen");
	gameOverScreen.classList.add("hidden");
	gameSetup.classList.remove("hidden");
	gameRoom.classList.add("hidden");

	// Delete the current game room from Firebase
	if (currentGameId) {
		const gameRef = database.ref(`/games/${currentGameId}`);
		gameRef
			.remove()
			.then(() => {
				console.log("Game room deleted successfully.");
				currentGameId = null; // Reset the current game ID
			})
			.catch((error) => {
				console.error("Error deleting game room:", error);
			});
	}

	// Reset the game state
	resetGameState();
}

function resetGameState() {
	localGameState = {};
	currentQuestionAnswered = false;
	gameEnded = false;
	clearInterval(timer); // Clear any active timers
	document.getElementById("answerInput").value = ""; // Clear the answer input
	document.getElementById("answerFeedback").textContent = ""; // Clear feedback
	document.getElementById("questionDisplay").textContent = ""; // Clear question display
	document.getElementById("progress-bar-fill").style.width = "0%"; // Reset progress bar
}

// Add these variables at the top of your script
let currentGameId = null;
let currentQuestion = null;

// Update the joinGameRoom function to set currentGameId
function joinGameRoom(gameId) {
	// // console.log(new Date().toLocaleTimeString() + " join game room ");
	currentGameId = gameId; // Set the current game ID
	const playerRef = database.ref(`/games/${gameId}/players/${auth.currentUser.uid}`);
	playerRef
		.set({
			name: auth.currentUser.displayName,
			score: 0,
			gameComplete: false,
		})
		.then(() => {
			// Set up onDisconnect to remove player when they leave
			playerRef.onDisconnect().remove();

			// Listen for players node becoming empty and delete room
			const playersRef = database.ref(`/games/${gameId}/players`);
			playersRef.on("value", (snapshot) => {
				const players = snapshot.val();
				if (!players || Object.keys(players).length === 0) {
					database
						.ref(`/games/${gameId}`)
						.remove()
						.then(() => {
							console.log("Room deleted as all players left.");
						})
						.catch((error) => {
							console.error("Error deleting room:", error);
						});
				}
			});

			gameSetup.classList.add("hidden");
			joinWithCodePanel.classList.add("hidden");
			//roomList.classList.add("hidden");
			//gameRoom.classList.remove("hidden");
			showCountdown(5, () => {
				gameRoom.classList.remove("hidden");
				initializeGame(gameId);
			});
		})
		.catch((error) => {
			console.error("Error joining game:", error);
			alert("Failed to join game. Please try again.");
		});
}

function handleTimeUp() {
	// // console.log(new Date().toLocaleTimeString() + " handle time up ")
	// Clear the timer interval
	clearInterval(timer);

	if (gameEnded) {
		return;
	}

	// Play incorrect sound
	document.getElementById("incorrectSound").play();

	if (!currentQuestionAnswered) {
		// Show timeout message
		const answerFeedback = document.getElementById("answerFeedback");
		answerFeedback.textContent = "Time's Up!";
		answerFeedback.className = "answer-feedback incorrect";
		// Clear the answer input
		document.getElementById("answerInput").value = "";

		nextQuestion();
	}
}

function nextQuestion() {
	// Add a small delay before moving to next question
	localGameState.currentQuestionIndex++;
	const totalNumberOfQuestions = localGameState.questions.length;

	//show in progress bar
	const progressBar = document.querySelector(".progress-bar-fill");
	const percentage = Math.min(100, Math.ceil((localGameState.currentQuestionIndex / totalNumberOfQuestions) * 100));
	progressBar.style.width = `${percentage}%`;

	//update text
	document.getElementById("question-count-panel").innerHTML = "Question " + localGameState.currentQuestionIndex + " of " + totalNumberOfQuestions;

	setTimeout(() => {
		answerFeedback.className = "answer-feedback hidden";
		displayQuestion(localGameState);
	}, 1000);
}

// Add these variables at the top of your script if not already present
let timer = null;
let timeLeft = 0;
let gameData = null;
let gameEnded = false;

auth.onAuthStateChanged((user) => {
	if (user) {
		loginButton.classList.add("hidden");
		userProfile.classList.remove("hidden");
		gameSetup.classList.remove("hidden");
		document.getElementById("joinRoom").classList.remove("hidden");

		// Update profile
		userPhoto.src = user.photoURL || "default-avatar.png";
		document.getElementById("userPhotoGameBoard").src = user.photoURL;
		userName.textContent = user.displayName || "Anonymous";

		// Check session expiry
		const lastLogin = localStorage.getItem("lastLogin");
		const currentTime = Date.now();
		if (lastLogin && currentTime - lastLogin > 3 * 24 * 60 * 60 * 1000) {
			auth.signOut();
			localStorage.removeItem("lastLogin");
		} else {
			localStorage.setItem("lastLogin", currentTime);
		}
	} else {
		loginButton.classList.remove("hidden");
		userProfile.classList.add("hidden");
		gameSetup.classList.add("hidden");
		document.getElementById("joinRoom").classList.add("hidden");
		document.getElementById("roomCodeDisplay").classList.add("hidden");
	}
});

// Function to join a game with room code
function joinWithCode() {
	const roomCode = document.getElementById("roomCodeInput").value.trim().toUpperCase();
	if (!roomCode) {
		alert("Please enter a room code");
		return;
	}

	database
		.ref(`/games/${roomCode}`)
		.once("value")
		.then((snapshot) => {
			const game = snapshot.val();
			if (!game) {
				alert("Invalid room code");
				return;
			}

			if (game.players && Object.keys(game.players).length >= 2) {
				alert("This game is already full");
				return;
			}

			// Show room info
			showRoomInfo(game, roomCode); // Call this new function
		})
		.catch((error) => {
			console.error("Error joining game:", error);
			alert("Failed to join game. Please try again.");
		});
}

function showRoomInfo(game, roomCode) {
	// Create a modal or a section on your page to display the info
	const roomInfoDiv = document.createElement("div");
	roomInfoDiv.id = "roomInfoModal"; //For easy styling and access
	roomInfoDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: white;
      padding: 20px;
      border: 1px solid #ccc;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      z-index: 1000; /* Ensure it's on top */
  `;

	// Display the game information
	let operationsText = game.operations.join(", "); // Convert array to string
	roomInfoDiv.innerHTML = `
      <h3>Room Information</h3>
      <p>Operations: ${operationsText}</p>
      <p>Number of Questions: ${game.questionCount}</p>
      <p>Time per Question: ${game.timePerQuestion} seconds</p>
      <button id="confirmJoinButton">Confirm Join</button>
      <button id="cancelJoinButton">Cancel</button>
  `;
	document.body.appendChild(roomInfoDiv);

	// Event listeners for confirm and cancel buttons
	document.getElementById("confirmJoinButton").addEventListener("click", () => {
		document.body.removeChild(roomInfoDiv); // Remove the modal
		joinGameRoom(roomCode); // Proceed to join the game
	});

	document.getElementById("cancelJoinButton").addEventListener("click", () => {
		document.body.removeChild(roomInfoDiv); // Remove the modal
	});
}

// Function to copy room code to clipboard
function copyRoomCode() {
	const roomCode = document.getElementById("roomCode").textContent;
	navigator.clipboard
		.writeText(roomCode)
		.then(() => {
			const button = document.querySelector("#roomCode").nextElementSibling;
			button.textContent = "Copied!";
			setTimeout(() => {
				button.textContent = "Copy";
			}, 2000);
		})
		.catch((err) => {
			console.error("Failed to copy code:", err);
			alert("Failed to copy code. Please copy it manually.");
		});
}
