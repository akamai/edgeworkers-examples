# 103 Early Hints - Dynamic

## Summary
A simple EdgeWorker which
- Selectively enables 103 Early Hints (PMUSER_103_ENABLED=true): For supporting browsers (Chromium 103+) and when sec-fetch-mode=navigate HTTP request header is present.
- Sets the list of resource hints to early hint (PMUSER_103_LIST): A list of 1 or multiple comma seperated [Resource Hints](https://www.w3.org/TR/resource-hints/) dynamically loaded via an HTTP Subrequest. For optimal performance the subrequest should be cached on Akamai with Caching best practices in mind (TTL, Prefresh)

## Prerequisites
Your account needs to be enabled for the 103 Early Hint Prototyp

In Property Manager these 2 specific variables need to be defined

- PMUSER_103_ENABLED
- PMUSER_103_LIST
