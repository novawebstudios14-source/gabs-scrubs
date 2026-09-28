const GABS_PRODUCTS = [
  {
    slug:'gabs-one-feminino', name:'Gabs One — Feminino', fit:'Modelagem Slim', gender:'feminino', category:'scrubs', price:289,
    colors:[['Verde Sálvia','#82907b'],['Preto','#171717'],['Vinho','#6d2634'],['Areia','#c3ad8b']], sizes:['PP','P','M','G','GG'],
    image:'https://images.unsplash.com/photo-1666887360684-8082fc98ebd2?auto=format&fit=crop&q=82&w=1200',
    image2:'https://images.unsplash.com/photo-1765896387398-1e1ae8d2eb85?auto=format&fit=crop&q=82&w=1200',
    description:'Conjunto de linhas limpas, caimento preciso e mobilidade para uma rotina que exige presença do começo ao fim.',
    fabric:'Tecido leve com elasticidade multidirecional, toque macio e secagem rápida.',
    details:'Top com decote limpo e bolsos funcionais. Calça com cintura confortável e bolsos de acesso rápido.'
  },
  {
    slug:'gabs-move-feminino', name:'Gabs Move — Feminino', fit:'Modelagem Relaxed', gender:'feminino', category:'conjuntos', price:309,
    colors:[['Chocolate','#5e493d'],['Rose','#b98f91'],['Marinho','#233244'],['Stone','#aaa59d']], sizes:['PP','P','M','G','GG'],
    image:'https://images.unsplash.com/photo-1765896387398-1e1ae8d2eb85?auto=format&fit=crop&q=82&w=1200',
    image2:'https://images.unsplash.com/photo-1666887360684-8082fc98ebd2?auto=format&fit=crop&q=82&w=1200',
    description:'Mais espaço para movimento, sem perder estrutura. Feito para quem prefere um visual contemporâneo e confortável.',
    fabric:'Construção respirável, elasticidade em quatro direções e acabamento de baixa manutenção.',
    details:'Top levemente solto. Calça reta com cós flexível e acabamento minimalista.'
  },
  {
    slug:'gabs-core-masculino', name:'Gabs Core — Masculino', fit:'Modelagem Straight', gender:'masculino', category:'scrubs', price:299,
    colors:[['Marinho','#233244'],['Preto','#171717'],['Forest','#314b3d'],['Stone','#aaa59d']], sizes:['P','M','G','GG'],
    image:'https://images.unsplash.com/photo-1642976482503-3f67b345dbac?auto=format&fit=crop&q=82&w=1200',
    image2:'https://images.unsplash.com/photo-1769072610024-5b8a50f05c73?auto=format&fit=crop&q=82&w=1200',
    description:'Estrutura limpa e confortável com proporções pensadas para uso prolongado e mobilidade.',
    fabric:'Tecido técnico de toque seco, respirável e resistente ao uso diário.',
    details:'Top reto com bolsos discretos. Calça straight com cós ajustável e bolsos funcionais.'
  },
  {
    slug:'gabs-studio-feminino', name:'Gabs Studio — Feminino', fit:'Modelagem Straight', gender:'feminino', category:'scrubs', price:319,
    colors:[['Burgundy','#742f3f'],['Sage','#889886'],['Sky','#88a7b8'],['Sand','#c9ad86']], sizes:['PP','P','M','G','GG'],
    image:'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=82&w=1200',
    image2:'https://images.unsplash.com/photo-1666887360684-8082fc98ebd2?auto=format&fit=crop&q=82&w=1200',
    description:'Uma leitura mais editorial do scrub clássico, com equilíbrio entre estrutura, leveza e personalidade.',
    fabric:'Poliamida de toque suave com elasticidade e recuperação de forma.',
    details:'Linhas alongadas, recortes discretos e bolsos incorporados ao desenho.'
  },
  {
    slug:'gabs-essential-jaleco', name:'Jaleco Gabs Essential', fit:'Alfaiataria leve', gender:'unissex', category:'jalecos', price:349,
    colors:[['Off White','#e9e4da'],['Stone','#aaa59d']], sizes:['PP','P','M','G','GG'],
    image:'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=82&w=1200',
    image2:'https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&q=82&w=1200',
    description:'Jaleco com linguagem de alfaiataria contemporânea, pensado para manter presença profissional sem rigidez.',
    fabric:'Tecido encorpado leve, macio e de fácil cuidado.',
    details:'Gola limpa, bolsos amplos e comprimento equilibrado para diferentes rotinas.'
  },
  {
    slug:'gabs-shift-feminino', name:'Gabs Shift — Feminino', fit:'Modelagem Slim', gender:'feminino', category:'conjuntos', price:329,
    colors:[['Forest','#314b3d'],['Wine','#6d2634'],['Navy','#233244'],['Black','#171717']], sizes:['PP','P','M','G','GG'],
    image:'https://images.unsplash.com/photo-1765896387398-1e1ae8d2eb85?auto=format&fit=crop&q=82&w=1200',
    image2:'https://images.unsplash.com/photo-1769072610024-5b8a50f05c73?auto=format&fit=crop&q=82&w=1200',
    description:'Um conjunto mais definido no corpo, com construção técnica para acompanhar movimentos sem repuxar.',
    fabric:'Tecido stretch respirável com toque frio e secagem rápida.',
    details:'Top slim com recorte lateral e calça de cintura média com desenho limpo.'
  },
  {
    slug:'gabs-core-masculino-forest', name:'Gabs Core Forest', fit:'Modelagem Relaxed', gender:'masculino', category:'conjuntos', price:309,
    colors:[['Forest','#314b3d'],['Olive','#69705a'],['Stone','#aaa59d']], sizes:['P','M','G','GG'],
    image:'https://images.unsplash.com/photo-1769072610024-5b8a50f05c73?auto=format&fit=crop&q=82&w=1200',
    image2:'https://images.unsplash.com/photo-1642976482503-3f67b345dbac?auto=format&fit=crop&q=82&w=1200',
    description:'Volume controlado, conforto e acabamento clean em um scrub masculino com leitura mais casual.',
    fabric:'Tecido flexível, resistente e de fácil cuidado.',
    details:'Top relaxed e calça reta com bolsos funcionais.'
  },
  {
    slug:'gabs-one-sky', name:'Gabs One Sky', fit:'Modelagem Slim', gender:'feminino', category:'scrubs', price:289,
    colors:[['Sky','#88a7b8'],['Sage','#889886'],['Rose','#b98f91']], sizes:['PP','P','M','G','GG'],
    image:'https://images.unsplash.com/photo-1666887360684-8082fc98ebd2?auto=format&fit=crop&q=82&w=1200',
    image2:'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=82&w=1200',
    description:'A versão clara e fresca da linha Gabs One para quem prefere tons suaves sem perder presença.',
    fabric:'Leve, respirável e elástico em múltiplas direções.',
    details:'Modelagem slim com bolsos bem posicionados e acabamento limpo.'
  }
];

