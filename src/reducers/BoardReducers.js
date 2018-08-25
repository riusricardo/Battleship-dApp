
export function squaresHasErrored(state = false, action) {
    switch (action.type) {
        case 'SQUARES_HAS_ERRORED':
            return action.hasErrored;

        default:
            return state;
    }
}

export function squaresIsLoading(state = false, action) {
    switch (action.type) {
        case 'SQUARES_IS_LOADING':
            return action.isLoading;

        default:
            return state;
    }
}

export function squares(state = [], action) {
    switch (action.type) {
        case 'SQUARES_FETCH_DATA_SUCCESS':
            return action.squares;

        default:
            return state;
    }
}