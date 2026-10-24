// Place this file next to index.html (in the math-dual folder).
importScripts(
	"https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
	"https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);
firebase.initializeApp({
	apiKey: "AIzaSyDsQeD1b0djnMP7U8Yewy6oHD_oePokjAU",
	projectId: "math-calculation-dual",
	messagingSenderId: "813391290745",
	appId: "1:813391290745:web:24f92a97c58a4da5bacfa8",
});
// Notifications that carry a title/body are shown automatically when the game is closed;
// tapping one opens the link set by the Worker.
firebase.messaging();
