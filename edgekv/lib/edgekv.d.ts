/**
 * (c) Copyright 2020 Akamai Technologies, Inc. Licensed under Apache 2 license.
 * Version: 0.5.0
 * Purpose:  Provide a helper class to simplify the interaction with EdgeKV in an EdgeWorker.
 *
 * lib/edgekv.d.ts
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

interface EdgeKVGetItem<T> {
    namespace?: string;
    group?: string;
    item: string;
    default_value?: T | null;
    timeout?: number | null;
    num_retries_on_timeout?: number | null;
}

interface EdgeKVPutItem<T> {
    namespace?: string;
    group?: string;
    item: string;
    value: T;
    timeout?: number;
}

interface EdgeKVPutItemNoWait<T> {
    namespace?: string;
    group?: string;
    item: string;
    value: T;
}

interface EdgeKVDeleteItem {
    namespace?: string;
    group?: string;
    item: string;
    timeout?: number | null;
}

interface EdgeKVDeleteItemNoWait {
    namespace?: string;
    group?: string;
    item: string;
    timeout?: number | null;
}

export interface EdgeKVError {
	failed: string;
	status: number;
	body: any;
    toStrng(): string;
}

export declare class EdgeKV {
    constructor(namespace?: string, group?: string, num_retries_on_timeout?: number);

    getText(item: EdgeKVGetItem<string>): Promise<string>;
    getJson(item: EdgeKVGetItem<any>): Promise<any>;
    putText(item: EdgeKVPutItem<string>): string;
    putTextNoWait(item: EdgeKVPutItemNoWait<string>): void;
    putJson(item: EdgeKVPutItem<any>): any;
    putJsonNoWait(item: EdgeKVPutItemNoWait<string>): void;
    delete(item: EdgeKVDeleteItem): void;
    deleteNoWait(item: EdgeKVDeleteItemNoWait): void;
}
