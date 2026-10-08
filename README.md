# Gabs — painel separado na Vercel

Projeto Vercel: `gabs-painel`. A raiz abre o login administrativo; `/loja/index.html` permite conferir o catálogo publicado nesta instalação. O site original e a branch `main` não são alterados por este projeto.

O painel cadastra, revisa, publica, edita e pausa scrubs, conjuntos e jalecos, com preço, cores, tamanhos e até 10 fotos. Cada foto é enviada em uma requisição própria para respeitar o limite das Functions. As fotos são decodificadas e regravadas pelo servidor.

Produtos, sessões, fotos e limites de acesso são persistidos em um Vercel Blob privado. Escritas condicionais por ETag evitam sobrescrever edições concorrentes. Sessões expiram após oito horas; logout invalida a sessão no armazenamento.

Variáveis de produção, definidas apenas na Vercel: `ADMIN_USER`, `ADMIN_PASSWORD`, `SESSION_SECRET` (ao menos 32 caracteres) e `BLOB_STORE_ID`. O Blob usa a identidade OIDC do projeto, sem credenciais no repositório. Não publique o armazenamento privado.

`npm ci && npm run build` prepara os arquivos públicos e o catálogo inicial. `npm test` verifica o fluxo de login, upload, publicação, edição, concorrência, pausa, persistência e logout. O servidor legado `server.mjs` é apenas a referência anterior para hospedagem com volume; a Vercel usa `api/handler.js`.

A prévia independente consome `/api/products`. O site original só receberá os produtos desta instalação quando for conectado a essa API; essa integração não faz parte desta publicação separada.
