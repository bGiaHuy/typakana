# Báo cáo triển khai Kanji

## 1. Tóm tắt

Đã tích hợp trang `/kanji` và nút “Luyện Kanji (32 từ)” ở trang chủ. Không thêm dependency, không commit, push hoặc deploy.

## 2. Kiến trúc

Dùng Svelte 5/SvelteKit, component Button, các biến màu, khoảng cách, bo góc và hệ thống sáng/tối hiện có. Không tái sử dụng ProgressBar vì component đó phụ thuộc trực tiếp vào phiên luyện Kana. Dữ liệu, hàm chấm điểm và chuyển trạng thái được tách khỏi giao diện; trạng thái tạo riêng cho từng trang, không dùng store dùng chung phía máy chủ. Module không gọi API.

## 3. Các tệp tạo hoặc sửa trong tác vụ

| Tệp                                | Mục đích                                                                                       |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| `src/lib/kanji/vocabulary.ts`      | Kiểu dữ liệu, 32 từ, các cách đọc, nghĩa tương đương và nhóm từ.                               |
| `src/lib/kanji/quiz.ts`            | Chuẩn hóa, chấm từng ô, tổng điểm, lọc sai và chuyển trạng thái bài làm.                       |
| `src/lib/kanji/quiz.test.ts`       | Sáu nhóm kiểm thử bằng bộ chạy có sẵn của Node, không thêm thư viện.                           |
| `src/routes/kanji/+page.svelte`    | Trang luyện, chọn nhóm/chế độ, kết quả, tiến độ, hiện đáp án và làm lại.                       |
| `src/routes/kanji/KanjiRow.svelte` | Mỗi từ có hai input độc lập, nhãn truy cập và phản hồi đúng/sai.                               |
| `src/routes/+page.svelte`          | Thêm nút truy cập Kanji, giữ các nút bài luyện hiện có.                                        |
| `src/routes/+page.ts`              | Giới hạn chờ metadata GitHub ở 3 giây, dùng giá trị dự phòng khi lỗi để trang chủ vẫn mở được. |
| `package.json`                     | Thêm lệnh `npm test`.                                                                          |
| `tsconfig.json`                    | Cho phép đuôi `.ts` trong import để chạy kiểm thử trực tiếp bằng Node.                         |
| `KANJI_IMPLEMENTATION.md`          | Báo cáo hoàn thành này.                                                                        |

## 4. Chức năng

- Đủ 32 từ, lọc chính xác 32/20/12.
- Hiragana mặc định; Romaji tùy chọn. Đổi chế độ xóa cách đọc của mọi từ, giữ nghĩa; xóa kết quả, trạng thái hiện đáp án và lọc sai.
- Đổi nhóm giữ toàn bộ câu trả lời theo ID; xóa kết quả của nhóm cũ.
- Hai input mỗi từ; Kanji luôn hiển thị; điều hướng bàn phím theo thứ tự input.
- Mỗi ô 1 điểm; tối đa 64/40/24; hiển thị tổng điểm, số ô đúng/sai hoặc bỏ trống và thanh tiến độ.
- Chỉ hiện đáp án khi được yêu cầu; lọc các từ có ít nhất một ô sai.
- Làm lại xóa toàn bộ bài làm và kết quả, giữ nhóm và chế độ.
- Chỉnh sửa câu trả lời sau khi chấm sẽ xóa kết quả cũ, tránh điểm lỗi thời.
- Bố cục ba cột trên desktop; đưa Kanji lên đầu và xếp input theo chiều dọc trên màn hình hẹp. Tự dùng màu sáng/tối hiện có.

## 5. Kiểm tra đáp án

Chuẩn hóa Unicode NFKC, bỏ khoảng trắng đầu/cuối, gộp khoảng trắng liên tiếp và không phân biệt chữ hoa/thường. Romaji chấp nhận `ō` tương đương `ou`, `ū` tương đương `uu`; không bỏ nguyên âm, không fuzzy matching. Chấp nhận cả なん/なに và nan/nani cho 何. Nghĩa tiếng Việt được kiểm tra với danh sách từ đồng nghĩa trong dữ liệu, gồm cách viết số như “thứ hai”/“thứ 2”. Giữ dấu tiếng Việt để tránh chấp nhận từ khác nghĩa. Câu bỏ trống luôn 0 điểm.

## 6. Xác minh

