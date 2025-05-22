async function buscarProdutoPeloLocalStorage() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const itens_container = document.getElementById("itens_container");

  if (carrinho.length === 0) {
    itens_container.innerHTML = "<p>Seu carrinho está vazio.</p>";
    return;
  }

  try {
    const produtos = await fetch("https://tuvissetest.onrender.com/produtos");
    const produtosJson = await produtos.json();

    let totalItens = 0;
    let valorTotal = 0;
    const produtoQuantidade = {};

    // Calcula a quantidade de cada produto no carrinho
    carrinho.forEach((produtoId) => {
      produtoQuantidade[produtoId] = (produtoQuantidade[produtoId] || 0) + 1;
    });

    // Cria a estrutura inicial da tabela
    itens_container.innerHTML = `
      <div class="itens_list" style="display: flex; flex-direction: column; ">
        <div id="tabela_corpo"></div>
      </div>
      <div class="cont">
        <div class="total_itens">
          <label>Total de Itens:</label>
          <label id="total_itens">${totalItens}</label>
        </div>
        <div class="valor_total">
          <label>Valor total:</label>
          <label id="valor_total">R$ ${valorTotal.toFixed(2)}</label>
        </div>
      </div>
      <div class="buttons">
        <button class="button" id="finalizar" onclick="finalizarPedido()">Finalizar Pedido</button>
        <button class="button" id="continuar" onclick="window.location.href= '../index.html'">Continuar Comprando</button>
      </div>`;

    const tabelaCorpo = document.getElementById("tabela_corpo");

    // Adiciona uma linha para cada produto
    Object.keys(produtoQuantidade).forEach((produtoId) => {
      const produto = produtosJson.find((p) => p.id == produtoId);

      if (produto) {
        totalItens += produtoQuantidade[produtoId];
        valorTotal += produto.preco * produtoQuantidade[produtoId];

        const corSelecionada =
          JSON.parse(localStorage.getItem("coresSelecionadas"))?.[produtoId]
            ?.cor || "Não especificada";

        const linhaProduto = `
          <div class="linha_produto">
          
            <div class="prod_cor_preco">

              <div class="nome_cor">
                <img src="${produto.imagem}" alt="${produto.nome}" />
                <div class="produto">
                  <div class="nome_produto" style="cursor: pointer;" onclick="window.location.href='../produto.html?id=${produto.id}'" title="${produto.nome}">
                   <label id="nome_produto" style="cursor: pointer;">${produto.nome}</label>
                  </div>

                  <div class="cor">
                    <label id="cor_produto_${produtoId}" class="cor_sele_produto">${corSelecionada}</label>
                  </div>
                
                </div>

              </div>

              <div class="preco">
                <label id="valor_nome">valor</label>
                <label id="preco_produto_${produtoId}" class="preco_produto">R$ ${(produto.preco * produtoQuantidade[produtoId]).toFixed(2)}</label>
              </div>
            </div>

            <div class="quantidade">
              <div class="input_qnt_container">
                <div class="input_qnt_icon">
                  <i class="fa-solid fa-minus" onclick="alterarQuantidade('${produtoId}', ${produto.preco}, -1)" style="cursor:pointer;"></i>
                  <input id="imput_qnt_${produtoId}" class="imput_qnt" type="number" value="${produtoQuantidade[produtoId]}" min="0" onchange="atualizarQuantidade(${produtoId}, ${produto.preco})" />
                  <i class="fa-solid fa-plus" onclick="alterarQuantidade('${produtoId}', ${produto.preco}, 1)" style="cursor:pointer;"></i>
                </div>
                <i class="fa-solid fa-trash" style="cursor:pointer;" onclick="removerProduto('${produtoId}')"></i>
              </div>
            </div>

          </div>`;
        tabelaCorpo.innerHTML += linhaProduto;
      }
    });

    // Atualiza os totais
    document.getElementById("total_itens").textContent = totalItens;
    document.getElementById(
      "valor_total"
    ).textContent = `R$ ${valorTotal.toFixed(2)}`;
  } catch (error) {
    console.error(error);
  }
}

