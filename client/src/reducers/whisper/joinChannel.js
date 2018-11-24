
export function errorP2(state = false, action) {
    switch (action.type) {
        case 'JOIN_CHANNEL_ERROR':
            return action.hasErrored;

        default:
            return state;
    }
}

export function waitP2(state = false, action) {
    switch (action.type) {
        case 'JOIN_CHANNEL_WAITING':
            return action.isWaiting;

        default:
            return state;
    }
}

export function existsP2(state = false, action) {
    switch (action.type) {
        case 'JOIN_CHANNEL_SUCCESS':
            return action.joined;

        default:
            return state;
    }
}