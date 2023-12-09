randomPlayer = (players) => {
    if (!players) {
        console.log(`players must not be undefined. players was ${players}`);
    }
    players = shuffleArray(players)
    return shuffleArray(players)[0];
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

buildPlayersSymbols = (players) => {
    let symbols = ["X", "O"];
    shuffleArray(symbols);
    return players.map((x, index) => {
        return {
            name: x.player,
            symbol: symbols[index]
        }
    });
}

module.exports = {
    randomPlayer,
    buildPlayersSymbols
}