window.GABS_PRODUCTS = GABS_PRODUCTS;

(function initHeroSlider(){
  if(!document.querySelector('link[data-hero-slider]')){
    const css=document.createElement('link');
    css.rel='stylesheet';
    css.href='hero-slider.css';
    css.dataset.heroSlider='true';
    document.head.appendChild(css);
  }

  const hero=document.querySelector('.hero-marquee');
  const track=hero?.querySelector('.hero-marquee-track');
  if(!hero||!track) return;

  [...track.querySelectorAll('.hero-model')].slice(6).forEach(slide=>slide.remove());
  const slides=[...track.querySelectorAll('.hero-model')];
  if(slides.length<2) return;

  track.removeAttribute('aria-hidden');
  track.setAttribute('aria-label','Galeria da campanha Gabs Scrubs');

  const pagination=document.createElement('div');
  pagination.className='hero-pagination';
  pagination.setAttribute('role','group');
  pagination.setAttribute('aria-label','Selecionar foto da campanha');

  const dots=slides.map((_,index)=>{
    const button=document.createElement('button');
    button.type='button';
    button.className=`hero-dot${index===0?' active':''}`;
    button.setAttribute('aria-label',`Ir para foto ${index+1} de ${slides.length}`);
    button.setAttribute('aria-current',index===0?'true':'false');
    button.addEventListener('click',()=>{
      track.scrollTo({left:index*track.clientWidth,behavior:'smooth'});
    });
    pagination.appendChild(button);
    return button;
  });
  hero.appendChild(pagination);

  let activeIndex=0;
  let raf=0;
  const setActive=index=>{
    const next=Math.max(0,Math.min(slides.length-1,index));
    if(next===activeIndex&&dots[next]?.classList.contains('active')) return;
    activeIndex=next;
    dots.forEach((dot,i)=>{
      const active=i===next;
      dot.classList.toggle('active',active);
      dot.setAttribute('aria-current',active?'true':'false');
    });
  };
  const sync=()=>{
    raf=0;
    const width=track.clientWidth||1;
    setActive(Math.round(track.scrollLeft/width));
  };
  track.addEventListener('scroll',()=>{
    if(!raf) raf=requestAnimationFrame(sync);
  },{passive:true});

  let dragging=false;
  let startX=0;
  let startScroll=0;
  track.addEventListener('pointerdown',event=>{
    if(event.pointerType==='touch') return;
    dragging=true;
    startX=event.clientX;
    startScroll=track.scrollLeft;
    track.classList.add('is-dragging');
    track.setPointerCapture?.(event.pointerId);
  });
  track.addEventListener('pointermove',event=>{
    if(!dragging) return;
    track.scrollLeft=startScroll-(event.clientX-startX);
  });
  const endDrag=event=>{
    if(!dragging) return;
    dragging=false;
    track.classList.remove('is-dragging');
    track.releasePointerCapture?.(event.pointerId);
    const index=Math.round(track.scrollLeft/(track.clientWidth||1));
    track.scrollTo({left:index*track.clientWidth,behavior:'smooth'});
  };
  track.addEventListener('pointerup',endDrag);
  track.addEventListener('pointercancel',endDrag);
  track.addEventListener('pointerleave',event=>{if(dragging) endDrag(event);});

  window.addEventListener('resize',()=>{
    track.scrollLeft=activeIndex*track.clientWidth;
  },{passive:true});
})();

