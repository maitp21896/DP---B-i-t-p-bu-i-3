# Supabase & Vercel setup — beginner guide

The new backend is implemented, but **your Supabase project has not been connected or verified yet**. Keep the current deployed version until the following setup is complete. Do not share keys, passwords, or database connection strings in chat.

## 1. Create your project

Visit https://supabase.com, sign in, create a project named `glow-nature-simulator`, choose a region near Vietnam, and keep its database password in your password manager. Wait for the project to finish provisioning.

## 2. Create the tables and security policies

In your project, open **SQL Editor → New query**. Paste the complete contents of [supabase/schema.sql](../supabase/schema.sql) and click **Run**. The script creates submission tables, database authorization, atomic rate limiting and safe retry handling. It does not create any student account or grant trainer access automatically.

Do not disable Row Level Security. If you get an error, send the error text with any credentials removed.

## 3. Create and authorize a trainer

1. Open **Authentication → Users → Add user → Create new user**.
2. Enter the trainer's email and choose a strong password; confirm the email through the dashboard option. Do not enable public student signup. In Authentication settings, disable **Allow new users to sign up** if your project provides that toggle. Trainers are provisioned by you, not through this app.
3. In SQL Editor, run this query after replacing the example email with the email you used:

```sql
insert into public.trainers (user_id)
select id from auth.users where lower(email) = lower('your-trainer-email@example.com')
on conflict do nothing;

-- Verify that one authorized user exists (no passwords or tokens are returned).
select count(*) as authorized_trainers from public.trainers;
```

An Auth account without a row in `public.trainers` cannot read submissions. Name/class code are identification only and never grant authorization.

## 4. Add three variables securely in Vercel

Find your Supabase **Project URL**, **anon/public key**, and **service_role key** under **Project Settings → API / API Keys**. Newer dashboards may show a **Legacy anon, service_role API keys** tab; these are the keys used by this app. Copy values straight from Supabase to Vercel, not to chat.

Open your existing Vercel project → **Settings → Environment Variables**. Add:

| Name                            | Value from Supabase                                  | Where used                                                    |
| ------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Project URL, e.g. `https://your-project.supabase.co` | Browser and server                                            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` public key                                    | Trainer sign-in; RLS still restricts data                     |
| `SUPABASE_SERVICE_ROLE_KEY`     | `service_role` key                                   | Server only: writes through the validated submission endpoint |

Choose **Production** and **Preview** if you want to test the feature branch before merging. The service-role key must **never** have a `NEXT_PUBLIC_` prefix. It is never sent to the browser. Mark it sensitive where Vercel offers that option.

For local validation in this cloud workspace, add the same variables securely through environment settings. Do not paste secret values into the conversation. API access to your project's exact `your-project.supabase.co` hostname must also be allowed. Providing the non-secret Project URL in chat is sufficient to identify the required hostname; no keys are needed in chat.

## 5. Deploy the updated code

The changes are prepared on `feature/trainer-submissions`. Once code is pushed, use its Vercel Preview deployment to test before merging the feature Pull Request into `main`. If variables were added after a build, go to **Deployments → Redeploy** so public variables are included in the rebuilt browser app.

## 6. Verify real storage end-to-end

1. Open the app in one browser. Read the assignment, enter a test full name and class `TEST01`, and complete the exercise.
2. Run simulation. **No row should be saved yet.** Optionally revise once.
3. Check the final report and click **Nộp đề xuất cuối cùng**. Wait for the server-confirmed reference.
4. Open `/trainer` in another browser/device. Log in with the trainer account. Filter by `TEST01`; confirm the submission, timestamp, complete original rationale, feedback and revision history appear.
5. Open the detail and print the individual report; export the class CSV.
6. Refresh the learner page: the confirmed reference should remain. Retrying a request after an interrupted response must not create a second row.
7. Test a non-trainer Auth account and an unsigned request: both must be denied access to submissions. The anon key alone must not allow direct reads, inserts, or calls to `submit_campaign`.

The acceptance criterion “a confirmed submission appears on another device” cannot be marked passed until these checks succeed against your actual project. Local tests and mocked browser responses do not prove live Supabase connectivity.

## 7. Retention and deletion

Only name, class and educational work are stored. No student email, phone, password or raw IP address is collected. Reports can contain names, so share them only with authorized people. Server-side IP hashes are retained for up to one day for rate limiting. Submissions and retry receipts are retained for **90 days**, and expired submissions are hidden by RLS immediately.

In Supabase enable the **pg_cron** extension (Database → Extensions), then schedule cleanup in SQL Editor:

```sql
select cron.schedule(
  'glow-nature-daily-retention',
  '0 20 * * *',
  'select public.cleanup_campaign_submissions();'
);
```

This runs daily at 20:00 UTC (03:00 Vietnam time the next day). Schedule this only once. Inspect jobs with `select jobid, jobname, schedule from cron.job;`. If pg_cron is unavailable, run `select public.cleanup_campaign_submissions();` manually **daily** until scheduling is available. Monitor successful executions in `cron.job_run_details`.

To delete a particular student's submission after a verified request, use the private reference supplied by that student:

```sql
-- Replace the example UUID with the verified reference. This is permanent.
delete from public.submissions where id = '00000000-0000-0000-0000-000000000000';
```

Retry receipts are deleted automatically. Local drafts also expire after 90 days or on reset. Resetting the exercise only clears the browser draft; it does not delete a finalized server record. Also clear downloaded exports when their retention period ends. Supabase infrastructure backups follow the retention terms of your chosen plan; review those if you have additional privacy requirements.

To remove a trainer's access, delete their membership in `public.trainers` through your Supabase dashboard. API access and direct database reads will then be denied even if the Auth session still exists.

## Troubleshooting

- **Chưa cấu hình Supabase:** add all three variables and rebuild the deployment.
- **Chưa thể lưu bài lên database:** run the SQL schema, verify the server key and project URL, and inspect Supabase logs privately.
- **Tài khoản chưa được cấp quyền giảng viên:** authorize the Auth user's ID in `public.trainers`.
- **Too many requests:** wait two minutes before retrying. Rate limits allow a classroom of 20–40 learners behind one shared IP; they are basic abuse protection, not a complete bot defense. Apply Vercel Firewall/WAF rules if the public endpoint is abused.
- **Not reflected in trainer list:** ensure the learner received a server confirmation and the trainer uses the same Supabase project. Simulation/draft saving does not submit.
