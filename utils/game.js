let users = [];
let waitingUsers = [];

let gameState = {
    active: false,
    letter: '',
    firstAnswer: false,
}

const joinUser = (id, username) => {
    let newUser = { id, username };
    if (gameState.active) {
        waitingUsers.push(newUser);
        return "waiting";
    } else {
        users.push(newUser);
        return "active";
    }
};

const userCanStart = (id) => {
    let u = users.find(user => user.id === id);
    if (u) {
        return users.length + waitingUsers.length >= 2 ? true : false;
    }
    return false;
}

const startGame = () => {
    gameState.active = true;
    users = [...users, ...waitingUsers];
    waitingUsers = [];
    gameState.letter = String.fromCharCode(65 + Math.floor(Math.random() * Math.floor(26)));
    return gameState;
}

const getGame = () => {
    return [gameState, users, waitingUsers];
}

const setAnswer = (ans, id) => {
    let i = users.findIndex(user => user.id === id);
    users[i] = {...users[i], answer: ans }
    gameState.firstAnswer = true;
}

const getResults = (letter) => {
    let results = users.map(user => {
        let score = 0;
        score += user.answer.nombre.toUpperCase()[0] === letter ? 100 : 0;
        score += user.answer.color.toUpperCase()[0] === letter ? 100 : 0;
        score += user.answer.fruto.toUpperCase()[0] === letter ? 100 : 0;
        return {
            username: user.username,
            score
        }
    });

    return results;
}

const restart = () => {
    gameState.active = false;
    gameState.letter = '';
    gameState.firstAnswer = false;
    users = users.map(user => {
        return { username: user.username, id: user.id }
    })
}

module.exports = {
    joinUser,
    userCanStart,
    startGame,
    getGame,
    setAnswer,
    getResults,
    restart
}