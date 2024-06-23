// script.js

var WebApp = window.Telegram.WebApp;

WebApp.onEvent('viewportChanged', () => WebApp.expand());

document.addEventListener('DOMContentLoaded', () => {
    // Примеры данных друзей
    const receivedDrawings = [
        { name: 'Иван', imgSrc: 'img/ivan.png', drawingSrc: 'img/ivan-drawing.png', correctAnswer: 'cat' },
        { name: 'Мария', imgSrc: 'img/maria.png', drawingSrc: 'img/maria-drawing.png', correctAnswer: 'dog' }
    ];

    const waitingForDrawings = [
        { name: 'Алексей', imgSrc: 'img/alexey.png' },
        { name: 'Ольга', imgSrc: 'img/olga.png' }
    ];

    populateFriendLists(receivedDrawings, waitingForDrawings);

    // Initialize with the first section visible
    showSection('friends');
});

function populateFriendLists(received, waiting) {
    const receivedList = document.getElementById('received-list');
    const waitingList = document.getElementById('waiting-list');

    received.forEach(friend => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<img src="${friend.imgSrc}" alt="${friend.name}" width="50">${friend.name}`;
        listItem.onclick = () => openReceivedDrawing(friend.name, friend.drawingSrc, friend.correctAnswer);
        receivedList.appendChild(listItem);
    });

    waiting.forEach(friend => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<img src="${friend.imgSrc}" alt="${friend.name}" width="50">${friend.name}`;
        listItem.onclick = () => openDrawingCanvas(friend.name);
        waitingList.appendChild(listItem);
    });
}

function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));

    // Show the selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
}

function openReceivedDrawing(friendName, drawingSrc, correctAnswer) {
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <h2>Рисунок от ${friendName}</h2>
        <img src="${drawingSrc}" alt="Рисунок от ${friendName}" style="max-width: 100%; height: auto;">
        <input type="text" id="guess-input" placeholder="Ваш ответ">
        <button onclick="checkAnswer('${correctAnswer}')">Ответить</button>
        <button class="back-button" onclick="closeModal()">Назад</button>
    `;
    showModal();
}

function openDrawingCanvas(friendName) {
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <h2>Рисунок для ${friendName}</h2>
        <canvas id="drawing-canvas" width="300" height="300" style="border:1px solid #000;"></canvas>
        <input type="text" id="answer-input" placeholder="Ответ">
        <button onclick="sendDrawing('${friendName}')">Отправить</button>
        <button class="back-button" onclick="closeModal()">Назад</button>
    `;
    showModal();

    // Initialize canvas for drawing
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');
    let drawing = false;

    // Support for both mouse and touch events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });

    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('touchend', stopDrawing, { passive: false });

    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('touchmove', draw, { passive: false });

    function startDrawing(event) {
        drawing = true;
        ctx.beginPath();
        ctx.moveTo(getX(event), getY(event));
        event.preventDefault();
    }

    function stopDrawing(event) {
        drawing = false;
        ctx.beginPath();
        event.preventDefault();
    }

    function draw(event) {
        if (!drawing) return;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';

        ctx.lineTo(getX(event), getY(event));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(getX(event), getY(event));
        event.preventDefault();
    }

    function getX(event) {
        if (event.touches) {
            return event.touches[0].clientX - canvas.offsetLeft;
        }
        return event.clientX - canvas.offsetLeft;
    }

    function getY(event) {
        if (event.touches) {
            return event.touches[0].clientY - canvas.offsetTop - 150;
        }
        return event.clientY - canvas.offsetTop;
    }
}

function checkAnswer(correctAnswer) {
    const guessInput = document.getElementById('guess-input');
    if (guessInput.value.toLowerCase() === correctAnswer.toLowerCase()) {
        guessInput.classList.add('correct');
        guessInput.classList.remove('incorrect');
        alert('Правильно!');
        closeModal();
    } else {
        guessInput.classList.add('incorrect');
        guessInput.classList.remove('correct');
    }
}

function sendDrawing(friendName) {
    const answerInput = document.getElementById('answer-input');
    if (answerInput.value.trim() !== '') {
        alert(`Рисунок и ответ отправлены ${friendName}!`);
        closeModal();
    } else {
        alert('Пожалуйста, введите ответ.');
    }
}

function showModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

function generateReferralLink() {
    const botUsername = '@Fidisobot'; // Замените на имя вашего бота
    const userId = WebApp.initDataUnsafe.user.id; // Замените на идентификатор пользователя, если нужно
    const referralLink = `https://t.me/${botUsername}?start=${userId}`;

    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <h2>Пригласить друга</h2>
        <p>Скопируйте и отправьте эту ссылку своему другу:</p>
        <input type="text" value="${referralLink}" readonly onclick="this.select()">
        <button class="back-button" onclick="closeModal()">Назад</button>
    `;
    showModal();
}
