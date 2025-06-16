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

    // Agrupa por id+cor para exibir uma linha por produto/cor
    const agrupados = {};
    carrinho.forEach((item) => {
      const key = `${item.id}_${item.cor}`;
      if (!agrupados[key]) agrupados[key] = { ...item, tamanhos: {} };
      // Soma as quantidades por tamanho
      const tam = item.tamanho || "Tamanho único";
      agrupados[key].tamanhos[tam] =
        (agrupados[key].tamanhos[tam] || 0) +
        (item.quantidade ? item.quantidade : 1);
    });

    // Estrutura inicial
    itens_container.innerHTML = `
      <div class="itens_list" style="display: flex; flex-direction: column;">
        <div id="tabela_corpo" style="display: flex; flex-direction: column; gap: 20px;"></div>
      </div>
      <div class="cont">
        <div class="total_itens">
          <label>Total de Itens:</label>
          <label id="total_itens">0</label>
        </div>
        <div class="valor_total">
          <label>Valor total:</label>
          <label id="valor_total">R$ 0,00</label>
        </div>
      </div>
      <div class="buttons">
        <button class="button" id="finalizar" onclick="finalizarPedido()">Finalizar Pedido</button>
        <button class="button" id="continuar" onclick="window.location.href= 'index.html'">Continuar Comprando</button>
      </div>
      <div class="direction">
        <p>Ao clicar no botão “Finalizar produto”, você será redirecionado para o WhatsApp da loja.</p>
      </div>`;

    const tabelaCorpo = document.getElementById("tabela_corpo");

    Object.values(agrupados).forEach((item) => {
      const produto = produtosJson.find((p) => p.id == item.id);
      if (!produto) return;

      // Soma total de itens desse produto/cor (tamanhos definidos + não definidos)
      const totalPorProduto = Object.values(item.tamanhos).reduce(
        (a, b) => a + b,
        0
      );

      totalItens += totalPorProduto;
      valorTotal += produto.preco * totalPorProduto;

      // Busca cor selecionada
      let corObj = null;
      if (produto.cores && Array.isArray(produto.cores)) {
        corObj = produto.cores.find((cor) => cor.codigoCor === item.cor);
      }
      const corNome = corObj?.nomeCor || "Incolor";
      const corCodigo = corObj?.codigoCor || "#fff";
      const imagemProduto = corObj?.imagemFrente || produto.imagem;

      // Tamanhos disponíveis
      let tamanhos = [];
      if (typeof produto.tamanhos === "string") {
        try {
          tamanhos = JSON.parse(produto.tamanhos);
          if (!Array.isArray(tamanhos)) tamanhos = [];
        } catch {
          tamanhos = [];
        }
      } else if (Array.isArray(produto.tamanhos)) {
        tamanhos = produto.tamanhos;
      }

      // Inputs de tamanhos
      let tamanhosHtml = "";
      if (tamanhos.length > 0) {
        tamanhosHtml = tamanhos
          .map(
            (tam) => `
          <div class="tamanho-carrinho" >
            <span class="badge-tamanho">${tam}</span>
            <input 
              type="number" 
              class="input-qtd-tamanho" 
              min="0" 
              value="${item.tamanhos[tam] || 0}" 
              data-produto="${item.id}" 
              data-cor="${item.cor}" 
              data-tamanho="${tam}"
              style="width:40px;text-align:center;"
            />
          </div>
        `
          )
          .join("");
      } else {
        tamanhosHtml = `
          <div class="tamanho-carrinho" >
            <span class="badge-tamanho">Tamanho único</span>
            <input 
              type="number" 
              class="input-qtd-tamanho" 
              min="0" 
              value="${item.tamanhos["Tamanho único"] || 0}" 
              data-produto="${item.id}" 
              data-cor="${item.cor}" 
              data-tamanho="Tamanho único"
              style="width:40px;text-align:center;"
            />
          </div>
        `;
      }

      tabelaCorpo.innerHTML += `
        <div class="linha_produto" id="produto_${item.id}_${item.cor}_${
        item.tamanho
      }">
          <div class="pro_img">
            <img src="${imagemProduto}" alt="${produto.nome}" />
          </div>
          <div class="nome_produto" style="cursor: pointer;" onclick="window.location.href='../produto.html?id=${
            produto.id
          }'" title="${produto.nome}">
            <label>${produto.nome}</label>
          </div>
          <div class="cor">
            <span class="cor_sele_produto" style="display:inline-block;width:22px;height:22px;border-radius:50%;background:${corCodigo};border:1px solid #888;" title="${corNome}"></span>
            <span style="color:#888;">${corNome}</span>
          </div>
          <div class="preco">
            <label>valor</label>
            <label class="valor-total" data-produto="${item.id}" data-cor="${
        item.cor
      }">R$ ${(produto.preco * totalPorProduto).toFixed(2)}</label>
          </div>
          <div class="quantidade">
            <div class="input_qnt_container">
              <div class="input_qnt_icon">
                <i class="fa-solid fa-minus" onclick="alterarQuantidade('${
                  item.id
                }','${item.cor}',null,-1,${
        produto.preco
      })" style="cursor:pointer;"></i>
                <input class="imput_qnt" type="number" value="${totalPorProduto}" min="1"
                  data-produto="${item.id}" data-cor="${item.cor}"
                  onchange="alterarQuantidade('${item.id}','${
        item.cor
      }',null,0,${produto.preco},this.value)" />
                <i class="fa-solid fa-plus" onclick="alterarQuantidade('${
                  item.id
                }','${item.cor}',null,1,${
        produto.preco
      })" style="cursor:pointer;"></i>
              </div>
              <i class="fa-solid fa-trash" style="cursor:pointer;" onclick="removerProduto('${
                item.id
              }','${item.cor}',null)"></i>
            </div>
          </div>
          <div class="qnt-tam">
            <div class="box-qnt">
              ${tamanhosHtml}
            </div>
          </div>
        </div>`;
    });

    document.getElementById("total_itens").textContent = totalItens;
    document.getElementById(
      "valor_total"
    ).textContent = `R$ ${valorTotal.toFixed(2)}`;

    // Após montar o HTML do carrinho:
    ativarListenersTamanhos(produtosJson);
  } catch (error) {
    console.error(error);
  }
}
// Após renderizar o carrinho, chame esta função:
function ativarListenersTamanhos(produtosJson) {
  document.querySelectorAll(".input-qtd-tamanho").forEach((input) => {
    input.oninput = function () {
      const produtoId = this.getAttribute("data-produto");
      const cor = this.getAttribute("data-cor");
      const tamanho = this.getAttribute("data-tamanho");
      const quantidade = parseInt(this.value, 10) || 0;

      let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

      // Atualiza o localStorage
      carrinho = carrinho.filter(
        (item) =>
          !(item.id == produtoId && item.cor == cor && item.tamanho == tamanho)
      );
      if (quantidade > 0) {
        carrinho.push({ id: produtoId, cor, tamanho, quantidade });
      }
      localStorage.setItem("carrinho", JSON.stringify(carrinho));

      // Soma total de tamanhos desse produto + cor
      let soma = 0;
      document
        .querySelectorAll(
          `.input-qtd-tamanho[data-produto="${produtoId}"][data-cor="${cor}"]`
        )
        .forEach((inp) => {
          soma += parseInt(inp.value, 10) || 0;
        });

      const inputQnt = document.querySelector(
        `.imput_qnt[data-produto="${produtoId}"][data-cor="${cor}"]`
      );
      if (inputQnt) inputQnt.value = soma;

      // Busca preço
      let preco = 0;
      const produto = produtosJson.find((p) => p.id == produtoId);
      if (produto) preco = produto.preco;

      const valorTotalLabel = document.querySelector(
        `.valor-total[data-produto="${produtoId}"][data-cor="${cor}"]`
      );
      if (valorTotalLabel) {
        valorTotalLabel.textContent = `R$ ${(preco * soma).toFixed(2)}`;
      }

      // 🚨 Se soma dos tamanhos = 0, remove o produto inteiro do carrinho e do DOM
      if (soma === 0) {
        const confirmar = confirm("Deseja remover este produto do carrinho?");
        if (confirmar) {
          // Remove todos com id + cor
          carrinho = carrinho.filter(
            (item) => !(item.id == produtoId && item.cor == cor)
          );
          localStorage.setItem("carrinho", JSON.stringify(carrinho));

          const linhas = document.querySelectorAll(
            `[id^="produto_${produtoId}_${cor}"]`
          );
          linhas.forEach((linha) => linha.remove());
        } else {
          // Se não quer remover, seta o input que foi alterado de volta pra 1
          this.value = 1;
          carrinho.push({ id: produtoId, cor, tamanho, quantidade: 1 });
          localStorage.setItem("carrinho", JSON.stringify(carrinho));
          if (inputQnt) inputQnt.value = 1;
          if (valorTotalLabel)
            valorTotalLabel.textContent = `R$ ${(preco * 1).toFixed(2)}`;
        }
      }

      atualizarTotais();

      const carrinhoAtual = JSON.parse(localStorage.getItem("carrinho")) || [];
      if (carrinhoAtual.length === 0) {
        const itens_container = document.getElementById("itens_container");
        itens_container.innerHTML = `
          <p>Seu carrinho está vazio.</p>
          <div class="buttons">
            <button class="button" id="continuar" onclick="window.location.href='index.html'">Continuar Comprando</button>
          </div>
        `;
      }
    };
  });
}

