## Description
This example enables `Secure` attribute of set-cookie headers which doesn't have the attribute from Origin server. For set-cookie response headers which don't have `Secure` attribute, the attribute is added at Edge. For headers which already have `Secure` attribute, the headers are just passed at Edge.

## Usage Example
    // Response from Origin Server
    set-cookie: Apache=abcdefg; expires=Thu, 23 Jun 2022 02:31:15 GMT; path=/
    set-cookie: id=123; Expires=Wed, 22 Jun 2022 12:59:33 GMT; Path=/; secure; HttpOnly
    
    // Response from Edge
    set-cookie: Apache=abcdefg; Expires=Thu, 23 Jun 2022 02:31:15 GMT; Path=/; Secure
    set-cookie: id=123; Expires=Wed, 22 Jun 2022 12:59:33 GMT; Path=/; Secure; HttpOnly
