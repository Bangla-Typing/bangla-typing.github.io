const quoteDisplayElement = document.getElementById('quoteDisplay')
const quoteInputElement = document.getElementById('quoteInput')
let timerElement = document.getElementById('timer');  // Get the timer div
const settingDiv = document.getElementById("settings");
const typingCanvas = document.getElementById("typingGameCanvas");
const svg = document.getElementById("svg");

// close button and result popup code
const resultElement = document.getElementById("result");
const popupElement = document.getElementById("popup");
const closeButton = document.getElementById("close-popup");

//handle settings
var TIME_LIMIT = 30
let RandomWords = false;
let StoryMode = false;

//for stats
let startTime;
let wordCount = 0;
let keystrokeCount = 0;
let correctKeystrocksCount = 0;
let timerId;
let timeLeft = TIME_LIMIT;  // Start with 60 seconds


function getWordsToType(includeNumbers, includePunctuation, randomize, length) {
  //get selected GameMode
  const savedChoice = localStorage.getItem('selectedTextMode');
  let input = [];
  let randomIndex = null;

  switch (savedChoice) {
    case 'RadioBornomala':
      input = ALPHABETS.concat(ALPHABETS.slice(), ALPHABETS.slice(), ALPHABETS.slice(), ALPHABETS.slice()).join();
      randomize = true;
      break;
    case 'RadioJuktoborno':
      input = JUKTOBORNO[0];
      randomize = true;
      break;
    case 'RadioRandomWords':
      // randomly pick one array in case of story or word mode
      randomIndex = Math.floor(Math.random() * WORDS.length);
      input = WORDS[randomIndex];
      randomize = true;
      break;
    case 'RadioStory':
      // randomly pick one array in case of story or word mode
      randomIndex = Math.floor(Math.random() * WORDS.length);
      input = WORDS[randomIndex];
      break;
    default:
      // randomly pick one array in case of story or word mode
      randomIndex = Math.floor(Math.random() * WORDS.length);
      input = WORDS[randomIndex];
  }



  // Bangla numbers from 0 to 9
  const banglaNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

  // Split the string into words
  let words = input.split(/\s+/);

  // Filter out words based on flags
  words = words.filter(word => {
    if (!includeNumbers) {
      for (let i = 0; i < banglaNumbers.length; i++) {
        if (word.includes(banglaNumbers[i])) {
          return false;
        }
      }
    }
    if (!includePunctuation) {
      if (/[\p{P}\p{S}]/u.test(word)) {
        return false;
      }
    }
    return true;
  });

  // Randomize words if flag is set
  if (randomize) {
    words = words.sort(() => Math.random() - 0.5);
  }

  // Limit the number of words if length is set
  if (length !== undefined && words.length > length) {
    words = words.slice(0, length);
  }

  return words;
}


quoteInputElement.addEventListener('input', () => {
  const { value } = quoteInputElement;
  const position = quoteInputElement.selectionStart;
  const p1 = value.slice(0, position).replace(/\s+/g, ' ');
  const p2 = value.slice(position).replace(/\s+/g, ' ');
  const p2Fixed = p1.endsWith(' ') && p2.startsWith(' ') ? p2.replace(/^\s+/, '') : p2;
  quoteInputElement.value = p1 + p2Fixed;
  quoteInputElement.selectionStart = p1.length;
  quoteInputElement.selectionEnd = p1.length;
});