// Função para alterar quantidade
function alterarQuantidade(
  produtoId,
  cor,
  tamanho,
  delta,
  preco,
  valorManual = null
) {
  // Se o usuário tentar adicionar/subtrair pelo input_qnt_icon (tamanho indefinido)
  if (tamanho === null || tamanho === "null" || tamanho === undefined) {
    alert(
      "Por favor, selecione a quantidade desejada diretamente nos campos de tamanho do produto."
    );
    return;
  }

  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  let tamanhoFinal = tamanho;
  const key = (item) =>
    item.id == produtoId && item.cor == cor && item.tamanho == tamanhoFinal;
  let novaQuantidade = valorManual !== null ? parseInt(valorManual) : null;

  // Remove todos do tipo
  carrinho = carrinho.filter((item) => !key(item));

  // Adiciona de volta a quantidade correta
  if (delta === 0 && novaQuantidade > 0) {
    carrinho.push({
      id: produtoId,
      cor,
      tamanho: tamanhoFinal,
      quantidade: novaQuantidade,
    });
  } else {
    let atual = (JSON.parse(localStorage.getItem("carrinho")) || [])
      .filter(key)
      .reduce((acc, item) => acc + (item.quantidade || 1), 0);
    let nova = atual + delta;
    if (nova <= 0) {
      if (confirm("Deseja remover este produto do carrinho?")) {
        removerProduto(produtoId, cor);
      } else {
        nova = 1;
      }
    }
    if (nova > 0) {
      carrinho.push({
        id: produtoId,
        cor,
        tamanho: tamanhoFinal,
        quantidade: nova,
      });
    }
  }

  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  buscarProdutoPeloLocalStorage();
}

