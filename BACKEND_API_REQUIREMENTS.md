# Backend API Requirements for AI Chatbot

## Missing Endpoint: `/api/products/by-spus`

### Issue

The AI chatbot returns product recommendations as SPU codes (e.g., `["LAPTOP-DELL-XPS-13", "PHONE-IPHONE-15"]`), but the backend doesn't have an endpoint to fetch multiple products by their SPU codes in a single request.

### Current Error

```
POST /products/by-spus → 500 Internal Server Error
```

### Required Implementation

#### Endpoint Details

- **Method**: `POST`
- **Path**: `/api/products/by-spus`
- **Content-Type**: `application/json`

#### Request Body

```json
{
  "spus": ["LAPTOP-DELL-XPS-13", "LAPTOP-ASUS-ROG", "PHONE-IPHONE-15"]
}
```

#### Response Format

Return an array of products matching the ProductApiResponse interface:

```json
[
  {
    "id": 1,
    "name": "Dell XPS 13",
    "imageUrl": "https://example.com/dell-xps-13.jpg",
    "warrantyMonths": 12,
    "displayOriginalPrice": 25000000,
    "displaySalePrice": 22000000,
    "discountType": "PERCENTAGE",
    "discountValue": 12,
    "averageRating": 4.5,
    "totalRatings": 120
  },
  {
    "id": 2,
    "name": "ASUS ROG",
    "imageUrl": "https://example.com/asus-rog.jpg",
    "warrantyMonths": 24,
    "displayOriginalPrice": 35000000,
    "displaySalePrice": 35000000,
    "discountType": null,
    "discountValue": null,
    "averageRating": 4.8,
    "totalRatings": 85
  }
]
```

#### Expected Behavior

1. Accept an array of SPU codes
2. Query database for products matching those SPUs
3. Return products in the same format as `GET /api/products` endpoint
4. Handle missing SPUs gracefully (skip or return null)
5. Maintain order if possible
6. Limit to reasonable batch size (e.g., max 20 products)

### Backend Implementation Example (Spring Boot)

```java
@PostMapping("/products/by-spus")
public ResponseEntity<List<ProductResponse>> getProductsBySpus(
    @RequestBody @Valid ProductSpusRequest request
) {
    List<String> spus = request.getSpus();

    if (spus == null || spus.isEmpty()) {
        return ResponseEntity.ok(Collections.emptyList());
    }

    // Limit batch size
    if (spus.size() > 20) {
        spus = spus.subList(0, 20);
    }

    List<ProductResponse> products = productService.findProductsBySpus(spus);
    return ResponseEntity.ok(products);
}

// DTO
@Data
public class ProductSpusRequest {
    @NotNull
    @Size(min = 1, max = 20)
    private List<String> spus;
}
```

### Temporary Workaround (Frontend)

The frontend currently handles this gracefully:

- Catches the 500 error
- Logs a warning message
- Returns empty products array
- Chat continues to work without product cards

This means the chatbot will:

- ✅ Display AI text responses
- ✅ Show intent badges
- ❌ NOT show product carousel (until backend is fixed)

### Testing After Implementation

Once backend is ready, test with:

```bash
curl -X POST http://localhost:8081/api/products/by-spus \
  -H "Content-Type: application/json" \
  -d '{"spus": ["LAPTOP-DELL-XPS-13", "PHONE-IPHONE-15"]}'
```

Expected: Array of 2 products

### Priority

**HIGH** - This endpoint is required for the AI chatbot's product recommendation feature to work fully.

---

## Alternative Solutions

### Option 1: Use Existing Endpoints (Not Recommended)

Make individual `GET /api/products/{id}` requests for each SPU:

- ❌ Multiple API calls (N+1 problem)
- ❌ Slower performance
- ❌ Higher server load

### Option 2: Search by Name (Not Recommended)

Use `GET /api/products?name={spu}` for each:

- ❌ Not accurate (SPU ≠ name)
- ❌ May return wrong products
- ❌ Still multiple requests

### Option 3: Batch Endpoint (RECOMMENDED - Current Approach)

Implement `POST /api/products/by-spus`:

- ✅ Single API call
- ✅ Efficient database query
- ✅ Accurate matching
- ✅ Scalable

---

## Next Steps

1. **Backend Team**: Implement `POST /api/products/by-spus` endpoint
2. **Test**: Verify endpoint returns correct products
3. **Deploy**: Update backend API
4. **Verify**: Test chatbot product recommendations in app

Once implemented, the frontend will automatically start showing product carousels in chat responses! 🎉
