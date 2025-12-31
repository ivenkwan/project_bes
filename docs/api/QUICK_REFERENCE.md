# API Quick Reference

Fast reference guide for common API operations in the CISCE Platform.

---

## Authentication

### Get Access Token

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

const token = data.session?.access_token;
```

### Use Token in Requests

```typescript
// Automatic (recommended)
const { data } = await supabase.from('incidents').select('*');

// Manual
fetch(url, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## Common Operations

### Create Record

```typescript
const { data, error } = await supabase
  .from('table_name')
  .insert({ field: 'value' })
  .select()
  .single();
```

### Read Record

```typescript
// Single record
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('id', id)
  .maybeSingle();

// Multiple records
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10);
```

### Update Record

```typescript
const { data, error } = await supabase
  .from('table_name')
  .update({ field: 'new_value' })
  .eq('id', id)
  .select()
  .single();
```

### Delete Record

```typescript
const { error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', id);
```

---

## Filtering

### Basic Filters

```typescript
// Equals
.eq('status', 'open')

// Not equals
.neq('status', 'closed')

// Greater than
.gt('created_at', '2025-01-01')

// Less than
.lt('severity_level', 5)

// In array
.in('status', ['open', 'investigating'])

// Like (pattern matching)
.like('title', '%network%')

// Case-insensitive like
.ilike('title', '%Network%')
```

### Multiple Filters

```typescript
const { data } = await supabase
  .from('incidents')
  .select('*')
  .eq('status', 'open')
  .gte('severity_level', 3)
  .order('created_at', { ascending: false });
```

### OR Conditions

```typescript
const { data } = await supabase
  .from('incidents')
  .select('*')
  .or('status.eq.open,severity.eq.critical');
```

---

## Pagination

```typescript
const page = 1;
const pageSize = 20;
const from = page * pageSize;
const to = from + pageSize - 1;

const { data, count } = await supabase
  .from('incidents')
  .select('*', { count: 'exact' })
  .range(from, to)
  .order('created_at', { ascending: false });

const totalPages = Math.ceil((count || 0) / pageSize);
```

---

## Joins

```typescript
// One-to-many
const { data } = await supabase
  .from('incidents')
  .select(`
    *,
    actions(id, title, status)
  `);

// Many-to-one
const { data } = await supabase
  .from('incidents')
  .select(`
    *,
    created_by_user:users!created_by(id, email, full_name)
  `);
```

---

## Real-time Subscriptions

```typescript
const subscription = supabase
  .channel('incidents-channel')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'incidents'
    },
    (payload) => {
      console.log('Change:', payload);
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

---

## Error Handling

```typescript
try {
  const { data, error } = await supabase
    .from('incidents')
    .insert(newIncident)
    .select()
    .single();

  if (error) throw error;

  return data;
} catch (error) {
  if (error.code === '23505') {
    console.error('Duplicate entry');
  } else if (error.code === '42501') {
    console.error('Permission denied');
  } else {
    console.error('Error:', error.message);
  }
}
```

---

## Edge Functions

### Call Edge Function

```typescript
const { data: session } = await supabase.auth.getSession();

const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/function-name`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ param: 'value' })
  }
);

const result = await response.json();
```

---

## File Upload

```typescript
const file = event.target.files[0];

const { data, error } = await supabase.storage
  .from('bucket-name')
  .upload(`${Date.now()}-${file.name}`, file);

if (error) throw error;

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('bucket-name')
  .getPublicUrl(data.path);
```

---

## Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `23505` | Duplicate key | Check unique constraints |
| `23503` | Foreign key violation | Ensure referenced record exists |
| `23502` | NOT NULL violation | Provide required field |
| `42501` | Permission denied | Check RLS policies |
| `PGRST116` | Not found | Check record exists |

---

## HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET/PUT/PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid auth |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected error |

---

## Useful Patterns

### Upsert (Insert or Update)

```typescript
const { data, error } = await supabase
  .from('table_name')
  .upsert({ id: 'abc', field: 'value' })
  .select();
```

### Batch Insert

```typescript
const { data, error } = await supabase
  .from('table_name')
  .insert([
    { field: 'value1' },
    { field: 'value2' },
    { field: 'value3' }
  ])
  .select();
```

### Count Records

```typescript
const { count, error } = await supabase
  .from('table_name')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'active');
```

### Search

```typescript
const { data, error } = await supabase
  .from('incidents')
  .select('*')
  .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
  .limit(10);
```

---

## Environment Variables

```bash
# .env file
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

```typescript
// Usage
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

---

## Type Safety

```typescript
// Generate types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts

// Use types
import type { Database } from '@/lib/database.types';

const supabase = createClient<Database>(url, key);

// Now all queries are type-safe!
const { data } = await supabase.from('incidents').select('*');
// data is properly typed
```

---

## Testing

### Unit Test Example

```typescript
import { supabase } from '@/lib/supabase';

describe('createIncident', () => {
  it('should create incident', async () => {
    const incident = {
      title: 'Test',
      description: 'Test description',
      severity: 'low'
    };

    const { data, error } = await supabase
      .from('incidents')
      .insert(incident)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toHaveProperty('id');
    expect(data.title).toBe('Test');
  });
});
```

---

## Performance Tips

1. **Select only needed columns**
   ```typescript
   .select('id, title, created_at')
   ```

2. **Use pagination**
   ```typescript
   .range(0, 9)
   ```

3. **Add indexes** (in database)
   ```sql
   CREATE INDEX idx_incidents_status ON incidents(status);
   ```

4. **Use appropriate limits**
   ```typescript
   .limit(50)
   ```

5. **Cache frequently accessed data**
   ```typescript
   // Use React Query or similar
   ```

---

## Resources

- [Full API Documentation](./README.md)
- [Supabase Patterns](./SUPABASE_PATTERNS.md)
- [Authentication Guide](./AUTH_AND_ERRORS.md)
- [API Template](./API_TEMPLATE.md)

---

**Last Updated:** 2025-12-31
