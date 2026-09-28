const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
if(!document.querySelector('link[data-mobile-nav]')){const l=document.createElement('link');l.rel='stylesheet';l.href='mobile.css';l.dataset.mobileNav='true';document.head.appendChild(l);}
const money = v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);

const state = {
  cart: JSON.parse(localStorage.getItem('gabs_cart') || '[]'),
  favorites: JSON.parse(localStorage.getItem('gabs_favorites') || '[]')
};

function saveState(){
  localStorage.setItem('gabs_cart', JSON.stringify(state.cart));
  localStorage.setItem('gabs_favorites', JSON.stringify(state.favorites));
  updateBadges();
}

function updateBadges(){
  const cartQty = state.cart.reduce((n,i)=>n+i.qty,0);
  $$('.cart-badge').forEach(el => el.textContent = cartQty);
  $$('.wish-badge').forEach(el => el.textContent = state.favorites.length);
}

function icon(name){
  const paths={
    search:'<circle cx="11" cy="11" r="7"></circle><path d="m20 20-4.2-4.2"></path>',
    user:'<circle cx="12" cy="8" r="4"></circle><path d="M4.5 21a7.5 7.5 0 0 1 15 0"></path>',
    heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"></path>',
    bag:'<path d="M5 8h14l-1 13H6L5 8z"></path><path d="M9 10V6a3 3 0 0 1 6 0v4"></path>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"></path>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
}

function productCard(p){
  const fav=state.favorites.includes(p.slug);
  return `<article class="product-card" data-slug="${p.slug}">
    <div class="product-media">
      <a href="produto.html?slug=${p.slug}" aria-label="Ver ${p.name}">
        <img class="primary" src="${p.image}" alt="${p.name}" loading="lazy">
        <img class="secondary" src="${p.image2}" alt="${p.name} em outro ângulo" loading="lazy">
      </a>
      <button class="wish ${fav?'active':''}" type="button" data-favorite="${p.slug}" aria-label="Favoritar ${p.name}">${icon('heart')}</button>
    </div>
    <div class="product-info">
      <div class="product-row">
        <div><a href="produto.html?slug=${p.slug}"><h3 class="product-name">${p.name}</h3></a><div class="fit">${p.fit}</div></div>
        <div><div class="price">${money(p.price)}</div><div class="installments">ou 6x de ${money(p.price/6)}</div></div>
      </div>
      <div class="swatches" aria-label="Cores disponíveis">${p.colors.slice(0,5).map((c,i)=>`<button class="swatch ${i===0?'active':''}" style="--swatch:${c[1]}" title="${c[0]}"></button>`).join('')}</div>
    </div>
  </article>`;
}

function renderBestSellers(){
  const el=$('#best-sellers'); if(!el) return;
  el.innerHTML=window.GABS_PRODUCTS.slice(0,6).map(productCard).join('');
}

function toggleFavorite(slug){
  const i=state.favorites.indexOf(slug);
  if(i>=0) state.favorites.splice(i,1); else state.favorites.push(slug);
  saveState();
  $$(`[data-favorite="${slug}"]`).forEach(b=>b.classList.toggle('active', state.favorites.includes(slug)));
}

function addToCart(slug,size,color){
  if(!size){ alert('Escolha um tamanho antes de adicionar à sacola.'); return false; }
  const p=window.GABS_PRODUCTS.find(x=>x.slug===slug); if(!p) return false;
  const key=`${slug}-${size}-${color}`;
  const item=state.cart.find(i=>i.key===key);
  if(item) item.qty+=1; else state.cart.push({key,slug,size,color,qty:1});
  saveState(); renderCart(); openCart(); return true;
}

function renderCart(){
  const items=$('#cart-items'); const foot=$('#cart-foot'); if(!items) return;
  if(!state.cart.length){ items.innerHTML='<div class="empty-cart"><div><p class="serif" style="font-size:34px;margin:0 0 8px">Sua sacola está vazia.</p><p>Quando encontrar um scrub que goste, ele aparece aqui.</p></div></div>'; if(foot) foot.style.display='none'; return; }
  if(foot) foot.style.display='block';
  items.innerHTML=state.cart.map(i=>{ const p=window.GABS_PRODUCTS.find(x=>x.slug===i.slug); return `<div class="cart-item">
    <div class="cart-thumb"><img src="${p.image}" alt="${p.name}"></div>
    <div class="cart-meta"><strong>${p.name}</strong><span>${i.color} • ${i.size}</span><span>${money(p.price)}</span>
      <div class="qty"><button data-qty="-1" data-key="${i.key}">−</button><span>${i.qty}</span><button data-qty="1" data-key="${i.key}">+</button></div>
      <button class="remove" data-remove="${i.key}">Remover</button>
    </div><div>${money(p.price*i.qty)}</div></div>`; }).join('');
  const total=state.cart.reduce((sum,i)=>{const p=window.GABS_PRODUCTS.find(x=>x.slug===i.slug); return sum+p.price*i.qty;},0);
  const subtotal=$('#cart-subtotal'); if(subtotal) subtotal.textContent=money(total);
  const prog=Math.min(100,(total/399)*100); const bar=$('#freight-progress'); if(bar) bar.style.width=`${prog}%`;
  const copy=$('#freight-copy'); if(copy) copy.textContent= total>=399 ? 'Seu pedido entrou na faixa de frete grátis desta prévia.' : `Faltam ${money(399-total)} para o frete grátis.`;
}

function lockMobileLayer(){ document.body.classList.add('mobile-layer-open'); document.body.style.overflow='hidden'; }
function unlockMobileLayer(){
  const layerOpen = $('#cart-overlay')?.classList.contains('open') || $('#search-panel')?.classList.contains('open') || $('#mobile-menu')?.classList.contains('open') || $('.filters')?.classList.contains('mobile-open') || $('#size-modal')?.classList.contains('open');
  if(!layerOpen){ document.body.classList.remove('mobile-layer-open'); document.body.style.overflow=''; }
}
function openCart(){ $('#cart-overlay')?.classList.add('open'); lockMobileLayer(); }
function closeCart(){ $('#cart-overlay')?.classList.remove('open'); unlockMobileLayer(); }
function openSearch(){ $('#search-panel')?.classList.add('open'); lockMobileLayer(); setTimeout(()=>$('#search-input')?.focus(),80); renderSearch(''); }
function closeSearch(){ $('#search-panel')?.classList.remove('open'); unlockMobileLayer(); }

function prepareMobileMenu(){
  const menu=$('#mobile-menu'); const open=$('#mobile-menu-open'); if(!menu||!open) return;
  open.setAttribute('aria-controls','mobile-menu'); open.setAttribute('aria-expanded','false');
  menu.setAttribute('role','dialog'); menu.setAttribute('aria-modal','true'); menu.setAttribute('aria-label','Menu principal'); menu.setAttribute('aria-hidden','true');
  menu.innerHTML=`<div class="mobile-drawer-head"><a class="logo" href="index.html"><span class="logo-mark">G</span><span class="logo-word">GABS SCRUBS</span></a><button class="drawer-close" id="mobile-menu-close" type="button" aria-label="Fechar menu">×</button></div><nav class="mobile-menu-primary" aria-label="Categorias"><a href="feminino.html">Novidades</a><a href="feminino.html">Feminino</a><a href="masculino.html">Masculino</a><a href="index.html#conjuntos">Conjuntos</a><a href="index.html#cores">Cores</a><a href="index.html#mais-usados">Mais vendidos</a></nav><div class="mobile-menu-meta"><button class="mobile-menu-search" type="button">Buscar produtos <span>→</span></button><a href="index.html#manifesto">Sobre a Gabs <span>→</span></a></div>`;
}
function openMobileMenu(){
  const menu=$('#mobile-menu'); const trigger=$('#mobile-menu-open'); if(!menu) return;
  menu.classList.add('open'); menu.setAttribute('aria-hidden','false'); trigger?.setAttribute('aria-expanded','true'); lockMobileLayer();
  setTimeout(()=>$('#mobile-menu-close')?.focus(),40);
}
function closeMobileMenu(){
  const menu=$('#mobile-menu'); const trigger=$('#mobile-menu-open'); if(!menu) return;
  menu.classList.remove('open'); menu.setAttribute('aria-hidden','true'); trigger?.setAttribute('aria-expanded','false'); unlockMobileLayer();
}

function prepareFilterDrawer(){
  const filters=$('.filters'); const trigger=$('.filter-open'); if(!filters||!trigger) return;
  trigger.setAttribute('aria-controls','mobile-filters'); trigger.setAttribute('aria-expanded','false'); filters.id='mobile-filters'; filters.setAttribute('aria-hidden','true');
  if(!$('.filter-drawer-head',filters)) filters.insertAdjacentHTML('afterbegin','<div class="filter-drawer-head"><strong>Filtros</strong><button type="button" class="filter-close" aria-label="Fechar filtros">×</button></div>');
  if(!$('#filter-scrim')) document.body.insertAdjacentHTML('beforeend','<div class="filter-scrim" id="filter-scrim" aria-hidden="true"></div>');
}
function openFilters(){
  if(!matchMedia('(max-width:820px)').matches) return;
  const filters=$('.filters'); const trigger=$('.filter-open'); const scrim=$('#filter-scrim'); if(!filters) return;
  filters.classList.add('mobile-open'); filters.setAttribute('aria-hidden','false'); trigger?.setAttribute('aria-expanded','true'); scrim?.classList.add('open'); lockMobileLayer();
  setTimeout(()=>$('.filter-close',filters)?.focus(),40);
}
function closeFilters(){
  const filters=$('.filters'); const trigger=$('.filter-open'); const scrim=$('#filter-scrim'); if(!filters) return;
  filters.classList.remove('mobile-open'); filters.setAttribute('aria-hidden','true'); trigger?.setAttribute('aria-expanded','false'); scrim?.classList.remove('open'); unlockMobileLayer();
}

function renderSearch(q=''){
  const el=$('#search-results'); if(!el) return;
  const query=q.trim().toLowerCase();
  let ps=window.GABS_PRODUCTS;
  if(query) ps=ps.filter(p=>[p.name,p.fit,p.gender,p.category,...p.colors.map(c=>c[0])].join(' ').toLowerCase().includes(query));
  ps=ps.slice(0,6);
  el.innerHTML=ps.length?ps.map(p=>`<a class="search-result" href="produto.html?slug=${p.slug}"><img src="${p.image}" alt=""><div><strong>${p.name}</strong><span>${p.fit}</span></div><span>${money(p.price)}</span></a>`).join(''):'<p style="color:var(--muted)">Não achei nenhum produto com esse termo.</p>';
}

function renderCollection(){
  const grid=$('#collection-grid'); if(!grid) return;
  const pageGender=document.body.dataset.gender || 'all';
  const checkedCats=$$('input[name="category"]:checked').map(i=>i.value);
  const checkedFits=$$('input[name="fit"]:checked').map(i=>i.value);
  const selectedColor=$('.filter-colors .swatch.active')?.dataset.color || '';
  let ps=window.GABS_PRODUCTS.filter(p=>pageGender==='all'||p.gender===pageGender||p.gender==='unissex');
  if(checkedCats.length) ps=ps.filter(p=>checkedCats.includes(p.category));
  if(checkedFits.length) ps=ps.filter(p=>checkedFits.includes(p.fit));
  if(selectedColor) ps=ps.filter(p=>p.colors.some(c=>c[0]===selectedColor));
  const sort=$('#sort')?.value;
  if(sort==='price-asc') ps.sort((a,b)=>a.price-b.price);
  if(sort==='price-desc') ps.sort((a,b)=>b.price-a.price);
  if(sort==='new') ps=ps.reverse();
  grid.innerHTML=ps.map(productCard).join('');
  $('#result-count').textContent=`${ps.length} produtos`;
}

function renderPDP(){
  const root=$('#pdp-root'); if(!root) return;
  const slug=new URLSearchParams(location.search).get('slug') || window.GABS_PRODUCTS[0].slug;
  const p=window.GABS_PRODUCTS.find(x=>x.slug===slug) || window.GABS_PRODUCTS[0];
  document.title=`${p.name} | Gabs Scrubs`;
  const gallery=[p.image,p.image2,p.image,p.image2];
  root.innerHTML=`<div class="container"><div class="breadcrumb"><a href="index.html">Início</a> / <a href="${p.gender==='masculino'?'masculino.html':'feminino.html'}">${p.gender==='masculino'?'Masculino':'Feminino'}</a> / ${p.name}</div>
  <div class="pdp"><div class="gallery">${gallery.map((img,i)=>`<figure><img src="${img}" alt="${p.name}${i?` — detalhe ${i+1}`:''}"></figure>`).join('')}</div>
  <aside class="purchase-panel" data-pdp="${p.slug}">
    <h1 class="pdp-title">${p.name}</h1><div class="pdp-fit">${p.fit}</div>
    <div class="rating"><span>☆☆☆☆☆</span><span>Ainda sem avaliações de clientes</span></div>
    <div class="pdp-price">${money(p.price)}</div><div class="pdp-installments">ou 6x de ${money(p.price/6)}</div>
    <div class="option-block"><div class="option-head"><strong id="selected-color-label">Cor: ${p.colors[0][0]}</strong></div><div class="pdp-swatches">${p.colors.map((c,i)=>`<button style="--swatch:${c[1]}" data-pdp-color="${c[0]}" class="${i===0?'active':''}" title="${c[0]}"></button>`).join('')}</div></div>
    <div class="option-block"><div class="option-head"><strong>Tamanho</strong><button type="button" id="size-guide-open">Ver guia de medidas</button></div><div class="sizes">${p.sizes.map(s=>`<button class="size-btn" data-size="${s}">${s}</button>`).join('')}</div></div>
    <div style="margin-top:22px"><button class="btn full" id="pdp-add">Adicionar à sacola</button></div>
    <div class="option-block"><div class="option-head"><strong>Calcular entrega</strong></div><div class="shipping-box"><input id="cep" inputmode="numeric" maxlength="9" placeholder="00000-000" aria-label="CEP"><button id="cep-btn" type="button">Calcular</button></div><div class="shipping-note" id="shipping-note"></div></div>
    <div class="accordion"><details open><summary>Descrição <span>+</span></summary><p>${p.description}</p></details><details><summary>Tecido <span>+</span></summary><p>${p.fabric}</p></details><details><summary>Detalhes e modelagem <span>+</span></summary><p>${p.details}</p></details><details><summary>Cuidados <span>+</span></summary><p>Lave do avesso, com cores parecidas, em ciclo delicado. Evite alvejante e prefira secagem natural.</p></details><details><summary>Entrega e devoluções <span>+</span></summary><p>Frete, prazo e regras de devolução serão definidos na configuração final da loja.</p></details></div>
  </aside></div></div>`;

  let size=''; let color=p.colors[0][0];
  $$('.size-btn',root).forEach(b=>b.addEventListener('click',()=>{$$('.size-btn',root).forEach(x=>x.classList.remove('active')); b.classList.add('active'); size=b.dataset.size;}));
  $$('[data-pdp-color]',root).forEach(b=>b.addEventListener('click',()=>{$$('[data-pdp-color]',root).forEach(x=>x.classList.remove('active')); b.classList.add('active'); color=b.dataset.pdpColor; $('#selected-color-label').textContent=`Cor: ${color}`;}));
  $('#pdp-add')?.addEventListener('click',()=>addToCart(p.slug,size,color));
  $('#mobile-pdp-add')?.addEventListener('click',()=>addToCart(p.slug,size,color));
  $('#size-guide-open')?.addEventListener('click',()=>{$('#size-modal')?.classList.add('open');lockMobileLayer();});
  $('#cep')?.addEventListener('input',e=>{let v=e.target.value.replace(/\D/g,'').slice(0,8); if(v.length>5)v=v.slice(0,5)+'-'+v.slice(5);e.target.value=v;});
  $('#cep-btn')?.addEventListener('click',async()=>{
    const cep=$('#cep').value.replace(/\D/g,''); const note=$('#shipping-note');
    if(cep.length!==8){note.textContent='Digite um CEP com 8 números.'; return;}
    note.textContent='Conferindo o CEP…';
    try{ const r=await fetch(`https://viacep.com.br/ws/${cep}/json/`); const data=await r.json(); if(data.erro) throw new Error(); note.textContent=`${data.localidade}/${data.uf}. O valor do frete aparece aqui quando a transportadora estiver conectada.`; }
    catch{ note.textContent='Não consegui consultar esse CEP agora. Tente novamente em instantes.'; }
  });
}

function renderCheckout(){
  const list=$('#checkout-items'); if(!list) return;
  if(!state.cart.length){ list.innerHTML='<p>Sua sacola está vazia.</p>'; return; }
  let total=0;
  list.innerHTML=state.cart.map(i=>{const p=window.GABS_PRODUCTS.find(x=>x.slug===i.slug); total+=p.price*i.qty; return `<div class="cart-item"><div class="cart-thumb"><img src="${p.image}" alt=""></div><div class="cart-meta"><strong>${p.name}</strong><span>${i.color} • ${i.size} • Qtd. ${i.qty}</span></div><div>${money(p.price*i.qty)}</div></div>`}).join('');
  $('#checkout-total').textContent=money(total);
}

function applyHumanCopy(){
  const products={
    'gabs-one-feminino':{
      description:'Um conjunto mais ajustado ao corpo, sem ficar preso. Funciona bem para quem passa o dia entre atendimento, corredor e consultório.',
      fabric:'Tecido leve, com elasticidade em várias direções, toque macio e secagem rápida.',
      details:'Top de linhas limpas com bolsos funcionais. Calça com cintura confortável e bolsos de acesso fácil.'
    },
    'gabs-move-feminino':{
      description:'Tem mais espaço no corpo e continua com bom caimento. É a opção para quem gosta de roupa solta, mas não quer aparência larga demais.',
      fabric:'Tecido respirável, com elasticidade em quatro direções e fácil de cuidar no dia a dia.',
      details:'Top levemente solto e calça reta com cós flexível.'
    },
    'gabs-core-masculino':{
      description:'Corte reto, confortável e fácil de usar por muitas horas. A proposta é vestir bem sem precisar ficar ajeitando a roupa durante o dia.',
      fabric:'Tecido de toque seco, respirável e pensado para uso frequente.',
      details:'Top reto com bolsos discretos. Calça straight com cós ajustável e bolsos funcionais.'
    },
    'gabs-studio-feminino':{
      description:'Uma versão mais alinhada do scrub clássico, com linhas alongadas e um caimento que funciona bem dentro e fora do consultório.',
      fabric:'Poliamida de toque suave, com elasticidade e boa recuperação de forma.',
      details:'Recortes discretos e bolsos integrados ao desenho da peça.'
    },
    'gabs-essential-jaleco':{
      description:'Jaleco com corte de alfaiataria leve, feito para ficar alinhado sem aquela sensação de peça dura ou pesada.',
      fabric:'Tecido encorpado na medida, macio e fácil de cuidar.',
      details:'Gola limpa, bolsos amplos e comprimento pensado para diferentes rotinas de atendimento.'
    },
    'gabs-shift-feminino':{
      description:'Modelagem mais próxima do corpo, com espaço para se movimentar sem repuxar ao sentar, andar ou levantar os braços.',
      fabric:'Tecido stretch respirável, de toque frio e secagem rápida.',
      details:'Top slim com recorte lateral e calça de cintura média.'
    },
    'gabs-core-masculino-forest':{
      description:'Uma versão mais solta do Core, com volume controlado e visual casual. Boa para quem não gosta de scrub muito ajustado.',
      fabric:'Tecido flexível, resistente e simples de manter na rotina.',
      details:'Top relaxed e calça reta com bolsos funcionais.'
    },
    'gabs-one-sky':{
      description:'O corte slim da linha One em um azul claro que sai do preto e marinho sem chamar atenção demais.',
      fabric:'Tecido leve, respirável e elástico em várias direções.',
      details:'Modelagem slim com bolsos bem posicionados e acabamento limpo.'
    }
  };
  window.GABS_PRODUCTS?.forEach(p=>Object.assign(p,products[p.slug]||{}));

  const announcement=$('.announcement');
  if(announcement) announcement.textContent=location.pathname.endsWith('checkout.html') ? 'PRÉVIA DA LOJA • pagamentos ainda não estão habilitados' : 'PRÉVIA DA LOJA • catálogo, estoque e pagamentos ainda serão conectados';

  const path=location.pathname;
  const home=path.endsWith('index.html') || /gabs-scrubs\/?$/.test(path);
  if(home){
    const hero=$('.hero-marquee-copy');
    if(hero){
      $('.eyebrow',hero).textContent='Gabs Scrubs';
      $('h1',hero).textContent='Scrubs que vestem bem o plantão inteiro.';
      $('p',hero).textContent='Modelagens confortáveis, bolsos onde fazem sentido e cores que saem do básico. Para consultório, clínica, hospital e tudo que cabe no seu dia.';
    }
    const sections=$$('main .section');
    const category=$('#conjuntos');
    if(category){
      $('.eyebrow',category).textContent='Escolha por categoria';
      $('.section-title',category).textContent='Comece pelo que você usa mais.';
      $('.section-kicker',category).textContent='Tem quem prefira um corte mais ajustado. Tem quem queira mais espaço para se mover. E tem dia em que a cor decide tudo.';
    }
    const best=$('#mais-usados');
    if(best){
      $('.eyebrow',best).textContent='Seleção Gabs';
      $('.section-title',best).textContent='Alguns bons lugares para começar.';
    }
    const colors=$('#cores');
    if(colors){
      $('.eyebrow',colors).textContent='Escolha pela cor';
      $('.section-title',colors).textContent='Qual cor vai pro plantão hoje?';
      $('.section-kicker',colors).textContent='Preto e marinho resolvem quase tudo. Verde, vinho e tons claros mudam completamente o visual. Escolha uma família e veja os modelos.';
    }
    const editorial=$('.editorial-copy');
    if(editorial){
      $('.eyebrow',editorial).textContent='Gabs Scrubs';
      $('h2',editorial).textContent='Roupa de trabalho também precisa vestir bem.';
      $('p',editorial).textContent='Se aperta ao sentar, falta bolso ou o tecido incomoda depois de horas, não adianta ser bonito. A Gabs parte da rotina de atendimento para pensar caimento, mobilidade e acabamento.';
    }
    const look=$('.look-copy');
    if(look){
      $('.eyebrow',look).textContent='Look completo';
      $('h2',look).innerHTML='Um conjunto pronto<br>para o dia todo.';
      $('.btn',look).textContent='Ver o conjunto';
    }
    const tech=$('.tech-copy');
    if(tech){
      $('.eyebrow',tech).textContent='No uso de verdade';
      $('h2',tech).textContent='Conforto aparece nos detalhes.';
      const texts=[
        ['Mobilidade','Espaço para agachar, sentar, caminhar e levantar os braços sem ficar ajeitando a roupa.'],
        ['Respirabilidade','Tecido leve para horas de uso, inclusive nos dias mais quentes.'],
        ['Modelagem','Caimento definido sem travar o movimento.'],
        ['Bolsos','Espaço para o que precisa ficar à mão durante o atendimento.'],
        ['Cuidado simples','Peças pensadas para uma rotina de lavagem frequente sem complicação.']
      ];
      $$('.tech-item',tech).forEach((item,i)=>{if(texts[i]){$('strong',item).textContent=texts[i][0];$('span',item).textContent=texts[i][1];}});
    }
    const professionTitle=$('.professions')?.closest('.section')?.querySelector('.section-title');
    if(professionTitle) professionTitle.textContent='Cada rotina pede uma coisa diferente do scrub.';
    const review=$('.review-strip');
    if(review){
      $('.review-side h2',review).innerHTML='Avaliações de<br>quem comprou.';
      $('.empty-proof h3',review).textContent='As avaliações aparecem aqui quando os primeiros pedidos reais forem concluídos.';
      $('.empty-proof p',review).textContent='Não colocamos depoimento de teste no ar. Quando houver compra verificada, a nota e o comentário entram nesta área.';
    }
    const manifesto=$('#manifesto p'); if(manifesto) manifesto.textContent='Scrub é roupa de trabalho. Ainda assim, continua sendo roupa.';
    const insta=$('.instagram-grid')?.closest('.section');
    if(insta){const title=$('.section-title',insta);if(title)title.textContent='A Gabs fora do site.';}
    const newsletter=$('.newsletter');
    if(newsletter){
      $('.eyebrow',newsletter).textContent='Lista Gabs';
      $('h2',newsletter).textContent='Quer saber das próximas cores?';
      $('p',newsletter).textContent='Deixe seu e-mail para receber lançamentos e reposições quando a lista estiver ativa.';
      $('.newsletter-form button',newsletter).textContent='Quero receber novidades →';
    }
  }

  if(document.body.dataset.gender==='feminino'){
    const hero=$('.page-hero');
    if(hero){$('.eyebrow',hero).textContent='Coleção feminina';$('h1',hero).textContent='Scrubs femininos';$('p',hero).textContent='Do slim ao relaxed, com cores que funcionam no consultório e fora dele. Filtre por modelagem, categoria ou cor e vá direto ao que procura.';}
  }
  if(document.body.dataset.gender==='masculino'){
    const hero=$('.page-hero');
    if(hero){$('.eyebrow',hero).textContent='Coleção masculina';$('h1',hero).textContent='Scrubs masculinos';$('p',hero).textContent='Modelagens retas ou mais soltas, bolsos funcionais e peças feitas para horas de uso. Filtre por cor, corte ou categoria.';}
  }

  if(path.endsWith('produto.html')){
    const modal=$('#size-modal .modal-box');
    if(modal){
      const notes=$$('p',modal);
      if(notes[0]) notes[0].textContent='As medidas abaixo ainda são de referência e serão trocadas pela tabela oficial da Gabs antes da abertura da loja.';
      if(notes[1]) notes[1].textContent='Referência visual desta prévia: modelo com 1,72 m veste P.';
    }
  }

  if(path.endsWith('checkout.html')){
    const note=$('.staging-note');
    if(note) note.innerHTML='<strong>Pagamento ainda não está ativo.</strong><br>Esta página serve para revisar a experiência de compra. Nenhuma cobrança, pedido ou PIX é criado nesta prévia.';
    const payButton=$('.checkout-form .btn.full'); if(payButton) payButton.textContent='Pagamento indisponível nesta prévia';
    const summary=$('.checkout-summary h2'); if(summary) summary.textContent='O que está na sacola';
  }
}

function bindGlobal(){
  document.addEventListener('click',e=>{
    const fav=e.target.closest('[data-favorite]'); if(fav){e.preventDefault(); toggleFavorite(fav.dataset.favorite);}
    const qty=e.target.closest('[data-qty]'); if(qty){const it=state.cart.find(i=>i.key===qty.dataset.key); if(it){it.qty=Math.max(1,it.qty+Number(qty.dataset.qty)); saveState(); renderCart();}}
    const rm=e.target.closest('[data-remove]'); if(rm){state.cart=state.cart.filter(i=>i.key!==rm.dataset.remove); saveState(); renderCart();}
  });
  $$('.cart-open').forEach(b=>b.addEventListener('click',openCart));
  $('#cart-close')?.addEventListener('click',closeCart); $('#cart-overlay')?.addEventListener('click',e=>{if(e.target.id==='cart-overlay') closeCart();});
  $$('.search-open').forEach(b=>b.addEventListener('click',openSearch)); $('#search-close')?.addEventListener('click',closeSearch); $('#search-input')?.addEventListener('input',e=>renderSearch(e.target.value));
  prepareMobileMenu(); prepareFilterDrawer();
  $('#mobile-menu-open')?.addEventListener('click',openMobileMenu); $('#mobile-menu-close')?.addEventListener('click',closeMobileMenu);
  $('#mobile-menu')?.addEventListener('click',e=>{if(e.target.closest('a')) closeMobileMenu(); if(e.target.closest('.mobile-menu-search')){closeMobileMenu(); setTimeout(openSearch,40);}});
  $('.filter-open')?.addEventListener('click',openFilters); $('.filter-close')?.addEventListener('click',closeFilters); $('#filter-scrim')?.addEventListener('click',closeFilters);
  document.addEventListener('keydown',e=>{if(e.key!=='Escape') return; closeMobileMenu(); closeFilters(); closeSearch(); closeCart(); $('#size-modal')?.classList.remove('open'); unlockMobileLayer();});
  window.addEventListener('resize',()=>{if(innerWidth>820){closeMobileMenu();closeFilters();}});
  $('#newsletter-form')?.addEventListener('submit',e=>{e.preventDefault(); const email=$('#newsletter-email').value.trim(); if(!email) return; localStorage.setItem('gabs_newsletter_preview',email); $('#newsletter-note').textContent='E-mail salvo nesta prévia. Na loja final, ele entra na lista da Gabs.'; e.target.reset();});
  $('#size-modal-close')?.addEventListener('click',()=>{$('#size-modal')?.classList.remove('open');unlockMobileLayer();});
  $('#size-modal')?.addEventListener('click',e=>{if(e.target.id==='size-modal'){e.currentTarget.classList.remove('open');unlockMobileLayer();}});
  $('#checkout-btn')?.addEventListener('click',()=>location.href='checkout.html');
  $$('input[name="category"], input[name="fit"]').forEach(i=>i.addEventListener('change',renderCollection)); $('#sort')?.addEventListener('change',renderCollection);
  $$('.filter-colors .swatch').forEach(b=>b.addEventListener('click',()=>{const active=b.classList.contains('active'); $$('.filter-colors .swatch').forEach(x=>x.classList.remove('active')); if(!active)b.classList.add('active'); renderCollection();}));
  $$('[data-color-family]').forEach(b=>b.addEventListener('click',()=>{location.href=`feminino.html?color=${encodeURIComponent(b.dataset.colorFamily)}`;}));
}

function applyCollectionQuery(){
  const q=new URLSearchParams(location.search); const c=q.get('color'); if(!c) return; const b=$(`.filter-colors .swatch[data-color="${c}"]`); if(b) b.classList.add('active');
}

window.addEventListener('DOMContentLoaded',()=>{
  applyHumanCopy(); renderBestSellers(); applyCollectionQuery(); renderCollection(); renderPDP(); renderCart(); renderCheckout(); updateBadges(); bindGlobal();
});
