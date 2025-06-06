//verifica se o usuário está logado
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html"; // 🔒 Bloqueia se não estiver logado
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
          .map(
            (produto) => `
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
              `
          )
          .join("")}
              </tbody>
              `;

    categoriaDiv.appendChild(tabela);
    container.appendChild(categoriaDiv);
  }
}

// ➕ Adiciona produto
async function adicionarProduto() {
  const formData = new FormData();

  formData.append("nome", document.getElementById("nome").value);
  formData.append("descricao", document.getElementById("descricao").value);
  formData.append("composicao", document.getElementById("composicao").value);
  formData.append(
    "categoria",
    document.getElementById("categoria-select").value
  );
  formData.append(
    "subcategoria",
    document.getElementById("subcategoria-select").value
  );
  formData.append("preco", parseFloat(document.getElementById("preco").value));
  formData.append(
    "estoque",
    parseInt(document.getElementById("estoque").value)
  );
  formData.append("tamanhos", JSON.stringify(tamanhos));
  formData.append("medidas", JSON.stringify(medidas));

  const imagem = document.getElementById("imagem").files[0];
  const imagemMedidas = document.getElementById("imagem_medidas").files[0];

  if (imagem) formData.append("imagem", imagem);
  if (imagemMedidas) formData.append("imagem_medidas", imagemMedidas);

  const cores = [];
  document.querySelectorAll(".cor-item").forEach((el) => {
    const nomeCor = el.querySelector(".nome-cor").value;
    const codigoCor = el.querySelector(".codigo-cor").value;

    const cor = { nomeCor, codigoCor };

    const imagemFrente = el.querySelector(".imagem-frente").files[0];
    const imagemVerso = el.querySelector(".imagem-verso").files[0];

    if (imagemFrente) formData.append("imagemFrente", imagemFrente);
    if (imagemVerso) formData.append("imagemVerso", imagemVerso);

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
    <input type="color" class="codigo-cor" value="#ff0000"/>
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
  // Limpa os campos de texto e selects
  document.getElementById("nome").value = "";
  document.getElementById("composicao").value = "";
  document.getElementById("descricao").value = "";
  document.getElementById("preco").value = "";
  document.getElementById("estoque").value = "";
  document.querySelectorAll(".nome-cor").value = "";
  document.getElementById("categoria-select").value = "";
  document.getElementById("subcategoria-select").value = "";
  document.getElementById("nova-categoria").value = "";

  // Limpa os campos de tamanhos e medidas
  const listaTamanhos = document.getElementById("lista-tamanhos");
  const listaMedidas = document.getElementById("lista-medidas");
  const selectTamanhoMedida = document.getElementById("select-tamanho-medida");

  listaTamanhos.innerHTML = "";
  listaMedidas.innerHTML = "";
  selectTamanhoMedida.innerHTML =
    '<option value="">Selecione o tamanho</option>';

  // Limpa os arrays de tamanhos e medidas
  tamanhos.length = 0;
  medidas.length = 0;

  // Limpa os campos de imagens
  document.getElementById("imagem").value = "";
  document.getElementById("imagem_medidas").value = "";

  // Limpa o container de cores
  const coresContainer = document.getElementById("cores-container");
  coresContainer.innerHTML = `<button type="button" onclick="adicionarCor()">Adicionar uma ou mais cores</button>`;
}

function listarTamanhosEMedidas(produto) {
  const tamanhos = Array.isArray(produto.tamanhos)
    ? produto.tamanhos.join(", ")
    : produto.tamanhos;

  let medidas = "";

  let medidasArray = produto.medidas;

  // 🔥 Se medidas vier como string, transformar em array
  if (typeof medidasArray === "string") {
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

function verificarCategoria() {
  const categoriaSelect = document.getElementById("categoria-select");
  const novaCategoriaInput = document.getElementById("nova-categoria");
  const button = document.getElementById('adicionarNovaCategoria');
  // Verifica se a opção selecionada é "nova"
  if (categoriaSelect.value === "nova") {
    novaCategoriaInput.style.display = "block"; // Exibe o input para nova categoria
    novaCategoriaInput.required = true; // Torna o campo obrigatório
    button.style.display = 'block'; // exibe o button para adicionar nova categoria
  } else {
    button.style.display = 'none'; // oculta o button para adicionar nova categoria
    novaCategoriaInput.style.display = "none"; // Oculta o input para nova categoria
    novaCategoriaInput.required = false; // Remove a obrigatoriedade
  }
}

// Função para adicionar uma nova categoria ao select
function adicionarNovaCategoria() {
  const novaCategoriaInput = document.getElementById("nova-categoria");
  const categoriaSelect = document.getElementById("categoria-select");

  const novaCategoria = novaCategoriaInput.value.trim();

  if (!novaCategoria) {
    alert("Digite o nome da nova categoria.");
    return;
  }

  // Adiciona a nova categoria ao select
  const option = document.createElement("option");
  option.value = novaCategoria;
  option.textContent = novaCategoria;
  categoriaSelect.appendChild(option);

  // Define a nova categoria como selecionada
  categoriaSelect.value = novaCategoria;

  // Oculta o input e limpa o valor
  novaCategoriaInput.style.display = "none";
  novaCategoriaInput.value = "";

}


// Função para carregar categorias existentes
async function carregarCategorias() {
  const categoriaSelect = document.getElementById("categoria-select");

  try {
    const res = await fetch("https://tuvissetest.onrender.com/produtos");
    const produtos = await res.json();

    // Extrai categorias únicas dos produtos
    const categorias = [
      ...new Set(
        produtos.map((produto) => produto.categoria || "Sem categoria")
      ),
    ];

    // Adiciona as categorias ao select
    categoriaSelect.innerHTML = `
      <option value="">Selecione uma categoria</option>
      <option value="nova">Adicionar uma nova categoria</option>
      ${categorias
        .map(
          (categoria) => `<option value="${categoria}">${categoria}</option>`
        )
        .join("")}
    `;
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);
  }
}

const tamanhos = [];
const medidas = [];

// ➕ Adicionar tamanho
function adicionarTamanho() {
  const input = document.getElementById("input-tamanho");
  const tamanho = input.value.trim();

  if (!tamanho) {
    alert("Digite um tamanho.");
    return;
  }

  if (tamanhos.includes(tamanho)) {
    alert("Este tamanho já foi adicionado.");
    input.value = "";
    return;
  }

  tamanhos.push(tamanho);
  atualizarListaTamanhos();
  atualizarSelectTamanhos();

  input.value = "";
}

// ➕ Adicionar medida vinculada ao tamanho
function adicionarMedida() {
  const tamanhoSelecionado = document.getElementById(
    "select-tamanho-medida"
  ).value;
  const medidaTexto = document.getElementById("input-medida").value.trim();

  if (!tamanhoSelecionado) {
    alert("Selecione um tamanho para associar a medida.");
    return;
  }

  if (!medidaTexto) {
    alert("Digite a medida.");
    return;
  }

  medidas.push({
    tamanho: tamanhoSelecionado,
    medida: medidaTexto,
  });

  atualizarListaMedidas();

  document.getElementById("input-medida").value = "";
}

// 🔄 Atualizar visual dos tamanhos
function atualizarListaTamanhos() {
  const lista = document.getElementById("lista-tamanhos");
  lista.innerHTML = "";

  tamanhos.forEach((t) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${t}</strong> 
      <button onclick="removerTamanho('${t}')">Remover</button>
    `;
    lista.appendChild(div);
  });
}

