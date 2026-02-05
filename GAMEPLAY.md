
# Lối Chơi & Cơ Chế - Bunny English Adventure

Tài liệu này mô tả chi tiết các cơ chế game (Game Mechanics) và vòng lặp trải nghiệm người dùng (Core Loop).

## 1. Vòng Lặp Cốt Lõi (Core Loop)
Người chơi tham gia vào vòng lặp sau:
1.  **Học tập**: Hoàn thành bài học để kiếm **Xu (Coins)** và **Sao (Stars)**.
2.  **Nông trại**: Dùng Xu mua hạt giống/con giống. Chăm sóc để thu hoạch nông sản.
3.  **Kinh doanh**: Dùng nông sản để hoàn thành **Đơn Hàng (Orders)** -> Nhận thêm Xu, XP Nông trại, và vật phẩm hỗ trợ (Nước, Phân bón).
4.  **Giải trí & Sưu tầm**: Dùng Sao để quay **Gacha**, sưu tầm vật phẩm hiếm và Avatar.

## 2. Hệ Thống Học Tập (Learning System)

Học sinh chọn Lớp (1-5) và Giáo trình (Global Success, Family & Friends...).

### Các chế độ học:
*   **Bí Kíp Thầy Rùa (Guide)**: AI tóm tắt từ vựng và mẫu câu của bài, tạo cảm giác như một người thầy đang giảng bài.
*   **Flashcard**: Học từ vựng với hình ảnh, phát âm, ví dụ.
*   **Dịch Thuật (Translation)**: Sắp xếp từ để tạo thành câu đúng nghĩa (Anh-Việt, Việt-Anh). Có AI chấm điểm và giải thích lỗi sai.
*   **Luyện Nói (Speaking)**: Sử dụng Micro để đọc từ. Hệ thống đánh giá độ chính xác.
*   **Thử Thách Tốc Độ (Time Attack)**: Chế độ ôn tập tổng hợp dạng game RPG vượt ải. Trả lời nhanh để đánh Boss.

## 3. Hệ Thống Nông Trại (Farm Sim)

Đây là tính năng "Meta-game" để giữ chân người dùng.

### Tài nguyên:
*   **Xu (Coin)**: Tiền tệ chính. Dùng mua hạt giống, vật nuôi, máy móc.
*   **Sao (Star)**: Tiền tệ cao cấp. Dùng mua đồ trang trí đẹp, cây thần kỳ, quay Gacha.
*   **Nước (Water)**: Cần thiết để tưới cây. Kiếm được qua Quiz hoặc Giếng thần.
*   **Phân bón (Fertilizer)**: Giảm thời gian tăng trưởng.

### Cơ chế:
1.  **Trồng trọt**: 
    *   Mua hạt -> Gieo hạt -> Tưới nước (bắt buộc) -> Chờ thời gian -> Thu hoạch.
    *   Có tỉ lệ xuất hiện sâu bệnh (cần giải đố để diệt).
2.  **Chăn nuôi**:
    *   Mua con giống -> Cho ăn (tốn nông sản) -> Chờ thời gian -> Thu hoạch sản phẩm.
    *   Ví dụ: Gà ăn Lúa mì -> Đẻ Trứng.
3.  **Chế biến (Máy móc)**:
    *   Biến nguyên liệu thô thành thành phẩm giá trị cao.
    *   Ví dụ: Lò bánh mì: Lúa mì + Trứng -> Bánh quy.
4.  **Đơn hàng (Orders)**:
    *   NPC yêu cầu một danh sách vật phẩm.
    *   Giao hàng nhận thưởng lớn (Coin + XP + Sao).
5.  **Kho & Bán**:
    *   Kho chứa không giới hạn.
    *   Có thể bán trực tiếp nông sản lấy Xu (giá thấp hơn giao đơn hàng).

## 4. Chế Độ Cốt Truyện (Story Adventure)
*   Hệ thống tự động tạo ra các đoạn hội thoại hoặc câu chuyện ngắn dựa trên từ vựng của bài học (sử dụng AI).
*   Người chơi đóng vai người dịch thuật để hiểu câu chuyện.
*   AI đánh giá bản dịch của người chơi (không cần khớp từng từ, chỉ cần đúng ý).

## 5. Hệ Thống Gacha & Sưu Tầm
*   **Cơ chế**: Bỏ Sao để quay trứng khủng long.
*   **Độ hiếm**: Thường (Common) -> Hiếm (Rare) -> Sử thi (Epic) -> Thần thoại (Legendary).
*   **Vật phẩm**: Các mô hình quái vật, nhân vật, đồ vật 2D đẹp mắt.
*   **Avatar**: Người chơi có thể dùng vật phẩm Gacha quay được làm Avatar đại diện.

## 6. Các Tính Năng Phụ Trợ
*   **Giếng Thần**: Mỗi ngày cho một lượng nước miễn phí. Hết nước phải trả lời câu hỏi tiếng Anh để lấy thêm.
*   **Thành Tựu**: Hệ thống huy hiệu ghi nhận tiến độ (VD: "Thu hoạch 100 cây", "Học 7 ngày liên tiếp").
*   **Cài đặt**: Tùy chỉnh âm lượng, reset dữ liệu, backup/restore dữ liệu (JSON).
