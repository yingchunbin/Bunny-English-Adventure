
# Cấu Trúc Ứng Dụng Bunny English Adventure

Tài liệu này mô tả kiến trúc mã nguồn (Source Code Architecture) của ứng dụng, giúp định hướng cho việc bảo trì và nâng cấp.

## 1. Tổng Quan
Ứng dụng được xây dựng trên nền tảng **React (Vite)**, sử dụng **TypeScript**.
- **State Management**: Quản lý trạng thái tập trung tại `App.tsx` (UserState) và truyền xuống các component con. Dữ liệu được lưu trữ cục bộ qua `localStorage`.
- **Styling**: TailwindCSS.
- **AI Integration**: Google Gemini API (thông qua `@google/genai`).
- **Icons**: Lucide React.
- **Audio**: Web Audio API tùy chỉnh (`utils/sound.ts`).

## 2. Cấu Trúc Thư Mục

```
/
├── index.html              # Entry point HTML (thiết lập viewport, styles cơ bản)
├── package.json            # Dependencies (React 18, GenAI SDK, Lucide, etc.)
├── tsconfig.json           # Cấu hình TypeScript
├── vite.config.ts          # Cấu hình Build & Environment Variables
├── src/
│   ├── index.tsx           # Entry point React (Mount App vào DOM, ErrorBoundary)
│   ├── App.tsx             # [CORE] Controller chính. Quản lý State, Routing màn hình, Save/Load.
│   ├── types.ts            # [CORE] Định nghĩa toàn bộ Interface (UserState, FarmItem, Lesson, v.v.)
│   ├── constants.ts        # Hằng số: Danh sách sách giáo khoa, Avatar, Icon từ vựng.
│   │
│   ├── components/         # UI Components
│   │   ├── AIChat.tsx          # Chatbot tự do với Thầy Rùa
│   │   ├── Avatar.tsx          # Hiển thị Avatar (Emoji hoặc Ảnh Gacha)
│   │   ├── ErrorBoundary.tsx   # Màn hình báo lỗi khi App crash
│   │   ├── FlashcardGame.tsx   # Game học từ vựng (Lật thẻ)
│   │   ├── GeneralAchievements.tsx # Bảng thành tích chung
│   │   ├── GachaScreen.tsx     # [FEATURE] Hệ thống quay thưởng
│   │   ├── LessonGuide.tsx     # Tóm tắt bài học (dùng AI tạo nội dung)
│   │   ├── MapScreen.tsx       # Bản đồ lộ trình học tập (SVG Path zig-zag)
│   │   ├── MemoryGame.tsx      # Minigame lật hình giống nhau
│   │   ├── Onboarding.tsx      # Màn hình chọn Lớp/Sách lần đầu
│   │   ├── Settings.tsx        # Cài đặt âm thanh, profile, backup data
│   │   ├── SpeakingGame.tsx    # Game luyện nói (Web Speech API)
│   │   ├── SpellingGame.tsx    # Game ghép chữ cái
│   │   ├── StoryAdventure.tsx  # [FEATURE] Chế độ cốt truyện (Interactive Translation)
│   │   ├── TimeAttackGame.tsx  # [FEATURE] Game vượt ải tính giờ (Boss battle)
│   │   ├── TranslationGame.tsx # Game sắp xếp câu
│   │   ├── ThreeDView.tsx      # (Ít dùng) Hiển thị model 3D
│   │   ├── WordImage.tsx       # Component hiển thị thẻ từ vựng (Auto-gen background)
│   │   │
│   │   ├── farm/               # [FEATURE] Các modal của Nông Trại
│   │   │   ├── AnimalShopModal.tsx
│   │   │   ├── BarnModal.tsx       # Kho hàng & Bán nông sản
│   │   │   ├── InventoryModal.tsx  # Túi đồ (Gieo hạt, đặt vật phẩm)
│   │   │   ├── ItemManageModal.tsx # Quản lý vật phẩm đã đặt (Cất/Bán)
│   │   │   ├── LearningQuizModal.tsx # Quiz nhanh để kiếm vật phẩm hỗ trợ
│   │   │   ├── MachineProductionModal.tsx # Giao diện máy chế biến
│   │   │   ├── MachineShopModal.tsx
│   │   │   ├── MissionModal.tsx    # Nhiệm vụ ngày & Thành tựu nông trại
│   │   │   ├── OrderBoard.tsx      # Bảng đơn hàng NPC
│   │   │   ├── PlotModal.tsx       # Giao diện ô đất (Gieo, Tưới, Bón phân)
│   │   │   ├── ShopModal.tsx       # Cửa hàng tổng hợp
│   │   │   └── WellModal.tsx       # Minigame lấy nước
│   │   │
│   │   └── ui/
│   │       └── ConfirmModal.tsx    # Modal xác nhận hành động
│   │
│   ├── data/               # Dữ liệu tĩnh (Database)
│   │   ├── farmData.ts         # Cấu hình Cây trồng, Vật nuôi, Máy móc, Công thức
│   │   ├── gachaData.ts        # Danh sách vật phẩm Gacha
│   │   ├── stories.ts          # Logic tạo truyện từ bài học
│   │   ├── types.ts            # Types cho dữ liệu bài học
│   │   └── grade[1-5]/         # Nội dung bài học phân theo Lớp & Sách
│   │       ├── global_success.ts
│   │       ├── family_friends.ts
│   │       ├── smart_start.ts
│   │       └── macmillan.ts
│   │
│   ├── hooks/
│   │   └── useFarmGame.ts      # [LOGIC] "Game Engine" của Nông trại (Tăng trưởng, Logic sản xuất)
│   │
│   ├── services/
│   │   └── geminiService.ts    # [AI] Wrapper gọi Google GenAI (Chấm điểm, Gợi ý, Tạo truyện)
│   │
│   └── utils/
│       ├── imageUtils.ts       # Xử lý URL ảnh (Google Drive thumbnail hack)
│       └── sound.ts            # Hệ thống âm thanh (Synth-based SFX & BGM)
```

