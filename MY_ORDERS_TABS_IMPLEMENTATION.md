# My Orders - Tab-based UI Implementation

## Tổng quan thay đổi

Đã refactor giao diện My Orders từ **Filter Modal** sang **Tab-based Navigation** với client-side filtering để cải thiện UX và phù hợp với số lượng đơn hàng vừa phải của dự án môn học.

## Thay đổi chính

### 1. **Tab Structure**

Thay thế Filter Modal bằng 4 tabs:

| Tab        | Label      | Icon                   | Statuses            |
| ---------- | ---------- | ---------------------- | ------------------- |
| All        | Tất cả     | albums-outline         | null (all orders)   |
| Processing | Đang xử lý | time-outline           | PENDING, CONFIRMED  |
| Completed  | Hoàn thành | checkmark-done-outline | SHIPPING, DELIVERED |
| Cancelled  | Đã hủy     | close-circle-outline   | CANCELLED           |

### 2. **TypeScript Types**

```typescript
type TabKey = "all" | "processing" | "completed" | "cancelled";

interface Tab {
  key: TabKey;
  label: string;
  icon: string;
  statuses: string[] | null;
}
```

### 3. **Client-side Filtering**

**useMemo hook** để tối ưu performance:

```typescript
// Filter orders based on active tab
const filteredOrders = useMemo(() => {
  const currentTab = TABS.find((tab) => tab.key === activeTab);
  if (!currentTab || !currentTab.statuses) {
    return orders;
  }
  return orders.filter((order) => currentTab.statuses!.includes(order.status));
}, [orders, activeTab]);

// Count orders for each tab
const tabCounts = useMemo(() => {
  const counts: Record<TabKey, number> = {
    all: orders.length,
    processing: 0,
    completed: 0,
    cancelled: 0,
  };

  orders.forEach((order) => {
    if (["PENDING", "CONFIRMED"].includes(order.status)) {
      counts.processing++;
    } else if (["SHIPPING", "DELIVERED"].includes(order.status)) {
      counts.completed++;
    } else if (order.status === "CANCELLED") {
      counts.cancelled++;
    }
  });

  return counts;
}, [orders]);
```

### 4. **Tab Bar Component**

```typescript
const renderTabBar = () => (
  <View className="bg-white border-b border-gray-200">
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const count = tabCounts[tab.key];

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`px-4 py-3 rounded-lg flex-row items-center ${
              isActive ? "bg-blue-600" : "bg-gray-100"
            }`}
          >
            <Ionicons
              name={tab.icon}
              size={18}
              color={isActive ? "#FFFFFF" : "#6B7280"}
            />
            <Text className={isActive ? "text-white" : "text-gray-700"}>
              {tab.label}
            </Text>
            {count > 0 && (
              <View className={isActive ? "bg-white/20" : "bg-blue-100"}>
                <Text className={isActive ? "text-white" : "text-blue-700"}>
                  {count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);
```

### 5. **Header Updates**

**Trước:**

- Title: "My Order"
- Nút Filter ở góc phải
- Section "Đang hiển thị" với filter label

**Sau:**

- Title: "Đơn hàng của tôi" (tiếng Việt)
- Badge tổng số đơn hàng ở góc phải
- Không còn section "Đang hiển thị"

```typescript
<View className="flex-row items-center px-4 py-3">
  <TouchableOpacity onPress={() => router.back()}>
    <Ionicons name="arrow-back" size={24} color="#2563eb" />
  </TouchableOpacity>
  <Text className="text-lg font-semibold flex-1">
    Đơn hàng của tôi
  </Text>
  {totalElements > 0 && (
    <View className="bg-blue-100 px-3 py-1.5 rounded-full">
      <Text className="text-sm font-bold text-blue-700">
        {totalElements} đơn
      </Text>
    </View>
  )}
</View>
```

## Removed Components

### ❌ Đã xóa:

1. **Filter Modal** - Modal popup với radio buttons
2. **renderFilterModal()** function
3. **handleFilterSelect()** function
4. **getCurrentFilterLabel()** function
5. **showFilterModal** state
6. **filterStatus** state
7. **FILTER_OPTIONS** constant
8. Import: `Modal`, `Pressable`

### ✅ Thay thế bằng:

1. **Tab Bar** - Horizontal scrollable tabs
2. **renderTabBar()** function
3. **activeTab** state (TabKey)
4. **tabCounts** - useMemo for counting
5. **filteredOrders** - useMemo for filtering
6. **TABS** constant array

## UI/UX Improvements

### Before:

