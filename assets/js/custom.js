document.addEventListener('DOMContentLoaded', function() {
    "use strict";

    console.log("Custom JS: Pasiruošęs darbui");

    // ====================================================================
    // 1. KONTAKTŲ FORMOS LOGIKA (Jūsų originalus kodas)
    // ====================================================================

    const contactForm = document.getElementById('manoKontaktųForma');
    const resultsContainer = document.getElementById('formosRezultatai');
    const resultsContent = document.getElementById('rezultatuTurinioVieta');
    const successPopup = document.getElementById('sekmesPranesimas');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Custom JS: Mygtukas paspaustas");

            try {
                // 1. Surenkame duomenis
                const vardas = document.getElementById('vardas')?.value || "Nėra";
                const pavarde = document.getElementById('pavarde')?.value || "Nėra";
                const email = document.getElementById('email')?.value || "Nėra";
                const telefonas = document.getElementById('telefonas')?.value || "Nėra";
                const adresas = document.getElementById('adresas')?.value || "Nėra";

                // Paimame vertinimus
                const elQ1 = document.getElementById('klausimas1');
                const elQ2 = document.getElementById('klausimas2');
                const elQ3 = document.getElementById('klausimas3');

                if (!elQ1 || !elQ2 || !elQ3) {
                    console.error("KLAIDA: Nerasti klausimų laukeliai.");
                    alert("Klaida: HTML formoje trūksta klausimų laukelių su tinkamais ID.");
                    return;
                }

                const q1 = Number(elQ1.value);
                const q2 = Number(elQ2.value);
                const q3 = Number(elQ3.value);

                const vidurkis = (q1 + q2 + q3) / 3;
                const suapvalintasVidurkis = vidurkis.toFixed(1);

                const formDataObject = {
                    Vardas: vardas,
                    Pavardė: pavarde,
                    El_pastas: email,
                    Vertinimai: { D: q1, P: q2, A: q3 },
                    Vidurkis: suapvalintasVidurkis
                };

                // 3. Atvaizduojame rezultatus
                const outputHTML = `
                    <ul class="list-group">
                        <li class="list-group-item"><strong>Vardas:</strong> ${formDataObject.Vardas}</li>
                        <li class="list-group-item"><strong>Pavardė:</strong> ${formDataObject.Pavardė}</li>
                        <li class="list-group-item"><strong>El. paštas:</strong> ${formDataObject.El_pastas}</li>

                        <li class="list-group-item list-group-item-secondary"><strong>Vertinimai:</strong></li>
                        <li class="list-group-item">Dizainas: ${q1}</li>
                        <li class="list-group-item">Patogumas: ${q2}</li>
                        <li class="list-group-item">Aptarnavimas: ${q3}</li>

                        <li class="list-group-item list-group-item-success fs-5 text-center">
                            <strong>${formDataObject.Vardas} ${formDataObject.Pavardė}: ${formDataObject.Vidurkis}</strong>
                        </li>
                    </ul>
                `;

                if (resultsContent && resultsContainer) {
                    resultsContent.innerHTML = outputHTML;
                    resultsContainer.style.display = 'block';
                    resultsContainer.scrollIntoView({ behavior: 'smooth' });
                }

                // 4. Parodome "Pop-up"
                if (successPopup) {
                    successPopup.style.display = 'block';
                    setTimeout(function() {
                        successPopup.style.display = 'none';
                    }, 4000);
                }

            } catch (error) {
                console.error("JavaScript klaida:", error);
            }
        });
    }

    // ====================================================================
    // 3. ŽAIDIMO PRADINĖ INICIALIZACIJA (Paleidžiama tik, kai DOM pilnai įkeltas)
    // ====================================================================
    
    // NAUJAS: Įkeliame geriausius rezultatus iš localStorage
    loadBestScores(); 
    
    // Nustatykite pradinį lygį ir būseną
    currentDifficulty = document.querySelector('input[name="difficulty"]:checked')?.value || 'easy';
    resetState();
    resetBtn.disabled = true; 
    
    // NAUJAS: Rodyti geriausią rezultatą pasirinktam lygiui
    updateBestScoreDisplay(); 

}); // Uždarymas DOMContentLoaded


// ====================================================================
// 2. MEMORY GAME LOGIKA (GLOBALŪS KINTAMIEJI IR FUNKCIJOS)
// ====================================================================

// Duomenų rinkinys
const CARD_ICONS = [
    'fa-heart', 'fa-star', 'fa-gem', 'fa-bell', 'fa-crown', 'fa-anchor',
    'fa-rocket', 'fa-flask', 'fa-cloud', 'fa-sun', 'fa-moon', 'fa-bolt'
];

// Sudėtingumo lygiai
const difficulties = {
    easy: { rows: 3, cols: 4, pairs: 6 },
    hard: { rows: 4, cols: 6, pairs: 12 }
};

// Žaidimo būsenos kintamieji
let gameCards = [];
let currentDifficulty = 'easy';
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let moves = 0;
let matchedPairs = 0;

// Laikmačio valdymas (NAUJI)
let timerInterval; 
let totalSeconds = 0; 

// LOCALSTORAGE KINTAMIEJI
const STORAGE_KEY = "memoryGameBestScores"; 
let bestScores = { easy: Infinity, hard: Infinity }; 

// DOM elementai
const board = document.getElementById('game-board');
const movesCountElement = document.getElementById('moves-count');
const matchedCountElement = document.getElementById('matched-count');
const winMessage = document.getElementById('win-message');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const difficultyInputs = document.querySelectorAll('input[name="difficulty"]');
const bestScoreMovesElement = document.getElementById('best-score-moves');
const timeCountElement = document.getElementById('time-count'); // NAUJAS DOM elementas