## 3. Luồng Dữ Liệu Quan Trọng (Data Flow)

1.  **Khởi động (`App.tsx`)**:
    -   Kiểm tra `localStorage`.
    -   Nếu chưa có dữ liệu -> `Onboarding` (Chọn Lớp/Sách).
    -   Nếu có dữ liệu -> `Home` (MapScreen).

2.  **Học Tập (Learning Loop)**:
    -   `MapScreen` -> Chọn Level.
    -   `App.tsx` chuyển sang `Screen.GAME`.
    -   Tuần tự: `LessonGuide` (Lý thuyết AI) -> `Flashcard` -> `Translation` -> `Speaking`.
    -   Hoàn thành -> Cập nhật `UserState` (Coins, Stars, Unlock Level).

3.  **Nông Trại (Farming Loop)**:
    -   `Farm.tsx` render giao diện.
    -   `useFarmGame.ts` chạy vòng lặp thời gian (`setInterval`) mỗi 1s.
    -   Cập nhật trạng thái cây trồng/vật nuôi (Growth/Production).
    -   Tương tác người dùng (Tưới, Thu hoạch) -> Gọi hàm trong hook -> Update `UserState`.

4.  **AI Service**:
    -   Không gọi trực tiếp từ View nếu có thể.
    -   Xử lý lỗi mạng/API Key thiếu bằng fallback logic (chế độ Offline giả lập).

## 4. Các Điểm Cần Lưu Ý
-   **An toàn dữ liệu**: Hệ thống migrate (`migrateState`) trong `App.tsx` rất quan trọng để tránh lỗi khi cập nhật cấu trúc `UserState`.
-   **Hiệu năng**: `useFarmGame` chạy timer global, các component con của Farm sử dụng `React.memo` để tránh re-render không cần thiết.
-   **Tài nguyên**: Ảnh được load từ Google Drive qua `imageUtils`, âm thanh được tạo sinh (Synthesized) để giảm dung lượng app.