- `npm test`: 6/6 nhóm kiểm thử đạt; bao gồm toàn bộ dữ liệu, nhóm, chuẩn hóa/cách đọc/nghĩa thay thế, đáp án sai/trống, điểm từng phần/tối đa, đổi nhóm/chế độ, làm lại, lọc sai và hiện đáp án không sửa bài làm.
- `npm run check`: 0 lỗi; 1 cảnh báo đã có ở `src/routes/setup/+page.svelte` về giá trị khởi tạo `data`.
- `npm run lint`: đạt (Prettier và ESLint).
- `npm run build`: đạt, gồm đóng gói adapter Vercel. Lần đầu trong sandbox lỗi EPERM đọc thư mục cha; chạy lại với quyền đọc phù hợp thành công.
- Trình duyệt: trang có 64 input; nhóm mới có 24; nhóm gốc có 40. Nhập 月 = つき/trăng cho kết quả 2/64, 2 ô đúng và 62 ô sai/chưa trả lời. Lọc sai còn 62 input; hiện đáp án hoạt động. Đổi nhóm vẫn giữ つき; đổi Romaji xóa cách đọc và giữ “trăng”. Làm lại xóa bài làm.
- Responsive: kiểm tra viewport điện thoại 375 × 812 (chiều rộng nội dung thực tế 360px sau thanh cuộn), chiều rộng trang bằng chiều rộng nội dung, input 312px, không tràn ngang. Quan sát giao diện tối trên trình duyệt.
- Trang chủ mở được khi GitHub không phản hồi, có nút Kanji; bấm nút mở đúng trang 32 từ.
- Các cảnh báo build sẵn có: Browserslist cũ, icon được giải quyết lúc chạy, cảnh báo khởi tạo `data` ở trang setup.

## 7. Lưu ý và giới hạn

Giữ nguyên 人才（じんさい）theo bộ từ được cung cấp, có ghi chú trong giao diện để phân biệt với từ thường dùng 人材（じんざい）; không tự thay dữ liệu. Cần người phụ trách nội dung xác nhận trước khi chỉnh mục này.

Bài làm chỉ lưu trong phiên trang hiện tại, mất khi tải lại/rời trang; không thêm lưu tiến độ lâu dài. Từ đồng nghĩa được khai báo rõ, không suy luận nghĩa tự do. Kiểm thử điện thoại dùng viewport trình duyệt, chưa kiểm tra trên thiết bị vật lý. Giao diện sáng dùng cùng token hiện có, chưa kiểm tra trực quan riêng ở lần này.

## 8. Đề xuất tiếp theo

Xác nhận mục 人才 với người biên soạn. Nếu cần, bổ sung lưu bài làm cục bộ và lịch sử điểm trong một tác vụ riêng; mở rộng danh sách nghĩa được chấp nhận dựa trên phản hồi người học.

## 9. Git

Nhánh hiện tại: `main`. Working tree đã có nhiều thay đổi và tệp mới trước tác vụ; giữ nguyên các thay đổi đó. Các tệp thuộc tác vụ được liệt kê ở mục 3. Không commit, push hoặc deploy.

## Cập nhật ngày 04/11/2026 — Chọn bài và hai chế độ

Phần này thay thế thông tin số lượng/luồng học ở báo cáo ban đầu: hiện có 46 thẻ, chia Bài 1 (12 thẻ theo xác nhận người dùng), Bài 2 (14 thẻ số đếm/tiền tệ), Bài 3 (20 thẻ ngày/thời gian). Truy cập `/kanji` mở màn chọn một hoặc nhiều bài, chọn Hiragana/Romaji và chế độ danh sách hoặc từng từ.

Chế độ danh sách giữ chức năng đảo thứ tự, làm lại, chấm toàn bài, lọc sai và hiện đáp án. Chế độ từng từ chấm độc lập hai ô ngay sau khi chốt; giữ nguyên câu đã nhập, khóa chỉnh sửa, hiện đáp án chuẩn để sửa sai rồi cho chuyển từ tiếp theo; cuối phiên hiển thị tổng điểm. Không tự chuyển nhanh làm mất thời gian đọc phản hồi.

Tệp cập nhật: `src/lib/kanji/vocabulary.ts` (phân bài và 14 thẻ mới), `src/lib/kanji/quiz.test.ts` (46 thẻ và số lượng từng bài), `src/routes/kanji/+page.svelte` (màn chọn bài), `src/routes/+page.svelte` (nhãn nút Bài 1–3). Tệp mới: `src/routes/kanji/KanjiList.svelte` (tách chế độ danh sách), `src/routes/kanji/KanjiSingle.svelte` (từng từ và phản hồi sau khi chốt).

Xác minh: 7/7 nhóm test đạt; check không lỗi, chỉ còn cảnh báo setup có sẵn; lint đạt; build Vercel đạt. Trình duyệt xác nhận chọn Bài 2 có 14 từ, trả lời sai 一 hiện いち/một, trả lời đúng 二 hiện đúng và cộng 2 điểm. Danh sách Bài 3 có 40 ô và kết quả thử 2/40 điểm.
