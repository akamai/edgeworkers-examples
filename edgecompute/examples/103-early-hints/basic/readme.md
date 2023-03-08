
##103 Early Hints - Basic

Simple EdgeWorker which runs Early hints for supporting browsers (Chromium 103+) and when sec-fetch-mode=navigate HTTP request header is present.

In Property Manager these 2 specific variables need to be defined
- PMUSER_103_ENABLED: true|false
- PMUSER_103_LIST: A list of 1 or multiple comma seperated (Resource Hints)[https://www.w3.org/TR/resource-hints/]
