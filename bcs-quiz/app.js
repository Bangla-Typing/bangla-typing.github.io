const $ = (s) => document.querySelector(s);
const raw = Array.isArray(window.QUESTIONS) ? window.QUESTIONS : [];
let quiz = [],
	index = 0,
	score = 0,
	userAnswers = {}, // Stores user choice and correctness per index
	soundOn = true;
const letters = ["A", "B", "C", "D"];

function formatText(str) {
	if (!str) return "";
	let cleaned = String(str).replace(/^[A-D]\n\n/, "");
	return cleaned.replace(/\[Image:\s*(https?:\/\/[^\]]+)\]/g, '<img src="$1" class="quiz-img max-w-full h-auto my-2 rounded-lg border border-slate-700" alt="Question Image" />');
}

function shuffle(a) {
	a = [...a];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function topics() {
	return [...new Set(raw.map((q) => q.topic || "General"))].sort();
}

// Extract unique exam names
function getExams() {
	return [...new Set(raw.map((q) => q.examName || "Standard Exam"))].sort((a, b) => {
		// Natural sort for exam numbers (e.g., 10th BCS before 30th BCS)
		return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
	});
}

function init() {
	// Populate BCS Exam Dropdown
	const examDropdown = $("#examSelect");
	examDropdown.innerHTML =
		'<option value="__ALL__">All BCS Exams</option>' +
		getExams()
			.map((e) => `<option value="${escapeHtml(e)}">${escapeHtml(e)}</option>`)
			.join("");

	// Populate Topics Dropdown
	const topicDropdown = $("#topicSelect");
	topicDropdown.innerHTML =
		'<option value="__ALL__">All Topics</option>' +
		topics()
			.map((t) => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`)
			.join("");

	updateAvailableCount();

	// Listen to selection changes to update bank count live
	$("#examSelect").onchange = updateAvailableCount;
	$("#topicSelect").onchange = updateAvailableCount;

	if (!raw.length) {
		$("#startBtn").disabled = true;
		$("#bankCount").textContent = "No questions loaded — check questions.js.";
	}
}

// Calculate questions matching selected filters
function getFilteredPool() {
	const selectedExam = $("#examSelect").value;
	const selectedTopic = $("#topicSelect").value;

	return raw.filter((q) => {
		const matchesExam = selectedExam === "__ALL__" || (q.examName || "Standard Exam") === selectedExam;
		const matchesTopic = selectedTopic === "__ALL__" || (q.topic || "General") === selectedTopic;
		return matchesExam && matchesTopic;
	});
}

function updateAvailableCount() {
	const pool = getFilteredPool();
	$("#bankCount").textContent = `${pool.length} questions available`;
}

function start() {
	const pool = getFilteredPool();
	const countVal = $("#countSelect").value;
	const count = countVal === "__ALL__" ? pool.length : +countVal;

	if (pool.length === 0) {
		alert("No questions available for this exam and topic combination.");
		return;
	}

	quiz = shuffle(pool)
		.slice(0, Math.min(count, pool.length))
		.map((q) => ({
			...q,
			optionList: shuffle(letters.filter((l) => q.options && q.options[l]).map((l) => ({ key: l, text: q.options[l] }))),
		}));

	index = 0;
	score = 0;
	userAnswers = {};
	$("#score").textContent = 0;
	$("#qTotal").textContent = quiz.length;
	$("#setup").classList.add("hidden");
	$("#result").classList.add("hidden");
	$("#quiz").classList.remove("hidden");
	render();
}

function escapeHtml(x) {
	return String(x).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

// Pronounced Audio Synthesizer
// Upgraded Arcade-Style Audio Synthesizer
function play(type) {
	if (!soundOn) return;
	try {
		const AudioCtx = window.AudioContext || window.webkitAudioContext;
		if (!AudioCtx) return;
		const c = new AudioCtx();
		const now = c.currentTime;

		if (type === "ok") {
			// Catchy 3-Note Ascending Chime (C5 -> E5 -> G5)
			const notes = [523.25, 659.25, 783.99];
			notes.forEach((freq, i) => {
				const osc = c.createOscillator();
				const gain = c.createGain();
				const noteTime = now + i * 0.08;

				osc.type = "sine";
				osc.frequency.setValueAtTime(freq, noteTime);

				gain.gain.setValueAtTime(0.15, noteTime);
				gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18);

				osc.connect(gain);
				gain.connect(c.destination);

				osc.start(noteTime);
				osc.stop(noteTime + 0.18);
			});
		} else if (type === "bad") {
			// Retro 2-Tone Descending "Wrong" Buzz
			const osc = c.createOscillator();
			const gain = c.createGain();

			osc.type = "sawtooth";

			// Frequency drops from 220Hz down to 110Hz abruptly
			osc.frequency.setValueAtTime(220, now);
			osc.frequency.setValueAtTime(140, now + 0.1);
			osc.frequency.linearRampToValueAtTime(90, now + 0.25);

			gain.gain.setValueAtTime(0.15, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

			osc.connect(gain);
			gain.connect(c.destination);

			osc.start(now);
			osc.stop(now + 0.28);
		} else {
			// Kept original "Next" navigation pop
			const osc = c.createOscillator();
			const gain = c.createGain();

			osc.type = "sine";
			osc.frequency.setValueAtTime(400, now);
			osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);

			gain.gain.setValueAtTime(0.1, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

			osc.connect(gain);
			gain.connect(c.destination);

			osc.start(now);
			osc.stop(now + 0.06);
		}
	} catch (e) {}
}

function render() {
	const q = quiz[index];
	const prevAnswer = userAnswers[index];

	// Manage Button States
	$("#prevBtn").disabled = index === 0;
	$("#nextBtn").disabled = !prevAnswer;
	$("#feedback").classList.add("hidden");
	// $("#hint").classList.add("hidden");

	$("#qNo").textContent = index + 1;
	$("#progressBar").style.width = `${((index + 1) / quiz.length) * 100}%`;
	$("#topicLabel").textContent = q.topic || "GENERAL";

	// Source Info Meta Bar
	const hasMeta = q.examName || q.examDate || q.mark;
	if (hasMeta) {
		$("#sourceMeta").classList.remove("hidden");
		$("#metaExam").textContent = q.examName || "Standard Exam";
		$("#metaDate").textContent = q.examDate ? `📅 ${q.examDate}` : "";

		let markInfo = "";
		if (q.mark) markInfo += `+${q.mark}`;
		if (q.negativeMark) markInfo += ` / -${q.negativeMark}`;
		$("#metaMarks").textContent = markInfo ? `🎯 ${markInfo}` : "";
	} else {
		$("#sourceMeta").classList.add("hidden");
	}

	// Render Question & Options
	$("#question").innerHTML = formatText(q.question);
	$("#options").innerHTML = q.optionList.map((o, i) => `<button class="option" data-key="${o.key}"><span class="letter">${letters[i]}</span><span>${formatText(o.text)}</span></button>`).join("");

	document.querySelectorAll(".option").forEach((b) => (b.onclick = () => choose(b)));

	// If previously answered, restore state
	if (prevAnswer) {
		applyOptionStyles(prevAnswer.chosenKey, prevAnswer.correctKey);
		showExplanation(prevAnswer.isCorrect);
	}

	if (window.MathJax) MathJax.typesetPromise([$("#question"), $("#options")]);
}

function choose(btn) {
	if (userAnswers[index]) return; // Prevent changing answer

	const q = quiz[index];
	const chosenKey = btn.dataset.key;
	const isCorrect = chosenKey === q.answer;

	userAnswers[index] = {
		chosenKey,
		correctKey: q.answer,
		isCorrect,
	};

	if (isCorrect) score++;
	$("#score").textContent = score;

	applyOptionStyles(chosenKey, q.answer);
	showExplanation(isCorrect);

	$("#nextBtn").disabled = false;
	play(isCorrect ? "ok" : "bad");

	if (window.MathJax) MathJax.typesetPromise([$("#feedback")]);
}

function applyOptionStyles(chosenKey, correctKey) {
	document.querySelectorAll(".option").forEach((b) => {
		b.classList.add("disabled");
		const key = b.dataset.key;
		if (key === correctKey) b.classList.add("correct");
		if (key === chosenKey && key !== correctKey) b.classList.add("wrong");
	});
}

function showExplanation(isCorrect) {
	const q = quiz[index];
	const rawExplanation = q.explanation || (isCorrect ? "Great job!" : "Review the correct answer above.");
	$("#feedback").innerHTML = formatText(rawExplanation);
	$("#feedback").classList.remove("hidden");
}

function next() {
	if (!userAnswers[index]) return;
	if (index < quiz.length - 1) {
		index++;
		play("nav");
		render();
	} else {
		finish();
	}
}

function prev() {
	if (index > 0) {
		index--;
		play("nav");
		render();
	}
}

function finish() {
	$("#quiz").classList.add("hidden");
	$("#result").classList.remove("hidden");
	$("#finalScore").textContent = score;
	$("#finalTotal").textContent = quiz.length;
	const pct = (score / quiz.length) * 100;
	let title, msg, icon;

	if (pct >= 90) {
		title = "Outstanding!";
		msg = "Mastery achieved. Brilliant work!";
		icon = "🏆";
	} else if (pct >= 70) {
		title = "Great job!";
		msg = "Solid knowledge base!";
		icon = "🎯";
	} else if (pct >= 50) {
		title = "Good effort!";
		msg = "Keep practicing to level up!";
		icon = "💪";
	} else {
		title = "Keep trying!";
		msg = "Practice makes perfect. Try again!";
		icon = "🔥";
	}

	$("#resultTitle").textContent = title;
	$("#resultMessage").textContent = msg;
	$("#resultIcon").textContent = icon;
	play("ok");
}

$("#startBtn").onclick = start;
$("#nextBtn").onclick = next;
$("#prevBtn").onclick = prev;

$("#againBtn").onclick = start;

$("#soundBtn").onclick = () => {
	soundOn = !soundOn;
	$("#soundBtn").textContent = soundOn ? "🔊" : "🔇";
};
// Dark / Light Theme Switcher
const themeBtn = document.querySelector("#themeBtn");
let currentTheme = localStorage.getItem("quiz_theme") || "dark";

function applyTheme(theme) {
	document.documentElement.setAttribute("data-theme", theme);
	themeBtn.textContent = theme === "dark" ? "🌙" : "☀️";
	localStorage.setItem("quiz_theme", theme);
}

themeBtn.onclick = () => {
	currentTheme = currentTheme === "dark" ? "light" : "dark";
	applyTheme(currentTheme);
};

function goHome() {
	const isQuizActive = !$("#quiz").classList.contains("hidden");

	if (isQuizActive) {
		const confirmed = confirm("Are you sure you want to end the current quiz? Your progress will be lost.");
		if (!confirmed) return;
	}

	$("#quiz").classList.add("hidden");
	$("#result").classList.add("hidden");
	$("#setup").classList.remove("hidden");
}

$("#homeBtn").onclick = goHome;
$("#brandBtn").onclick = goHome;

// Initialize Theme on Load
applyTheme(currentTheme);
init();
