import http from 'node:http';
import {readFile,writeFile,mkdir,rename,unlink} from 'node:fs/promises';
import {randomBytes,randomUUID,scryptSync,timingSafeEqual,createHmac} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import sharp from 'sharp';
const root=path.dirname(fileURLToPath(import.meta.url)),dir=path.resolve(process.env.DATA_DIR||path.join(root,'data')),media=path.join(dir,'media'),catalog=path.join(dir,'catalog.json');
const user=process.env.ADMIN_USER||'',password=process.env.ADMIN_PASSWORD||'',secret=process.env.SESSION_SECRET||'',secure=process.env.NODE_ENV==='production';
const salt=createHmac('sha256',secret).update('password-salt').digest(),hash=scryptSync(password,salt,64),sessions=new Map(),attempts=new Map();
const context={window:{},document:{querySelector:()=>true},location:{},setTimeout:()=>0};
// Only evaluate the original catalog declaration, never browser behavior.
vm.runInNewContext((await readFile(path.join(root,'products.js'),'utf8')).split('window.initGabsHero=')[0],context);
let products;
try{products=JSON.parse(await readFile(catalog,'utf8'));if(!Array.isArray(products))throw Error('Catálogo inválido');}
catch(e){if(e.code!=='ENOENT')throw e;products=context.window.GABS_PRODUCTS.map(p=>({...p,photos:[p.image,p.image2],status:'published',legacy:true}));}
await mkdir(media,{recursive:true});
let queue=Promise.resolve();
function serialized(fn){const next=queue.then(fn);queue=next.catch(()=>{});return next;}
async function save(next){const tmp=catalog+'.'+randomUUID();await writeFile(tmp,JSON.stringify(next),{mode:0o600});await rename(tmp,catalog);products=next;}
function equal(a,b){const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&timingSafeEqual(x,y);}
function send(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
function limited(req,max=8,period=900000,prefix='login'){const key=prefix+':'+req.socket.remoteAddress,now=Date.now();for(const [k,v] of attempts)if(v.until<now)attempts.delete(k);let item=attempts.get(key);if(!item){item={count:0,until:now+period};attempts.set(key,item);}return ++item.count>max;}
function originOK(req){try{const o=new URL(req.headers.origin);return o.host===req.headers.host&&(!secure||o.protocol==='https:');}catch{return false;}}
function session(req){const token=(req.headers.cookie||'').match(/(?:^|;\s*)gabs_session=([a-f0-9]{64})/)?.[1];const current=sessions.get(token);if(current?.expires>Date.now())return {token,...current};if(token)sessions.delete(token);return null;}
async function body(req,max=16000000){let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>max)throw Error('Envio muito grande');chunks.push(chunk);}try{return JSON.parse(Buffer.concat(chunks).toString());}catch{throw Error('Dados inválidos');}}
function publicProduct(p){const {legacy,status,...item}=p;return item;}
function fields(input){const result={};for(const key of ['name','fit','description','fabric','details']){const value=String(input[key]||'').trim();if(value.length>2000)throw Error('Texto muito longo');result[key]=value;}
 if(!result.name||result.name.length>120||!result.description)throw Error('Preencha nome e descrição');
 for(const [key,allowed] of Object.entries({gender:['feminino','masculino','unissex'],category:['scrubs','jalecos','conjuntos'],fit:['Modelagem Slim','Modelagem Straight','Modelagem Relaxed','Alfaiataria leve']})){if(!allowed.includes(input[key]))throw Error('Seleção inválida');result[key]=input[key];}
 result.price=Number(input.price);if(!Number.isFinite(result.price)||result.price<=0||result.price>1000000)throw Error('Preço inválido');result.price=Math.round(result.price*100)/100;
 result.sizes=Array.isArray(input.sizes)?[...new Set(input.sizes)]:[];if(!result.sizes.length||result.sizes.some(s=>!['PP','P','M','G','GG','XGG'].includes(s)))throw Error('Selecione tamanhos válidos');
 result.colors=Array.isArray(input.colors)?input.colors:[];if(!result.colors.length||result.colors.length>20||result.colors.some(c=>!Array.isArray(c)||c.length!==2||typeof c[0]!=='string'||!c[0].trim()||c[0].length>40||!/^#[a-f0-9]{6}$/i.test(c[1])))throw Error('Informe cores válidas');
 result.colors=result.colors.map(([name,hex])=>[name.trim(),hex]);return result;
}
async function photo(data){if(typeof data!=='string'||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(data))throw Error('Foto inválida');const bytes=Buffer.from(data.split(',')[1],'base64');if(bytes.length>10000000)throw Error('Foto maior que 10 MB');let safe;try{const image=sharp(bytes,{limitInputPixels:40000000,failOn:'warning'});const info=await image.metadata();if(!['jpeg','png','webp'].includes(info.format))throw Error();safe=await image.rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).jpeg({quality:82}).toBuffer();}catch{throw Error('Foto inválida ou corrompida');}const name=randomUUID()+'.jpg';await writeFile(path.join(media,name),safe,{flag:'wx',mode:0o600});return '/media/'+name;}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon'};
const staticFiles=new Set(['index.html','feminino.html','masculino.html','produto.html','checkout.html','admin.html','app.js','products.js','admin.js','styles.css','admin.css','hero-slider.css','mobile.css','robots.txt','sitemap.xml']);
const server=http.createServer(async(req,res)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','same-origin');try{
 const url=new URL(req.url,'http://localhost'),route=url.pathname;
 if(route==='/api/products'&&req.method==='GET')return send(res,200,{products:products.filter(p=>p.status==='published').map(publicProduct)});
 if(route.startsWith('/api/admin/')){
  if(!user||!password||secret.length<32)return send(res,503,{error:'Painel ainda não configurado na hospedagem.'});
  if(route==='/api/admin/login'&&req.method==='POST'){
   if(!originOK(req))return send(res,403,{error:'Origem inválida'});if(limited(req))return send(res,429,{error:'Muitas tentativas. Aguarde 15 minutos.'});const data=await body(req,2048);
   if(!equal(data.username,user)||typeof data.password!=='string'||data.password.length>256||!timingSafeEqual(scryptSync(data.password,salt,64),hash))return send(res,401,{error:'Usuário ou senha inválidos'});
   for(const [key,item] of sessions)if(item.expires<Date.now())sessions.delete(key);
   const token=randomBytes(32).toString('hex'),csrf=randomBytes(32).toString('hex');sessions.set(token,{csrf,expires:Date.now()+28800000});res.setHeader('Set-Cookie',`gabs_session=${token}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=28800${secure?'; Secure':''}`);return send(res,200,{csrf});
  }
  const current=session(req);if(!current)return send(res,401,{error:'Entre no painel para continuar'});
  if(req.method!=='GET'&&(!originOK(req)||!equal(req.headers['x-csrf-token'],current.csrf)))return send(res,403,{error:'Solicitação não autorizada'});
  if(req.method!=='GET'&&limited(req,40,60000,'write'))return send(res,429,{error:'Aguarde um minuto para continuar'});
  if(route==='/api/admin/session'&&req.method==='GET')return send(res,200,{csrf:current.csrf});
  if(route==='/api/admin/logout'&&req.method==='POST'){sessions.delete(current.token);res.setHeader('Set-Cookie',`gabs_session=; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=0${secure?'; Secure':''}`);return send(res,200,{ok:true});}
  if(route==='/api/admin/products'&&req.method==='GET')return send(res,200,{products});
  if(route.startsWith('/api/admin/media/')&&req.method==='GET'){const name=route.split('/').pop();if(!/^[a-f0-9-]{36}\.jpg$/.test(name))return send(res,404,{error:'Foto não encontrada'});const bytes=await readFile(path.join(media,name));res.writeHead(200,{'Content-Type':'image/jpeg','Cache-Control':'private, no-store'});return res.end(bytes);}
  if(route==='/api/admin/products'&&req.method==='POST'){
   const data=await body(req);return await serialized(async()=>{const existing=data.slug?products.find(p=>p.slug===data.slug):null;if(data.slug&&!existing)return send(res,404,{error:'Produto não encontrado'});const item=fields(data.fields||{});
    const kept=existing?(existing.photos||[]).filter(p=>!(data.removePhotos||[]).includes(p)):[];const uploads=data.photos||[];if(!Array.isArray(uploads)||!kept.length&&!uploads.length||kept.length+uploads.length>10)throw Error('Adicione de 1 a 10 fotos');const added=[];
    try{for(const p of uploads)added.push(await photo(p));item.photos=[...kept,...added];item.image=item.photos[0];item.image2=item.photos[1]||item.image;item.slug=existing?.slug||'gabs-'+randomUUID();item.status=existing?.status||'published';item.updatedAt=new Date().toISOString();const next=existing?products.map(p=>p.slug===item.slug?item:p):[...products,item];await save(next);}
    catch(e){for(const src of added)await unlink(path.join(media,path.basename(src))).catch(()=>{});throw e;}return send(res,200,{product:item});});
  }
  if(route==='/api/admin/status'&&req.method==='POST'){const data=await body(req,2048);return await serialized(async()=>{if(!['published','paused'].includes(data.status))throw Error('Status inválido');if(!products.some(p=>p.slug===data.slug))return send(res,404,{error:'Produto não encontrado'});await save(products.map(p=>p.slug===data.slug?{...p,status:data.status}:p));return send(res,200,{ok:true});});}
  return send(res,404,{error:'Rota não encontrada'});
 }
 if(req.method!=='GET'&&req.method!=='HEAD')return send(res,405,{error:'Método não permitido'});
 let filename;const relative=decodeURIComponent(route).replace(/^\//,'')||'index.html';
 if(route.startsWith('/media/')){if(!products.some(p=>p.status==='published'&&p.photos?.includes(route)))return send(res,404,{error:'Foto não encontrada'});filename=path.join(media,path.basename(route));}
 else{if(!staticFiles.has(relative)&&!/^assets\/[a-zA-Z0-9_./-]+$/.test(relative))return send(res,404,{error:'Não encontrado'});filename=path.resolve(root,relative);if(!filename.startsWith(root+path.sep))return send(res,404,{error:'Não encontrado'});}
 const bytes=await readFile(filename);res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':['.html','.js','.css'].includes(path.extname(filename))?'no-store':'public, max-age=3600'});res.end(req.method==='HEAD'?undefined:bytes);
 }catch(error){if(error.code==='ENOENT')return send(res,404,{error:'Não encontrado'});console.error(error.message);send(res,400,{error:['EACCES','ENOSPC','EIO'].includes(error.code)?'Não foi possível salvar. Tente novamente.':error.message});}});
server.listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Gabs Scrubs pronta'));
