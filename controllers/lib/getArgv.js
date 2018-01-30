function getArg(...names) {
    let result = null;
    process.argv.forEach((val, i, arr) => {
        if(names.findIndex((n) => n == val) >= 0)
            result = arr[i + 1];
    });
    return result;
}

module.exports = getArg;
