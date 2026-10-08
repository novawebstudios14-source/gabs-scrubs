import {get,put,del,list} from '@vercel/blob';
export async function read(key){const result=await get(key,{access:'private',useCache:false});if(!result||result.statusCode!==200)return null;return {value:JSON.parse(await new Response(result.stream).text()),etag:result.blob.etag};}
export async function write(key,value,etag){return put(key,JSON.stringify(value),{access:'private',contentType:'application/json',addRandomSuffix:false,...(etag?{ifMatch:etag}:{allowOverwrite:false})});}
export async function remove(key){await del(key);}
export async function keys(prefix){let cursor,items=[];do{const result=await list({prefix,cursor});items.push(...result.blobs.map(b=>b.pathname));cursor=result.hasMore?result.cursor:undefined;}while(cursor);return items;}
export async function writeImage(key,bytes){return put(key,bytes,{access:'private',contentType:'image/jpeg',addRandomSuffix:false});}
export async function readImage(key){const result=await get(key,{access:'private'});return result?.statusCode===200?result.stream:null;}
export function conflict(e){return /PreconditionFailed|AlreadyExists/.test(e?.constructor?.name||'');}
