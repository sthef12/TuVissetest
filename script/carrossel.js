document.addEventListener('DOMContentLoaded', () => {
  const images = document.querySelectorAll('.carrossel img');
  const indicators = document.querySelectorAll('.indicator span');
  let currentIndex = 0;

  const showImage = (index) => {
    images.forEach((img, i) => {
      img.style.display = i === index ? 'block' : 'none';
    });
    updateIndicators(index);
  };

  const updateIndicators = (index) => {
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === index);
    });
  };

  const nextImage = () => {
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
  };

  document.getElementById('arrow-right').addEventListener('click', nextImage);

  document.getElementById('arrow-left').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(currentIndex);
  });

  // Inicializa o carrossel mostrando a primeira imagem
  showImage(currentIndex);

  // Adiciona um temporizador para mudar o slide a cada 1 minuto (60000 ms)
  setInterval(nextImage, 30000);
});