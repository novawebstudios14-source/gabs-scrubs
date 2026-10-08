import {test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import sharp from 'sharp';
import {createHandler} from '../lib/handler.mjs';
const data=new Map();let counter=0;
class Conflict extends Error{}
const storage={read:async key=>data.has(key)?structuredClone(data.get(key)):null,write:async(key,value,etag)=>{const old=data.get(key);if(old?(old.etag!==etag):!!etag)throw new Conflict();data.set(key,{value:structuredClone(value),etag:String(++counter)});},remove:async key=>data.delete(key),keys:async prefix=>[...data.keys()].filter(k=>k.startsWith(prefix)),writeImage:async(key,bytes)=>data.set(key,{bytes}),readImage:async key=>data.has(key)?new Response(data.get(key).bytes).body:null,conflict:e=>e instanceof Conflict};
test('Vercel: login durável, upload separado, catálogo, conflitos, pausa e logout',async()=>{
 const config={user:'test',password:'test-password',secret:'test-secret-at-least-thirty-two-characters',secure:false};let handler=createHandler(storage,config);const server=http.createServer((req,res)=>handler(req,res));await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const post=(route,payload,cookie='',csrf='',origin=base)=>fetch(base+'/api/admin/'+route,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:cookie,'X-CSRF-Token':csrf},body:JSON.stringify(payload)});
 try{
 assert.equal((await post('products',{})).status,401);assert.equal((await post('login',{username:'test',password:'test-password'},'','','https://evil.example')).status,403);
 const login=await post('login',{username:'test',password:'test-password'});assert.equal(login.status,200);const {csrf}=await login.json(),cookie=login.headers.get('set-cookie').split(';')[0];assert.match(login.headers.get('set-cookie'),/HttpOnly/);
 handler=createHandler(storage,config);assert.equal((await fetch(base+'/api/admin/session',{headers:{Cookie:cookie}})).status,200);
 assert.equal((await post('photos',{photo:'data:image/png;base64,AAAA'},cookie,csrf)).status,400);
 const photo='data:image/png;base64,'+(await sharp({create:{width:8,height:8,channels:3,background:'#ffffff'}}).png().toBuffer()).toString('base64');
 assert.equal((await post('photos',{photo},cookie)).status,403);const upload=await post('photos',{photo},cookie,csrf);assert.equal(upload.status,200);const {src}=await upload.json();assert.equal((await fetch(base+src)).status,404);
 const fields={name:'Scrub <teste>',category:'scrubs',gender:'feminino',fit:'Modelagem Slim',price:249.9,sizes:['M'],colors:[['Marinho','#233244']],description:'Descrição revisada',fabric:'Algodão',details:'Bolsos'};
 const saved=await post('products',{fields,photos:[src]},cookie,csrf);assert.equal(saved.status,200,await saved.clone().text());const {product}=await saved.json();assert.equal((await fetch(base+'/api/'+src.slice(1))).status,200);
 let p=(await (await fetch(base+'/api/admin/products',{headers:{Cookie:cookie}})).json()).products[0];assert.ok(p._revision);assert.equal((await post('products',{slug:p.slug,fields:{...fields,price:289.9},photos:[],revision:'wrong'},cookie,csrf)).status,409);
 const edited=await post('products',{slug:p.slug,fields:{...fields,price:289.9},photos:[],revision:p._revision},cookie,csrf);assert.equal(edited.status,200);
 p=(await (await fetch(base+'/api/admin/products',{headers:{Cookie:cookie}})).json()).products[0];assert.equal((await post('status',{slug:p.slug,status:'paused',revision:p._revision},cookie,csrf)).status,200);assert.equal((await fetch(base+'/api/'+src.slice(1))).status,404);assert.equal((await (await fetch(base+'/api/products')).json()).products.length,0);
 p=(await (await fetch(base+'/api/admin/products',{headers:{Cookie:cookie}})).json()).products[0];assert.equal((await post('status',{slug:p.slug,status:'published',revision:p._revision},cookie,csrf)).status,200);
 handler=createHandler(storage,config);const catalog=await (await fetch(base+'/api/products')).json();assert.equal(catalog.products[0].price,289.9);assert.equal(catalog.products[0].slug,product.slug);
 assert.equal((await post('logout',{},cookie,csrf)).status,200);assert.equal((await fetch(base+'/api/admin/products',{headers:{Cookie:cookie}})).status,401);
 for(let i=0;i<7;i++)await post('login',{username:'test',password:'wrong'});assert.equal((await post('login',{username:'test',password:'test-password'})).status,429);
 }finally{await new Promise(r=>server.close(r));}
});
