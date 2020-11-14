window.socket = null;
let username = "";
let canStart = false;
let letter = '';

function connectToSocketIo() {
    let server = window.location.protocol + "//" + window.location.host;
    window.socket = io.connect(server);

    window.socket.on('canStart', (start) => {
        console.log(start)
        canStart = start;
        letter = '';
        document.getElementById('remaining-time').style.display = "none";
        document.getElementById('results').innerHTML = ''

        document.getElementById('join-game').style.display = "none";
        document.getElementById('results-game').style.display = "none";
        document.getElementById('active-game').style.display = "none";
        document.getElementById('waiting-game').style.display = "block";
        document.getElementById('waiting-username').innerHTML = username;

        document.getElementById('start-btn').disabled = !canStart;
    });

    window.socket.on('subscribeToActive', () => {
        window.socket.emit('subscribeToActive', true);
    });

    window.socket.on('gameStarted', (game) => {
        document.getElementById('waiting-game').style.display = "none";
        document.getElementById('active-game').style.display = "block";
        document.getElementById('active-username').innerHTML = username;

        letter = game.letter;
        const ident = game.letter + " (" + game.letter.toLowerCase() + ")";
        document.getElementById('letter').innerHTML = ident;
    });

    window.socket.on('countdown', time => {
        document.getElementById('remaining-time').style.display = "block";
        document.getElementById('remaining-secs').innerHTML = time;
    })

    window.socket.on('remainingTime', time => {
        document.getElementById('remaining-secs').innerHTML = time;
        if (time === 1) {
            let nombre = document.getElementById("nombre-input").value;
            let color = document.getElementById("color-input").value;
            let fruto = document.getElementById("fruto-input").value;

            window.socket.emit('sendAnswer', { nombre, color, fruto });
        }
        if (time === 0) {
            window.socket.emit('askResults', letter);
        }
    })

    window.socket.on('results', results => {
        console.log(results);
        document.getElementById('waiting-game').style.display = "none";
        document.getElementById('active-game').style.display = "none";
        document.getElementById('results-game').style.display = "block";

        let res = document.getElementById('results');
        for (result of results) {
            let row = document.createElement('tr');
            let col1 = document.createElement('td');
            col1.innerHTML = result.username;
            row.appendChild(col1)

            let col2 = document.createElement('td');
            col2.innerHTML = result.score;
            row.appendChild(col2)
            res.appendChild(row)
        }
    })
}

const joinGame = () => {
    let uname = document.getElementById("username-input").value;
    username = uname;
    window.socket.emit('joinGame', { username })
}

const startGame = () => {
    window.socket.emit('startGame', {});
}

const restartGame = () => {
    window.socket.emit('restartGame', {});
}

const sendAnswer = () => {
    let nombre = document.getElementById("nombre-input").value;
    let color = document.getElementById("color-input").value;
    let fruto = document.getElementById("fruto-input").value;

    window.socket.emit('sendAnswer', { nombre, color, fruto })
}

$(function() {
    connectToSocketIo();
});