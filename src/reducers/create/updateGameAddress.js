export function updateGameAddress(state = '', action) {
    switch (action.type) {
        case 'UPDATE_GAME_ADDRESS':
            return action.gameAddress;

        default:
            return state;
    }
}