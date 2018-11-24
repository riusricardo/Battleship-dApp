
export function joinChannelErrored(bool) {
    return {
        type: 'JOIN_CHANNEL_ERROR',
        hasErrored: bool
    };
}
export function joinChannelIsWaiting(bool) {
    return {
        type: 'JOIN_CHANNEL_WAITING',
        isWaiting: bool
    };
}
export function joinChannelSucceded(bool) {
    return {
        type: 'JOIN_CHANNEL_SUCCESS',
        joined: bool
    };
}