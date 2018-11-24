
export function updatePlayer1(state = '', action) {
    switch (action.type) {
        case 'UPDATE_PLAYER_1':
            return action.player1;

        default:
            return state;
    }
}

export function updatePlayer2(state = '', action) {
    switch (action.type) {
        case 'UPDATE_PLAYER_2':
            return action.player2;

        default:
            return state;
    }
}