// 🔄 Atualizar select dos tamanhos nas medidas
function atualizarSelectTamanhos() {
  const select = document.getElementById("select-tamanho-medida");
  select.innerHTML = '<option value="">Selecione o tamanho</option>';

  tamanhos.forEach((t) => {
    const option = document.createElement("option");
    option.value = t;
    option.textContent = t;
    select.appendChild(option);
  });
}

// 🔄 Atualizar lista das medidas
function atualizarListaMedidas() {
  const lista = document.getElementById("lista-medidas");
  lista.innerHTML = "";

  medidas.forEach((m, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${m.tamanho}</strong>: ${m.medida}
      <button onclick="removerMedida(${index})">Remover</button>
    `;
    lista.appendChild(div);
  });
}

// ❌ Remover tamanho
function removerTamanho(t) {
  const index = tamanhos.indexOf(t);
  if (index > -1) {
    tamanhos.splice(index, 1);
  }

  // Remover também medidas vinculadas
  for (let i = medidas.length - 1; i >= 0; i--) {
    if (medidas[i].tamanho === t) {
      medidas.splice(i, 1);
    }
  }

  atualizarListaTamanhos();
  atualizarSelectTamanhos();
  atualizarListaMedidas();
}

// ❌ Remover medida
function removerMedida(index) {
  medidas.splice(index, 1);
  atualizarListaMedidas();
}


// Chama a função ao carregar a página
carregarCategorias();
carregarProdutos();
