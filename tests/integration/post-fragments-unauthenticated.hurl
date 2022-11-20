# tests/integration/post-fragments.hurl
# not authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: image/webp
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:notThePassword
# Body of the request goes in ```...``` when it's a string
```This is a fragment!```

# 1. We expect to get back an HTTP 401
HTTP/1.1 401