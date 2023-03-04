# Example
The examples in this section detail how to use Dash module for manifest manipulation
Manifest Personalization helps to dynamically create personalized versions of Dash manifests based on parameters like device type, user geography, request headers or query string parameters.This example demonstrates use of query string parameters.
main.js provides examples using ReadableStream, WritableStream for different use cases as defined below:
filterVariantsByBandwidth which filters out dash MPD representations by bandwidth value passed using query param br_in_range and br_in
example curl :

``` 
curl -vk -H "Pragma: akamai-x-ew-debug-subs,akamai-x-ew-debug,akamai-x-ew-debug,akamai-x-ew-debug-rp" "https://hostname/sample1.mpd?br_in_range=400000-600000,800000-1000000"
curl -vk -H "Pragma: akamai-x-ew-debug-subs,akamai-x-ew-debug,akamai-x-ew-debug,akamai-x-ew-debug-rp" "https://hostname/sample1.mpd?br_in=400000,600000,800000,1000000" 

```

filterVariantsByResolution which filters out dash MPD representations by resolution value passed using query param rs_device
example curl :
```
curl -vk -H "Pragma: akamai-x-ew-debug-subs,akamai-x-ew-debug,akamai-x-ew-debug,akamai-x-ew-debug-rp x-ew-code-profile-responseprovider" "https://hostname/sample1.mpd?rs_device=320-240"

```

updateVariantAtIndex reorders the provided representation and places it at the specified index using query params rs_element and rs_index
example curl :
rs_element specifies the representation resolution and rs_index is the new index where the representation has to be moved.
``` 
curl -vk -H "Pragma: akamai-x-ew-debug-subs,akamai-x-ew-debug,akamai-x-ew-debug,akamai-x-ew-debug-rp x-ew-code-profile-responseprovider" "https://hostname/sample1.mpd?rs_element=640-480&rs_index=1"

```

updateVariants reorders the provided representations starting from index 0
example curl :
```
curl -vk -H "Pragma: akamai-x-ew-debug-subs,akamai-x-ew-debug,akamai-x-ew-debug,akamai-x-ew-debug-rp x-ew-code-profile-responseprovider" "https://hostname/sample1.mpd?rs_order=320-240,640-480"

```
In the above example, representation matching resolution 320-240 is moved to index 0 and representation matching resolution 640-480 is moved to index 1.

filterVariantsByAudioLanguage filters representations based on the audio language. Only representations matching audio languages provided in query param lo_geo is retained and other representations are filtered out
example curl :
```
curl -vk -H "Pragma: akamai-x-ew-debug-subs,akamai-x-ew-debug,akamai-x-ew-debug,akamai-x-ew-debug-rp x-ew-code-profile-responseprovider" "https://hostname/sample1.mpd?lo_geo=en,fr"

```

filterVariantsBySubtitlesLanguage filters representations based on the audio language. Only representations matching subtitle languages provided in  query param lo_geo is retained and other representations are filtered out
example curl :
```
curl -vk -H "Pragma: akamai-x-ew-debug-subs,akamai-x-ew-debug,akamai-x-ew-debug,akamai-x-ew-debug-rp x-ew-code-profile-responseprovider" "https://hostname/sample1.mpd?lo_geo=en,fr"

```