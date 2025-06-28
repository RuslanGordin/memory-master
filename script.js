// Данные для карточек
const cardData = {
    physics: [
        { formula: "F = ma", description: "Второй закон Ньютона" },
        { formula: "E = mc²", description: "Формула энергии" },
        { formula: "P = F/S", description: "Давление" },
        { formula: "F = mg", description: "Сила тяжести" },
        { formula: "ρ = m/V", description: "Плотность" },
        { formula: "A = F·s", description: "Работа силы" },
        { formula: "v = s/t", description: "Скорость" },
        { formula: "P = A/t", description: "Мощность" }
    ],
    math: [
        { formula: "a² + b² = c²", description: "Теорема Пифагора" },
        { formula: "(a + b)² = a² + 2ab + b²", description: "Квадрат суммы" },
        { formula: "S = πr²", description: "Площадь круга" },
        { formula: "V = πr²h", description: "Объем цилиндра" },
        { formula: "P = 2(a + b)", description: "Периметр прямоугольника" },
        { formula: "S = a·b", description: "Площадь прямоугольника" },
        { formula: "V = a·b·c", description: "Объем параллелепипеда" },
        { formula: "S = (a·h)/2", description: "Площадь треугольника" }
    ],
    informatics: [
        { formula: "2⁸ = 256", description: "Байт" },
        { formula: "I = v·t", description: "Количество информации" },
        { formula: "N = 2ⁱ", description: "Количество комбинаций" },
        { formula: "V = t·v", description: "Объем данных" },
        { formula: "K = i/n", description: "Коэффициент сжатия" },
        { formula: "H = -Σpᵢlog₂pᵢ", description: "Энтропия" },
        { formula: "Q = 2^n", description: "Количество информации" },
        { formula: "D = V/t", description: "Скорость передачи данных" }
    ]
};

// Состояние игры
let currentSubject = 'physics';
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let hintsLeft = 3;
let timer = null;
let seconds = 0;
let isGameActive = false;

// Создание карточек
function createCards() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    const cards = [...cardData[currentSubject], ...cardData[currentSubject]]
        .sort(() => Math.random() - 0.5);

    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.innerHTML = `
            <div class="card-front"></div>
            <div class="card-back">
                <div class="formula">${card.formula}</div>
                <div class="description">${card.description}</div>
            </div>
        `;
        
        cardElement.addEventListener('click', () => handleCardClick(cardElement, index));
        gameBoard.appendChild(cardElement);
    });
}

// Обработка клика по карточке
function handleCardClick(card, index) {
    if (!isGameActive) {
        isGameActive = true;
        startTimer();
    }
    
    if (flippedCards.length >= 2) return;
    if (card.classList.contains('flipped')) return;
    if (card.classList.contains('matched')) return;
    
    card.classList.add('flipped');
    flippedCards.push({ element: card, index: index });
    
    if (flippedCards.length === 2) {
        moves++;
        document.getElementById('moves').textContent = moves;
        setTimeout(checkMatch, 1000);
    }
}

// Проверка совпадения
function checkMatch() {
    const [first, second] = flippedCards;
    const firstFormula = first.element.querySelector('.formula').textContent;
    const secondFormula = second.element.querySelector('.formula').textContent;
    
    if (firstFormula === secondFormula) {
        first.element.classList.add('matched');
        second.element.classList.add('matched');
        matchedPairs++;
        
        if (matchedPairs === cardData[currentSubject].length) {
            endGame();
        }
    } else {
        first.element.classList.remove('flipped');
        second.element.classList.remove('flipped');
    }
    
    flippedCards = [];
}

// Таймер
function startTimer() {
    if (timer) return;
    timer = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

// Завершение игры
function endGame() {
    stopTimer();
    isGameActive = false;
    
    const modal = document.getElementById('winModal');
    document.getElementById('finalMoves').textContent = moves;
    document.getElementById('finalTime').textContent = document.getElementById('timer').textContent;
    modal.style.display = 'flex';
}

// Сброс игры
function resetGame() {
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    seconds = 0;
    isGameActive = false;
    hintsLeft = 3;
    
    stopTimer();
    document.getElementById('moves').textContent = '0';
    document.getElementById('timer').textContent = '00:00';
    document.getElementById('hint').textContent = `Подсказка (${hintsLeft})`;
    document.getElementById('winModal').style.display = 'none';
    
    createCards();
}

// Подсказка
function showHint() {
    if (hintsLeft <= 0 || !isGameActive) return;
    
    const unmatchedCards = Array.from(document.querySelectorAll('.card:not(.matched):not(.flipped)'));
    if (unmatchedCards.length < 2) return;
    
    const firstCard = unmatchedCards[0];
    const firstFormula = firstCard.querySelector('.formula').textContent;
    const matchingCard = unmatchedCards.find(card => 
        card !== firstCard && 
        card.querySelector('.formula').textContent === firstFormula
    );
    
    if (matchingCard) {
        firstCard.classList.add('flipped');
        matchingCard.classList.add('flipped');
        
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            matchingCard.classList.remove('flipped');
        }, 1000);
        
        hintsLeft--;
        document.getElementById('hint').textContent = `Подсказка (${hintsLeft})`;
    }
}

// Смена предмета
function changeSubject(subject) {
    if (currentSubject === subject) return;
    
    currentSubject = subject;
    document.querySelectorAll('.subject-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.subject === subject);
    });
    
    resetGame();
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('newGame').addEventListener('click', resetGame);
    document.getElementById('hint').addEventListener('click', showHint);
    document.getElementById('playAgain').addEventListener('click', resetGame);
    
    document.querySelectorAll('.subject-btn').forEach(btn => {
        btn.addEventListener('click', () => changeSubject(btn.dataset.subject));
    });
    
    createCards();
}); 