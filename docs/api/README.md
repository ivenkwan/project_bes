# API Documentation

Comprehensive API documentation for the CISCE Platform.

---

## Quick Start

### Base URLs

```
Production:  https://api.cisce-platform.com
Staging:     https://staging-api.cisce-platform.com
Development: http://localhost:3000
```

### Authentication

All API requests require authentication using Bearer tokens:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.cisce-platform.com/api/v1/incidents
```

### Getting Started

1. [Sign up for an account](../auth/Register.tsx)
2. [Get your API credentials](#authentication)
3. [Make your first API call](#example-requests)
4. [Explore available endpoints](#available-endpoints)

---

## Documentation Structure

### Core Documentation

| Document | Description |
|----------|-------------|
| [API Template](./API_TEMPLATE.md) | Template for documenting new endpoints |
| [Supabase Patterns](./SUPABASE_PATTERNS.md) | Database queries, Edge Functions, Real-time |
| [Authentication & Errors](./AUTH_AND_ERRORS.md) | Auth flows, error handling, status codes |

### Endpoint Documentation

| Category | Endpoints |
|----------|-----------|
| **Authentication** | Login, Register, Logout, Password Reset |
| **Incidents** | Create, Read, Update, Delete incidents |
| **Actions** | Manage corrective actions |
| **Workflows** | BPMN workflow management |
| **Risk** | Risk assessment and tracking |
| **Policy** | Policy compliance management |
| **Requirements** | Security requirements tracking |
| **Automation** | Automated compliance checks |
| **Optimization** | Performance optimization suggestions |

---

## Architecture Overview

### Technology Stack

```
┌─────────────────────────────────────────┐
│           React Frontend                │
│     (Vite + TypeScript + Tailwind)      │
└─────────────────┬───────────────────────┘
                  │
                  │ HTTPS
                  │
┌─────────────────▼───────────────────────┐
│         Supabase Platform               │
├─────────────────────────────────────────┤
│  • PostgreSQL Database (with RLS)       │
│  • Authentication (JWT)                 │
│  • Edge Functions (Deno runtime)        │
│  • Real-time Subscriptions              │
│  • Storage (File uploads)               │
└─────────────────────────────────────────┘
```

### API Types

#### 1. Direct Database Access

Most operations use Supabase client for direct database queries with automatic Row Level Security:

```typescript
// Automatically authenticated and authorized via RLS
const { data, error } = await supabase
  .from('incidents')
  .select('*')
  .eq('status', 'open');
```

#### 2. Edge Functions

Complex operations, external API calls, and business logic use Edge Functions:

```typescript
// Call edge function for complex processing
const result = await fetch(
  `${SUPABASE_URL}/functions/v1/process-incident`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ incidentId: '123' })
  }
);
```

#### 3. Real-time Subscriptions

Live updates using Supabase real-time:

```typescript
// Subscribe to incident updates
supabase
  .channel('incidents')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'incidents'
  }, (payload) => {
    console.log('Change detected:', payload);
  })
  .subscribe();
```

---

## Example Requests

### Authentication

**Sign In:**
```bash
curl -X POST https://api.cisce-platform.com/auth/v1/token \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "v1.MR5EzlGxBLPT...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com"
  }
}
```

### Database Queries

**List Incidents:**
```typescript
const { data, error } = await supabase
  .from('incidents')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10);
```

**Create Incident:**
```typescript
const { data, error } = await supabase
  .from('incidents')
  .insert({
    title: 'Network Outage',
    description: 'Complete network outage in datacenter',
    severity: 'critical',
    status: 'open'
  })
  .select()
  .single();
```

**Update Incident:**
```typescript
const { data, error } = await supabase
  .from('incidents')
  .update({ status: 'resolved' })
  .eq('id', incidentId)
  .select()
  .single();
```

**Delete Incident:**
```typescript
const { error } = await supabase
  .from('incidents')
  .delete()
  .eq('id', incidentId);
```

---

## Available Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/v1/signup` | Create new account |
| POST | `/auth/v1/token` | Sign in with email/password |
| POST | `/auth/v1/token?grant_type=refresh_token` | Refresh access token |
| POST | `/auth/v1/logout` | Sign out |
| POST | `/auth/v1/recover` | Request password reset |

### Database Tables (via Supabase Client)

