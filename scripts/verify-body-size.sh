#!/bin/bash

# Configuration
URL="http://localhost:3001/api/otel/trace"
MAX_SIZE=1000000 # 1MB

echo "Starting security verification for MAX_BODY_SIZE enforcement..."

# Helper to create a file of specific size
create_file() {
    local size=$1
    local name=$2
    dd if=/dev/zero of="$name" bs=1 count="$size" 2>/dev/null
}

# 1. Test valid small request
echo -n "Test 1: Valid small request (1KB)... "
create_file 1024 small_body.bin
# Use -H to simulate the telemetry token if needed, or just test size rejection
# The middleware checks token first, then size. 
# But for size check verification, we want to see if we get 411 or 413 or 401.
# Actually, if we send without token, it should return 401. 
# But size check is before rate limit but after token validation in route?
# Let's check middleware.ts again. Middleware checks config -> body size -> rate limit.
# Route handler checks token validation.
# So if we don't provide a token, we might get 401 from route handler IF it passes middleware.

# Middleware check order:
# 1. Config check (passes for /api/otel/trace)
# 2. Strict Body Size Check (Content-Length)
# 3. Length Required (if missing)
# 4. Rate Limit
# 5. NextResponse.next() -> goes to route handler

# Route handler check order:
# 1. Token validation (returns 401 if missing)
# 2. ... size check ...

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$URL" -H "Content-Length: 1024" --data-binary @small_body.bin)
if [ "$STATUS" == "401" ] || [ "$STATUS" == "202" ]; then
    echo "PASS (Status: $STATUS - passed middleware size check)"
else
    echo "FAIL (Status: $STATUS)"
fi

# 2. Test oversized request via Content-Length header
echo -n "Test 2: Oversized via Content-Length (1.1MB)... "
create_file 1100000 large_body.bin
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$URL" -H "Content-Length: 1100000" --data-binary @large_body.bin)
if [ "$STATUS" == "413" ]; then
    echo "PASS (Status: 413 Payload Too Large)"
else
    echo "FAIL (Status: $STATUS)"
fi

# 3. Test missing Content-Length header (should return 411 from middleware)
echo -n "Test 3: Missing Content-Length header... "
# curl might automatically add Content-Length, so we try to suppress it or use chunked encoding
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$URL" -H "Transfer-Encoding: chunked" --data-binary @small_body.bin)
if [ "$STATUS" == "411" ]; then
    echo "PASS (Status: 411 Length Required)"
else
    echo "FAIL (Status: $STATUS)"
fi

# 4. Test spoofed Content-Length (Small header, but large body)
# This requires chunked encoding or a tool that allows mismatched headers.
# curl --data-binary @large_body.bin -H "Content-Length: 100" might just send 100 bytes.
# We want to test the stream enforcement in route.ts.
# To test this, we need to bypass middleware's Content-Length check but still send a large body.
# If we use Transfer-Encoding: chunked, middleware should return 411.
# So we need a valid but small Content-Length, and then send more data?
# Standard HTTP clients won't easily do this. 
# But let's try to verify the route handler logic by mocking or similar if possible.
# For now, at least Test 2 verifies the middleware enforcement.

# Cleanup
rm small_body.bin large_body.bin
echo "Verification complete."
