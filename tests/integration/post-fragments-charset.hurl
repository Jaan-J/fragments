# tests/integration/post-fragments-charset.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
# We're sending a plain text fragment
Content-Type: text/plain; charset=utf-8
# Body of the request goes in ```...``` when it's a string
```This is a fragment!```

# 1. We expect to get back an HTTP 201
HTTP/1.1 201
# We have various assertions about the response that we want to check 
[Asserts]
# The Location header should look like what we expect (including the fragment id)
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
# Our fragment ids use https://www.npmjs.com/package/nanoid
jsonpath "$.fragment.id" matches "^[A-Za-z0-9_-]+$"
# Our ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
# You could also write a regex for this and use matches
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/plain; charset=utf-8"
# 19 is the length of our fragment data: 'This is a fragment!'
jsonpath "$.fragment.size" == 19
# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

# 2. Try to GET the fragment we just posted by its URL
GET {{url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
Content-Length: 19
[Asserts]
body == "This is a fragment!"
