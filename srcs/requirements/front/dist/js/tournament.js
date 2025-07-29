export async function sendMatchResult(userId, score, opponentScore, opponentId, tournamentId, matchRound, matchIndex) {
    //1. get winner_id
    let winnerId = -1;
    let looserId = -1;
    if (score > opponentScore) {
        winnerId = userId;
        looserId = opponentId;
    }
    else {
        winnerId = opponentId;
        looserId = userId;
    }
    // 2. update winner stats
    try {
        const response = await fetch(`/api/users/history/${winnerId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                isWinner: true
            })
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erreur lors de l’envoi du score :', errorText);
            return;
        }
        const result = await response.json();
    }
    catch (err) {
        console.error('Erreur réseau ou serveur :', err);
    }
    // 3. update looser stats
    try {
        const response = await fetch(`/api/users/history/${looserId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                isWinner: false
            })
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erreur lors de l’envoi du score :', errorText);
            return;
        }
        const result = await response.json();
    }
    catch (err) {
        console.error('Erreur réseau ou serveur :', err);
    }
    //4. advance winner inside bracket
    await advanceWinner(tournamentId, matchRound, matchIndex, winnerId);
}
export async function advanceWinner(tournamentId, matchRound, matchIndex, winnerId) {
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
    }
    catch (err) {
        console.error('Erreur réseau ou serveur :', err);
    }
}
