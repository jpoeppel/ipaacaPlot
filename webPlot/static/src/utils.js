export function updateState(state, keys, value) {
    var newState;
    if (Object.prototype.toString.call(state) == '[object Array]') {
        newState = [...state];
    } else if (Object.prototype.toString.call(state) == '[object Object]') {
        newState = {...state};
    }

    let key = keys[0];
    let remainingKeys = keys.slice(1);
    if (key !== undefined) {
        newState[key] = updateState(newState[key], remainingKeys, value)
        return newState;
    } else {
        return value;
    }

}