var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function renderHome() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = document.getElementById('app');
        if (!app)
            return;
        const navbar = document.getElementById("navbar");
        const footer = document.getElementById("footer");
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
            navbar.classList.add("transition", "duration-[300ms]", "delay-[50ms]", "ease-out", "scale-140");
        });
        navbar.addEventListener("mouseleave", () => {
            navbar.classList.remove("scale-140");
        });
        footer.addEventListener("mouseenter", () => {
            footer.classList.add("transition", "duration-[300ms]", "delay-[50ms]", "ease-out", "scale-110");
        });
        footer.addEventListener("mouseleave", () => {
            footer.classList.remove("scale-110");
        });
        const res = yield fetch('/dist/html/home.html');
        console.log("rendering home.html");
        const html = yield res.text();
        app.innerHTML = html;
    });
}
