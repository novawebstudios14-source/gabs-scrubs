import {mkdir,readFile,writeFile,copyFile,cp,rm} from 'node:fs/promises';
import vm from 'node:vm';
await rm('public',{recursive:true,force:true});await mkdir('public/loja',{recursive:true});
for(const name of ['admin.html','admin.css','admin.js'])await copyFile(name,'public/'+name);
for(const name of ['index.html','feminino.html','masculino.html','produto.html','checkout.html','app.js','products.js','styles.css','hero-slider.css','mobile.css'])await copyFile(name,'public/loja/'+name);
await cp('assets','public/loja/assets',{recursive:true});
const context={window:{}};vm.runInNewContext((await readFile('products.js','utf8')).split('(function initHeroSlider')[0],context);
await writeFile('lib/seed.json',JSON.stringify(context.window.GABS_PRODUCTS.map(p=>({...p,photos:[p.image,p.image2],status:'published',legacy:true}))));
console.log('Painel e prévia do catálogo preparados');
