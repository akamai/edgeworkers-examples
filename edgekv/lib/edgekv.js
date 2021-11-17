/*
(c) Copyright 2020 Akamai Technologies, Inc. Licensed under Apache 2 license.
Version: 0.5.0
Purpose:  Provide a helper class to simplify the interaction with EdgeKV in an EdgeWorker.
Repo: https://github.com/akamai/edgeworkers-examples/tree/master/edgekv/lib
*/

import { TextDecoderStream } from 'text-encode-transform';
import { WritableStream } from 'streams';
import { httpRequest } from 'http-request';
/**
 * You must include edgekv_tokens.js in your bundle for this class to function properly.
 * edgekv_tokens.js must include all namespaces you are going to use in the bundle.
 */
import { edgekv_access_tokens } from './edgekv_tokens.js';

export class EdgeKV {
	#namespace;
	#group;
	#edgekv_uri;
	#token_override;
	#num_retries_on_timeout;

	/**
	 * Constructor to allow setting default namespace and group
	 * These defaults can be overriden when making individual GET, PUT, and DELETE operations
	 * @param {string} [$0.namepsace] the default namespace to use for all GET, PUT, and DELETE operations
	 * 		Namespace must be 32 characters or less, consisting of A-Z a-z 0-9 _ or -
	 * @param {string} [$0.group] the default group to use for all GET, PUT, and DELETE operations
	 * 		Group must be 128 characters or less, consisting of A-Z a-z 0-9 _ or -
	 * @param {number} [$0.num_retries_on_timeout=0] the number of times to retry a GET requests when the sub request times out
	 */
	constructor(namespace = "default", group = "default") {
		if (typeof namespace === "object") {
			this.#namespace = namespace.namespace || "default";
			this.#group = namespace.group || "default";
			this.#edgekv_uri = namespace.edgekv_uri || "https://edgekv.akamai-edge-svcs.net";
			this.#token_override = namespace.token_override || null;
			this.#num_retries_on_timeout = namespace.num_retries_on_timeout || 0;
		} else {
			this.#namespace = namespace;
			this.#group = group;
			this.#edgekv_uri = "https://edgekv.akamai-edge-svcs.net";
			this.#token_override = null;
			this.#num_retries_on_timeout = 0;
		}
	}

	throwError(failed_reason, status, body) {
		throw {
			failed: failed_reason,
			status: status,
			body: body,
			toString: function () { return JSON.stringify(this); }
		};
	}

	async requestHandlerTemplate(http_request, handler_200, handler_large_200, error_text, default_value, num_retries_on_timeout) {
		try {
			let response = await http_request();
			switch (response.status) {
				case 200:
					// need to handle content length > 128000 bytes differently in EdgeWorkers
					let contentLength = response.getHeader('Content-Length');
					if (!contentLength || contentLength.length == 0 || contentLength[0] >= 128000) {
						return handler_large_200(response);
					} else {
						return handler_200(response);
					}
				case 404:
					return default_value;
				default:
					let content = "";
					try {
						content = await response.text();
						content = JSON.parse(content);
					} catch (error) { }
					throw { status: response.status, body: content }; // to be caught in surrounding catch block
			}
		} catch (error) {
			if (num_retries_on_timeout > 0 && /^.*subrequest to URL.*timed out.*$/.test(error.toString())) {
				return this.requestHandlerTemplate(http_request, handler_200, handler_large_200, error_text, default_value, num_retries_on_timeout - 1);
			}
			if (error.hasOwnProperty('status')) {
				this.throwError(error_text + " FAILED", error.status, error.body);
			}
			this.throwError(error_text + " FAILED", 0, error.toString());
		}
	}

	validate({ namespace = null, group = null, item = null }) {
		if (!namespace || !/^[A-Za-z0-9_-]{1,32}$/.test(namespace)) {
			throw "Namespace is not valid. Must be 32 characters or less, consisting of A-Z a-z 0-9 _ or -";
		}
		if (!group || !/^[A-Za-z0-9_-]{1,128}$/.test(group)) {
			throw "Group is not valid. Must be 128 characters or less, consisting of A-Z a-z 0-9 _ or -";
		}
		if (!item || !/^[A-Za-z0-9_-]{1,512}$/.test(item)) {
			throw "Item is not valid. Must be 512 characters or less, consisting of A-Z a-z 0-9 _ or -";
		}
	}

	getNamespaceToken(namespace) {
		if (this.#token_override) {
			return this.#token_override;
		}
		let name = "namespace-" + namespace;
		if (!(name in edgekv_access_tokens)) {
			throw "MISSING ACCESS TOKEN. No EdgeKV Access Token defined for namespace '" + namespace + "'.";
		}
		return edgekv_access_tokens[name]["value"];
	}

	addTimeout(options, timeout) {
		if (timeout && (typeof timeout !== 'number' || !isFinite(timeout) || timeout <= 0 || timeout > 1000)) {
			throw "Timeout is not valid. Must be a number greater than 0 and less than 1000.";
		}
		if (timeout) {
			options.timeout = timeout;
		}
		return options;
	}

