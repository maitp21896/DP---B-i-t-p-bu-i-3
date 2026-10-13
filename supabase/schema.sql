-- Run once in Supabase SQL Editor. No credentials belong in this file.
begin;
create table if not exists public.trainers (
 user_id uuid primary key references auth.users(id) on delete cascade
);
create table if not exists public.submissions (
 id uuid primary key,
 student_name text not null check (char_length(student_name) between 3 and 100),
 class_code text not null check (class_code ~ '^[A-Z0-9][A-Z0-9_-]{1,23}$'),
 submitted_at timestamptz not null default now(),
 status text not null default 'submitted' check (status='submitted'),
 versions jsonb not null check (jsonb_typeof(versions)='array' and jsonb_array_length(versions) between 1 and 2 and octet_length(versions::text)<=65000),
 feedback jsonb not null check (jsonb_typeof(feedback)='array' and jsonb_array_length(feedback)=jsonb_array_length(versions)),
 final_score integer not null check (final_score between 0 and 70),
 final_version integer generated always as (jsonb_array_length(versions)-1) stored,
 final_proposal jsonb generated always as (versions -> (jsonb_array_length(versions)-1)) stored,
 data_version text not null
);
create index if not exists submissions_class_date on public.submissions(class_code,submitted_at desc);
create table if not exists public.submission_receipts (
 id uuid primary key references public.submissions(id) on delete cascade,
 token_hash text not null check(char_length(token_hash)=64),
 payload_hash text not null check(char_length(payload_hash)=64)
);
create table if not exists public.submission_rate_limits (
 key text not null,
 window_start timestamptz not null,
 attempts integer not null,
 primary key(key,window_start)
);
alter table public.trainers enable row level security;
alter table public.submissions enable row level security;
alter table public.submission_receipts enable row level security;
alter table public.submission_rate_limits enable row level security;
revoke all on public.trainers,public.submissions,public.submission_receipts,public.submission_rate_limits from anon,authenticated;
grant select on public.trainers,public.submissions to authenticated;
grant all on public.trainers,public.submissions,public.submission_receipts,public.submission_rate_limits to service_role;
drop policy if exists trainer_self on public.trainers;
create policy trainer_self on public.trainers for select to authenticated using(user_id=(select auth.uid()));
drop policy if exists trainer_read_submissions on public.submissions;
create policy trainer_read_submissions on public.submissions for select to authenticated using (
 submitted_at > now()-interval '90 days' and exists(select 1 from public.trainers where user_id=(select auth.uid()))
);
-- No anonymous reads/inserts, no client update/delete, and no trainer self-enrollment.
create or replace function public.submit_campaign(
 p_id uuid,p_token_hash text,p_payload_hash text,p_student_name text,p_class_code text,
 p_versions jsonb,p_feedback jsonb,p_final_score integer,p_data_version text,p_rate_key text
) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare receipt public.submission_receipts; saved_at timestamptz; bucket timestamptz:=date_trunc('minute',now()); attempt_count integer;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
 select * into receipt from public.submission_receipts where id=p_id;
 if found then
  if receipt.token_hash<>p_token_hash or receipt.payload_hash<>p_payload_hash then raise exception 'SUBMISSION_CONFLICT'; end if;
  select submitted_at into saved_at from public.submissions where id=p_id;
  return jsonb_build_object('id',p_id,'submitted_at',saved_at);
 end if;
 -- A per-IP limit allows a 20–40 learner classroom sharing one public IP.
 perform pg_advisory_xact_lock(hashtextextended(p_rate_key,1));
 select coalesce(sum(attempts),0) into attempt_count from public.submission_rate_limits where key=p_rate_key and window_start>=bucket-interval '1 minute';
 if attempt_count>=120 then raise exception 'RATE_LIMIT'; end if;
 -- Global minute limit prevents changing headers/addresses from bypassing all protection.
 perform pg_advisory_xact_lock(hashtextextended('global',2));
 select coalesce(sum(attempts),0) into attempt_count from public.submission_rate_limits where key='global' and window_start>=bucket-interval '1 minute';
 if attempt_count>=300 then raise exception 'RATE_LIMIT'; end if;
 insert into public.submission_rate_limits values(p_rate_key,bucket,1),('global',bucket,1)
 on conflict(key,window_start) do update set attempts=public.submission_rate_limits.attempts+1;
 insert into public.submissions(id,student_name,class_code,versions,feedback,final_score,data_version)
 values(p_id,p_student_name,p_class_code,p_versions,p_feedback,p_final_score,p_data_version) returning submitted_at into saved_at;
 insert into public.submission_receipts values(p_id,p_token_hash,p_payload_hash);
 return jsonb_build_object('id',p_id,'submitted_at',saved_at);
end; $$;
revoke all on function public.submit_campaign(uuid,text,text,text,text,jsonb,jsonb,integer,text,text) from public,anon,authenticated;
grant execute on function public.submit_campaign(uuid,text,text,text,text,jsonb,jsonb,integer,text,text) to service_role;
-- Daily retention cleanup. Receipts cascade; no personal data in rate-limit keys.
create or replace function public.cleanup_campaign_submissions() returns void
language sql security invoker set search_path=public,pg_temp as $$
 delete from public.submissions where submitted_at<=now()-interval '90 days';
 delete from public.submission_rate_limits where window_start<now()-interval '1 day';
$$;
revoke all on function public.cleanup_campaign_submissions() from public,anon,authenticated;
grant execute on function public.cleanup_campaign_submissions() to service_role;
commit;
