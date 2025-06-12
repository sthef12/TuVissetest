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

    // Agrupa por id+cor para contar quantidades
    const agrupados = {};
    carrinho.forEach((item) => {
      const key = `${item.id}_${item.cor}`;
      if (!agrupados[key]) agrupados[key] = { ...item, quantidade: 0 };
      agrupados[key].quantidade += 1;
    });

    // Estrutura inicial
    itens_container.innerHTML = `
      <div class="itens_list" style="display: flex; flex-direction: column;">
        <div id="tabela_corpo"></div>
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
        <button class="button" id="continuar" onclick="window.location.href= '../index.html'">Continuar Comprando</button>
      </div>
      <div class="direction">
        <p>Ao clicar no botão “Finalizar produto”, você será redirecionado para o WhatsApp da loja.</p>
      </div>`;

    const tabelaCorpo = document.getElementById("tabela_corpo");

    Object.values(agrupados).forEach((item) => {
      const produto = produtosJson.find((p) => p.id == item.id);
      if (!produto) return;

      totalItens += item.quantidade;
      valorTotal += produto.preco * item.quantidade;

      // Busca cor selecionada
      let corObj = null;
      if (produto.cores && Array.isArray(produto.cores)) {
        corObj = produto.cores.find((cor) => cor.codigoCor === item.cor);
      }
      const corNome = corObj?.nomeCor || "Incolor";
      const corCodigo = corObj?.codigoCor || "#fff";
      const imagemProduto = corObj?.imagemFrente || produto.imagem;

      const produtoTamanho = produto.tamanhos;

      let tamanhos = [];
      if (typeof produtoTamanho === "string") {
        try {
          tamanhos = JSON.parse(produtoTamanho);
          if (!Array.isArray(tamanhos)) {
            tamanhos = [];
          }
        } catch {
          tamanhos = [];
        }
      } else if (Array.isArray(produtoTamanho)) {
        tamanhos = produtoTamanho;
      }

      function mostrarTamanho(){
        
      for( i of tamanhos){
        console.log(i);
        
        
      }
      return i;
      }
      

      tabelaCorpo.innerHTML += `
        <div class="linha_produto">
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
            <label>R$ ${(produto.preco * item.quantidade).toFixed(2)}</label>
          </div>
          <div class="quantidade">
            <div class="input_qnt_container">
              <div class="input_qnt_icon">
                            <i class="fa-solid fa-minus" onclick="alterarQuantidade('${
                              item.id
                            }','${item.cor}',-1,${
        produto.preco
      })" style="cursor:pointer;"></i>
                            <input class="imput_qnt" type="number" value="${
                              item.quantidade
                            }" min="1" onchange="alterarQuantidade('${
        item.id
      }','${item.cor}',0,${produto.preco},this.value)" />
                            <i class="fa-solid fa-plus" onclick="alterarQuantidade('${
                              item.id
                            }','${item.cor}',1,${
        produto.preco
      })" style="cursor:pointer;"></i>
              </div>
              <i class="fa-solid fa-trash" style="cursor:pointer;" onclick="removerProduto('${
                item.id
              }','${item.cor}')"></i>
            </div>
            
          </div>
          <div class="qnt-tam">
            <div class="box-qnt">  
              <div class="tam-item">    
                ${mostrarTamanho()}  
              </div>  <div>    <input id="p" type="number" value="0">  </div></div>
          </div>
        </div>`;
    });

    document.getElementById("total_itens").textContent = totalItens;
    document.getElementById(
      "valor_total"
    ).textContent = `R$ ${valorTotal.toFixed(2)}`;
  } catch (error) {
    console.error(error);
  }
}

// Função para alterar quantidade
function alterarQuantidade(produtoId, cor, delta, preco, valorManual = null) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const key = (item) => item.id == produtoId && item.cor == cor;
  let novaQuantidade = valorManual !== null ? parseInt(valorManual) : null;

  // Remove todos do tipo
  carrinho = carrinho.filter((item) => !key(item));

  // Adiciona de volta a quantidade correta
  if (delta === 0 && novaQuantidade > 0) {
    for (let i = 0; i < novaQuantidade; i++)
      carrinho.push({ id: produtoId, cor });
  } else {
    let atual = (JSON.parse(localStorage.getItem("carrinho")) || []).filter(
      key
    ).length;
    let nova = atual + delta;
    if (nova <= 0) {
      if (confirm("Deseja remover este produto do carrinho?")) {
        // não adiciona de volta
      } else {
        nova = 1;
      }
    }
    for (let i = 0; i < nova; i++) carrinho.push({ id: produtoId, cor });
  }

  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  buscarProdutoPeloLocalStorage();
}

// Função para remover produto específico (id + cor)
function removerProduto(produtoId, cor) {
  if (!confirm("Deseja remover este produto do carrinho?")) return;
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  // Remove todos os itens com o mesmo id e cor
  const novoCarrinho = carrinho.filter(
    (item) => !(item.id == produtoId && item.cor == cor)
  );
  localStorage.setItem("carrinho", JSON.stringify(novoCarrinho));

  // Remove também a cor selecionada do localStorage, se existir
  let coresSelecionadas =
    JSON.parse(localStorage.getItem("coresSelecionadas")) || {};
  if (
    coresSelecionadas[produtoId] &&
    coresSelecionadas[produtoId].codigoCor === cor
  ) {
    delete coresSelecionadas[produtoId];
    localStorage.setItem(
      "coresSelecionadas",
      JSON.stringify(coresSelecionadas)
    );
  }

  // Se o carrinho ficou vazio, remove do localStorage para garantir limpeza total
  if (novoCarrinho.length === 0) {
    localStorage.removeItem("carrinho");
    localStorage.removeItem("coresSelecionadas");
  }

  buscarProdutoPeloLocalStorage();
}

function finalizarPedido() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio. Adicione produtos antes de finalizar.");
    return;
  }

  // Busca os produtos do backend para pegar nome e preço
  fetch("https://tuvissetest.onrender.com/produtos")
    .then((res) => res.json())
    .then((produtosJson) => {
      // Agrupa por id+cor para contar quantidades
      const agrupados = {};
      carrinho.forEach((item) => {
        const key = `${item.id}_${item.cor}`;
        if (!agrupados[key]) agrupados[key] = { ...item, quantidade: 0 };
        agrupados[key].quantidade += 1;
      });

      let totalItens = 0;
      let valorTotal = 0;
      let produtosMsg = "";

      let idx = 1;
      Object.values(agrupados).forEach((item) => {
        const produto = produtosJson.find((p) => p.id == item.id);
        const nomeProduto = produto ? produto.nome : `Produto ID: ${item.id}`;
        let corNome = "Incolor";
        if (produto && produto.cores && Array.isArray(produto.cores)) {
          const corObj = produto.cores.find(
            (cor) => cor.codigoCor === item.cor
          );
          if (corObj && corObj.nomeCor) corNome = corObj.nomeCor;
        }
        produtosMsg += `${idx}. ${nomeProduto} - Cor: ${corNome}\n`;
        totalItens += item.quantidade;
        valorTotal += produto ? produto.preco * item.quantidade : 0;
        idx++;
      });

      const mensagem = `Olá, segue meu pedido: 
 - *Produtos:* 
${produtosMsg}
 - *Total de itens:* ${totalItens} 
 - *Valor total:* R$ ${valorTotal.toFixed(2)} 
 
Desejo conversar e realizar o pagamento. 
Aguardo retorno para finalizar a compra.`;

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
window.onload = buscarProdutoPeloLocalStorage;
