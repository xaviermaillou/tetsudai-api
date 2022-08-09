module.exports = {
    sortByObjectKey: (array, object) => {
        return array?.sort((a, b) => (
            Object.keys(object).find(key => object[key] === a.level) - Object.keys(object).find(key => object[key] === b.level)
        ));
    },
    cutStringToArray: (string) => {
        return string.toLowerCase().split(', ');
    },
}