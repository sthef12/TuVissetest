async function carregarCategorias() {
  try {
    const produtos = await fetch("../banco/produtos.json");
    const produtosJson = await produtos.json();

    const categorias = {};

    produtosJson.forEach(produto => {
      if (!categorias[produto.categoria]) {
        categorias[produto.categoria] = new Set();
      }
      categorias[produto.categoria].add(produto.subcategoria);
    });

    const corpoCategorias = document.getElementById("corpo_categorias");
    corpoCategorias.innerHTML = ""; // Limpa o conteúdo existente

    const menuL = document.createElement("div");
    menuL.className = "menuL";
    menuL.innerHTML = "<h1>Categorias</h1>";

    Object.keys(categorias).forEach(categoria => {
      const details = document.createElement("details");
      details.className = "links-categoria";
      details.innerHTML = `<summary>${categoria}</summary>`;

      categorias[categoria].forEach(subcategoria => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="#" class="sub_itens">${subcategoria}</a>`;
        details.appendChild(li);
      });

      menuL.appendChild(details);
    });

    corpoCategorias.appendChild(menuL);
  } catch (error) {
    console.error(error);
  }
}

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
              <div class="nome_preco_produto">
                <h1>${produto.nome}</h1>
                <h2>R$ ${produto.preco.toFixed(2)}</h2>
              </div>
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

window.onload = () => {
  carregarProdutos();
  carregarCategorias();
};
