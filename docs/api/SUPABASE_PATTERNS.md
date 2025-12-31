# Supabase API Patterns

This document covers common API patterns used in the CISCE Platform with Supabase.

---

## Table of Contents

1. [Database Queries](#database-queries)
2. [Edge Functions](#edge-functions)
3. [Authentication](#authentication)
4. [Real-time Subscriptions](#real-time-subscriptions)
5. [Storage API](#storage-api)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

---

## Database Queries

### Basic CRUD Operations

#### Create (INSERT)

**Endpoint Pattern:** Direct database access via Supabase client

**Request:**
```typescript
import { supabase } from '@/lib/supabase';

interface NewIncident {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
}

async function createIncident(incident: NewIncident) {
  const { data, error } = await supabase
    .from('incidents')
    .insert(incident)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

**Response Schema:**
```typescript
{
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}
```

**Errors:**
```typescript
// 409 Conflict - Duplicate key
{
  code: "23505",
  message: "duplicate key value violates unique constraint",
  details: "Key (title)=(example) already exists."
}

// 400 Bad Request - Invalid data
{
  code: "PGRST204",
  message: "Invalid input syntax",
  details: "..."
}
```

#### Read (SELECT)

**Single Record:**
```typescript
async function getIncident(id: string) {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Incident not found');
  return data;
}
```

**Multiple Records with Pagination:**
```typescript
interface PaginationParams {
  page: number;
  perPage: number;
}

async function listIncidents({ page, perPage }: PaginationParams) {
  const start = (page - 1) * perPage;
  const end = start + perPage - 1;

  const { data, error, count } = await supabase
    .from('incidents')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) throw error;

  return {
    data,
    pagination: {
      page,
      perPage,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / perPage)
    }
  };
}
```

**With Filters:**
```typescript
async function searchIncidents(filters: {
  status?: string;
  severity?: string;
  searchTerm?: string;
}) {
  let query = supabase
    .from('incidents')
    .select('*');

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.severity) {
    query = query.eq('severity', filters.severity);
  }

  if (filters.searchTerm) {
    query = query.or(
      `title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`
    );
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}
```

**With Joins (Foreign Keys):**
```typescript
async function getIncidentWithDetails(id: string) {
  const { data, error } = await supabase
    .from('incidents')
    .select(`
      *,
      created_by_user:users!created_by(id, email, full_name),
      actions(id, title, status, created_at)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
```

#### Update (UPDATE)

```typescript
interface UpdateIncident {
  title?: string;
  description?: string;
  status?: string;
  severity?: string;
}

async function updateIncident(id: string, updates: UpdateIncident) {
  const { data, error } = await supabase
    .from('incidents')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

#### Delete (DELETE)

```typescript
async function deleteIncident(id: string) {
  const { error } = await supabase
    .from('incidents')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
```

#### Upsert (INSERT or UPDATE)

```typescript
async function upsertIncident(incident: NewIncident & { id?: string }) {
  const { data, error } = await supabase
    .from('incidents')
    .upsert(incident, {
      onConflict: 'id'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

---

## Edge Functions

### Function Structure

**Location:** `supabase/functions/{function-name}/index.ts`

**Basic Template:**
```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  field1: string;
  field2: number;
}

interface ResponseData {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
  };
}

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const body: RequestBody = await req.json();

    const result = await processRequest(supabaseClient, user, body);

    return new Response(
      JSON.stringify({
        success: true,
        data: result
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'An unexpected error occurred'
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function processRequest(
  supabase: any,
  user: any,
  body: RequestBody
): Promise<any> {
  // Your business logic here
  return { processed: true };
}
```

### Calling Edge Functions from Client

**TypeScript Client:**
```typescript
import { supabase } from '@/lib/supabase';

async function callEdgeFunction<T = any>(
  functionName: string,
  data: any
): Promise<T> {
  const { data: session } = await supabase.auth.getSession();

  if (!session?.session?.access_token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || 'Request failed');
  }

  return result.data;
}

// Usage
try {
  const result = await callEdgeFunction('process-incident', {
    incidentId: '123',
    action: 'escalate'
  });
  console.log(result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Edge Function Examples

#### Example 1: Data Processing

```typescript
// supabase/functions/process-incident/index.ts
Deno.serve(async (req: Request) => {
  // ... auth and CORS handling ...

  const { incidentId, action } = await req.json();

  const { data: incident, error } = await supabaseClient
    .from('incidents')
    .select('*')
    .eq('id', incidentId)
    .single();

  if (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Incident not found' }
      }),
      { status: 404, headers: corsHeaders }
    );
  }

  // Process incident based on action
  const result = await performAction(incident, action);

  // Update incident
  await supabaseClient
    .from('incidents')
    .update({ status: result.newStatus })
    .eq('id', incidentId);

  return new Response(
    JSON.stringify({ success: true, data: result }),
    { status: 200, headers: corsHeaders }
  );
});
```

#### Example 2: External API Integration

```typescript
// supabase/functions/fetch-threat-intel/index.ts
Deno.serve(async (req: Request) => {
  // ... auth and CORS handling ...

  const { indicators } = await req.json();

  // Call external threat intelligence API
  const threatData = await fetch('https://api.threat-intel.com/check', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('THREAT_INTEL_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ indicators })
  });

  const results = await threatData.json();

  // Store results in database
  await supabaseClient
    .from('threat_intelligence')
    .insert({
      indicators,
      results,
      checked_at: new Date().toISOString(),
      checked_by: user.id
    });

  return new Response(
    JSON.stringify({ success: true, data: results }),
    { status: 200, headers: corsHeaders }
  );
});
```

---

## Authentication

### Getting Current User

```typescript
async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Not authenticated');
  }

  return user;
}
```

### Sign In

```typescript
async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('Invalid email or password');
    }
    throw error;
  }

  return data;
}
```

### Sign Up

```typescript
async function signUp(email: string, password: string, metadata?: any) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });

  if (error) {
    if (error.message.includes('already registered')) {
      throw new Error('Email already registered');
    }
    throw error;
  }

  return data;
}
```

### Sign Out

```typescript
async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
```

### Check Permissions (RLS-based)

Row Level Security automatically enforces permissions. Queries will only return data the user has access to:

```typescript
// This query automatically filters based on RLS policies
async function getMyIncidents() {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data; // Only returns incidents the user can access
}
```

---

## Real-time Subscriptions

### Subscribe to Table Changes

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

function useIncidents() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    // Initial fetch
    const fetchIncidents = async () => {
      const { data } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });
      setIncidents(data || []);
    };

    fetchIncidents();

    // Subscribe to changes
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
          if (payload.eventType === 'INSERT') {
            setIncidents(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setIncidents(prev =>
              prev.map(incident =>
                incident.id === payload.new.id ? payload.new : incident
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setIncidents(prev =>
              prev.filter(incident => incident.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return incidents;
}
```