	async streamText(response_body) {
		let result = "";
		await response_body
			.pipeThrough(new TextDecoderStream())
			.pipeTo(new WritableStream({
				write(chunk) {
					result += chunk;
				}
			}), { preventAbort: true });
		return result;
	}

	async streamJson(response_body) {
		return JSON.parse(await this.streamText(response_body));
	}

	putRequest({ namespace = this.#namespace, group = this.#group, item, value, timeout = null } = {}) {
		this.validate({ namespace: namespace, group: group, item: item });
		let uri = this.#edgekv_uri + "/api/v1/namespaces/" + namespace + "/groups/" + group + "/items/" + item;
		return httpRequest(uri, this.addTimeout({
			method: "PUT",
			body: typeof value === "object" ? JSON.stringify(value) : value,
			headers: { "X-Akamai-EdgeDB-Auth": [this.getNamespaceToken(namespace)] }
		}, timeout));
	}

	/**
	 * async PUT text into an item in the EdgeKV.
	 * @param {string} [$0.namepsace=this.#namespace] specify a namespace other than the default
	 * @param {string} [$0.group=this.#group] specify a group other than the default
	 * @param {string} $0.item item key to put into the EdgeKV
	 * @param {string} $0.value text value to put into the EdgeKV
	 * @param {number} [$0.timeout=null] the maximum time, between 1 and 1000 milliseconds, to wait for the response
	 * @returns {Promise<string>} if the operation was successful, the response from the EdgeKV
	 * @throws {object} if the operation was not successful,
	 * 		an object describing the non-200 response from the EdgeKV: {failed, status, body}
	 */
	async putText({ namespace = this.#namespace, group = this.#group, item, value, timeout = null } = {}) {
		return this.requestHandlerTemplate(
			() => this.putRequest({ namespace: namespace, group: group, item: item, value: value, timeout: timeout }),
			(response) => response.text(),
			(response) => this.streamText(response.body),
			"PUT",
			null,
			0
		);
	}

	/**
	 * PUT text into an item in the EdgeKV while only waiting for the request to send and not for the response.
	 * @param {string} [$0.namepsace=this.#namespace] specify a namespace other than the default
	 * @param {string} [$0.group=this.#group] specify a group other than the default
	 * @param {string} $0.item item key to put into the EdgeKV
	 * @param {string} $0.value text value to put into the EdgeKV
	 * @throws {object} if the operation was not successful at sending the request,
	 * 		an object describing the error: {failed, status, body}
	 */
	putTextNoWait({ namespace = this.#namespace, group = this.#group, item, value } = {}) {
		try {
			this.putRequest({ namespace: namespace, group: group, item: item, value: value });
		} catch (error) {
			this.throwError("PUT FAILED", 0, error.toString());
		}
	}

	/**
	 * async PUT json into an item in the EdgeKV.
	 * @param {string} [$0.namepsace=this.#namespace] specify a namespace other than the default
	 * @param {string} [$0.group=this.#group] specify a group other than the default
	 * @param {string} $0.item item key to put into the EdgeKV
	 * @param {object} $0.value json value to put into the EdgeKV
	 * @param {number} [$0.timeout=null] the maximum time, between 1 and 1000 milliseconds, to wait for the response
	 * @returns {Promise<string>} if the operation was successful, the response from the EdgeKV
	 * @throws {object} if the operation was not successful,
	 * 		an object describing the non-200 response from the EdgeKV: {failed, status, body}
	 */
	async putJson({ namespace = this.#namespace, group = this.#group, item, value, timeout = null } = {}) {
		return this.requestHandlerTemplate(
			() => this.putRequest({ namespace: namespace, group: group, item: item, value: JSON.stringify(value), timeout: timeout }),
			(response) => response.text(),
			(response) => this.streamText(response.body),
			"PUT",
			null,
			0
		);
	}

	/**
	 * PUT json into an item in the EdgeKV while only waiting for the request to send and not for the response.
	 * @param {string} [$0.namepsace=this.#namespace] specify a namespace other than the default
	 * @param {string} [$0.group=this.#group] specify a group other than the default
	 * @param {string} $0.item item key to put into the EdgeKV
	 * @param {object} $0.value json value to put into the EdgeKV
	 * @throws {object} if the operation was not successful at sending the request,
	 * 		an object describing the error: {failed, status, body}
	 */
	putJsonNoWait({ namespace = this.#namespace, group = this.#group, item, value } = {}) {
		try {
			this.putRequest({ namespace: namespace, group: group, item: item, value: JSON.stringify(value) });
		} catch (error) {
			this.throwError("PUT FAILED", 0, error.toString());
		}
	}

	getRequest({ namespace = this.#namespace, group = this.#group, item, timeout = null } = {}) {
		this.validate({ namespace: namespace, group: group, item: item });
		let uri = this.#edgekv_uri + "/api/v1/namespaces/" + namespace + "/groups/" + group + "/items/" + item;
		return httpRequest(uri, this.addTimeout({
			method: "GET",
			headers: { "X-Akamai-EdgeDB-Auth": [this.getNamespaceToken(namespace)] }
		}, timeout));
	}

	/**
	 * async GET text from an item in the EdgeKV.
	 * @param {string} [$0.namepsace=this.#namespace] specify a namespace other than the default
	 * @param {string} [$0.group=this.#group] specify a group other than the default
	 * @param {string} $0.item item key to get from the EdgeKV
	 * @param {string} [$0.default_value=null] the default value to return if a 404 response is returned from EdgeKV
	 * @param {number} [$0.timeout=null] the maximum time, between 1 and 1000 milliseconds, to wait for the response
	 * @param {number} [$0.num_retries_on_timeout=null] the number of times to retry a requests when the sub request times out
	 * @returns {Promise<string>} if the operation was successful, the text response from the EdgeKV or the default_value on 404
	 * @throws {object} if the operation was not successful,
	 * 		an object describing the non-200 and non-404 response from the EdgeKV: {failed, status, body}
	 */
	async getText({ namespace = this.#namespace, group = this.#group, item, default_value = null, timeout = null, num_retries_on_timeout = null } = {}) {
		return this.requestHandlerTemplate(
			() => this.getRequest({ namespace: namespace, group: group, item: item, timeout: timeout }),
			(response) => response.text(),
			(response) => this.streamText(response.body),
			"GET TEXT",
			default_value,
			num_retries_on_timeout ?? this.#num_retries_on_timeout
		);
	}

	/**
	 * async GET json from an item in the EdgeKV.
	 * @param {string} [$0.namepsace=this.#namespace] specify a namespace other than the default
	 * @param {string} [$0.group=this.#group] specify a group other than the default
	 * @param {string} $0.item item key to get from the EdgeKV
	 * @param {object} [$0.default_value=null] the default value to return if a 404 response is returned from EdgeKV
	 * @param {number} [$0.timeout=null] the maximum time, between 1 and 1000 milliseconds, to wait for the response
	 * @param {number} [$0.num_retries_on_timeout=null] the number of times to retry a requests when the sub request times out
	 * @returns {Promise<object>} if the operation was successful, the json response from the EdgeKV or the default_value on 404
	 * @throws {object} if the operation was not successful,
	 * 		an object describing the non-200 and non-404 response from the EdgeKV: {failed, status, body}
	 */
	async getJson({ namespace = this.#namespace, group = this.#group, item, default_value = null, timeout = null, num_retries_on_timeout = null } = {}) {
		return this.requestHandlerTemplate(
			() => this.getRequest({ namespace: namespace, group: group, item: item, timeout: timeout }),
			(response) => response.json(),
			(response) => this.streamJson(response.body),
			"GET JSON",
			default_value,
			num_retries_on_timeout ?? this.#num_retries_on_timeout
		);
	}

	deleteRequest({ namespace = this.#namespace, group = this.#group, item, timeout = null } = {}) {
		this.validate({ namespace: namespace, group: group, item: item });
		let uri = this.#edgekv_uri + "/api/v1/namespaces/" + namespace + "/groups/" + group + "/items/" + item;
		return httpRequest(uri, this.addTimeout({
			method: "DELETE",
			headers: { "X-Akamai-EdgeDB-Auth": [this.getNamespaceToken(namespace)] }
		}, timeout));
	}

	/**
	 * async DELETE an item in the EdgeKV.
	 * @param {string} [$0.namepsace=this.#namespace] specify a namespace other than the default
	 * @param {string} [$0.group=this.#group] specify a group other than the default
	 * @param {string} $0.item item key to delete from the EdgeKV
	 * @param {number} [$0.timeout=null] the maximum time, between 1 and 1000 milliseconds, to wait for the response
	 * @returns {Promise<string>} if the operation was successful, the text response from the EdgeKV
	 * @throws {object} if the operation was not successful,
	 * 		an object describing the non-200 response from the EdgeKV: {failed, status, body}
	 */
	async delete({ namespace = this.#namespace, group = this.#group, item, timeout = null} = {}) {
		return this.requestHandlerTemplate(
			() => this.deleteRequest({ namespace: namespace, group: group, item: item, timeout: timeout }),
			(response) => response.text(),
			(response) => this.streamText(response.body),
			"DELETE",
			null,
			0
		);
	}

	/**
	 * DELETE an item in the EdgeKV while only waiting for the request to send and not for the response.
	 * @param {string} [$0.namepsace=this.#namespace] specify a namespace other than the default
	 * @param {string} [$0.group=this.#group] specify a group other than the default
	 * @param {string} $0.item item key to delete from the EdgeKV
	 * @throws {object} if the operation was not successful at sending the request,
	 * 		an object describing the error: {failed, status, body}
	 */
	deleteNoWait({ namespace = this.#namespace, group = this.#group, item } = {}) {
		try {
			this.delete({ namespace: namespace, group: group, item: item });
		} catch (error) {
			this.throwError("DELETE FAILED", 0, error.toString());
		}
	}
}
