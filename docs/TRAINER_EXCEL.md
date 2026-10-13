# Trainer: public Excel download

For automatic updates in the supplied Google Sheet, follow [Google Sheets setup](GOOGLE_SHEETS_SETUP.md).

Open `https://dp-b-i-t-p-bu-i-3.vercel.app/trainer` and click **Tải Excel tổng hợp**. No account, token, or class code is needed. The page also includes a suggested answer for trainers.

Public access is intentional: anyone visiting this page can download student names, class codes, original answers, and submission timestamps. This setting was explicitly requested by the project owner. Supabase service-role credentials stay on the server; database tables do not become directly public.

Every successful submission is stored immediately with its receipt timestamp. Each download queries the latest stored results for all classes. The 20-minute timer is a reminder only: submissions remain accepted afterward, without late labels or score deductions.

The workbook includes **Tong hop lop**, **Lich su va phan hoi**, and **Huong dan**. Class codes remain available as an Excel filter. Original text is stored literally, not as executable formulas. Exports cover the last 90 days, with limits of 1,000 records and 4 MB; oversized exports return an error rather than silently omitting rows.

Vercel requires the existing Supabase URL and service-role key. `TRAINER_EXPORT_TOKEN` is no longer used and can be removed from Vercel. Old links containing `#key=...` still open the same public page.

Students may navigate back and forth, revise repeatedly, and submit new attempts after earlier submissions. Each successful attempt has its own receipt ID and remains available to the trainer. Retry of the same pending request does not duplicate that attempt. Draft previews retain the initial and latest decision, so intermediate edits do not accumulate an unbounded upload payload.
