import http from 'node:http';
import {readFile} from 'node:fs/promises';
const allowed=new Set(['index.html','style.css','app.js','core.js','manifest.webmanifest','sw.js','icon.svg','icon-180.png','icon-192.png','icon-512.png']);
const types={html:'text/html; charset=utf-8',css:'text/css',js:'text/javascript',webmanifest:'application/manifest+json',svg:'image/svg+xml',png:'image/png'};
http.createServer(async(req,res)=>{try{let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1)||'index.html';if(!allowed.has(path)){res.writeHead(404);res.end('Not found');return;}let body=await readFile(new URL(path,import.meta.url));res.writeHead(200,{'Content-Type':types[path.split('.').at(-1)],'Cache-Control':'no-cache'});res.end(body);}catch{res.writeHead(404);res.end('Not found');}}).listen(43187,'0.0.0.0',()=>console.log('Memoria em dia: http://localhost:43187'));


