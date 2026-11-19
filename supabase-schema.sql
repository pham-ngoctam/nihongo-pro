-- Nihongo Pro: one private progress record per authenticated user.
create table if not exists public.learning_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null default '{"xp":0,"completed":[],"known":[],"streak":0,"lastStudy":"","level":"Bắt đầu"}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.learning_progress enable row level security;

drop policy if exists "Users can read their own progress" on public.learning_progress;
create policy "Users can read their own progress"
on public.learning_progress for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own progress" on public.learning_progress;
create policy "Users can insert their own progress"
on public.learning_progress for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own progress" on public.learning_progress;
create policy "Users can update their own progress"
on public.learning_progress for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
