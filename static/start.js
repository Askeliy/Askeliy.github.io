document.addEventListener('DOMContentLoaded', () => {
    const createSessionButton = document.getElementById('create-session-button');
    const joinSessionButton = document.getElementById('join-session-button');
    const startButton = document.getElementById('start-button');

    let sessionId = null;
    let userId = 123;
    let data = [];

    async function get_session_id(){
        const response = await fetch(`/get-session-id/${userId}`);
        sessionResp = await response.json();
        sessionId = sessionResp.session_id;
        console.log(sessionId);
    }

    async function get_data(){
        const response = await fetch(`/get-players/${sessionId}`);
        data = await response.json();
        console.log(data);
    }

    async function populateFriendLists() {
        await get_data();
        const receivedList = document.getElementById('received-list');
        receivedList.innerHTML = '';
        data.players.forEach(friend => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `${friend}`;
            receivedList.appendChild(listItem);
        });
    }
    
    createSessionButton.addEventListener('click', async () => {
            const response = await fetch('/create-session', {
                method: 'POST'
            });
            const inf = await response.json();
            sessionId = inf.session_id;
            alert(`Session created with ID: ${sessionId}`);
            });
        
    joinSessionButton.addEventListener('click', async () => {
            let alert_sessionId = prompt("Enter the session id:");
            const playerName = prompt("Enter your name:");
            const response = await fetch(`/join-session/${alert_sessionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ player_name: playerName, user_id: userId })
            });
            const inf = await response.json();
            if (inf.status === 'joined') {
                alert(`Joined session with ID: ${alert_sessionId}`);
                populateFriendLists();
            } else {
                alert(`Error joining session: ${inf.status}`);
            }
            });

    startButton.addEventListener('click', async () => {
        const response = await fetch(`/start-game/${sessionId}`, {
            method: 'GET'
        });
        const inf = await response.json();
        if (inf.status === 'start_game'){
        window.open(`game`);
        }
    });


    (async () => {
        await get_session_id();
        console.log(sessionId);
        if (sessionId != null){
            populateFriendLists();
        }
    })();
});