// Atualiza a quantidade e o preço do produto
function atualizarQuantidade(produtoId, preco) {
  const quantidadeInput = document.getElementById(`imput_qnt_${produtoId}`);
  const quantidade = parseInt(quantidadeInput.value);
  const precoProduto = document.getElementById(`preco_produto_${produtoId}`);
  const totalItensLabel = document.getElementById("total_itens");
  const valorTotalLabel = document.getElementById("valor_total");

  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  let totalItens = 0;
  let valorTotal = 0;

  // Atualiza o carrinho no localStorage
  carrinho = carrinho.filter((id) => id != produtoId);
  for (let i = 0; i < quantidade; i++) {
    carrinho.push(produtoId);
  }
  localStorage.setItem("carrinho", JSON.stringify(carrinho));

  // Recalcula os totais
  carrinho.forEach((id) => {
    totalItens += 1;
    valorTotal += preco;
  });

  precoProduto.textContent = `R$ ${(preco * quantidade).toFixed(2)}`;
  totalItensLabel.textContent = totalItens;
  valorTotalLabel.textContent = `R$ ${valorTotal.toFixed(2)}`;
}

function removerProduto(quantidade) {
  if (confirm(quantidade === 0)) {
      carrinho = carrinho.filter((id) => id != produtoId);
      localStorage.setItem("carrinho", JSON.stringify(carrinho));
      buscarProdutoPeloLocalStorage();
      return;
    } else {
      quantidadeInput.value = 1;
      return;
    }
  }

// Função para remover o produto do carrinho
function removerProduto(produtoId) {
  if (!confirm("Deseja remover este produto do carrinho?")) {
    return;
  }
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  // Remove todas as ocorrências do produto do carrinho
  carrinho = carrinho.filter((id) => id != produtoId);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));

  // Remove a cor selecionada desse produto, se existir
  const coresSelecionadas = JSON.parse(localStorage.getItem("coresSelecionadas")) || {};
  if (coresSelecionadas[produtoId]) {
    delete coresSelecionadas[produtoId];
    localStorage.setItem("coresSelecionadas", JSON.stringify(coresSelecionadas));
  }

  buscarProdutoPeloLocalStorage();
  location.reload();
}

// Finaliza o pedido e redireciona para o WhatsApp
function finalizarPedido() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const totalItens = document.getElementById("total_itens").textContent;
  const valorTotal = document.getElementById("valor_total").textContent;

  if (carrinho.length > 0) {
    const itens_container = document.getElementById("itens_container");
    const produtos = itens_container.querySelectorAll(".produto label");
    let listaProdutos = "";

    produtos.forEach((produto, index) => {
      const produtoId = carrinho[index];
      const corSelecionada =
        JSON.parse(localStorage.getItem("coresSelecionadas"))?.[produtoId]
          ?.cor || "Não especificada";

      listaProdutos += `${index + 1}. ${
        produto.textContent
      } - Cor: ${corSelecionada}\n`;
    });

    const mensagem = `Olá, segue meu pedido: \n - *Produtos:* \n${listaProdutos} \n - *Total de itens:* ${totalItens} \n - *Valor total:* ${valorTotal} \n \n Desejo conversar e realizar o pagamento. \n Aguardo retorno para finalizar a compra.`;
    const url = `https://api.whatsapp.com/send?phone=558199543880&text=${encodeURIComponent(
      mensagem
    )}`;
    window.open(url, "_blank");

    setTimeout(() => {
      localStorage.removeItem("carrinho");
      localStorage.removeItem("coresSelecionadas");
      localStorage.removeItem("corSelecionada");
      buscarProdutoPeloLocalStorage();
    }, 6000000);
  } else {
    alert("Seu carrinho está vazio.");
  }
}

// Nova função para tratar o incremento/decremento
function alterarQuantidade(produtoId, preco, delta) {
  const input = document.getElementById(`imput_qnt_${produtoId}`);
  let novaQuantidade = parseInt(input.value) + delta;
  if (novaQuantidade <= 0) {
    if (confirm("Deseja remover este produto do carrinho?")) {
      removerProduto(produtoId);
    }
    return;
  }
  input.value = novaQuantidade;
  atualizarQuantidade(produtoId, preco);
}

window.onload = buscarProdutoPeloLocalStorage;
