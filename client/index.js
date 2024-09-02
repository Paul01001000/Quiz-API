(async () => {
    const $main = document.querySelector('.main');
    const $riddle = document.querySelector('p');
    const $input = document.querySelector('input');
    const $won = document.querySelector('.won');
    const $score = document.querySelector('button');

    // Start Game
    if (!sessionStorage.getItem('gameId')) {
        const response = await fetch('/start-game', {
            method: 'POST'
        });
        const { gameId } = await response.json();
        sessionStorage.setItem('gameId', gameId);
    }
    const gameId = sessionStorage.getItem('gameId');

    // Get highscore
    $score.addEventListener('click', async () => {
        const response = await fetch('/highscore');
        const { highscore } = await response.json();
        alert("Highscore: " + highscore);
    })

    // Get question
    const response = await fetch('/current-state/' + gameId);
    const { isWon, riddle } = await response.json();
    if (isWon) {
        $main.style.display = 'none';
        $won.style.display = 'block';
        return;
    }
    $riddle.innerText = riddle;

    // Send answer
    $input.addEventListener('change', async () => {
        const guess = $input.value;
        const response = await fetch('/make-guess/' + gameId, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ guess })
        });
        const wasCorrect = response.status === 200;
        if (wasCorrect) {
            $input.value = '';
            const response = await fetch('/current-state/' + gameId);
            const { isWon, riddle } = await response.json();
            if (isWon) {
                $main.style.display = 'none';
                $won.style.display = 'block';
                return;
            }
            $riddle.innerText = riddle;
        }
    });

    $input.focus();
})();