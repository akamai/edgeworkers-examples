/*
(c) Copyright 2020 Akamai Technologies, Inc. Licensed under Apache 2 license.

FindAndReplaceStream can be used to parse through a ReadableStream and replace a string throughout the entire body.

It takes a minimum of two arguments:
-A string to be replaced (searched for).
-A string to use as replacement.
-A maximum number of times to perform the replacement (OPTIONAL), defaults to all.

v1.2
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

    //Function called once for every chunk we process
    async function processStream(text, done) {
      let lookInChunk = true;

            // If the number of replacements reaches the maximum amount of times we want to replace, then stop replacing. 
            // (when unlimited, it will never match) since unlimited is -1
            if (replacements === howmanytimes){
              lookInChunk = false;
            }


            if (!done) {
              
              // We append last (initially blank) to the start of the chunk. This is used to persist a carryover string between chunks
              // in order to prevent our searched string to hide split between chunks
              text = last + text

              if (lookInChunk){
                while (lookInChunk) {
                  let where = text.indexOf(toreplace)

                      //We search for our string. If found:
                        if ((where != -1) && text.length >= toreplace.length) { //positive means we found our string in the middle of two chunks
                          
                          replacements += 1;
                            //we enqueue the text until the index where it was found, and add the replacement string.
                            readController.enqueue(text.substring(0, where))
                            readController.enqueue(newtext)
                            //we reduce the chunk and remove the former string from the beginning
                            text = text.substring(where + toreplace.length);

                            //if we have matched the amount of times to replace, we won't be looking further after this.
                            if (replacements === howmanytimes){
                              lookInChunk = false;
                              const backtrackPosition =  text.length - toreplace.length + 1;
                              last = text.substring(backtrackPosition);
                              readController.enqueue(text.substring(0, backtrackPosition));
                            }

                        // If the string is not found in this chunk, and the chunk is smaller than the length of the searched string, we use the remainder of the
                        // chunk as our temp string to carry over to start the next chunk with.
                      } else if (where == -1 && text.length <= toreplace.length) {
                        lookInChunk = false;
                        last = text;

                        // If the string is not found in this chunk anymore, we write as much as we can to the queue, and leave a small chunk at the end
                        // as our temp string to carry over to start the next chunk with.
                      } else  { 
                        lookInChunk = false;

                            // find a position to backtrack to. ideally, total chunk length - length of the searched string +1, because the search string 
                            // is potentially incomplete by 1 char in the middle of chunks
                            const backtrackPosition =  text.length - toreplace.length + 1;
                            last = text.substring(backtrackPosition);
                            readController.enqueue(text.substring(0, backtrackPosition));
                          }
                        }
                      }else{
                    //if we aren't going to look into a chunk (probably because this is the last bit after we didn't find any matches)
                    // find a position to backtrack to. ideally, total chunk length - length of the searched string +1, because the search string 
                    // is potentially incomplete by 1 char in the middle of chunks
                    const backtrackPosition =  text.length - toreplace.length + 1;
                    last = text.substring(backtrackPosition);
                    readController.enqueue(text.substring(0, backtrackPosition));
                  }


                } else {
              // readController.close() is about to be called. Means there are no more chunks, so we append the last mini chunk we had saved
              // before readController closes and we're done.
              readController.enqueue(last)
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