(function initHeroAutoplayAndArrows(){
  const hero=document.querySelector('.hero-marquee');
  const track=hero?.querySelector('.hero-marquee-track');
  if(!hero||!track) return;

  const slides=[...track.querySelectorAll('.hero-model')].filter((_,index)=>index<6);
  if(slides.length<2) return;

  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const autoplayDelay=4800;
  const interactionPause=7500;
  let timer=0;

  const currentIndex=()=>{
    const width=track.clientWidth||1;
    return Math.max(0,Math.min(slides.length-1,Math.round(track.scrollLeft/width)));
  };

  const goTo=index=>{
    const normalized=(index+slides.length)%slides.length;
    track.scrollTo({left:normalized*track.clientWidth,behavior:reducedMotion?'auto':'smooth'});
  };

  const clearAutoplay=()=>{
    if(timer){
      clearTimeout(timer);
      timer=0;
    }
  };

  const scheduleAutoplay=(delay=autoplayDelay)=>{
    clearAutoplay();
    if(reducedMotion||document.hidden) return;
    timer=window.setTimeout(()=>{
      goTo(currentIndex()+1);
      scheduleAutoplay(autoplayDelay);
    },delay);
  };

  const pauseAfterInteraction=()=>scheduleAutoplay(interactionPause);

  const makeArrow=(direction,label,path)=>{
    const button=document.createElement('button');
    button.type='button';
    button.className=`hero-arrow hero-arrow-${direction}`;
    button.setAttribute('aria-label',label);
    button.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"></path></svg>`;
    button.addEventListener('click',event=>{
      event.preventDefault();
      event.stopPropagation();
      clearAutoplay();
      goTo(currentIndex()+(direction==='next'?1:-1));
      pauseAfterInteraction();
    });
    hero.appendChild(button);
  };

  makeArrow('prev','Imagem anterior','M15 18l-6-6 6-6');
  makeArrow('next','Próxima imagem','M9 6l6 6-6 6');

  hero.addEventListener('click',event=>{
    if(event.target.closest('.hero-dot')) pauseAfterInteraction();
  });

  track.addEventListener('touchstart',clearAutoplay,{passive:true});
  track.addEventListener('touchend',pauseAfterInteraction,{passive:true});
  track.addEventListener('pointerdown',event=>{
    if(event.pointerType!=='touch') clearAutoplay();
  },{passive:true});
  track.addEventListener('pointerup',event=>{
    if(event.pointerType!=='touch') pauseAfterInteraction();
  },{passive:true});
  track.addEventListener('wheel',()=>pauseAfterInteraction(),{passive:true});

  hero.addEventListener('mouseenter',clearAutoplay);
  hero.addEventListener('mouseleave',()=>scheduleAutoplay(autoplayDelay));
  hero.addEventListener('focusin',clearAutoplay);
  hero.addEventListener('focusout',()=>scheduleAutoplay(autoplayDelay));

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden) clearAutoplay();
    else scheduleAutoplay(autoplayDelay);
  });

  scheduleAutoplay(autoplayDelay);
})();

