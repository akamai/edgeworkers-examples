#
This EdgeWorker randomly places a user into one of two “buckets'' (A or B), and forwards the request to either an experimental or control URL, depending on the bucket they are assigned to. 

The bucket-to-path mapping will be stored in an EdgeKV database, and
Client bucket selection will be persisted via a cookie value to ensure a client is locked to the same URL on subsequent visits. 
The test will be implemented by redirecting a user accessing a website with a URI path of /edgekv/abtest. 
