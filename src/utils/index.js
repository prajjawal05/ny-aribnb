export const removeKeyFromObject = (thisIsObject, remove) =>
    Object.keys(thisIsObject).filter(key => key !== remove).reduce((obj, key) => {
        obj[key] = thisIsObject[key];
        return obj;
    }, {});