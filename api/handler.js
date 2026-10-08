import {readFile} from 'node:fs/promises';
import {createHandler} from '../lib/handler.mjs';
import * as storage from '../lib/store.mjs';
const seedJSON=await readFile(new URL('../lib/seed.json',import.meta.url),'utf8');
export default createHandler(storage,{seedJSON});
