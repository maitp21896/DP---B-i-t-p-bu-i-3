export default function TrainerAnswerKey() {
  return (
    <div className="trainer-answer-key">
      <section className="card">
        <span className="eyebrow">TOMORROW MARKETERS · CASE GLOW NATURE</span>
        <h2>Đáp án gợi ý &amp; hướng dẫn nhận xét</h2>
        <p>
          {
            "Mình đề xuất xây đáp án theo hướng 3 scenarios chiến lược đều có thể hợp lý, tùy vào cách học viên nhìn nhận vấn đề và mức độ ưu tiên của doanh nghiệp."
          }
        </p>
        <p>
          {
            "Điểm quan trọng: Bài tập này không có một tỷ lệ phân bổ ngân sách duy nhất được xem là đúng. Trainer cần đánh giá học viên ở khả năng đọc dữ liệu → xác định vấn đề → đưa ra quyết định → giải thích và kiểm soát rủi ro."
          }
        </p>
      </section>
      <section className="card">
        <h2>{"1. Phân tích dữ liệu – Những kết luận học viên nên nhận ra"}</h2>
        <p>{"Dựa trên bộ dữ liệu Glow Nature đã xây dựng:"}</p>
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
            "Cost/LPV và các tỷ lệ được tính từ số liệu tổng hợp của case. Các kết luận về xu hướng CPA cần xem cùng bảng dữ liệu theo ngày."
          }
        </p>
        <h3>
          {
            "Insight 1 — Broad tạo nhiều Click nhưng chưa chuyển thành traffic chất lượng tương xứng"
          }
        </h3>
        <ul>
          <li>{"Tạo 1.700 Link Click, cao nhất trong ba nhóm."}</li>
          <li>{"Tuy nhiên, chỉ 52% số click chuyển thành LPV."}</li>
          <li>{"Cost/LPV đạt 3.394đ, cao nhất trong ba nhóm."}</li>
          <li>{"ATC/LPV chỉ 3,5%."}</li>
        </ul>
        <p>
          {
            "Rationale: Broad đang tạo ra nhiều lượt click nhưng tỷ lệ người thực sự vào trang đích và tiếp tục quan tâm sản phẩm chưa tốt. Tuy nhiên, không nên cắt toàn bộ ngân sách vì đây là nhóm phục vụ việc mở rộng khách hàng mới."
          }
        </p>
        <p>
          {
            "Giả thuyết cần kiểm tra: chất lượng placement, tốc độ tải trang, sự phù hợp giữa quảng cáo và trang đích, cũng như độ chính xác của tracking."
          }
        </p>
        <h3>
          {
            "Insight 2 — Lookalike là ứng viên phù hợp nhất để mở rộng ngân sách"
          }
        </h3>
        <ul>
          <li>{"Cost/LPV thấp nhất, khoảng 3.175đ."}</li>
          <li>{"LPV Rate 70%, cao hơn Broad đáng kể."}</li>
          <li>
            {
              "ATC/LPV 5,5%, cho thấy khách truy cập có xu hướng quan tâm sản phẩm cao hơn Broad."
            }
          </li>
          <li>
            {
              "Frequency 2,4, chưa cho thấy dấu hiệu rõ ràng của việc tiếp cận lặp lại quá mức."
            }
          </li>
        </ul>
        <p>
          {
            "Rationale: Lookalike hiện có sự cân bằng tốt giữa chi phí truy cập và chất lượng traffic, đồng thời vẫn có vai trò thu hút khách hàng mới."
          }
        </p>
        <p>
          {
            "Tuy nhiên, hiệu quả tốt khi chi 3 triệu đồng không đảm bảo giữ nguyên khi tăng ngân sách lên 4–5 triệu đồng."
          }
        </p>
        <h3>
          {
            "Insight 3 — Retargeting có khả năng chuyển đổi tốt nhưng tiềm ẩn rủi ro khi tăng ngân sách"
          }
        </h3>
        <ul>
          <li>{"CPA thấp nhất, khoảng 154.000đ."}</li>
          <li>{"ATC/LPV cao nhất, khoảng 8%."}</li>
          <li>{"Reach chỉ 12.000 và Frequency đã đạt 6,8."}</li>
          <li>
            {
              "Dữ liệu theo ngày cho thấy CPA cao hơn đáng kể ở những ngày cuối."
            }
          </li>
        </ul>
        <p>
          {
            "Rationale: Retargeting đang khai thác nhóm đã có mức độ quan tâm cao, nhưng việc liên tục tăng ngân sách có thể khiến quảng cáo lặp lại nhiều lần trước cùng một nhóm người."
          }
        </p>
        <p>
          {
            "Không thể kết luận chắc chắn tệp đã bão hòa chỉ từ Frequency và CPA. Cần kiểm tra thêm xu hướng Reach, CTR, CPM, CVR và lượng người mới gia nhập tệp."
          }
        </p>
      </section>
      <section className="card">
        <h2>{"2. Ba scenarios tối ưu hợp lý"}</h2>
        <p>{"Khuyến nghị tham khảo"}</p>
        <h3>{"Scenario 1 — Balanced Growth"}</h3>
        <p>
          {
            "Ưu tiên mở rộng Lookalike nhưng vẫn duy trì Broad để tìm khách hàng mới và Retargeting để khai thác nhu cầu đã có."
          }
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">{"Nhóm"}</th>
                <th scope="col">{"Ngân sách"}</th>
                <th scope="col">{"Tỷ trọng"}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{"Broad"}</th>
                <td>{"2,4 triệu"}</td>
                <td>{"30%"}</td>
              </tr>
              <tr>
                <th scope="row">{"Lookalike"}</th>
                <td>{"4 triệu"}</td>
                <td>{"50%"}</td>
              </tr>
              <tr>
                <th scope="row">{"Retargeting"}</th>
                <td>{"1,6 triệu"}</td>
                <td>{"20%"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          {
            "Rationale: Lookalike có hiệu quả traffic tốt nhất về Cost/LPV và tạo ra nhiều ATC hơn Broad. Broad được duy trì để tiếp tục tìm khách hàng mới, nhưng giảm tỷ trọng khi chất lượng truy cập còn hạn chế. Retargeting giảm nhẹ ngân sách nhằm kiểm soát Frequency và đánh giá khả năng bão hòa."
          }
        </p>
        <p>{"3 hành động ưu tiên:"}</p>
        <ol>
          <li>
            {
              "Tăng ngân sách Lookalike có kiểm soát, theo dõi Cost/LPV và ATC/LPV."
            }
          </li>
          <li>
            {
              "Kiểm tra placement, trang đích trên mobile và tracking của Broad để giải thích tỷ lệ LPV thấp."
            }
          </li>
          <li>
            {
              "Thay creative Retargeting và theo dõi Frequency, CTR, CPA trước khi tiếp tục tăng ngân sách."
            }
          </li>
        </ol>
        <p>
          {
            "Khi nào phù hợp: Doanh nghiệp muốn duy trì tăng trưởng khách hàng mới nhưng vẫn thận trọng về hiệu quả."
          }
        </p>
        <h3>{"Scenario 2 — Acquisition First"}</h3>
        <p>
          {
            "Đặt ưu tiên cao hơn vào phát triển nguồn khách hàng mới và làm giàu tệp Retargeting cho các giai đoạn tiếp theo."
          }
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">{"Nhóm"}</th>
                <th scope="col">{"Ngân sách"}</th>
                <th scope="col">{"Tỷ trọng"}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{"Broad"}</th>
                <td>{"3,2 triệu"}</td>
                <td>{"40%"}</td>
              </tr>
              <tr>
                <th scope="row">{"Lookalike"}</th>
                <td>{"3,2 triệu"}</td>
                <td>{"40%"}</td>
              </tr>
              <tr>
                <th scope="row">{"Retargeting"}</th>
                <td>{"1,6 triệu"}</td>
                <td>{"20%"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          {
            "Rationale: Mặc dù Broad có hiệu suất hiện tại kém hơn, doanh nghiệp đang ở giai đoạn xây dựng nhận diện và cần liên tục tiếp cận khách hàng mới. Giữ ngân sách đáng kể cho Broad có thể hợp lý nếu đi kèm kế hoạch cải thiện chất lượng traffic, thay vì tiếp tục chạy như cũ."
          }
        </p>
        <p>{"3 hành động ưu tiên:"}</p>
        <ol>
          <li>
            {
              "Thử nghiệm creative mới cho Broad, làm rõ lợi ích sản phẩm dành cho da nhạy cảm."
            }
          </li>
          <li>
            {
              "Kiểm tra và tối ưu trải nghiệm landing page trên mobile, đồng thời cân nhắc tối ưu theo LPV nếu chưa thực hiện."
            }
          </li>
          <li>
            {
              "Duy trì Lookalike làm nhóm tham chiếu hiệu quả và theo dõi chênh lệch Cost/LPV, ATC/LPV với Broad."
            }
          </li>
        </ol>
        <p>
          {
            "Khi nào phù hợp: Doanh nghiệp ưu tiên phát triển tệp khách hàng mới dài hạn và chấp nhận dành một phần ngân sách để thử nghiệm."
          }
        </p>
        <h3>{"Scenario 3 — Conversion Support"}</h3>
        <p>
          {
            "Ưu tiên khai thác nhu cầu hiện có nhiều hơn, nhưng vẫn giữ ngân sách tìm khách hàng mới."
          }
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">{"Nhóm"}</th>
                <th scope="col">{"Ngân sách"}</th>
                <th scope="col">{"Tỷ trọng"}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{"Broad"}</th>
                <td>{"2 triệu"}</td>
                <td>{"25%"}</td>
              </tr>
              <tr>
                <th scope="row">{"Lookalike"}</th>
                <td>{"3,6 triệu"}</td>
                <td>{"45%"}</td>
              </tr>
              <tr>
                <th scope="row">{"Retargeting"}</th>
                <td>{"2,4 triệu"}</td>
                <td>{"30%"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          {
            "Rationale: Retargeting có ATC/LPV và hiệu quả mua hàng tốt nhất. Doanh nghiệp có thể cân nhắc duy trì hoặc tăng nhẹ tỷ trọng để hỗ trợ doanh số ngắn hạn. Tuy nhiên, đây là lựa chọn rủi ro hơn vì Reach nhỏ và Frequency cao; cần kiểm tra khả năng mở rộng tệp trước khi triển khai."
          }
        </p>
        <p>{"3 hành động ưu tiên:"}</p>
        <ol>
          <li>
            {
              "Làm mới creative Retargeting, thử thông điệp khác với quảng cáo mà khách đã xem."
            }
          </li>
          <li>
            {
              "Kiểm tra quy mô và lượng người mới trong tệp ViewContent 30 ngày; chỉ tăng ngân sách khi dữ liệu ủng hộ."
            }
          </li>
          <li>
            {
              "Duy trì Lookalike để bổ sung nguồn khách hàng mới và tránh phụ thuộc hoàn toàn vào Retargeting."
            }
          </li>
        </ol>
        <p>
          {
            "Khi nào phù hợp: Doanh nghiệp chịu áp lực hỗ trợ đơn hàng ngắn hạn và có bằng chứng bổ sung rằng tệp Retargeting vẫn đủ dư địa."
          }
        </p>
        <p>
          {
            "Lưu ý cho trainer: Nếu học viên đề xuất tăng Retargeting chỉ vì CPA thấp nhất mà không thảo luận rủi ro bão hòa, đó là lập luận chưa đạt."
          }
        </p>
      </section>
      <section className="card">
        <h2>{"3. KPI và nguyên tắc điều chỉnh cho từng scenario"}</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">{"Tiêu chí"}</th>
                <th scope="col">{"Scenario 1: Balanced"}</th>
                <th scope="col">{"Scenario 2: Acquisition"}</th>
                <th scope="col">{"Scenario 3: Conversion"}</th>
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
                <th scope="row">{"Rủi ro cần theo dõi"}</th>
                <td>{"Frequency của Retargeting"}</td>
                <td>{"Chất lượng traffic Broad"}</td>
                <td>{"Frequency và quy mô Retargeting"}</td>
              </tr>
              <tr>
                <th scope="row">{"Quyết định cần xem xét"}</th>
                <td>{"Dừng tăng ngân sách LAL nếu hiệu quả suy giảm"}</td>
                <td>{"Giảm Broad nếu traffic vẫn kém sau tối ưu"}</td>
                <td>
                  {
                    "Không tăng tiếp RT nếu Frequency tăng nhưng chuyển đổi không cải thiện"
                  }
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          {
            "Các điều kiện điều chỉnh cần được học viên giải thích từ dữ liệu; không nhất thiết áp dụng một ngưỡng cứng cho tất cả nhóm quảng cáo."
          }
        </p>
        <p>{"Ví dụ về một nguyên tắc tương đối tốt:"}</p>
        <blockquote>
          <p>
            {
              "Nếu sau 3–4 ngày tăng ngân sách Lookalike, Cost/LPV tăng rõ so với giai đoạn trước, đồng thời ATC/LPV giảm, tôi sẽ tạm dừng tăng ngân sách, kiểm tra chất lượng traffic theo placement và creative trước khi điều chỉnh tiếp."
            }
          </p>
        </blockquote>
        <p>
          {
            "Đây là cách tốt hơn việc viết chung chung “theo dõi CPC, CPA và tối ưu khi chỉ số xấu”."
          }
        </p>
      </section>
    </div>
  );
}
