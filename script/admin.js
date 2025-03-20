let categorias = [];

async function carregarProdutos() {
  console.log("carregarProdutos");
  const res = await fetch("http://localhost:3000/produtos");
  const produtos = await res.json();
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
                                <td>${produto.cores.join(
                                  ", "
                                )}<br>${produto.imagens_cores
                              .map(
                                (img) =>
                                  `<img src="${img.caminho}" alt="${img.cor}" width="30">`
                              )
                              .join(" ")}</td>
                                <td>${produto.tamanhos.join(", ")}</td>
                                <td>${produto.medidas
                                  .map((m) => `${m.tamanho}: ${m.medida}`)
                                  .join(", ")}</td>
                                <td><img src="${
                                  produto.medidasimagem
                                }" alt="Medidas" width="50"></td>
                                <td>${produto.estoque}</td>
                                <td>${
                                  produto.preco
                                    ? `R$ ${produto.preco.toFixed(2)}`
                                    : "N/A"
                                }</td>
                                <td>
                                    <button onclick="editarProduto(${
                                      produto.id
                                    }, '${produto.nome}', '${
                              produto.composicao
                            }', '${produto.descricao}','${
                              produto.subcategoria
                            }', ${produto.estoque}, '${produto.tamanhos.join(
                              ", "
                            )}', '${produto.medidas
                              .map((m) => `${m.tamanho}: ${m.medida}`)
                              .join(", ")}', '${
                              produto.categoria
                            }', '${produto.cores.join(", ")}', ${
                              produto.preco
                            })">Editar</button>
                                    <button onclick="removerProduto(${
                                      produto.id
                                    })">Excluir</button>
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
  formData.append(
    "imagem_medidas",
    document.getElementById("imagem_medidas").files[0]
  );
  Array.from(document.getElementById("imagens_cores").files).forEach((file) => {
    formData.append("imagens_cores", file);
  });
  formData.append(
    "cores",
    document
      .getElementById("cores")
      .value.split(",")
      .map((c) => c.trim())
  );

  const token = localStorage.getItem("token");
  await fetch("http://localhost:3000/produtos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  carregarProdutos();
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

function verificarCategoria() {
  const categoriaSelect = document.getElementById("categoria-select");
  const novaCategoriaInput = document.getElementById("nova-categoria");
  if (categoriaSelect.value === "nova") {
    novaCategoriaInput.style.display = "block";
  } else {
    novaCategoriaInput.style.display = "none";
  }
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

function editarProduto(
  id,
  nome,
  composicao,
  descricao,
  subcategoria,
  estoque,
  tamanhos,
  medidas,
  categoria,
  cores,
  preco
) {
  document.getElementById("nome").value = nome;
  document.getElementById("composicao").value = composicao;
  document.getElementById("descricao").value = descricao;
  document.getElementById("preco").value = preco;
  document.getElementById("estoque").value = estoque;
  document.getElementById("tamanhos").value = tamanhos;
  document.getElementById("medidas").value = medidas;
  document.getElementById("cores").value = cores;
  document.getElementById("subcategoria-select").value = subcategoria;
  document.getElementById("categoria-select").value = categoria;
  document.getElementById("nova-categoria").value = "";
  document.getElementById("nome").dataset.id = id;
  document.getElementById("adicionar-btn").style.display = "none";
  document.getElementById("atualizar-btn").style.display = "inline-block";
  console.log(document.getElementById("atualizar-btn").style.display);
  document.getElementById("voltar-btn").style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: "smooth" });
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
  formData.append(
    "imagem_medidas",
    document.getElementById("imagem_medidas").files[0]
  );
  Array.from(document.getElementById("imagens_cores").files).forEach((file) => {
    formData.append("imagens_cores", file);
  });
  formData.append(
    "cores",
    document
      .getElementById("cores")
      .value.split(",")
      .map((c) => c.trim())
  );

  const token = localStorage.getItem("token");
  await fetch(`http://localhost:3000/produtos/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  carregarProdutos();
  document.getElementById("nome").value = "";
  document.getElementById("composicao").value = "";
  document.getElementById("descricao").value = "";
  document.getElementById("preco").value = "";
  document.getElementById("estoque").value = "";
  document.getElementById("tamanhos").value = "";
  document.getElementById("medidas").value = "";
  document.getElementById("cores").value = "";
  document.getElementById("subcategoria-select").value = "";
  document.getElementById("categoria-select").value = "";
  document.getElementById("nova-categoria").value = "";
  document.getElementById("adicionar-btn").style.display = "inline-block";
  document.getElementById("atualizar-btn").style.display = "none";
  document.getElementById("voltar-btn").style.display = "none";
}

function voltarProduto() {
  document.getElementById("nome").value = "";
  document.getElementById("composicao").value = "";
  document.getElementById("descricao").value = "";
  document.getElementById("preco").value = "";
  document.getElementById("estoque").value = "";
  document.getElementById("tamanhos").value = "";
  document.getElementById("medidas").value = "";
  document.getElementById("cores").value = "";
  document.getElementById("subcategoria-select").value = "";
  document.getElementById("categoria-select").value = "";
  document.getElementById("nova-categoria").value = "";
  document.getElementById("adicionar-btn").style.display = "inline-block";
  document.getElementById("atualizar-btn").style.display = "none";
  document.getElementById("voltar-btn").style.display = "none";
}
carregarProdutos();