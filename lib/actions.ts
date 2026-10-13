export const actions = [
  {
    id: "broadCreative",
    group: "Nội dung quảng cáo",
    label: "Thử creative sản phẩm mới cho Broad",
    targets: ["broad"],
  },
  {
    id: "rtCreative",
    group: "Nội dung quảng cáo",
    label: "Đổi creative Retargeting để giảm lặp lại",
    targets: ["rt"],
  },
  {
    id: "benefit",
    group: "Nội dung quảng cáo",
    label: "Thử thông điệp lợi ích sản phẩm rõ hơn",
    targets: ["broad", "lal", "rt"],
  },
  {
    id: "scale",
    group: "Đối tượng",
    label: "Tăng ngân sách Lookalike từng bước",
    targets: ["lal"],
  },
  {
    id: "fatigue",
    group: "Đối tượng",
    label: "Giảm Retargeting và kiểm tra quy mô đối tượng",
    targets: ["rt"],
  },
  {
    id: "prospect",
    group: "Đối tượng",
    label: "Duy trì Broad để thu hút người truy cập mới",
    targets: ["broad"],
  },
  {
    id: "overlap",
    group: "Đối tượng",
    label: "Rà soát loại trừ và chồng chéo đối tượng",
    targets: ["all"],
  },
  {
    id: "speed",
    group: "Website / Landing page",
    label: "Kiểm tra tốc độ mobile và hụt Link Click → LPV",
    targets: ["broad", "lal", "rt", "all"],
  },
  {
    id: "product",
    group: "Website / Landing page",
    label: "Thử trang sản phẩm thay cho trang chủ",
    targets: ["broad", "lal", "rt"],
  },
  {
    id: "page",
    group: "Website / Landing page",
    label: "Cải thiện thông điệp và CTA trên trang sản phẩm",
    targets: ["broad", "lal", "rt", "all"],
  },
  {
    id: "tracking",
    group: "Đo lường",
    label: "Kiểm tra Pixel và tracking LPV",
    targets: ["all"],
  },
  {
    id: "placement",
    group: "Đo lường",
    label: "Phân tích theo placement và thiết bị",
    targets: ["all"],
  },
  {
    id: "recent",
    group: "Đo lường",
    label: "So sánh hiệu suất gần đây với trung bình 7 ngày",
    targets: ["broad", "lal", "rt", "all"],
  },
];
export const monitorOptions = [
  "Cost / LPV",
  "LPV Rate",
  "ATC Rate",
  "CPA",
  "Frequency",
  "CTR (Link)",
  "CPM",
];
