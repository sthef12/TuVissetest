const divBuscado = document.querySelector(".buscado");
const inputBusca = document.getElementById("input-busca");

let produtos = [];

inputBusca.oninput = () => {
  let value = inputBusca.value.toLowerCase();
  divBuscado.style.display = value ? "block" : "none";
  divBuscado.innerHTML = "";
  produtos
    .filter((produto) => produto.nome.toLowerCase().includes(value))
    .forEach((produto) => addHTML(produto));
};

function addHTML(produto) {
  const div = document.createElement("div");
  div.classList.add("buscado-item");
  div.innerHTML = "";
  div.innerHTML = `
    <a href="telaProduto.html?id=${produto.id}">
      <div class="produto">
        <img src="${produto.imagem}" alt="${produto.nome}" />
        <span>${produto.nome}</span>
      </div>
    </a>`;
  divBuscado.appendChild(div);
}

fetch("https://tuvissetest.onrender.com/produtos")
  .then((data) => data.json())
  .then((produtosJson) => {
    produtos = produtosJson;
  })
  .catch((error) => console.error("Erro ao carregar produtos:", error));

function atualizarIconeCarrinho() {
  // Não mostra o ícone se estiver na página do carrinho
  if (window.location.pathname.includes("carrinho.html")) return;

  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const iconeCarrinho = document.querySelector(".fa-cart-shopping");

  // Remove o ícone indicador anterior, se existir
  let indicador = document.querySelector(".icone-carrinho-indicador");
  if (indicador) indicador.remove();

  if (iconeCarrinho && carrinho.length > 0) {
    // Cria o ícone indicador
    const icone = document.createElement("i");
    icone.className = "fa-solid fa-circle icone-carrinho-indicador";
    icone.style.fontSize = "10px";
    icone.style.color = "#fecb02";
    icone.style.position = "absolute";
    icone.style.right = "-4px";
    icone.style.top = "-2px";
    iconeCarrinho.parentElement.style.position = "relative";
    iconeCarrinho.parentElement.appendChild(icone);
  }
}

// Atualiza o ícone do carrinho a cada segundo
setInterval(atualizarIconeCarrinho, 100);
