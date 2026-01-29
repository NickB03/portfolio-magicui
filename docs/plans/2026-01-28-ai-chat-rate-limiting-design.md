# AI Chat Rate Limiting & Protection Design

**Date:** 2026-01-28
**Status:** Approved
**Goal:** Implement basic protection and rate limiting for the AI chat feature on Nick's portfolio site

---

## Overview

Add rate limiting and basic security protections to the AI chat feature to prevent abuse while maintaining a smooth experience for legitimate visitors (recruiters, hiring managers, portfolio viewers).

### Requirements
- **Not overly aggressive** - should allow normal conversations
- **Simple implementation** - minimal infrastructure complexity
- **Cost protection** - prevent API quota exhaustion from abuse
- **Good UX** - clear feedback when limits are hit

---

## Design Decisions

### Rate Limiting Approach

**Strategy:** Per-IP rate limiting with sliding window algorithm

**Limits:**
- **20 messages per 15-minute window** (80 messages/hour)
- Allows extended conversations while preventing abuse
- Appropriate for portfolio site with recruiters/hiring managers

**Storage:** In-memory Map in Edge runtime
- Zero additional infrastructure cost
- Fast O(1) lookups
- Acceptable trade-offs:
  - State resets on deployments (typically once/day or less)
  - No state sharing across edge regions (actually helps distribute load)
  - Lost on crashes (rare, acceptable for soft limits)
- Reasonable for portfolio site traffic levels

### Platform: Cloudflare

