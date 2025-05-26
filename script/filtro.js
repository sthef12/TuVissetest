async function carregarCategorias() {
  try {
    const produtos = await fetch("https://tuvissetest.onrender.com/produtos");
    const produtosJson = await produtos.json();

    const categorias = {};

    produtosJson.forEach((produto) => {
      if (!categorias[produto.categoria]) {
        categorias[produto.categoria] = new Set();
      }
      categorias[produto.categoria].add(produto.subcategoria);
    });

    const corpoCategorias = document.getElementById("corpo_categorias");
    corpoCategorias.innerHTML = "";

    const menuL = document.createElement("div");
    menuL.className = "menuL";
    menuL.innerHTML = "<h1>Categorias</h1>";

    Object.keys(categorias).forEach((categoria) => {
      const details = document.createElement("details");
      details.className = "links-categoria";
      const summary = document.createElement("summary");
      summary.textContent = categoria;

      summary.addEventListener("click", () => {
        carregarProdutos(categoria);
      });

      details.appendChild(summary);

      const ul = document.createElement("ul");

      categorias[categoria].forEach((subcategoria) => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = "#";
        link.className = "sub_itens";
        link.textContent = subcategoria;

        link.addEventListener("click", (e) => {
          e.preventDefault();
          carregarProdutos(categoria, subcategoria);
        });

        li.appendChild(link);
        ul.appendChild(li);
      });

      details.appendChild(ul);
      menuL.appendChild(details);
    });

    // ✅ Adiciona o botão de remover filtro
    const divRemover = document.createElement("div");
    divRemover.className = "remover_filtro";
    divRemover.innerHTML = "<button id='remover-filtro'>Remover Filtro</button>";
    menuL.appendChild(divRemover);

    corpoCategorias.appendChild(menuL);

    // ✅ Event listener para o botão
    const btnRemoverFiltro = document.getElementById("remover-filtro");
    btnRemoverFiltro.addEventListener("click", () => {
      carregarProdutos(); // Sem filtro
    });

  } catch (error) {
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarCategorias();
  carregarProdutos();
});
