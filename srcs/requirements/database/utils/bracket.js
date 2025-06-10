function getUpperPowOfTwo(number) {
	let pow = 0;
	while (Math.pow(2, pow) < number)
		pow++;
	return (Math.pow(2, pow));
}

function generateBracket(userIds) {
	if (userIds.length < 2) {
		throw new Error('At least two players are required.');
	}

	const matches = [];
	const rounds = [];

	const totalPlayers = userIds.length;

	// Round 0 : on crée autant de matchs que nécessaire pour placer 1 joueur par match
	const matchCount = Math.ceil(totalPlayers / 2);
	const round0 = [];

	// Étape 1 : on remplit les `user_id` d'abord (1 joueur par match)
	for (let i = 0; i < matchCount; i++) {
		round0.push({
			match_round: 0,
			match_index: i,
			user_id: userIds[i] || null,
			opponent_id: null,
		});
	}

	// Étape 2 : on remplit ensuite les `opponent_id`, dans l'ordre
	for (let i = matchCount; i < totalPlayers; i++) {
		const matchIndex = i - matchCount;
		round0[matchIndex].opponent_id = userIds[i];
	}

	rounds.push(round0);

	// Étape 3 : on génère les rounds suivants, en construisant l'arbre complet
	let previousRound = round0;
	let roundNumber = 1;

	while (previousRound.length > 1) {
		const nextMatchCount = Math.ceil(previousRound.length / 2);
		const nextRound = [];

		for (let i = 0; i < nextMatchCount; i++) {
			nextRound.push({
				match_round: roundNumber,
				match_index: i,
				user_id: null,
				opponent_id: null,
			});
		}

		rounds.push(nextRound);
		previousRound = nextRound;
		roundNumber++;
	}

	return rounds.flat();
}


export default generateBracket
