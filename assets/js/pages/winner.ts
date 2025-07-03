export function showWinnerModal(winnerName: string) {
  const modal = document.getElementById('winner-modal')!;
  const nameElem = document.getElementById('winnerName')!;
  nameElem.textContent = `${winnerName}`;
  modal.classList.remove('hidden');
}

export function hideWinnerModal() {
  const modal = document.getElementById('winner-modal')!;
  modal.classList.add('hidden');
}
