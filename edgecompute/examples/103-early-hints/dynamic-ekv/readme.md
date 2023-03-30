# 103 Early Hints - Dynamic with EKV

## Summary
A simple EdgeWorker which:
- Selectively enables 103 Early Hints (PMUSER_103_ENABLED=true): For supporting browsers (Chromium 103+) and when sec-fetch-mode=navigate HTTP request header is present.
- Sets the list of resource hints to early hint (PMUSER_103_LIST): A list of 1 or multiple comma seperated [Resource Hints](https://www.w3.org/TR/resource-hints/) dynamically loaded via an EKV lookup.

## Prerequisites
Your account needs to be enabled for the 103 Early Hint Prototype.
Your account needs to have EKV Enabled

In Property Manager these 2 specific variables need to be defined

- PMUSER_103_ENABLED
- PMUSER_103_LIST
