# Gabs Scrubs

Loja e painel administrativo em `/admin.html`. O painel usa o mesmo fluxo do Seu Moura: usuário e senha, seleção de fotos, revisão antes de publicar, edição, pausa e logout. O catálogo existente é preservado e pode ser editado.

## Executar

Node 20 ou superior. Execute `npm ci`, configure `ADMIN_USER`, `ADMIN_PASSWORD` e `SESSION_SECRET` (segredo aleatório de pelo menos 32 caracteres) no ambiente privado e rode `npm start`. Sem configuração, o painel bloqueia o acesso. Nunca coloque credenciais no GitHub.

## Hospedar

O servidor precisa de HTTPS e um volume persistente. Configure `NODE_ENV=production`, `DATA_DIR=/data` e monte um volume em `/data`. Em Railway, use o repositório e `npm start`; mantenha uma única instância. Faça backup do volume que contém catálogo e fotos. GitHub Pages continua servindo a prévia estática, mas não executa o painel nem recebe publicações. Para operar o catálogo administrável, abra a loja e o painel no endereço do servidor Node.

A autenticação usa cookies HttpOnly/Secure/SameSite, sessões de oito horas, proteção CSRF e limite de tentativas. As fotos são decodificadas, redimensionadas e regravadas pelo servidor. Dados privados e código do servidor não são expostos pelo servidor HTTP.

Execute `npm test` para verificar login, publicação, edição, pausa, persistência e bloqueios de acesso.
