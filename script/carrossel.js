document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll(".carrossel img");
  const indicators = document.querySelectorAll(".indicador span");
  let currentIndex = 0;

  const showImage = (index) => {
    images.forEach((img, i) => {
      img.style.display = i === index ? "block" : "none";
    });
    updateIndicators(index);
  };

  const updateIndicators = (index) => {
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle("active", i === index);
    });
  };

  const nextImage = () => {
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
  };

  document.getElementById("arrow-right").addEventListener("click", nextImage);

  document.getElementById("arrow-left").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(currentIndex);
  });

  // Inicializa o carrossel mostrando a primeira imagem
  showImage(currentIndex);

  // Adiciona um temporizador para mudar o slide a cada 1 minuto (60000 ms)
  setInterval(nextImage, 30000);
});


function updateCarouselImage() {
  const carouselImage = document.querySelector('.img-1');
  const carouselImage2 = document.querySelector('.img-2');
  const carouselImage3 = document.querySelector('.img-3');
  if (window.innerWidth < 768) { // Define um limite de largura, por exemplo, 768px
      carouselImage.src = './img/pequena1.png'; // Caminho da imagem menor
      carouselImage2.src = './img/pequena2.png'; // Caminho da imagem menor
      carouselImage3.src = './img/pequena3.png'; // Caminho da imagem menor
  } else {
      carouselImage.src = './img/banner/1.png'; // Caminho da imagem maior
      carouselImage2.src = './img/banner/2.png'; // Caminho da imagem maior
      carouselImage3.src = './img/banner/3.png'; // Caminho da imagem maior
  }
}

// Chama a função quando a página carrega e quando a janela é redimensionada
window.addEventListener('load', updateCarouselImage);
window.addEventListener('resize', updateCarouselImage);
