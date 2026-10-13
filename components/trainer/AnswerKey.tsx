export default function TrainerAnswerKey() {
  return (
    <div className="trainer-answer-key">
      <section className="card">
        <span className="eyebrow">TOMORROW MARKETERS · CASE GLOW NATURE</span>
        <h2>Đáp án gợi ý &amp; hướng dẫn nhận xét</h2>
        <p>
          Đáp án tham khảo cho trainer. Có nhiều chiến lược hợp lý; các scenario
          không phải dự báo kết quả và không dùng làm tỷ lệ cố định để chấm bài.
        </p>
      </section>
      <section className="card">
        <h2>{"1. Phân tích dữ liệu: Những kết luận học viên nên nhận ra"}</h2>
        <p>
          {
            "Bối cảnh: Glow Nature chạy Facebook Traffic 7 ngày với ba Ad Set Broad, Lookalike 1% và Retargeting. Mục tiêu chính là chất lượng truy cập website và xây dựng tệp khách hàng tiềm năng; Purchase và CPA chỉ là các chỉ số chẩn đoán bổ trợ."
          }
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">{"Chỉ số"}</th>
                <th scope="col">{"Broad"}</th>
                <th scope="col">{"Lookalike 1%"}</th>
                <th scope="col">{"Retargeting"}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{"Spend"}</th>
                <td>{"3.000.000đ"}</td>
                <td>{"3.000.000đ"}</td>
                <td>{"2.000.000đ"}</td>
              </tr>
              <tr>
                <th scope="row">{"Link Click"}</th>
                <td>{"1.700"}</td>
                <td>{"1.350"}</td>
                <td>{"750"}</td>
              </tr>
              <tr>
                <th scope="row">{"Landing Page View"}</th>
                <td>{"884"}</td>
                <td>{"945"}</td>
                <td>{"615"}</td>
              </tr>
              <tr>
                <th scope="row">{"LPV Rate"}</th>
                <td>{"52%"}</td>
                <td>{"70%"}</td>
                <td>{"82%"}</td>
              </tr>
              <tr>
                <th scope="row">{"Cost / LPV"}</th>
                <td>{"3.394đ"}</td>
                <td>{"3.175đ"}</td>
                <td>{"3.252đ"}</td>
              </tr>
              <tr>
                <th scope="row">{"Add to Cart"}</th>
                <td>{"31"}</td>
                <td>{"52"}</td>
                <td>{"49"}</td>
              </tr>
              <tr>
                <th scope="row">{"ATC / LPV"}</th>
                <td>{"3,5%"}</td>
                <td>{"5,5%"}</td>
                <td>{"8,0%"}</td>
              </tr>
              <tr>
                <th scope="row">{"Purchase"}</th>
                <td>{"9"}</td>
                <td>{"11"}</td>
                <td>{"13"}</td>
              </tr>
              <tr>
                <th scope="row">{"CPA"}</th>
                <td>{"333.333đ"}</td>
                <td>{"272.727đ"}</td>
                <td>{"153.846đ"}</td>
              </tr>
              <tr>
                <th scope="row">{"Frequency"}</th>
                <td>{"1,8"}</td>
                <td>{"2,4"}</td>
                <td>{"6,8"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          {
            "Ghi chú: Cost/LPV và tỷ lệ tính từ các tổng số giả lập; số tiền được làm tròn. Xu hướng CPA theo ngày cần đối chiếu dữ liệu gốc nếu sử dụng trong app."
          }
        </p>
        <h3>
          {
            "Insight 1 — Broad nhiều click nhưng chất lượng truy cập chưa tương xứng"
          }
        </h3>
        <ul>
          <li>
            {
              "1.700 Link Click, cao nhất trong ba nhóm, nhưng LPV Rate chỉ đạt 52%."
            }
          </li>
          <li>{"Cost/LPV 3.394đ và ATC/LPV 3,5%, đều kém hơn Lookalike."}</li>
          <li>
            {
              "Không nên loại bỏ Broad hoàn toàn vì nhóm này còn có vai trò tìm khách hàng mới."
            }
          </li>
        </ul>
        <p>
          {
            "Rationale: Cần kiểm tra placement, thời gian tải trang mobile, độ khớp quảng cáo–trang đích và tracking; không được khẳng định nguyên nhân chỉ từ LPV Rate."
          }
        </p>
        <h3>
          {"Insight 2 — Lookalike là ứng viên hợp lý để mở rộng có kiểm soát"}
        </h3>
        <ul>
          <li>
            {"Cost/LPV thấp nhất (3.175đ), LPV Rate 70% và ATC/LPV 5,5%."}
          </li>
          <li>
            {"Frequency 2,4 chưa gợi ý rõ việc tiếp cận lặp lại quá mức."}
          </li>
          <li>
            {
              "Chi phí hiệu quả ở mức chi 3 triệu không đảm bảo hiệu suất tương tự khi scale."
            }
          </li>
        </ul>
        <p>
          {
            "Rationale: Ưu tiên Lookalike có thể bảo vệ được bằng dữ liệu, nhưng cần kiểm tra hiệu quả biên sau khi tăng ngân sách."
          }
        </p>
        <h3>
          {"Insight 3 — Retargeting chuyển đổi tốt nhưng có rủi ro về quy mô"}
        </h3>
        <ul>
          <li>
            {"CPA thấp nhất (khoảng 154.000đ); ATC/LPV cao nhất (xấp xỉ 8%)."}
          </li>
          <li>
            {
              "Reach 12.000 và Frequency 6,8 là tín hiệu cần kiểm tra mức độ lặp lại."
            }
          </li>
          <li>
            {
              "Dữ liệu CPA cuối kỳ cao hơn đầu kỳ, nhưng số đơn từng ngày ít khiến chỉ số biến động mạnh."
            }
          </li>
        </ul>
        <p>
          {
            "Rationale: Có thể nghi ngờ Ad Fatigue/bão hòa tệp, chưa đủ chứng minh. Kiểm tra Reach, CTR, CPM, CVR và lượng người gia nhập tệp trước khi kết luận."
          }
        </p>
      </section>
      <section className="card">
        <h2>{"2. Ba scenario tối ưu đều có thể được chấp nhận"}</h2>
        <p>
          {
            "Không có đáp án phân bổ cố định. Mỗi scenario là một chiến lược có mục tiêu và rủi ro khác nhau. Tỷ lệ ngân sách là minh họa trong phạm vi 8.000.000đ và cần được triển khai có kiểm soát."
          }
        </p>
        <h3>{"Scenario 1 — Balanced Growth"}</h3>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">{"Ad Set"}</th>
                <th scope="col">{"Ngân sách"}</th>
                <th scope="col">{"Tỷ trọng"}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{"Broad"}</th>
                <td>{"2.400.000đ"}</td>
                <td>{"30%"}</td>
              </tr>
              <tr>
                <th scope="row">{"Lookalike"}</th>
                <td>{"4.000.000đ"}</td>
                <td>{"50%"}</td>
              </tr>
              <tr>
                <th scope="row">{"Retargeting"}</th>
                <td>{"1.600.000đ"}</td>
                <td>{"20%"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          {
            "Rationale: Lookalike cho thấy hiệu quả Cost/LPV và chất lượng traffic tốt; vẫn giữ Broad để tìm khách hàng mới. Giảm tỷ trọng Retargeting nhằm hạn chế rủi ro tiếp cận lặp lại khi Frequency cao."
          }
        </p>
        <p>{"Ba hành động tối ưu:"}</p>
        <ul>
          <li>
            {
              "1. Tăng ngân sách Lookalike từng bước; theo dõi Cost/LPV và ATC/LPV."
            }
          </li>
          <li>
            {
              "2. Kiểm tra placement, tốc độ tải trang mobile và tracking của Broad để tìm nguyên nhân LPV Rate thấp."
            }
          </li>
          <li>
            {
              "3. Làm mới creative Retargeting và kiểm tra Frequency, CTR, CPA trước khi scale."
            }
          </li>
        </ul>
        <p>
          {
            "Khi nào phù hợp: Doanh nghiệp muốn cân bằng tìm khách hàng mới và hiệu quả ngắn hạn."
          }
        </p>
        <p>
          {
            "Rủi ro/câu hỏi phản biện: Không mặc định hiệu quả Lookalike giữ nguyên khi tăng chi tiêu; giảm Retargeting có thể bỏ lỡ một phần đơn hàng."
          }
        </p>
        <h3>{"Scenario 2 — Acquisition First"}</h3>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">{"Ad Set"}</th>
                <th scope="col">{"Ngân sách"}</th>
                <th scope="col">{"Tỷ trọng"}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{"Broad"}</th>
                <td>{"3.200.000đ"}</td>
                <td>{"40%"}</td>
              </tr>
              <tr>
                <th scope="row">{"Lookalike"}</th>
                <td>{"3.200.000đ"}</td>
                <td>{"40%"}</td>
              </tr>
              <tr>
                <th scope="row">{"Retargeting"}</th>
                <td>{"1.600.000đ"}</td>
                <td>{"20%"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          {
            "Rationale: Ưu tiên phát triển nguồn khách hàng mới, kể cả Broad đang kém hơn. Chỉ hợp lý nếu đi kèm thử nghiệm cải thiện traffic, không đơn thuần giữ nguyên cách chạy."
          }
        </p>
        <p>{"Ba hành động tối ưu:"}</p>
        <ul>
          <li>
            {
              "1. Thử creative mới cho Broad, tập trung lợi ích cho da nhạy cảm."
            }
          </li>
          <li>
            {
              "2. Kiểm tra landing page mobile, Link Click→LPV, cân nhắc tối ưu LPV nếu phù hợp điều kiện đo lường."
            }
          </li>
          <li>
            {
              "3. Dùng Lookalike làm nhóm tham chiếu; so sánh Cost/LPV và ATC/LPV với Broad sau thay đổi."
            }
          </li>
        </ul>
        <p>
          {
            "Khi nào phù hợp: Doanh nghiệp chú trọng tăng quy mô khách hàng tiềm năng dài hạn và chấp nhận ngân sách thử nghiệm."
          }
        </p>
        <p>
          {
            "Rủi ro/câu hỏi phản biện: Broad có thể tiếp tục mang lại traffic chất lượng thấp; phải có tiêu chí dừng thử nghiệm."
          }
        </p>
        <h3>{"Scenario 3 — Conversion Support"}</h3>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">{"Ad Set"}</th>
                <th scope="col">{"Ngân sách"}</th>
                <th scope="col">{"Tỷ trọng"}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{"Broad"}</th>
                <td>{"2.000.000đ"}</td>
                <td>{"25%"}</td>
              </tr>
              <tr>
                <th scope="row">{"Lookalike"}</th>
                <td>{"3.600.000đ"}</td>
                <td>{"45%"}</td>
              </tr>
              <tr>
                <th scope="row">{"Retargeting"}</th>
                <td>{"2.400.000đ"}</td>
                <td>{"30%"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          {
            "Rationale: Retargeting có ATC/LPV, CPA tốt nhất nên có thể hỗ trợ chuyển đổi ngắn hạn. Đây là lựa chọn rủi ro cao hơn do Reach hạn chế, Frequency cao và CPA cuối kỳ xấu đi."
          }
        </p>
        <p>{"Ba hành động tối ưu:"}</p>
        <ul>
          <li>
            {"1. Thay creative Retargeting, tránh lặp cùng một thông điệp."}
          </li>
          <li>
            {
              "2. Kiểm tra quy mô và tốc độ bổ sung người mới vào tệp ViewContent 30 ngày; chỉ tăng chi nếu đủ bằng chứng."
            }
          </li>
          <li>
            {
              "3. Giữ Lookalike để bổ sung người mới, hạn chế phụ thuộc Retargeting."
            }
          </li>
        </ul>
        <p>
          {
            "Khi nào phù hợp: Doanh nghiệp ưu tiên hỗ trợ đơn hàng ngắn hạn và có thêm bằng chứng tệp Retargeting còn dư địa."
          }
        </p>
        <p>
          {
            "Rủi ro/câu hỏi phản biện: Tăng Retargeting chỉ vì CPA thấp nhất là lý do chưa đủ; cần bảo vệ giả định về quy mô tệp và hiệu quả biên."
          }
        </p>
      </section>
      <section className="card">
        <h2>{"3. KPI và nguyên tắc điều chỉnh theo scenario"}</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">{"Tiêu chí"}</th>
                <th scope="col">{"Balanced Growth"}</th>
                <th scope="col">{"Acquisition First"}</th>
                <th scope="col">{"Conversion Support"}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{"KPI chính"}</th>
                <td>{"Cost/LPV"}</td>
                <td>{"Cost/LPV"}</td>
                <td>{"ATC/LPV"}</td>
              </tr>
              <tr>
                <th scope="row">{"KPI bổ trợ"}</th>
                <td>{"ATC/LPV"}</td>
                <td>{"LPV Rate"}</td>
                <td>{"CPA"}</td>
              </tr>
              <tr>
                <th scope="row">{"Rủi ro theo dõi"}</th>
                <td>{"Frequency RT"}</td>
                <td>{"Chất lượng Broad"}</td>
                <td>{"Frequency + quy mô RT"}</td>
              </tr>
              <tr>
                <th scope="row">{"Khi cần xem xét"}</th>
                <td>{"Hiệu quả LAL suy giảm khi scale"}</td>
                <td>{"Broad vẫn kém sau thử nghiệm"}</td>
                <td>{"RT tần suất tăng nhưng chuyển đổi không cải thiện"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          {
            "Nguyên tắc: Không sử dụng một ngưỡng cứng cho mọi Ad Set. Quan sát nhiều chỉ số cùng lúc, đủ thời gian và khối lượng dữ liệu; phân biệt điều kiện kiểm tra với bằng chứng nhân quả."
          }
        </p>
        <p>
          {
            "Ví dụ monitoring plan: Nếu sau 3–4 ngày tăng ngân sách Lookalike, Cost/LPV tăng rõ so với giai đoạn trước và ATC/LPV cùng giảm, tạm dừng mở rộng để kiểm tra theo placement, creative, trang đích và tracking trước khi điều chỉnh tiếp."
          }
        </p>
      </section>
    </div>
  );
}
