# Tài liệu API Mã Giảm Giá (Voucher)

## Mục lục
- [Giới thiệu](#giới-thiệu)
- [Cấu trúc dữ liệu](#cấu-trúc-dữ-liệu)
- [API Endpoints](#api-endpoints)
- [Cách sử dụng trong dự án](#cách-sử-dụng-trong-dự-án)
- [Ví dụ thực tế](#ví-dụ-thực-tế)

---

## Giới thiệu

Hệ thống mã giảm giá (Voucher) trong TechBox Store cho phép:
- **Admin**: Tạo, quản lý, theo dõi các mã giảm giá
- **Khách hàng**: Áp dụng mã giảm giá khi thanh toán đơn hàng

### Loại mã giảm giá
1. **PERCENTAGE**: Giảm theo phần trăm (VD: 10%, 20%)
2. **FIXED_AMOUNT**: Giảm số tiền cố định (VD: 50.000đ, 100.000đ)

---

## Cấu trúc dữ liệu

### Voucher Interface
```typescript
interface Voucher {
  id: number;
  code: string;                    // Mã voucher (VD: "SUMMER2024")
  voucherType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;                   // Giá trị (10 = 10% hoặc 10000đ)
  minOrderAmount: number;          // Đơn hàng tối thiểu
  usageLimit: number;              // Giới hạn số lần sử dụng
  usedCount: number;               // Số lần đã sử dụng
  reservedQuantity: number;        // Số lượng đang được giữ chỗ
  availableQuantity: number;       // Số lượng còn lại
  validFrom: string;               // Ngày bắt đầu (ISO 8601)
  validUntil: string;              // Ngày kết thúc (ISO 8601)
  isValid: boolean;                // Còn hiệu lực?
  hasUsageLeft: boolean;           // Còn lượt sử dụng?
  isDeleted: boolean;              // Đã xóa?
  createdAt: string;
  updatedAt: string;
}
```

### VoucherValidation Interface
```typescript
interface VoucherValidation {
  isValid: boolean;                // Mã có hợp lệ?
  message: string;                 // Thông báo
  voucher?: {
    id: number;
    code: string;
    voucherType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    value: number;
    minOrderAmount: number;
    usageLimit: number;
    usedCount: number;
    hasUsageLeft: boolean;
  };
  discountAmount: number;          // Số tiền được giảm
  finalAmount: number;             // Tổng tiền sau giảm
  discountPercentage?: number;     // % giảm (nếu là PERCENTAGE)
  errorType?: string;              // Loại lỗi (nếu có)
}
```

---

## API Endpoints

### 1. Tạo Voucher Mới
**Admin only**

```typescript
// Service: src/services/promotionService.ts
voucherService.create(data)
```

**Request:**
```typescript
{
  code: string;                    // Mã voucher (viết hoa, duy nhất)
  voucherType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;                   // Giá trị giảm
  minOrderAmount: number;          // Đơn hàng tối thiểu
  usageLimit: number;              // Giới hạn số lần dùng
  validFrom: string;               // ISO 8601 datetime
  validUntil: string;              // ISO 8601 datetime
}
```

**Response:**
```typescript
Voucher // Object voucher vừa tạo
```

**Ví dụ:**
```typescript
import { voucherService } from '@/services/promotionService';

const newVoucher = await voucherService.create({
  code: "SUMMER2024",
  voucherType: "PERCENTAGE",
  value: 15,                       // Giảm 15%
  minOrderAmount: 500000,          // Đơn tối thiểu 500k
  usageLimit: 100,                 // Giới hạn 100 lần
  validFrom: "2024-06-01T00:00:00Z",
  validUntil: "2024-08-31T23:59:59Z"
});
```

---

### 2. Cập nhật Voucher
**Admin only**

```typescript
voucherService.update(code, data)
```

**Parameters:**
- `code`: Mã voucher cần cập nhật
- `data`: Các field cần thay đổi (partial)

**Ví dụ:**
```typescript
await voucherService.update("SUMMER2024", {
  value: 20,                       // Tăng lên 20%
  usageLimit: 200,                 // Tăng giới hạn
  validUntil: "2024-09-30T23:59:59Z" // Gia hạn
});
```

---

### 3. Lấy danh sách Voucher
**Admin only**

```typescript
voucherService.getAll(params?)
```

**Parameters (optional):**
```typescript
{
  page?: number;        // Trang (mặc định 0)
  size?: number;        // Số voucher/trang (mặc định 10)
  sortBy?: string;      // Sắp xếp theo field (VD: "createdAt")
  sortDir?: 'ASC' | 'DESC'; // Chiều sắp xếp
}
```

**Response:**
```typescript
{
  content: Voucher[];              // Danh sách voucher
  totalElements: number;           // Tổng số voucher
  totalPages: number;              // Tổng số trang
  first: boolean;                  // Trang đầu tiên?
  last: boolean;                   // Trang cuối?
  // ... các field khác
}
```

**Ví dụ:**
```typescript
const result = await voucherService.getAll({
  page: 0,
  size: 20,
  sortBy: 'createdAt',
  sortDir: 'DESC'
});

console.log(result.content); // Array các voucher
console.log(result.totalPages); // Số trang
```

---

### 4. Lấy Voucher còn hiệu lực
**Admin only**

```typescript
voucherService.getValid(params?)
```

Trả về danh sách voucher đang còn hiệu lực (chưa hết hạn, còn lượt sử dụng).

---

### 5. Lấy Voucher theo mã
**Public/Admin**

```typescript
voucherService.getByCode(code)
```

**Ví dụ:**
```typescript
const voucher = await voucherService.getByCode("SUMMER2024");
console.log(voucher.value); // 15
console.log(voucher.voucherType); // "PERCENTAGE"
```

---

### 6. Kiểm tra mã có tồn tại
**Admin only** - Dùng khi tạo voucher mới để tránh trùng

```typescript
voucherService.checkCodeExists(code)
```

**Response:** `boolean`

**Ví dụ:**
```typescript
const exists = await voucherService.checkCodeExists("SUMMER2024");
if (exists) {
  alert("Mã này đã tồn tại!");
}
```

---

### 7. Validate Voucher (Quan trọng!)
**Dùng khi khách hàng nhập mã tại checkout**

```typescript
voucherService.validate(data)
```

**Request:**
```typescript
{
  code: string;           // Mã voucher
  userId: number;         // ID người dùng
  orderAmount: number;    // Tổng tiền đơn hàng
}
```

**Response:** `VoucherValidation`

**Ví dụ:**
```typescript
const validation = await voucherService.validate({
  code: "SUMMER2024",
  userId: 123,
  orderAmount: 1000000  // 1 triệu đồng
});

if (validation.isValid) {
  console.log("Giảm:", validation.discountAmount); // VD: 150000 (15%)
  console.log("Còn lại:", validation.finalAmount); // 850000
} else {
  console.log("Lỗi:", validation.message);
  console.log("Loại lỗi:", validation.errorType);
}
```

**Các errorType có thể có:**
- `VOUCHER_NOT_FOUND`: Không tìm thấy mã
- `VOUCHER_EXPIRED`: Mã đã hết hạn
- `VOUCHER_LIMIT_EXCEEDED`: Đã hết lượt sử dụng
- `VOUCHER_ALREADY_USED`: User đã dùng mã này rồi
- `ORDER_AMOUNT_TOO_LOW`: Đơn hàng chưa đủ điều kiện

---

### 8. Lấy Voucher sắp hết hạn
**Admin only**

```typescript
voucherService.getExpiringSoon(days = 7)
```

Trả về danh sách voucher sẽ hết hạn trong `days` ngày tới.

**Ví dụ:**
```typescript
const expiringSoon = await voucherService.getExpiringSoon(7);
console.log(`${expiringSoon.length} voucher sắp hết hạn`);
```

---

### 9. Lấy lịch sử sử dụng của User
**User/Admin**

```typescript
voucherService.getUserUsage(userId)
```

**Response:** `UserVoucherUsage[]`

```typescript
interface UserVoucherUsage {
  id: number;
  userId: number;
  voucherCode: string;
  orderId: number;
  usedAt: string;
}
```

---

### 10. Lấy thống kê sử dụng
**Admin only**

```typescript
voucherService.getUsageCount(code)
```

**Response:**
```typescript
{
  voucherCode: string;
  totalUsageCount: number;       // Tổng số lần đã dùng
  usageLimit: number;            // Giới hạn
  remainingCount: number;        // Còn lại
  usagePercentage: number;       // % đã dùng
}
```

---

### 11. Xóa Voucher
**Admin only**

```typescript
voucherService.delete(code)
```

Xóa mềm voucher (đặt `isDeleted = true`).

---

### 12. Khôi phục Voucher
**Admin only**

```typescript
voucherService.restore(code)
```

Khôi phục voucher đã xóa.

---

## Cách sử dụng trong dự án

### 1. Admin: Tạo và quản lý voucher

**File:** `src/app/admin/promotions/components/VouchersTab.tsx`

```typescript
import { voucherService } from '@/services/promotionService';
import { Voucher } from '@/types';

// Load danh sách voucher
const loadVouchers = async () => {
  const response = await voucherService.getAll({
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    sortDir: 'DESC'
  });
  setVouchers(response.content);
};

// Tạo voucher mới
const handleCreate = async (formData) => {
  await voucherService.create({
    code: formData.code.toUpperCase(),
    voucherType: formData.voucherType,
    value: Number(formData.value),
    minOrderAmount: Number(formData.minOrderAmount),
    usageLimit: Number(formData.usageLimit),
    validFrom: new Date(formData.validFrom).toISOString(),
    validUntil: new Date(formData.validUntil).toISOString(),
  });
  loadVouchers();
};

// Xóa voucher
const handleDelete = async (code: string) => {
  if (confirm('Bạn có chắc muốn xóa?')) {
    await voucherService.delete(code);
    loadVouchers();
  }
};
```

---

### 2. Customer: Áp dụng mã giảm giá tại Checkout

**File:** `src/app/(shop)/checkout/page.tsx`

```typescript
import { useState } from 'react';

const CheckoutPage = () => {
  const [voucherCode, setVoucherCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState(null);
  const [voucherError, setVoucherError] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

  // Tính toán giảm giá
  const calculateDiscount = async () => {
    if (!voucherCode.trim()) return;

    setIsCalculating(true);
    setVoucherError("");

    try {
      const orderItems = cart.items.map(item => ({
        productVariationId: item.productVariationId,
        quantity: item.quantity,
      }));

      const res = await fetch('http://localhost:8080/api/orders/calculate-discount', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderItems,
          voucherCode: voucherCode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setVoucherError(data.message || "Mã không hợp lệ");
        setDiscountInfo(null);
      } else {
        setDiscountInfo(data);
        setVoucherError("");
      }
    } catch (err) {
      setVoucherError("Lỗi kết nối, thử lại sau");
      setDiscountInfo(null);
    } finally {
      setIsCalculating(false);
    }
  };

  // Hiển thị UI
  return (
    <div>
      {/* Input nhập mã */}
      <div className="flex gap-2">
        <input
          type="text"
          value={voucherCode}
          onChange={(e) => {
            setVoucherCode(e.target.value);
            setDiscountInfo(null);
            setVoucherError("");
          }}
          placeholder="Nhập mã voucher"
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          onClick={calculateDiscount}
          disabled={isCalculating || !voucherCode.trim()}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          {isCalculating ? "..." : "Áp dụng"}
        </button>
      </div>

      {/* Hiển thị lỗi */}
      {voucherError && (
        <p className="text-red-600 text-sm mt-2">{voucherError}</p>
      )}

      {/* Hiển thị thông tin giảm giá */}
      {discountInfo && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-green-700 font-medium">
            ✓ Mã "{voucherCode}" được áp dụng
          </p>
          <p className="text-sm text-green-600">
            Giảm: {discountInfo.voucherDiscount.toLocaleString('vi-VN')}đ
          </p>
        </div>
      )}

      {/* Tổng tiền */}
      <div className="mt-4">
        <div className="flex justify-between">
          <span>Tạm tính:</span>
          <span>{subtotal.toLocaleString('vi-VN')}đ</span>
        </div>
        <div className="flex justify-between">
          <span>Phí vận chuyển:</span>
          <span>{shipping.toLocaleString('vi-VN')}đ</span>
        </div>
        {discountInfo && (
          <div className="flex justify-between text-green-600">
            <span>Giảm giá:</span>
            <span>-{discountInfo.voucherDiscount.toLocaleString('vi-VN')}đ</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
          <span>Tổng cộng:</span>
          <span className="text-red-600">
            {(subtotal + shipping - (discountInfo?.voucherDiscount || 0)).toLocaleString('vi-VN')}đ
          </span>
        </div>
      </div>
    </div>
  );
};
```

---

## Ví dụ thực tế

### Ví dụ 1: Tạo voucher giảm 20% cho đơn hàng từ 1 triệu

```typescript
await voucherService.create({
  code: "TECH20",
  voucherType: "PERCENTAGE",
  value: 20,                       // 20%
  minOrderAmount: 1000000,         // 1 triệu
  usageLimit: 50,                  // 50 lần
  validFrom: "2024-12-01T00:00:00Z",
  validUntil: "2024-12-31T23:59:59Z"
});
```

### Ví dụ 2: Tạo voucher giảm cố định 100k cho đơn hàng từ 500k

```typescript
await voucherService.create({
  code: "FREESHIP100",
  voucherType: "FIXED_AMOUNT",
  value: 100000,                   // 100k
  minOrderAmount: 500000,          // 500k
  usageLimit: 200,
  validFrom: "2024-12-01T00:00:00Z",
  validUntil: "2024-12-15T23:59:59Z"
});
```

### Ví dụ 3: Validate voucher trước khi áp dụng

```typescript
const validation = await voucherService.validate({
  code: "TECH20",
  userId: 123,
  orderAmount: 1500000  // 1.5 triệu
});

if (validation.isValid) {
  // ✓ Hợp lệ
  // Đơn 1.5tr giảm 20% = 300k
  // Còn lại: 1.2tr
  console.log("Giảm:", validation.discountAmount);     // 300000
  console.log("Còn lại:", validation.finalAmount);     // 1200000
} else {
  // ✗ Không hợp lệ
  switch (validation.errorType) {
    case 'VOUCHER_NOT_FOUND':
      alert("Mã không tồn tại");
      break;
    case 'VOUCHER_EXPIRED':
      alert("Mã đã hết hạn");
      break;
    case 'ORDER_AMOUNT_TOO_LOW':
      alert(`Đơn hàng tối thiểu ${validation.voucher.minOrderAmount}đ`);
      break;
    // ... các case khác
  }
}
```

### Ví dụ 4: Kiểm tra voucher sắp hết hạn

```typescript
const expiringSoon = await voucherService.getExpiringSoon(7);

expiringSoon.forEach(voucher => {
  console.log(`Voucher ${voucher.code} sẽ hết hạn vào ${voucher.validUntil}`);
});
```

### Ví dụ 5: Thống kê sử dụng voucher

```typescript
const stats = await voucherService.getUsageCount("TECH20");

console.log(`Đã dùng: ${stats.totalUsageCount}/${stats.usageLimit}`);
console.log(`Còn lại: ${stats.remainingCount}`);
console.log(`Tỷ lệ: ${stats.usagePercentage}%`);
```

---

## Lưu ý quan trọng

### 1. Bảo mật
- Các API admin (create, update, delete) cần kiểm tra quyền
- API validate là public nhưng cần có userId để kiểm tra

### 2. Xử lý lỗi
```typescript
try {
  const validation = await voucherService.validate({...});
  if (validation.isValid) {
    // Áp dụng
  } else {
    // Hiển thị lỗi chi tiết
    alert(validation.message);
  }
} catch (error) {
  console.error(error);
  alert("Lỗi hệ thống, vui lòng thử lại");
}
```

### 3. Format datetime
- Backend yêu cầu ISO 8601: `"2024-12-31T23:59:59Z"`
- Từ input datetime-local sang ISO:
```typescript
new Date(formData.validFrom).toISOString()
```

### 4. Uppercase code
- Luôn convert mã voucher thành chữ HOA:
```typescript
code: formData.code.toUpperCase()
```

### 5. Validation phía client
```typescript
// Kiểm tra trước khi gửi
if (formData.value <= 0) {
  alert("Giá trị phải > 0");
  return;
}

if (formData.voucherType === 'PERCENTAGE' && formData.value > 100) {
  alert("Phần trăm không được > 100");
  return;
}

if (new Date(formData.validFrom) >= new Date(formData.validUntil)) {
  alert("Ngày bắt đầu phải trước ngày kết thúc");
  return;
}
```

---

## Tổng kết

### Flow hoàn chỉnh:

1. **Admin tạo voucher** → `voucherService.create()`
2. **Khách hàng nhập mã tại checkout** → Input text
3. **Click "Áp dụng"** → Gọi API `/orders/calculate-discount`
4. **Backend validate** → Trả về thông tin giảm giá hoặc lỗi
5. **Frontend hiển thị kết quả** → Cập nhật UI
6. **Khách submit đơn** → Gửi kèm `voucherCode` trong payload
7. **Backend tạo đơn** → Lưu voucher vào order, tăng `usedCount`

### Service file:
- **promotionService.ts**: Chứa tất cả logic gọi API voucher
- **Axios instance**: Tự động thêm token, base URL
- **Type safety**: TypeScript interfaces đảm bảo type đúng

Tài liệu này cung cấp đầy đủ thông tin để sử dụng hệ thống voucher trong TechBox Store!
