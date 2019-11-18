# conference-details

*Keyword(s):* constructed-response, endpoint, traffic filtering<br>
*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

This example implements a Conference Attendance Code API call that returns the meeting details of a conference as HTML if the user provides the correct code (if you did this in the browser it would defeat the confidentiality purpose).

## Usage Examples

    /conference/conf.html?key=abc123
    (HTML will show conference details)

    /conference/conf.html?key=foo
    (HTML will show an error in text)

With `abc123` in the `key` GET parameter, the user is shown conference details, without going all the way to origin, but by replacing values of `key`, you get an error instead, keeping the information away from the browser.

## Similar Uses

A similar EdgeWorker could take commerce discount codes and return data for an order form such as discount percentage to apply.

Where the workflow requires a quick check of widely-distributed codes for simple functions that are semi-public, this is a solution.

## Resources
See the repo [README](https://github.com/akamai/edgeworkers-examples#Resources) for additional guidance.