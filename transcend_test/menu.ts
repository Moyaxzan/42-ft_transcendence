// menu.ts

const layers = document.querySelectorAll('.menu-layer');

layers.forEach(layer => {
  layer.addEventListener('click', () => {
    console.log('Clicked:', (layer.querySelector('span') as HTMLElement).innerText);
  });
});
