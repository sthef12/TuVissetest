let categorias = [];
let cores = [];
let produtos = [];

async function carregarProdutos() {
  const res = await fetch("../banco/produtos.json");
  produtos = await res.json(); // Armazena os produtos na variável global
  const produtosPorCategoria = produtos.reduce((acc, produto) => {
    if (!acc[produto.categoria]) {
      acc[produto.categoria] = [];
    }
    acc[produto.categoria].push(produto);
    return acc;
  }, {});

  categorias = Object.keys(produtosPorCategoria);
  atualizarCategorias();

  const container = document.getElementById("lista-produtos");
  container.innerHTML = "";
  for (const categoria in produtosPorCategoria) {
    const categoriaDiv = document.createElement("div");
    categoriaDiv.innerHTML = `<h2>${categoria}</h2>`;
    const tabela = document.createElement("table");
    tabela.innerHTML = `
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Composição</th>
          <th>Descrição</th>
          <th>Subcategoria</th>
          <th>Imagem Principal</th>
          <th>Cores</th>
          <th>Tamanhos</th>
          <th>Medidas</th>
          <th>Imagem Medidas</th>
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
              <td>${produto.composicao}</td>
              <td>${produto.descricao}</td>
              <td>${produto.subcategoria}</td>
              <td><img src="${produto.imagem}" alt="${
              produto.nome
            }" width="50"></td>
              <td>
                ${
                  Array.isArray(produto.cores)
                    ? produto.cores
                        .map(
                          (cor) => `
                          <div>
                            <p><strong>Código da cor:</strong> ${
                              cor.codigoCor || "N/A"
                            }</p>
                            <p><strong>Nome da cor:</strong> ${
                              cor.nomeCor || "N/A"
                            }</p>
                            ${
                              cor.imagemFrente
                                ? `<img src="${cor.imagemFrente}" alt="Frente" width="30">`
                                : ""
                            }
                            ${
                              cor.imagemVerso
                                ? `<img src="${cor.imagemVerso}" alt="Verso" width="30">`
                                : ""
                            }
                          </div>
                        `
                        )
                        .join("")
                    : "N/A"
                }
              </td>
              <td>${verificarTamanho(produto)}</td>
              <td>${verificarMedidas(produto)}</td>
              <td><img src="${
                produto.imagem_medidas == undefined ? "N/A" : produto.imagem_medidas
              }" alt="Medidas" width="50"></td>
              <td>${produto.estoque}</td>
              <td>${
                !isNaN(parseFloat(produto.preco))
                  ? `R$ ${parseFloat(produto.preco).toFixed(2)}`
                  : "N/A"
              }</td>
              <td>
                <button onclick="editarProduto(${produto.id})">Editar</button>
                <button onclick="removerProduto(${produto.id})">Excluir</button>
              </td>
            </tr>
          `
          )
          .join("")}
      </tbody>
    `;

    categoriaDiv.style.display = "flex";
    categoriaDiv.style.flexDirection = "column";
    categoriaDiv.style.alignItems = "center";
    categoriaDiv.style.justifyContent = "center";

    categoriaDiv.appendChild(tabela);
    container.appendChild(categoriaDiv);
  }
}

async function adicionarProduto() {
  const formData = new FormData();
  formData.append("nome", document.getElementById("nome").value);
  formData.append("composicao", document.getElementById("composicao").value);
  formData.append("descricao", document.getElementById("descricao").value);
  formData.append("preco", parseFloat(document.getElementById("preco").value));
  formData.append(
    "estoque",
    parseInt(document.getElementById("estoque").value, 10)
  );
  formData.append("tamanhos", document.getElementById("tamanhos").value);
  formData.append("medidas", document.getElementById("medidas").value);

  // Verificar se a categoria é "nova" e usar o valor do campo de nova categoria
  const categoriaSelect = document.getElementById("categoria-select").value;
  const novaCategoria = document.getElementById("nova-categoria").value.trim();
  const categoriaFinal = categoriaSelect === "nova" && novaCategoria ? novaCategoria : categoriaSelect;
  formData.append("categoria", categoriaFinal);

  formData.append(
    "subcategoria",
    document.getElementById("subcategoria-select").value
  );

  // Adicionar imagem principal
  const imagem = document.getElementById("imagem").files[0];
  if (imagem) {
    formData.append("imagem", imagem);
  }

  // Adicionar imagem de medidas
  const imagemMedidas = document.getElementById("imagem_medidas").files[0];
  console.log(imagemMedidas);
  if (imagemMedidas) {
    formData.append("imagem_medidas", imagemMedidas);

  // Adicionar campos das cores
  const coresLista = document.querySelectorAll(".cor-item");
  const listaCores = [];

  coresLista.forEach((corItem, index) => {
    const codigoCor = corItem.querySelector(".codigo-cor").value;
    const nomeCor = corItem.querySelector(".nome-cor").value;

    const corObj = {
      codigoCor,
      nomeCor,
    };

    listaCores.push(corObj);

    const imagemFrente = corItem.querySelector(".imagem-frente").files[0];
    const imagemVerso = corItem.querySelector(".imagem-verso").files[0];

    if (imagemFrente) {
      formData.append(`cores[${index}][imagemFrente]`, imagemFrente);
    }

    if (imagemVerso) {
      formData.append(`cores[${index}][imagemVerso]`, imagemVerso);
    }
  });

  // Envia o array como JSON string
  formData.append("cores", JSON.stringify(listaCores));

  const token = localStorage.getItem("token");
  await fetch("http://localhost:3000/produtos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  carregarProdutos();

  // Debug: Verificar o conteúdo do FormData
  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }
}}

function adicionarCor() {
  const coresContainer = document.getElementById("cores-container");

  const corDiv = document.createElement("div");
  corDiv.className = "cor-item";

  corDiv.innerHTML = `
    <input type="text" placeholder="Código da Cor (ex: #FFFFFF)" class="codigo-cor" />
    <input type="text" placeholder="Nome da Cor (ex: Branco)" class="nome-cor" />
    <input type="file" class="imagem-frente" accept=".jpg, .jpeg, .png" />
    <input type="file" class="imagem-verso" accept=".jpg, .jpeg, .png" />
    <button type="button" onclick="addMaisCor(this)">Adicionar mais cores</button>
    <button type="button" onclick="removerCor(this)">Remover</button>
  `;

  coresContainer.appendChild(corDiv);
}

function addMaisCor(button) {
  const corDiv = button.parentElement;
  const novaCorDiv = corDiv.cloneNode(true); // Clona o elemento da cor
  novaCorDiv.querySelector(".codigo-cor").value = ""; // Limpa o valor do código da cor
  novaCorDiv.querySelector(".nome-cor").value = ""; // Limpa o valor do nome da cor
  novaCorDiv.querySelector(".imagem-frente").value = ""; // Limpa o valor da imagem frente
  novaCorDiv.querySelector(".imagem-verso").value = ""; // Limpa o valor da imagem verso
  corDiv.parentElement.appendChild(novaCorDiv); // Adiciona a nova cor ao container
  cores.push({}); // Adiciona um novo objeto vazio à lista de cores
}

function verificarCategoria() {
  const categoriaSelect = document.getElementById("categoria-select");
  const novaCategoriaInput = document.getElementById("nova-categoria");
  if (categoriaSelect.value === "nova") {
    novaCategoriaInput.style.display = "block";
  } else {
    novaCategoriaInput.style.display = "none";
  }
}

function verificarTamanho(produto) {
  if (typeof produto.tamanhos === "string") {
    // Caso os tamanhos estejam em formato de string
    return produto.tamanhos
      .split(",")
      .map((t) => t.trim())
      .join(", ");
  } else if (Array.isArray(produto.tamanhos)) {
    // Caso os tamanhos estejam em formato de array (números ou strings)
    return produto.tamanhos.join(", ");
  } else {
    // Caso o formato seja inesperado
    return "Tamanhos não disponíveis";
  }
}

function verificarMedidas(produto) {
  if (Array.isArray(produto.medidas)) {
    // Caso as medidas estejam em formato de array
    return produto.medidas.map((m) => `${m.tamanho}: ${m.medida}`).join(", ");
  } else if (typeof produto.medidas === "string") {
    // Caso as medidas estejam em formato de string
    return produto.medidas;
  } else {
    // Caso o formato seja inesperado
    return "Medidas não disponíveis";
  }
}

function editarProduto(id) {
  const produto = produtos.find((p) => p.id === id); // Busca o produto pelo ID
  if (!produto) {
    console.error("Produto não encontrado!");
    return;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
  document.getElementById("adicionar-btn").style.display = "none";
  document.getElementById("atualizar-btn").style.display = "inline-block";
  document.getElementById("voltar-btn").style.display = "inline-block";

  // Preenche os campos do formulário com os dados do produto
  document.getElementById("nome").value = produto.nome;
  document.getElementById("composicao").value = produto.composicao;
  document.getElementById("descricao").value = produto.descricao;
  document.getElementById("preco").value = produto.preco;
  document.getElementById("estoque").value = produto.estoque;
  document.getElementById("tamanhos").value = verificarTamanho(produto);
  document.getElementById("medidas").value = verificarMedidas(produto);
  document.getElementById("subcategoria-select").value = produto.subcategoria;
  document.getElementById("categoria-select").value = produto.categoria;
  document.getElementById("nova-categoria").value = "";
  document.getElementById("nome").dataset.id = id;

  // Limpa as cores existentes no formulário
  const coresContainer = document.getElementById("cores-container");
  coresContainer.innerHTML = "";

  // Adiciona as cores ao formulário
  if (produto.cores && produto.cores.length > 0) {
    produto.cores.forEach((cor) => {
      const corDiv = document.createElement("div");
      corDiv.className = "cor-item";

      corDiv.innerHTML = `
        <input type="text" placeholder="Código da Cor (ex: #FFFFFF)" class="codigo-cor" value="${
          cor.codigoCor || ""
        }"/>
        <input type="text" placeholder="Nome da Cor (ex: Branco)" class="nome-cor" value="${
          cor.nomeCor || ""
        }" />
        <input type="file" class="imagem-frente" accept=".jpg, .jpeg, .png" />
        <input type="file" class="imagem-verso" accept=".jpg, .jpeg, .png" />
        <button type="button" onclick="removerCor(this)">Remover</button>
      `;

      coresContainer.appendChild(corDiv);
    });
  }
}

function atualizarCategorias() {
  const categoriaSelect = document.getElementById("categoria-select");
  categoriaSelect.innerHTML =
    '<option value="">Selecione uma categoria</option>';
  categorias.forEach((categoria) => {
    const option = document.createElement("option");
    option.value = categoria;
    option.textContent = categoria;
    categoriaSelect.appendChild(option);
  });
  const novaOption = document.createElement("option");
  novaOption.value = "nova";
  novaOption.textContent = "Adicionar uma nova categoria";
  categoriaSelect.appendChild(novaOption);
}

async function atualizarProduto() {
  const id = document.getElementById("nome").dataset.id;
  const formData = new FormData();
  formData.append("nome", document.getElementById("nome").value);
  formData.append("composicao", document.getElementById("composicao").value);
  formData.append("descricao", document.getElementById("descricao").value);
  formData.append("preco", parseFloat(document.getElementById("preco").value));
  formData.append(
    "estoque",
    parseInt(document.getElementById("estoque").value, 10)
  );
  formData.append(
    "tamanhos",
    document
      .getElementById("tamanhos")
      .value.split(",")
      .map((t) => t.trim())
  );
  formData.append(
    "medidas",
    document
      .getElementById("medidas")
      .value.split(",")
      .map((m) => m.trim())
  );
  formData.append(
    "categoria",
    document.getElementById("categoria-select").value
  );
  formData.append(
    "subcategoria",
    document.getElementById("subcategoria-select").value
  );
  formData.append("imagem", document.getElementById("imagem").files[0]);

  const imagemMedidas = document.getElementById("imagem_medidas").files[0];
  if (imagemMedidas) {
    formData.append("imagem_medidas", imagemMedidas);
  }

  cores.forEach((cor, index) => {
    formData.append(`cores[${index}][codigoCor]`, cor.codigoCor);
    formData.append(`cores[${index}][nomeCor]`, cor.nomeCor);
    if (cor.imagemFrente) {
      formData.append(`cores[${index}][imagemFrente]`, cor.imagemFrente);
    }
    if (cor.imagemVerso) {
      formData.append(`cores[${index}][imagemVerso]`, cor.imagemVerso);
    }
  });

  const token = localStorage.getItem("token");
  await fetch(`http://localhost:3000/produtos/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  carregarProdutos();

  limparFormulario();

  document.getElementById("adicionar-btn").style.display = "inline-block";
  document.getElementById("atualizar-btn").style.display = "none";
  document.getElementById("voltar-btn").style.display = "none";
}

function removerCor(button) {
  const corDiv = button.parentElement;
  corDiv.remove();
}

async function removerProduto(id) {
  const token = localStorage.getItem("token");
  await fetch(`http://localhost:3000/produtos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  carregarProdutos();
}

function voltarProduto() {
  limparFormulario();
  document.getElementById("adicionar-btn").style.display = "inline-block";
  document.getElementById("atualizar-btn").style.display = "none";
  document.getElementById("voltar-btn").style.display = "none";
}

function limparFormulario() {
  document.getElementById("nome").value = "";
  document.getElementById("composicao").value = "";
  document.getElementById("descricao").value = "";
  document.getElementById("preco").value = "";
  document.getElementById("estoque").value = "";
  document.getElementById("tamanhos").value = "";
  document.getElementById("medidas").value = "";
  document.getElementById("categoria-select").value = "";
  document.getElementById("subcategoria-select").value = "";
  document.getElementById("imagem").value = "";
  document.getElementById("imagem_medidas").value = "";

  const coresContainer = document.getElementById("cores-container");
  coresContainer.innerHTML = `<button type="button" onclick="adicionarCor()">Adicionar uma ou mais cores</button>`;
  cores = [];
}

carregarProdutos();