| Table | Operations | Description |
|-------|------------|-------------|
| `incidents` | CRUD | Security incidents |
| `actions` | CRUD | Corrective actions |
| `workflows` | CRUD | BPMN workflows |
| `risks` | CRUD | Risk assessments |
| `policies` | CRUD | Compliance policies |
| `requirements` | CRUD | Security requirements |
| `users` | Read | User profiles |

### Edge Functions

| Function | Method | Description |
|----------|--------|-------------|
| `process-incident` | POST | Complex incident processing |
| `generate-report` | POST | Generate compliance reports |
| `fetch-threat-intel` | POST | Fetch external threat data |

---

## Automatic Documentation Tools

### Recommended Tools

#### 1. Supabase Auto-Documentation

**Built-in API docs for your database:**

Supabase automatically generates REST API documentation from your database schema:

```
https://[your-project-ref].supabase.co/rest/v1/
```

**Features:**
- Automatic endpoint generation from tables
- OpenAPI 3.0 specification
- Interactive API explorer
- Auto-updates when schema changes

**Access:** Supabase Dashboard → API → Documentation

#### 2. OpenAPI / Swagger

**For Edge Functions and custom APIs:**

```bash
npm install --save-dev swagger-jsdoc swagger-ui-express
```

**Generate OpenAPI spec from JSDoc comments:**

```typescript
/**
 * @openapi
 * /functions/v1/process-incident:
 *   post:
 *     summary: Process incident
 *     tags:
 *       - Incidents
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               incidentId:
 *                 type: string
 *                 format: uuid
 *               action:
 *                 type: string
 *                 enum: [escalate, close, assign]
 *     responses:
 *       200:
 *         description: Success
 */
```

