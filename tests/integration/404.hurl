GET http://localhost:8080/no-such-route

HTTP/1.1 404

[Asserts]
# assert that the response status is error
jsonpath "$.status" == "error"
