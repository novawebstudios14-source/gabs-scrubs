export function fields(input){const result={};for(const key of ['name','fit','description','fabric','details']){const value=String(input[key]||'').trim();if(value.length>2000)throw Error('Texto muito longo');result[key]=value;}
 if(!result.name||result.name.length>120||!result.description)throw Error('Preencha nome e descrição');
 for(const [key,allowed] of Object.entries({gender:['feminino','masculino','unissex'],category:['scrubs','jalecos','conjuntos'],fit:['Modelagem Slim','Modelagem Straight','Modelagem Relaxed','Alfaiataria leve']})){if(!allowed.includes(input[key]))throw Error('Seleção inválida');result[key]=input[key];}
 result.price=Number(input.price);if(!Number.isFinite(result.price)||result.price<=0||result.price>1000000)throw Error('Preço inválido');result.price=Math.round(result.price*100)/100;
 result.sizes=Array.isArray(input.sizes)?[...new Set(input.sizes)]:[];if(!result.sizes.length||result.sizes.some(s=>!['PP','P','M','G','GG','XGG'].includes(s)))throw Error('Selecione tamanhos válidos');
 result.colors=Array.isArray(input.colors)?input.colors:[];if(!result.colors.length||result.colors.length>20||result.colors.some(c=>!Array.isArray(c)||c.length!==2||typeof c[0]!=='string'||!c[0].trim()||c[0].length>40||!/^#[a-f0-9]{6}$/i.test(c[1])))throw Error('Informe cores válidas');
 result.colors=result.colors.map(([name,hex])=>[name.trim(),hex]);return result;
}