// Função para remover produto
function removerProduto(produtoId, cor) {
  if (!confirm("Deseja remover este produto do carrinho?")) return;

  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  // Remove todos os itens com mesmo id e cor
  const novoCarrinho = carrinho.filter(
    (item) => !(item.id == produtoId && item.cor == cor)
  );

  localStorage.setItem("carrinho", JSON.stringify(novoCarrinho));

  // Remove do DOM os elementos correspondentes
  const linhas = document.querySelectorAll(
    `[id^="produto_${produtoId}_${cor}"]`
  );
  linhas.forEach((linha) => linha.remove());

  atualizarTotais();

  // ✅ Se carrinho ficou vazio, exibe mensagem e botão
  if (novoCarrinho.length === 0) {
    const itens_container = document.getElementById("itens_container");
    itens_container.innerHTML = `
      <p>Seu carrinho está vazio.</p>
      <div class="buttons">
        <button class="button" id="continuar" onclick="window.location.href= 'index.html'">Continuar Comprando</button>
      </div>
    `;
  }
}

async function atualizarTotais() {
  const carrinhoAtual = JSON.parse(localStorage.getItem("carrinho")) || [];
  const produtos = await fetch("https://tuvissetest.onrender.com/produtos");
  const produtosJson = await produtos.json();

  let totalItens = 0;
  let valorTotal = 0;

  carrinhoAtual.forEach((item) => {
    const produto = produtosJson.find((p) => p.id == item.id);
    const preco = produto ? produto.preco : 0;

    totalItens += item.quantidade || 1;
    valorTotal += preco * (item.quantidade || 1);
  });

  document.getElementById("total_itens").textContent = totalItens;
  document.getElementById("valor_total").textContent = `R$ ${valorTotal.toFixed(
    2
  )}`;
}