### Subscribe to Specific Records

```typescript
function useIncident(id: string) {
  const [incident, setIncident] = useState(null);

  useEffect(() => {
    const fetchIncident = async () => {
      const { data } = await supabase
        .from('incidents')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      setIncident(data);
    };

    fetchIncident();

    const subscription = supabase
      .channel(`incident-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'incidents',
          filter: `id=eq.${id}`
        },
        (payload) => {
          setIncident(payload.new);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  return incident;
}
```

---

## Storage API

### Upload File

```typescript
async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}

// Usage
const file = event.target.files[0];
const url = await uploadFile('incident-attachments', `${Date.now()}-${file.name}`, file);
```

### Download File

```typescript
async function downloadFile(bucket: string, path: string): Promise<Blob> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);

  if (error) throw error;
  return data;
}
```

### Delete File

```typescript
async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
}
```

### List Files

```typescript
async function listFiles(bucket: string, folder: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' }
    });

  if (error) throw error;
  return data;
}
```

---

## Error Handling

### Common Error Patterns

```typescript
async function handleSupabaseError<T>(
  operation: () => Promise<{ data: T; error: any }>
): Promise<T> {
  const { data, error } = await operation();

  if (error) {
    // PostgreSQL errors
    if (error.code === '23505') {
      throw new Error('This record already exists');
    }

    if (error.code === '23503') {
      throw new Error('Referenced record does not exist');
    }

    if (error.code === '42501') {
      throw new Error('Permission denied');
    }

    // Supabase errors
    if (error.message.includes('JWT')) {
      throw new Error('Session expired. Please log in again');
    }

    if (error.message.includes('row level security')) {
      throw new Error('You do not have permission to perform this action');
    }

    // Generic error
    throw new Error(error.message || 'An unexpected error occurred');
  }

  return data as T;
}

