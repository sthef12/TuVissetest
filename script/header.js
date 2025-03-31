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
    <a href="../pags/telaProduto.html?id=${produto.id}">
      <div class="produto">
        <img src="${produto.imagem}" alt="${produto.nome}" />
        <span>${produto.nome}</span>
      </div>
    </a>`;
  divBuscado.appendChild(div);
}

fetch("../banco/produtos.json")
  .then((data) => data.json())
  .then((produtosJson) => {
    produtos = produtosJson;
  })
  .catch((error) => console.error("Erro ao carregar produtos:", error));