(function initWhatsAppCartCheckout(){
  const whatsappPhone='5591992814885';
  const formatMoney=value=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);

  function readCart(){
    try{return JSON.parse(localStorage.getItem('gabs_cart')||'[]');}
    catch{return [];}
  }

  function buildMessage(){
    const cart=readCart();
    if(!cart.length) return '';

    let total=0;
    const lines=['Olá! Quero finalizar meu pedido na Gabs Scrubs.',''];

    cart.forEach((item,index)=>{
      const product=window.GABS_PRODUCTS?.find(p=>p.slug===item.slug);
      if(!product) return;
      const itemTotal=product.price*item.qty;
      total+=itemTotal;
      lines.push(`${index+1}. ${product.name}`);
      lines.push(`Cor: ${item.color} • Tamanho: ${item.size} • Qtd: ${item.qty}`);
      lines.push(`Valor: ${formatMoney(itemTotal)}`);
      lines.push('');
    });

    lines.push(`Total do pedido: ${formatMoney(total)}`);
    lines.push('');
    lines.push('Pode confirmar a disponibilidade e me enviar a chave PIX ou o link de pagamento, por favor?');
    return lines.join('\n');
  }

  function simplifyCheckout(){
    document.querySelectorAll('#freight-progress').forEach(el=>el.closest('.progress')?.remove());
    document.querySelectorAll('#freight-copy').forEach(el=>el.remove());
    document.querySelectorAll('#cep').forEach(el=>el.closest('.option-block')?.remove());
    document.querySelectorAll('#checkout-btn').forEach(button=>{
      button.textContent='Finalizar pelo WhatsApp';
      button.removeAttribute('disabled');
      button.setAttribute('aria-label','Escolher WhatsApp para enviar o pedido');
    });
  }

  function closeChooser(){
    document.getElementById('gabs-whatsapp-chooser')?.remove();
  }

  function copyOrder(message,button){
    const done=()=>{
      const previous=button.textContent;
      button.textContent='Pedido copiado';
      setTimeout(()=>button.textContent=previous,1600);
    };
    if(navigator.clipboard?.writeText){
      navigator.clipboard.writeText(message).then(done).catch(()=>{});
      return;
    }
    const area=document.createElement('textarea');
    area.value=message;
    area.style.position='fixed';
    area.style.opacity='0';
    document.body.appendChild(area);
    area.select();
    try{document.execCommand('copy');done();}catch{}
    area.remove();
  }

  function showChooser(message){
    closeChooser();
    const encoded=encodeURIComponent(message);
    const normalUrl=`https://wa.me/${whatsappPhone}?text=${encoded}`;
    const businessUrl=`whatsapp://send?phone=${whatsappPhone}&text=${encoded}`;

    const overlay=document.createElement('div');
    overlay.id='gabs-whatsapp-chooser';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','Escolher aplicativo do WhatsApp');
    overlay.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.42);display:flex;align-items:flex-end;justify-content:center;padding:16px max(16px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));';

    const sheet=document.createElement('div');
    sheet.style.cssText='width:min(100%,520px);background:#fffdfa;color:#151515;border:1px solid #d9d4cb;padding:22px 18px 18px;box-shadow:0 18px 60px rgba(0,0,0,.22);font-family:Tenor Sans,Arial,sans-serif;';
    sheet.innerHTML=`
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:20px">
        <div><div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#6c6962;margin-bottom:8px">Finalizar pedido</div><div style="font-family:Italiana,Georgia,serif;font-size:28px;line-height:1.05">Onde você quer abrir?</div></div>
        <button type="button" data-wa-close aria-label="Fechar" style="border:0;background:transparent;width:44px;height:44px;font-size:28px;line-height:1;cursor:pointer">×</button>
      </div>
      <div style="display:grid;gap:10px">
        <a data-wa-normal href="${normalUrl}" target="_blank" rel="noopener" style="min-height:54px;display:flex;align-items:center;justify-content:center;background:#11110f;color:#fff;text-decoration:none;font-size:13px;letter-spacing:.08em;text-transform:uppercase">WhatsApp</a>
        <button type="button" data-wa-business style="min-height:54px;border:1px solid #151515;background:transparent;color:#151515;font:inherit;font-size:13px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer">WhatsApp Business</button>
        <button type="button" data-wa-copy style="min-height:48px;border:0;background:transparent;color:#6c6962;font:inherit;text-decoration:underline;cursor:pointer">Copiar pedido</button>
      </div>`;

    overlay.appendChild(sheet);
    document.body.appendChild(overlay);

    overlay.addEventListener('click',event=>{
      if(event.target===overlay||event.target.closest('[data-wa-close]')) closeChooser();
      const business=event.target.closest('[data-wa-business]');
      if(business){
        event.preventDefault();
        window.location.href=businessUrl;
      }
      const copy=event.target.closest('[data-wa-copy]');
      if(copy){
        event.preventDefault();
        copyOrder(message,copy);
      }
    });
  }

  document.addEventListener('DOMContentLoaded',simplifyCheckout);

  document.addEventListener('click',event=>{
    const button=event.target.closest('#checkout-btn');
    if(!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    const message=buildMessage();
    if(!message){
      alert('Sua sacola está vazia.');
      return;
    }

    showChooser(message);
  },true);
})();
