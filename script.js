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
    corpoCategorias.innerHTML = "";

    const menuL = document.createElement("div");
    menuL.className = "menuL";
    menuL.innerHTML =
      "<i class='fa-solid fa-xmark' style='display: none;' id='fechar' onclick='openMenu()'></i><h1>Categorias</h1>";

    Object.keys(categorias).forEach((categoria) => {
      const details = document.createElement("details");
      details.className = "links-categoria";
      details.innerHTML = `<summary>${categoria}</summary>`;

      categorias[categoria].forEach((subcategoria) => {
        const li = document.createElement("li");
        li.innerHTML = `<a onclick="carregarProdutos('${categoria}', '${subcategoria}')" class="sub_itens">${subcategoria}</a>`;
        details.appendChild(li);
      });

      menuL.appendChild(details);
    });

    corpoCategorias.appendChild(menuL);
  } catch (error) {
    console.error(error);
  }
}

//carregar os produtos do catalogo (com filtros opcionais):
async function carregarProdutos(categoriaSelecionada = null, subcategoriaSelecionada = null) {
  try {
    const produtos = await fetch("https://tuvissetest.onrender.com/produtos");
    const produtosJson = await produtos.json();

    // correção de caminho de imagem
    produtosJson.forEach((produto) => {
      if (produto.imagem.startsWith('../')) {
        produto.imagem = produto.imagem.replace('../', './');
      }
    });

    if (produtosJson.length > 0) {
      const catalogo = document.getElementById("catalogo");
      catalogo.innerHTML = "";

      const produtosFiltrados = produtosJson.filter((p) => {
        const matchCategoria = categoriaSelecionada ? p.categoria === categoriaSelecionada : true;
        const matchSubcategoria = subcategoriaSelecionada ? p.subcategoria === subcategoriaSelecionada : true;
        return matchCategoria && matchSubcategoria;
      });

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

      // Se nenhum produto for exibido (caso haja filtro e nada combine)
      if (produtosFiltrados.length === 0) {
        catalogo.innerHTML = "<p>Nenhum produto encontrado para esse filtro.</p>";
      }
    }
  } catch (error) {
    console.error(error);
  }
}


//abrir e fechar o menu lateral
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

//ao abrir a página, carrega produtos e categorias
window.onload = () => {
  carregarProdutos();
  carregarCategorias();
};

//abrir whatsapp com mensagem
function abrirWhatsApp() {
  var telefone = "55081999543880"; // Substitua pelo número desejado com DDD
  var mensagem = encodeURIComponent("Olá!");
  var url = "https://wa.me/" + telefone + "?text=" + mensagem;
  window.open(url, "_blank");
}