**IP Extraction Priority:**
1. `CF-Connecting-IP` (Cloudflare's client IP header - most reliable)
2. `x-forwarded-for` (fallback)
3. `x-real-ip` (secondary fallback)
4. `127.0.0.1` (localhost for development)

**Why CF-Connecting-IP:**
- Cloudflare's standard header for actual client IP
- Always present when proxied through Cloudflare
- More reliable than x-forwarded-for (can't be spoofed before Cloudflare)
- Works with Cloudflare Pages and Workers

---

## Architecture

### File Structure

```
src/
├── app/
│   └── api/
│       └── chat/
│           └── route.ts (enhanced with rate limiting)
└── lib/
    └── rate-limiter.ts (new - core rate limiting logic)
```

### Rate Limiter Module (`src/lib/rate-limiter.ts`)

**Core functionality:**
- Sliding window algorithm tracking requests per IP
- Data structure: `Map<string, { requests: number[], windowStart: number }>`
- Automatic cleanup of expired windows every 5 minutes

**Interface:**
```typescript
checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}
```

**Memory Management:**
- Cleanup function runs every 5 minutes via `setInterval`
- Removes entries older than 15 minutes
- Prevents unbounded memory growth
- Typical footprint: ~100 IPs × 20 timestamps = ~2KB

### API Route Enhancement (`src/app/api/chat/route.ts`)

**Changes:**
1. Extract client IP from request headers
2. Call rate limiter before processing
3. Return 429 with helpful headers if limit exceeded
4. Preserve all existing functionality (RAG, streaming, error handling)

**Response Headers:**
- `X-RateLimit-Limit: 20`
- `X-RateLimit-Remaining: <count>`
- `X-RateLimit-Reset: <timestamp>`
- `Retry-After: <seconds>`

---

## Error Handling & User Experience

### Rate Limit Error Response (429)

```typescript
{
  error: "Rate limit exceeded",
  message: "You've sent too many messages. Please wait before trying again.",
  retryAfter: 300, // seconds until reset
  limit: 20,
  windowMinutes: 15
}
```

### Client-Side Handling (`ai-chat-provider.tsx`)

**When 429 received:**
- Display user-friendly message: "You've reached the message limit. You can send more messages in X minutes."
- Show countdown timer if possible
- Disable input field temporarily
- Auto-re-enable when rate limit expires

### Input Validation & Security

**Message validation:**
- Maximum length: 2000 characters (reasonable for portfolio questions)
- Type checking: ensure message is string
- Trim whitespace (already implemented)
- Empty message check (already implemented)

**Security improvements:**
- Never expose stack traces or internal errors in production
- Return generic "Something went wrong" for unexpected errors
- Log detailed errors server-side only
- Keep existing Gemini API quota handling (429 responses)

**Request size limits:**
- Next.js default 4MB max (more than sufficient)
- Typical message size: < 2KB

**Graceful degradation:**
- If rate limiter fails unexpectedly, allow request through
- Log failure but don't block legitimate users
- Rate limiting is protection, not a hard requirement

---

## Testing Strategy

### Local Development Testing

**Easy testing:**
- Rate limiter works in dev (localhost = 127.0.0.1)
- Send 21 messages quickly to trigger limit
- Verify 429 responses and client UI updates
- Check that limits reset after 15 minutes

### Manual Testing Checklist

- [ ] Send 20 messages rapidly → all succeed
- [ ] Send 21st message → gets 429 with proper error message
- [ ] Client shows "rate limited" message with countdown
- [ ] Wait 15 minutes → can send messages again
- [ ] Multiple browser tabs (same IP) → share rate limit
- [ ] Deploy to Cloudflare → verify CF-Connecting-IP extraction works

### Monitoring After Deploy

**Watch for:**
- 429 response rates in logs
- Legitimate users getting blocked (adjust limits if needed)
- Memory usage (should be negligible)

---

## Deployment

### Zero Downtime Deployment

- Changes are backward compatible
- Rate limiter starts with empty state
- First deployment gives everyone fresh 20-message window
- No database migrations or infrastructure changes needed

### Rollback Plan

- If rate limiting causes issues, remove the check and redeploy
- All other functionality remains intact (RAG, streaming, error handling)
- No data loss or corruption risk

---

## Future Enhancements (Out of Scope)

These are intentionally excluded from initial implementation:

- **Persistent storage** (Cloudflare KV/D1) for limits across deployments
- **Per-user authentication** with higher limits for logged-in users
- **Analytics dashboard** showing rate limit metrics
- **IP whitelist** for trusted users/recruiters
- **Environment variable configuration** for limits (hardcoded for now)
- **Dynamic rate adjustment** based on API quota consumption

---

## Trade-offs & Rationale

### Why In-Memory Storage?

**Pros:**
- Zero infrastructure cost
- Zero configuration
- Fast O(1) operations
- Simple implementation
- Adequate for portfolio site traffic

**Cons accepted:**
- State resets on deployments (acceptable for soft limits)
- No state sharing across regions (actually beneficial for load distribution)
- Lost on crashes (rare with Edge runtime)

**Why this works:**
- Portfolio sites have relatively low traffic
- Rate limiting is abuse prevention, not billing enforcement
- Simplicity > perfect persistence for this use case

### Why 20 messages per 15 minutes?

**Rationale:**
- Allows 80 messages/hour (extended conversations)
- Reasonable for recruiters/hiring managers asking detailed questions
- Prevents basic abuse (bots, malicious actors)
- Can easily adjust based on real-world usage

### Why Sliding Window?

**Vs Fixed Window:**
- No burst allowance at window boundaries
- More gradual enforcement
- Better user experience

**Vs Token Bucket:**
- Simpler implementation
- Easier to explain to users
- Sufficient for this use case

---

## Success Criteria

- ✅ Legitimate users can have normal conversations (15-20 question exchanges)
- ✅ Abuse/bots are blocked before exhausting API quotas
- ✅ Clear feedback when limits are hit
- ✅ No impact on site performance or latency
- ✅ Zero additional infrastructure costs
- ✅ Simple to understand and maintain

---

## Implementation Notes

### IP Extraction Code Pattern

```typescript
function getClientIP(request: Request): string {
  const cfConnectingIp = request.headers.get('CF-Connecting-IP');
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIp = request.headers.get('x-real-ip');

  return cfConnectingIp ||
         xForwardedFor?.split(',')[0].trim() ||
         xRealIp ||
         '127.0.0.1';
}
```

### Sliding Window Algorithm Pattern

```typescript
const now = Date.now();
const windowMs = 15 * 60 * 1000; // 15 minutes

// Filter to only recent requests
const recentRequests = requests.filter(timestamp =>
  now - timestamp < windowMs
);

// Check if under limit
if (recentRequests.length < 20) {
  recentRequests.push(now);
  return { allowed: true, remaining: 20 - recentRequests.length };
}

return { allowed: false, remaining: 0 };
```

---

## Next Steps

1. Implement `src/lib/rate-limiter.ts`
2. Enhance `src/app/api/chat/route.ts` with rate limiting
3. Update `src/components/ui/ai-chat/ai-chat-provider.tsx` for 429 handling
4. Test locally with rapid message sending
5. Deploy to Cloudflare
6. Monitor for 24-48 hours
7. Adjust limits if needed based on real usage

---

**Design approved by:** Nick
**Ready for implementation:** Yes
