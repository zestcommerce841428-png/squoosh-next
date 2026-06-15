-- ============================================================================
-- Squoosh Next — Supabase schema (auth + profiles + OTP/2FA)
-- Run in the Supabase SQL editor of your NEW project, in order.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PROFILES (27+ fields). Keyed to auth.users.id.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text unique,
  -- Identity
  first_name        text,
  last_name         text,
  display_name      text,
  username          text unique,
  bio               text,
  avatar_url        text,
  -- Contact
  phone             text,
  phone_verified    boolean default false,
  -- Address
  address_line1     text,
  address_line2     text,
  city              text,
  state             text,
  postal_code       text,
  country           text,
  -- Personal
  date_of_birth     date,
  gender            text,
  -- Professional
  company           text,
  job_title         text,
  website           text,
  -- Social
  twitter           text,
  github            text,
  linkedin          text,
  instagram         text,
  -- Preferences
  language          text default 'en',
  timezone          text,
  theme             text default 'system',
  marketing_opt_in  boolean default false,
  newsletter        boolean default false,
  -- Security / 2FA
  totp_enabled      boolean default false,
  totp_secret       text,            -- encrypted at rest by Postgres; never expose via API
  backup_email      text,
  -- Meta
  role              text default 'user',
  onboarding_done   boolean default false,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- 2. AUTO-CREATE profile on signup (reads signup metadata)
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, first_name, last_name, display_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 3. EMAIL OTP codes (Hostinger-SMTP based login/verification)
-- ----------------------------------------------------------------------------
create table if not exists public.otp_codes (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  code_hash   text not null,          -- store a hash, never the raw code
  purpose     text not null default 'login',
  attempts    int default 0,
  expires_at  timestamptz not null,
  consumed    boolean default false,
  created_at  timestamptz default now()
);
create index if not exists idx_otp_email on public.otp_codes (email, purpose);
alter table public.otp_codes enable row level security;
-- No client policies: only the service role (server) touches this table.

-- ----------------------------------------------------------------------------
-- NOTE: Profile photos are stored on Hostinger via hostinger/upload.php,
-- not in Supabase Storage. profiles.avatar_url holds the Hostinger URL.
-- ----------------------------------------------------------------------------
