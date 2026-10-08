'use strict';
const $=id=>document.getElementById(id),form=$('product-form');let csrf='',editing=null,revision=null,existing=[],selected=[],removed=[],pending=null;
function message(text,bad=false){$('notice').textContent=text;$('notice').className=bad?'error':'';}
async function api(route,options={}){let response;try{response=await fetch('/api/admin/'+route,{credentials:'same-origin',cache:'no-store',...options,headers:{'Content-Type':'application/json',...(csrf?{'X-CSRF-Token':csrf}:{})}});}catch{throw Error('Não foi possível conectar. Tente novamente.');}let data;try{data=await response.json();}catch{throw Error('O painel precisa ser ativado na hospedagem para receber publicações.');}if(!response.ok){if(response.status===401&&route!=='login')show(false);throw Error(data.error||'Não foi possível concluir');}return data;}
function post(route,data){return api(route,{method:'POST',body:JSON.stringify(data)});}
function show(logged){$('login').hidden=logged;$('workspace').hidden=!logged;$('logout').hidden=!logged;}
function addColor(name='',hex='#233244'){const row=document.createElement('div');row.className='color-row';const text=document.createElement('input');text.type='text';text.placeholder='Nome da cor';text.setAttribute('aria-label','Nome da cor');text.required=true;text.maxLength=40;text.value=name;const color=document.createElement('input');color.type='color';color.setAttribute('aria-label','Tonalidade da cor');color.value=hex;const remove=document.createElement('button');remove.type='button';remove.className='secondary';remove.textContent='×';remove.setAttribute('aria-label','Remover cor');remove.onclick=()=>row.remove();row.append(text,color,remove);$('colors').append(row);}
function renderPhotos(){$('preview').replaceChildren();const entries=[...existing.map(src=>({src,old:true})),...selected.map(file=>({src:URL.createObjectURL(file),file}))];for(const entry of entries){const box=document.createElement('div');box.className='photo';const img=document.createElement('img');img.src=entry.old&&entry.src.startsWith('/media/')?'/api/admin'+entry.src:entry.src;img.alt='Foto do produto';if(entry.file)img.onload=()=>URL.revokeObjectURL(entry.src);const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','Remover foto');remove.onclick=()=>{if(entry.old){existing=existing.filter(p=>p!==entry.src);removed.push(entry.src);}else selected=selected.filter(p=>p!==entry.file);renderPhotos();};box.append(img,remove);$('preview').append(box);}}
function reset(){editing=null;revision=null;existing=[];selected=[];removed=[];form.reset();$('colors').replaceChildren();addColor();$('form-title').textContent='Novo produto';$('save').textContent='Revisar publicação';$('cancel').hidden=true;renderPhotos();}
function edit(p){reset();editing=p.slug;revision=p._revision;existing=[...p.photos];for(const key of ['name','category','gender','fit','description','fabric','details'])form.elements[key].value=p[key]||'';form.elements.price.value=p.price.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});for(const input of form.querySelectorAll('[name=sizes]'))input.checked=p.sizes.includes(input.value);$('colors').replaceChildren();p.colors.forEach(c=>addColor(...c));$('form-title').textContent='Editar produto';$('cancel').hidden=false;renderPhotos();form.scrollIntoView({behavior:'smooth'});}
function productThumbnail(src){
  if(src.startsWith('/media/'))return '/api/admin'+src;
  try{const url=new URL(src);if(url.hostname==='images.unsplash.com'){url.searchParams.set('w','160');url.searchParams.set('q','65');return url.href;}}catch{}
  return src;
}
function productRow(p){const item=document.createElement('article');item.className='item';const img=document.createElement('img');img.alt='';img.loading='lazy';img.decoding='async';img.width=64;img.height=84;img.src=productThumbnail(p.image);const info=document.createElement('div');const name=document.createElement('strong');name.textContent=p.name;const meta=document.createElement('p');meta.textContent=`${p.price.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} · ${p.status==='published'?'Publicado':'Pausado'}`;const actions=document.createElement('div');actions.className='actions';const editBtn=document.createElement('button');editBtn.className='secondary';editBtn.textContent='Editar';editBtn.onclick=()=>edit(p);const toggle=document.createElement('button');toggle.className='secondary';toggle.textContent=p.status==='published'?'Pausar':'Publicar';toggle.onclick=async()=>{toggle.disabled=true;try{await post('status',{slug:p.slug,revision:p._revision,status:p.status==='published'?'paused':'published'});await load();message('Catálogo atualizado.');}catch(e){message(e.message,true);}finally{toggle.disabled=false;}};actions.append(editBtn,toggle);if(p.status==='published'){const link=document.createElement('a');link.textContent='Ver na loja';link.href='/loja/produto.html?slug='+encodeURIComponent(p.slug);link.target='_blank';link.rel='noopener';actions.append(link);}info.append(name,meta,actions);item.append(img,info);return item;}
const catalogPages=new Map();
const catalogPageSize=6;
function renderCategory(section,body,products,category){
  body.replaceChildren();
  if(!section.open)return;
  if(!products.length){const empty=document.createElement('p');empty.className='category-empty';empty.textContent='Nenhum produto nesta seção.';body.append(empty);return;}
  const page=Math.min(catalogPages.get(category)||0,Math.ceil(products.length/catalogPageSize)-1);
  catalogPages.set(category,page);
  const start=page*catalogPageSize;
  for(const product of products.slice(start,start+catalogPageSize))body.append(productRow(product));
  if(products.length>catalogPageSize){
    const pagination=document.createElement('nav');pagination.className='catalog-pagination';pagination.setAttribute('aria-label','Páginas da seção');
    const previous=document.createElement('button');previous.type='button';previous.className='secondary';previous.textContent='Anterior';previous.disabled=page===0;
    const next=document.createElement('button');next.type='button';next.className='secondary';next.textContent='Próxima';next.disabled=start+catalogPageSize>=products.length;
    const status=document.createElement('span');status.textContent=`${start+1}–${Math.min(start+catalogPageSize,products.length)} de ${products.length}`;status.setAttribute('aria-live','polite');
    function changePage(nextPage){catalogPages.set(category,nextPage);renderCategory(section,body,products,category);section.scrollIntoView({block:'nearest'});section.querySelector('summary').focus();}
    previous.onclick=()=>changePage(page-1);next.onclick=()=>changePage(page+1);
    pagination.append(previous,status,next);body.append(pagination);
  }
}
async function load(){
  const data=await api('products');
  const list=$('list'),openCategory=list.querySelector('.product-section[open]')?.dataset.category;
  $('count').textContent=`${data.products.length} produtos`;list.replaceChildren();
  for(const [category,label] of [['scrubs','Scrubs'],['conjuntos','Conjuntos'],['jalecos','Jalecos']]){
    const products=data.products.filter(p=>p.category===category);
    const section=document.createElement('details');section.className='product-section';section.dataset.category=category;
    const summary=document.createElement('summary');const title=document.createElement('span');title.textContent=label;
    const count=document.createElement('span');count.className='category-count';count.textContent=`${products.length} ${products.length===1?'produto':'produtos'}`;
    summary.append(title,count);const body=document.createElement('div');body.className='category-products';section.append(summary,body);
    section.addEventListener('toggle',()=>{
      if(section.open){for(const other of list.querySelectorAll('.product-section'))if(other!==section){other.open=false;other.querySelector('.category-products').replaceChildren();}}
      renderCategory(section,body,products,category);
    });
    list.append(section);
    if(openCategory===category){section.open=true;renderCategory(section,body,products,category);}
  }
}

