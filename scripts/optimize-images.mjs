import sharp from 'sharp';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
const root = 'public/images';
function walk(d){ for(const f of readdirSync(d)){ const p=join(d,f); if(statSync(p).isDirectory()) walk(p); else console.log(p); } }
walk(root);
console.log('optimize done');
