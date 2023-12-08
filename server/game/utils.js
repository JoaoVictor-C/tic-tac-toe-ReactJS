shufflePlayers = () => {
    let random = Math.floor(Math.random() * 2);
    if (random === 0) {
        return "X"
    } else {
        return "O"
    }
}

shuffleArray = (arr) => {
    if (!arr) {
        console.log(`arr must not be undefined. arr was ${arr}`);
    }

    for(let i = 0; i < arr.length*2; i++) {
        const one = i%arr.length
        const two = Math.floor(Math.random()*(arr.length-1));
        let temp = arr[one];
        arr[one] = arr[two];
        arr[two] = temp;
    }
    return arr;
}

buildNameSocketMap = (players) => {
    let map = {}
    players.map((x) => {
        map[x.name] = x.socketID;
    })
    return map
}

buildNameIndexMap = (players) => {
    let map = {}
    players.map((x, index) => {
        map[x.name] = index;
    })
    return map
}

buildPlayers = (players) => {
    colors = ['#73C373', '#7AB8D3', '#DD6C75', '#8C6CE6', '#EA9158', '#CB8F8F', '#FFC303']
    shuffleArray(colors);

    players.forEach(x => {
        delete x.chosen;
        x.money = 2;
        x.influences = [];
        x.isDead = false;
        x.color = colors.pop();
        delete x.isReady;
    });
    console.log(players);
    return players;
}

exportPlayers = (players) => {
    players.forEach(x => {
        delete x.socketID;
    });
    return players;
}

module.exports = {
    buildPlayers: buildPlayers,
    exportPlayers: exportPlayers,
    shuffleArray: shuffleArray,
    buildNameSocketMap: buildNameSocketMap,
    buildNameIndexMap: buildNameIndexMap
}