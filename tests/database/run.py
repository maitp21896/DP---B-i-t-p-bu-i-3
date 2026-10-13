"""Exercise the actual schema in an isolated Docker PostgreSQL database.
Run with: python tests/database/run.py [container-name]
The target MUST be a disposable test container, never a production database.
"""
import json, subprocess, sys, uuid
from pathlib import Path
root=Path(__file__).resolve().parents[2]
container=sys.argv[1] if len(sys.argv)>1 else 'glow-nature-rls-test'
database='glow_test_'+uuid.uuid4().hex
subprocess.run(['docker','exec',container,'psql','-U','postgres','-c','create database '+database],check=True,capture_output=True)
def sql(text, expected=None, fail=False):
 r=subprocess.run(['docker','exec','-i',container,'psql','-U','postgres','-d',database,'-v','ON_ERROR_STOP=1','-At'],input=text,text=True,capture_output=True)
 if fail:
  assert r.returncode!=0, 'Operation should have been denied'
  return r.stderr
 assert r.returncode==0, r.stderr
 if expected is not None: assert r.stdout.strip().splitlines()[-1]==str(expected), r.stdout
 return r.stdout
sql('''do $$begin if not exists(select 1 from pg_roles where rolname='anon') then create role anon nologin; end if; if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if; if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if; end$$;
create schema auth; create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema public,auth to anon,authenticated,service_role;
grant execute on function auth.uid() to anon,authenticated,service_role;
insert into auth.users values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');''')
sql((root/'supabase/schema.sql').read_text())
id='11111111-1111-4111-8111-111111111111'
call=f"select public.submit_campaign('{id}',repeat('a',64),repeat('b',64),'Học Viên Kiểm Thử','TEST01','[{{\"rationale\":\"original text\"}}]','[{{}}]',50,'source-hash','test-ip');"
sql('set role service_role;'+call)
sql('set role service_role;'+call)  # same receipt safely retries
sql('select count(*) from public.submissions;',1)
sql('select final_proposal->>\'rationale\' from public.submissions;','original text')
assert 'SUBMISSION_CONFLICT' in sql('set role service_role;'+call.replace("repeat('a',64)","repeat('c',64)"),fail=True)
sql('set role anon; select * from public.submissions;',fail=True)
sql('set role anon;'+call,fail=True)
sql('set role authenticated; select * from public.submissions;',fail=True)
sql('set role authenticated; select * from public.trainer_results;',fail=True)
sql('set role anon; select * from public.trainer_results;',fail=True)
sql('select count(*) from public.trainer_results;',1)
sql("select lap_luan_nguyen_van from public.trainer_results;",'original text')
sql('set role authenticated;'+call,fail=True)
sql('set role authenticated;'+f"delete from public.submissions where id='{id}';",fail=True)
sql("update public.submissions set submitted_at=now()-interval '91 days';")
sql('select public.cleanup_campaign_submissions();')
sql('select count(*) from public.submissions;',0)
sql('select count(*) from public.submission_receipts;',0)
sql("delete from public.submission_rate_limits; insert into public.submission_rate_limits values('test-ip',date_trunc('minute',now()),120);")
assert 'RATE_LIMIT' in sql('set role service_role;'+call,fail=True)
sql('select count(*) from public.submissions;',0)
sql("delete from public.submission_rate_limits; insert into public.submission_rate_limits values('global',date_trunc('minute',now()),300);")
assert 'RATE_LIMIT' in sql('set role service_role;'+call,fail=True)
sql('select count(*) from public.submissions;',0)
print('PASS: actual PostgreSQL schema; public access denial, Supabase owner results view, immutable records, safe retries/conflicts, atomic rate limits, retention and cascade deletion.')

subprocess.run(['docker','exec',container,'psql','-U','postgres','-c','drop database '+database],check=True,capture_output=True)
