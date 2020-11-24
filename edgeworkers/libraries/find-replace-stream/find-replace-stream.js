/*
(c) Copyright 2020 Akamai Technologies, Inc. Licensed under Apache 2 license.

FindAndReplaceStream can be used to parse through a ReadableStream and replace a string throughout the entire body.

It takes a minimum of two arguments:
-A string to be replaced (searched for).
-A string to use as replacement.
-A maximum number of times to perform the replacement (OPTIONAL), defaults to all.

v1.1
*/

import { ReadableStream, WritableStream } from 'streams';

export class FindAndReplaceStream {
  constructor (toreplace, newtext, timesToReplace) {
    let readController = null;
    var howmanytimes = -1;
    var replacements = 0;
    var last = '';
    var chunknolast = '';

    if (timesToReplace && (timesToReplace > 0)) {
      howmanytimes = timesToReplace;
    }

    this.readable = new ReadableStream({
      start (controller) {
        readController = controller;
      }
    });

    async function processStream (text, done) {
      var lookInChunk = true;

      if (replacements === howmanytimes) {
        lookInChunk = false;
      }

      if (!done) {
        var thisAttemptStart = last + text;
        while (lookInChunk) {
          var where = thisAttemptStart.indexOf(toreplace);
          if (where !== -1) { // positive means we found our string in the middle of two chunks
            replacements += 1;
            thisAttemptStart = thisAttemptStart.substring(0, where) + newtext + thisAttemptStart.substring(where + toreplace.length);
            if (replacements === howmanytimes) {
              lookInChunk = false;
            }
          } else { // nothing in this chunk or last bit
            lookInChunk = false;
          }
        }
        // find a position to backtrack to. ideally, total chunk length - length of the searched string +1, because the search string is potentially incomplete by 1 char in the middle of chunks
        var backtrackPosition = thisAttemptStart.length - toreplace.length + 1;

        // last is our final bit that we'll save for the next chunk to start with
        last = thisAttemptStart.substring(backtrackPosition);

        // chunknolast is our modified chunk, without the last bit
        chunknolast = thisAttemptStart.substring(0, thisAttemptStart.length - toreplace.length + 1);

        // we append the modified chunk
        readController.enqueue(chunknolast);
      } else {
        // Text matched the random string in the close() call. Means there are no more chunks, so we append the last mini chunk we had saved..
        readController.enqueue(last);
      }
    }

    let completeProcessing = Promise.resolve();

    this.writable = new WritableStream({
      write (text) {
        completeProcessing = processStream(text, false);
      },
      close (controller) {
        processStream('', true);
        completeProcessing.then(() => readController.close());
      }
    });
  }
}
