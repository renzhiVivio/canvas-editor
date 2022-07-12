function deepOmit(sourceObj, fields) {

    if (sourceObj == null) {
        return sourceObj;
    }

    if (Array.isArray(sourceObj)) {
        return sourceObj.map((s) => {
            return deepOmit(s, fields);
        });
    }

    if (typeof sourceObj === 'object') {
        let result = {};
        for (const key in sourceObj) {
            if (fields.indexOf(key) >= 0) continue;
            result[key] = deepOmit(sourceObj[key], fields);
        }

        return result;
    }

    if (typeof sourceObj === 'function') {
        return sourceObj.bind({});
    }

    if (typeof sourceObj === 'string') {
        return sourceObj.slice();
    }

    return sourceObj;
}


export default deepOmit;