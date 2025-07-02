export function showWinnerModal(winnerName: string) {
  const modal = document.getElementById('winnerModal')!;
  const nameElem = document.getElementById('winnerName')!;
  nameElem.textContent = `${winnerName}`;
  modal.classList.remove('hidden');
}

export function hideWinnerModal() {
  const modal = document.getElementById('winnerModal')!;
  modal.classList.add('hidden');
}
