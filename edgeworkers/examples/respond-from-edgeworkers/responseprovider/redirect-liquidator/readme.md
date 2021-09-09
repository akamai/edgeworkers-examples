# RedirectLiquidator
The RedirectLiquidator EdgeWorker silently transforms 301/302 into a 200 response
🎯 No redirect
✅ New content
✅ Updated URL

Chases redirects from the origin
Optionally manage redirects at the Edge
Injects <history.replaceState> in the response body of the 200 response

## How it works
Instead of serving a response with a 301/302 redirect we directly serve the actual content (200) and inject 1 extra line of JavaScript in the <head> section. 

This JS snippet updates the URL without triggering a redirect. This is done using the history.replaceState method from the History API. The History API is well supported with an adoption rate of 96%+.

## What about bots?

This feature should not be enabled for bots (eg. Google Crawler). When a bot crawls an outdated link they must receive the original 301/302 response.
This can be done based on User Agent matching or more correctly using Botman and the technique (described here)[https://developer.akamai.com/blog/2020/02/25/improve-performance-and-seo-tuning-crawlers].
  
  
  
## Q&A
**Isn’t this the same as redirect chasing available in Property Manager?**
Redirect chasing is great, however the result is a 200 on the original URL. While Redirect Liquidation also covers updating the URL in the browser.

**What is the difference with a forward rewrite?**
Forward rewrites are a perfect use case to serve content over a different URL. A forward rewrite returns a 200 but does not change the original URL seen by the enduser.

**Could you do this at the origin**
Yes, this technique is nothing specific to Akamai. However depending on the CMS/Framework  of the customer this might be too complex or not even possible at  all.

