import {createChannel} from '../../whisper/whisper-channel/channel'


export function channelErrored(bool) {
    return {
        type: 'CHANNEL_ERROR',
        hasErrored: bool
    };
}
export function channelIsLoading(bool) {
    return {
        type: 'CHANNEL_LOADING',
        isLoading: bool
    };
}
export function channelCreated(channel) {
    return {
        type: 'CHANNEL_CREATED',
        channel
    };
}

export function keysCreated(keys) {
    return {
        type: 'KEYS_CREATED',
        keys
    };
}

export function channelCreating(registryAddress, identity, identity2, topic) {
    return (dispatch) => {
        dispatch(channelIsLoading(true));
        createChannel({registryAddress, identity, identity2, topic})
        .then(
            (channel) => {channelCreated(channel)
            return channel;
        })
        .then(
            (channel) => {
            channel.open()
            .then((keys) =>{ keysCreated(keys)
                return channel;
            })
            .then((channel) => channel.start())
            .catch((err) => {dispatch(channelErrored(true))
            throw Error("Error: starting channel.", err);
            })
        })
    };
}