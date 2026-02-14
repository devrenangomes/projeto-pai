-- Execute this in the Supabase SQL Editor

-- Enable UUID extension for generating unique IDs
create extension if not exists "uuid-ossp";

-- 1. Create Sheets Table
create table sheets (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  columns jsonb default '[]'::jsonb
);

-- 2. Create Rows Table
create table rows (
  id uuid default uuid_generate_v4() primary key,
  sheet_id uuid references sheets(id) on delete cascade not null,
  data jsonb default '{}'::jsonb
);

-- 3. Enable Row Level Security (RLS) - Optional for now but good practice
alter table sheets enable row level security;
alter table rows enable row level security;

-- 4. Create Policy to allow anonymous access (for simplicity in this phase)
-- WARNING: This allows anyone with the URL to read/write.
-- Ideally, we would add Authentication later.
create policy "Public Access Sheets" on sheets for all using (true);
create policy "Public Access Rows" on rows for all using (true);

-- 5. Insert Initial Data (Optional - creates a default sheet if empty)
insert into sheets (name, columns)
values ('Lista de Exemplo', '["Nome", "Cargo", "Salário"]'::jsonb);
