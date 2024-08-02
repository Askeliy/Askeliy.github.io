document.addEventListener('DOMContentLoaded', () => {
    const gameStatusDiv = document.getElementById('game-status');
    const playerHandDiv = document.getElementById('player-hand');
    const attackButton = document.getElementById('attack-button');
    const defendButton = document.getElementById('defend-button');
    const createSessionButton = document.getElementById('create-session-button');
    const joinSessionButton = document.getElementById('join-session-button');
    const startButton = document.getElementById('start-button');

    const playerHand = document.getElementById('player-hand');
    const opponentHand = document.getElementById('opponent-hand');
    const centerTable = document.getElementById('center-table');
    const deck = document.getElementById('deck');
    const bita = document.getElementById('bita');
    const endTurnButton = document.getElementById('end-turn-button');
    const takeCardsButton = document.getElementById('take-cards-button');
    const biteButton = document.getElementById('bite-button');

    let sessionId = null;
    let userId = 123;
    let data = [];
    let attack_time = true;
    let defend_time = false;
    let tableCardWeights = [];
    let currentPlayer = [];
    let trumpCard = null;

    async function get_session_id(){
        const response = await fetch(`/get-session-id/${userId}`);
        sessionResp = await response.json();
        sessionId = sessionResp.session_id;
        console.log(sessionId);
    }

    

    async function fetchGameStatus() {
        const response = await fetch(`/game-status/${sessionId}`);
        data = await response.json();
        if (!sessionId) return;
        if (data.game)
            window.close();
        currentPlayer = data.players.find(player => player.is_current_player);
        trumpCard = data.trump_card;
        tableCardWeights = data.table_card_weights;
        attack_time = data.time_attack;
        defend_time = data.time_defend;
        //displayGameStatus(data);
        renderHands();
        renderTable();
        playerDropCards();

    }

    function createCard(card, isFaceUp = true) {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        if (!isFaceUp) {
            cardElement.classList.add('back');
        } else {
            cardElement.textContent = card;
        }
        cardElement.draggable = isFaceUp;

        cardElement.addEventListener('dragstart', () => {
            cardElement.classList.add('dragging');
        });

        cardElement.addEventListener('dragend', () => {
            cardElement.classList.remove('dragging');
        });

        return cardElement;
    }


    function playerDropCards(){
        playerHand.innerHTML = '';

        currentPlayer.hand.forEach((card, index) => {
            const cardElement = createCard(card);
            cardElement.style.transform = `translateX(${index*40}px) rotate(${index * 5 - 10}deg)`;
            playerHand.appendChild(cardElement);
    
            let startX, startY, initialX, initialY;
    
            const downHandler = (event) => {
                event.preventDefault(); // Prevent default drag behavior
    
                if (event.type === 'touchstart') {
                    startX = event.touches[0].clientX;
                    startY = event.touches[0].clientY;
                } else {
                    startX = event.clientX;
                    startY = event.clientY;
                }
    
                initialX = cardElement.offsetLeft;
                initialY = cardElement.offsetTop;
    
                const moveHandler = (moveEvent) => {
                    let offsetX, offsetY;
    
                    if (moveEvent.type === 'touchmove') {
                        offsetX = moveEvent.touches[0].clientX - startX;
                        offsetY = moveEvent.touches[0].clientY - startY;
                    } else {
                        offsetX = moveEvent.clientX - startX;
                        offsetY = moveEvent.clientY - startY;
                    }
    
                    cardElement.style.transform = `translate(${offsetX+index*40}px, ${offsetY}px)`;
                };
    
                const upHandler = (event) => {
                    document.removeEventListener('mousemove', moveHandler);
                    document.removeEventListener('mouseup', upHandler);
    
                    document.removeEventListener('touchmove', moveHandler, { passive: false });
                    document.removeEventListener('touchend', upHandler, { passive: false });
    
                    const rect = centerTable.getBoundingClientRect();
                    const centerTableX = rect.x + rect.width / 2;
                    const centerTableY = rect.y + rect.height / 2;

                    if (event.type === 'touchend') {
                        var touch = event.changedTouches[0];
                        flag_y = touch.pageY < document.documentElement.clientHeight / 2;
                        X = touch.pageX;
                        Y = touch.pageY;
                    }
                    else{
                        flag_y = false;
                    }
    
                    if ((flag_y || event.clientY < document.documentElement.clientHeight / 2) && attack_time) {
                        handlePlayerMove(cardElement);
                        console.log("ATTAK")
                        cardElement.style.transition = 'transform 0.3s ease';
                        cardElement.style.transform = `translateX(0)`;
                        cardElement.style.transform = `translateX(${index * 40}px) rotate(${index * 5 - 10}deg)`;
                    } else if(defend_time){
                        console.log("DEFEND")
                        biteButton.style.display="none";
                        id = getcardId(X, Y)
                        if (id != null){
                            console.log("YES");
                            if (data.table[id])
                                handleDefenderMove(data.table[id][0], cardElement, id);
                        }
                        else
                        {
                            console.log("NO");
                            console.log(X);
                            console.log(Y);
                            console.log(id);
                        }
                        cardElement.style.transition = 'transform 0.3s ease';
                        cardElement.style.transform = `translateX(0)`;
                        cardElement.style.transform = `translateX(${index * 40}px) rotate(${index * 5 - 10}deg)`;
                    } else {
                        console.log("NOTHING")
                        cardElement.style.transition = 'transform 0.3s ease';
                        cardElement.style.transform = `translateX(0)`;
                        cardElement.style.transform = `translateX(${index * 40}px) rotate(${index * 5 - 10}deg)`;
                        setTimeout(() => {
                            cardElement.style.transition = 'none';
                        }, 300);
                    }
                };
    
                document.addEventListener('mousemove', moveHandler);
                document.addEventListener('mouseup', upHandler);
    
                document.addEventListener('touchmove', moveHandler, { passive: false });
                document.addEventListener('touchend', upHandler, { passive: false });
            };
    
            cardElement.addEventListener('mousedown', downHandler);
            cardElement.addEventListener('touchstart', downHandler, { passive: false });
    });
}

function handlePlayerMove(cardElement) {
    if (data.table.length === 0 && currentPlayer) {
        //data.table.push([cardElement.textContent, None]);
        sendAttack(cardElement.textContent)
        //tableCardWeights.push(getCardWeight(cardElement.textContent));
        console.log(`Веса карт на столе: ${tableCardWeights}`);
        //playerCards = playerCards.filter(card => card!== cardElement.textContent);
        fetchGameStatus();
        renderHands();
        renderTable();
        playerDropCards();
    } else {
        const cardWeight = getCardWeight(cardElement.textContent);
        //if (cardWeight > tableCardWeight || (cardWeight === tableCardWeight && getCardSuit(cardElement.textContent) === getCardSuit(trumpCard))) {
        if ((tableCardWeights.includes(cardWeight))) {
            //cardsOnTable.push([cardElement.textContent, cardsOnTable.filter(card => card[2]!== 1).length, currentRole]);
            sendAttack(cardElement.textContent)
            //tableCardWeights.push(getCardWeight(cardElement.textContent));
            console.log(`Веса карт на столе: ${tableCardWeights}`);
            //playerCards = playerCards.filter(card => card!== cardElement.textContent);
            fetchGameStatus();
            renderHands();
            renderTable();
            playerDropCards();           
        }
    }
}





function handleDefenderMove(attack_card, cardElement, id) {
    const cardWeight = getCardWeight(cardElement.textContent);
    const tableCardWeight = getCardWeight(attack_card);
    if ((cardWeight > tableCardWeight && getCardSuit(attack_card) === getCardSuit(cardElement)) || (getCardSuit(attack_card) != getCardSuit(trumpCard) && getCardSuit(cardElement.textContent) === getCardSuit(trumpCard))) {
        sendDefense(attack_card, cardElement.textContent, id)
        tableCardWeights.push(getCardWeight(cardElement.textContent));
        console.log(`Веса карт на столе: ${tableCardWeights}`);
        fetchGameStatus();
        renderHands();
        renderTable();
        playerDropCards();           
    }
}


    function renderHands() {
        playerHand.innerHTML = '';
        opponentHand.innerHTML = '';

        if (defend_time){
            biteButton.style.display="none";
            takeCardsButton.style.display="flex";
        }
        else{
            biteButton.style.display="flex";
            takeCardsButton.style.display="none";
        }

        console.log(data);
        currentPlayer.hand.forEach((card, index) => {
            const cardElement = createCard(card);
            cardElement.style.transform = `translateX(${index*40}px) rotate(${index * 5 - 10}deg)`;
            playerHand.appendChild(cardElement);
        });

        /*opponentCards.forEach((card, index) => {
            const cardElement = createCard(card, false);
            cardElement.style.transform = `translateX(${index * 40}px) rotate(${index * 5 - 10}deg)`;
            opponentHand.appendChild(cardElement);
        });*/
    }

    function renderTable() {
        centerTable.innerHTML = '';
        if (window.innerWidth < 768){
            screen_width = document.documentElement.clientWidth / 60;
        }
        else{
            screen_width = document.documentElement.clientWidth / 30;
        }
        console.log(`Карты на столе: ${data.table}`)
        data.table.forEach((card, index) => {
            console.log(index)
            const cardElement = createCard(card[0], true);
            cardElement.style.transform = getcardPosition(index);
            centerTable.appendChild(cardElement);
            if (card[1] != "None"){
                const cardElement = createCard(card[1], true);
                cardElement.style.transform = `${getcardPosition(index)} rotate(50deg)`;
                centerTable.appendChild(cardElement);
            }
        });
    }

    endTurnButton.addEventListener('click', () => {
        endTurn();
    });

    takeCardsButton.addEventListener('click', () => {
        takeCards();
    });

    biteButton.addEventListener('click', () => {
        get_bite();
    });

    function endTurn(){
        //if (currentPlayer){
        nextTurn();
        fetchGameStatus();
        renderHands();
        renderTable();
        playerDropCards();
        //}
    }

    function takeCards(){
        //turnStarted = false;
        take_cards();
        fetchGameStatus();
        renderHands();
        renderTable();
        playerDropCards();
    }

    function get_bite(){
        //nextTurn();
        getByte();
        fetchGameStatus();
        renderHands();
        renderTable();
        playerDropCards();
    }

    async function sendAttack(card) {
        console.log(card);
        const response = await fetch(`/attack/${sessionId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ card })
        });
        //const data = await response.json();
        //displayGameStatus(data);
    }

    async function sendDefense(attackCard, defendCard) {
        const response = await fetch(`/defend/${sessionId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ attack_card: attackCard, defend_card: defendCard, ID: id })
        });
        //const data = await response.json();
        //displayGameStatus(data);
    }

    async function getByte() {
        const response = await fetch(`/next-turn/${sessionId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify()
        });
    }

    async function nextTurn() {
        const response = await fetch(`/change-role/${sessionId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(defend_time)
        });
        roles = await response.json();
        //attack_time = roles.roles[0];
        //defend_time = roles.roles[1];
        //displayGameStatus(data);
    }

    async function take_cards() {
        const response = await fetch(`/take-cards/${sessionId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify()
        });
    }

    function getCardWeight(card) {
        switch (card[0]) {
            case '6':
                return 1;
            case '7':
                return 2;
            case '8':
                return 3;
            case '9':
                return 4;
            case '1':
                return 5;
            case 'J':
                return 6;
            case 'Q':
                return 7;
            case 'K':
                return 8;
            case 'A':
                return 9;
            default:
                return 0;
        }
    }

    function getCardSuit(card) {
        switch (card[-1]) {
            case '♠':
                return 1;
            case '♥':
                return 2;
            case '♦':
                return 3;
            case '♣':
                return 4;
            default:
                return 0;
        }
    }

    function getcardPosition(index){
        switch (index){
            case 0:
                return `translate(${-20}px, ${0}px)`;
            case 1:
                return `translate(${70}px, ${0}px)`;
            case 2:
                return `translate(${-110}px, ${0}px)`;
            case 3:
                return `translate(${160}px, ${0}px)`;
            case 4:
                return `translate(${-20}px, ${140}px)`;
            case 5:
                return `translate(${70}px, ${140}px)`;
            case 6:
                return `translate(${-110}px, ${140}px)`;
            case 7:
                return `translate(${160}px, ${140}px)`;
            default:
                return `translate(${0}px, ${0}px)`;
    }
}


    function getcardId(x, y){
            if (x>100 && x<200 && y>300 && y<400)
                return 0;
            else if (x>200 && x<300 && y>300 && y<400)
                return 1;
            else if (x>0 && x<100 && y>300 && y<400)
                return 2;
            else if (x>300 && x<400 && y>300 && y<400)
                return 3;
            else if (x>-70 && x<30 && y>90 && y<190)
                return 4;
            else if (x>20 && x<120 && y>90 && y<190)
                return 5;
            else if (x>-160 && x<-60 && y>90 && y<190)
                return 6;
            else if (x>110 && x<210 && y>90 && y<190)
                return 7;
            else
                return null;
}


    /*function displayGameStatus(data) {
        gameStatusDiv.innerHTML = `
            <p>Trump Card: ${data.trump_card}</p>
            <p>Current Turn: ${data.current_turn}</p>
            <p>Players:</p>
            <ul>
                ${data.players.map(player => `<li>${player.name}: ${player.hand.join(', ')}</li>`).join('')}
            </ul>
        `;

        currentPlayer = data.players.find(player => player.is_current_player);
        playerHandDiv.innerHTML = `
            <p>Your Hand:</p>
            <ul>
                ${currentPlayer.hand.map(card => `<li>${card}</li>`).join('')}
            </ul>
        `;
    }


    async function sendDefense(attackCard, defendCard) {
        const response = await fetch('/defend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ attack_card: attackCard, defend_card: defendCard })
        });
        const data = await response.json();
        displayGameStatus(data);
    }

    attackButton.addEventListener('click', () => {
        const selectedCard = prompt("Enter the card you want to attack with:");
        sendAttack(selectedCard);
    });

    defendButton.addEventListener('click', () => {
        const attackCard = prompt("Enter the card you want to defend against:");
        const defendCard = prompt("Enter the card you want to defend with:");
        sendDefense(attackCard, defendCard);
    });*/

    (async () => {
        await get_session_id();
        console.log(sessionId);
        if (sessionId != null){
            fetchGameStatus();
        }
    })();
});