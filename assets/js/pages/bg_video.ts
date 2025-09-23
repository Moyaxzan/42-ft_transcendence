export function updateBackground() {
  const video = document.getElementById("bg-video");
  if (!video) return;
  video.ontransitionend = null;

  if (window.location.pathname === "/pong") {
    video.style.display = "block";  // visible pendant la transition
    video.classList.remove("blur-none", "opacity-100");
    video.classList.add("blur-xl", "opacity-0");

    video.ontransitionend = () => {
      video.style.display = "none";
    };
  } else {
    video.style.display = "block";

    video.classList.add("blur-xl", "opacity-0");
    video.classList.remove("blur-none", "opacity-100");

    void video.offsetHeight;

    video.classList.remove("blur-xl", "opacity-0");
    video.classList.add("blur-none", "opacity-100");
    }
}

window.addEventListener("DOMContentLoaded", updateBackground);
window.addEventListener("popstate", updateBackground);
window.addEventListener("routeChanged", updateBackground);


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


