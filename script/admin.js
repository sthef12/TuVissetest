//verifica se o usuário está logado
const token = localStorage.getItem('token');

if (!token) {
  window.location.href = 'login.html'; // 🔒 Bloqueia se não estiver logado
}

const url = "https://tuvissetest.onrender.com/produtos";

// 🔥 Carrega os produtos do backend
async function carregarProdutos() {
  const res = await fetch(url);
  const produtos = await res.json();

  const container = document.getElementById("lista-produtos");
  container.innerHTML = "";

  // Agrupa os produtos por categoria
  const produtosPorCategoria = produtos.reduce((acc, produto) => {
    const categoria = produto.categoria || "Sem categoria";
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(produto);
    return acc;
  }, {});

  // Cria uma tabela para cada categoria
  for (const categoria in produtosPorCategoria) {
    const categoriaDiv = document.createElement("div");
    categoriaDiv.innerHTML = `<h2>${categoria}</h2>`;
    const tabela = document.createElement("table");
    tabela.innerHTML = `
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Descrição</th>
          <th>Composição</th>
          <th>Categoria</th>
          <th>Subcategoria</th>
          <th>Imagem</th>
          <th>Imagem Medidas</th>
          <th>Cores</th>
          <th>Tamanhos</th>
          <th>Estoque</th>
          <th>Preço</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${produtosPorCategoria[categoria]
          .map((produto) => `
            <tr>
              <td>${produto.id}</td>
              <td>${produto.nome}</td>
              <td>${produto.descricao}</td>
              <td>${produto.composicao}</td>
              <td>${produto.categoria}</td>
              <td>${produto.subcategoria}</td>
              <td><img src="${produto.imagem}" width="50"></td>
              <td><img src="${produto.imagem_medidas}" width="50"></td>
              <td>
              ${
                Array.isArray(produto.cores)
                ? produto.cores
                .map(
                  (cor) => `
                  <div>
                  <p>${cor.nomeCor} (${cor.codigoCor})</p>
                  <img src="${cor.imagemFrente}" width="40" alt="Imagem Frente">
                  <img src="${cor.imagemVerso}" width="40" alt="Imagem Verso">
                  </div>
                  `
                )
                .join("")
                : "N/A"
              }
              </td>
              <td>${listarTamanhosEMedidas(produto)}</td>
              <td>${produto.estoque}</td>
              <td>R$ ${parseFloat(produto.preco).toFixed(2)}</td>
              <td>
              <button onclick="editarProduto(${produto.id})">Editar</button>
              <button onclick="deletarProduto(${produto.id})">Excluir</button>
              </td>
              </tr>
              `)
              .join("")}
              </tbody>
              `;
              
    categoriaDiv.appendChild(tabela);
    container.appendChild(categoriaDiv);
  }
}


// ➕ Adiciona produto
async function adicionarProduto() {
  const form = document.getElementById("form-produto");
  const formData = new FormData();

  formData.append("nome", form.nome.value);
  formData.append("descricao", form.descricao.value);
  formData.append("composicao", form.composicao.value);
  formData.append("categoria", form.categoria.value);
  formData.append("subcategoria", form.subcategoria.value);
  formData.append("preco", parseFloat(form.preco.value));
  formData.append("estoque", parseInt(form.estoque.value));
  formData.append("tamanhos", form.tamanhos.value);
  formData.append("medidas", form.medidas.value);

  const imagem = form.imagem.files[0];
  const imagemMedidas = form.imagem_medidas.files[0];

  if (imagem) formData.append("imagem", imagem);
  if (imagemMedidas) formData.append("imagem_medidas", imagemMedidas);

  const cores = [];
  document.querySelectorAll(".cor-item").forEach((el) => {
    const nomeCor = el.querySelector(".nome-cor").value;
    const codigoCor = el.querySelector(".codigo-cor").value;

    const cor = { nomeCor, codigoCor };

    const imagemFrente = el.querySelector(".imagem-frente").files[0];
    const imagemVerso = el.querySelector(".imagem-verso").files[0];

    if (imagemFrente) formData.append("imagemFrente[]", imagemFrente);
    if (imagemVerso) formData.append("imagemVerso[]", imagemVerso);

    cores.push(cor);
  });

  formData.append("cores", JSON.stringify(cores));

  await fetch(url, {
    method: "POST",
    body: formData,
  });

  carregarProdutos();
  limparFormulario();
}

// 🔄 Editar produto
function editarProduto(id) {
  alert(`Editar produto ID: ${id}. Funcionalidade a implementar.`);
}

// ❌ Deletar produto
async function deletarProduto(id) {
  await fetch(`${url}/${id}`, { method: "DELETE" });
  carregarProdutos();
}

// ➕ Adicionar cor
function adicionarCor() {
  const div = document.createElement("div");
  div.classList.add("cor-item");
  div.innerHTML = `
    <input type="text" placeholder="Nome da cor" class="nome-cor" />
    <input type="color" class="codigo-cor" />
    <input type="file" class="imagem-frente" />
    <input type="file" class="imagem-verso" />
    <button onclick="removerCor(this)">Remover</button>
  `;
  document.getElementById("cores").appendChild(div);
}

// ➖ Remover cor
function removerCor(botao) {
  botao.parentElement.remove();
}

// 🧹 Limpa o formulário
function limparFormulario() {
  const form = document.getElementById("form-produto");
  form.reset();
  document.getElementById("cores").innerHTML = "";
}

function listarTamanhosEMedidas(produto) {
  const tamanhos = Array.isArray(produto.tamanhos)
    ? produto.tamanhos.join(", ")
    : produto.tamanhos;

  let medidas = "";

  let medidasArray = produto.medidas;

  // 🔥 Se medidas vier como string, transformar em array
  if (typeof medidasArray === 'string') {
    try {
      medidasArray = JSON.parse(medidasArray);
    } catch {
      medidasArray = [];
    }
  }

  if (Array.isArray(medidasArray)) {
    medidas = medidasArray
      .map(
        (m) => `
          <div>
            <strong>${m.tamanho}:</strong> ${m.medida}
          </div>
        `
      )
      .join("");
  } else {
    medidas = "N/A";
  }

  return `
    <div>
      <div><strong>Tamanhos:</strong> ${tamanhos}</div>
      <div><strong>Medidas:</strong> ${medidas}</div>
    </div>
  `;
}


carregarProdutos();
