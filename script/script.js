async function carregarProdutos() {
  try {
    const produtos = await fetch("../banco/produtos.json");
    const produtosJson = await produtos.json();

    if (produtosJson.length > 0) {
      const catalogo = document.getElementById("catalogo");
      catalogo.innerHTML = "";

      // Embaralha os produtos
      const produtosEmbaralhados = produtosJson.sort(() => Math.random() - 0.5);

      for (const produto of produtosEmbaralhados) {
        catalogo.innerHTML += `
          <a href="telaProduto.html?id=${produto.id}">
            <div class="produtos">
              <img src="${produto.imagem}" alt="${produto.nome}" />
              <h1>${produto.nome}</h1>
              <h2>R$ ${produto.preco.toFixed(2)}</h2>
              <button>Comprar</button>
            </div>
          </a>`;
      }
    }
  } catch (error) {
    console.error(error);
  }
}

const menuLateral = document.getElementById("corpo_categorias");

function openMenu() {
  console.log(menuLateral.style.display);
  if (
    menuLateral.style.display === "" ||
    menuLateral.style.display === "none"
  ) {
    menuLateral.style.display = "block";
  } else if (menuLateral.style.display === "block") {
    menuLateral.style.display = "none";
  }
}

window.onload = carregarProdutos;
