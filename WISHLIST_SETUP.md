# Wishlist Feature Setup Guide

## Overview

The wishlist feature has been fully integrated with support for both API mode and local storage fallback mode.

## Current Status

- **Feature Flag**: `WISHLIST_API_ENABLED = false` (Local storage mode)
- **Reason**: Backend wishlist endpoints are not implemented yet (returning 500 errors)
- **Fallback**: Using AsyncStorage to persist wishlist locally

## How It Works

### Local Storage Mode (Current)

When `WISHLIST_API_ENABLED = false`:

- ✅ Wishlist is saved in device AsyncStorage
- ✅ Works offline
- ✅ Persists across app restarts
- ✅ No API calls made
- ❌ Not synced across devices
- ❌ Not saved on server

### API Mode (Future)

When `WISHLIST_API_ENABLED = true`:

- ✅ Wishlist synced with server
- ✅ Works across devices
- ✅ Server-side persistence
- ❌ Requires internet connection
- ❌ Requires backend implementation

## Switching to API Mode

### Step 1: Backend Implementation

Ensure your backend has implemented these endpoints:

```
GET    /wishlists?page={page}&size={size}
POST   /wishlists
DELETE /wishlists/{productId}
POST   /wishlists/check
```

All endpoints require `Authorization: Bearer {token}` header.

See `API_USAGE_GUIDE.md` for detailed specifications.

### Step 2: Enable API Mode

In `contexts/WishlistContext.tsx`, change:

```typescript
const WISHLIST_API_ENABLED = false; // Change to true
```

### Step 3: Test

1. Restart the app
2. Login with a valid account
3. Try adding/removing products from wishlist
4. Check console for any API errors
5. Verify data persists after logout/login

## Features Implemented

### ✅ Optimistic Updates

- Instant UI feedback when adding/removing items
- Automatic rollback on errors
- Smooth user experience

### ✅ Error Handling

- Graceful handling of 500 server errors (suppressed toasts)
- User-friendly error messages for other errors
- Console warnings for debugging

### ✅ Authentication Integration

- Requires login to use wishlist
- Clears wishlist on logout
- Loads wishlist on login

### ✅ Toast Notifications

- Success: "Đã thêm vào danh sách yêu thích"
- Success: "Đã xóa khỏi danh sách yêu thích"
- Error: Custom messages based on error type

### ✅ UI Integration

All screens support wishlist toggle:

- Home screen (product cards)
- Shop screen (product cards)
- Product detail screen (header button)
- Promotion detail screen (applicable products)
- Favorites/Wishlist screen (full list)

## API Endpoints Specification

### 1. Get Wishlists (Paginated)

```
GET /wishlists?page={page}&size={size}
Authorization: Bearer {token}

Response:
{
  "content": [
    {
      "id": number,
      "productId": number,
      "createdDate": string,
      "lastModifiedDate": string,
      // ... other product fields
    }
  ],
  "pageable": {
    "pageNumber": number,
    "pageSize": number
  },
  "totalPages": number,
  "last": boolean
}
```

### 2. Add to Wishlist

```
POST /wishlists
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "productId": number
}

Response: Product object
```

### 3. Remove from Wishlist

```
DELETE /wishlists/{productId}
Authorization: Bearer {token}

Response: 200 OK (empty body)
```

### 4. Check Wishlist Status

```
POST /wishlists/check
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "productIds": number[]
}

Response:
{
  "wishlistedProductIds": number[]
}
```

## Troubleshooting

### Issue: 500 Server Errors

**Solution**: Keep `WISHLIST_API_ENABLED = false` until backend implements endpoints.

### Issue: Wishlist Not Persisting

**Local Mode**: Check AsyncStorage permissions
**API Mode**: Verify backend is saving data correctly

### Issue: Wishlist Not Loading

**Local Mode**: Check console for AsyncStorage errors
**API Mode**:

1. Verify auth token is valid
2. Check network connection
3. Verify backend endpoints are working

### Issue: Optimistic Updates Not Rolling Back

Check console for error messages and verify error handling logic.

## Testing Checklist

- [ ] Add product to wishlist (heart icon turns red)
- [ ] Remove product from wishlist (heart icon becomes outline)
- [ ] Navigate to Favorites screen (products listed)
- [ ] Logout (wishlist clears)
- [ ] Login (wishlist loads)
- [ ] Restart app (wishlist persists - local mode)
- [ ] Test on slow network (optimistic updates work)
- [ ] Test error scenarios (graceful error handling)

## Future Enhancements

1. **Sync on Mode Switch**: Automatically sync local wishlist to server when switching from local to API mode
2. **Conflict Resolution**: Handle conflicts when syncing local and server wishlists
3. **Batch Operations**: Optimize API calls when adding/removing multiple items
4. **Offline Queue**: Queue wishlist changes when offline and sync when online
5. **Analytics**: Track wishlist usage patterns

## File Structure

```
contexts/
  WishlistContext.tsx       # Main context with API/local storage logic

services/
  wishlistApi.ts           # API client functions

app/(app)/(tabs)/
  favorites.tsx            # Wishlist display screen
  home.tsx                # Home with wishlist toggle
  shop.tsx                # Shop with wishlist toggle

app/(app)/(screens)/
  product-detail.tsx      # Product detail with wishlist toggle
  promotion-detail.tsx    # Promotion detail with wishlist
```

## Support

For issues or questions:

1. Check console logs for error details
2. Verify feature flag setting
3. Check backend implementation status
4. Review API_USAGE_GUIDE.md for endpoint specs

---

**Last Updated**: $(date)
**Status**: Local storage mode active, ready to switch to API mode when backend is ready
