// Ideally, rows should return with properties: 
// ign, k, d, (win/loss/draw, can be an int value ig, carry?, elo)

module.exports = async(client, data) => {	
	let rows = data.split('\n');
	// Remove map name.
	rows.shift();

	// Split the arrays in half by finding the index of the second team name.
	let halfwayRow = rows.find((r) => rows.indexOf(r) !== 0 && !r.includes("-"));
	let halfwayPos = rows.indexOf(halfwayRow);

	// Determine the rounds won, so can calc the winner later.
	let team1 = rows.slice(0, halfwayPos);
	let team2 = rows.slice(halfwayPos, rows.length);
	let t1rounds = +(team1[0].split(" ")[1]);
	let t2rounds = +(team2[0].split(" ")[1]);

	let t1players = [];
	let t2players = [];

	// Round difference used in elo formula, as is win/loss.
	let t1Won = t1rounds > t2rounds;
	let t2Won = t2rounds > t1rounds;
	let tie = t1rounds == t2rounds;
	let roundDifference = t1Won ? t1rounds - t2rounds : t2rounds - t1rounds;
	let totalRounds = t1rounds + t2rounds;

	await team1.forEach((row) => {
		// Ignore team names:
		if (!row.includes('-')) return;

		let name = row.split(' ')[0];
		let k = +(row.split(' ')[1].split('-')[0]);
		let d = +(row.split(' ')[1].split('-')[1]);
		
		// Probably a faster way to do this but: , storing as int value for ease of use when updating db.
		let won = t1Won ? 1 : 0
		let lost = t2Won ? 1 : 0;
		let tied = tie ? 1 : 0;
		let difference = won ? roundDifference : 0;

		let playerElo = client.playerElos.get(name);
		let elo = playerElo ? playerElo.mscl : 0;
		if (!elo && elo !== 0) elo = 0;

		let p = {
			ign: name,
			kills: k,
			deaths: d,
			win: won,
			loss: lost,
			tie: tied,
			roundDifference: difference,
			elo: elo,
			calculatedElo: 0,
			rounds: totalRounds,
			carry: 0
		}

		t1players.push(p);
	});

	await team2.forEach((row) => {
		// Ignore team names:
		if (!row.includes('-')) return;

		let name = row.split(' ')[0];
		let k = +(row.split(' ')[1].split('-')[0]);
		let d = +(row.split(' ')[1].split('-')[1]);
		
		// Probably a faster way to do this but: , storing as int value for ease of use when updating db.
		let won = t2Won ? 1 : 0
		let lost = t1Won ? 1 : 0;
		let tied = tie ? 1 : 0;
		let difference = won ? roundDifference : 0;

		let playerElo = client.playerElos.get(name);
		let elo = playerElo ? playerElo.mscl : 0;
		if (!elo && elo !== 0) elo = 0;

		let p = {
			ign: name,
			kills: k,
			deaths: d,
			win: won,
			loss: lost,
			tie: tied,
			roundDifference: difference,
			elo: elo,
			calculatedElo: 0,
			rounds: totalRounds,
			carry: 0
		}

		t2players.push(p);
	});

	t1players.forEach((p) => calculateElo(p, t1players, t2players));
	t2players.forEach((p) => calculateElo(p, t2players, t1players));

	let allPlayers = t1players.concat(t2players);
	return allPlayers;
}

const calculateElo = (p, team, enemy) => {
	/* 
		(20 * roundDifferenceFactor * playerNumber * result * (1 + result * eloDifferenceFactor) * (1 + result * performanceFactor) + carryBonus + expectations)

		Expectations is difficult to do. For now, I'm just going to leave it out because it's
		rarely actually applicable. I'm going to comment each value with more explanation.
	*/


	// This one is pretty simple, depending on how many rounds the team won by they are given a multiplier.
	let roundDifferenceFactor;
	let roundDifference = p.roundDifference;

	if (roundDifference >= 6) roundDifferenceFactor = 1.2;
	else if (roundDifference < 6 && roundDifference > 3) roundDifferenceFactor = 1.05;
	else roundDifferenceFactor = 1;
	
	// Halve the elo if there's less than 5 players:
	let playerNumber = 1;
	let playerCount = team.length;
	if (playerCount < 5) playerNumber = 0.5;

	// Result: 1 if win, 0.5 if tie, -1 if loss.
	let result;
	if (p.win == 1) result = 1;
	if (p.tie == 1) result = 0.5;
	if (p.loss == 1) result = -1;
	
	/* 
		Elo difference factor:  
		'take the (absolute value of the average of the other teams elo minus the absolute value of the 
		average of your teams elo) / (4 * the average elo of all players);'
								
		This one factor means we have to store all players elo in cache, which upsets me but w/e. It's important.
		If we use keyv to make a simple map of (name --> ign) then this will be so much easier!
	*/							   

	let t1TotalElo = 0;
	team.forEach((player) => t1TotalElo += player.elo);
	let t1AvgElo = t1TotalElo / team.length;
	
	let t2TotalElo = 0;
	enemy.forEach((player) => t2TotalElo += player.elo);
	let t2AvgElo = t2TotalElo / enemy.length;

	let totalElo = t1TotalElo + t2TotalElo;
	let totalAvgElo = totalElo / (team.length + enemy.length);

	let eloDifferenceFactor = ((Math.abs(t2AvgElo) - Math.abs(t1AvgElo)) / (4 * totalAvgElo));
	
	// Performance Factor: '(take the players kills per round minus his teams average kills per round) / 3;'
	let indKillsPerRound = p.kills / p.rounds;
	
	let teamTotalKPR = 0;
	let teamTotalKills = 0;
	team.forEach((player) => {
		let kpr = player.kills / player.rounds;
		teamTotalKPR += kpr;
		teamTotalKills += player.kills;
	});

	let teamAvgKillsPerRound = teamTotalKPR / team.length;
	let performanceFactor = (indKillsPerRound - teamAvgKillsPerRound) / 3;

	// Carry Bonus: If your total kills > 1.5 * (team average kills), = 5;
	let carryBonus = 0;

	if (p.kills > (1.5 * (teamTotalKills / team.length))) carryBonus = 5;
	if (carryBonus == 5) p.carry = 1;
	
	// Finally, calculate and edit players elo:
	let elo = (20 * roundDifferenceFactor * playerNumber * result * (1 + result * eloDifferenceFactor) * (1 + result * performanceFactor) + carryBonus);
	return p.calculatedElo = elo;
}