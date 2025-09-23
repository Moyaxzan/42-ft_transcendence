export function updateBackground() {
  const video = document.getElementById("bg-video");
  if (!video) return;

  // Supprime tout listener résiduel pour éviter que la vidéo disparaisse
  video.ontransitionend = null;

  if (window.location.pathname === "/pong") {
    // Flou + fade
    video.style.display = "block";  // visible pendant la transition
    video.classList.remove("blur-none", "opacity-100");
    video.classList.add("blur-xl", "opacity-0");

    // À la fin de la transition, on cache
    video.ontransitionend = () => {
      video.style.display = "none";
    };
  } else {
    video.style.display = "block";

    // Départ : opacité 0 + blur fort
    video.classList.add("blur-xl", "opacity-0");
    video.classList.remove("blur-none", "opacity-100");

    void video.offsetHeight;

    // Transition vers normal
    video.classList.remove("blur-xl", "opacity-0");
    video.classList.add("blur-none", "opacity-100");
    }
}


export function setVideoFinalState({
  width,
  height,
  bottom,
  left,
  objectFit,
  opacity
}: {
  width?: string;
  height?: string;
  bottom?: string;
  left?: string;
  objectFit?: string;
  opacity?: string;
}) {
  const video = document.getElementById('bg-video') as HTMLVideoElement | null;
  if (!video) return;
  if (width) video.style.width = width;
  if (height) video.style.height = height;
  if (bottom) video.style.bottom = bottom;
  if (left) video.style.left = left;
  if (objectFit) video.style.objectFit = objectFit;
  if (opacity) video.style.opacity = opacity;
}

window.addEventListener("DOMContentLoaded", updateBackground);
window.addEventListener("popstate", updateBackground);
window.addEventListener("routeChanged", updateBackground);
