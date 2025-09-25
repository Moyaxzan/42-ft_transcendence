
export async function sendMatchResult(
	userId: number,
	score: number,
	opponentScore: number,
	opponentId: number,
	tournamentId: number,
	matchRound: number,
	matchIndex: number
) {
	//1. get winner_id
	let winnerId = -1;
	let looserId = -1;
	if (score > opponentScore) {
		winnerId = userId;
		looserId = opponentId;
	} else {
		winnerId = opponentId;
		looserId = userId;
	}

	// 2. update winner stats
	try {
		console.log("✅ Updating winner stats...");
		const response = await fetch(`/api/users/wins/${winnerId}`, {
			method: "PATCH",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({}),
			// body: JSON.stringify({wins: 0, losses: 0}),
		});
		console.log(response);
		if (!response.ok) {
			const errorText = await response.text();
			console.error('Erreur MAJ gagnant :', errorText);
			return;
		}
		console.log("🏆 Winner updated:", await response.json());
	} catch (err) {
		console.error('Erreur réseau ou serveur MAJ gagnant:', err);
	}
		// const response = await fetch(`/api/users/history/${winnerId}`, {
		// 	method: 'POST',
		// 	headers: {
		// 		'Content-Type': 'application/json',
		// 	},
		// 	body: JSON.stringify({
		// 		isWinner: true
		// 		// id: winnerId,
		// 		// score: score,
		// 		// opponent_score: opponentScore
		// 	})
		// });
		// console.log(response);
		// if (!response.ok) {
		// 	const errorText = await response.text();
		// 	console.error('Erreur lors de l’envoi du score :', errorText);
		// 	return;
		// }
		// const result = await response.json();

	// 3. update looser stats
	try {
		console.log("✅ Updating loser stats...");
		const response = await fetch(`/api/users/losses/${looserId}`, {
			method: "PATCH",
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({})
			// body: JSON.stringify({ wins: 0, losses: 0 })
		});
		if (!response.ok) {
			const errorText = await response.text();
			console.error('Erreur MAJ perdant :', errorText);
			return;
		}
		console.log("💀 Loser updated:", await response.json());
	} catch (err) {
		console.error('Erreur réseau ou serveur MAJ perdant:', err);
	}
		// const result = await response.json();
		// console.log("Looser stats update in progress");
		// const response = await fetch(`/api/users/history/${looserId}`, {
		// 	method: 'POST',
		// 	headers: {
		// 		'Content-Type': 'application/json',
		// 	},
		// 	body: JSON.stringify({
		// 		isWinner: false
		// 	})
		// });
		// if (!response.ok) {
		// 	const errorText = await response.text();
		// 	console.error('Erreur lors de l’envoi du score :', errorText);
		// 	return;
		// }
		// const result = await response.json();

	//4. advance winner inside bracket
	await advanceWinner(tournamentId, matchRound, matchIndex, winnerId);
}

export async function advanceWinner(
	tournamentId: number,
	matchRound: number,
	matchIndex: number,
	winnerId: number
){
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
		if (!response.ok) {
			console.error('Erreur lors du passage au tour suivant :', await response.text());
			return;
		}

	} catch (err) {
		console.error('Erreur réseau ou serveur :', err);
	}
}