function finalizarPedido() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio. Adicione produtos antes de finalizar.");
    return;
  }

  fetch("https://tuvissetest.onrender.com/produtos")
    .then((res) => res.json())
    .then((produtosJson) => {
      // Agrupa por id+cor para exibir 1 produto/cor por vez
      const agrupados = {};
      carrinho.forEach((item) => {
        const key = `${item.id}_${item.cor}`;
        if (!agrupados[key]) agrupados[key] = { ...item, tamanhos: {} };
        const tam = item.tamanho || "Não definido";
        agrupados[key].tamanhos[tam] =
          (agrupados[key].tamanhos[tam] || 0) +
          (item.quantidade ? item.quantidade : 1);
      });

      let totalItens = 0;
      let valorTotal = 0;
      let produtosMsg = "";
      let idx = 1;

      Object.values(agrupados).forEach((item) => {
        const produto = produtosJson.find((p) => p.id == item.id);
        const nomeProduto = produto ? produto.nome : `Produto ID: ${item.id}`;
        let corNome = item.nomeCor || "Incolor";
        if (
          !corNome &&
          produto &&
          produto.cores &&
          Array.isArray(produto.cores)
        ) {
          const corObj = produto.cores.find(
            (cor) => cor.codigoCor === item.cor
          );
          if (corObj && corObj.nomeCor) corNome = corObj.nomeCor;
        }

        // Soma total de itens desse produto/cor (apenas tamanhos definidos)
        let totalPorProduto = 0;
        let tamanhosMsg = "";
        Object.entries(item.tamanhos).forEach(([tam, qtd]) => {
          if (tam !== "Não definido" && qtd > 0) {
            tamanhosMsg += `- ${tam}: ${qtd}\n`;
            totalPorProduto += qtd;
          }
        });

        if (totalPorProduto > 0) {
          totalItens += totalPorProduto;
          valorTotal += produto ? produto.preco * totalPorProduto : 0;
          produtosMsg += `${idx}. ${nomeProduto} \nQuantitade: ${totalPorProduto}\nCor: ${corNome}\nTamanhos:\n${tamanhosMsg}\n\n`;
          idx++;
        }
      });

      const mensagem = `Olá! Segue meu pedido: 
*- Produtos:*
${produtosMsg}
*- Total de itens: ${totalItens} *
*- Valor total: R$ ${valorTotal.toFixed(2)} *

Desejo conversar e combinar sobre o pagamento. 
Aguardo retorno para poder finalizar a compra.`;

      const urlWhatsApp = `https://api.whatsapp.com/send?phone=5581988841669&text=${encodeURIComponent(
        mensagem
      )}`;
      window.open(urlWhatsApp, "_blank");

      // Timer de 5 minutos para apagar o carrinho após o pedido
      setTimeout(() => {
        localStorage.removeItem("carrinho");
        localStorage.removeItem("coresSelecionadas");
        buscarProdutoPeloLocalStorage();
      }, 5 * 60 * 1000); // 5 minutos
    });
}

window.onload = () => {
  buscarProdutoPeloLocalStorage();
  ativarListenersTamanhos(); // Só uma vez após renderizar!
};