// ********************************************
// LOCALSTORAGE FUNKCIJOS
// ********************************************

function loadBestScores() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            
            bestScores.easy = parsedData.easy || Infinity;
            bestScores.hard = parsedData.hard || Infinity;
        }
    } catch (e) {
        console.error("Klaida įkeliant rezultatus iš localStorage:", e);
    }
}

function saveBestScore(difficulty, moves) {
    if (moves < bestScores[difficulty]) {
        bestScores[difficulty] = moves;

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(bestScores));
        } catch (e) {
            console.error("Klaida išsaugant rezultatus į localStorage:", e);
        }
        return true; 
    }
    return false; 
}

function updateBestScoreDisplay() {
    const bestMoveCount = bestScores[currentDifficulty];
    
    if (bestMoveCount === Infinity) {
        bestScoreMovesElement.textContent = '--';
    } else {
        bestScoreMovesElement.textContent = bestMoveCount;
    }
}

// ********************************************
// LAIKMAČIO FUNKCIJOS (NAUJOS)
// ********************************************

// Atnaujina laiką formatu MM:SS
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

// Paleisti laikmatį (prasideda paspaudus "Start")
function startTimer() {
    clearInterval(timerInterval); 
    totalSeconds = 0;
    timeCountElement.textContent = formatTime(totalSeconds);

    timerInterval = setInterval(() => {
        totalSeconds++;
        timeCountElement.textContent = formatTime(totalSeconds);
    }, 1000);
}

// Sustabdyti laikmatį (laimėjus arba atnaujinus)
function stopTimer() {
    clearInterval(timerInterval);
}


// ********************************************
// PAGRINDINĖ ŽAIDIMO LOGIKA
// ********************************************

// Funkcija kortelių maišymui (Fisher-Yates)
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

// Funkcija kortelių lentos sukūrimui
function generateCards() {
    const config = difficulties[currentDifficulty];
    const totalPairs = config.pairs;
    const selectedIcons = CARD_ICONS.slice(0, totalPairs);
    gameCards = shuffle(selectedIcons.concat(selectedIcons));

    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
    board.style.maxWidth = `${config.cols * 110}px`;

    gameCards.forEach(icon => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.icon = icon;

        card.innerHTML = `
            <div class="card-back"><i class="fas fa-question"></i></div>
            <div class="card-face"><i class="fas ${icon}"></i></div>
        `;

        card.addEventListener('click', handleCardClick);
        board.appendChild(card);
    });
}

// Atstatyti žaidimo būseną
function resetState() {
    moves = 0;
    matchedPairs = 0;
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    hasFlippedCard = false;
    
    updateStats();
    winMessage.classList.add('hidden');
    
    // Atstatyti laikmačio rodmenis
    totalSeconds = 0;
    timeCountElement.textContent = formatTime(totalSeconds);
}

// Atnaujinti statistikos rodiklius
function updateStats() {
    movesCountElement.textContent = moves;
    matchedCountElement.textContent = matchedPairs;
}

// Kortelės apvertimo logika
function handleCardClick() {
    if (lockBoard || this === firstCard || this.classList.contains('matched')) return;

    this.classList.add('flipped');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    moves++;
    updateStats();

    checkForMatch();
}

// Kortelių sutapimo taisyklių įgyvendinimas
function checkForMatch() {
    let isMatch = firstCard.dataset.icon === secondCard.dataset.icon;
    isMatch ? disableCards() : unflipCards();
}

// Sutapimas
function disableCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');

    firstCard.removeEventListener('click', handleCardClick);
    secondCard.removeEventListener('click', handleCardClick);

    matchedPairs++;
    updateStats();
    resetBoard(); 

    if (matchedPairs === difficulties[currentDifficulty].pairs) {
        showWinMessage();
    }
}

// Nesutapimas
function unflipCards() {
    lockBoard = true; 

    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000); 
}

// Atstatyti kortelių nuorodas po ėjimo
function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

// Rodyti laimėjimo pranešimą (7)
function showWinMessage() {
    // Sustabdyti laikmatį
    stopTimer(); 
    
    const isNewBest = saveBestScore(currentDifficulty, moves);

    let message = `Laimėjote per ${moves} ėjimus! Laikas: ${formatTime(totalSeconds)}.`;
    
    if (isNewBest) {
        message += " (NAUJAS GERIAUSIAS REZULTATAS!)";
    }
    
    winMessage.textContent = message;
    winMessage.classList.remove('hidden');

    updateBestScoreDisplay();
}

// Pradėti žaidimą (8)
function startGame() {
    resetState(); 
    generateCards(); 
    
    // Paleisti laikmatį
    startTimer(); 
    
    startBtn.disabled = true;
    resetBtn.disabled = false;
}

// Atnaujinti/perkrauti žaidimą (9)
function resetGame() {
    stopTimer(); 
    startGame(); 
}

// ====================================================================
// ĮVYKIŲ KLAUSYTOJAI
// ====================================================================

// 3.b: Atnaujinti, kai pasikeičia sudėtingumo lygis
difficultyInputs.forEach(input => {
    input.addEventListener('change', (e) => {
        currentDifficulty = e.target.value;
        startBtn.disabled = false; 
        resetBtn.disabled = true;

        board.innerHTML = '<p class="placeholder-text">Pasirinktas lygis: ' + (currentDifficulty === 'easy' ? 'Lengvas' : 'Sunkus') + '. Paspauskite "Start".</p>';
        resetState();
        updateBestScoreDisplay(); 
    });
});

// 8. Įgyvendinti "Start" mygtuką
startBtn.addEventListener('click', startGame);

// 9. Įgyvendinti "Atnaujinti" mygtuką
resetBtn.addEventListener('click', resetGame);