quoteInputElement.addEventListener('keyup', function (event) {
  //only continue if letter key are pressed.
  if  (event.key.length >2){
    return;
  }

  if (!startTime) {
    startTime = Date.now();
    timerId = setInterval(updateTimer, 1000);  // Update the timer every second
    //setTimeout(endGame, TIME_LIMIT*1000);  // End the game after 60 seconds
  }

  //hide settings panel for distraction free typing when user starts typing
  if (settingDiv.classList.contains("clickable")) {
    settingDiv.classList.remove("clickable");
    settingDiv.classList.add("unclickable");
  }

  keystrokeCount++;

  if (event.key === " ") {
    let inputWords = quoteInputElement.value.normalize('NFC').trim().split(' ');
    let displayWords = quoteDisplayElement.textContent.normalize('NFC').split(' ');

    let lastInputWord = inputWords[inputWords.length - 1];
    let correspondingDisplayWord = displayWords[inputWords.length - 1];

    let wordDiv = quoteDisplayElement.querySelectorAll('div')[inputWords.length - 1];

    // Remove 'currentWord' class from all words
    quoteDisplayElement.querySelectorAll('.currentWord').forEach(function (wordDiv) {
      wordDiv.classList.remove('currentWord');
    });

    let NextWordDiv = quoteDisplayElement.querySelectorAll('div')[inputWords.length];
    NextWordDiv.classList.add("currentWord");

    if (lastInputWord !== correspondingDisplayWord) {
      wordDiv.classList.add('incorrect');
      wordDiv.classList.remove('correct');
    } else {
      wordDiv.classList.remove('incorrect');
      wordDiv.classList.add('correct');
    };

    //scroll words into view if required
    if (!isChildDivVisible(quoteDisplayElement, NextWordDiv)) {
      NextWordDiv.scrollIntoView({ behavior: 'smooth' });
    };



  }
});

quoteInputElement.addEventListener("keydown", function (event) {
  // Check if Tab key is pressed
  if (event.key==='Tab') {
    event.preventDefault(); // Prevent default tab behavior
    svg.focus(); // Set focus to the SVG element
  }
});

svg.addEventListener("keydown", function (event) {
  // Check if Enter key is pressed
  if (event.key==="Enter") {
    quoteInputElement.focus();
    startNewGame();
  }
});


// Function to check if the child div is visible within the parent div
function isChildDivVisible(parentDiv, childDiv) {
  var parentRect = parentDiv.getBoundingClientRect();
  var childRect = childDiv.getBoundingClientRect();

  var isVisible = (childRect.top >= parentRect.top) && (childRect.bottom <= parentRect.bottom);
  return isVisible;
}

function updateTimer() {
  timeLeft--;
  timerElement.textContent = timeLeft;  // Update the timer div

  if (timeLeft <= 0) {
    clearInterval(timerId);
    endGame();

  }
  
  //if (timeLeft <= 0) clearInterval(timerId);  // Stop updating the timer when time is up
}

function endGame() {
  let correctKeystrocksCount = 0;
  let incorrectWordCount = 0;
  let correctWordCount = 0;

  //find number of words typed
  correctWordCount = quoteDisplayElement.querySelectorAll('.correct').length;
  incorrectWordCount = quoteDisplayElement.querySelectorAll('.incorrect').length;
  wordCount = correctWordCount + incorrectWordCount;

  quoteDisplayElement.querySelectorAll('.correct').forEach(function (wordDiv) {
    if (wordDiv.childElementCount !== undefined) {
      correctKeystrocksCount = correctKeystrocksCount + wordDiv.childElementCount;
    }
  });



  quoteInputElement.disabled = true;

  let grossWPM = (keystrokeCount / 5) / (TIME_LIMIT / 60);
  let netWPM = ((correctKeystrocksCount + correctWordCount) / 5) / (TIME_LIMIT / 60);

  const resultText = `
  <div style="text-align: center;">আপনার প্রতি মিনিটে টাইপিং গতি</div>
  <div style="font-size: 3.1rem;border-radius: 15px;text-align: center;padding: 0px 15px;margin-top: 5px;margin-bottom: 10px;border: 2px solid;" id="wpm">${netWPM.toFixed(0)} WPM</div>
          
  <div id="details">
      <table class="details-table" style="width: 700px;">
        <tbody><tr><th>মোট শব্দ:</th><td>${wordCount} টি</td></tr>
          <tr><th>সঠিক শব্দ:</th><td>${correctWordCount} টি</td></tr>
          <tr><th>ভুল শব্দ:</th><td>${incorrectWordCount} টি</td></tr>
          <tr><th>মোট কি-প্রেস:</th><td>${keystrokeCount} বার</td></tr>
          <tr><th>সঠিকভাবে টাইপকৃত বর্ণের সংখ্যা:</th><td>${correctKeystrocksCount}</td></tr>
          <tr><th>CPM:</th><td>${correctKeystrocksCount / (TIME_LIMIT / 60)}</td></tr>
          <tr><th>Gross WPM:</th><td>${grossWPM.toFixed(2)}</td></tr>
          <tr><th>Net WPM:</th><td>${netWPM.toFixed(2)}</td></tr>
        </tbody></table>
      </table>
  </div>     
`;

  showResult(resultText);

}

