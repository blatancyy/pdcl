module.exports = (time) => {
    return new Promise((res) => {
        setTimeout(res, time);
    });
}