```
┌─────────────────────────────────┐
│ ← My Order            [Filter]  │
├─────────────────────────────────┤
│ Đang hiển thị: Tất cả đơn hàng  │
│ 20 đơn                          │
├─────────────────────────────────┤
│ Order 1 (PENDING)               │
│ Order 2 (CONFIRMED)             │
│ Order 3 (SHIPPING)              │
│ ... (all mixed together)        │
└─────────────────────────────────┘
```

### After:

```
┌─────────────────────────────────┐
│ ← Đơn hàng của tôi      [20 đơn]│
├─────────────────────────────────┤
│ [Tất cả 20] Đang xử lý 8 ...    │ ← Tabs with counts
├─────────────────────────────────┤
│ Order 1 (PENDING)               │
│ Order 2 (CONFIRMED)             │
│ ... (filtered by tab)           │
└─────────────────────────────────┘
```

## Performance Optimization

### 1. **useMemo for Filtering**

- Chỉ re-calculate khi `orders` hoặc `activeTab` thay đổi
- Tránh filter lại mỗi lần render

### 2. **useMemo for Counting**

- Chỉ re-count khi `orders` thay đổi
- Badge counts luôn accurate

### 3. **Client-side Filtering**

- Không cần call API khi chuyển tab
- Instant switching
- Phù hợp với số lượng đơn hàng vừa phải (< 200)

## Layout Structure

```
View (Container)
├── Header (SafeAreaView)
│   └── Back Button | Title | Total Badge
├── Stack.Screen (hidden)
├── Tab Bar (ScrollView horizontal)
│   └── Tab Buttons with Icons & Counts
└── Order List (FlatList)
    ├── Pull to Refresh
    ├── Infinite Scroll
    └── OrderCard items (filtered)
```

## State Management

```typescript
// Previous
const [filterStatus, setFilterStatus] = useState<string | null>(null);
const [showFilterModal, setShowFilterModal] = useState(false);

// Current
const [activeTab, setActiveTab] = useState<TabKey>("all");
```

## Styling Consistency

### Tab Active State:

- **Background**: `bg-blue-600`
- **Text**: `text-white`
- **Icon**: `#FFFFFF`
- **Badge**: `bg-white/20` with `text-white`

### Tab Inactive State:

- **Background**: `bg-gray-100`
- **Text**: `text-gray-700`
- **Icon**: `#6B7280`
- **Badge**: `bg-blue-100` with `text-blue-700`

### Header Badge:

- **Background**: `bg-blue-100`
- **Text**: `text-blue-700` font-bold
- **Padding**: `px-3 py-1.5`
- **Border radius**: `rounded-full`

## Benefits

### ✅ UX Benefits:

1. **Faster Navigation** - No modal popup delay
2. **Visual Feedback** - See all tab counts at once
3. **Easy Switching** - One tap to change category
4. **Clear Organization** - Logical grouping of statuses
5. **Mobile-friendly** - Horizontal scroll for tabs

### ✅ Technical Benefits:

1. **Less Code** - Removed complex modal logic
2. **Better Performance** - useMemo optimization
3. **Type Safety** - Strict TabKey type
4. **Maintainable** - Simpler state management
5. **Scalable** - Easy to add new tabs

### ✅ Consistency Benefits:

1. **Vietnamese UI** - "Đơn hàng của tôi"
2. **Same Header Style** - Matches Privacy Policy
3. **Color Scheme** - Blue theme throughout
4. **Icon Style** - Outline icons consistent

## Migration Notes

### For Future Developers:

1. Tab configuration is in `TABS` array - easy to modify
2. Status mapping is in individual tab objects
3. Add new tab by adding to `TABS` array and updating `TabKey` type
4. Counts are auto-calculated via useMemo
5. No API changes needed - purely client-side

## Testing Checklist

- [x] All tabs display correctly
- [x] Tab counts are accurate
- [x] Filtering works for each tab
- [x] Pull to refresh maintains tab selection
- [x] Infinite scroll works in each tab
- [x] Empty state displays when no orders
- [x] Error state displays correctly
- [x] Back button navigates correctly
- [x] Total badge shows correct count
- [x] Tab switching is instant
- [x] Horizontal scroll works for many tabs

## Responsive Design

- Tabs use horizontal ScrollView
- No wrapping issues
- Works on all screen sizes
- Badge counts adjust size dynamically
- Icons scale properly

## Accessibility

- Clear tab labels
- Icon + text for better comprehension
- Badge counts for quick overview
- Touch targets are large enough (py-3)
- Color contrast meets standards

## Future Enhancements (Optional)

1. **Search within tabs** - Add search bar above list
2. **Sort options** - Date, amount, status
3. **Swipe gestures** - Swipe between tabs
4. **Tab animations** - Smooth transitions
5. **Persistent tab** - Remember last active tab
6. **Empty tab states** - Custom messages per tab
