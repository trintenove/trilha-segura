-- Trilha Segura: estrutura do banco no Supabase.
-- Cole este script em: Supabase → SQL Editor → New query → Run.

create table if not exists public.viagens (
  id uuid primary key default gen_random_uuid(),
  trilha_id text not null,
  data date not null,
  status text not null default 'confirmada' check (status in ('alerta', 'confirmada')),
  risco_no_cadastro integer not null,
  sinalizada_bombeiros boolean not null default false,
  aceitou_risco boolean not null default false,
  responsavel jsonb not null default '{}'::jsonb,
  pessoas jsonb not null default '[]'::jsonb,
  demo boolean not null default false,
  criada_em timestamptz not null default now()
);

-- PROVA DE CONCEITO: qualquer pessoa com o link do app pode ler e gravar.
-- Use apenas dados fictícios na apresentação. Para uso real, restrinja a
-- leitura a bombeiros autenticados.
alter table public.viagens enable row level security;

drop policy if exists "poc_leitura" on public.viagens;
drop policy if exists "poc_cadastro" on public.viagens;
drop policy if exists "poc_atualizacao" on public.viagens;
drop policy if exists "poc_exclusao" on public.viagens;

create policy "poc_leitura" on public.viagens for select using (true);
create policy "poc_cadastro" on public.viagens for insert with check (true);
create policy "poc_atualizacao" on public.viagens for update using (true);
create policy "poc_exclusao" on public.viagens for delete using (true);

-- Liga o "tempo real": o painel dos bombeiros recebe cada alteração na hora.
do $$
begin
  alter publication supabase_realtime add table public.viagens;
exception when duplicate_object then null;
end $$;
