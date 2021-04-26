/*
(c) Copyright 2020 Akamai Technologies, Inc. Licensed under Apache 2 license.
FindAndReplaceStream can be used to parse through a ReadableStream and replace a string throughout the entire body.
Algorithm adapted from [Knuth-Morris-Pratt](https://en.wikipedia.org/wiki/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm)

It takes a minimum of two arguments:
-A string to be replaced (searched for).
-A string to use as replacement.
-A maximum number of times to perform the replacement (OPTIONAL), defaults to all.
v2.0
*/


import { TransformStream } from 'streams';

export class FindAndReplaceTransformer {
  //Build KMP table to allow fast searching with KMP algorithm at chunk boundaries
  _buildKmpTable(input) {
      var kmpTable = Array(input.length + 1);
      kmpTable[0] = -1;
      let pos = 1;
      let cnd = 0;
      while (pos < input.length) {
          if (input[pos] == input[cnd]) {
              kmpTable[pos] = kmpTable[cnd];
          } else {
              kmpTable[pos] = cnd;
              while (cnd >= 0 && input[pos] != input[cnd]) {
                  cnd = kmpTable[cnd];
              }
          }
          pos++;
          cnd++;
      }
      kmpTable[pos] = cnd;
      return kmpTable;
  }

  // Create FindAndReplaceTransformer object
  // toreplace: a string to be replaced by newtext
  // newtext: a string that replaces the found text 
  // timesToReplace: (optional) number of occurrences of toreplace to search for.  If not provided, replace all occurences  
  constructor(toreplace, newtext, timesToReplace) {
      this.toreplace = toreplace;
      this.newtext = newtext;

      this.alreadyProcessed = 0;

      this.unenqueuedPos = 0;
      this.prevUnenqueuedText = "";

      if (timesToReplace === 0) {
          //nothing to do.  Exit early
          this.done = true;
          return;
      }



      if (timesToReplace && (timesToReplace > 0)) {
          this.howmanytimes = timesToReplace;
      } else {
          this.howmanytimes = null;
      }

      this.done = false;
      this.kmpTable = this._buildKmpTable(toreplace);
      this.streamSearchPos = 0;
      this.findTextSearchPos = 0;
      this.timesFound = 0;
  }

  // helper to avoid enqueueing empty strings
  enqueue(controller, text) {
      if (text.length > 0) {
          controller.enqueue(text);
      }
  }

  flushPrevUnenqueuedText(controller) {
      this.enqueue(controller, this.prevUnenqueuedText);
      this.prevUnenqueuedText = "";
  }

  onTextFound(text, controller) {
      this.enqueue(controller, this.prevUnenqueuedText.substring(0, this.prevUnenqueuedText.length - this.toreplace.length + this.streamSearchPos - this.alreadyProcessed));
      this.prevUnenqueuedText = "";
      if (this.streamSearchPos - this.toreplace.length > 0) {
          this.enqueue(controller, text.substring(this.unenqueuedPos - this.alreadyProcessed, this.streamSearchPos - this.alreadyProcessed - this.toreplace.length));
      }
      this.enqueue(controller, this.newtext);
      this.unenqueuedPos = this.streamSearchPos;
      this.prevUnenqueuedText = "";
      this.timesFound++;
      if (this.howmanytimes && this.timesFound >= this.howmanytimes) {
          this.done = true;
          this.enqueue(controller, text.substring(this.streamSearchPos - this.alreadyProcessed));
      }
  }

  // Transforms each chunk of the incoming stream, finding and replacing text as the chunk is processed
  transform(text, controller) {
      if (this.done) {
          // if we have already found the maximum number of occurrences, pass the original text through
          this.enqueue(controller, text);
      } else {
          while (!this.done && this.streamSearchPos - this.alreadyProcessed < text.length) {
              //indexOf is more efficient, but can only be used if there is no partial match at the end of the previous chunk which remains to be processed
              // * the text to match is contained entirely in the current chunk
              if (this.streamSearchPos - this.alreadyProcessed <= text.length - this.toreplace.length && this.prevUnenqueuedText.length == 0) {
                  let foundPos = text.indexOf(this.toreplace, this.streamSearchPos - this.alreadyProcessed);
                  if (foundPos == -1) {
                      // If not found with indexOf, move search position to look for partial match near end of chunk
                      this.streamSearchPos = this.alreadyProcessed + text.length - this.toreplace.length + 1;
                  } else {
                      // If found with indexOf, move search position to after match and enqueue replacement
                      this.streamSearchPos = this.alreadyProcessed + foundPos + this.toreplace.length;
                      this.onTextFound(text, controller);
                  }
              } else {
                  // If near the end of chunk boundary, switch to KMP to look for partial match
                  if (this.toreplace[this.findTextSearchPos] == text[this.streamSearchPos - this.alreadyProcessed]) {
                      this.streamSearchPos++;
                      this.findTextSearchPos++;
                      if (this.findTextSearchPos == this.toreplace.length) {
                          this.onTextFound(text, controller);
                      }
                  } else {
                      this.findTextSearchPos = this.kmpTable[this.findTextSearchPos];
                      if (this.findTextSearchPos < 0) {
                          this.streamSearchPos++;
                          this.findTextSearchPos++;
                          this.flushPrevUnenqueuedText(controller);
                      }
                  }
              }
          }

          if (!this.done) {
              // We hit the end of the chunk boundary, but have not yet found the maximum number of items to replace.

              if (this.prevUnenqueuedText) {
                  // handle text that has not been enqueued from previous chunk
                  this.enqueue(controller, this.prevUnenqueuedText.substring(0, this.prevUnenqueuedText.length + text.length - this.findTextSearchPos));
                  this.prevUnenqueuedText = this.prevUnenqueuedText.substring(this.prevUnenqueuedText.length + text.length - this.findTextSearchPos);
              }

              if (this.findTextSearchPos < this.toreplace.length) {
                  // If we have a partial match at the end of the chunk, enqueue everything before the match and store the partial match in prevUnenqueuedText
                  this.enqueue(controller, text.substring(this.unenqueuedPos - this.alreadyProcessed, text.length - this.findTextSearchPos));
                  this.prevUnenqueuedText += text.substring(text.length - this.findTextSearchPos);
              }
              this.alreadyProcessed += text.length;
          }
      }
  }

  // End of stream.  Flush any unenqueued text, in case there was a partial match at the end of the stream.
  flush(controller) {
      this.flushPrevUnenqueuedText(controller);
  }
}

export class FindAndReplaceStream extends TransformStream {
  constructor(toreplace, newtext, timesToReplace, writableStrategy, readableStrategy) {
      super(new FindAndReplaceTransformer(toreplace, newtext, timesToReplace), writableStrategy, readableStrategy);
  }
}