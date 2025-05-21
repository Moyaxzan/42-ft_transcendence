export async function renderHome() {
	const app = document.getElementById('app');
	if (!app)
		return;

	const navbar = document.getElementById("navbar") as HTMLDivElement;
	const footer = document.getElementById("footer") as HTMLDivElement;
	if (!navbar || !footer) {
		return;
	}
	navbar.className =
	  "transform skew-y-[-10deg] origin-top-left flex justify-between items-center h-[40vh] bg-[#218dbe] text-[#218dbe]";
	navbar.style.transform = 'skewY(-10deg)';
	navbar.style.transformOrigin = 'top left';
	footer.className =
	  "transform skew-y-[-10deg] origin-bottom-right h-[40vh] bg-[#002F3B] text-white text-center p-4";
	footer.style.transform = 'skewY(-10deg)';
	footer.style.transformOrigin = 'bottom right';

	navbar.addEventListener("mouseenter", () => {
	  navbar.classList.add(
		"transition",
		"duration-[300ms]",
		"delay-[50ms]",
		"ease-out",
		"scale-140"
	  );
	});
	navbar.addEventListener("mouseleave", () => {
	  navbar.classList.remove("scale-140");
	});

	footer.addEventListener("mouseenter", () => {
	  footer.classList.add(
		"transition",
		"duration-[300ms]",
		"delay-[50ms]",
		"ease-out",
		"scale-110"
	  );
	});
	footer.addEventListener("mouseleave", () => {
	  footer.classList.remove("scale-110");
	});


	const res = await fetch('/dist/html/home.html');
	console.log("rendering home.html");
	const html = await res.text();

	app.innerHTML = html;
	
}
