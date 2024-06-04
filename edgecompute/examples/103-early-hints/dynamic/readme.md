# 103 Early Hints - Dynamic

## Summary
A simple EdgeWorker which:
Sets the list of resource hints to early hint (PMUSER_103_HINTS): A list of 1 or multiple comma seperated [Resource Hints](https://www.w3.org/TR/resource-hints/) dynamically loaded via an HTTP Subrequest. For optimal performance the subrequest should be cached on Akamai with Caching best practices in mind (TTL, Prefresh)

## Prerequisites
See Akamai Techdocs for known limitations and supported products.
