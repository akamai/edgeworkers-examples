# EdgeKV Helper Library

This helper class can be used to simplify the interaction with EdgeKV in EdgeWorker code. It abstracts away the complexity into a few lines of code.


## Files
* edgekv.js is the helper class you import in your main.js file. This file provides a new class you can create an instance of with helper methods to interact with EdgeKV.
* main.js is an example main class for a code bundle. It can include performing GET, PUT, and DELETE operations on an EdgeKV namespaces.


## Setup
The edgekv.js file must be included alongside `edgekv_tokens.js` which includes the EdgeKV authorization tokens for each namespace you wish to interact with using this EdgeKV helper class. Please refer to the getting started [guide](https://techdocs.akamai.com/edgekv/docs/create-an-edgekv-enabled-edgeworkers-function) for how to work with EdgeKV from within EdgeWorkers.


## Documentation
### Constructor
	/**
	 * Constructor to allow setting default namespace and group
	 * These defaults can be overridden when making individual GET, PUT, and DELETE operations
	 * 
	 * @typedef {Object} Opts
	 * @property {string} [namespace="default"] the default namespace to use for all GET, PUT, and DELETE operations
	 * 		Namespace must be 32 characters or fewer, consisting of A-Z a-z 0-9 _ or -
	 * @property {string} [group="default"] the default group to use for all GET, PUT, and DELETE operations
	 * 		Group must be 128 characters or fewer, consisting of A-Z a-z 0-9 _ or -
	 * @property {number} [num_retries_on_timeout=0] the number of times to retry a GET requests when the sub request times out
	 * @property {object} [ew_request=null] passes the request object from the EdgeWorkers event handler to enable access to EdgeKV data in sandbox environments
	 * @property {boolean} [sandbox_fallback=false] whether to fall back to retrieving staging data if the sandbox data does not exist, instead of returning null or the specified default value
	 * 
	 * @param {Opts|string} [namespace="default"] the default namespace to use for all GET, PUT, and DELETE operations
	 * @param {string} [group="default"] the default group to use for all GET, PUT, and DELETE operations
	 * 		Group must be 128 characters or fewer, consisting of A-Z a-z 0-9 _ or -
	 */
	new EdgeKV({namespace = "default", group = "default", num_retries_on_timeout = 0})
### getText
	/**
	 * async GET text from an item in the EdgeKV.
	 * @param {Object} args
	 * @param {string} [args.namespace=this.#namespace] specify a namespace other than the default
	 * @param {string} [args.group=this.#group] specify a group other than the default
	 * @param {string} args.item item key to get from the EdgeKV
	 * @param {string?} [args.default_value=null] the default value to return if a 404 response is returned from EdgeKV
	 * @param {number?} [args.timeout=null] the maximum time, between 1 and 4000 milliseconds, to wait for the response
	 * @param {number?} [args.num_retries_on_timeout=null] the number of times to retry a requests when the sub request times out
	 * @returns {Promise<string>} if the operation was successful, the text response from the EdgeKV or the default_value on 404
	 * @throws {EdgeKVError} if the operation was not successful,
	 * 		an object describing the non-200 and non-404 response from the EdgeKV: {failed, status, body}
	 */
	async getText({ namespace = this.#namespace, group = this.#group, item, default_value = null, timeout = null, num_retries_on_timeout = null } = {}) 
### getJson
	/**
	 * async GET json from an item in the EdgeKV.
	 * @param {Object} args
	 * @param {string} [args.namespace=this.#namespace] specify a namespace other than the default
	 * @param {string} [args.group=this.#group] specify a group other than the default
	 * @param {string} args.item item key to get from the EdgeKV
	 * @param {Object} [args.default_value=null] the default value to return if a 404 response is returned from EdgeKV
	 * @param {number?} [args.timeout=null] the maximum time, between 1 and 4000 milliseconds, to wait for the response
	 * @param {number?} [args.num_retries_on_timeout=null] the number of times to retry a requests when the sub request times out
	 * @returns {Promise<Object>} if the operation was successful, the json response from the EdgeKV or the default_value on 404
	 * @throws {EdgeKVError} if the operation was not successful,
	 * 		an object describing the non-200 and non-404 response from the EdgeKV: {failed, status, body}
	 */
	async getJson({ namespace = this.#namespace, group = this.#group, item, default_value = null, timeout = null, num_retries_on_timeout = null } = {})
### putText
	/**
	 * async PUT text into an item in the EdgeKV.
	 * @param {Object} args
	 * @param {string} [args.namespace=this.#namespace] specify a namespace other than the default
	 * @param {string} [args.group=this.#group] specify a group other than the default
	 * @param {string} args.item item key to put into the EdgeKV
	 * @param {string} args.value text value to put into the EdgeKV
	 * @param {number?} [args.timeout=null] the maximum time, between 1 and 4000 milliseconds, to wait for the response
	 * @returns {Promise<string>} if the operation was successful, the response from the EdgeKV
	 * @throws {EdgeKVError} if the operation was not successful,
	 * 		an object describing the non-200 response from the EdgeKV: {failed, status, body}
	 */
	async putText({ namespace = this.#namespace, group = this.#group, item, value, timeout = null } = {})
### putTextNoWait
	/**
	 * PUT text into an item in the EdgeKV while only waiting for the request to send and not for the response.
	 * @param {Object} args
	 * @param {string} [args.namespace=this.#namespace] specify a namespace other than the default
	 * @param {string} [args.group=this.#group] specify a group other than the default
	 * @param {string} args.item item key to put into the EdgeKV
	 * @param {string} args.value text value to put into the EdgeKV
	 * @throws {EdgeKVError} if the operation was not successful at sending the request,
	 * 		an object describing the error: {failed, status, body}
	 */
	putTextNoWait({ namespace = this.#namespace, group = this.#group, item, value } = {}) 
### putJson
	/**
	 * async PUT json into an item in the EdgeKV.
	 * @param {Object} args
	 * @param {string} [args.namespace=this.#namespace] specify a namespace other than the default
	 * @param {string} [args.group=this.#group] specify a group other than the default
	 * @param {string} args.item item key to put into the EdgeKV
	 * @param {Object} args.value json value to put into the EdgeKV
	 * @param {number?} [args.timeout=null] the maximum time, between 1 and 4000 milliseconds, to wait for the response
	 * @returns {Promise<string>} if the operation was successful, the response from the EdgeKV
	 * @throws {EdgeKVError} if the operation was not successful,
	 * 		an object describing the non-200 response from the EdgeKV: {failed, status, body}
	 */
	async putJson({ namespace = this.#namespace, group = this.#group, item, value, timeout = null } = {})
### putJsonNoWait
	/**
	 * PUT json into an item in the EdgeKV while only waiting for the request to send and not for the response.
	 * @param {Object} args
	 * @param {string} [args.namespace=this.#namespace] specify a namespace other than the default
	 * @param {string} [args.group=this.#group] specify a group other than the default
	 * @param {string} args.item item key to put into the EdgeKV
	 * @param {object} args.value json value to put into the EdgeKV
	 * @throws {EdgeKVError} if the operation was not successful at sending the request,
	 * 		an object describing the error: {failed, status, body}
	 */
	putJsonNoWait({ namespace = this.#namespace, group = this.#group, item, value } = {})
### delete
	/**
	 * async DELETE an item in the EdgeKV.
	 * @param {Object} args
	 * @param {string} [args.namespace=this.#namespace] specify a namespace other than the default
	 * @param {string} [args.group=this.#group] specify a group other than the default
	 * @param {string} args.item item key to delete from the EdgeKV
	 * @param {number?} [args.timeout=null] the maximum time, between 1 and 4000 milliseconds, to wait for the response
	 * @returns {Promise<string>} if the operation was successful, the text response from the EdgeKV
	 * @throws {EdgeKVError} if the operation was not successful,
	 * 		an object describing the non-200 response from the EdgeKV: {failed, status, body}
	 */
	async delete({ namespace = this.#namespace, group = this.#group, item, timeout = null } = {})
### deleteNoWait
	/**
	 * DELETE an item in the EdgeKV while only waiting for the request to send and not for the response.
	 * @param {Object} args
	 * @param {string} [args.namespace=this.#namespace] specify a namespace other than the default
	 * @param {string} [args.group=this.#group] specify a group other than the default
	 * @param {string} args.item item key to delete from the EdgeKV
	 * @throws {EdgeKVError} if the operation was not successful at sending the request,
	 * 		an object describing the error: {failed, status, body}
	 */
	deleteNoWait({ namespace = this.#namespace, group = this.#group, item } = {})
### Errors
	All errors coming from the use of the EdgeKV class will be in the following format:
	{
		"failed": "whatFailed",
		"status": responseStatusCode,
		"body": "descriptionOfFailure"
	}

## Usage Examples
### Get Product Sale Price
	try {
		const edgeKv = new EdgeKV({ group: "ProductSalePrice" }); // the namespace will be "default" since it is not provided
		let salePrice = await edgeKv.getText({ item: productId, default_value: "N/A" });
		// use the salePrice in the page
	} catch (error) {
		// do something in case of an error
	}
### Write the Product Modification Time
	try {
		const edgeKv = new EdgeKV({ group: "LastUpdated" });
		let date = new Date().toString();
		await edgeKv.putText({ item: productId, value: date });
		// this information can then be used to see when a product was last updated
	} catch (error) {
		// do something in case of an error
	}
### Write the Product Modification Time Without Wait For Response
	try {
		const edgeKv = new EdgeKV({ group: "LastUpdated" });
		let date = new Date().toString();
		edgeKv.putTextNoWait({ item: productId, value: date });
		// this information can then be used to see when a product was last updated
	} catch (error) {
		// do something in case of an error
	}


## Resources
Please see the examples tagged "EKV" [here](https://github.com/akamai/edgeworkers-examples/tree/master/edgecompute/examples) for example usage of this helper library.

For information on using EdgeWorkers and EdgeKV, please review [Akamai's product policy ](https://www.akamai.com/site/en/documents/akamai/2022/edgeworkers-and-edgekv-supplemental-product-policy.pdf)
