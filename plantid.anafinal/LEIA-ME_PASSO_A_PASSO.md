# PlantID — como colocar tudo pra funcionar

## 1) Supabase (uma vez só) — SQL Editor, rode nesta ordem
1. `sql/1_estrutura_e_permissoes.sql`
2. `sql/2_catalogo_local.sql`
3. `sql/3_catalogo_expandido.sql`
4. `sql/4_ia.sql` (permite salvar fichas geradas pela IA)
5. `sql/5_progress_photos.sql` (fotos de progresso + storage)

No Supabase → Authentication → URL Configuration:
- Site URL = URL do seu app (ex.: https://seu-app.vercel.app)
- Redirect URLs = a mesma URL e `https://seu-app.vercel.app/reset-password`

Ative confirmação de e-mail em Authentication → Providers → Email.

## 2) Testar no seu computador
1. Crie um arquivo `.env` na raiz (copie o `.env.example`) com:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_PERENUAL_API_KEY` (opcional)
2. `npm install`
3. `npm run dev` → abra o endereço (http://localhost:5173)

> A IA (busca e chat) só funciona de verdade no deploy (Vercel), porque a chave fica no servidor.

## 3) Publicar na Vercel (grátis)
1. vercel.com → entrar com o GitHub → Add New → Project
2. Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_PERENUAL_API_KEY` (opcional)
   - **`GEMINI_API_KEY_ANAPLANTID`** = sua chave da API Gemini (Google AI Studio)
3. Deploy. O `vercel.json` já cuida das rotas e da pasta `api/`.

## Novidades desta versão
- Cadastro com e-mail de confirmação e recuperação de senha
- Medidor de luz: escolha plantas da sua lista e veja se a luz está boa
- Lembretes de rega e fertilização criados automaticamente ao adicionar uma planta
- Fale Conosco → WhatsApp (+55 17 98149-1206)
- Solicitar planta ausente pelo WhatsApp na busca
- Dica do dia personalizada com base nas suas plantas
- Clima com análise para as plantas da sua coleção
- Fotos de progresso (armazenadas no Supabase, permanecem após logout)
- Foto de perfil ajustável e com visualização ampliada
- IA via Gemini (`GEMINI_API_KEY_ANAPLANTID`)
- Interface toda em português
