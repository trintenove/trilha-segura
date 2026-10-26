# Trilha Segura 🚒🌊

Prova de conceito (hackathon) para **prevenir acidentes com cabeça d'água** em trilhas e cachoeiras de **Minas Gerais**.
São dois apps com a mesma identidade visual, inspirada nos bombeiros:

| App | Para quem | O que faz |
|---|---|---|
| **Turista** (`/turista/`) | banhista / turista ecológico | vê a % de risco de cada trilha, confirma o local e faz a "reserva de viagem" |
| **Bombeiros** (`/bombeiros/`) | profissional do Corpo de Bombeiros Militar de MG (CBMMG) | mapa e lista de prioridade para **mobilizar recursos nas áreas de maior risco** |

> ⚠️ **Dados simulados.** As ocorrências do CBMMG e a previsão de chuva da Defesa Civil de MG são fictícias, apenas para demonstração.

**Área coberta:** somente Minas Gerais. São 12 locais em 6 regiões: Serra do Espinhaço, Alto Jequitinhonha, Oeste/Canastra, Zona da Mata, Sul de Minas e Região Metropolitana de BH. A lista está em [`src/shared/data/trilhas.js`](src/shared/data/trilhas.js).

## Como funciona

### Risco de cabeça d'água
O risco cruza duas fontes:
- **CBMMG**: número de ocorrências no local nos últimos 5 anos, que mostra o quanto o local é propenso;
- **Defesa Civil de MG**: probabilidade de chuva na região no dia, que é o gatilho.

```
risco = 15% × histórico + 85% × chuva × (0,3 + 0,7 × histórico)
```

| Faixa | Nível |
|---|---|
| < 30% | Baixo |
| 30–59% | Moderado |
| 60–80% | Alto |
| **> 80%** | **Crítico**: dispara o alerta aos bombeiros |

O código está em [`src/shared/risco.js`](src/shared/risco.js). Os dados simulados estão em [`src/shared/data/fontes.js`](src/shared/data/fontes.js); para usar dados reais, basta trocar essas funções.

### Fluxo do turista
1. Cadastra nome e telefone no primeiro acesso.
2. Vê **todas as trilhas** com a % de risco do dia, em lista ou mapa.
3. Abre uma trilha e vê o risco dos próximos 7 dias e de onde ele vem.
4. **Confirma o local e a data.** Se o risco passar de 80%, o app pergunta: *"Você tem certeza que quer selecionar esse lugar?"*
5. Se ele assumir o risco, os dados são **enviados imediatamente aos bombeiros como "potencial vítima"**.
6. Preenche a **reserva** como um carrinho de compras: botões **+ / −** para adultos, crianças e idosos que nadam ou não nadam (ex.: 2 adultos que nadam, 2 que não nadam, 1 criança que nada e 2 que não nadam).
7. A aba **Denunciar**, em vermelho, serve para avisar os bombeiros de uma **cabeça d'água acontecendo agora**:
   - botão para ligar 193;
   - local pelo GPS ou pela lista de trilhas;
   - sinais vistos: água subiu, água barrenta, galhos descendo, barulho, chuva rio acima;
   - se há gente em perigo e detalhes.

   Quem abre a trilha também vê o aviso "Cabeça d'água denunciada há X min".
8. A aba **"Picada de cobra"** está marcada como **EM BREVE**.

### Painel dos bombeiros
- Cadastro do profissional do CBMMG (nome, matrícula, unidade).
- Faixa explicando o **objetivo: facilitar a mobilização de recursos para as áreas mais arriscadas**.
- Indicadores: pessoas cadastradas, pessoas em área crítica, vulneráveis e potenciais vítimas.
- **Mapa**: o tamanho do círculo mostra o nº de pessoas e a cor mostra o risco. As áreas críticas pulsam.
- **Lista de prioridade** ordenada pelo risco, com pessoas, crianças, idosos e quem não sabe nadar em cada local.
- **Alerta ao vivo**, com som e vibração, quando um turista assume um risco acima de 80% ou faz uma **denúncia de cabeça d'água**.
- **Denúncias em aberto**: cada uma mostra local, sinais, se há pessoas em perigo e o contato de quem denunciou. O local denunciado vai para o **topo da prioridade** e ganha um marcador "!" no mapa. Ao clicar em "Marcar como atendida", a denúncia sai da lista.
- Botão para carregar e remover **dados de exemplo** na apresentação.