async function startNewGame() {
  //set timelimit based on user choice
  const savedChoiceTime = localStorage.getItem('selectedDuration');
  if (savedChoiceTime) {
    TIME_LIMIT = parseInt(savedChoiceTime);
  }

  quoteDisplayElement.scrolltop = 0;
  quoteInputElement.disabled = false;
  quoteInputElement.value = '';
  startTime = null;
  wordCount = 0;
  keystrokeCount = 0;
  timeLeft = TIME_LIMIT;
  correctKeystrocksCount = 0;
  timerElement.textContent = timeLeft; // Reset the timer div

  quoteDisplayElement.innerHTML = "";

  if (timerId != null) {
    clearInterval(timerId);
  }




  //show setting div if hidden
  if (settingDiv.classList.contains("unclickable")) {
    settingDiv.classList.remove("unclickable");
    settingDiv.classList.add("clickable");
  }

  //show game canvas div if hidden
  if (typingCanvas.classList.contains("hidden")) {
    typingCanvas.classList.remove("hidden");
  }


  // Assuming words is your array of words
  let words = getWordsToType(true, true, RandomWords, 200)



  words.forEach((word, index) => {
    // Create a new div with class 'word'
    let wordDiv = document.createElement('div');
    wordDiv.className = 'word';

    // Split the word into individual letters
    let letters = word.split('');

    // Create a new span for each letter and append it to the div
    letters.forEach(letter => {
      let letterSpan = document.createElement('span');
      letterSpan.textContent = letter;
      wordDiv.appendChild(letterSpan);
    });

    // Append the div to the body (or any other container element)
    quoteDisplayElement.appendChild(wordDiv);

    // Add a space after each word, except the last one
    if (index !== words.length - 1) {
      let spaceNode = document.createElement('span');
      spaceNode.textContent = " "
      quoteDisplayElement.appendChild(spaceNode);
    }
  });

  //mark first word as current word
  quoteDisplayElement.firstChild.classList.add("currentWord");
  quoteInputElement.value = null
  //set focus
  quoteInputElement.focus();
}


// Function to display the result in the popup
function showResult(text) {
  resultElement.innerHTML = text;

  typingCanvas.classList.add('hidden');
  popupElement.classList.remove("hidden");
  closeButton.focus();
}

// Event listener for retry button button
closeButton.addEventListener("click", () => {
  popupElement.classList.add("hidden");
  startNewGame();
});

startNewGame()


//set and load text mode
// Save user selection to local storage
const radioButtons = document.querySelectorAll('.textmode-setting-panel input[type="radio"]');
radioButtons.forEach(button => {
  button.addEventListener('change', () => {
    const selectedOption = button.id;
    localStorage.setItem('selectedTextMode', selectedOption);
    startNewGame();
  });
});

// Load user choice from local storage during page load
const savedChoice = localStorage.getItem('selectedTextMode');
if (savedChoice) {
  document.getElementById(savedChoice).checked = true;
}


//set and load time
const TimeRadioButtons = document.querySelectorAll('.time-setting-panel input[type="radio"]');
TimeRadioButtons.forEach(button => {
  button.addEventListener('change', () => {
    const selectedOption = button.id;
    localStorage.setItem('selectedDuration', selectedOption);
    startNewGame();
  });
});

// Load user choice from local storage during page load
const savedChoiceTime = localStorage.getItem('selectedDuration');
if (savedChoiceTime) {
  document.getElementById(savedChoiceTime).checked = true;
}


//prevent paste and drag and drop in input field
document.getElementById('quoteInput').addEventListener('paste', function (e) {
  e.preventDefault();
});
document.getElementById('quoteInput').addEventListener('dragover', function (e) {
  e.preventDefault();
});
document.getElementById('quoteInput').addEventListener('drop', function (e) {
  e.preventDefault();
});


