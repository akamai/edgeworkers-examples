# conference-details

This example implements a Conference Attendance Code API call that
returns the meeting details of a conference as HTML if the user
provides the correct code. (If you did this in the browser it would
defeat the confidentiality purpose.)

## Examples

    /conference/conf.html?key=abc123

    (HTML will show conference details)


    /conference/conf.html?key=foo

    (HTML will show an error in text)

With `abc123` in the `key` GET parameter, the user is shown conference
details, without going all the way to origin, but by replacing values
of `key`, you get an error instead, keeping the information away from
the browser.

## Similar Uses

A similar EdgeWorker could take commerce discount codes and return
data for an order form such as discount percentage to apply.

Where the workflow requires a quick check of widely-distributed codes
for simple functions that are semi-public, this is a solution.

## More details on EdgeWorkers
- [Akamai EdgeWorkers](https://developer.akamai.com/akamai-edgeworkers-overview)
- [Akamai EdgeWorkers Examples](https://github.com/akamai/edgeworkers-examples)
- [Akamai CLI for EdgeWorkers](https://developer.akamai.com/legacy/cli/packages/edgeworkers.html)
