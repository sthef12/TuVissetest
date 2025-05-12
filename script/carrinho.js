async function buscarProdutoPeloLocalStorage() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const itens_container = document.getElementById("itens_container");

  if (carrinho.length > 0) {
    try {
      const produtos = await fetch("https://tuvissetest.onrender.com/produtos");
      const produtosJson = await produtos.json();

      let totalItens = 0;
      let valorTotal = 0;
      const produtoQuantidade = {};

      carrinho.forEach((produtoId) => {
        if (produtoQuantidade[produtoId]) {
          produtoQuantidade[produtoId]++;
        } else {
          produtoQuantidade[produtoId] = 1;
        }
      });

      Object.keys(produtoQuantidade).forEach((produtoId) => {
        const produto = produtosJson.find((p) => p.id == produtoId);

        if (produto) {
          totalItens += produtoQuantidade[produtoId];
          valorTotal += produto.preco * produtoQuantidade[produtoId];

          // adiciona essa estrutura HTML para cada produto
          itens_container.innerHTML += `
                <table class="itens_list">
                  <tr>
                    <td>Produto</td>
                    <td>Quantidade</td>
                    <td>Preço</td>
                  </tr>
                  <tr>
                    <td>
                      <div class="produto">
                        <img src="${produto.imagem}" alt="${produto.nome}" />
                        <label id="nome_produto">${produto.nome}</label>
                      </div>
                    </td>
                    <td>
                      <input id="imput_qnt_${produtoId}" class="imput_qnt" type="number" value="${
            produtoQuantidade[produtoId]
          }" min="0" onchange="atualizarQuantidade(${produtoId}, ${
            produto.preco
          })" />
                    </td>
                    <td>
                      <label id="preco_produto_${produtoId}" class="preco_produto">R$ ${(
            produto.preco * produtoQuantidade[produtoId]
          ).toFixed(2)}</label>
                    </td>
                  </tr>
                </table>`;
        }
      });

      //mostra o total de itens, valor total e os botões
      itens_container.innerHTML += `
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
    } catch (error) {
      console.error(error);
    }
  } else {
    itens_container.innerHTML = "<p>Seu carrinho está vazio.</p>";
  }
}

//calculo para atualizar a quantidade e o preço do produto
function atualizarQuantidade(produtoId, preco) {
  const quantidadeInput = document.getElementById(`imput_qnt_${produtoId}`);
  const quantidade = parseInt(quantidadeInput.value);
  const precoProduto = document.getElementById(`preco_produto_${produtoId}`);
  const totalItensLabel = document.getElementById("total_itens");
  const valorTotalLabel = document.getElementById("valor_total");

  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  let totalItens = 0;
  let valorTotal = 0;

  //remover produto do carrinho
  if (quantidade === 0) {
    if (confirm("Deseja remover este produto do carrinho?")) {
      carrinho = carrinho.filter((id) => id != produtoId);
      localStorage.setItem("carrinho", JSON.stringify(carrinho));
      buscarProdutoPeloLocalStorage();
      return;
    } else {
      quantidadeInput.value = 1;
      return;
    }
  }

  carrinho = carrinho.filter((id) => id != produtoId);
  for (let i = 0; i < quantidade; i++) {
    carrinho.push(produtoId);
  }
  localStorage.setItem("carrinho", JSON.stringify(carrinho));

  carrinho.forEach((id) => {
    totalItens += 1;
    valorTotal += preco;
  });

  precoProduto.textContent = `R$ ${(preco * quantidade).toFixed(2)}`;
  totalItensLabel.textContent = totalItens;
  valorTotalLabel.textContent = `R$ ${valorTotal.toFixed(2)}`;
}

//finaliza o pedido e redireciona para o WhatsApp
function finalizarPedido() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const totalItens = document.getElementById("total_itens").textContent;
  const valorTotal = document.getElementById("valor_total").textContent;

  if (carrinho.length > 0) {
    const itens_container = document.getElementById("itens_container");
    const produtos = itens_container.querySelectorAll(".produto label");
    let listaProdutos = "";

    produtos.forEach((produto, index) => {
      listaProdutos += `${index + 1}. ${produto.textContent}\n`;
    });

    const mensagem = `Olá, segue meu pedido: \n - *Produtos:* \n${listaProdutos} \n - *Total de itens:* ${totalItens} \n - *Valor total:* ${valorTotal} \n \n Desejo conversar e realizar o pagamento. \n Aguardo retorno para finalizar a compra.`;
    const url = `https://api.whatsapp.com/send?phone=5581987133707&text=${encodeURIComponent(
      mensagem
    )}`;
    window.open(url, "_blank");

    setTimeout(() => {
      localStorage.removeItem("carrinho");
      buscarProdutoPeloLocalStorage();
    }, 6000000);
  } else {
    alert("Seu carrinho está vazio.");
  }
}
window.onload = buscarProdutoPeloLocalStorage;
