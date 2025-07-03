export function showWinnerModal(winnerName) {
    const modal = document.getElementById('winner-modal');
    const nameElem = document.getElementById('winnerName');
    nameElem.textContent = `${winnerName}`;
    modal.classList.remove('hidden');
}
export function hideWinnerModal() {
    const modal = document.getElementById('winner-modal');
    modal.classList.add('hidden');
}
export function showHelpModal() {
    const modal = document.getElementById('help-modal');
    modal.classList.remove('hidden');
}
export function hideHelpModal() {
    const modal = document.getElementById('help-modal');
    modal.classList.add('hidden');
}
