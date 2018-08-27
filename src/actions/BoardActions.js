

export function squaresHasErrored(bool) {
    return {
        type: 'SQUARES_HAS_ERRORED',
        hasErrored: bool
    };
}
export function squaresIsLoading(bool) {
    return {
        type: 'SQUARES_IS_LOADING',
        isLoading: bool
    };
}
export function squaresFetchDataSuccess(squares,player) {
    switch (player) {
        case 1:
            return {
                type: 'SQUARES1_FETCH_DATA_SUCCESS',
                squares
            };

        case 2:
            return {
                type: 'SQUARES2_FETCH_DATA_SUCCESS',
                squares
            };

        default:
            return squares;
    }

}

var board = []; //hit: 3 miss:2 ship:1
board[1] = 
[0,0,0,3,0,0,0,0,0,0
,1,0,0,0,0,0,0,0,0,0
,3,0,2,2,0,0,0,1,0,0
,1,0,0,3,0,0,0,0,0,0
,0,0,0,0,0,2,0,1,0,0
,3,0,0,0,0,0,0,0,0,0
,0,0,0,0,0,0,2,0,0,2
,1,0,0,3,0,0,0,0,0,0
,0,0,0,3,0,0,0,0,0,0
,1,0,0,3,0,0,0,0,0,0];
board[2] = 
[0,0,0,0,0,0,0,0,0,0
,0,0,0,0,0,0,0,0,0,0
,0,0,0,0,0,0,0,0,0,0
,0,0,0,0,0,0,0,0,0,0
,0,0,0,0,0,0,0,0,0,0
,0,0,0,0,0,0,0,0,0,0
,0,0,0,0,0,0,0,0,0,0
,0,0,0,0,0,0,0,0,0,0
,0,0,0,0,0,0,0,0,0,0
,0,0,0,0,0,0,0,0,0,0];

export function squaresFetchData(player) { 
    return (dispatch) => {dispatch(squaresFetchDataSuccess(board[player],player))};
}

/*
export function squaresFetchData(url) {
    return (dispatch) => {
        dispatch(squaresIsLoading(true));
        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                dispatch(squaresIsLoading(false));
                return response;
            })
            .then((response) => response.json())
            .then((items) => dispatch(squaresFetchDataSuccess(items)))
            .catch(() => dispatch(squaresHasErrored(true)));
    };
}
*/