# Security model

Destinations must be absolute HTTP(S) URLs. The policy rejects embedded credentials, loopback, link-local, RFC1918 IPv4, local hostnames and local IPv6 ranges. Fragments are removed because they never reach the destination server and can leak client-only state.

Custom aliases allow only URL-safe characters and reserve service paths. Rate limits are keyed from the socket address unless `TRUST_PROXY=true`; forwarded addresses are never trusted by default. Visitor identifiers are salted hashes, not raw addresses.

The service sets restrictive content, frame and referrer headers. Cursor signatures prevent clients from editing pagination positions, while idempotency fingerprints prevent key reuse across payloads.

This is redirect-safety hardening, not a network egress proxy: the server does not fetch destination URLs.
