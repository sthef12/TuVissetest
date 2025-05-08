//carregar os produtos do catalogo:
async function carregarProdutos(filtroCategoria = null, filtroSubcategoria = null) {
  try {
    const produtos = await fetch("https://backend-tuvisse.onrender.com/produtos");
    const produtosJson = await produtos.json();

    if (produtosJson.length > 0) {
      const catalogo = document.getElementById("catalogo");
      catalogo.innerHTML = "";

      // FILTRAR produtos
      const produtosFiltrados = produtosJson.filter(produto => {
        const categoriaOk = !filtroCategoria || produto.categoria === filtroCategoria;
        const subcategoriaOk = !filtroSubcategoria || produto.subcategoria === filtroSubcategoria;
        return categoriaOk && subcategoriaOk;
      });

      // Exibir os produtos filtrados
      for (const produto of produtosFiltrados) {
        catalogo.innerHTML += `
        <a href="../pags/telaProduto.html?id=${produto.id}">
          <div class="produtos">
            <img src="${produto.imagem}" alt="${produto.nome}" />
            <div class="nome_preco_produto">
              <h1>${produto.nome}</h1>
              <div class="cores">
                <span class="cor_produto"></span>
                <span class="cor_produto"></span>
                <span class="cor_produto"></span>
              </div>
              <h2>R$ ${produto.preco.toFixed(2)}</h2>
            </div>
            <button>Comprar</button>
          </div>
        </a>`;
      }

      // Se nenhum produto bater com o filtro:
      if (produtosFiltrados.length === 0) {
        catalogo.innerHTML = "<p>Nenhum produto encontrado para esse filtro.</p>";
      }
    }
  } catch (error) {
    console.error(error);
  }
}