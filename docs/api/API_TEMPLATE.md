# API Endpoint Documentation Template

Use this template to document all API endpoints in the CISCE Platform.

---

## Endpoint Name

**Status:** `✅ Stable` | `🚧 Beta` | `⚠️ Deprecated`

**Version:** 1.0.0

**Last Updated:** YYYY-MM-DD

---

## Endpoint Details

### HTTP Method and Path

```
POST /api/v1/resource/{id}/action
```

### Base URL

```
Production:  https://api.cisce-platform.com
Staging:     https://staging-api.cisce-platform.com
Development: http://localhost:3000
```

### Description

Brief description of what this endpoint does and its primary use case.

---

## Authentication

### Required Authentication

- **Type:** Bearer Token | API Key | OAuth 2.0 | None
- **Header:** `Authorization: Bearer {token}`
- **Required Permissions:** `resource:read`, `resource:write`

### Example Authentication Header

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Authentication Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `UNAUTHORIZED` | Missing or invalid authentication token |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 401 | `TOKEN_EXPIRED` | Authentication token has expired |

---

## Request

### Path Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | `string` | Yes | Unique identifier | `"123e4567-e89b-12d3-a456-426614174000"` |

### Query Parameters

| Parameter | Type | Required | Default | Description | Example |
|-----------|------|----------|---------|-------------|---------|
| `limit` | `integer` | No | `10` | Number of items to return | `20` |
| `offset` | `integer` | No | `0` | Pagination offset | `0` |
| `sort` | `string` | No | `created_at` | Field to sort by | `"name"` |
| `order` | `string` | No | `asc` | Sort order (asc/desc) | `"desc"` |
| `filter` | `string` | No | `null` | Filter criteria | `"status:active"` |

### Request Headers

| Header | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| `Content-Type` | `string` | Yes | Media type | `application/json` |
| `Accept` | `string` | No | Accepted response type | `application/json` |
| `X-Request-ID` | `string` | No | Request tracking ID | `"req-123456"` |

### Request Body

**Content-Type:** `application/json`

#### Schema

```typescript
interface RequestBody {
  field1: string;
  field2: number;
  field3?: boolean;
  nested?: {
    subfield1: string;
    subfield2: string[];
  };
}
```

#### Validation Rules

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `field1` | `string` | Yes | Min: 1, Max: 255 | Description of field1 |
| `field2` | `number` | Yes | Min: 0, Max: 1000 | Description of field2 |
| `field3` | `boolean` | No | - | Description of field3 |

#### Example

```json
{
  "field1": "example value",
  "field2": 42,
  "field3": true,
  "nested": {
    "subfield1": "nested value",
    "subfield2": ["item1", "item2"]
  }
}
```

---

## Response

### Success Response

**Status Code:** `200 OK` | `201 Created` | `204 No Content`

#### Schema

```typescript
interface SuccessResponse {
  success: true;
  data: {
    id: string;
    field1: string;
    field2: number;
    created_at: string;
    updated_at: string;
  };
  metadata?: {
    total: number;
    page: number;
    per_page: number;
  };
}
```

#### Example

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "field1": "example value",
    "field2": 42,
    "created_at": "2025-12-31T12:00:00Z",
    "updated_at": "2025-12-31T12:00:00Z"
  },
  "metadata": {
    "total": 100,
    "page": 1,
    "per_page": 10
  }
}
```

### Response Headers

| Header | Type | Description | Example |
|--------|------|-------------|---------|
| `Content-Type` | `string` | Response media type | `application/json` |
| `X-Request-ID` | `string` | Request tracking ID | `"req-123456"` |
| `X-RateLimit-Limit` | `integer` | Rate limit maximum | `1000` |
| `X-RateLimit-Remaining` | `integer` | Remaining requests | `999` |
| `X-RateLimit-Reset` | `integer` | Unix timestamp of reset | `1704038400` |

---

## Error Responses

### Error Response Schema

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string;
  };
  request_id?: string;
}
```

### Status Codes

| Status Code | Error Code | Description | Example Message |
|-------------|------------|-------------|-----------------|
| 400 | `BAD_REQUEST` | Invalid request format | "Invalid JSON in request body" |
| 400 | `VALIDATION_ERROR` | Field validation failed | "field1 is required" |
| 401 | `UNAUTHORIZED` | Authentication required | "Missing authentication token" |
| 403 | `FORBIDDEN` | Insufficient permissions | "User lacks required permission" |
| 404 | `NOT_FOUND` | Resource not found | "Resource with id '123' not found" |
| 409 | `CONFLICT` | Resource conflict | "Resource already exists" |
| 422 | `UNPROCESSABLE_ENTITY` | Business logic error | "Cannot delete active resource" |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests | "Rate limit exceeded, try again in 60s" |
| 500 | `INTERNAL_ERROR` | Server error | "An unexpected error occurred" |
| 503 | `SERVICE_UNAVAILABLE` | Service temporarily down | "Service under maintenance" |

### Error Examples

#### 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "field1",
        "message": "field1 must be at least 1 character",
        "value": ""
      },
      {
        "field": "field2",
        "message": "field2 must be a positive number",
        "value": -5
      }
    ]
  },
  "request_id": "req-123456"
}
```

#### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication token is missing or invalid"
  },
  "request_id": "req-123456"
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "User lacks required permission: resource:write"
  },
  "request_id": "req-123456"
}
```

