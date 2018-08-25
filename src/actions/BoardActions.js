

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
export function squaresFetchDataSuccess(squares) {
    return {
        type: 'SQUARES_FETCH_DATA_SUCCESS',
        squares
    };
}

var board = [];
board["1"] = 
[0,0,0,-1,0,0,0,0,0,0
,1,0,0,0,0,0,0,0,0,0
,-1,0,-2,-2,0,0,0,1,0,0
,1,0,0,-1,0,0,0,0,0,0
,0,0,0,0,0,-2,0,1,0,0
,-1,0,0,0,0,0,0,0,0,0
,0,0,0,0,0,0,-2,0,0,-2
,1,0,0,-1,0,0,0,0,0,0
,0,0,0,-1,0,0,0,0,0,0
,1,0,0,-1,0,0,0,0,0,0];
board["2"] = 
[1,0,0,0,0,0,0,0,0,0
,1,0,0,0,0,0,0,0,0,0
,1,0,0,0,0,0,0,0,0,0
,1,0,0,0,0,0,0,0,0,0
,1,0,0,0,0,0,0,0,0,0
,1,0,0,0,0,0,0,0,0,0
,1,0,0,0,0,0,0,0,0,0
,1,0,0,0,0,0,0,0,0,0
,1,0,0,0,0,0,0,0,0,0
,1,0,0,0,0,0,0,0,0,0];

export function squaresFetchData(player) { 
    return (dispatch) => {dispatch(squaresFetchDataSuccess(board[player]))};
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