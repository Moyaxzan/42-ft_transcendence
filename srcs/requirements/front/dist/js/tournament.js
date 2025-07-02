"use strict";
// interface Match {
// 	id?: number;
// 	tournament_id: number;
// 	match_round: number;
// 	match_index: number;
// 	user_id: number | null;
// 	opponent_id: number | null;
// 	winner_id: number | null;
// 	score_user: number;
// 	score_opponent: number;
// }
//
// interface Player {
// 	id: number;
// 	name: string;
// 	is_guest: boolean;
// }
//
// interface Tournament {
// 	id: number;
// 	user_id: number;
// 	match_id: number | null;
// 	created_at?: string;
// }
//
// interface TournamentData {
// 	tournament: Tournament;
// 	matches: Match[];
// 	players: Player[];
// }
//
// export class TournamentManager {
// 	private tournamentId: number;
// 	private tournamentData: TournamentData | null = null;
// 	private currentMatch: Match | null = null;
//
// 	constructor(tournamentId: number) {
// 		this.tournamentId = tournamentId;
// 	}
//
// 	// Load tournament data from backend
// 	async loadTournament(): Promise<TournamentData> {
// 		try {
// 			const response = await fetch(`/api/tournaments/${this.tournamentId}`);
// 			
// 			if (!response.ok) {
// 				throw new Error(`Failed to load tournament: ${response.statusText}`);
// 			}
//
// 			this.tournamentData = await response.json();
// 			return this.tournamentData!;
// 		} catch (error) {
// 			console.error('Error loading tournament:', error);
// 			throw error;
// 		}
// 	}
//
// 	// Get current match to play
// 	getCurrentMatch(): Match | null {
// 		if (!this.tournamentData) return null;
//
// 		// Find the first match that hasn't been played yet (no winner)
// 		const unplayedMatch = this.tournamentData.matches.find(match => 
// 			match.winner_id === null && 
// 			match.user_id !== null && 
// 			match.opponent_id !== null
// 		);
//
// 		this.currentMatch = unplayedMatch || null;
// 		return this.currentMatch;
// 	}
//
// 	// Get matches for a specific round
// 	getMatchesForRound(round: number): Match[] {
// 		if (!this.tournamentData) return [];
// 		
// 		return this.tournamentData.matches.filter(match => match.match_round === round);
// 	}
//
// 	// Get all completed matches
// 	getCompletedMatches(): Match[] {
// 		if (!this.tournamentData) return [];
// 		
// 		return this.tournamentData.matches.filter(match => match.winner_id !== null);
// 	}
//
// 	// Get player by ID
// 	getPlayerById(playerId: number): Player | null {
// 		if (!this.tournamentData) return null;
// 		
// 		return this.tournamentData.players.find(player => player.id === playerId) || null;
// 	}
//
// 	// Submit match result
// 	async submitMatchResult(matchRound: number, matchIndex: number, winnerId: number, scoreUser: number, scoreOpponent: number): Promise<boolean> {
// 		try {
// 			const response = await fetch(`/api/matches/${this.tournamentId}/${matchRound}/${matchIndex}`, {
// 				method: 'PATCH',
// 				headers: {
// 					'Content-Type': 'application/json',
// 				},
// 				body: JSON.stringify({
// 					winnerId,
// 					scoreUser,
// 					scoreOpponent
// 				})
// 			});
//
// 			if (!response.ok) {
// 				throw new Error(`Failed to submit match result: ${response.statusText}`);
// 			}
//
// 			// Reload tournament data to get updated matches
// 			await this.loadTournament();
// 			return true;
// 		} catch (error) {
// 			console.error('Error submitting match result:', error);
// 			throw error;
// 		}
// 	}
//
// 	// Check if tournament is complete
// 	isTournamentComplete(): boolean {
// 		if (!this.tournamentData) return false;
//
// 		// Tournament is complete when the final match (highest round) has a winner
// 		const finalRound = Math.max(...this.tournamentData.matches.map(m => m.match_round));
// 		const finalMatch = this.tournamentData.matches.find(m => 
// 			m.match_round === finalRound && m.match_index === 0
// 		);
//
// 		return finalMatch ? finalMatch.winner_id !== null : false;
// 	}
//
// 	// Get tournament winner
// 	getTournamentWinner(): Player | null {
// 		if (!this.isTournamentComplete()) return null;
//
// 		const finalRound = Math.max(...this.tournamentData!.matches.map(m => m.match_round));
// 		const finalMatch = this.tournamentData!.matches.find(m => 
// 			m.match_round === finalRound && m.match_index === 0
// 		);
//
// 		if (finalMatch && finalMatch.winner_id) {
// 			return this.getPlayerById(finalMatch.winner_id);
// 		}
//
// 		return null;
// 	}
//
// 	getNextMatch(): Match | null {
// 		if (!this.tournamentData) return null;
//
// 		const current = this.getCurrentMatch();
// 		if (!current) return null;
//
// 		const currentIndex = this.tournamentData.matches.findIndex(
// 			m => m.match_round === current.match_round && m.match_index === current.match_index
// 		);
//
// 		for (let i = currentIndex + 1; i < this.tournamentData.matches.length; i++) {
// 			const match = this.tournamentData.matches[i];
// 			if (match.winner_id === null && match.user_id !== null && match.opponent_id !== null)
// 				return match;
// 		}
//
// 		return null;
// 	}
// }
