# My Orders - 3 Tabs Layout (No Scroll)

## Thay đổi

Đã cập nhật giao diện My Orders từ 4 tabs (có scroll) sang 3 tabs chia đều màn hình (không scroll).

## Layout mới

```
┌─────────────────────────────────────┐
│ ← Đơn hàng của tôi         [20 đơn] │
├─────────────────────────────────────┤
│ [Đang xử lý] [Hoàn thành] [Đã hủy]  │ ← 3 tabs chia đều
│     (8)         (10)         (2)     │
├─────────────────────────────────────┤
│ Order Card 1                        │
│ Order Card 2                        │
└─────────────────────────────────────┘
```

## Chi tiết thay đổi

### 1. Tabs Configuration

**Trước (4 tabs với scroll):**

```typescript
type TabKey = "all" | "processing" | "completed" | "cancelled";
statuses: string[] | null;  // null cho "Tất cả"
```

**Sau (3 tabs fixed):**

```typescript
type TabKey = "processing" | "completed" | "cancelled";
statuses: string[];  // Không null, luôn có array
```

### 2. Tab Layout

**Trước:**

- ScrollView horizontal
- Tab với icon + text ngang
- Cần scroll để xem hết

**Sau:**

- View flex-row với justify-between
- Tab với icon + text dọc (items-center)
- 3 tabs chia đều, mỗi tab ~32% width
- Không cần scroll

### 3. Tab Structure

```typescript
const TABS: Tab[] = [
  {
    key: "processing",
    label: "Đang xử lý",
    icon: "time-outline",
    statuses: ["PENDING", "CONFIRMED"],
  },
  {
    key: "completed",
    label: "Hoàn thành",
    icon: "checkmark-done-outline",
    statuses: ["SHIPPING", "DELIVERED"],
  },
  {
    key: "cancelled",
    label: "Đã hủy",
    icon: "close-circle-outline",
    statuses: ["CANCELLED"],
  },
];
```

### 4. Default Tab

**Trước:** `activeTab = "all"`
**Sau:** `activeTab = "processing"` (tab đầu tiên)

### 5. Tab Render

```typescript
<View className="bg-white border-b border-gray-200 px-4 py-3">
  <View className="flex-row justify-between">
    {TABS.map((tab) => (
      <TouchableOpacity
        key={tab.key}
        className="flex-1 mx-1 px-3 py-3 rounded-lg items-center"
        style={{ maxWidth: '32%' }}
      >
        {/* Icon */}
        <Ionicons name={tab.icon} size={20} />

        {/* Label */}
        <Text className="mt-1 text-xs" numberOfLines={1}>
          {tab.label}
        </Text>

        {/* Count Badge */}
        {count > 0 && (
          <View className="mt-1 px-2 py-0.5 rounded-full">
            <Text className="text-xs">{count}</Text>
          </View>
        )}
      </TouchableOpacity>
    ))}
  </View>
</View>
```

## Visual Design

### Tab Layout:

```
┌────────┬────────┬────────┐
│  Icon  │  Icon  │  Icon  │
│  Text  │  Text  │  Text  │
│ (Count)│ (Count)│ (Count)│
└────────┴────────┴────────┘
   32%      32%      32%
```

### Spacing:

- Container: `px-4 py-3`
- Each tab: `mx-1` (margin horizontal)
- Internal: `px-3 py-3`
- Icon to text: `mt-1`
- Text to badge: `mt-1`

### Colors:

- **Active**: bg-blue-600, text-white, icon white
- **Inactive**: bg-gray-100, text-gray-700, icon gray-600
- **Badge active**: bg-white/20, text-white
- **Badge inactive**: bg-blue-100, text-blue-700

## Benefits

### ✅ UX:

1. **Tất cả tabs nhìn thấy ngay** - Không cần scroll
2. **Dễ tap** - 3 tabs lớn hơn 4 tabs
3. **Cân đối** - Chia đều màn hình
4. **Rõ ràng** - Chỉ hiển thị tabs cần thiết
5. **Mobile-friendly** - Không bị scroll ngang

### ✅ Technical:

1. **Đơn giản hơn** - Không cần ScrollView
2. **Performance** - Ít component hơn
3. **Responsive** - flex-row justify-between tự động chia đều
4. **Type-safe** - TabKey chỉ có 3 values

### ✅ Design:

1. **Consistent spacing** - maxWidth 32% đảm bảo cân đối
2. **Vertical layout** - Icon trên, text dưới, badge dưới cùng
3. **Clean UI** - Không có scroll indicator
4. **Professional** - Giống native apps

## Removed

- ❌ Tab "Tất cả" (all)
- ❌ ScrollView horizontal
- ❌ showsHorizontalScrollIndicator
- ❌ contentContainerStyle paddingHorizontal
- ❌ Tab layout flex-row (icon + text ngang)
- ❌ Import ScrollView

## Added

- ✅ justify-between cho flex-row
- ✅ items-center cho tab
- ✅ maxWidth: '32%' style
- ✅ numberOfLines={1} cho text
- ✅ Vertical tab layout (icon, text, badge dọc)

## Tab Counts Logic

Không thay đổi, vẫn count theo statuses:

```typescript
const tabCounts = useMemo(
  () => ({
    processing: orders.filter((o) =>
      ["PENDING", "CONFIRMED"].includes(o.status)
    ).length,
    completed: orders.filter((o) =>
      ["SHIPPING", "DELIVERED"].includes(o.status)
    ).length,
    cancelled: orders.filter((o) => o.status === "CANCELLED").length,
  }),
  [orders]
);
```

## Responsive Behavior

- **Small screens**: 3 tabs vừa đủ, không bị chật
- **Large screens**: 3 tabs chia đều, không bị rộng quá
- **maxWidth 32%**: Đảm bảo spacing giữa các tabs
- **mx-1**: Margin horizontal giữa tabs

## Testing

- [x] 3 tabs hiển thị đều nhau
- [x] Không có scroll ngang
- [x] Tab switching hoạt động
- [x] Badge counts hiển thị đúng
- [x] Active state đổi màu đúng
- [x] Icon + text + badge align vertical
- [x] Text truncate nếu quá dài (numberOfLines={1})
- [x] Touch targets đủ lớn

## Migration từ 4 tabs

1. Xóa tab "all" khỏi TABS array
2. Thay đổi TabKey type (bỏ "all")
3. Thay đổi default activeTab từ "all" → "processing"
4. Thay ScrollView → View với flex-row
5. Thay layout tab từ ngang → dọc
6. Thêm maxWidth: '32%'
7. Xóa import ScrollView

## Future Considerations

Nếu cần thêm tab thứ 4:

- Có thể quay lại dùng ScrollView
- Hoặc làm 2 hàng (2x2 grid)
- Hoặc dùng dropdown cho 1 trong các tabs
