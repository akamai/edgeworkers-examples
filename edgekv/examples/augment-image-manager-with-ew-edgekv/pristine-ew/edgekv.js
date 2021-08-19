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

	/**
	 * Constructor to allow setting default namespace and group.
	 * These defaults can be overriden when making individual GET, PUT, and DELETE operations.
	 * @param {string} [namespace] the default namespace to use for all GET, PUT, and DELETE operations.
	 * 		Namespace must be 32 characters or less, consisting of A-Z a-z 0-9 _ or -.
	 * @param {string} [group] the default group to use for all GET, PUT, and DELETE operations.
	 * 		Group must be 128 characters or less, consisting of A-Z a-z 0-9 _ or -.
	 */
	constructor(namespace = "default", group = "default") {
		if (typeof namespace === "object") {
			this.#namespace = namespace.namespace || "default";
			this.#group = namespace.group || "default";
			this.#edgekv_uri = namespace.edgekv_uri || "https://edgekv.akamai-edge-svcs.net";
			this.#token_override = namespace.token_override || null;
		} else {
			this.#namespace = namespace;
			this.#group = group;
			this.#edgekv_uri = "https://edgekv.akamai-edge-svcs.net";
			this.#token_override = null;
		}
	}

	async requestHandlerTemplate(response, handler_200, error_text, default_value) {
		switch (response.status) {
			case 200:
				return handler_200(response)
			case 404:
				return default_value;
			default:
				let text = "";
				try {
					text = await response.text();
				} catch (error) { }
				throw {
					failed: error_text,
					status: response.status,
					body: text,
					toString: function () { return JSON.stringify(this); }
				};
		}
	}

	validate({ namespace = null, group = null, item = null }) {
		if (namespace && !/^[A-Za-z0-9_-]{1,32}$/.test(namespace)) {
			throw "Namespace is not valid. Must be 32 characters or less, consisting of A-Z a-z 0-9 _ or -."
		}
		if (group && !/^[A-Za-z0-9_-]{1,128}$/.test(group)) {
			throw "Group is not valid. Must be 128 characters or less, consisting of A-Z a-z 0-9 _ or -."
		}
		if (item && !/^[A-Za-z0-9_-]{1,512}$/.test(item)) {
			throw "Item is not valid. Must be 512 characters or less, consisting of A-Z a-z 0-9 _ or -."
		}
	}

	getNamespaceToken(namespace) {
		return this.#token_override ? this.#token_override : edgekv_access_tokens["namespace-" + namespace]["value"];
	}

	putRequest({ namespace = this.#namespace, group = this.#group, item, value }) {
		this.validate({ namespace: namespace, group: group, item: item });
		let uri = this.#edgekv_uri + "/api/v1/namespaces/" + namespace + "/groups/" + group + "/items/" + item;
		return httpRequest(uri, {
			method: "PUT",
			body: typeof value === "object" ? JSON.stringify(value) : value,
			headers: { "X-Akamai-EdgeDB-Auth": [this.getNamespaceToken(namespace)] }
		})
	}

	/**
	 * async PUT text into an item in the EdgeKV.
	 * @param {string} [$0.namepsace=this.#namespace] specify a namespace other than the default
	 * @param {string} [$0.group=this.#group] specify a group other than the default
	 * @param {string} $0.item item key to put into the EdgeKV
	 * @param {string} $0.value text value to put into the EdgeKV
	 * @returns {string} if the operation was successful, the response from the EdgeKV
	 * @throws {object} if the operation was not successful,
	 * 		an object describing the non-200 response from the EdgeKV: {failed, status, body}
	 */
	async putText({ namespace = this.#namespace, group = this.#group, item, value }) {
		return this.requestHandlerTemplate(
			await this.putRequest({ namespace: namespace, group: group, item: item, value: value }),
			(response) => response.text(),
			"PUT",
			null
		);
	}

	/**
	 * async PUT json into an item in the EdgeKV.
	 * @param {string} [$0.namepsace=this.#namespace] specify a namespace other than the default
	 * @param {string} [$0.group=this.#group] specify a group other than the default
	 * @param {string} $0.item item key to put into the EdgeKV
	 * @param {object} $0.value json value to put into the EdgeKV
	 * @returns {string} if the operation was successful, the response from the EdgeKV
	 * @throws {object} if the operation was not successful,
	 * 		an object describing the non-200 response from the EdgeKV: {failed, status, body}
	 */
	async putJson({ namespace = this.#namespace, group = this.#group, item, value }) {
		return this.requestHandlerTemplate(
			await this.putRequest({ namespace: namespace, group: group, item: item, value: JSON.stringify(value) }),
			(response) => response.text(),
			"PUT",
			null
		);
	}

	getRequest({ namespace = this.#namespace, group = this.#group, item }) {
		this.validate({ namespace: namespace, group: group, item: item });
		let uri = this.#edgekv_uri + "/api/v1/namespaces/" + namespace + "/groups/" + group + "/items/" + item;
		return httpRequest(uri, {
			method: "GET",
			headers: { "X-Akamai-EdgeDB-Auth": [this.getNamespaceToken(namespace)] }
		})
	}

	/**
	 * async GET text from an item in the EdgeKV.
	 * @param {string} [$0.namepsace=this.#namespace] specify a namespace other than the default
	 * @param {string} [$0.group=this.#group] specify a group other than the default
	 * @param {string} $0.item item key to get from the EdgeKV
	 * @param {string} [$0.default_value=null] the default value to return if a 404 response is returned from EdgeKV
	 * @returns {string} if the operation was successful, the text response from the EdgeKV or the default_value on 404
	 * @throws {object} if the operation was not successful,
	 * 		an object describing the non-200 and non-404 response from the EdgeKV: {failed, status, body}
	 */
	async getText({ namespace = this.#namespace, group = this.#group, item, default_value = null }) {
		return this.requestHandlerTemplate(
			await this.getRequest({ namespace: namespace, group: group, item: item }),
			(response) => response.text(),
			"GET TEXT",
			default_value
		);
	}

	/**
	 * async GET json from an item in the EdgeKV.
	 * @param {string} [$0.namepsace=this.#namespace] specify a namespace other than the default
	 * @param {string} [$0.group=this.#group] specify a group other than the default
	 * @param {string} $0.item item key to get from the EdgeKV
	 * @param {object} [$0.default_value=null] the default value to return if a 404 response is returned from EdgeKV
	 * @returns {object} if the operation was successful, the json response from the EdgeKV or the default_value on 404
	 * @throws {object} if the operation was not successful,
	 * 		an object describing the non-200 and non-404 response from the EdgeKV: {failed, status, body}
	 */
	async getJson({ namespace = this.#namespace, group = this.#group, item, default_value = null }) {
		return this.requestHandlerTemplate(
			await this.getRequest({ namespace: namespace, group: group, item: item }),
			(response) => response.json(),
			"GET JSON",
			default_value
		);
	}

	deleteRequest({ namespace = this.#namespace, group = this.#group, item }) {
		this.validate({ namespace: namespace, group: group, item: item });
		let uri = this.#edgekv_uri + "/api/v1/namespaces/" + namespace + "/groups/" + group + "/items/" + item;
		return httpRequest(uri, {
			method: "DELETE",
			headers: { "X-Akamai-EdgeDB-Auth": [this.getNamespaceToken(namespace)] }
		})
	}

	/**
	 * async DELETE an item in the EdgeKV.
	 * @param {string} [$0.namepsace=this.#namespace] specify a namespace other than the default
	 * @param {string} [$0.group=this.#group] specify a group other than the default
	 * @param {string} $0.item item key to delete from the EdgeKV
	 * @returns {string} if the operation was successful, the text response from the EdgeKV
	 * @throws {object} if the operation was not successful,
	 * 		an object describing the non-200 response from the EdgeKV: {failed, status, body}
	 */
	async delete({ namespace = this.#namespace, group = this.#group, item }) {
		return this.requestHandlerTemplate(
			await this.deleteRequest({ namespace: namespace, group: group, item: item }),
			(response) => response.text(),
			"DELETE",
			null
		);
	}
}