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
async function carregarProdutos() {
  try {
    const produtos = await fetch("https://tuvissetest.onrender.com/produtos");
    const produtosJson = await produtos.json();

    if (produtosJson.length > 0) {
      //se tiver algum produto:
      const catalogo = document.getElementById("catalogo");
      catalogo.innerHTML = "";

      //para cada produto ele insere na div catalogo essa estrutura HTML:
      for (const produto of produtosJson) {
        catalogo.innerHTML += `
        <a href="pags/telaProduto.html?id=${produto.id}">
        <div class="produtos">
          <img src="${
            produto.imagem.startsWith("../")
              ? produto.imagem.replace("../", "./")
              : produto.imagem
          }" alt="${produto.nome}" />
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
    }
  } catch (error) {
    console.error(error);
  }
}

const menuLateral = document.getElementById("corpo_categorias");

function openMenu() {
  const iconFechar = document.getElementById("fechar");
  if (
    menuLateral.style.display === "" ||
    menuLateral.style.display === "none"
  ) {
    menuLateral.style.display = "block";
    iconFechar.style.display = "block";
    document.body.style.overflow = "hidden";
  } else if (menuLateral.style.display === "block") {
    menuLateral.style.display = "none";
    iconFechar.style.display = "none";
    document.body.style.overflow = "";
  }
}

//ao abrir a pagina, chama as seguintes funções:
window.onload = () => {
  carregarProdutos();
  carregarCategorias();
};
