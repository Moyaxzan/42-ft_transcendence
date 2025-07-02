
export async function sendMatchResult(
	userId: number,
	score: number,
	opponentScore: number,
	opponentId: number,
	tournamentId: number,
	matchRound: number,
	matchIndex: number
) {
	// 1. store result inside user stats
	// try {
	// 	const response = await fetch(`/api/users/history/${userId}`, {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 		},
	// 		body: JSON.stringify({
	// 			score,
	// 			opponent_score: opponentScore,
	// 			opponent_id: opponentId
	// 		})
	// 	});
	// 	if (!response.ok) {
	// 		const errorText = await response.text();
	// 		console.error('Erreur lors de l’envoi du score :', errorText);
	// 		return;
	// 	}
	// 	const result = await response.json();
	// 	console.log('Score enregistré avec succès :', result);
	// } catch (err) {
	// 	console.error('Erreur réseau ou serveur :', err);
	// }

	//2. get winner_id
	let winnerId = -1;
	if (score > opponentScore) {
		winnerId = userId;
	} else {
		winnerId = opponentId;
	}

	//3. advance winner inside bracket
	try {
		const response = await fetch(`/api/play/resolve`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				tournament_id: tournamentId,
				match_round: matchRound,
				match_index: matchIndex,
				winner_id: winnerId
			})
		});
	} catch (err) {
		console.error('Erreur réseau ou serveur :', err);
	}
}