**Tools:**
- [Swagger Editor](https://editor.swagger.io/) - Design APIs
- [Redoc](https://github.com/Redocly/redoc) - Beautiful API docs
- [Stoplight Studio](https://stoplight.io/studio) - API design platform

#### 3. TypeScript Type Generation

**Generate types from Supabase schema:**

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
```

**Benefits:**
- Full type safety
- Autocomplete in IDE
- Compile-time error checking
- Acts as living documentation

**Already configured in this project!**

#### 4. Postman / Insomnia

**For testing and sharing API collections:**

**Postman:**
- Create collections of API requests
- Share with team
- Generate documentation
- Run automated tests

**Insomnia:**
- Similar to Postman
- Better for GraphQL
- Open source option available

**Export Postman Collection:**
```json
{
  "info": {
    "name": "CISCE Platform API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [...]
}
```

#### 5. API Blueprint

**Human-readable API documentation:**

```markdown
# GET /incidents
+ Response 200 (application/json)
    + Attributes (array[Incident])

## Incident (object)
+ id: `123e4567` (string, required) - Unique identifier
+ title: `Network Outage` (string, required) - Incident title
+ severity: `critical` (enum[string]) - Incident severity
    + Members
        + `low`
        + `medium`
        + `high`
        + `critical`
```

**Tools:**
- [Aglio](https://github.com/danielgtaylor/aglio) - Renderer
- [Dredd](https://dredd.org/) - Testing tool

#### 6. GraphQL (Alternative Approach)

**Supabase supports GraphQL via pg_graphql:**

```bash
# Enable in Supabase Dashboard
# Extensions → pg_graphql → Enable
```

**Benefits:**
- Self-documenting
- Type-safe queries
- Introspection
- GraphQL Playground included

#### 7. Documentation Generators

**For custom APIs:**

| Tool | Language | Description |
|------|----------|-------------|
| [TypeDoc](https://typedoc.org/) | TypeScript | Generate docs from TSDoc comments |
| [JSDoc](https://jsdoc.app/) | JavaScript | Documentation generator |
| [Docusaurus](https://docusaurus.io/) | Any | Full documentation site |
| [MkDocs](https://www.mkdocs.org/) | Python | Static site generator |

---

## Implementation Recommendations

### For This Project (CISCE Platform)

#### Tier 1: Essential (Implement Now)

1. **TypeScript Type Generation** ✅
   - Already configured
   - Run: `npx supabase gen types typescript --project-id YOUR_PROJECT_ID`
   - Keep types updated with schema changes

2. **Supabase Auto-Documentation**
   - Free, automatic
   - Access via Supabase Dashboard
   - Use for database API reference

3. **Manual Documentation** ✅
   - Use provided templates
   - Document Edge Functions
   - Keep examples up-to-date

#### Tier 2: Recommended (Implement Soon)

4. **OpenAPI Specification**
   - For Edge Functions
   - Generate from JSDoc comments
   - Host with Swagger UI or Redoc

5. **Postman Collection**
   - Create example requests
   - Share with team/partners
   - Include in onboarding

#### Tier 3: Advanced (Future Enhancement)

6. **Interactive Documentation Site**
   - Use Docusaurus or similar
   - Combine all documentation
   - Add tutorials and guides

7. **Automated Testing**
   - API contract testing
   - Integration tests
   - Keep docs in sync with tests

---

## Documentation Workflow

### For New Endpoints

1. **Design Phase**
   ```
   - Define endpoint purpose
   - Specify request/response formats
   - Document authentication requirements
   - List possible errors
   ```

2. **Implementation Phase**
   ```
   - Implement endpoint
   - Add JSDoc/TSDoc comments
   - Write unit tests
   - Update type definitions
   ```

3. **Documentation Phase**
   ```
   - Copy API_TEMPLATE.md
   - Fill in all sections
   - Add code examples
   - Test all examples
   ```

4. **Review Phase**
   ```
   - Peer review implementation
   - Verify documentation accuracy
   - Test authentication
   - Validate error handling
   ```

5. **Maintenance Phase**
   ```
   - Update changelog
   - Increment version
   - Notify users of changes
   - Archive old versions
   ```

---

## Tools Setup Guide

### 1. TypeScript Types from Supabase

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Generate types
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts

# Add to package.json scripts
{
  "scripts": {
    "generate:types": "supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts"
  }
}
```

### 2. OpenAPI with swagger-jsdoc

```bash
# Install dependencies
npm install --save-dev swagger-jsdoc swagger-ui-express

# Create swagger config
```

```typescript
// swagger.config.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CISCE Platform API',
      version: '1.0.0',
      description: 'Critical Infrastructure Cybersecurity Compliance API',
    },
    servers: [
      {
        url: 'https://api.cisce-platform.com',
        description: 'Production server',
      },
    ],
  },
  apis: ['./supabase/functions/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
```

### 3. Postman Collection Export

```javascript
// scripts/export-postman.js
const collection = {
  info: {
    name: 'CISCE Platform API',
    description: 'API endpoints for CISCE Platform',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  auth: {
    type: 'bearer',
    bearer: [{
      key: 'token',
      value: '{{access_token}}',
      type: 'string'
    }]
  },
  item: [
    // Add endpoints here
  ]
};

console.log(JSON.stringify(collection, null, 2));
```

---

## API Versioning

### Strategy

The CISCE Platform uses URL-based versioning:

```
/api/v1/incidents
/api/v2/incidents
```

### Version Lifecycle

| Stage | Description | Support |
|-------|-------------|---------|
| **Current** | Latest stable version | Full support |
| **Deprecated** | Old version, still works | Security fixes only |
| **Sunset** | Scheduled for removal | Notice period: 6 months |
| **Retired** | No longer available | Removed |

### Breaking Changes

A new version is required when:
- Removing endpoints
- Changing required parameters
- Modifying response structure
- Changing authentication method

### Non-Breaking Changes

Can be added to current version:
- Adding optional parameters
- Adding new endpoints
- Adding fields to responses
- Bug fixes

---

## Rate Limiting

### Current Limits

| Tier | Requests/Hour | Burst |
|------|--------------|-------|
| Free | 100 | 10 |
| Basic | 1,000 | 50 |
| Pro | 10,000 | 200 |
| Enterprise | Custom | Custom |

### Headers

Every response includes:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1704038400
```

---

## Support & Resources

### Getting Help

- **Documentation:** This repository
- **API Status:** [status.cisce-platform.com](https://status.cisce-platform.com)
- **Community:** GitHub Discussions
- **Enterprise Support:** support@cisce-platform.com

### External Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [REST API Best Practices](https://restfulapi.net/)
- [OpenAPI Specification](https://swagger.io/specification/)

---

## Contributing

### Documentation Contributions

1. Fork the repository
2. Create feature branch
3. Update documentation
4. Test all code examples
5. Submit pull request

### Documentation Standards

- Use provided templates
- Include runnable code examples
- Document all error cases
- Keep changelog updated
- Test on multiple environments

---

**Last Updated:** 2025-12-31

**Documentation Version:** 1.0.0

**Maintainer:** Platform Team
