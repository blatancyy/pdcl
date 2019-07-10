module.exports = async (totalXP) => {
	let level = 0;
	let levelXP = totalXP
	let totalToNext = 5 * Math.pow(level, 2) + 50 * level + 100;
	let prevTotalToNext = 0;

	while (totalXP >= totalToNext) {
		level++;
		prevTotalToNext = totalToNext;
		levelXP = totalXP - totalToNext;
		totalToNext += 5 * Math.pow(level, 2) + 50 * level + 100;
	}

	return {
		totalXP,
		levelXP,
		level,
		prevTotalToNext,
		totalToNext
	};
}