// Usage
try {
  const incident = await handleSupabaseError(() =>
    supabase.from('incidents').insert(newIncident).select().single()
  );
  console.log('Created:', incident);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Error Response Format

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: any;
}

function formatError(error: any): ApiError {
  // PostgreSQL errors
  if (error.code?.startsWith('23')) {
    return {
      code: 'DATABASE_CONSTRAINT',
      message: 'Database constraint violation',
      details: error.message
    };
  }

  // Auth errors
  if (error.message?.includes('JWT') || error.status === 401) {
    return {
      code: 'UNAUTHORIZED',
      message: 'Authentication required'
    };
  }

  // RLS errors
  if (error.code === '42501' || error.message?.includes('policy')) {
    return {
      code: 'FORBIDDEN',
      message: 'Insufficient permissions'
    };
  }

  // Not found
  if (error.code === 'PGRST116') {
    return {
      code: 'NOT_FOUND',
      message: 'Resource not found'
    };
  }

  // Default
  return {
    code: 'INTERNAL_ERROR',
    message: error.message || 'An unexpected error occurred'
  };
}
```

---

## Best Practices

### 1. Always Use Row Level Security (RLS)

Never bypass RLS. Let the database handle permissions:

```typescript
// Good: RLS enforced automatically
const { data } = await supabase
  .from('incidents')
  .select('*');

// Bad: Using service role key on client
// NEVER expose service role key to client
```

### 2. Use Type Safety

Generate types from your database schema:

```bash
npx supabase gen types typescript --project-id your-project-id > src/lib/database.types.ts
```

```typescript
import type { Database } from '@/lib/database.types';

const supabase = createClient<Database>(url, key);

// Now you have full type safety
const { data } = await supabase.from('incidents').select('*');
// data is properly typed!
```

### 3. Handle Pagination Properly

```typescript
async function paginatedQuery(page: number, pageSize: number = 20) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('incidents')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return {
    data,
    page,
    pageSize,
    totalCount: count,
    totalPages: Math.ceil((count || 0) / pageSize),
    hasMore: to < (count || 0)
  };
}
```

### 4. Use Transactions for Related Operations

```typescript
// Use Edge Functions for operations requiring multiple steps
async function createIncidentWithActions(
  incident: any,
  actions: any[]
) {
  return await callEdgeFunction('create-incident-bundle', {
    incident,
    actions
  });
}

// In the edge function, use database transactions
// supabase/functions/create-incident-bundle/index.ts
async function handleRequest(supabase: any, body: any) {
  // Start transaction (use PostgreSQL functions)
  const { data: incident, error: incidentError } = await supabase
    .from('incidents')
    .insert(body.incident)
    .select()
    .single();

  if (incidentError) throw incidentError;

  const actionsWithIncidentId = body.actions.map(action => ({
    ...action,
    incident_id: incident.id
  }));

  const { data: actions, error: actionsError } = await supabase
    .from('actions')
    .insert(actionsWithIncidentId)
    .select();

  if (actionsError) {
    // Rollback handled by RLS or database triggers
    throw actionsError;
  }

  return { incident, actions };
}
```

### 5. Optimize Queries

```typescript
// Good: Select only needed columns
const { data } = await supabase
  .from('incidents')
  .select('id, title, status, created_at');

// Avoid: Selecting all columns when not needed
const { data } = await supabase
  .from('incidents')
  .select('*');

// Good: Use indexes (ensure DB has indexes on filtered columns)
const { data } = await supabase
  .from('incidents')
  .select('*')
  .eq('status', 'open') // Ensure index on status column
  .order('created_at', { ascending: false });
```

### 6. Implement Retry Logic for Network Issues

```typescript
async function retryableQuery<T>(
  operation: () => Promise<{ data: T; error: any }>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const { data, error } = await operation();
      if (error) throw error;
      return data as T;
    } catch (error) {
      lastError = error;

      // Don't retry auth or permission errors
      if (error.status === 401 || error.status === 403) {
        throw error;
      }

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError;
}
```

### 7. Cache Frequently Accessed Data

```typescript
import { useQuery } from '@tanstack/react-query';

function useIncidents() {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

---

**Last Updated:** 2025-12-31

**Maintainer:** Platform Team
