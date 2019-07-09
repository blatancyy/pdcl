module.exports = (str) => {
    if(typeof str === "number") {
        if(str === 0) return "Permanent";
    
        const seconds = ~~(str / 1000);
        const minutes = ~~(str / (1000 * 60));
        const hours = ~~(str / (1000 * 60 * 60));
        const days = ~~(str / (1000 * 60 * 60 * 24));
    
        if (seconds < 60) return seconds + ` Second${seconds === 1 ? "" : "s"}`;
        if (minutes < 60) return minutes + ` Minute${minutes === 1 ? "" : "s"}`;
        if (hours < 24) return hours + ` Hour${hours === 1 ? "" : "s"}`;
        return days + ` Day${days === 1 ? "" : "s"}`;
    }

    if(str === "0") return 0;

    const periods = [
        ["s", "sec", "second", "seconds"],
        ["m", "min", "minute", "minutes"],
        ["h", "hr", "hour", "hours"],
        ["d", "day", "days"]
    ];

    periods[0].multiplier = 1000;
    periods[1].multiplier = 1000 * 60;
    periods[2].multiplier = 1000 * 60 * 60;
    periods[3].multiplier = 1000 * 60 * 60 * 24;

    let numberString = "";
    for(const char of str) {
        if(isNaN(parseInt(char))) break;
        numberString += char;
    }

    let number = parseInt(numberString);
    const unit = str.slice(numberString.length);
    for (const period of periods) {
        if(!period.includes(unit)) continue;
        number *= period.multiplier;
    }

    if (isNaN(number)) return 0;
    return number;
}