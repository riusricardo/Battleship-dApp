

export function gameContract(state = {}, action) {
    switch (action.type) {
        case 'ADD_GAME_CONTRACT':
            return action.gameContract;

        default:
            return state;
    }
}