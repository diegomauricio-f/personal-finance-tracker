# Contract: Authentication

**Feature**: `005-user-auth-db-migration`
**Provider**: Supabase Auth (`@supabase/ssr`)
**Pattern**: SvelteKit Form Actions + Server Hooks

---

## POST /auth/register (Form Action)

**File**: `src/routes/(auth)/register/+page.server.ts`

### Input
| Field | Type | Validation |
|-------|------|-----------|
| `email` | string | Required, valid email format |
| `password` | string | Required, min 8 characters |
| `confirmPassword` | string | Must match `password` |

### Behavior
1. Call `supabase.auth.signUp({ email, password, options: { emailRedirectTo } })`
2. Check `data.user?.identities?.length === 0` → email already registered
3. On success → redirect to `/auth/verify-email` with confirmation message
4. On error → return `{ error: string }` to form

### Responses
| Case | Outcome |
|------|---------|
| Success | Redirect to `/auth/verify-email` |
| Email taken | Form error: "Este correo ya está registrado" |
| Weak password | Form error: "La contraseña debe tener al menos 8 caracteres" |
| Server error | Form error: "Error del servidor, intenta de nuevo" |

---

## POST /auth/login (Form Action)

**File**: `src/routes/(auth)/login/+page.server.ts`

### Input
| Field | Type | Validation |
|-------|------|-----------|
| `email` | string | Required |
| `password` | string | Required |
| `redirectTo` | string | Optional, query param |

### Behavior
1. Call `supabase.auth.signInWithPassword({ email, password })`
2. On success → `redirect(303, redirectTo ?? '/')`
3. On error → return `{ error: 'Credenciales incorrectas' }` (do not reveal which field)

### Responses
| Case | Outcome |
|------|---------|
| Success | Redirect to `redirectTo` or `/` |
| Invalid credentials | Form error (generic, no field hint) |
| Unconfirmed email | Form error: "Confirma tu correo antes de iniciar sesión" |

---

## POST /auth/logout (Form Action)

**File**: `src/routes/(auth)/logout/+page.server.ts`

### Behavior
1. Call `supabase.auth.signOut({ scope: 'local' })` — current device only
2. `redirect(303, '/login')`

---

## POST /auth/forgot-password (Form Action)

**File**: `src/routes/(auth)/forgot-password/+page.server.ts`

### Input
| Field | Type | Validation |
|-------|------|-----------|
| `email` | string | Required, valid email format |

### Behavior
1. Call `supabase.auth.resetPasswordForEmail(email, { redirectTo: '/auth/callback?next=/account/update-password' })`
2. Always show success message (prevent email enumeration)

### Response
Always: show "Si el correo existe, recibirás un enlace de recuperación."

---

## GET /auth/callback (Server Route)

**File**: `src/routes/auth/callback/+server.ts`

### Query Params
| Param | Required | Notes |
|-------|----------|-------|
| `code` | Yes | PKCE authorization code from Supabase |
| `next` | No | Redirect destination after session creation |

### Behavior
1. Call `supabase.auth.exchangeCodeForSession(code)`
2. On success → `redirect(303, next ?? '/')`
3. On error → `redirect(303, '/auth/login?error=callback_failed')`

---

## POST /account/update-password (Form Action)

**File**: `src/routes/(app)/account/update-password/+page.server.ts`

### Input
| Field | Type | Validation |
|-------|------|-----------|
| `password` | string | Required, min 8 characters |
| `confirmPassword` | string | Must match |

### Behavior
1. Verify `locals.user` exists (server guard — redirect to login if not)
2. Call `supabase.auth.updateUser({ password })`
3. On success → redirect to `/` with success toast

---

## Server Hook: Session Management

**File**: `src/hooks.server.ts`

### Behavior (every request)
1. Create `createServerClient` with `event.cookies.getAll/setAll`
2. Call `supabase.auth.getUser()` — validates JWT with Supabase servers
3. Attach to `event.locals`: `supabase`, `session` (from getSession for data), `user` (from getUser for security)
4. Call `resolve(event, { filterSerializedResponseHeaders: allow 'content-range' })`

### `app.d.ts` extensions
```typescript
interface Locals {
  supabase: SupabaseClient
  safeGetSession: () => Promise<{ session: Session | null; user: User | null }>
}
interface PageData {
  session: Session | null
}
```
