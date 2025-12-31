# Create Incident

**Status:** ✅ Stable

**Version:** 1.0.0

**Last Updated:** 2025-12-31

---

## Endpoint Details

### HTTP Method and Path

```
POST /incidents
```

### Base URL

```
Production:  https://api.cisce-platform.com
Staging:     https://staging-api.cisce-platform.com
Development: http://localhost:3000
```

### Description

Creates a new security incident in the CISCE Platform. This endpoint allows authenticated users to report and track security incidents affecting critical infrastructure systems.

---

## Authentication

### Required Authentication

- **Type:** Bearer Token (JWT)
- **Header:** `Authorization: Bearer {token}`
- **Required Permissions:** `incidents:write` or `incidents:create`

### Example Authentication Header

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Authentication Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `UNAUTHORIZED` | Missing or invalid authentication token |
| 403 | `FORBIDDEN` | User lacks incidents:write permission |
| 401 | `TOKEN_EXPIRED` | Authentication token has expired |

---

## Request

### Path Parameters

None

### Query Parameters

None

### Request Headers

| Header | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| `Content-Type` | `string` | Yes | Must be application/json | `application/json` |
| `Authorization` | `string` | Yes | Bearer token | `Bearer {token}` |

### Request Body

**Content-Type:** `application/json`

#### Schema

```typescript
interface CreateIncidentRequest {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status?: 'open' | 'investigating' | 'resolved';
  affected_systems?: string[];
  tags?: string[];
}
```

#### Validation Rules

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `title` | `string` | Yes | Min: 1, Max: 255 | Brief description of the incident |
| `description` | `string` | Yes | Min: 10, Max: 5000 | Detailed incident description |
| `severity` | `enum` | Yes | One of: low, medium, high, critical | Incident severity level |
| `status` | `enum` | No | One of: open, investigating, resolved | Initial status (defaults to 'open') |
| `affected_systems` | `array` | No | Max items: 50 | List of affected system identifiers |
| `tags` | `array` | No | Max items: 20, Max length per tag: 50 | Classification tags |

#### Example

```json
{
  "title": "Unauthorized Access Attempt Detected",
  "description": "Multiple failed login attempts detected from IP 192.168.1.100 targeting the admin portal. Pattern suggests automated attack.",
  "severity": "high",
  "status": "investigating",
  "affected_systems": ["admin-portal", "auth-service"],
  "tags": ["brute-force", "authentication", "security"]
}
```

---

## Response

### Success Response

**Status Code:** `201 Created`

#### Schema

```typescript
interface CreateIncidentResponse {
  success: true;
  data: {
    id: string;
    title: string;
    description: string;
    severity: string;
    status: string;
    affected_systems: string[];
    tags: string[];
    created_at: string;
    updated_at: string;
    created_by: string;
  };
}
```

#### Example

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Unauthorized Access Attempt Detected",
    "description": "Multiple failed login attempts detected from IP 192.168.1.100 targeting the admin portal. Pattern suggests automated attack.",
    "severity": "high",
    "status": "investigating",
    "affected_systems": ["admin-portal", "auth-service"],
    "tags": ["brute-force", "authentication", "security"],
    "created_at": "2025-12-31T12:00:00.000Z",
    "updated_at": "2025-12-31T12:00:00.000Z",
    "created_by": "abc12345-def6-7890-ghij-klmnopqrstuv"
  }
}
```

### Response Headers

| Header | Type | Description | Example |
|--------|------|-------------|---------|
| `Content-Type` | `string` | Response media type | `application/json` |
| `Location` | `string` | URL of created resource | `/api/v1/incidents/123e4567...` |

---

## Error Responses

### Status Codes

| Status Code | Error Code | Description | Example Message |
|-------------|------------|-------------|-----------------|
| 400 | `VALIDATION_ERROR` | Invalid request data | "title is required" |
| 401 | `UNAUTHORIZED` | Not authenticated | "Authentication required" |
| 403 | `FORBIDDEN` | Insufficient permissions | "Missing required permission: incidents:write" |
| 422 | `INVALID_SEVERITY` | Invalid severity value | "severity must be one of: low, medium, high, critical" |
| 500 | `INTERNAL_ERROR` | Server error | "An unexpected error occurred" |

### Error Examples

#### 400 Validation Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "title",
        "message": "title is required"
      },
      {
        "field": "description",
        "message": "description must be at least 10 characters"
      }
    ]
  }
}
```

#### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required. Please log in to continue."
  }
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to create incidents",
    "details": {
      "required_permission": "incidents:write",
      "user_permissions": ["incidents:read"]
    }
  }
}
```

---

## Code Examples

### cURL

```bash
curl -X POST \
  'https://api.cisce-platform.com/incidents' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Unauthorized Access Attempt Detected",
    "description": "Multiple failed login attempts detected from IP 192.168.1.100",
    "severity": "high",
    "affected_systems": ["admin-portal", "auth-service"],
    "tags": ["brute-force", "authentication"]
  }'
```

### TypeScript (with Supabase Client)

```typescript
import { supabase } from '@/lib/supabase';

interface CreateIncidentData {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status?: string;
  affected_systems?: string[];
  tags?: string[];
}

async function createIncident(incident: CreateIncidentData) {
  const { data, error } = await supabase
    .from('incidents')
    .insert(incident)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create incident: ${error.message}`);
  }

  return data;
}

// Usage
try {
  const newIncident = await createIncident({
    title: 'Unauthorized Access Attempt Detected',
    description: 'Multiple failed login attempts detected from IP 192.168.1.100',
    severity: 'high',
    affected_systems: ['admin-portal', 'auth-service'],
    tags: ['brute-force', 'authentication']
  });

  console.log('Incident created:', newIncident);
} catch (error) {
  console.error('Error:', error.message);
}
```

### JavaScript (Fetch)

```javascript
async function createIncident(incidentData) {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch('https://api.cisce-platform.com/incidents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(incidentData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  return response.json();
}
```

### React Component Example

```tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

function CreateIncidentForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const { data, error: createError } = await supabase
        .from('incidents')
        .insert({
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          severity: formData.get('severity') as string,
          status: 'open'
        })
        .select()
        .single();

      if (createError) throw createError;

      console.log('Incident created:', data);
      // Reset form or redirect
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <input
        type="text"
        name="title"
        placeholder="Incident Title"
        required
      />

      <textarea
        name="description"
        placeholder="Description"
        minLength={10}
        required
      />

      <select name="severity" required>
        <option value="">Select Severity</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Incident'}
      </button>
    </form>
  );
}
```

---

## Testing

### Test Cases

#### Valid Request
```bash
curl -X POST 'https://api.cisce-platform.com/incidents' \
  -H 'Authorization: Bearer VALID_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Test Incident",
    "description": "This is a test incident with sufficient detail",
    "severity": "low"
  }'
# Expected: 201 Created
```

#### Missing Required Field
```bash
curl -X POST 'https://api.cisce-platform.com/incidents' \
  -H 'Authorization: Bearer VALID_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "description": "Missing title field",
    "severity": "low"
  }'
# Expected: 400 Bad Request - VALIDATION_ERROR
```

#### Invalid Severity
```bash
curl -X POST 'https://api.cisce-platform.com/incidents' \
  -H 'Authorization: Bearer VALID_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Test",
    "description": "Test description here",
    "severity": "invalid"
  }'
# Expected: 400 Bad Request - VALIDATION_ERROR
```

#### Unauthorized Request
```bash
curl -X POST 'https://api.cisce-platform.com/incidents' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Test",
    "description": "Test description",
    "severity": "low"
  }'
# Expected: 401 Unauthorized
```

---

## Webhooks

### Webhook Events

This endpoint triggers the following webhook events:

| Event | Description | Payload |
|-------|-------------|---------|
| `incident.created` | New incident created | Full incident object |

**Webhook Payload Example:**
```json
{
  "event": "incident.created",
  "timestamp": "2025-12-31T12:00:00.000Z",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Unauthorized Access Attempt Detected",
    "severity": "high",
    "status": "open"
  }
}
```

---

## Changelog

### Version 1.0.0 (2025-12-31)
- Initial release
- Support for basic incident creation
- Validation for required fields
- Support for tags and affected systems

---

## Related Endpoints

- [GET /incidents](./list-incidents.md) - List all incidents
- [GET /incidents/{id}](./get-incident.md) - Get specific incident
- [PUT /incidents/{id}](./update-incident.md) - Update incident
- [DELETE /incidents/{id}](./delete-incident.md) - Delete incident

---

## Notes

### Performance

- Average response time: ~150ms
- 99th percentile: ~400ms
- Timeout: 30 seconds

### Data Retention

- Incidents retained indefinitely
- Audit logs kept for 90 days

### Best Practices

1. Always validate input before sending
2. Use meaningful titles and descriptions
3. Set appropriate severity levels
4. Include affected systems for tracking
5. Use tags for better categorization

---

## Support

**API Issues:** api-support@cisce-platform.com

**Documentation:** [API Documentation Portal](https://docs.cisce-platform.com)

**Status Page:** [status.cisce-platform.com](https://status.cisce-platform.com)

---

**Maintainer:** Platform Team

**Last Reviewed:** 2025-12-31
