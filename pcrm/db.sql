create table contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  company text,
  created_at timestamp default now()
);

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  created_at timestamp default now()
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id),
  type text,
  notes text,
  created_at timestamp default now()
);

create table notes (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id),
  content text,
  created_at timestamp default now()
);