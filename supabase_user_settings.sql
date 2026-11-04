-- Game settings of the logged-in admin: one row per user, removed with the user.
-- Loaded into the lobby on login and saved when the admin leaves the rules screen for the questions.
-- Applied to the QuizCredo project as the migration `create_user_settings`, then
-- `add_cut_power_up_to_user_settings` (at the end of this file).

create table public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  question_count integer not null default 10 check (question_count between 10 and 50),
  timer_duration integer check (timer_duration between 60 and 300), -- null = unlimited
  max_category_selections integer not null default 5 check (max_category_selections between 3 and 10),
  top_categories_count integer not null default 10 check (top_categories_count between 5 and 15),
  low_time_threshold integer not null default 10 check (low_time_threshold between 5 and 20),
  critical_time_threshold integer not null default 5 check (critical_time_threshold between 3 and 10),
  streak_threshold integer not null default 5 check (streak_threshold between 1 and 10),
  enable_question_cache boolean not null default true,
  enable_debug_mode boolean not null default false,
  power_ups jsonb not null default '{
    "isEnabled": true,
    "handSize": 3,
    "enabled": {"freeze": true, "steal": true, "shield": true, "break": true, "bonus": true, "cut": true},
    "freezeQuestions": 2,
    "stealPoints": 30,
    "bonusPoints": 60,
    "cutPercent": 50
  }'::jsonb check (jsonb_typeof(power_ups) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.set_user_settings_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row execute function public.set_user_settings_updated_at();

alter table public.user_settings enable row level security;

create policy "Users read their own settings"
  on public.user_settings for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert their own settings"
  on public.user_settings for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update their own settings"
  on public.user_settings for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete their own settings"
  on public.user_settings for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.user_settings from anon;

-- The Cut power-up (migration `add_cut_power_up_to_user_settings`): the default above has it, and
-- the settings saved before it get it too, on, leaving 50% of the points (cutPercent), the rest as
-- it was saved. The frontend does the same when it reads settings saved before a power-up
-- (withPowerUpDefaults in src/types/powerUpSettings.ts)
alter table public.user_settings
  alter column power_ups set default '{
    "isEnabled": true,
    "handSize": 3,
    "enabled": {"freeze": true, "steal": true, "shield": true, "break": true, "bonus": true, "cut": true},
    "freezeQuestions": 2,
    "stealPoints": 30,
    "bonusPoints": 60,
    "cutPercent": 50
  }'::jsonb;

update public.user_settings
set power_ups = jsonb_build_object('cutPercent', 50)
  || power_ups
  || jsonb_build_object('enabled', jsonb_build_object('cut', true) || (power_ups -> 'enabled'))
where jsonb_typeof(power_ups -> 'enabled') = 'object'
  and not ((power_ups -> 'enabled') ? 'cut');