#### 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource with id '123e4567-e89b-12d3-a456-426614174000' not found"
  },
  "request_id": "req-123456"
}
```

#### 429 Rate Limit Exceeded

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 60 seconds",
    "details": {
      "limit": 1000,
      "reset_at": "2025-12-31T13:00:00Z"
    }
  },
  "request_id": "req-123456"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again later"
  },
  "request_id": "req-123456"
}
```

---

## Rate Limiting

### Rate Limits

| Tier | Requests per Hour | Burst Limit |
|------|------------------|-------------|
| Free | 100 | 10 |
| Basic | 1,000 | 50 |
| Pro | 10,000 | 200 |
| Enterprise | Unlimited | Custom |

### Rate Limit Headers

Every response includes rate limit headers:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1704038400
```

### Rate Limit Exceeded Response

When rate limit is exceeded, you'll receive a `429` status code with retry information.

---

## Code Examples

### cURL

```bash
curl -X POST \
  'https://api.cisce-platform.com/api/v1/resource/123/action?limit=10' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "field1": "example value",
    "field2": 42,
    "field3": true
  }'
```

### JavaScript (Fetch)

```javascript
const response = await fetch('https://api.cisce-platform.com/api/v1/resource/123/action?limit=10', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    field1: 'example value',
    field2: 42,
    field3: true
  })
});

const data = await response.json();

if (!response.ok) {
  throw new Error(`Error: ${data.error.message}`);
}

console.log(data);
```

### JavaScript (Axios)

```javascript
import axios from 'axios';

try {
  const response = await axios.post(
    'https://api.cisce-platform.com/api/v1/resource/123/action',
    {
      field1: 'example value',
      field2: 42,
      field3: true
    },
    {
      params: { limit: 10 },
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN'
      }
    }
  );

  console.log(response.data);
} catch (error) {
  if (error.response) {
    console.error('Error:', error.response.data.error);
  }
}
```

### TypeScript (with Supabase Client)

```typescript
import { supabase } from '@/lib/supabase';

interface RequestData {
  field1: string;
  field2: number;
  field3?: boolean;
}

async function callEndpoint(id: string, data: RequestData) {
  const { data: session } = await supabase.auth.getSession();

  if (!session?.session?.access_token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/endpoint-name`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  return response.json();
}
```

### Python

```python
import requests

url = "https://api.cisce-platform.com/api/v1/resource/123/action"
headers = {
    "Authorization": "Bearer YOUR_TOKEN",
    "Content-Type": "application/json"
}
params = {"limit": 10}
data = {
    "field1": "example value",
    "field2": 42,
    "field3": True
}

response = requests.post(url, headers=headers, params=params, json=data)

if response.status_code == 200:
    result = response.json()
    print(result)
else:
    error = response.json()
    print(f"Error: {error['error']['message']}")
```

---

## Testing

### Test Cases

#### Valid Request
```bash
# Expected: 200 OK
curl -X POST 'https://api.cisce-platform.com/api/v1/resource/123/action' \
  -H 'Authorization: Bearer VALID_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"field1": "test", "field2": 10}'
```

#### Missing Required Field
```bash
# Expected: 400 Bad Request
curl -X POST 'https://api.cisce-platform.com/api/v1/resource/123/action' \
  -H 'Authorization: Bearer VALID_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"field2": 10}'
```

#### Unauthorized Request
```bash
# Expected: 401 Unauthorized
curl -X POST 'https://api.cisce-platform.com/api/v1/resource/123/action' \
  -H 'Content-Type: application/json' \
  -d '{"field1": "test", "field2": 10}'
```

#### Invalid ID
```bash
# Expected: 404 Not Found
curl -X POST 'https://api.cisce-platform.com/api/v1/resource/invalid-id/action' \
  -H 'Authorization: Bearer VALID_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"field1": "test", "field2": 10}'
```

---

## Webhooks

### Webhook Events

This endpoint may trigger the following webhook events:

| Event | Description | Payload |
|-------|-------------|---------|
| `resource.created` | Resource was created | `{ id, field1, field2, timestamp }` |
| `resource.updated` | Resource was updated | `{ id, changes, timestamp }` |
| `resource.deleted` | Resource was deleted | `{ id, timestamp }` |

---

## Changelog

### Version 1.0.0 (YYYY-MM-DD)
- Initial release
- Support for field1 and field2
- Basic authentication

### Version 1.1.0 (YYYY-MM-DD)
- Added field3 parameter
- Improved error messages
- Added rate limiting

---

## Related Endpoints

- [GET /api/v1/resource/{id}](./get-resource.md) - Retrieve resource
- [PUT /api/v1/resource/{id}](./update-resource.md) - Update resource
- [DELETE /api/v1/resource/{id}](./delete-resource.md) - Delete resource
- [GET /api/v1/resources](./list-resources.md) - List all resources

---

## Notes

### Performance

- Average response time: ~200ms
- 99th percentile: ~500ms
- Timeout: 30 seconds

### Caching

- Responses may be cached for up to 5 minutes
- Use `Cache-Control: no-cache` header to bypass cache

### Idempotency

- This endpoint supports idempotency keys
- Include `Idempotency-Key` header to prevent duplicate operations
- Idempotency keys expire after 24 hours

### Data Retention

- Request logs retained for 30 days
- Response data retained per data retention policy

---

## Support

**API Issues:** api-support@cisce-platform.com

**Documentation:** [API Documentation Portal](https://docs.cisce-platform.com)

**Status Page:** [status.cisce-platform.com](https://status.cisce-platform.com)

---

**Maintainer:** API Team

**Last Reviewed:** YYYY-MM-DD
