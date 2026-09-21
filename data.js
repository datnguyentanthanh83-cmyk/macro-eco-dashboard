/* Macro Eco — daily content only. UI lives in index.html (do not replace daily). */
window.MACRO_DATA = {
  meta: {
    title: "Macro Markets Dashboard",
    subtitle: "Theo dõi hàng ngày · Rates · FX · Risk · Asia · cho Dat",
    dateLabel: "T2 · 21/09/2026",
    asOf: "As-of ~08:40 ICT",
    status: "Snapshot công khai"
  },
  kpis: [
    { label: "Fed funds", value: "3.75–4.00%", sub: "Sự kiện: +25bp ngày 16/09" },
    { label: "DXY", value: "100.22", subHtml: 'Tuần: <b class="up">+1.12%</b> · close 18/09' },
    { label: "UST 10Y", value: "~4.94%", subHtml: 'Ngày: <b class="down">−7bp</b> · tuần: <b class="down">−2bp</b>' },
    { label: "VN-Index", value: "1,815.66", subHtml: 'Ngày: <b class="down">−0.39%</b> · tuần: <b class="up">+1.14%</b>' }
  ],
  cards: [
    {
      icon: "📈", title: "US Rates & Fed", subtitle: "So với kỳ gần nhất (FOMC)", tag: "+25bp vs kỳ trước", tagClass: "green",
      level: "3.75–4.00%", levelSmall: "Fed funds",
      cols: ["Chỉ số", "Kỳ gần nhất", "Thay đổi"],
      rows: [
        { name: "Fed funds target", day: "3.50–3.75%", week: "+25bp", weekClass: "up" },
        { name: "FOMC quyết định 16/09", day: "Giữ / chờ", week: "Hike", weekClass: "up" },
        { name: "Dot-plot YE26 (median)", day: "—", week: "~4.1%" }
      ],
      note: "So sánh với kỳ họp / mức chính sách gần nhất — không dùng % ngày/% tuần.",
      news: "FOMC 16/09 tăng lãi lần đầu từ 2023 (+25bp); statement nhấn “timelier” về 2%. Tone vẫn hawkish."
    },
    {
      icon: "📊", title: "US Bond Yields", subtitle: "2Y · 10Y · Curve", tag: "bp · FRED/H.15", tagClass: "amber",
      level: "4.94%", levelSmall: "10Y · 17/09",
      cols: ["Chỉ số", "% ngày", "% tuần"],
      rows: [
        { name: "2Y UST · 17/09", day: "−7bp", dayClass: "down", week: "+4bp", weekClass: "up" },
        { name: "10Y UST · 17/09", day: "−7bp", dayClass: "down", week: "−2bp", weekClass: "down" },
        { name: "2s10s", day: "—", week: "—" }
      ],
      note: "Giá trị bp là thay đổi lợi suất, không phải % giá.",
      news: "Front-end quanh 4.67%; long-end 4.94–4.99%; curve dương hẹp khoảng +27bp."
    },
    {
      icon: "💵", title: "DXY", subtitle: "US Dollar Index", tag: "Tuần tăng", tagClass: "green",
      level: "100.22",
      cols: ["Chỉ số", "% ngày", "% tuần"],
      rows: [
        { name: "DXY · close 18/09", day: "—", week: "+1.12%", weekClass: "up" }
      ],
      note: "Không có daily close riêng cho sáng 21/09.",
      news: "DXY giữ trên 100 sau FOMC; mức 100.22 là weekly close được dùng cho snapshot."
    },
    {
      icon: "🔥", title: "Inflation", subtitle: "So tháng trước (MoM) · YoY", tag: "CPI nóng hơn", tagClass: "red",
      level: "3.4%", levelSmall: "CPI y/y · Aug",
      cols: ["Chỉ số", "MoM", "YoY"],
      rows: [
        { name: "CPI (Aug)", day: "+0.4%", dayClass: "up", week: "+3.4%", weekClass: "up" },
        { name: "Core CPI (Aug)", day: "+0.3%", dayClass: "up", week: "+2.4%", weekClass: "flat" },
        { name: "PCE (Jul)", day: "+0.2%", dayClass: "up", week: "+3.7%", weekClass: "up" },
        { name: "Core PCE (Jul)", day: "+0.2%", dayClass: "up", week: "+3.3%", weekClass: "up" }
      ],
      note: "MoM = so với tháng trước; YoY = so với cùng kỳ năm trước. Không dùng % ngày/% tuần.",
      news: "CPI Aug tăng tốc MoM; core YoY dịu nhẹ. PCE Jul vẫn cao — catalyst Aug PCE 30/09."
    },
    {
      icon: "🌍", title: "FX — Majors", subtitle: "Open Mon · thanh khoản mỏng", tag: "USD bid", tagClass: "",
      level: "USD bid",
      cols: ["Cặp tỷ giá", "% ngày", "% tuần"],
      rows: [
        { name: "EUR/USD · 1.1487", day: "—", week: "−1.14%", weekClass: "down" },
        { name: "GBP/USD · 1.3384", day: "—", week: "—" },
        { name: "USD/JPY · 156.83", day: "—", week: "—" },
        { name: "AUD/USD · 0.7114", day: "—", week: "—" }
      ],
      note: "EUR/USD: tuần 11–18/09 theo ECB reference; các cặp khác chưa xác minh.",
      news: "Nhật nghỉ lễ; rate differential vẫn ủng hộ USD. EUR/USD là cặp duy nhất có weekly change đã kiểm chứng."
    },
    {
      icon: "🏦", title: "Equities & Risk", subtitle: "US Fri · Asia reopen", tag: "Fri session", tagClass: "",
      level: "7,650", levelSmall: "S&P 500",
      cols: ["Chỉ số", "% ngày", "% tuần"],
      rows: [
        { name: "S&P 500 · ~7,650", day: "+0.2%", dayClass: "up", week: "—" },
        { name: "Nasdaq", day: "+0.4%", dayClass: "up", week: "—" },
        { name: "Dow", day: "−0.2%", dayClass: "down", week: "—" },
        { name: "Russell", day: "−0.5%", dayClass: "down", week: "—" }
      ],
      note: "% ngày là phiên Mỹ thứ Sáu 18/09; weekly chưa có trong snapshot.",
      news: "Quad-witching: tech/AI dẫn, breadth yếu. Asia mở cửa thận trọng trước UNGA và Trump–Xi."
    },
    {
      icon: "🛢️", title: "Oil & Commodities", subtitle: "WTI · Brent · Gold", tag: "Biến động cao", tagClass: "red",
      level: "$100.30", levelSmall: "WTI Fri settle",
      cols: ["Tài sản", "% ngày", "% tuần"],
      rows: [
        { name: "WTI · $100.30", day: "−1.58%", dayClass: "down", week: "+0.25%", weekClass: "up" },
        { name: "Brent · ~$103.87", day: "−0.91%", dayClass: "down", week: "−0.71%", weekClass: "down" },
        { name: "Gold · ~$4,378", day: "+0.84%", dayClass: "up", week: "+1.00%", weekClass: "up" }
      ],
      note: "WTI sáng T2 biến động ~$96–100; Gold spot close thứ Sáu.",
      news: "WTI có lúc lùi dưới $96; Brent $103–105; vàng vẫn ở vùng $4,300s sau tuần hồi phục."
    },
    {
      icon: "🇻🇳", title: "Asia / Việt Nam / EM", subtitle: "VN-Index · USD/VND", tag: "VN điều chỉnh", tagClass: "red",
      level: "1,815.66",
      cols: ["Chỉ số", "% ngày", "% tuần"],
      rows: [
        { name: "VN-Index", day: "−0.39%", dayClass: "down", week: "+1.14%", weekClass: "up" },
        { name: "HNX · 275.29", day: "+0.51%", dayClass: "up", week: "+0.96%", weekClass: "up" },
        { name: "SBV USD/VND · 25,637", day: "—", week: "—" },
        { name: "VCB mua/bán", day: "25,800/26,210", dayClass: "val", week: "—" }
      ],
      note: "Weekly VN/HNX: tuần 14–18/09; tỷ giá không gán thay đổi khi thiếu dữ liệu.",
      news: "FTSE Secondary EM hiệu lực hôm nay; dòng vốn là câu chuyện cấu trúc, không phải một phiên."
    },
    {
      icon: "🌏", title: "Asia extras", subtitle: "China · Japan · Korea", tag: "Mixed", tagClass: "",
      level: "LPR giữ",
      cols: ["Chỉ số", "% ngày", "% tuần"],
      rows: [
        { name: "China 1Y / 5Y LPR · 3.00% / 3.50%", day: "—", week: "—" },
        { name: "KOSPI open", day: "+0.93%", dayClass: "up", week: "—" },
        { name: "Japan · Nghỉ lễ", day: "—", week: "—" }
      ],
      note: "Không hiển thị change khi không có mức so sánh đáng tin cậy.",
      news: "PBoC giữ LPR; Seoul mở cửa mạnh nhờ chip; Nhật nghỉ lễ làm thanh khoản khu vực mỏng."
    }
  ],
  geoNews: {
    title: "Geo Pulse · Tin quan trọng",
    window: "24h · chốt ~19:10 ICT 21/09",
    sourceNote: "Brief Geo Pulse 21/09/2026 — không phải lời khuyên đầu tư.",
    items: [
      {
        tag: "Oil / Shipping",
        tagClass: "oil",
        when: "chiều 21/09 ICT",
        headline: "Tàu chở dầu bị “đạn không xác định” ở Hormuz; 2 thủy thủ thương nhẹ",
        summary: "UKMTO: tàu vào Hormuz trúng projectile không rõ nguồn; 2 thủy thủ thương nhẹ, tàu tự hành tiếp, chưa sự cố môi trường. Chưa bên nào nhận trách nhiệm. Eo đã thưa tàu nhiều tháng do xung đột Mỹ–Iran. Giữ premium địa chính trị trên dầu và rủi ro shipping dù eo chưa đóng hẳn.",
        url: "https://www.arabnews.com/middle-east/two-injured-after-unknown-projectile-strikes-tanker-in-hormuz-maritime-agency-3002531"
      },
      {
        tag: "Oil / Shipping",
        tagClass: "oil",
        when: "sáng 21/09 ICT",
        headline: "Lưu lượng Hormuz vẫn “nhỏ giọt”; Bab el-Mandeb chậm hơn cuối tuần",
        summary: "Reuters/Kpler: ~17 tàu hàng qua Hormuz cuối tuần 19–20/9 (vs ~37 tuần trước; trước chiến tranh ~125/ngày). Dầu vẫn chảy nhờ AIS tắt + STS Oman/Fujairah; Saudi tăng xuất Hormuz sau đòn Houthi East-West. Bab el-Mandeb 51 tàu (từ 57); Yanbu không loading từ 16/9. Cung Gulf đi được nhưng freight/bảo hiểm cao — hỗ trợ sàn dầu.",
        url: "https://www.reuters.com/world/middle-east/vessels-trickle-through-strait-hormuz-mideast-tension-persists-2026-09-21/"
      },
      {
        tag: "Oil / Shipping",
        tagClass: "oil",
        when: "sáng–trưa 21/09 ICT",
        headline: "Brent ~$101.7; Trump “probably open” gặp Pezeshkian tại UNGA, “deciding mode”",
        summary: "Brent ~$101.71 (−~$2, thấp nhất >1 tuần) trên kỳ vọng ngoại giao UNGA + Saudi XK phục hồi một phần. Pezeshkian tới NY; Trump nói Fox “probably” mở cửa gặp, cân nhắc áp lực kinh tế / quân sự / deal. Gặp chưa xác nhận. Ngoại giao đang kéo risk premium dầu xuống tạm; nếu deciding mode nghiêng quân sự thì dầu/USD/risk đảo nhanh.",
        url: "https://www.businesstimes.com.sg/companies-markets/energy-commodities/oil-hits-over-1-week-low-hopes-boost-diplomacy-iran-war"
      },
      {
        tag: "Mỹ – Trung",
        tagClass: "uscn",
        when: "đêm 20–sáng 21/09 ICT",
        headline: "Mỹ–Trung: Bessent/Greer đàm phán thương mại–AI trước Trump–Tập 24/09",
        summary: "Sau gặp Chủ nhật tại NY, Bessent & USTR Greer báo engagement tích cực về thương mại/AI; Mỹ đề xuất cơ chế thông báo sự cố AI + Board of Trade hàng non-sensitive. Trọng tâm thượng đỉnh 24/9: gia hạn đình chiến thuế (~hết hạn 10/11), không kỳ vọng breakthrough lớn; Đài Loan/Iran vẫn ẩn số.",
        url: "https://www.semafor.com/article/09/21/2026/us-chinese-officials-talk-trade-ai-ahead-of-xi-visit"
      },
      {
        tag: "Âu – Nga",
        tagClass: "eu",
        when: "đêm 20–sáng 21/09 ICT",
        headline: "Ukraine tấn UAV lớn vào Moskva; nhà máy lọc dầu vùng thủ đô bị hư hại",
        summary: "Đêm 19–20/9, Nga báo đánh chặn hàng nghìn UAV/tên lửa; Moskva/vùng Moskva bị tấn công — ≥3 chết; Gazpromneft-Moscow Oil Refinery thiệt hại theo nguồn UA/Nga. Zelensky xác nhận long-range responses, sẽ gặp Trump tại NY tuần UNGA. Nóng risk châu Âu và dầu sản phẩm khu vực; thứ cấp so với Hormuz/Iran với macro hiện tại.",
        url: "https://www.cnn.com/2026/09/20/europe/moscow-ukraine-attack-russia-election"
      }
    ]
  },
  comment: {
    badge: "Macro Eco · Nhận định",
    title: "Đánh giá & dự đoán sau tin địa chính trị",
    paragraphs: [
      "<strong>0) Kịch bản địa chính trị 24–72h (Geo Pulse).</strong> <em>Base:</em> Hormuz trickle + STS; không đóng eo; Brent ~$100–105 cân bằng đòn lẻ vs hy vọng UNGA + ổn định Mỹ–Trung trước 24/09. <em>Upside:</em> Gặp Trump–Pezeshkian hoặc đình chiến rõ + Trump–Tập gia hạn truce thuế → premium dầu giảm, risk-on. <em>Downside:</em> Thêm đòn Hormuz / Trump chọn bước quân sự → dầu spike, shipping freeze, USD/risk-off; UA–Nga chỉ khuếch đại phụ. Đây là kịch bản nghiên cứu, không phải lời khuyên đầu tư.",
      "<strong>1) Khung nghiên cứu — chế độ macro đang là gì?</strong> Snapshot đầu tuần (T2 21/09, ~08:40 ICT) cho thấy thị trường vẫn nằm trong chế độ <strong>“policy restriction + inflation residual + energy geopolitics”</strong>. FOMC ngày 16/09 đã tăng lãi +25bp lên 3.75–4.00% — lần tăng đầu kể từ 2023 — với thông điệp hướng tới việc đưa lạm phát về 2% “timelier”. Dot-plot trung vị quanh ~4.1% cuối 2026 hàm ý không gian cho thêm thắt chặt vẫn còn trong phân phối kỳ vọng. Hệ quả: USD được đỡ (DXY ~100.22, tuần +1.12%), lợi suất UST neo vùng cao (10Y ~4.94%, 2Y ~4.67%, 2s10s ~+27bp).",
      "<strong>2) Lạm phát &amp; neo kỳ vọng.</strong> CPI tháng 8 tăng tốc m/m (+0.4%) với headline y/y 3.4%; core dịu nhẹ về y/y (2.4%) nhưng m/m vẫn +0.3%. PCE tháng 7 vẫn cao: headline +3.7% y/y, core +3.3%. <em>Disinflation chưa đủ “sạch”</em> để Fed xoay dovish thuyết phục. Catalyst: Aug PCE (30/09), Sep CPI (14/10).",
      "<strong>3) Kênh truyền dẫn qua FX, equities và commodities.</strong> FX: USD bid trên differential; EUR/USD tuần −1.14%. Equities Mỹ selective (S&amp;P ~+0.2%, Nasdaq +0.4%). Dầu: WTI ~$100.30 (ngày −1.58%); Brent ~$103–105. Vàng ~$4,378 (+0.84% ngày / +1% tuần). <strong>Macro backdrop hỗ trợ USD &amp; yields; risk asset chưa all-clear.</strong>",
      "<strong>4) Việt Nam / EM — tách cấu trúc khỏi nhiễu ngắn hạn.</strong> FTSE Secondary Emerging Market hiệu lực hôm nay là sự kiện phân loại — dòng vốn thường phân tán theo thời gian. VN-Index 1,815.66 (−0.39% ngày / +1.14% tuần). Theo dõi nếu USD toàn cầu tiếp tục mạnh và dầu neo cao.",
      "<strong>5) Chiến lược Trading.</strong> (i) Bias trung hạn: “USD/yields được đỡ — equities selective”. (ii) Rates/FX: theo dõi 10Y ~5% và DXY giữ trên 100. (iii) Energy: dầu &gt;$100 + địa chính trị → quản trị biến động. (iv) VN/EM: nâng hạng = thesis dài hạn; ngắn hạn ưu tiên thanh khoản, ngoại, beta dầu/USD. (v) Catalyst tuần: Lagarde/flash PMI, UNGA–Trump–Xi, PCE 30/09 — size nhỏ hơn trước sự kiện nếu nhiều ô “—”.",
      "<strong>Kết luận vận hành:</strong> Research nói đây vẫn là môi trường macro thắt/đắt tiền + rủi ro năng lượng; trading nên selective và defensive-flexible, ưu tiên xác nhận từ dữ liệu thay vì narrative một ngày."
    ]
  },
  bottomLine: [
    "Hormuz trickle + UNGA/diplomacy tạm kéo premium dầu xuống; base Brent ~$100–105 — quyết định quân sự/deal của Trump và Trump–Tập 24/09 là hai nút đảo kênh.",
    "Việt Nam: nâng hạng FTSE là câu chuyện cấu trúc dài hạn, trong khi VN-Index điều chỉnh trong phiên.",
    "WTI và Gold có daily/weekly change đã kiểm chứng; các ô còn lại để “—” nếu thiếu mốc so sánh."
  ],
  catalysts: [
    { when: "30/09", what: "Aug PCE · thước đo ưa thích của Fed" },
    { when: "Tuần này", what: "Lagarde · Flash PMI · UNGA / Trump–Xi" },
    { when: "14/10", what: "Sep CPI" }
  ],
  footer: {
    left: "Macro Eco · Snapshot · index.html cố định · data.js đổi hàng ngày",
    source: "Nguồn: Fed/H.15 · FRED · ECB · public wires · Vietnam.vn"
  }
};