async function resize(file){const bitmap=await createImageBitmap(file);try{const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.82);}finally{bitmap.close();}}
$('photos').onchange=e=>{const files=[...e.target.files];e.target.value='';if(files.some(f=>!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>10000000)){message('Envie JPG, PNG ou WebP de até 10 MB cada.',true);return;}if(existing.length+selected.length+files.length>10){message('O limite é de 10 fotos por produto.',true);return;}selected.push(...files);renderPhotos();};
$('add-color').onclick=()=>{if($('colors').children.length<20)addColor();};$('cancel').onclick=reset;
$('login-form').onsubmit=async e=>{e.preventDefault();$('enter').disabled=true;try{const data=await post('login',{username:$('user').value.trim(),password:$('password').value});csrf=data.csrf;$('password').value='';show(true);await load();message('');}catch(e){message(e.message,true);}finally{$('enter').disabled=false;}};
$('logout').onclick=async()=>{try{await post('logout',{});csrf='';reset();show(false);message('');}catch(e){message(e.message,true);}};
form.onsubmit=e=>{e.preventDefault();try{if(!existing.length&&!selected.length)throw Error('Adicione pelo menos uma foto');const fields=Object.fromEntries(new FormData(form));fields.price=Number(fields.price.trim().replace(/\./g,'').replace(',','.'));if(!Number.isFinite(fields.price)||fields.price<=0)throw Error('Informe um preço válido, como 289,90');fields.sizes=[...form.querySelectorAll('[name=sizes]:checked')].map(i=>i.value);if(!fields.sizes.length)throw Error('Selecione pelo menos um tamanho');fields.colors=[...$('colors').children].map(row=>[row.querySelector('[type=text]').value.trim(),row.querySelector('[type=color]').value]);if(!fields.colors.length)throw Error('Adicione pelo menos uma cor');pending=fields;$('review-summary').replaceChildren();for(const [label,value] of [['Produto',fields.name],['Categoria',fields.category],['Coleção',fields.gender],['Preço',fields.price.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})],['Tamanhos',fields.sizes.join(', ')],['Cores',fields.colors.map(c=>c[0]).join(', ')],['Descrição',fields.description]]){const p=document.createElement('p');const strong=document.createElement('strong');strong.textContent=label+': ';p.append(strong,document.createTextNode(value));$('review-summary').append(p);}$('review-photos').replaceChildren();for(const src of [...existing.map(src=>src.startsWith('/media/')?'/api/admin'+src:src),...selected.map(file=>URL.createObjectURL(file))]){const img=document.createElement('img');img.alt='Foto do produto';img.src=src;if(src.startsWith('blob:'))img.onload=()=>URL.revokeObjectURL(src);$('review-photos').append(img);}$('confirm').textContent=editing?'Confirmar alterações':'Confirmar publicação';$('review').showModal();}catch(e){message(e.message,true);}};
$('back').onclick=()=>$('review').close();$('confirm').onclick=async()=>{$('confirm').disabled=true;$('back').disabled=true;try{const photos=[];for(const file of selected){const resized=await resize(file);const upload=await post('photos',{photo:resized});photos.push(upload.src);}await post('products',{slug:editing,revision,fields:pending,photos,removePhotos:removed});$('review').close();reset();await load();message('Produto salvo. O catálogo da loja foi atualizado.');}catch(e){$('review').close();message(e.message,true);}finally{$('confirm').disabled=false;$('back').disabled=false;}};
reset();(async()=>{try{const data=await api('session');csrf=data.csrf;show(true);await load();}catch(e){show(false);if(!e.message.includes('Entre no painel'))message(e.message,true);}})();
