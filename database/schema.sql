create extension if not exists "uuid-ossp";
create extension if not exists vector;

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

create table if not exists workspaces (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists memberships (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null check (role in ('admin', 'manager', 'agent')),
  created_at timestamptz default now(),
  unique(workspace_id, user_id)
);

create table if not exists contacts (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text,
  phone text,
  email text,
  tags text[] default '{}',
  notes text,
  created_at timestamptz default now()
);

create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  source text default 'chat',
  status text default 'new' check (status in ('new', 'qualified', 'won', 'lost')),
  assigned_to uuid references users(id),
  value numeric(12,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists conversations (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  contact_id uuid not null references contacts(id) on delete cascade,
  status text default 'open' check (status in ('open','closed')),
  assigned_to uuid references users(id),
  ai_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_type text not null check (sender_type in ('user','agent','ai','system')),
  content text not null,
  channel text not null check (channel in ('whatsapp','website')),
  created_at timestamptz default now()
);

create table if not exists tickets (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete set null,
  title text not null,
  priority text default 'medium' check (priority in ('low','medium','high','urgent')),
  status text default 'open' check (status in ('open','in_progress','resolved','closed')),
  sla_due_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists knowledge_base (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  source_type text not null check (source_type in ('pdf','web','manual')),
  source_content text not null,
  created_at timestamptz default now()
);

create table if not exists embeddings (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  knowledge_base_id uuid references knowledge_base(id) on delete cascade,
  chunk_text text not null,
  embedding vector(1536),
  created_at timestamptz default now()
);

create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  contact_id uuid not null references contacts(id) on delete cascade,
  amount numeric(10,2) not null,
  status text not null check (status in ('pending','verification_pending','success','failed')),
  upi_link text not null,
  screenshot_url text,
  verified_by uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists campaigns (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  message text not null,
  schedule_at timestamptz,
  status text default 'draft' check (status in ('draft','scheduled','running','completed','failed')),
  created_at timestamptz default now()
);

create index if not exists idx_messages_conversation_created on messages(conversation_id, created_at);
create index if not exists idx_payments_workspace_status on payments(workspace_id, status);
create index if not exists idx_embeddings_workspace on embeddings(workspace_id);
