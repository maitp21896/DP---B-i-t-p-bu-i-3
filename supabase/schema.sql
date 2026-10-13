-- Run once in Supabase SQL Editor. No credentials belong in this file.
begin;
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
alter table public.submissions enable row level security;
alter table public.submission_receipts enable row level security;
alter table public.submission_rate_limits enable row level security;
revoke all on public.submissions,public.submission_receipts,public.submission_rate_limits from anon,authenticated;
grant all on public.submissions,public.submission_receipts,public.submission_rate_limits to service_role;
-- Remove the previous custom trainer policy; existing tables/records are preserved.
drop policy if exists trainer_read_submissions on public.submissions;
-- No app login is needed. Project owners view results in Supabase's own dashboard.
-- Public API users cannot read, insert, update or delete submissions directly.
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
-- A readable results view for the Supabase Table Editor (owner access only).
create or replace view public.trainer_results with (security_invoker=true) as
select id as ma_bai_nop, student_name as ho_va_ten, class_code as ma_lop,
 submitted_at as thoi_gian_nop, status as trang_thai,
 (final_proposal->'budgets'->>'broad')::bigint as ngan_sach_broad,
 (final_proposal->'budgets'->>'lal')::bigint as ngan_sach_lookalike,
 (final_proposal->'budgets'->>'rt')::bigint as ngan_sach_retargeting,
 final_proposal->>'rationale' as lap_luan_nguyen_van,
 final_proposal->>'rule' as dieu_kien_dieu_chinh,
 final_score as diem_tham_khao_tren_70,
 final_version+1 as phien_ban_cuoi,
 feedback->final_version->>'report' as bao_cao_day_du,
 versions as lich_su_de_xuat, feedback as phan_hoi_mo_phong
from public.submissions;
revoke all on public.trainer_results from public,anon,authenticated;
grant select on public.trainer_results to service_role;
commit;