## Rodando no seu computador

Pré-requisito: [Node.js](https://nodejs.org) 20 ou superior.

```bash
npm install
npm run dev      # abre em http://localhost:5173
npm test         # testes do cálculo de risco
npm run build    # gera a versão de produção em dist/
```

Sem configurar nada, o app roda em **modo local** (indicador "Local" no topo): os dados ficam no navegador, e os dois apps se enxergam em **abas do mesmo navegador**.

## Colocando no ar (celulares diferentes)

Para o alerta sair do celular do turista e chegar ao celular do bombeiro, os dados precisam ficar online. Usamos o **Supabase** (banco grátis) e a **Vercel** (hospedagem grátis).

### 1. Supabase (banco de dados)
1. Crie uma conta em <https://supabase.com> e clique em **New project**. Anote a senha, mesmo que não vá usar.
2. No menu do projeto, abra **SQL Editor → New query**, cole o conteúdo de [`supabase/setup.sql`](supabase/setup.sql) e clique em **Run**.
3. Vá em **Project Settings → API**, ou no botão **Connect**, e copie:
   - **Project URL**, por exemplo `https://abcd1234.supabase.co`;
   - a chave pública: **anon public** ou **publishable key**. **Nunca** use a `service_role`/secret.

### 2. Vercel (site no ar)
1. Crie uma conta em <https://vercel.com> entrando com o GitHub.
2. Clique em **Add New → Project** e importe o repositório `trilha-segura`. A Vercel detecta o Vite sozinha.
3. Antes de clicar em Deploy, abra **Environment Variables** e cadastre:

   | Nome | Valor |
   |---|---|
   | `VITE_SUPABASE_URL` | a Project URL do Supabase |
   | `VITE_SUPABASE_KEY` | a chave pública (anon/publishable) |

4. Clique em **Deploy**. Você receberá um link como `https://trilha-segura.vercel.app`:
   - `.../turista/`: app do turista;
   - `.../bombeiros/`: painel dos bombeiros.

O topo dos apps deve mostrar **"Online"**. Se você mudar as variáveis depois, faça **Redeploy** na Vercel.

Para testar online no computador, copie `.env.example` para `.env.local`, preencha os dois valores e rode `npm run dev`.

### Roteiro sugerido para a apresentação
1. Abra o **painel dos bombeiros** no notebook ou telão e clique em **"Carregar dados de exemplo"**.
2. No celular, abra o **app do turista**, escolha **Cachoeira Grande – Serra do Cipó**, que sempre fica com risco crítico na demonstração, e clique em **Confirmar este local**.
3. Responda **"Sim, assumo o risco"**: o alerta de **potencial vítima** aparece na hora no painel.
4. Preencha o grupo, por exemplo com uma criança que não sabe nadar. O painel atualiza os números de vulneráveis.
5. No celular, vá na aba **Denunciar**, use a localização, marque os sinais e envie. A denúncia aparece na hora no painel, no topo da prioridade.

## Estrutura

```
index.html              página inicial (escolha do app)
turista/index.html      entrada do app do turista
bombeiros/index.html    entrada do app dos bombeiros
src/
  shared/               código comum aos dois apps
    risco.js            cálculo e níveis de risco
    agregacao.js        resumo por localidade para os bombeiros
    viagens.js          cadastro das viagens e alertas
    denuncias.js        denúncias de cabeça d'água
    armazenamento/      modo local (navegador) e online (Supabase)
    data/               trilhas e fontes simuladas (Bombeiros e Defesa Civil)
    componentes/        mapa, medidor de risco, ícones, logotipo
  turista/              telas do app do turista
  bombeiros/            telas do painel dos bombeiros
supabase/setup.sql      script do banco de dados
```

## Limitações da prova de conceito
- Dados de ocorrências e previsão **simulados**.
- Sem validação real de bombeiros: qualquer pessoa com o link acessa o painel.
- As regras do banco permitem leitura e escrita a qualquer pessoa com o link. **Use só dados fictícios** na apresentação. Para uso real, é preciso login dos bombeiros e regras de acesso restritas (LGPD).
