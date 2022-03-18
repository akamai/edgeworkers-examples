## Description
The examples in this section detail how to use EdgeWorkers and EdgeKV to perform personalization of web content.

## Subfolder organization
* **/cachekey-devicetype**: Add client device type into cache key to enable device-specific content caching without changing URL
* **/cookie-geolocation**: Add geolocation data to a cookie in the HTTP response
* **/forward-devicetype**: Modifies the forward origin path of the URL to return device-specific content 
* **/microservice-geolocation**: A microservice GEO-location API call that returns location information about the client and where the request originates
* **/storelocator**: A microservice store locater API call that returns the two stores nearest to the provided latititude and longitude  
* **/validate-promo-code(EKV)**: Uses EW and EKV to validate store promotional codes at the Edge, with codes and date ranges stored in EKV. 


## Related Resources
- [EdgeWorkers CLI](https://developer.akamai.com/cli/packages/edgeworkers.html)
- [EdgeWorkers documentation](https://techdocs.akamai.com/edgeworkers/docs)
- [EdgeKV documentation](https://techdocs.akamai.com/edgekv/docs)
