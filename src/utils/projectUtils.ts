export function getRandomArbitrary(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export function randomStr(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

export function getRandom(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

// @ts-ignore
export function filterObject(obj) {
    const ret = {};
    Object.keys(obj)
        // @ts-ignore
        .filter((key) => obj[key] !== undefined)
        // @ts-ignore
        .forEach((key) => ret[key] = obj[key]);
    return ret;
}