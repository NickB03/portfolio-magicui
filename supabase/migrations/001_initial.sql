-- Admin CMS Tables for Portfolio
-- Run this in your Supabase SQL Editor

-- Page layouts (UI Builder JSON)
create table if not exists pages (
  id text primary key,
  name text not null,
  layout jsonb not null,
  updated_at timestamptz default now()
);

-- Use case content (Markdown)
create table if not exists use_cases (
  id text primary key,
  title text not null,
  slug text unique not null,
  content text not null default '',
  description text default '',
  image text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Section content for editable text sections
create table if not exists sections (
  id text primary key,
  content text not null,
  updated_at timestamptz default now()
);

-- Insert default sections
insert into sections (id, content) values
  ('summary', 'Product leader with 16+ years in enterprise networking spanning sales, solutions architecture, and product management.')
on conflict (id) do nothing;

-- Insert initial use cases from current data
insert into use_cases (id, title, slug, description, image, active) values
  ('breezinet', 'BreeziNet', 'breezinet', '', '/breezi-preview.jpg', true),
  ('mns-order-automation', 'MNS Order Automation', 'mns-order-automation', '', '/mns-preview.jpg', true),
  ('business-virtual-agent', 'Business Virtual Agent', 'business-virtual-agent', '', '/bva-preview.jpg', true)
on conflict (id) do nothing;

-- Row level security (RLS) - disable for admin-only access
-- You can enable RLS and add policies if needed later
alter table pages enable row level security;
alter table use_cases enable row level security;
alter table sections enable row level security;

-- Create policies for public read access
create policy "Public read access for pages" on pages for select using (true);
create policy "Public read access for use_cases" on use_cases for select using (true);
create policy "Public read access for sections" on sections for select using (true);

-- Admin policies (using service role key for writes)
-- These are handled server-side with service role key
