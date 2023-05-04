# JA3 Fingerprint for EdgeWorkers
Calculates JA3 Fingerprint using EdgeWorkers.

This EW code gets TLS ClientHello data from `PMUSER_TLS_CLIENT_HELLO` and
sets JA3 Fingerprint to `PMUSER_JA3_FINGERPRINT`.

## Prerequisite
### CPS
- Network must be **Enhanced TLS**
- Add following tag to ESSLINDEX Metadata Extensions, at the Deployment Settings
    - This tag is required to use `AK_CLIENT_HELLO` which contains raw ClientHello data in Base64 encoding
```xml
<save-client-hello>on</save-client-hello> 
```

### Property
- Define Property Variables
    - PMUSER_TLS_CLIENT_HELLO
    - PMUSER_JA3_FINGERPRINT
- Add an Advanced Behavior to get ClientHello from `AK_CLIENT_HELLO`
```xml
<match:request.type value="CLIENT_REQ" result="true">
  <assign:variable>
    <name>PMUSER_TLS_CLIENT_HELLO</name>
    <value>%(AK_CLIENT_HELLO)</value>
  </assign:variable>
</match:request.type>
```
- Add EdgeWorkers Behavior
- Use `PMUSER_JA3_FINGERPRINT` after the EdgeWorkers Behavior

## Note
You cannot see the variable value in `X-Akamai-Session-Info` response header because `request.setVariable` method changes security settings of variables to hidden, even you declare `PMUSER_JA3_FINGERPRINT` with visible.

## Compatibility
| Network | Protocol | Support |
| --- | :--- | :---: |
| Enhanced TLS | HTTP/1.1 | o |
|              | HTTP/2   | o |
|              | HTTP/3   | o |
| Standard TLS | HTTP/1.1 | x |
|              | HTTP/2   | x |
|              | HTTP/3   | o (!?) |