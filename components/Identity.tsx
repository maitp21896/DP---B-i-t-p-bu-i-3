"use client";
import { Dispatch, SetStateAction, useState } from "react";
import { Session } from "@/types/campaign";
import { identitySchema } from "@/lib/submissions/schema";
export default function IdentityForm({
  s,
  set,
  start,
}: {
  s: Session;
  set: Dispatch<SetStateAction<Session>>;
  start: () => void;
}) {
  const [errors, setErrors] = useState<string[]>([]);
  return (
    <section className="card identity-card" id="student-info">
      <span className="eyebrow">TRƯỚC KHI BẮT ĐẦU</span>
      <h2>Thông tin học viên</h2>
      <p>
        Họ tên và mã lớp giúp giảng viên nhận diện bài nộp. Không cần tạo tài
        khoản. Bản nháp lưu trên thiết bị; khi bạn nộp, thông tin và đề xuất
        được gửi giảng viên và lưu tối đa 90 ngày.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const result = identitySchema.safeParse(s.identity);
          if (!result.success) {
            setErrors(result.error.issues.map((x) => x.message));
            return;
          }
          setErrors([]);
          start();
        }}
      >
        <div className="identity-grid">
          <label>
            Họ và tên
            <input
              autoComplete="name"
              disabled={!!s.delivery || !!s.pendingSubmission}
              required
              minLength={3}
              maxLength={100}
              value={s.identity.studentName}
              onChange={(e) =>
                set({
                  ...s,
                  identity: { ...s.identity, studentName: e.target.value },
                })
              }
              placeholder="Nguyễn Minh Anh"
            />
          </label>
          <label>
            Mã lớp
            <input
              autoComplete="off"
              disabled={!!s.delivery || !!s.pendingSubmission}
              required
              minLength={2}
              maxLength={24}
              value={s.identity.classCode}
              onChange={(e) =>
                set({
                  ...s,
                  identity: {
                    ...s.identity,
                    classCode: e.target.value.toUpperCase(),
                  },
                })
              }
              placeholder="DP27"
            />
          </label>
        </div>
        {errors.length > 0 && (
          <div className="error" role="alert">
            {errors.join(" ")}
          </div>
        )}
        <div className="bottom-actions">
          <small>
            Thông tin không phải mật khẩu và không cấp quyền truy cập bài của
            người khác.
          </small>
          <button type="submit">Khám phá chiến dịch →</button>
        </div>
      </form>
    </section>
  );
}
