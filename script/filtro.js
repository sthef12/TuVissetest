//carregar as categorias do menu lateral:
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
    //dentro da div com id corpo_categorias:
    corpoCategorias.innerHTML = ""; //limpa o conteudo da div

    const menuL = document.createElement("div"); //cria uma div
    menuL.className = "menuL"; //com a classe menuL
    menuL.innerHTML =
      "<i class='fa-solid fa-xmark' style='display: none;' id='fechar' onclick='openMenu()'></i><h1>Categorias</h1>"; //coloca um h1 com o texto Categorias

    //para cada categoria, cria um elemento chamado details com um <summary> e uma lista de subcategorias
    //e adiciona na div menuL
    Object.keys(categorias).forEach((categoria) => {
      const details = document.createElement("details");
      details.className = "links-categoria";
      details.innerHTML = `<summary>${categoria}</summary>`;

      //para cada subcategoria, cria um elemento <li> com um link (href) e adiciona na lista de subcategorias
      categorias[categoria].forEach((subcategoria) => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="#" class="sub_itens">${subcategoria}</a>`;
        details.appendChild(li);
      });

      //entao, no final a estrutura HTML fica assim:
      //<div id="corpo_categorias">
      //  <div class="menuL">
      //    <h1>Categorias</h1>
      //    <details class="links-categoria">
      //      <summary>categoria</summary>
      //      <li><a href="#" class="sub_itens">subcategoria</a></li>
      //    </details>
      //  </div>
      // </div>

      menuL.appendChild(details); //faz aparecer isso tudo la na pagina
    });

    corpoCategorias.appendChild(menuL);
  } catch (error) {
    console.error(error);
  }
}
//carregar os produtos do catalogo:
async function carregarProdutos(
  filtroCategoria = null,
  filtroSubcategoria = null
) {
  try {
    const produtos = await fetch("https://tuvissetest.onrender.com/produtos");
    const produtosJson = await produtos.json();

    // correção de caminho de imagem
    produtosJson.forEach((produto) => {
      if (produto.imagem.startsWith("../")) {
        produto.imagem = produto.imagem.replace("../", "./");
      }
    });

    if (produtosJson.length > 0) {
      const catalogo = document.getElementById("catalogo");
      catalogo.innerHTML = "";

      // FILTRAR produtos
      const produtosFiltrados = produtosJson.filter((produto) => {
        const categoriaOk =
          !filtroCategoria || produto.categoria === filtroCategoria;
        const subcategoriaOk =
          !filtroSubcategoria || produto.subcategoria === filtroSubcategoria;
        return categoriaOk && subcategoriaOk;
      });

      // Exibir os produtos filtrados
      for (const produto of produtosFiltrados) {
        catalogo.innerHTML += `
        <a href="./pags/telaProduto.html?id=${produto.id}">
          <div class="produtos">
            <img src="${produto.imagem}" alt="${produto.nome}" />
            <div class="nome_preco_produto">
              <h1>${produto.nome}</h1>
              <div class="cores">
  ${
    produto.cores && produto.cores.length > 0
      ? produto.cores
          .map(
            (cor, i) => `
              <span class="cor_produto" style="background-color: ${cor.codigoCor};" title="${cor.nomeCor}" onclick="selecionarImagem(${i}, 'frente')"></span>`
          )
          .join("")
      : "<p>Incolor</p>"
  }
</div>

              <h2>R$ ${produto.preco.toFixed(2)}</h2>
            </div>
            <button>Comprar</button>
          </div>
        </a>`;
      }

      // Se nenhum produto bater com o filtro:
      if (produtosFiltrados.length === 0) {
        catalogo.innerHTML =
          "<p>Nenhum produto encontrado para esse filtro.</p>";
      }
    }
  } catch (error) {
    console.error(error);
  }
}
