import {readFile} from 'node:fs/promises';
import {randomBytes,randomUUID,scryptSync,timingSafeEqual,createHmac} from 'node:crypto';
import sharp from 'sharp';
import {fields} from './fields.mjs';
export function createHandler(storage,config={}){
const user=config.user||process.env.ADMIN_USER,password=config.password||process.env.ADMIN_PASSWORD,secret=config.secret||process.env.SESSION_SECRET,secure=config.secure??process.env.NODE_ENV==='production';
const salt=createHmac('sha256',secret||'').update('password-salt').digest(),hash=scryptSync(password||'',salt,64);
const seeds=JSON.parse(readFileSyncSeed());
function readFileSyncSeed(){return config.seedJSON||'[]';}
function equal(a,b){const x=Buffer.from(String(a||'')),y=Buffer.from(String(b||''));return x.length===y.length&&timingSafeEqual(x,y);}
function send(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
function tag(value){return createHmac('sha256',secret).update(String(value)).digest('hex');}
function originOK(req){try{const o=new URL(req.headers.origin);return o.host===req.headers.host&&(!secure||o.protocol==='https:');}catch{return false;}}
async function body(req,max=4000000){if(req.body){const data=typeof req.body==='string'?req.body:JSON.stringify(req.body);if(Buffer.byteLength(data)>max)throw Error('Envio muito grande');return typeof req.body==='object'?req.body:JSON.parse(data);}let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>max)throw Error('Envio muito grande');chunks.push(chunk);}return JSON.parse(Buffer.concat(chunks).toString());}
async function products(){const names=await storage.keys('products/');const custom=await Promise.all(names.map(name=>storage.read(name)));const all=new Map(seeds.map(p=>[p.slug,{...p,_revision:null}]));for(const p of custom)if(p)all.set(p.value.slug,{...p.value,_revision:p.etag});return [...all.values()];}
async function product(slug){if(!/^gabs-[a-z0-9-]{1,90}$/.test(slug||''))return null;const saved=await storage.read('products/'+slug+'.json');return saved?{...saved.value,_revision:saved.etag}:seeds.find(p=>p.slug===slug)||null;}
async function session(req){const token=(req.headers.cookie||'').match(/(?:^|;\s*)gabs_session=([a-f0-9]{64})/)?.[1];if(!token)return null;const key='sessions/'+tag(token)+'.json',result=await storage.read(key);if(!result||result.value.expires<Date.now())return null;return {key,...result.value};}
async function limited(req,max,period,prefix){const ip=req.headers['x-forwarded-for']?.split(',')[0]||req.socket?.remoteAddress||'unknown',key='limits/'+tag(prefix+':'+ip)+'.json';for(let i=0;i<5;i++){const old=await storage.read(key),now=Date.now(),value=old&&old.value.until>now?{...old.value,count:old.value.count+1}:{count:1,until:now+period};try{await storage.write(key,value,old?.etag);return value.count>max;}catch(e){if(!storage.conflict(e))throw e;}}return true;}
async function image(data){if(typeof data!=='string'||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(data))throw Error('Foto inválida');const bytes=Buffer.from(data.split(',')[1],'base64');if(bytes.length>2800000)throw Error('Foto muito grande');let safe;try{const photo=sharp(bytes,{limitInputPixels:40000000,failOn:'warning'});const info=await photo.metadata();if(!['jpeg','png','webp'].includes(info.format))throw Error();safe=await photo.rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).jpeg({quality:82}).toBuffer();}catch{throw Error('Foto inválida ou corrompida');}const name=randomUUID()+'.jpg';await storage.writeImage('media/'+name,safe);return '/media/'+name;}
return async(req,res)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','same-origin');try{
 const url=new URL(req.url,'http://localhost'),route=req.query?.route||url.searchParams.get('route')||url.pathname.replace(/^\/api\//,'');
 if(!user||!password||!secret||secret.length<32)return send(res,503,{error:'Painel ainda não configurado'});
 if(route==='products'&&req.method==='GET'){const all=await products();return send(res,200,{products:all.filter(p=>p.status==='published').map(({_revision,status,legacy,...p})=>p)});}
 if(route==='admin/login'&&req.method==='POST'){
  if(!originOK(req))return send(res,403,{error:'Origem inválida'});if(await limited(req,8,900000,'login'))return send(res,429,{error:'Muitas tentativas. Aguarde 15 minutos.'});const data=await body(req,2048);
  if(!equal(data.username,user)||typeof data.password!=='string'||data.password.length>256||!timingSafeEqual(scryptSync(data.password,salt,64),hash))return send(res,401,{error:'Usuário ou senha inválidos'});
  const token=randomBytes(32).toString('hex'),csrf=randomBytes(32).toString('hex');await storage.write('sessions/'+tag(token)+'.json',{csrf,expires:Date.now()+28800000});res.setHeader('Set-Cookie',`gabs_session=${token}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=28800${secure?'; Secure':''}`);return send(res,200,{csrf});
 }
 if(route.startsWith('admin/')){
  const current=await session(req);if(!current)return send(res,401,{error:'Entre no painel para continuar'});
  if(req.method!=='GET'&&(!originOK(req)||!equal(req.headers['x-csrf-token'],current.csrf)))return send(res,403,{error:'Solicitação não autorizada'});
  if(req.method!=='GET'&&await limited(req,80,60000,'write'))return send(res,429,{error:'Aguarde um minuto para continuar'});
  if(route==='admin/session'&&req.method==='GET')return send(res,200,{csrf:current.csrf});
  if(route==='admin/logout'&&req.method==='POST'){await storage.remove(current.key);res.setHeader('Set-Cookie',`gabs_session=; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=0${secure?'; Secure':''}`);return send(res,200,{ok:true});}
  if(route==='admin/products'&&req.method==='GET')return send(res,200,{products:await products()});
  if(route==='admin/photos'&&req.method==='POST'){const data=await body(req);const src=await image(data.photo);await storage.write('uploads/'+src.split('/').pop()+'.json',{session:current.key,createdAt:Date.now()});return send(res,200,{src});}
  if(route==='admin/products'&&req.method==='POST'){
   const data=await body(req,50000),existing=data.slug?await product(data.slug):null;if(data.slug&&!existing)return send(res,404,{error:'Produto não encontrado'});if(existing&&!equal(data.revision,existing._revision))return send(res,409,{error:'Este produto foi alterado. Atualize o painel antes de salvar.'});
   const item=fields(data.fields||{}),kept=existing?(existing.photos||[]).filter(p=>!(data.removePhotos||[]).includes(p)):[],uploads=data.photos||[];
   if(!Array.isArray(uploads)||kept.length+uploads.length<1||kept.length+uploads.length>10||uploads.some(p=>typeof p!=='string'||!/^\/media\/[a-f0-9-]{36}\.jpg$/.test(p)))throw Error('Adicione de 1 a 10 fotos válidas');
   for(const src of uploads){const owned=await storage.read('uploads/'+src.split('/').pop()+'.json');if(owned?.value.session!==current.key)throw Error('Foto não autorizada');}
   item.photos=[...kept,...uploads];item.image=item.photos[0];item.image2=item.photos[1]||item.image;item.slug=existing?.slug||'gabs-'+randomUUID();item.status=existing?.status||'published';item.updatedAt=new Date().toISOString();await storage.write('products/'+item.slug+'.json',item,existing?._revision);return send(res,200,{product:item});
  }
  if(route==='admin/status'&&req.method==='POST'){const data=await body(req,2048);if(!['published','paused'].includes(data.status))throw Error('Status inválido');const old=await product(data.slug);if(!old)return send(res,404,{error:'Produto não encontrado'});if(!equal(data.revision,old._revision))return send(res,409,{error:'Este produto foi alterado. Atualize o painel.'});const {_revision,...item}=old;await storage.write('products/'+data.slug+'.json',{...item,status:data.status},_revision);return send(res,200,{ok:true});}
  if(route.startsWith('admin/media/')&&req.method==='GET'){const name=route.split('/').pop();if(!/^[a-f0-9-]{36}\.jpg$/.test(name))return send(res,404,{error:'Foto não encontrada'});const stream=await storage.readImage('media/'+name);if(!stream)return send(res,404,{error:'Foto não encontrada'});res.writeHead(200,{'Content-Type':'image/jpeg','Cache-Control':'private, no-store'});for await(const chunk of stream)res.write(chunk);return res.end();}
  return send(res,404,{error:'Rota não encontrada'});
 }
 if(route.startsWith('media/')&&req.method==='GET'){const name=route.split('/').pop();if(!/^[a-f0-9-]{36}\.jpg$/.test(name))return send(res,404,{error:'Foto não encontrada'});const src='/media/'+name,all=await products();if(!all.some(p=>p.status==='published'&&p.photos.includes(src)))return send(res,404,{error:'Foto não encontrada'});const stream=await storage.readImage('media/'+name);if(!stream)return send(res,404,{error:'Foto não encontrada'});res.writeHead(200,{'Content-Type':'image/jpeg','Cache-Control':'no-store'});for await(const chunk of stream)res.write(chunk);return res.end();}
 return send(res,404,{error:'Rota não encontrada'});
 }catch(e){console.error(e.constructor.name,e.message);if(storage.conflict(e))return send(res,409,{error:'O produto foi alterado em outra sessão. Atualize o painel.'});const validation=/inválid|Preencha|Selecione|Informe|Adicione|grande|autorizada|longo/i.test(e.message);return send(res,validation?400:503,{error:validation?e.message:'Não foi possível acessar o armazenamento. Tente novamente.'});}};
}
