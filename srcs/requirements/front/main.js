document.addEventListener('DOMContentLoaded', () => {
	const startBtn = document.getElementById('userLoad');
	if (!startBtn)
		return ;
	// Btn: interactive glow
	startBtn.addEventListener('mousemove', (e) => {
		const rect = startBtn.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		startBtn.style.setProperty('--x', `${x}px`);
		startBtn.style.setProperty('--y', `${y}px`);
	});
});
