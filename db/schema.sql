-- Brick City Grove database (Tiger Cloud / Postgres + TimescaleDB).
-- Safe to run more than once.

-- Regular tables: things that change rarely.
create table if not exists places (
  id           text primary key,
  name         text not null,
  category     text not null,
  neighborhood text not null,
  hours        text not null,
  is_sample    boolean not null default true
);

-- Added after the first version, so existing databases get them too.
alter table places add column if not exists address text;
alter table places add column if not exists lat double precision;
alter table places add column if not exists lng double precision;
alter table places add column if not exists photo text;

create table if not exists events (
  id        text primary key,
  title     text not null,
  date      text not null,
  location  text not null,
  category  text not null,
  is_sample boolean not null default true
);

alter table events add column if not exists photo text;
alter table events add column if not exists description text;

create table if not exists jobs (
  id        text primary key,
  role      text not null,
  business  text not null,
  pay       text not null,
  shift     text not null,
  is_sample boolean not null default true
);

create table if not exists resources (
  id        text primary key,
  name      text not null,
  kind      text not null,
  location  text not null,
  detail    text not null,
  is_sample boolean not null default true
);

-- People who signed in with Google. role is null until they pick
-- "resident" or "business" on the welcome page. Business owners are linked to their place.
create table if not exists users (
  id         serial primary key,
  email      text unique not null,
  name       text,
  image      text,
  role       text check (role in ('resident', 'business')),
  place_id   text references places(id),
  created_at timestamptz not null default now()
);

-- Business verification.
-- places.status: new businesses added by owners stay 'pending' (hidden) until an admin approves.
alter table places add column if not exists status text not null default 'approved'
  check (status in ('pending', 'approved', 'rejected'));

-- users.business_status: a business account can't use the dashboard until it's 'approved'.
-- The other columns are what the owner gave us so an admin can check them (e.g. call the business).
alter table users add column if not exists business_status text
  check (business_status in ('pending', 'approved', 'rejected'));
alter table users add column if not exists owner_title text;
alter table users add column if not exists business_phone text;
alter table users add column if not exists business_website text;
update users set business_status = 'pending' where role = 'business' and business_status is null;

-- Email/password accounts (null for Google-only accounts). Stores a scrypt hash, never the password.
alter table users add column if not exists password_hash text;
-- Admin flag, set with: npm run make-admin -- someone@example.com
alter table users add column if not exists is_admin boolean not null default false;

-- Time-series table: one row per check-in or purchase at a business.
-- A hypertable is Tiger Data's version of a table that's fast for time-based data.
-- This will power the heatmap, business dashboard and "dollars kept local" counter.
create table if not exists visits (
  time         timestamptz not null,
  place_id     text not null references places(id),
  amount_cents integer not null default 0
);

select create_hypertable('visits', by_range('time'), if_not_exists => true);
