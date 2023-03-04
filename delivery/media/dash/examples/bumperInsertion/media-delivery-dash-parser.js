import { logger } from "log";

const DashConstants = new class {
    constructor() {
        this.ACCESSIBILITY = "Accessibility", this.ADAPTATION_SET = "AdaptationSet", this.ASSET_IDENTIFIER = "AssetIdentifier", 
        this.AUDIO_CHANNEL_CONFIGURATION = "AudioChannelConfiguration", this.BASEURL = "BaseURL", 
        this.BITSTREAM_SWITCHING = "BitstreamSwitching", this.CONTENT_COMPONENT = "ContentComponent", 
        this.CONTENT_POPULARITY_RATE = "ContentPopularityRate", this.CONTENT_PROTECTION = "ContentProtection", 
        this.COPYRIGHT = "Copyright", this.EMPTY_ADAPTATION_SET = "EmptyAdaptationSet", 
        this.ESSENTIAL_PROPERTY = "EssentialProperty", this.EVENT = "Event", this.EVENT_STREAM = "EventStream", 
        this.FAILOVER_CONTENT = "FailoverContent", this.FCS = "FCS", this.FRAME_PACKING = "FramePacking", 
        this.GROUP_LABEL = "GroupLabel", this.INBAND_EVENT_STREAM = "InbandEventStream", 
        this.INITIALIZATION = "Initialization", this.INITIALIZATION_GROUP = "InitializationGroup", 
        this.INITIALIZATION_PRESENTATION = "InitializationPresentation", this.INITIALIZATION_SET = "InitializationSet", 
        this.LABEL = "Label", this.LATENCY = "Latency", this.LEAP_SECOND_INFORMATION = "LeapSecondInformation", 
        this.LOCATION = "Location", this.METRICS = "Metrics", this.MPD = "MPD", this.OPERATING_BANDWIDTH = "OperatingBandwidth", 
        this.OPERATING_QUALITY = "OperatingQuality", this.PERIOD = "Period", this.PLAYBACK_RATE = "PlaybackRate", 
        this.PR = "PR", this.PRESELECTION = "Preselection", this.PRODUCER_REFERENCE_TIME = "ProducerReferenceTime", 
        this.PROGRAM_INFORMATION = "ProgramInformation", this.QUALITY_LATENCY = "QualityLatency", 
        this.RANDOM_ACCESS = "RandomAccess", this.RANGE = "Range", this.RATING = "Rating", 
        this.REPORTING = "Reporting", this.REPRESENTATION = "Representation", this.REPRESENTATION_INDEX = "RepresentationIndex", 
        this.ROLE = "Role", this.S = "S", this.SCOPE = "Scope", this.SEGMENT_BASE = "SegmentBase", 
        this.SEGMENT_LIST = "SegmentList", this.SEGMENT_TEMPLATE = "SegmentTemplate", this.SEGMENT_TIMELINE = "SegmentTimeline", 
        this.SEGMENTURL = "SegmentURL", this.SERVICE_DESCRIPTION = "ServiceDescription", 
        this.SOURCE = "Source", this.SUB_REPRESENTATION = "SubRepresentation", this.SUBSET = "Subset", 
        this.SUPPLEMENTAL_PROPERTY = "SupplementalProperty", this.SWITCHING = "Switching", 
        this.TITLE = "Title", this.UTC_TIMING = "UTCTiming", this.VIEWPOINT = "Viewpoint", 
        this.ATTR_APPLICATION_SCHEME = "applicationScheme", this.ATTR_ASSOCIATION_ID = "associationId", 
        this.ATTR_ASSOCIATION_TYPE = "associationType", this.ATTR_AUDIO_SAMPLING_RATE = "audioSamplingRate", 
        this.ATTR_AVAILABILITY_END_TIME = "availabilityEndTime", this.ATTR_AVAILABILITY_START_LEAP_OFFSET = "availabilityStartLeapOffset", 
        this.ATTR_AVAILABILITY_START_TIME = "availabilityStartTime", this.ATTR_AVAILABILITY_TIME_COMPLETE = "availabilityTimeComplete", 
        this.ATTR_AVAILABILITY_TIME_OFFSET = "availabilityTimeOffset", this.ATTR_BANDWIDTH = "bandwidth", 
        this.ATTR_BITSTREAM_SWITCHING = "bitstreamSwitching", this.ATTR_BYTE_RANGE = "byteRange", 
        this.ATTR_CODECS = "codecs", this.ATTR_CODING_DEPENDENCY = "codingDependency", this.ATTR_CONTAINS = "contains", 
        this.ATTR_CONTENT_COMPONENT = "contentComponent", this.ATTR_CONTENT_ENCODING = "contentEncoding", 
        this.ATTR_CONTENT_TYPE = "contentType", this.ATTR_D = "d", this.ATTR_DEPENDENCY_ID = "dependencyId", 
        this.ATTR_DEPENDENCY_LEVEL = "dependencyLevel", this.ATTR_DURATION = "duration", 
        this.ATTR_END_NUMBER = "endNumber", this.ATTR_EPT_DELTA = "eptDelta", this.ATTR_FRAME_RATE = "frameRate", 
        this.ATTR_GROUP = "group", this.ATTR_HEIGHT = "height", this.ATTR_ID = "id", this.ATTR_IN_ALL_PERIODS = "inAllPeriods", 
        this.ATTR_INBAND = "inband", this.ATTR_INDEX = "index", this.ATTR_INDEX_RANGE = "indexRange", 
        this.ATTR_INDEX_RANGE_EXACT = "indexRangeExact", this.ATTR_INITIALIZATION = "initialization", 
        this.ATTR_INITIALIZATION_SET_REF = "initializationSetRef", this.ATTR_INTERVAL = "interval", 
        this.ATTR_K = "k", this.ATTR_LANG = "lang", this.ATTR_LEVEL = "level", this.ATTR_MAX = "max", 
        this.ATTR_MAX_BANDWIDTH = "maxBandwidth", this.ATTR_MAX_DIFFERENCE = "maxDifference", 
        this.ATTR_MAX_FRAME_RATE = "maxFrameRate", this.ATTR_MAX_HEIGHT = "maxHeight", this.ATTR_MAXIMUMSAP_PERIOD = "maximumSAPPeriod", 
        this.ATTR_MAX_PLAYOUT_RATE = "maxPlayoutRate", this.ATTR_MAX_SEGMENT_DURATION = "maxSegmentDuration", 
        this.ATTR_MAX_SUBSEGMENT_DURATION = "maxSubsegmentDuration", this.ATTR_MAX_WIDTH = "maxWidth", 
        this.ATTR_MEDIA = "media", this.ATTR_MEDIA_PRESENTATION_DURATION = "mediaPresentationDuration", 
        this.ATTR_MEDIA_RANGE = "mediaRange", this.ATTR_MEDIA_STREAM_STRUCTURE_ID = "mediaStreamStructureId", 
        this.ATTR_MEDIA_TYPE = "mediaType", this.ATTR_MESSAGE_DATA = "messageData", this.ATTR_METRICS = "metrics", 
        this.ATTR_MIME_TYPE = "mimeType", this.ATTR_MIN = "min", this.ATTR_MIN_BANDWIDTH = "minBandwidth", 
        this.ATTR_MIN_BUFFER_TIME = "minBufferTime", this.ATTR_MIN_FRAME_RATE = "minFrameRate", 
        this.ATTR_MIN_HEIGHT = "minHeight", this.ATTR_MINIMUM_UPDATE_PERIOD = "minimumUpdatePeriod", 
        this.ATTR_MIN_WIDTH = "minWidth", this.ATTR_MORE_INFORMATIONURL = "moreInformationURL", 
        this.ATTR_N = "n", this.ATTR_NEXT_AVAILABILITY_START_LEAP_OFFSET = "nextAvailabilityStartLeapOffset", 
        this.ATTR_NEXT_LEAP_CHANGE_TIME = "nextLeapChangeTime", this.ATTR_NULL = "null", 
        this.ATTR_ORDER = "order", this.ATTR_PAR = "par", this.ATTR_POPULARITY_RATE = "popularityRate", 
        this.ATTR_PRESELECTION_COMPONENTS = "preselectionComponents", this.ATTR_PRESENTATION_DURATION = "presentationDuration", 
        this.ATTR_PRESENTATION_TIME = "presentationTime", this.ATTR_PRESENTATION_TIME_OFFSET = "presentationTimeOffset", 
        this.ATTR_PROFILES = "profiles", this.ATTR_PUBLISH_TIME = "publishTime", this.ATTR_QUALITY_RANKING = "qualityRanking", 
        this.ATTR_R = "r", this.ATTR_RANGE = "range", this.ATTR_REFERENCE_ID = "referenceId", 
        this.ATTR_SAR = "sar", this.ATTR_SCAN_TYPE = "scanType", this.ATTR_SCHEME_IDURI = "schemeIdUri", 
        this.ATTR_SEGMENT_ALIGNMENT = "segmentAlignment", this.ATTR_SEGMENT_PROFILES = "segmentProfiles", 
        this.ATTR_SELECTION_PRIORITY = "selectionPriority", this.ATTR_SERVICE_LOCATION = "serviceLocation", 
        this.ATTR_SOURCE = "source", this.ATTR_SOURCE_DESCRIPTION = "source_description", 
        this.ATTR_SOURCEURL = "sourceURL", this.ATTR_START = "start", this.ATTR_START_NUMBER = "startNumber", 
        this.ATTR_STARTTIME = "starttime", this.ATTR_START_WITHSAP = "startWithSAP", this.ATTR_SUBSEGMENT_ALIGNMENT = "subsegmentAlignment", 
        this.ATTR_SUBSEGMENT_STARTS_WITHSAP = "subsegmentStartsWithSAP", this.ATTR_SUGGESTED_PRESENTATION_DELAY = "suggestedPresentationDelay", 
        this.ATTR_T = "t", this.ATTR_TAG = "tag", this.ATTR_TARGET = "target", this.ATTR_TIMESCALE = "timescale", 
        this.ATTR_TIME_SHIFT_BUFFER_DEPTH = "timeShiftBufferDepth", this.ATTR_TYPE = "type", 
        this.ATTR_VALID = "valid", this.ATTR_VALUE = "value", this.ATTR_WALL_CLOCK_TIME = "wallClockTime", 
        this.ATTR_WIDTH = "width", this.ALWAYS_ARRAY_ELEMENTS = [ /\.Accessibility$/, /\.AdaptationSet$/, /\.AudioChannelConfiguration$/, /\.BaseURL$/, /\.ContentComponent$/, /\.ContentPopularityRate$/, /\.ContentProtection$/, /\.EmptyAdaptationSet$/, /\.EssentialProperty$/, /\.Event$/, /\.EventStream$/, /\.FCS$/, /\.FramePacking$/, /\.GroupLabel$/, /\.InbandEventStream$/, /\.InitializationGroup$/, /\.InitializationPresentation$/, /\.InitializationSet$/, /\.Label$/, /\.Latency$/, /\.Location$/, /\.Metrics$/, /\.OperatingBandwidth$/, /\.OperatingQuality$/, /\.Period$/, /\.PlaybackRate$/, /\.PR$/, /\.Preselection$/, /\.ProducerReferenceTime$/, /\.ProgramInformation$/, /\.QualityLatency$/, /\.RandomAccess$/, /\.Range$/, /\.Rating$/, /\.Reporting$/, /\.Representation$/, /\.Role$/, /\.S$/, /\.Scope$/, /\.SegmentURL$/, /\.ServiceDescription$/, /\.SubRepresentation$/, /\.Subset$/, /\.SupplementalProperty$/, /\.Switching$/, /\.UTCTiming$/, /\.Viewpoint$/ ];
    }
};

var hasRequiredEntities, commonjsGlobal = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {}, X2JS$1 = {
    exports: {}
}, domParser = {}, entities = {};

var hasRequiredSax, sax = {};

function requireSax() {
    if (hasRequiredSax) return sax;
    hasRequiredSax = 1;
    var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, nameChar = new RegExp("[\\-\\.0-9" + nameStartChar.source.slice(1, -1) + "\\u00B7\\u0300-\\u036F\\u203F-\\u2040]"), tagNamePattern = new RegExp("^" + nameStartChar.source + nameChar.source + "*(?::" + nameStartChar.source + nameChar.source + "*)?$"), S_TAG = 0, S_ATTR = 1, S_ATTR_SPACE = 2, S_EQ = 3, S_ATTR_NOQUOT_VALUE = 4, S_ATTR_END = 5, S_TAG_SPACE = 6, S_TAG_CLOSE = 7;
    function ParseError(message, locator) {
        this.message = message, this.locator = locator, Error.captureStackTrace && Error.captureStackTrace(this, ParseError);
    }
    function XMLReader() {}
    function copyLocator(f, t) {
        return t.lineNumber = f.lineNumber, t.columnNumber = f.columnNumber, t;
    }
    function parseElementStartPart(source, start, el, currentNSMap, entityReplacer, errorHandler) {
        function addAttribute(qname, value, startIndex) {
            qname in el.attributeNames && errorHandler.fatalError("Attribute " + qname + " redefined"), 
            el.addValue(qname, value, startIndex);
        }
        for (var attrName, p = ++start, s = S_TAG; ;) {
            var c = source.charAt(p);
            switch (c) {
              case "=":
                if (s === S_ATTR) attrName = source.slice(start, p), s = S_EQ; else {
                    if (s !== S_ATTR_SPACE) throw new Error("attribute equal must after attrName");
                    s = S_EQ;
                }
                break;

              case "'":
              case '"':
                if (s === S_EQ || s === S_ATTR) {
                    if (s === S_ATTR && (errorHandler.warning('attribute value must after "="'), attrName = source.slice(start, p)), 
                    start = p + 1, !((p = source.indexOf(c, start)) > 0)) throw new Error("attribute value no end '" + c + "' match");
                    addAttribute(attrName, value = source.slice(start, p).replace(/&#?\w+;/g, entityReplacer), start - 1), 
                    s = S_ATTR_END;
                } else {
                    if (s != S_ATTR_NOQUOT_VALUE) throw new Error('attribute value must after "="');
                    addAttribute(attrName, value = source.slice(start, p).replace(/&#?\w+;/g, entityReplacer), start), 
                    errorHandler.warning('attribute "' + attrName + '" missed start quot(' + c + ")!!"), 
                    start = p + 1, s = S_ATTR_END;
                }
                break;

              case "/":
                switch (s) {
                  case S_TAG:
                    el.setTagName(source.slice(start, p));

                  case S_ATTR_END:
                  case S_TAG_SPACE:
                  case S_TAG_CLOSE:
                    s = S_TAG_CLOSE, el.closed = !0;

                  case S_ATTR_NOQUOT_VALUE:
                  case S_ATTR:
                  case S_ATTR_SPACE:
                    break;

                  default:
                    throw new Error("attribute invalid close char('/')");
                }
                break;

              case "":
                return errorHandler.error("unexpected end of input"), s == S_TAG && el.setTagName(source.slice(start, p)), 
                p;

              case ">":
                switch (s) {
                  case S_TAG:
                    el.setTagName(source.slice(start, p));

                  case S_ATTR_END:
                  case S_TAG_SPACE:
                  case S_TAG_CLOSE:
                    break;

                  case S_ATTR_NOQUOT_VALUE:
                  case S_ATTR:
                    "/" === (value = source.slice(start, p)).slice(-1) && (el.closed = !0, value = value.slice(0, -1));

                  case S_ATTR_SPACE:
                    s === S_ATTR_SPACE && (value = attrName), s == S_ATTR_NOQUOT_VALUE ? (errorHandler.warning('attribute "' + value + '" missed quot(")!'), 
                    addAttribute(attrName, value.replace(/&#?\w+;/g, entityReplacer), start)) : ("http://www.w3.org/1999/xhtml" === currentNSMap[""] && value.match(/^(?:disabled|checked|selected)$/i) || errorHandler.warning('attribute "' + value + '" missed value!! "' + value + '" instead!!'), 
                    addAttribute(value, value, start));
                    break;

                  case S_EQ:
                    throw new Error("attribute value missed!!");
                }
                return p;

              case "":
                c = " ";

              default:
                if (c <= " ") switch (s) {
                  case S_TAG:
                    el.setTagName(source.slice(start, p)), s = S_TAG_SPACE;
                    break;

                  case S_ATTR:
                    attrName = source.slice(start, p), s = S_ATTR_SPACE;
                    break;

                  case S_ATTR_NOQUOT_VALUE:
                    var value = source.slice(start, p).replace(/&#?\w+;/g, entityReplacer);
                    errorHandler.warning('attribute "' + value + '" missed quot(")!!'), addAttribute(attrName, value, start);

                  case S_ATTR_END:
                    s = S_TAG_SPACE;
                } else switch (s) {
                  case S_ATTR_SPACE:
                    el.tagName, "http://www.w3.org/1999/xhtml" === currentNSMap[""] && attrName.match(/^(?:disabled|checked|selected)$/i) || errorHandler.warning('attribute "' + attrName + '" missed value!! "' + attrName + '" instead2!!'), 
                    addAttribute(attrName, attrName, start), start = p, s = S_ATTR;
                    break;

                  case S_ATTR_END:
                    errorHandler.warning('attribute space is required"' + attrName + '"!!');

                  case S_TAG_SPACE:
                    s = S_ATTR, start = p;
                    break;

                  case S_EQ:
                    s = S_ATTR_NOQUOT_VALUE, start = p;
                    break;

                  case S_TAG_CLOSE:
                    throw new Error("elements closed character '/' and '>' must be connected to");
                }
            }
            p++;
        }
    }
    function appendElement(el, domBuilder, currentNSMap) {
        for (var tagName = el.tagName, localNSMap = null, i = el.length; i--; ) {
            var a = el[i], qName = a.qName, value = a.value;
            if ((nsp = qName.indexOf(":")) > 0) var prefix = a.prefix = qName.slice(0, nsp), localName = qName.slice(nsp + 1), nsPrefix = "xmlns" === prefix && localName; else localName = qName, 
            prefix = null, nsPrefix = "xmlns" === qName && "";
            a.localName = localName, !1 !== nsPrefix && (null == localNSMap && (localNSMap = {}, 
            _copy(currentNSMap, currentNSMap = {})), currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value, 
            a.uri = "http://www.w3.org/2000/xmlns/", domBuilder.startPrefixMapping(nsPrefix, value));
        }
        for (i = el.length; i--; ) {
            (prefix = (a = el[i]).prefix) && ("xml" === prefix && (a.uri = "http://www.w3.org/XML/1998/namespace"), 
            "xmlns" !== prefix && (a.uri = currentNSMap[prefix || ""]));
        }
        var nsp;
        (nsp = tagName.indexOf(":")) > 0 ? (prefix = el.prefix = tagName.slice(0, nsp), 
        localName = el.localName = tagName.slice(nsp + 1)) : (prefix = null, localName = el.localName = tagName);
        var ns = el.uri = currentNSMap[prefix || ""];
        if (domBuilder.startElement(ns, localName, tagName, el), !el.closed) return el.currentNSMap = currentNSMap, 
        el.localNSMap = localNSMap, !0;
        if (domBuilder.endElement(ns, localName, tagName), localNSMap) for (prefix in localNSMap) domBuilder.endPrefixMapping(prefix);
    }
    function parseHtmlSpecialContent(source, elStartEnd, tagName, entityReplacer, domBuilder) {
        if (/^(?:script|textarea)$/i.test(tagName)) {
            var elEndStart = source.indexOf("</" + tagName + ">", elStartEnd), text = source.substring(elStartEnd + 1, elEndStart);
            if (/[&<]/.test(text)) return /^script$/i.test(tagName) ? (domBuilder.characters(text, 0, text.length), 
            elEndStart) : (text = text.replace(/&#?\w+;/g, entityReplacer), domBuilder.characters(text, 0, text.length), 
            elEndStart);
        }
        return elStartEnd + 1;
    }
    function fixSelfClosed(source, elStartEnd, tagName, closeMap) {
        var pos = closeMap[tagName];
        return null == pos && ((pos = source.lastIndexOf("</" + tagName + ">")) < elStartEnd && (pos = source.lastIndexOf("</" + tagName)), 
        closeMap[tagName] = pos), pos < elStartEnd;
    }
    function _copy(source, target) {
        for (var n in source) target[n] = source[n];
    }
    function parseDCC(source, start, domBuilder, errorHandler) {
        if ("-" === source.charAt(start + 2)) return "-" === source.charAt(start + 3) ? (end = source.indexOf("--\x3e", start + 4)) > start ? (domBuilder.comment(source, start + 4, end - start - 4), 
        end + 3) : (errorHandler.error("Unclosed comment"), -1) : -1;
        if ("CDATA[" == source.substr(start + 3, 6)) {
            var end = source.indexOf("]]>", start + 9);
            return domBuilder.startCDATA(), domBuilder.characters(source, start + 9, end - start - 9), 
            domBuilder.endCDATA(), end + 3;
        }
        var matchs = function(source, start) {
            var match, buf = [], reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
            reg.lastIndex = start, reg.exec(source);
            for (;match = reg.exec(source); ) if (buf.push(match), match[1]) return buf;
        }(source, start), len = matchs.length;
        if (len > 1 && /!doctype/i.test(matchs[0][0])) {
            var name = matchs[1][0], pubid = !1, sysid = !1;
            len > 3 && (/^public$/i.test(matchs[2][0]) ? (pubid = matchs[3][0], sysid = len > 4 && matchs[4][0]) : /^system$/i.test(matchs[2][0]) && (sysid = matchs[3][0]));
            var lastMatch = matchs[len - 1];
            return domBuilder.startDTD(name, pubid, sysid), domBuilder.endDTD(), lastMatch.index + lastMatch[0].length;
        }
        return -1;
    }
    function parseInstruction(source, start, domBuilder) {
        var end = source.indexOf("?>", start);
        if (end) {
            var match = source.substring(start, end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
            return match ? (match[0].length, domBuilder.processingInstruction(match[1], match[2]), 
            end + 2) : -1;
        }
        return -1;
    }
    function ElementAttributes() {
        this.attributeNames = {};
    }
    return ParseError.prototype = new Error, ParseError.prototype.name = ParseError.name, 
    XMLReader.prototype = {
        parse: function(source, defaultNSMap, entityMap) {
            var domBuilder = this.domBuilder;
            domBuilder.startDocument(), _copy(defaultNSMap, defaultNSMap = {}), function(source, defaultNSMapCopy, entityMap, domBuilder, errorHandler) {
                function fixedFromCharCode(code) {
                    if (code > 65535) {
                        var surrogate1 = 55296 + ((code -= 65536) >> 10), surrogate2 = 56320 + (1023 & code);
                        return String.fromCharCode(surrogate1, surrogate2);
                    }
                    return String.fromCharCode(code);
                }
                function entityReplacer(a) {
                    var k = a.slice(1, -1);
                    return k in entityMap ? entityMap[k] : "#" === k.charAt(0) ? fixedFromCharCode(parseInt(k.substr(1).replace("x", "0x"))) : (errorHandler.error("entity not found:" + a), 
                    a);
                }
                function appendText(end) {
                    if (end > start) {
                        var xt = source.substring(start, end).replace(/&#?\w+;/g, entityReplacer);
                        locator && position(start), domBuilder.characters(xt, 0, end - start), start = end;
                    }
                }
                function position(p, m) {
                    for (;p >= lineEnd && (m = linePattern.exec(source)); ) lineStart = m.index, lineEnd = lineStart + m[0].length, 
                    locator.lineNumber++;
                    locator.columnNumber = p - lineStart + 1;
                }
                var lineStart = 0, lineEnd = 0, linePattern = /.*(?:\r\n?|\n)|.*$/g, locator = domBuilder.locator, parseStack = [ {
                    currentNSMap: defaultNSMapCopy
                } ], closeMap = {}, start = 0;
                for (;;) {
                    try {
                        var tagStart = source.indexOf("<", start);
                        if (tagStart < 0) {
                            if (!source.substr(start).match(/^\s*$/)) {
                                var doc = domBuilder.doc, text = doc.createTextNode(source.substr(start));
                                doc.appendChild(text), domBuilder.currentElement = text;
                            }
                            return;
                        }
                        switch (tagStart > start && appendText(tagStart), source.charAt(tagStart + 1)) {
                          case "/":
                            var end = source.indexOf(">", tagStart + 3), tagName = source.substring(tagStart + 2, end), config = parseStack.pop();
                            end < 0 ? (tagName = source.substring(tagStart + 2).replace(/[\s<].*/, ""), errorHandler.error("end tag name: " + tagName + " is not complete:" + config.tagName), 
                            end = tagStart + 1 + tagName.length) : tagName.match(/\s</) && (tagName = tagName.replace(/[\s<].*/, ""), 
                            errorHandler.error("end tag name: " + tagName + " maybe not complete"), end = tagStart + 1 + tagName.length);
                            var localNSMap = config.localNSMap, endMatch = config.tagName == tagName;
                            if (endMatch || config.tagName && config.tagName.toLowerCase() == tagName.toLowerCase()) {
                                if (domBuilder.endElement(config.uri, config.localName, tagName), localNSMap) for (var prefix in localNSMap) domBuilder.endPrefixMapping(prefix);
                                endMatch || errorHandler.fatalError("end tag name: " + tagName + " is not match the current start tagName:" + config.tagName);
                            } else parseStack.push(config);
                            end++;
                            break;

                          case "?":
                            locator && position(tagStart), end = parseInstruction(source, tagStart, domBuilder);
                            break;

                          case "!":
                            locator && position(tagStart), end = parseDCC(source, tagStart, domBuilder, errorHandler);
                            break;

                          default:
                            locator && position(tagStart);
                            var el = new ElementAttributes, currentNSMap = parseStack[parseStack.length - 1].currentNSMap, len = (end = parseElementStartPart(source, tagStart, el, currentNSMap, entityReplacer, errorHandler), 
                            el.length);
                            if (!el.closed && fixSelfClosed(source, end, el.tagName, closeMap) && (el.closed = !0, 
                            entityMap.nbsp || errorHandler.warning("unclosed xml attribute")), locator && len) {
                                for (var locator2 = copyLocator(locator, {}), i = 0; i < len; i++) {
                                    var a = el[i];
                                    position(a.offset), a.locator = copyLocator(locator, {});
                                }
                                domBuilder.locator = locator2, appendElement(el, domBuilder, currentNSMap) && parseStack.push(el), 
                                domBuilder.locator = locator;
                            } else appendElement(el, domBuilder, currentNSMap) && parseStack.push(el);
                            "http://www.w3.org/1999/xhtml" !== el.uri || el.closed ? end++ : end = parseHtmlSpecialContent(source, end, el.tagName, entityReplacer, domBuilder);
                        }
                    } catch (e) {
                        if (e instanceof ParseError) throw e;
                        errorHandler.error("element parse error: " + e), end = -1;
                    }
                    end > start ? start = end : appendText(Math.max(tagStart, start) + 1);
                }
            }(source, defaultNSMap, entityMap, domBuilder, this.errorHandler), domBuilder.endDocument();
        }
    }, ElementAttributes.prototype = {
        setTagName: function(tagName) {
            if (!tagNamePattern.test(tagName)) throw new Error("invalid tagName:" + tagName);
            this.tagName = tagName;
        },
        addValue: function(qName, value, offset) {
            if (!tagNamePattern.test(qName)) throw new Error("invalid attribute:" + qName);
            this.attributeNames[qName] = this.length, this[this.length++] = {
                qName,
                value,
                offset
            };
        },
        length: 0,
        getLocalName: function(i) {
            return this[i].localName;
        },
        getLocator: function(i) {
            return this[i].locator;
        },
        getQName: function(i) {
            return this[i].qName;
        },
        getURI: function(i) {
            return this[i].uri;
        },
        getValue: function(i) {
            return this[i].value;
        }
    }, sax.XMLReader = XMLReader, sax.ParseError = ParseError, sax;
}

var hasRequiredDom, hasRequiredDomParser, dom = {};

function requireDom() {
    if (hasRequiredDom) return dom;
    function copy(src, dest) {
        for (var p in src) dest[p] = src[p];
    }
    function _extends(Class, Super) {
        var pt = Class.prototype;
        if (!(pt instanceof Super)) {
            function t() {}
            t.prototype = Super.prototype, copy(pt, t = new t), Class.prototype = pt = t;
        }
        pt.constructor != Class && ("function" != typeof Class && console.error("unknow Class:" + Class), 
        pt.constructor = Class);
    }
    hasRequiredDom = 1;
    var htmlns = "http://www.w3.org/1999/xhtml", NodeType = {}, ELEMENT_NODE = NodeType.ELEMENT_NODE = 1, ATTRIBUTE_NODE = NodeType.ATTRIBUTE_NODE = 2, TEXT_NODE = NodeType.TEXT_NODE = 3, CDATA_SECTION_NODE = NodeType.CDATA_SECTION_NODE = 4, ENTITY_REFERENCE_NODE = NodeType.ENTITY_REFERENCE_NODE = 5, ENTITY_NODE = NodeType.ENTITY_NODE = 6, PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7, COMMENT_NODE = NodeType.COMMENT_NODE = 8, DOCUMENT_NODE = NodeType.DOCUMENT_NODE = 9, DOCUMENT_TYPE_NODE = NodeType.DOCUMENT_TYPE_NODE = 10, DOCUMENT_FRAGMENT_NODE = NodeType.DOCUMENT_FRAGMENT_NODE = 11, NOTATION_NODE = NodeType.NOTATION_NODE = 12, ExceptionCode = {}, ExceptionMessage = {};
    ExceptionCode.INDEX_SIZE_ERR = (ExceptionMessage[1] = "Index size error", 1), ExceptionCode.DOMSTRING_SIZE_ERR = (ExceptionMessage[2] = "DOMString size error", 
    2);
    var HIERARCHY_REQUEST_ERR = ExceptionCode.HIERARCHY_REQUEST_ERR = (ExceptionMessage[3] = "Hierarchy request error", 
    3);
    ExceptionCode.WRONG_DOCUMENT_ERR = (ExceptionMessage[4] = "Wrong document", 4), 
    ExceptionCode.INVALID_CHARACTER_ERR = (ExceptionMessage[5] = "Invalid character", 
    5), ExceptionCode.NO_DATA_ALLOWED_ERR = (ExceptionMessage[6] = "No data allowed", 
    6), ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = (ExceptionMessage[7] = "No modification allowed", 
    7);
    var NOT_FOUND_ERR = ExceptionCode.NOT_FOUND_ERR = (ExceptionMessage[8] = "Not found", 
    8);
    ExceptionCode.NOT_SUPPORTED_ERR = (ExceptionMessage[9] = "Not supported", 9);
    var INUSE_ATTRIBUTE_ERR = ExceptionCode.INUSE_ATTRIBUTE_ERR = (ExceptionMessage[10] = "Attribute in use", 
    10);
    function DOMException(code, message) {
        if (message instanceof Error) var error = message; else error = this, Error.call(this, ExceptionMessage[code]), 
        this.message = ExceptionMessage[code], Error.captureStackTrace && Error.captureStackTrace(this, DOMException);
        return error.code = code, message && (this.message = this.message + ": " + message), 
        error;
    }
    function NodeList() {}
    function LiveNodeList(node, refresh) {
        this._node = node, this._refresh = refresh, _updateLiveList(this);
    }
    function _updateLiveList(list) {
        var inc = list._node._inc || list._node.ownerDocument._inc;
        if (list._inc != inc) {
            var ls = list._refresh(list._node);
            __set__(list, "length", ls.length), copy(ls, list), list._inc = inc;
        }
    }
    function NamedNodeMap() {}
    function _findNodeIndex(list, node) {
        for (var i = list.length; i--; ) if (list[i] === node) return i;
    }
    function _addNamedNode(el, list, newAttr, oldAttr) {
        if (oldAttr ? list[_findNodeIndex(list, oldAttr)] = newAttr : list[list.length++] = newAttr, 
        el) {
            newAttr.ownerElement = el;
            var doc = el.ownerDocument;
            doc && (oldAttr && _onRemoveAttribute(doc, el, oldAttr), function(doc, el, newAttr) {
                doc && doc._inc++;
                var ns = newAttr.namespaceURI;
                "http://www.w3.org/2000/xmlns/" == ns && (el._nsMap[newAttr.prefix ? newAttr.localName : ""] = newAttr.value);
            }(doc, el, newAttr));
        }
    }
    function _removeNamedNode(el, list, attr) {
        var i = _findNodeIndex(list, attr);
        if (!(i >= 0)) throw DOMException(NOT_FOUND_ERR, new Error(el.tagName + "@" + attr));
        for (var lastIndex = list.length - 1; i < lastIndex; ) list[i] = list[++i];
        if (list.length = lastIndex, el) {
            var doc = el.ownerDocument;
            doc && (_onRemoveAttribute(doc, el, attr), attr.ownerElement = null);
        }
    }
    function DOMImplementation(features) {
        if (this._features = {}, features) for (var feature in features) this._features = features[feature];
    }
    function Node() {}
    function _xmlEncoder(c) {
        return ("<" == c ? "&lt;" : ">" == c && "&gt;") || "&" == c && "&amp;" || '"' == c && "&quot;" || "&#" + c.charCodeAt() + ";";
    }
    function _visitNode(node, callback) {
        if (callback(node)) return !0;
        if (node = node.firstChild) do {
            if (_visitNode(node, callback)) return !0;
        } while (node = node.nextSibling);
    }
    function Document() {}
    function _onRemoveAttribute(doc, el, newAttr, remove) {
        doc && doc._inc++, "http://www.w3.org/2000/xmlns/" == newAttr.namespaceURI && delete el._nsMap[newAttr.prefix ? newAttr.localName : ""];
    }
    function _onUpdateChild(doc, el, newChild) {
        if (doc && doc._inc) {
            doc._inc++;
            var cs = el.childNodes;
            if (newChild) cs[cs.length++] = newChild; else {
                for (var child = el.firstChild, i = 0; child; ) cs[i++] = child, child = child.nextSibling;
                cs.length = i;
            }
        }
    }
    function _removeChild(parentNode, child) {
        var previous = child.previousSibling, next = child.nextSibling;
        return previous ? previous.nextSibling = next : parentNode.firstChild = next, next ? next.previousSibling = previous : parentNode.lastChild = previous, 
        _onUpdateChild(parentNode.ownerDocument, parentNode), child;
    }
    function _insertBefore(parentNode, newChild, nextChild) {
        var cp = newChild.parentNode;
        if (cp && cp.removeChild(newChild), newChild.nodeType === DOCUMENT_FRAGMENT_NODE) {
            var newFirst = newChild.firstChild;
            if (null == newFirst) return newChild;
            var newLast = newChild.lastChild;
        } else newFirst = newLast = newChild;
        var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;
        newFirst.previousSibling = pre, newLast.nextSibling = nextChild, pre ? pre.nextSibling = newFirst : parentNode.firstChild = newFirst, 
        null == nextChild ? parentNode.lastChild = newLast : nextChild.previousSibling = newLast;
        do {
            newFirst.parentNode = parentNode;
        } while (newFirst !== newLast && (newFirst = newFirst.nextSibling));
        return _onUpdateChild(parentNode.ownerDocument || parentNode, parentNode), newChild.nodeType == DOCUMENT_FRAGMENT_NODE && (newChild.firstChild = newChild.lastChild = null), 
        newChild;
    }
    function Element() {
        this._nsMap = {};
    }
    function Attr() {}
    function CharacterData() {}
    function Text() {}
    function Comment() {}
    function CDATASection() {}
    function DocumentType() {}
    function Notation() {}
    function Entity() {}
    function EntityReference() {}
    function DocumentFragment() {}
    function ProcessingInstruction() {}
    function XMLSerializer() {}
    function nodeSerializeToString(isHtml, nodeFilter) {
        var buf = [], refNode = 9 == this.nodeType && this.documentElement || this, prefix = refNode.prefix, uri = refNode.namespaceURI;
        if (uri && null == prefix && null == (prefix = refNode.lookupPrefix(uri))) var visibleNamespaces = [ {
            namespace: uri,
            prefix: null
        } ];
        return serializeToString(this, buf, isHtml, nodeFilter, visibleNamespaces), buf.join("");
    }
    function needNamespaceDefine(node, isHTML, visibleNamespaces) {
        var prefix = node.prefix || "", uri = node.namespaceURI;
        if (!prefix && !uri) return !1;
        if ("xml" === prefix && "http://www.w3.org/XML/1998/namespace" === uri || "http://www.w3.org/2000/xmlns/" == uri) return !1;
        for (var i = visibleNamespaces.length; i--; ) {
            var ns = visibleNamespaces[i];
            if (ns.prefix == prefix) return ns.namespace != uri;
        }
        return !0;
    }
    function serializeToString(node, buf, isHTML, nodeFilter, visibleNamespaces) {
        if (nodeFilter) {
            if (!(node = nodeFilter(node))) return;
            if ("string" == typeof node) return void buf.push(node);
        }
        switch (node.nodeType) {
          case ELEMENT_NODE:
            visibleNamespaces || (visibleNamespaces = []), visibleNamespaces.length;
            var attrs = node.attributes, len = attrs.length, child = node.firstChild, nodeName = node.tagName;
            isHTML = htmlns === node.namespaceURI || isHTML, buf.push("<", nodeName);
            for (var i = 0; i < len; i++) {
                "xmlns" == (attr = attrs.item(i)).prefix ? visibleNamespaces.push({
                    prefix: attr.localName,
                    namespace: attr.value
                }) : "xmlns" == attr.nodeName && visibleNamespaces.push({
                    prefix: "",
                    namespace: attr.value
                });
            }
            for (i = 0; i < len; i++) {
                var attr;
                if (needNamespaceDefine(attr = attrs.item(i), 0, visibleNamespaces)) {
                    var prefix = attr.prefix || "", uri = attr.namespaceURI, ns = prefix ? " xmlns:" + prefix : " xmlns";
                    buf.push(ns, '="', uri, '"'), visibleNamespaces.push({
                        prefix,
                        namespace: uri
                    });
                }
                serializeToString(attr, buf, isHTML, nodeFilter, visibleNamespaces);
            }
            if (needNamespaceDefine(node, 0, visibleNamespaces)) {
                prefix = node.prefix || "";
                if (uri = node.namespaceURI) {
                    ns = prefix ? " xmlns:" + prefix : " xmlns";
                    buf.push(ns, '="', uri, '"'), visibleNamespaces.push({
                        prefix,
                        namespace: uri
                    });
                }
            }
            if (child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)) {
                if (buf.push(">"), isHTML && /^script$/i.test(nodeName)) for (;child; ) child.data ? buf.push(child.data) : serializeToString(child, buf, isHTML, nodeFilter, visibleNamespaces), 
                child = child.nextSibling; else for (;child; ) serializeToString(child, buf, isHTML, nodeFilter, visibleNamespaces), 
                child = child.nextSibling;
                buf.push("</", nodeName, ">");
            } else buf.push("/>");
            return;

          case DOCUMENT_NODE:
          case DOCUMENT_FRAGMENT_NODE:
            for (child = node.firstChild; child; ) serializeToString(child, buf, isHTML, nodeFilter, visibleNamespaces), 
            child = child.nextSibling;
            return;

          case ATTRIBUTE_NODE:
            return buf.push(" ", node.name, '="', node.value.replace(/[<&"]/g, _xmlEncoder), '"');

          case TEXT_NODE:
            return buf.push(node.data.replace(/[<&]/g, _xmlEncoder).replace(/]]>/g, "]]&gt;"));

          case CDATA_SECTION_NODE:
            return buf.push("<![CDATA[", node.data, "]]>");

          case COMMENT_NODE:
            return buf.push("\x3c!--", node.data, "--\x3e");

          case DOCUMENT_TYPE_NODE:
            var pubid = node.publicId, sysid = node.systemId;
            if (buf.push("<!DOCTYPE ", node.name), pubid) buf.push(" PUBLIC ", pubid), sysid && "." != sysid && buf.push(" ", sysid), 
            buf.push(">"); else if (sysid && "." != sysid) buf.push(" SYSTEM ", sysid, ">"); else {
                var sub = node.internalSubset;
                sub && buf.push(" [", sub, "]"), buf.push(">");
            }
            return;

          case PROCESSING_INSTRUCTION_NODE:
            return buf.push("<?", node.target, " ", node.data, "?>");

          case ENTITY_REFERENCE_NODE:
            return buf.push("&", node.nodeName, ";");

          default:
            buf.push("??", node.nodeName);
        }
    }
    function importNode(doc, node, deep) {
        var node2;
        switch (node.nodeType) {
          case ELEMENT_NODE:
            (node2 = node.cloneNode(!1)).ownerDocument = doc;

          case DOCUMENT_FRAGMENT_NODE:
            break;

          case ATTRIBUTE_NODE:
            deep = !0;
        }
        if (node2 || (node2 = node.cloneNode(!1)), node2.ownerDocument = doc, node2.parentNode = null, 
        deep) for (var child = node.firstChild; child; ) node2.appendChild(importNode(doc, child, deep)), 
        child = child.nextSibling;
        return node2;
    }
    function cloneNode(doc, node, deep) {
        var node2 = new node.constructor;
        for (var n in node) {
            var v = node[n];
            "object" != typeof v && v != node2[n] && (node2[n] = v);
        }
        switch (node.childNodes && (node2.childNodes = new NodeList), node2.ownerDocument = doc, 
        node2.nodeType) {
          case ELEMENT_NODE:
            var attrs = node.attributes, attrs2 = node2.attributes = new NamedNodeMap, len = attrs.length;
            attrs2._ownerElement = node2;
            for (var i = 0; i < len; i++) node2.setAttributeNode(cloneNode(doc, attrs.item(i), !0));
            break;

          case ATTRIBUTE_NODE:
            deep = !0;
        }
        if (deep) for (var child = node.firstChild; child; ) node2.appendChild(cloneNode(doc, child, deep)), 
        child = child.nextSibling;
        return node2;
    }
    function __set__(object, key, value) {
        object[key] = value;
    }
    ExceptionCode.INVALID_STATE_ERR = (ExceptionMessage[11] = "Invalid state", 11), 
    ExceptionCode.SYNTAX_ERR = (ExceptionMessage[12] = "Syntax error", 12), ExceptionCode.INVALID_MODIFICATION_ERR = (ExceptionMessage[13] = "Invalid modification", 
    13), ExceptionCode.NAMESPACE_ERR = (ExceptionMessage[14] = "Invalid namespace", 
    14), ExceptionCode.INVALID_ACCESS_ERR = (ExceptionMessage[15] = "Invalid access", 
    15), DOMException.prototype = Error.prototype, copy(ExceptionCode, DOMException), 
    NodeList.prototype = {
        length: 0,
        item: function(index) {
            return this[index] || null;
        },
        toString: function(isHTML, nodeFilter) {
            for (var buf = [], i = 0; i < this.length; i++) serializeToString(this[i], buf, isHTML, nodeFilter);
            return buf.join("");
        }
    }, LiveNodeList.prototype.item = function(i) {
        return _updateLiveList(this), this[i];
    }, _extends(LiveNodeList, NodeList), NamedNodeMap.prototype = {
        length: 0,
        item: NodeList.prototype.item,
        getNamedItem: function(key) {
            for (var i = this.length; i--; ) {
                var attr = this[i];
                if (attr.nodeName == key) return attr;
            }
        },
        setNamedItem: function(attr) {
            var el = attr.ownerElement;
            if (el && el != this._ownerElement) throw new DOMException(INUSE_ATTRIBUTE_ERR);
            var oldAttr = this.getNamedItem(attr.nodeName);
            return _addNamedNode(this._ownerElement, this, attr, oldAttr), oldAttr;
        },
        setNamedItemNS: function(attr) {
            var oldAttr, el = attr.ownerElement;
            if (el && el != this._ownerElement) throw new DOMException(INUSE_ATTRIBUTE_ERR);
            return oldAttr = this.getNamedItemNS(attr.namespaceURI, attr.localName), _addNamedNode(this._ownerElement, this, attr, oldAttr), 
            oldAttr;
        },
        removeNamedItem: function(key) {
            var attr = this.getNamedItem(key);
            return _removeNamedNode(this._ownerElement, this, attr), attr;
        },
        removeNamedItemNS: function(namespaceURI, localName) {
            var attr = this.getNamedItemNS(namespaceURI, localName);
            return _removeNamedNode(this._ownerElement, this, attr), attr;
        },
        getNamedItemNS: function(namespaceURI, localName) {
            for (var i = this.length; i--; ) {
                var node = this[i];
                if (node.localName == localName && node.namespaceURI == namespaceURI) return node;
            }
            return null;
        }
    }, DOMImplementation.prototype = {
        hasFeature: function(feature, version) {
            var versions = this._features[feature.toLowerCase()];
            return !(!versions || version && !(version in versions));
        },
        createDocument: function(namespaceURI, qualifiedName, doctype) {
            var doc = new Document;
            if (doc.implementation = this, doc.childNodes = new NodeList, doc.doctype = doctype, 
            doctype && doc.appendChild(doctype), qualifiedName) {
                var root = doc.createElementNS(namespaceURI, qualifiedName);
                doc.appendChild(root);
            }
            return doc;
        },
        createDocumentType: function(qualifiedName, publicId, systemId) {
            var node = new DocumentType;
            return node.name = qualifiedName, node.nodeName = qualifiedName, node.publicId = publicId, 
            node.systemId = systemId, node;
        }
    }, Node.prototype = {
        firstChild: null,
        lastChild: null,
        previousSibling: null,
        nextSibling: null,
        attributes: null,
        parentNode: null,
        childNodes: null,
        ownerDocument: null,
        nodeValue: null,
        namespaceURI: null,
        prefix: null,
        localName: null,
        insertBefore: function(newChild, refChild) {
            return _insertBefore(this, newChild, refChild);
        },
        replaceChild: function(newChild, oldChild) {
            this.insertBefore(newChild, oldChild), oldChild && this.removeChild(oldChild);
        },
        removeChild: function(oldChild) {
            return _removeChild(this, oldChild);
        },
        appendChild: function(newChild) {
            return this.insertBefore(newChild, null);
        },
        hasChildNodes: function() {
            return null != this.firstChild;
        },
        cloneNode: function(deep) {
            return cloneNode(this.ownerDocument || this, this, deep);
        },
        normalize: function() {
            for (var child = this.firstChild; child; ) {
                var next = child.nextSibling;
                next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE ? (this.removeChild(next), 
                child.appendData(next.data)) : (child.normalize(), child = next);
            }
        },
        isSupported: function(feature, version) {
            return this.ownerDocument.implementation.hasFeature(feature, version);
        },
        hasAttributes: function() {
            return this.attributes.length > 0;
        },
        lookupPrefix: function(namespaceURI) {
            for (var el = this; el; ) {
                var map = el._nsMap;
                if (map) for (var n in map) if (map[n] == namespaceURI) return n;
                el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
            }
            return null;
        },
        lookupNamespaceURI: function(prefix) {
            for (var el = this; el; ) {
                var map = el._nsMap;
                if (map && prefix in map) return map[prefix];
                el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
            }
            return null;
        },
        isDefaultNamespace: function(namespaceURI) {
            return null == this.lookupPrefix(namespaceURI);
        }
    }, copy(NodeType, Node), copy(NodeType, Node.prototype), Document.prototype = {
        nodeName: "#document",
        nodeType: DOCUMENT_NODE,
        doctype: null,
        documentElement: null,
        _inc: 1,
        insertBefore: function(newChild, refChild) {
            if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
                for (var child = newChild.firstChild; child; ) {
                    var next = child.nextSibling;
                    this.insertBefore(child, refChild), child = next;
                }
                return newChild;
            }
            return null == this.documentElement && newChild.nodeType == ELEMENT_NODE && (this.documentElement = newChild), 
            _insertBefore(this, newChild, refChild), newChild.ownerDocument = this, newChild;
        },
        removeChild: function(oldChild) {
            return this.documentElement == oldChild && (this.documentElement = null), _removeChild(this, oldChild);
        },
        importNode: function(importedNode, deep) {
            return importNode(this, importedNode, deep);
        },
        getElementById: function(id) {
            var rtv = null;
            return _visitNode(this.documentElement, (function(node) {
                if (node.nodeType == ELEMENT_NODE && node.getAttribute("id") == id) return rtv = node, 
                !0;
            })), rtv;
        },
        getElementsByClassName: function(className) {
            var pattern = new RegExp("(^|\\s)" + className + "(\\s|$)");
            return new LiveNodeList(this, (function(base) {
                var ls = [];
                return _visitNode(base.documentElement, (function(node) {
                    node !== base && node.nodeType == ELEMENT_NODE && pattern.test(node.getAttribute("class")) && ls.push(node);
                })), ls;
            }));
        },
        createElement: function(tagName) {
            var node = new Element;
            return node.ownerDocument = this, node.nodeName = tagName, node.tagName = tagName, 
            node.childNodes = new NodeList, (node.attributes = new NamedNodeMap)._ownerElement = node, 
            node;
        },
        createDocumentFragment: function() {
            var node = new DocumentFragment;
            return node.ownerDocument = this, node.childNodes = new NodeList, node;
        },
        createTextNode: function(data) {
            var node = new Text;
            return node.ownerDocument = this, node.appendData(data), node;
        },
        createComment: function(data) {
            var node = new Comment;
            return node.ownerDocument = this, node.appendData(data), node;
        },
        createCDATASection: function(data) {
            var node = new CDATASection;
            return node.ownerDocument = this, node.appendData(data), node;
        },
        createProcessingInstruction: function(target, data) {
            var node = new ProcessingInstruction;
            return node.ownerDocument = this, node.tagName = node.target = target, node.nodeValue = node.data = data, 
            node;
        },
        createAttribute: function(name) {
            var node = new Attr;
            return node.ownerDocument = this, node.name = name, node.nodeName = name, node.localName = name, 
            node.specified = !0, node;
        },
        createEntityReference: function(name) {
            var node = new EntityReference;
            return node.ownerDocument = this, node.nodeName = name, node;
        },
        createElementNS: function(namespaceURI, qualifiedName) {
            var node = new Element, pl = qualifiedName.split(":"), attrs = node.attributes = new NamedNodeMap;
            return node.childNodes = new NodeList, node.ownerDocument = this, node.nodeName = qualifiedName, 
            node.tagName = qualifiedName, node.namespaceURI = namespaceURI, 2 == pl.length ? (node.prefix = pl[0], 
            node.localName = pl[1]) : node.localName = qualifiedName, attrs._ownerElement = node, 
            node;
        },
        createAttributeNS: function(namespaceURI, qualifiedName) {
            var node = new Attr, pl = qualifiedName.split(":");
            return node.ownerDocument = this, node.nodeName = qualifiedName, node.name = qualifiedName, 
            node.namespaceURI = namespaceURI, node.specified = !0, 2 == pl.length ? (node.prefix = pl[0], 
            node.localName = pl[1]) : node.localName = qualifiedName, node;
        }
    }, _extends(Document, Node), Element.prototype = {
        nodeType: ELEMENT_NODE,
        hasAttribute: function(name) {
            return null != this.getAttributeNode(name);
        },
        getAttribute: function(name) {
            var attr = this.getAttributeNode(name);
            return attr && attr.value || "";
        },
        getAttributeNode: function(name) {
            return this.attributes.getNamedItem(name);
        },
        setAttribute: function(name, value) {
            var attr = this.ownerDocument.createAttribute(name);
            attr.value = attr.nodeValue = "" + value, this.setAttributeNode(attr);
        },
        removeAttribute: function(name) {
            var attr = this.getAttributeNode(name);
            attr && this.removeAttributeNode(attr);
        },
        appendChild: function(newChild) {
            return newChild.nodeType === DOCUMENT_FRAGMENT_NODE ? this.insertBefore(newChild, null) : function(parentNode, newChild) {
                var cp = newChild.parentNode;
                if (cp) {
                    var pre = parentNode.lastChild;
                    cp.removeChild(newChild), pre = parentNode.lastChild;
                }
                return pre = parentNode.lastChild, newChild.parentNode = parentNode, newChild.previousSibling = pre, 
                newChild.nextSibling = null, pre ? pre.nextSibling = newChild : parentNode.firstChild = newChild, 
                parentNode.lastChild = newChild, _onUpdateChild(parentNode.ownerDocument, parentNode, newChild), 
                newChild;
            }(this, newChild);
        },
        setAttributeNode: function(newAttr) {
            return this.attributes.setNamedItem(newAttr);
        },
        setAttributeNodeNS: function(newAttr) {
            return this.attributes.setNamedItemNS(newAttr);
        },
        removeAttributeNode: function(oldAttr) {
            return this.attributes.removeNamedItem(oldAttr.nodeName);
        },
        removeAttributeNS: function(namespaceURI, localName) {
            var old = this.getAttributeNodeNS(namespaceURI, localName);
            old && this.removeAttributeNode(old);
        },
        hasAttributeNS: function(namespaceURI, localName) {
            return null != this.getAttributeNodeNS(namespaceURI, localName);
        },
        getAttributeNS: function(namespaceURI, localName) {
            var attr = this.getAttributeNodeNS(namespaceURI, localName);
            return attr && attr.value || "";
        },
        setAttributeNS: function(namespaceURI, qualifiedName, value) {
            var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
            attr.value = attr.nodeValue = "" + value, this.setAttributeNode(attr);
        },
        getAttributeNodeNS: function(namespaceURI, localName) {
            return this.attributes.getNamedItemNS(namespaceURI, localName);
        },
        getElementsByTagName: function(tagName) {
            return new LiveNodeList(this, (function(base) {
                var ls = [];
                return _visitNode(base, (function(node) {
                    node === base || node.nodeType != ELEMENT_NODE || "*" !== tagName && node.tagName != tagName || ls.push(node);
                })), ls;
            }));
        },
        getElementsByTagNameNS: function(namespaceURI, localName) {
            return new LiveNodeList(this, (function(base) {
                var ls = [];
                return _visitNode(base, (function(node) {
                    node === base || node.nodeType !== ELEMENT_NODE || "*" !== namespaceURI && node.namespaceURI !== namespaceURI || "*" !== localName && node.localName != localName || ls.push(node);
                })), ls;
            }));
        }
    }, Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName, 
    Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS, 
    _extends(Element, Node), Attr.prototype.nodeType = ATTRIBUTE_NODE, _extends(Attr, Node), 
    CharacterData.prototype = {
        data: "",
        substringData: function(offset, count) {
            return this.data.substring(offset, offset + count);
        },
        appendData: function(text) {
            text = this.data + text, this.nodeValue = this.data = text, this.length = text.length;
        },
        insertData: function(offset, text) {
            this.replaceData(offset, 0, text);
        },
        appendChild: function(newChild) {
            throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR]);
        },
        deleteData: function(offset, count) {
            this.replaceData(offset, count, "");
        },
        replaceData: function(offset, count, text) {
            text = this.data.substring(0, offset) + text + this.data.substring(offset + count), 
            this.nodeValue = this.data = text, this.length = text.length;
        }
    }, _extends(CharacterData, Node), Text.prototype = {
        nodeName: "#text",
        nodeType: TEXT_NODE,
        splitText: function(offset) {
            var text = this.data, newText = text.substring(offset);
            text = text.substring(0, offset), this.data = this.nodeValue = text, this.length = text.length;
            var newNode = this.ownerDocument.createTextNode(newText);
            return this.parentNode && this.parentNode.insertBefore(newNode, this.nextSibling), 
            newNode;
        }
    }, _extends(Text, CharacterData), Comment.prototype = {
        nodeName: "#comment",
        nodeType: COMMENT_NODE
    }, _extends(Comment, CharacterData), CDATASection.prototype = {
        nodeName: "#cdata-section",
        nodeType: CDATA_SECTION_NODE
    }, _extends(CDATASection, CharacterData), DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE, 
    _extends(DocumentType, Node), Notation.prototype.nodeType = NOTATION_NODE, _extends(Notation, Node), 
    Entity.prototype.nodeType = ENTITY_NODE, _extends(Entity, Node), EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE, 
    _extends(EntityReference, Node), DocumentFragment.prototype.nodeName = "#document-fragment", 
    DocumentFragment.prototype.nodeType = DOCUMENT_FRAGMENT_NODE, _extends(DocumentFragment, Node), 
    ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE, _extends(ProcessingInstruction, Node), 
    XMLSerializer.prototype.serializeToString = function(node, isHtml, nodeFilter) {
        return nodeSerializeToString.call(node, isHtml, nodeFilter);
    }, Node.prototype.toString = nodeSerializeToString;
    try {
        if (Object.defineProperty) {
            function getTextContent(node) {
                switch (node.nodeType) {
                  case ELEMENT_NODE:
                  case DOCUMENT_FRAGMENT_NODE:
                    var buf = [];
                    for (node = node.firstChild; node; ) 7 !== node.nodeType && 8 !== node.nodeType && buf.push(getTextContent(node)), 
                    node = node.nextSibling;
                    return buf.join("");

                  default:
                    return node.nodeValue;
                }
            }
            Object.defineProperty(LiveNodeList.prototype, "length", {
                get: function() {
                    return _updateLiveList(this), this.$$length;
                }
            }), Object.defineProperty(Node.prototype, "textContent", {
                get: function() {
                    return getTextContent(this);
                },
                set: function(data) {
                    switch (this.nodeType) {
                      case ELEMENT_NODE:
                      case DOCUMENT_FRAGMENT_NODE:
                        for (;this.firstChild; ) this.removeChild(this.firstChild);
                        (data || String(data)) && this.appendChild(this.ownerDocument.createTextNode(data));
                        break;

                      default:
                        this.data = data, this.value = data, this.nodeValue = data;
                    }
                }
            }), __set__ = function(object, key, value) {
                object["$$" + key] = value;
            };
        }
    } catch (e) {}
    return dom.Node = Node, dom.DOMException = DOMException, dom.DOMImplementation = DOMImplementation, 
    dom.XMLSerializer = XMLSerializer, dom;
}

function requireDomParser() {
    if (hasRequiredDomParser) return domParser;
    function DOMParser(options) {
        this.options = options || {
            locator: {}
        };
    }
    function DOMHandler() {
        this.cdata = !1;
    }
    function position(locator, node) {
        node.lineNumber = locator.lineNumber, node.columnNumber = locator.columnNumber;
    }
    function _locator(l) {
        if (l) return "\n@" + (l.systemId || "") + "#[line:" + l.lineNumber + ",col:" + l.columnNumber + "]";
    }
    function _toString(chars, start, length) {
        return "string" == typeof chars ? chars.substr(start, length) : chars.length >= start + length || start ? new java.lang.String(chars, start, length) + "" : chars;
    }
    function appendElement(hander, node) {
        hander.currentElement ? hander.currentElement.appendChild(node) : hander.doc.appendChild(node);
    }
    hasRequiredDomParser = 1, DOMParser.prototype.parseFromString = function(source, mimeType) {
        var options = this.options, sax = new XMLReader, domBuilder = options.domBuilder || new DOMHandler, errorHandler = options.errorHandler, locator = options.locator, defaultNSMap = options.xmlns || {}, isHTML = /\/x?html?$/.test(mimeType), entityMap = isHTML ? htmlEntity.entityMap : {
            lt: "<",
            gt: ">",
            amp: "&",
            quot: '"',
            apos: "'"
        };
        return locator && domBuilder.setDocumentLocator(locator), sax.errorHandler = function(errorImpl, domBuilder, locator) {
            if (!errorImpl) {
                if (domBuilder instanceof DOMHandler) return domBuilder;
                errorImpl = domBuilder;
            }
            var errorHandler = {}, isCallback = errorImpl instanceof Function;
            function build(key) {
                var fn = errorImpl[key];
                !fn && isCallback && (fn = 2 == errorImpl.length ? function(msg) {
                    errorImpl(key, msg);
                } : errorImpl), errorHandler[key] = fn && function(msg) {
                    fn("[xmldom " + key + "]\t" + msg + _locator(locator));
                } || function() {};
            }
            return locator = locator || {}, build("warning"), build("error"), build("fatalError"), 
            errorHandler;
        }(errorHandler, domBuilder, locator), sax.domBuilder = options.domBuilder || domBuilder, 
        isHTML && (defaultNSMap[""] = "http://www.w3.org/1999/xhtml"), defaultNSMap.xml = defaultNSMap.xml || "http://www.w3.org/XML/1998/namespace", 
        source && "string" == typeof source ? sax.parse(source, defaultNSMap, entityMap) : sax.errorHandler.error("invalid doc source"), 
        domBuilder.doc;
    }, DOMHandler.prototype = {
        startDocument: function() {
            this.doc = (new DOMImplementation).createDocument(null, null, null), this.locator && (this.doc.documentURI = this.locator.systemId);
        },
        startElement: function(namespaceURI, localName, qName, attrs) {
            var doc = this.doc, el = doc.createElementNS(namespaceURI, qName || localName), len = attrs.length;
            appendElement(this, el), this.currentElement = el, this.locator && position(this.locator, el);
            for (var i = 0; i < len; i++) {
                namespaceURI = attrs.getURI(i);
                var value = attrs.getValue(i), attr = (qName = attrs.getQName(i), doc.createAttributeNS(namespaceURI, qName));
                this.locator && position(attrs.getLocator(i), attr), attr.value = attr.nodeValue = value, 
                el.setAttributeNode(attr);
            }
        },
        endElement: function(namespaceURI, localName, qName) {
            var current = this.currentElement;
            current.tagName, this.currentElement = current.parentNode;
        },
        startPrefixMapping: function(prefix, uri) {},
        endPrefixMapping: function(prefix) {},
        processingInstruction: function(target, data) {
            var ins = this.doc.createProcessingInstruction(target, data);
            this.locator && position(this.locator, ins), appendElement(this, ins);
        },
        ignorableWhitespace: function(ch, start, length) {},
        characters: function(chars, start, length) {
            if (chars = _toString.apply(this, arguments)) {
                if (this.cdata) var charNode = this.doc.createCDATASection(chars); else charNode = this.doc.createTextNode(chars);
                this.currentElement ? this.currentElement.appendChild(charNode) : /^\s*$/.test(chars) && this.doc.appendChild(charNode), 
                this.locator && position(this.locator, charNode);
            }
        },
        skippedEntity: function(name) {},
        endDocument: function() {
            this.doc.normalize();
        },
        setDocumentLocator: function(locator) {
            (this.locator = locator) && (locator.lineNumber = 0);
        },
        comment: function(chars, start, length) {
            chars = _toString.apply(this, arguments);
            var comm = this.doc.createComment(chars);
            this.locator && position(this.locator, comm), appendElement(this, comm);
        },
        startCDATA: function() {
            this.cdata = !0;
        },
        endCDATA: function() {
            this.cdata = !1;
        },
        startDTD: function(name, publicId, systemId) {
            var impl = this.doc.implementation;
            if (impl && impl.createDocumentType) {
                var dt = impl.createDocumentType(name, publicId, systemId);
                this.locator && position(this.locator, dt), appendElement(this, dt);
            }
        },
        warning: function(error) {
            console.warn("[xmldom warning]\t" + error, _locator(this.locator));
        },
        error: function(error) {
            console.error("[xmldom error]\t" + error, _locator(this.locator));
        },
        fatalError: function(error) {
            throw new ParseError(error, this.locator);
        }
    }, "endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g, (function(key) {
        DOMHandler.prototype[key] = function() {
            return null;
        };
    }));
    var htmlEntity = (hasRequiredEntities || (hasRequiredEntities = 1, entities.entityMap = {
        lt: "<",
        gt: ">",
        amp: "&",
        quot: '"',
        apos: "'",
        Agrave: "À",
        Aacute: "Á",
        Acirc: "Â",
        Atilde: "Ã",
        Auml: "Ä",
        Aring: "Å",
        AElig: "Æ",
        Ccedil: "Ç",
        Egrave: "È",
        Eacute: "É",
        Ecirc: "Ê",
        Euml: "Ë",
        Igrave: "Ì",
        Iacute: "Í",
        Icirc: "Î",
        Iuml: "Ï",
        ETH: "Ð",
        Ntilde: "Ñ",
        Ograve: "Ò",
        Oacute: "Ó",
        Ocirc: "Ô",
        Otilde: "Õ",
        Ouml: "Ö",
        Oslash: "Ø",
        Ugrave: "Ù",
        Uacute: "Ú",
        Ucirc: "Û",
        Uuml: "Ü",
        Yacute: "Ý",
        THORN: "Þ",
        szlig: "ß",
        agrave: "à",
        aacute: "á",
        acirc: "â",
        atilde: "ã",
        auml: "ä",
        aring: "å",
        aelig: "æ",
        ccedil: "ç",
        egrave: "è",
        eacute: "é",
        ecirc: "ê",
        euml: "ë",
        igrave: "ì",
        iacute: "í",
        icirc: "î",
        iuml: "ï",
        eth: "ð",
        ntilde: "ñ",
        ograve: "ò",
        oacute: "ó",
        ocirc: "ô",
        otilde: "õ",
        ouml: "ö",
        oslash: "ø",
        ugrave: "ù",
        uacute: "ú",
        ucirc: "û",
        uuml: "ü",
        yacute: "ý",
        thorn: "þ",
        yuml: "ÿ",
        nbsp: " ",
        iexcl: "¡",
        cent: "¢",
        pound: "£",
        curren: "¤",
        yen: "¥",
        brvbar: "¦",
        sect: "§",
        uml: "¨",
        copy: "©",
        ordf: "ª",
        laquo: "«",
        not: "¬",
        shy: "­­",
        reg: "®",
        macr: "¯",
        deg: "°",
        plusmn: "±",
        sup2: "²",
        sup3: "³",
        acute: "´",
        micro: "µ",
        para: "¶",
        middot: "·",
        cedil: "¸",
        sup1: "¹",
        ordm: "º",
        raquo: "»",
        frac14: "¼",
        frac12: "½",
        frac34: "¾",
        iquest: "¿",
        times: "×",
        divide: "÷",
        forall: "∀",
        part: "∂",
        exist: "∃",
        empty: "∅",
        nabla: "∇",
        isin: "∈",
        notin: "∉",
        ni: "∋",
        prod: "∏",
        sum: "∑",
        minus: "−",
        lowast: "∗",
        radic: "√",
        prop: "∝",
        infin: "∞",
        ang: "∠",
        and: "∧",
        or: "∨",
        cap: "∩",
        cup: "∪",
        int: "∫",
        there4: "∴",
        sim: "∼",
        cong: "≅",
        asymp: "≈",
        ne: "≠",
        equiv: "≡",
        le: "≤",
        ge: "≥",
        sub: "⊂",
        sup: "⊃",
        nsub: "⊄",
        sube: "⊆",
        supe: "⊇",
        oplus: "⊕",
        otimes: "⊗",
        perp: "⊥",
        sdot: "⋅",
        Alpha: "Α",
        Beta: "Β",
        Gamma: "Γ",
        Delta: "Δ",
        Epsilon: "Ε",
        Zeta: "Ζ",
        Eta: "Η",
        Theta: "Θ",
        Iota: "Ι",
        Kappa: "Κ",
        Lambda: "Λ",
        Mu: "Μ",
        Nu: "Ν",
        Xi: "Ξ",
        Omicron: "Ο",
        Pi: "Π",
        Rho: "Ρ",
        Sigma: "Σ",
        Tau: "Τ",
        Upsilon: "Υ",
        Phi: "Φ",
        Chi: "Χ",
        Psi: "Ψ",
        Omega: "Ω",
        alpha: "α",
        beta: "β",
        gamma: "γ",
        delta: "δ",
        epsilon: "ε",
        zeta: "ζ",
        eta: "η",
        theta: "θ",
        iota: "ι",
        kappa: "κ",
        lambda: "λ",
        mu: "μ",
        nu: "ν",
        xi: "ξ",
        omicron: "ο",
        pi: "π",
        rho: "ρ",
        sigmaf: "ς",
        sigma: "σ",
        tau: "τ",
        upsilon: "υ",
        phi: "φ",
        chi: "χ",
        psi: "ψ",
        omega: "ω",
        thetasym: "ϑ",
        upsih: "ϒ",
        piv: "ϖ",
        OElig: "Œ",
        oelig: "œ",
        Scaron: "Š",
        scaron: "š",
        Yuml: "Ÿ",
        fnof: "ƒ",
        circ: "ˆ",
        tilde: "˜",
        ensp: " ",
        emsp: " ",
        thinsp: " ",
        zwnj: "‌",
        zwj: "‍",
        lrm: "‎",
        rlm: "‏",
        ndash: "–",
        mdash: "—",
        lsquo: "‘",
        rsquo: "’",
        sbquo: "‚",
        ldquo: "“",
        rdquo: "”",
        bdquo: "„",
        dagger: "†",
        Dagger: "‡",
        bull: "•",
        hellip: "…",
        permil: "‰",
        prime: "′",
        Prime: "″",
        lsaquo: "‹",
        rsaquo: "›",
        oline: "‾",
        euro: "€",
        trade: "™",
        larr: "←",
        uarr: "↑",
        rarr: "→",
        darr: "↓",
        harr: "↔",
        crarr: "↵",
        lceil: "⌈",
        rceil: "⌉",
        lfloor: "⌊",
        rfloor: "⌋",
        loz: "◊",
        spades: "♠",
        clubs: "♣",
        hearts: "♥",
        diams: "♦"
    }), entities), sax = requireSax(), XMLReader = sax.XMLReader, ParseError = sax.ParseError, DOMImplementation = domParser.DOMImplementation = requireDom().DOMImplementation;
    return domParser.XMLSerializer = requireDom().XMLSerializer, domParser.DOMParser = DOMParser, 
    domParser.__DOMHandler = DOMHandler, domParser;
}

X2JS$1.exports = function(config) {
    var VERSION = "1.2.1";
    config = config || {}, initConfigDefaults();
    var IndentChar = " ", LF = "\n";
    function initConfigDefaults() {
        void 0 === config.space && (config.space = 0), void 0 === config.escapeMode && (config.escapeMode = !0), 
        config.attributePrefix = config.attributePrefix || "_", config.arrayAccessForm = config.arrayAccessForm || "none", 
        config.emptyNodeForm = config.emptyNodeForm || "text", void 0 === config.enableToStringFunc && (config.enableToStringFunc = !0), 
        config.arrayAccessFormPaths = config.arrayAccessFormPaths || [], void 0 === config.skipEmptyTextNodesForObj && (config.skipEmptyTextNodesForObj = !0), 
        void 0 === config.stripWhitespaces && (config.stripWhitespaces = !0), config.datetimeAccessFormPaths = config.datetimeAccessFormPaths || [], 
        void 0 === config.useDoubleQuotes && (config.useDoubleQuotes = !1), config.xmlElementsFilter = config.xmlElementsFilter || [], 
        config.jsonPropertiesFilter = config.jsonPropertiesFilter || [], void 0 === config.keepCData && (config.keepCData = !1), 
        null == config.nativeType && (config.nativeType = !1), null == config.nativeTypeAttributes && (config.nativeTypeAttributes = !1), 
        null == config.addElementTagForEmptyArray && (config.addElementTagForEmptyArray = !1);
    }
    var DOMNodeTypes = {
        ELEMENT_NODE: 1,
        TEXT_NODE: 3,
        CDATA_SECTION_NODE: 4,
        COMMENT_NODE: 8,
        DOCUMENT_NODE: 9
    };
    function getNodeLocalName(node) {
        var nodeLocalName = node.localName;
        return null == nodeLocalName && (nodeLocalName = node.baseName), null != nodeLocalName && "" != nodeLocalName || (nodeLocalName = node.nodeName), 
        nodeLocalName;
    }
    function getNodePrefix(node) {
        return node.prefix;
    }
    function escapeXmlChars(str) {
        return "string" == typeof str ? str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;") : str;
    }
    function checkInStdFiltersArrayForm(stdFiltersArrayForm, obj, name, path) {
        for (var idx = 0; idx < stdFiltersArrayForm.length; idx++) {
            var filterPath = stdFiltersArrayForm[idx];
            if ("string" == typeof filterPath) {
                if (filterPath == path) break;
            } else if (filterPath instanceof RegExp) {
                if (filterPath.test(path)) break;
            } else if ("function" == typeof filterPath && filterPath(obj, name, path)) break;
        }
        return idx != stdFiltersArrayForm.length;
    }
    function toArrayAccessForm(obj, childName, path) {
        "property" === config.arrayAccessForm && (obj[childName] instanceof Array ? obj[childName + "_asArray"] = obj[childName] : obj[childName + "_asArray"] = [ obj[childName] ]), 
        !(obj[childName] instanceof Array) && config.arrayAccessFormPaths.length > 0 && checkInStdFiltersArrayForm(config.arrayAccessFormPaths, obj, childName, path) && (obj[childName] = [ obj[childName] ]);
    }
    function fromXmlDateTime(prop) {
        var bits = prop.split(/[-T:+Z]/g), d = new Date(bits[0], bits[1] - 1, bits[2]), secondBits = bits[5].split(".");
        if (d.setHours(bits[3], bits[4], secondBits[0]), secondBits.length > 1 && d.setMilliseconds(secondBits[1]), 
        bits[6] && bits[7]) {
            var offsetMinutes = 60 * bits[6] + Number(bits[7]);
            offsetMinutes = 0 + ("-" == (/\d\d-\d\d:\d\d$/.test(prop) ? "-" : "+") ? -1 * offsetMinutes : offsetMinutes), 
            d.setMinutes(d.getMinutes() - offsetMinutes - d.getTimezoneOffset());
        } else -1 !== prop.indexOf("Z", prop.length - 1) && (d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds())));
        return d;
    }
    function checkFromXmlDateTimePaths(value, childName, fullPath) {
        if (config.datetimeAccessFormPaths.length > 0) {
            var path = fullPath.split(".#")[0];
            return checkInStdFiltersArrayForm(config.datetimeAccessFormPaths, value, childName, path) ? fromXmlDateTime(value) : value;
        }
        return value;
    }
    function checkXmlElementsFilter(obj, childType, childName, childPath) {
        return !(childType == DOMNodeTypes.ELEMENT_NODE && config.xmlElementsFilter.length > 0) || checkInStdFiltersArrayForm(config.xmlElementsFilter, obj, childName, childPath);
    }
    function nativeType(value) {
        var nValue = Number(value);
        if (!isNaN(nValue)) return nValue;
        var bValue = value.toLowerCase();
        return "true" === bValue || "false" !== bValue && value;
    }
    function parseDOMChildren(node, path) {
        if (node.nodeType == DOMNodeTypes.DOCUMENT_NODE) {
            for (var result = new Object, nodeChildren = node.childNodes, cidx = 0; cidx < nodeChildren.length; cidx++) (child = nodeChildren.item(cidx)).nodeType == DOMNodeTypes.ELEMENT_NODE && (result[childName = getNodeLocalName(child)] = parseDOMChildren(child, childName));
            return result;
        }
        if (node.nodeType == DOMNodeTypes.ELEMENT_NODE) {
            (result = new Object).__cnt = 0, nodeChildren = node.childNodes;
            for (var aidx = 0; aidx < node.attributes.length; aidx++) {
                var attr = node.attributes.item(aidx);
                result.__cnt++;
                var value = attr.value;
                config.nativeTypeAttributes && (value = nativeType(attr.value)), result[config.attributePrefix + attr.name] = value;
            }
            for (cidx = 0; cidx < nodeChildren.length; cidx++) {
                var child, childName = getNodeLocalName(child = nodeChildren.item(cidx));
                if (child.nodeType != DOMNodeTypes.COMMENT_NODE) {
                    var childPath = path + "." + childName;
                    checkXmlElementsFilter(result, child.nodeType, childName, childPath) && (result.__cnt++, 
                    null == result[childName] ? (result[childName] = parseDOMChildren(child, childPath), 
                    toArrayAccessForm(result, childName, childPath)) : (null != result[childName] && (result[childName] instanceof Array || (result[childName] = [ result[childName] ], 
                    toArrayAccessForm(result, childName, childPath))), result[childName][result[childName].length] = parseDOMChildren(child, childPath)));
                }
            }
            var nodePrefix = getNodePrefix(node);
            return null != nodePrefix && "" != nodePrefix && (result.__cnt++, result.__prefix = nodePrefix), 
            null != result["#text"] && (result.__text = result["#text"], result.__text instanceof Array && (result.__text = result.__text.join("\n")), 
            config.stripWhitespaces && (result.__text = result.__text.trim()), delete result["#text"], 
            "property" == config.arrayAccessForm && delete result["#text_asArray"], result.__text = checkFromXmlDateTimePaths(result.__text, childName, path + "." + childName)), 
            null != result["#cdata-section"] && (result.__cdata = result["#cdata-section"], 
            delete result["#cdata-section"], "property" == config.arrayAccessForm && delete result["#cdata-section_asArray"]), 
            0 == result.__cnt && "text" == config.emptyNodeForm ? result = "" : 1 == result.__cnt && null != result.__text ? result = result.__text : 1 != result.__cnt || null == result.__cdata || config.keepCData ? result.__cnt > 1 && null != result.__text && config.skipEmptyTextNodesForObj && (config.stripWhitespaces && "" == result.__text || "" == result.__text.trim()) && delete result.__text : result = result.__cdata, 
            delete result.__cnt, !config.enableToStringFunc || null == result.__text && null == result.__cdata || (result.toString = function() {
                return (null != this.__text ? this.__text : "") + (null != this.__cdata ? this.__cdata : "");
            }), result;
        }
        if (node.nodeType == DOMNodeTypes.TEXT_NODE || node.nodeType == DOMNodeTypes.CDATA_SECTION_NODE) return node.nodeValue;
    }
    function startTag(jsonObj, element, attrList, closed, indent = "", fold = !1) {
        var resultStr = indent + "<" + (null != jsonObj && null != jsonObj.__prefix ? jsonObj.__prefix + ":" : "") + element;
        if (null != attrList) for (var aidx = 0; aidx < attrList.length; aidx++) {
            var attrName = attrList[aidx], attrVal = jsonObj[attrName];
            config.escapeMode && (attrVal = escapeXmlChars(attrVal)), resultStr += " " + attrName.substr(config.attributePrefix.length) + "=", 
            config.useDoubleQuotes ? resultStr += '"' + attrVal + '"' : resultStr += "'" + attrVal + "'";
        }
        return resultStr += closed ? "/>" : ">", fold && config.space > 0 && (resultStr += LF), 
        resultStr;
    }
    function endTag(jsonObj, elementName, indent = "", fold = !1) {
        var resultStr = indent + "</" + (null != jsonObj.__prefix ? jsonObj.__prefix + ":" : "") + elementName + ">";
        return fold && config.space > 0 && (resultStr += LF), resultStr;
    }
    function endsWith(str, suffix) {
        return -1 !== str.indexOf(suffix, str.length - suffix.length);
    }
    function jsonXmlSpecialElem(jsonObj, jsonObjField) {
        return !!("property" == config.arrayAccessForm && endsWith(jsonObjField.toString(), "_asArray") || 0 == jsonObjField.toString().indexOf(config.attributePrefix) || 0 == jsonObjField.toString().indexOf("__") || jsonObj[jsonObjField] instanceof Function);
    }
    function jsonXmlElemCount(jsonObj) {
        var elementsCnt = 0;
        if (jsonObj instanceof Object) for (var it in jsonObj) jsonXmlSpecialElem(jsonObj, it) || elementsCnt++;
        return elementsCnt;
    }
    function checkJsonObjPropertiesFilter(jsonObj, propertyName, jsonObjPath) {
        return 0 == config.jsonPropertiesFilter.length || "" == jsonObjPath || checkInStdFiltersArrayForm(config.jsonPropertiesFilter, jsonObj, propertyName, jsonObjPath);
    }
    function calcJSONIndent(jsonObjPath) {
        var pathLevel = 0;
        "" != jsonObjPath && (pathLevel = jsonObjPath.split(".").length);
        var indent = "";
        return config.space > 0 && (indent = IndentChar.repeat(pathLevel * config.space)), 
        indent;
    }
    function parseJSONAttributes(jsonObj) {
        var attrList = [];
        if (jsonObj instanceof Object) for (var ait in jsonObj) -1 == ait.toString().indexOf("__") && 0 == ait.toString().indexOf(config.attributePrefix) && attrList.push(ait);
        return attrList;
    }
    function parseJSONTextAttrs(jsonTxtObj) {
        var result = "";
        return null != jsonTxtObj.__cdata && (result += "<![CDATA[" + jsonTxtObj.__cdata + "]]>"), 
        null != jsonTxtObj.__text && (config.escapeMode ? result += escapeXmlChars(jsonTxtObj.__text) : result += jsonTxtObj.__text), 
        result;
    }
    function parseJSONTextObject(jsonTxtObj) {
        var result = "";
        return jsonTxtObj instanceof Object ? result += parseJSONTextAttrs(jsonTxtObj) : null != jsonTxtObj && (config.escapeMode ? result += escapeXmlChars(jsonTxtObj) : result += jsonTxtObj), 
        result;
    }
    function getJsonPropertyPath(jsonObjPath, jsonPropName) {
        return "" === jsonObjPath ? jsonPropName : jsonObjPath + "." + jsonPropName;
    }
    function parseJSONArray(jsonArrRoot, jsonArrObj, attrList, jsonObjPath) {
        var result = "", indent = calcJSONIndent(jsonObjPath);
        if (0 == jsonArrRoot.length) config.addElementTagForEmptyArray && (result += startTag(jsonArrRoot, jsonArrObj, attrList, !0)); else for (var arIdx = 0; arIdx < jsonArrRoot.length; arIdx++) {
            var arObj = jsonArrRoot[arIdx], arObjElementsCnt = jsonXmlElemCount(arObj);
            "string" == typeof arObj ? (result += startTag(jsonArrRoot[arIdx], jsonArrObj, parseJSONAttributes(jsonArrRoot[arIdx]), !1, indent, !1), 
            result += parseJSONObject(jsonArrRoot[arIdx], getJsonPropertyPath(jsonObjPath, jsonArrObj)), 
            result += endTag(jsonArrRoot[arIdx], jsonArrObj, "", !0)) : arObjElementsCnt > 0 || null != arObj.__text || null != arObj.__cdata ? null != arObj.__text ? (result += startTag(jsonArrRoot[arIdx], jsonArrObj, parseJSONAttributes(jsonArrRoot[arIdx]), !1, indent, !1), 
            result += parseJSONObject(jsonArrRoot[arIdx], getJsonPropertyPath(jsonObjPath, jsonArrObj)), 
            result += endTag(jsonArrRoot[arIdx], jsonArrObj, "", !0)) : (result += startTag(jsonArrRoot[arIdx], jsonArrObj, parseJSONAttributes(jsonArrRoot[arIdx]), !1, indent, !0), 
            result += parseJSONObject(jsonArrRoot[arIdx], getJsonPropertyPath(jsonObjPath, jsonArrObj)), 
            result += endTag(jsonArrRoot[arIdx], jsonArrObj, indent, !0)) : result += startTag(jsonArrRoot[arIdx], jsonArrObj, parseJSONAttributes(jsonArrRoot[arIdx]), !0, indent, !0);
        }
        return result;
    }
    function parseJSONObject(jsonObj, jsonObjPath) {
        var result = "", elementsCnt = jsonXmlElemCount(jsonObj), indent = calcJSONIndent(jsonObjPath);
        if (elementsCnt > 0) for (var it in jsonObj) if (!jsonXmlSpecialElem(jsonObj, it) && ("" == jsonObjPath || checkJsonObjPropertiesFilter(jsonObj, it, getJsonPropertyPath(jsonObjPath, it)))) {
            var subObj = jsonObj[it], attrList = parseJSONAttributes(subObj);
            null == subObj || null == subObj ? result += startTag(subObj, it, attrList, !0, indent, !0) : subObj instanceof Object ? subObj instanceof Array ? result += parseJSONArray(subObj, it, attrList, jsonObjPath) : subObj instanceof Date ? (result += startTag(subObj, it, attrList, !1, indent, !1), 
            result += subObj.toISOString(), result += endTag(subObj, it, "", !0)) : jsonXmlElemCount(subObj) > 0 || null != subObj.__text || null != subObj.__cdata ? (result += startTag(subObj, it, attrList, !1, indent, !0), 
            result += parseJSONObject(subObj, getJsonPropertyPath(jsonObjPath, it)), result += endTag(subObj, it, indent, !0)) : result += startTag(subObj, it, attrList, !0, indent, !0) : (result += startTag(subObj, it, attrList, !1, indent, !1), 
            result += parseJSONTextObject(subObj), result += endTag(subObj, it, "", !0));
        }
        return result += parseJSONTextObject(jsonObj);
    }
    this.parseXmlString = function(xmlDocStr) {
        if (void 0 === xmlDocStr) return null;
        var xmlDoc;
        const {DOMParser} = requireDomParser();
        var parser = new DOMParser, parsererrorNS = null;
        try {
            parsererrorNS = parser.parseFromString("INVALID", "text/xml").getElementsByTagName("parsererror")[0].namespaceURI;
        } catch (err) {
            parsererrorNS = null;
        }
        try {
            xmlDoc = parser.parseFromString(xmlDocStr, "text/xml"), null != parsererrorNS && xmlDoc.getElementsByTagNameNS(parsererrorNS, "parsererror").length > 0 && (xmlDoc = null);
        } catch (err) {
            xmlDoc = null;
        }
        return xmlDoc;
    }, this.asArray = function(prop) {
        return void 0 === prop || null == prop ? [] : prop instanceof Array ? prop : [ prop ];
    }, this.toXmlDateTime = function(dt) {
        return dt instanceof Date ? dt.toISOString() : "number" == typeof dt ? new Date(dt).toISOString() : null;
    }, this.asDateTime = function(prop) {
        return "string" == typeof prop ? fromXmlDateTime(prop) : prop;
    }, this.xml2json = function(xmlDoc) {
        return parseDOMChildren(xmlDoc);
    }, this.xml_str2json = function(xmlDocStr) {
        var xmlDoc = this.parseXmlString(xmlDocStr);
        return null != xmlDoc ? this.xml2json(xmlDoc) : null;
    }, this.json2xml_str = function(jsonObj) {
        return parseJSONObject(jsonObj, "");
    }, this.json2xml = function(jsonObj) {
        var xmlDocStr = this.json2xml_str(jsonObj);
        return this.parseXmlString(xmlDocStr);
    }, this.getVersion = function() {
        return VERSION;
    };
};

var X2JS = X2JS$1.exports;

const MIME_TYPE_VIDEO_PREFIX = "video/", Attr = function(name) {
    return "@" + name;
};

class DashMPD {
    constructor() {
        this.indent = 0;
    }
    parse(mpdXml) {
        const x2js = new X2JS({
            attributePrefix: "@",
            useDoubleQuotes: !0,
            arrayAccessFormPaths: DashConstants.ALWAYS_ARRAY_ELEMENTS,
            nativeTypeAttributes: !0
        });
        this.mpd = x2js.xml_str2json(mpdXml);
    }
    getJSON() {
        return this.mpd;
    }
    setJSON(mpdJson) {
        this.mpd = mpdJson;
    }
    getMPD() {
        return new X2JS({
            attributePrefix: "@",
            useDoubleQuotes: !0,
            space: this.indent
        }).json2xml_str(this.mpd);
    }
    setIndent(space) {
        this.indent = space;
    }
    attr(name) {
        return "@" + name;
    }
    filterVideoRenditionByBandwidth(ranges) {
        function filterFnForVideoAdaptationSet(element) {
            let result = !1;
            return ranges.forEach((range => {
                range[0] <= element[Attr(DashConstants.ATTR_BANDWIDTH)] && element[Attr(DashConstants.ATTR_BANDWIDTH)] <= range[1] && (result = !0);
            })), result;
        }
        function filterFnForUnknownAdaptationSet(element) {
            if (!(element[Attr(DashConstants.ATTR_MIME_TYPE)] ? element[Attr(DashConstants.ATTR_MIME_TYPE)] : "").startsWith(MIME_TYPE_VIDEO_PREFIX)) return !0;
            let result = !1;
            return ranges.forEach((range => {
                range[0] <= element[Attr(DashConstants.ATTR_BANDWIDTH)] && element[Attr(DashConstants.ATTR_BANDWIDTH)] <= range[1] && (result = !0);
            })), result;
        }
        this.mpd[DashConstants.MPD][DashConstants.PERIOD].forEach((period => {
            period[DashConstants.ADAPTATION_SET].forEach((adaptationSet => {
                const _contentType = adaptationSet[this.attr(DashConstants.ATTR_CONTENT_TYPE)] ? adaptationSet[this.attr(DashConstants.ATTR_CONTENT_TYPE)] : "", _mimeType = adaptationSet[this.attr(DashConstants.ATTR_MIME_TYPE)] ? adaptationSet[this.attr(DashConstants.ATTR_MIME_TYPE)] : "";
                if ("video" == _contentType || _mimeType.startsWith(MIME_TYPE_VIDEO_PREFIX)) {
                    let filteredRenditions = adaptationSet[DashConstants.REPRESENTATION].filter(filterFnForVideoAdaptationSet);
                    adaptationSet[DashConstants.REPRESENTATION] = filteredRenditions;
                } else if ("" === _contentType && "" === _mimeType) {
                    let filteredRenditions = adaptationSet[DashConstants.REPRESENTATION].filter(filterFnForUnknownAdaptationSet);
                    adaptationSet[DashConstants.REPRESENTATION] = filteredRenditions;
                }
            }));
        }));
    }
}

var dist = {}, abs$1 = {}, isNegative$1 = {}, toUnit = {}, parse = {}, units = {};

!function(exports) {
    var __assign = commonjsGlobal && commonjsGlobal.__assign || function() {
        return __assign = Object.assign || function(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) for (var p in s = arguments[i]) Object.prototype.hasOwnProperty.call(s, p) && (t[p] = s[p]);
            return t;
        }, __assign.apply(this, arguments);
    };
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.UNITS_META = exports.UNITS = exports.UNITS_META_MAP = exports.UNITS_META_MAP_LITERAL = exports.ZERO = void 0;
    exports.ZERO = Object.freeze({
        years: 0,
        months: 0,
        weeks: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0
    }), exports.UNITS_META_MAP_LITERAL = {
        years: {
            milliseconds: 31536e6,
            months: 12,
            dateGetter: function(date) {
                return date.getFullYear();
            },
            ISOCharacter: "Y",
            ISOPrecision: "period"
        },
        months: {
            milliseconds: 2628e6,
            months: 1,
            dateGetter: function(date) {
                return date.getMonth();
            },
            ISOCharacter: "M",
            ISOPrecision: "period"
        },
        weeks: {
            milliseconds: 6048e5,
            dateGetter: function() {
                return 0;
            },
            ISOCharacter: "W",
            ISOPrecision: "period",
            stringifyConvertTo: "days"
        },
        days: {
            milliseconds: 864e5,
            dateGetter: function(date) {
                return date.getDate();
            },
            ISOCharacter: "D",
            ISOPrecision: "period"
        },
        hours: {
            milliseconds: 36e5,
            dateGetter: function(date) {
                return date.getHours();
            },
            ISOCharacter: "H",
            ISOPrecision: "time"
        },
        minutes: {
            milliseconds: 6e4,
            dateGetter: function(date) {
                return date.getMinutes();
            },
            ISOCharacter: "M",
            ISOPrecision: "time"
        },
        seconds: {
            milliseconds: 1e3,
            dateGetter: function(date) {
                return date.getSeconds();
            },
            ISOCharacter: "S",
            ISOPrecision: "time"
        },
        milliseconds: {
            milliseconds: 1,
            dateGetter: function(date) {
                return date.getMilliseconds();
            },
            stringifyConvertTo: "seconds"
        }
    }, exports.UNITS_META_MAP = exports.UNITS_META_MAP_LITERAL, exports.UNITS = Object.freeze([ "years", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds" ]), 
    exports.UNITS_META = Object.freeze(exports.UNITS.map((function(unit) {
        return __assign(__assign({}, exports.UNITS_META_MAP[unit]), {
            unit
        });
    })));
}(units);

var hasRequiredNegate, parseISODuration = {}, negate = {};

function requireNegate() {
    if (hasRequiredNegate) return negate;
    hasRequiredNegate = 1;
    var __assign = commonjsGlobal && commonjsGlobal.__assign || function() {
        return __assign = Object.assign || function(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) for (var p in s = arguments[i]) Object.prototype.hasOwnProperty.call(s, p) && (t[p] = s[p]);
            return t;
        }, __assign.apply(this, arguments);
    };
    Object.defineProperty(negate, "__esModule", {
        value: !0
    }), negate.negate = void 0;
    var units_1 = units, parse_1 = requireParse();
    return negate.negate = function(duration) {
        var output = __assign({}, (0, parse_1.parse)(duration));
        return units_1.UNITS.forEach((function(unit) {
            output[unit] = 0 === output[unit] ? 0 : -output[unit];
        })), output;
    }, negate;
}

var numberUtils = {};

Object.defineProperty(numberUtils, "__esModule", {
    value: !0
}), numberUtils.isNegativelySigned = void 0;

var hasRequiredParseISODuration;

numberUtils.isNegativelySigned = function(n) {
    return n < 0 || Object.is(n, -0);
};

var validate$1 = {};

Object.defineProperty(validate$1, "__esModule", {
    value: !0
}), validate$1.validate = void 0;

var units_1$7 = units;

validate$1.validate = function(duration) {
    Object.keys(duration).forEach((function(unit) {
        if (!units_1$7.UNITS.includes(unit)) throw new TypeError('Unexpected property "'.concat(unit, '" on Duration object.'));
        if (!Number.isInteger(duration[unit])) throw new TypeError('Property "'.concat(unit, '" must be a an integer. Received ').concat(duration[unit], "."));
    }));
};

var cleanDurationObject$1 = {}, __assign$4 = commonjsGlobal && commonjsGlobal.__assign || function() {
    return __assign$4 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) for (var p in s = arguments[i]) Object.prototype.hasOwnProperty.call(s, p) && (t[p] = s[p]);
        return t;
    }, __assign$4.apply(this, arguments);
};

Object.defineProperty(cleanDurationObject$1, "__esModule", {
    value: !0
}), cleanDurationObject$1.cleanDurationObject = void 0;

var hasRequiredParse, units_1$6 = units;

function requireParse() {
    if (hasRequiredParse) return parse;
    hasRequiredParse = 1;
    var __assign = commonjsGlobal && commonjsGlobal.__assign || function() {
        return __assign = Object.assign || function(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) for (var p in s = arguments[i]) Object.prototype.hasOwnProperty.call(s, p) && (t[p] = s[p]);
            return t;
        }, __assign.apply(this, arguments);
    };
    Object.defineProperty(parse, "__esModule", {
        value: !0
    }), parse.parse = void 0;
    var units_1 = units, parseISODuration_1 = function() {
        if (hasRequiredParseISODuration) return parseISODuration;
        hasRequiredParseISODuration = 1;
        var __assign = commonjsGlobal && commonjsGlobal.__assign || function() {
            return __assign = Object.assign || function(t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) for (var p in s = arguments[i]) Object.prototype.hasOwnProperty.call(s, p) && (t[p] = s[p]);
                return t;
            }, __assign.apply(this, arguments);
        };
        Object.defineProperty(parseISODuration, "__esModule", {
            value: !0
        }), parseISODuration.parseISODuration = void 0;
        var units_1 = units, negate_1 = requireNegate(), numberUtils_1 = numberUtils, millisecondsPattern = "(?:[,.](\\d{1,3})\\d*)?", unitPattern = function(unit) {
            return "(?:(-?\\d+)".concat(unit, ")?");
        }, createDurationParser = function(regex, unitsOrder) {
            return function(duration) {
                var match = duration.match(regex);
                if (!match) return null;
                var isDurationNegative = "-" === match[1], unitStrings = match.slice(2);
                if (unitStrings.every((function(value) {
                    return void 0 === value;
                }))) return null;
                var unitNumbers = unitStrings.map((function(value, i) {
                    value = null != value ? value : "0";
                    var isMilliseconds = i === unitStrings.length - 1;
                    return Number(isMilliseconds ? value.padEnd(3, "0") : value);
                })), output = __assign({}, units_1.ZERO);
                return unitsOrder.forEach((function(unit, i) {
                    output[unit] = unitNumbers[i];
                })), (0, numberUtils_1.isNegativelySigned)(output.seconds) && (output.milliseconds *= -1), 
                isDurationNegative ? (0, negate_1.negate)(output) : output;
            };
        }, parseFullFormatISODuration = createDurationParser(new RegExp([ "^(-)?P", "(\\d{4})", "-?", "(\\d{2})", "-?", "(\\d{2})", "T", "(\\d{2})", ":?", "(\\d{2})", ":?", "(\\d{2})", millisecondsPattern, "$" ].join("")), [ "years", "months", "days", "hours", "minutes", "seconds", "milliseconds" ]), parseUnitsISODuration = createDurationParser(new RegExp([ "^(-)?P", unitPattern("Y"), unitPattern("M"), unitPattern("W"), unitPattern("D"), "(?:T", unitPattern("H"), unitPattern("M"), unitPattern("".concat(millisecondsPattern, "S")), ")?$" ].join("")), [ "years", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds" ]);
        return parseISODuration.parseISODuration = function(duration) {
            var output = parseUnitsISODuration(duration) || parseFullFormatISODuration(duration);
            if (null === output) throw new SyntaxError('Failed to parse duration. "'.concat(duration, '" is not a valid ISO duration string.'));
            return output;
        }, parseISODuration;
    }(), validate_1 = validate$1, cleanDurationObject_1 = cleanDurationObject$1;
    return parse.parse = function(duration) {
        var output = function(duration) {
            return "string" == typeof duration ? (0, parseISODuration_1.parseISODuration)(duration) : __assign(__assign({}, units_1.ZERO), "number" == typeof duration ? {
                milliseconds: duration
            } : duration);
        }(duration);
        return (0, validate_1.validate)(output), (0, cleanDurationObject_1.cleanDurationObject)(output);
    }, parse;
}

cleanDurationObject$1.cleanDurationObject = function(duration) {
    var output = __assign$4({}, duration);
    return units_1$6.UNITS.forEach((function(key) {
        0 === output[key] && (output[key] = 0);
    })), output;
}, function(exports) {
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.toYears = exports.toMonths = exports.toWeeks = exports.toDays = exports.toHours = exports.toMinutes = exports.toSeconds = exports.toUnit = exports.toMilliseconds = void 0;
    var parse_1 = requireParse(), units_1 = units;
    exports.toMilliseconds = function(duration) {
        var parsed = (0, parse_1.parse)(duration);
        return units_1.UNITS_META.reduce((function(total, _a) {
            var unit = _a.unit, milliseconds = _a.milliseconds;
            return total + parsed[unit] * milliseconds;
        }), 0);
    };
    exports.toUnit = function(duration, unit) {
        return (0, exports.toMilliseconds)(duration) / units_1.UNITS_META_MAP[unit].milliseconds;
    };
    var createDurationConverter = function(unit) {
        return function(duration) {
            return (0, exports.toUnit)(duration, unit);
        };
    };
    exports.toSeconds = createDurationConverter("seconds"), exports.toMinutes = createDurationConverter("minutes"), 
    exports.toHours = createDurationConverter("hours"), exports.toDays = createDurationConverter("days"), 
    exports.toWeeks = createDurationConverter("weeks"), exports.toMonths = createDurationConverter("months"), 
    exports.toYears = createDurationConverter("years");
}(toUnit), Object.defineProperty(isNegative$1, "__esModule", {
    value: !0
}), isNegative$1.isNegative = void 0;

var toUnit_1$2 = toUnit;

isNegative$1.isNegative = function(duration) {
    return (0, toUnit_1$2.toMilliseconds)(duration) < 0;
}, Object.defineProperty(abs$1, "__esModule", {
    value: !0
}), abs$1.abs = void 0;

var isNegative_1 = isNegative$1, negate_1$2 = requireNegate(), parse_1$5 = requireParse();

abs$1.abs = function(duration) {
    return (0, isNegative_1.isNegative)(duration) ? (0, negate_1$2.negate)(duration) : (0, 
    parse_1$5.parse)(duration);
};

var apply$1 = {}, dateUtils = {};

!function(exports) {
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.addMonths = exports.getDaysInMonth = void 0;
    exports.getDaysInMonth = function(date) {
        var monthIndex = date.getMonth(), lastDayOfMonth = new Date(0);
        return lastDayOfMonth.setFullYear(date.getFullYear(), monthIndex + 1, 0), lastDayOfMonth.setHours(0, 0, 0, 0), 
        lastDayOfMonth.getDate();
    };
    exports.addMonths = function(date, value) {
        var desiredMonth = date.getMonth() + value, dateWithDesiredMonth = new Date(0);
        dateWithDesiredMonth.setFullYear(date.getFullYear(), desiredMonth, 1), dateWithDesiredMonth.setHours(0, 0, 0, 0);
        var daysInMonth = (0, exports.getDaysInMonth)(dateWithDesiredMonth);
        date.setMonth(desiredMonth, Math.min(daysInMonth, date.getDate()));
    };
}(dateUtils), Object.defineProperty(apply$1, "__esModule", {
    value: !0
}), apply$1.apply = void 0;

var dateUtils_1 = dateUtils, parse_1$4 = requireParse();

apply$1.apply = function(date, duration) {
    var parsedDate = new Date(date), _a = (0, parse_1$4.parse)(duration), years = _a.years, months = _a.months, weeks = _a.weeks, days = _a.days, hours = _a.hours, minutes = _a.minutes, seconds = _a.seconds, milliseconds = _a.milliseconds;
    return (0, dateUtils_1.addMonths)(parsedDate, 12 * years + months), parsedDate.setDate(parsedDate.getDate() + 7 * weeks + days), 
    parsedDate.setHours(parsedDate.getHours() + hours, parsedDate.getMinutes() + minutes, parsedDate.getSeconds() + seconds, parsedDate.getMilliseconds() + milliseconds), 
    parsedDate;
};

var between$1 = {}, __assign$3 = commonjsGlobal && commonjsGlobal.__assign || function() {
    return __assign$3 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) for (var p in s = arguments[i]) Object.prototype.hasOwnProperty.call(s, p) && (t[p] = s[p]);
        return t;
    }, __assign$3.apply(this, arguments);
};

Object.defineProperty(between$1, "__esModule", {
    value: !0
}), between$1.between = void 0;

var units_1$5 = units;

between$1.between = function(date1, date2) {
    var a = new Date(date1), b = new Date(date2), output = __assign$3({}, units_1$5.ZERO);
    return units_1$5.UNITS_META.forEach((function(_a) {
        var unit = _a.unit, dateGetter = _a.dateGetter;
        output[unit] = dateGetter(b) - dateGetter(a);
    })), output;
};

var isZero$1 = {};

Object.defineProperty(isZero$1, "__esModule", {
    value: !0
}), isZero$1.isZero = void 0;

var toUnit_1$1 = toUnit;

isZero$1.isZero = function(duration) {
    return 0 === (0, toUnit_1$1.toMilliseconds)(duration);
};

var normalize$1 = {}, __assign$2 = commonjsGlobal && commonjsGlobal.__assign || function() {
    return __assign$2 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) for (var p in s = arguments[i]) Object.prototype.hasOwnProperty.call(s, p) && (t[p] = s[p]);
        return t;
    }, __assign$2.apply(this, arguments);
}, __rest = commonjsGlobal && commonjsGlobal.__rest || function(s, e) {
    var t = {};
    for (var p in s) Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0 && (t[p] = s[p]);
    if (null != s && "function" == typeof Object.getOwnPropertySymbols) {
        var i = 0;
        for (p = Object.getOwnPropertySymbols(s); i < p.length; i++) e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]) && (t[p[i]] = s[p[i]]);
    }
    return t;
};

Object.defineProperty(normalize$1, "__esModule", {
    value: !0
}), normalize$1.normalize = void 0;

var units_1$4 = units, between_1 = between$1, apply_1 = apply$1, toUnit_1 = toUnit, parse_1$3 = requireParse(), createUnitsNormalizer = function(keys, getDivisor) {
    return function(duration, remaining) {
        var output = __assign$2({}, duration);
        return keys.forEach((function(unit) {
            var divisor = getDivisor(unit);
            output[unit] = ~~(remaining / divisor), remaining -= output[unit] * divisor;
        })), output;
    };
}, yearMonthNormalizer = createUnitsNormalizer([ "years", "months" ], (function(unit) {
    return units_1$4.UNITS_META_MAP_LITERAL[unit].months;
})), dayAndTimeNormalizer = createUnitsNormalizer([ "days", "hours", "minutes", "seconds", "milliseconds" ], (function(unit) {
    return units_1$4.UNITS_META_MAP_LITERAL[unit].milliseconds;
}));

normalize$1.normalize = function(duration, referenceDate) {
    return function(duration) {
        var _a = (0, parse_1$3.parse)(duration), years = _a.years, months = _a.months, weeks = _a.weeks, days = _a.days, rest = __rest(_a, [ "years", "months", "weeks", "days" ]), output = __assign$2({}, units_1$4.ZERO);
        return output = yearMonthNormalizer(output, (0, toUnit_1.toMonths)({
            years,
            months
        })), dayAndTimeNormalizer(output, (0, toUnit_1.toMilliseconds)(__assign$2(__assign$2({}, rest), {
            days: days + 7 * weeks
        })));
    }(null != referenceDate ? (0, between_1.between)(referenceDate, (0, apply_1.apply)(referenceDate, duration)) : duration);
};

var subtract$1 = {}, sum$1 = {}, __assign$1 = commonjsGlobal && commonjsGlobal.__assign || function() {
    return __assign$1 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) for (var p in s = arguments[i]) Object.prototype.hasOwnProperty.call(s, p) && (t[p] = s[p]);
        return t;
    }, __assign$1.apply(this, arguments);
};

Object.defineProperty(sum$1, "__esModule", {
    value: !0
}), sum$1.sum = void 0;

var units_1$3 = units, parse_1$2 = requireParse();

sum$1.sum = function() {
    for (var durations = [], _i = 0; _i < arguments.length; _i++) durations[_i] = arguments[_i];
    var output = __assign$1({}, units_1$3.ZERO);
    return durations.map(parse_1$2.parse).forEach((function(duration) {
        units_1$3.UNITS.forEach((function(key) {
            output[key] += duration[key];
        }));
    })), output;
};

var __spreadArray = commonjsGlobal && commonjsGlobal.__spreadArray || function(to, from, pack) {
    if (pack || 2 === arguments.length) for (var ar, i = 0, l = from.length; i < l; i++) !ar && i in from || (ar || (ar = Array.prototype.slice.call(from, 0, i)), 
    ar[i] = from[i]);
    return to.concat(ar || Array.prototype.slice.call(from));
};

Object.defineProperty(subtract$1, "__esModule", {
    value: !0
}), subtract$1.subtract = void 0;

var negate_1$1 = requireNegate(), sum_1 = sum$1;

subtract$1.subtract = function(duration) {
    for (var durationsToSubtract = [], _i = 1; _i < arguments.length; _i++) durationsToSubtract[_i - 1] = arguments[_i];
    return sum_1.sum.apply(void 0, __spreadArray([ duration ], durationsToSubtract.map(negate_1$1.negate), !1));
};

var toString$1 = {}, getUnitCount$1 = {}, __assign = commonjsGlobal && commonjsGlobal.__assign || function() {
    return __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) for (var p in s = arguments[i]) Object.prototype.hasOwnProperty.call(s, p) && (t[p] = s[p]);
        return t;
    }, __assign.apply(this, arguments);
};

Object.defineProperty(getUnitCount$1, "__esModule", {
    value: !0
}), getUnitCount$1.getUnitCount = void 0;

var units_1$2 = units, parse_1$1 = requireParse();

getUnitCount$1.getUnitCount = function(duration) {
    var parsed = __assign({}, (0, parse_1$1.parse)(duration)), count = 0;
    return units_1$2.UNITS.forEach((function(unit) {
        0 !== parsed[unit] && count++;
    })), count;
};

var checkAllUnitsNegative$1 = {};

Object.defineProperty(checkAllUnitsNegative$1, "__esModule", {
    value: !0
}), checkAllUnitsNegative$1.checkAllUnitsNegative = void 0;

var negate_1 = requireNegate(), parse_1 = requireParse(), units_1$1 = units;

checkAllUnitsNegative$1.checkAllUnitsNegative = function(duration) {
    var parsed = (0, parse_1.parse)(duration), hasPositive = !1, hasNegative = !1;
    return units_1$1.UNITS.forEach((function(unit) {
        var value = parsed[unit];
        value < 0 ? hasNegative = !0 : value > 0 && (hasPositive = !0);
    })), hasNegative && !hasPositive ? {
        isAllNegative: !0,
        maybeAbsDuration: (0, negate_1.negate)(parsed)
    } : {
        isAllNegative: !1,
        maybeAbsDuration: parsed
    };
}, Object.defineProperty(toString$1, "__esModule", {
    value: !0
}), toString$1.toString = void 0;

var isZero_1 = isZero$1, getUnitCount_1 = getUnitCount$1, units_1 = units, checkAllUnitsNegative_1 = checkAllUnitsNegative$1, joinComponents = function(component) {
    return component.join("").replace(/\./g, ",");
};

toString$1.toString = function(duration) {
    if ((0, isZero_1.isZero)(duration)) return "P0D";
    var _a = (0, checkAllUnitsNegative_1.checkAllUnitsNegative)(duration), parsed = _a.maybeAbsDuration, isAllNegative = _a.isAllNegative;
    if (1 === (0, getUnitCount_1.getUnitCount)(parsed) && 0 !== parsed.weeks) return "P".concat(parsed.weeks, "W");
    var components = {
        period: [],
        time: []
    };
    units_1.UNITS_META.forEach((function(_a) {
        var fromUnit = _a.unit, toUnit = _a.stringifyConvertTo;
        if (null != toUnit) {
            var millisecondValue = parsed[fromUnit] * units_1.UNITS_META_MAP[fromUnit].milliseconds;
            parsed[toUnit] += millisecondValue / units_1.UNITS_META_MAP[toUnit].milliseconds, 
            parsed[fromUnit] = 0;
        }
    })), units_1.UNITS_META.forEach((function(_a) {
        var unit = _a.unit, ISOPrecision = _a.ISOPrecision, ISOCharacter = _a.ISOCharacter, value = parsed[unit];
        null != ISOPrecision && 0 !== value && components[ISOPrecision].push("".concat(value).concat(ISOCharacter));
    }));
    var output = "P".concat(joinComponents(components.period));
    return components.time.length && (output += "T".concat(joinComponents(components.time))), 
    isAllNegative && (output = "-".concat(output)), output;
};

var types = {};

Object.defineProperty(types, "__esModule", {
    value: !0
}), function(exports) {
    var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
        void 0 === k2 && (k2 = k), Object.defineProperty(o, k2, {
            enumerable: !0,
            get: function() {
                return m[k];
            }
        });
    } : function(o, m, k, k2) {
        void 0 === k2 && (k2 = k), o[k2] = m[k];
    }), __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports) {
        for (var p in m) "default" === p || Object.prototype.hasOwnProperty.call(exports, p) || __createBinding(exports, m, p);
    };
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.UNITS = void 0, __exportStar(abs$1, exports), __exportStar(apply$1, exports), 
    __exportStar(between$1, exports), __exportStar(isNegative$1, exports), __exportStar(isZero$1, exports), 
    __exportStar(requireNegate(), exports), __exportStar(normalize$1, exports), __exportStar(requireParse(), exports), 
    __exportStar(subtract$1, exports), __exportStar(sum$1, exports), __exportStar(toString$1, exports), 
    __exportStar(toUnit, exports), __exportStar(types, exports);
    var units_1 = units;
    Object.defineProperty(exports, "UNITS", {
        enumerable: !0,
        get: function() {
            return units_1.UNITS;
        }
    });
}(dist);

const AT = "@";

function attr(name) {
    return AT + name;
}

function toNumber(str) {
    let num;
    return Number.isNaN(str) ? 0 : "number" == typeof str ? str : (num = "string" == typeof str && -1 != str.indexOf(".") ? Number.parseFloat(str) : Number.parseInt(str), 
    num);
}

function filter(range, bandwidth, tolerance = 1e5) {
    let result = !1;
    const ranges = function(bitrate, tolerance = 1e5) {
        let lowerBound = 0, upperBound = 0;
        if (bitrate.indexOf("-") >= 0) {
            const [lowerBoundStr, upperBoundStr] = bitrate.split("-");
            return "" === upperBoundStr ? (lowerBound = Number(lowerBoundStr), upperBound = Number.MAX_VALUE) : "" === lowerBoundStr ? (lowerBound = 0, 
            upperBound = Number(upperBoundStr)) : (lowerBound = Number(lowerBoundStr), upperBound = Number(upperBoundStr)), 
            lowerBound >= upperBound && (lowerBound = -1, upperBound = -1), [ lowerBound, upperBound ];
        }
        return lowerBound = Number(bitrate) - tolerance, upperBound = Number(bitrate) + tolerance, 
        [ lowerBound, upperBound ];
    }(range, tolerance);
    return ranges[0] <= bandwidth && bandwidth <= ranges[1] && (result = !0), result;
}

function parseResolution(maxSupportedResolution) {
    const pair = maxSupportedResolution.split("-");
    if (!pair[0] || !pair[1] || !pair[0] && !pair[1]) throw new Error("DashParser: filterRepresentationsByResolution ,updateRepresentationAtIndex and updateRepresentations need resolution in format 'x-y'.");
    return {
        width: toNumber(pair[0]),
        height: toNumber(pair[1])
    };
}

function getContentType(adaptationSet) {
    return [ adaptationSet[attr(DashConstants.ATTR_CONTENT_TYPE)] ? adaptationSet[attr(DashConstants.ATTR_CONTENT_TYPE)] : "", adaptationSet[attr(DashConstants.ATTR_MIME_TYPE)] ? adaptationSet[attr(DashConstants.ATTR_MIME_TYPE)] : "" ];
}

function addTimeInMPD(periodDuration, currentMediaDuration) {
    const totalDuration = dist.sum(periodDuration, currentMediaDuration);
    return dist.toString(totalDuration).replace(/,/g, ".");
}

function convertTimeInMPDToSeconds(periodDuration) {
    return dist.toSeconds(periodDuration);
}

class Constants {}

Constants.ATTR_MIME_TYPE = "@mimeType", Constants.ATTR_CONTENT_TYPE = "@contentType", 
Constants.ATTR_BANDWIDTH = "@bandwidth", Constants.MPD = "MPD", Constants.PERIOD = "Period", 
Constants.ADAPTATION_SET = "AdaptationSet", Constants.REPRESENTATION = "Representation", 
Constants.ATTR_WIDTH = "@width", Constants.ATTR_T = "t", Constants.ATTR_HEIGHT = "@height", 
Constants.ATTR_LANG = "@lang", Constants.MEDIA_TYPE_VIDEO = "video", Constants.MEDIA_TYPE_AUDIO = "audio", 
Constants.MEDIA_TYPE_TEXT = "text", Constants.MEDIA_TYPE_APPLICATON = "application", 
Constants.MIME_TYPE_VIDEO_PREFIX = `${Constants.MEDIA_TYPE_VIDEO}/`, Constants.MIME_TYPE_AUDIO_PREFIX = `${Constants.MEDIA_TYPE_AUDIO}/`, 
Constants.MIME_TYPE_TEXT_PREFIX = `${Constants.MEDIA_TYPE_APPLICATON}/`, Constants.ATTR_START_NUMBER = "startNumber", 
Constants.ATTR_PRESENTATION_TIME_OFFSET = "presentationTimeOffset", Constants.SEGMENT_TEMPLATE = "SegmentTemplate", 
Constants.ATTR_DURATION = "duration", Constants.ATTR_TIMESCALE = "timescale", Constants.SEGMENT_TIMELINE = "SegmentTimeline", 
Constants.ATTR_MIDROLL = "midroll", Constants.S = "S", Constants.ATTR_START = "start", 
Constants.ATTR_MEDIA_PRESENTATION_DURATION = "mediaPresentationDuration", Constants.ATTR_ID = "id";

class DashParser {
    constructor() {
        this.filterRepresentationsByBandwidth = (mpdJson, bitrates, tolerance = 1e5) => {
            if (!mpdJson) throw new Error("DashParser: filterRepresentationsByBandwidth api failed ,dash mpd json object cannot be empty");
            if (!bitrates || 0 == bitrates.length) throw new Error("DashParser: filterRepresentationsByBandwidth api failed,bitrates cannot be empty");
            if (!Array.isArray(bitrates)) throw new Error("DashParser: filterRepresentationsByBandwidth api failed,bitrates should be array");
            if (!bitrates.every((item => "string" == typeof item))) throw new Error("DashParser: filterRepresentationsByBandwidth api failed,bitrates should be of strings");
            if (tolerance < 0) throw new Error("DashParser: filterRepresentationsByBandwidth api failed,invalid tolerance value, expected non-negative tolerance value");
            const filterFnForVideoAdaptationSet = knownMimeType => element => {
                let result = !1;
                const match = {};
                if (!knownMimeType) {
                    const _mimeType = element[Constants.ATTR_MIME_TYPE] ? element[Constants.ATTR_MIME_TYPE] : "", _contentType = element[Constants.ATTR_CONTENT_TYPE] ? element[Constants.ATTR_CONTENT_TYPE] : "";
                    if (logger.log("filterRepresentationsByBandwidth filterFnForVideoAdaptationSet mimetype : %s", _mimeType), 
                    logger.log("filterRepresentationsByBandwidth filterFnForVideoAdaptationSet contenttype : %s", _contentType), 
                    _mimeType && !_mimeType.startsWith(Constants.MIME_TYPE_VIDEO_PREFIX) || _contentType && _contentType != Constants.MEDIA_TYPE_VIDEO) return !0;
                }
                return bitrates.forEach((range => {
                    if (range) {
                        const intermediateResult = filter(range, element[Constants.ATTR_BANDWIDTH], tolerance);
                        match[range] = intermediateResult;
                    }
                })), result = Object.values(match).includes(!0), logger.log("bws object values", Object.values(match)), 
                result;
            };
            try {
                mpdJson[Constants.MPD][Constants.PERIOD].forEach((period => {
                    period[Constants.ADAPTATION_SET].forEach((adaptationSet => {
                        const [_contentType, _mimeType] = getContentType(adaptationSet);
                        let filteredRenditions = [];
                        _contentType == Constants.MEDIA_TYPE_VIDEO || _mimeType.startsWith(Constants.MIME_TYPE_VIDEO_PREFIX) ? (filteredRenditions = filteredRenditions.concat(adaptationSet[Constants.REPRESENTATION].filter(filterFnForVideoAdaptationSet(!0))), 
                        logger.log("filterRepresentationsByBandwidth video representations", filteredRenditions), 
                        adaptationSet[Constants.REPRESENTATION] = filteredRenditions) : "" === _contentType && "" === _mimeType && (filteredRenditions = adaptationSet[Constants.REPRESENTATION].filter(filterFnForVideoAdaptationSet(!1)), 
                        adaptationSet[Constants.REPRESENTATION] = filteredRenditions);
                    }));
                }));
            } catch (error) {
                throw new Error(`DashParser: failed to filterRepresentationsByBandwidth due to ${error.message}`);
            }
        }, this.filterRepresentationsByResolution = (mpdJson, maxSupportedResolution) => {
            if (!mpdJson) throw new Error("DashParser: filterRepresentationsByResolution api failed,dash mpd json object cannot be empty");
            if (!maxSupportedResolution || "string" != typeof maxSupportedResolution) throw new Error("DashParser: filterRepresentationsByResolution api failed,maxSupportedResolution should be a string and not empty");
            const maxSupportedResolutionObject = parseResolution(maxSupportedResolution), filterFnForVideoResolution = knownMimeType => element => {
                let result = !1;
                if (!knownMimeType) {
                    const _mimeType = element[Constants.ATTR_MIME_TYPE] ? element[Constants.ATTR_MIME_TYPE] : "";
                    if (!_mimeType.startsWith(Constants.MIME_TYPE_VIDEO_PREFIX)) return !0;
                    logger.log("filterRepresentationsByResolution filterFnForVideoResolution mimetype : %s", _mimeType);
                }
                const width = element[Constants.ATTR_WIDTH] ? element[Constants.ATTR_WIDTH] : 0, height = element[Constants.ATTR_HEIGHT] ? element[Constants.ATTR_HEIGHT] : 0;
                return result = width <= maxSupportedResolutionObject.width && height <= maxSupportedResolutionObject.height, 
                result;
            };
            try {
                mpdJson[Constants.MPD][Constants.PERIOD].forEach((period => {
                    period[Constants.ADAPTATION_SET].forEach((adaptationSet => {
                        const _contentType = adaptationSet[Constants.ATTR_CONTENT_TYPE] ? adaptationSet[Constants.ATTR_CONTENT_TYPE] : "", _mimeType = adaptationSet[Constants.ATTR_MIME_TYPE] ? adaptationSet[Constants.ATTR_MIME_TYPE] : "";
                        if (logger.log("filterRepresentationsByResolution mimetype : %s", _mimeType), logger.log("filterRepresentationsByResolution contenttype : %s", _contentType), 
                        _contentType == Constants.MEDIA_TYPE_VIDEO || _mimeType.startsWith(Constants.MIME_TYPE_VIDEO_PREFIX)) {
                            logger.log("representation", adaptationSet[Constants.REPRESENTATION]);
                            const filteredRenditions = adaptationSet[Constants.REPRESENTATION].filter(filterFnForVideoResolution(!0));
                            adaptationSet[Constants.REPRESENTATION] = filteredRenditions;
                        } else if ("" === _contentType && "" === _mimeType) {
                            const filteredRenditions = adaptationSet[Constants.REPRESENTATION].filter(filterFnForVideoResolution(!1));
                            adaptationSet[Constants.REPRESENTATION] = filteredRenditions;
                        }
                    }));
                }));
            } catch (error) {
                throw new Error(`DashParser: failed to filterRepresentationsByResolution due to ${error.message}`);
            }
        }, this.updateRepresentationAtIndex = (mpdJson, resolution, newIndex) => {
            if (logger.log(resolution, newIndex), logger.log(typeof resolution, typeof newIndex), 
            !mpdJson) throw new Error("DashParser: updateRepresentationAtIndex api failed,dash mpd json object cannot be empty");
            if (!resolution) throw new Error("DashParser: updateRepresentationAtIndex api failed,resolution cannot be empty");
            if ("string" != typeof resolution) throw new Error("DashParser: updateRepresentationAtIndex api failed,resolution must be a string");
            if ("number" != typeof newIndex || newIndex < 0) throw new Error("DashParser: updateRepresentationAtIndex api failed,newIndex must be a number greater than or equal to 0");
            if (0 != newIndex && !newIndex || null === newIndex) throw new Error("DashParser: updateRepresentationAtIndex api failed,newIndex cannot be empty,undefined or null");
            try {
                mpdJson[Constants.MPD][Constants.PERIOD].forEach((period => {
                    period[Constants.ADAPTATION_SET].forEach((adaptationSet => {
                        const [_contentType, _mimeType] = getContentType(adaptationSet);
                        (_contentType == Constants.MEDIA_TYPE_VIDEO || _mimeType.startsWith(Constants.MIME_TYPE_VIDEO_PREFIX)) && (representations => {
                            let isVariantAtIndexUpdated = !1;
                            if (newIndex >= representations.length) return isVariantAtIndexUpdated;
                            let currVariantIndex = 0;
                            const resolutionObject = parseResolution(resolution);
                            for (;currVariantIndex < representations.length; ) if (representations[currVariantIndex][Constants.ATTR_WIDTH] && representations[currVariantIndex][Constants.ATTR_HEIGHT] && representations[currVariantIndex][Constants.ATTR_WIDTH] === resolutionObject.width && representations[currVariantIndex][Constants.ATTR_HEIGHT] === resolutionObject.height) {
                                if (currVariantIndex == newIndex) return;
                                {
                                    const splicedEle = representations.splice(currVariantIndex, 1)[0];
                                    representations.splice(newIndex, 0, splicedEle), isVariantAtIndexUpdated = !0, logger.log("updateRepresentationAtIndex representation updated at index %s", newIndex), 
                                    logger.log("updateRepresentationAtIndex representation updated at index %s", newIndex), 
                                    logger.log("updateRepresentationAtIndex element spliced %s", splicedEle), currVariantIndex++;
                                }
                            } else currVariantIndex++;
                        })(adaptationSet[Constants.REPRESENTATION]);
                    }));
                }));
            } catch (error) {
                throw new Error(`DashParser: failed to updateRepresentationAtIndex due to ${error.message}`);
            }
        }, this.updateRepresentations = (mpdJson, resolutions, newIndex = 0) => {
            if (!mpdJson) throw new Error("DashParser: updateRepresentations api failed,dash mpd json object cannot be empty");
            if (!resolutions || 0 == resolutions.length) throw new Error("DashParser: updateRepresentations api failed,resolutions cannot be empty");
            if (!Array.isArray(resolutions)) throw new Error("DashParser: updateRepresentations api failed,resolutions must be an array");
            if (!resolutions.every((item => "string" == typeof item))) throw new Error("DashParser: updateRepresentations api failed,resolutions must be an array of strings");
            try {
                mpdJson[Constants.MPD][Constants.PERIOD].forEach((period => {
                    period[Constants.ADAPTATION_SET].forEach((adaptationSet => {
                        const [_contentType, _mimeType] = getContentType(adaptationSet);
                        (_contentType == Constants.MEDIA_TYPE_VIDEO || _mimeType.startsWith(Constants.MIME_TYPE_VIDEO_PREFIX)) && (representations => {
                            newIndex = 0;
                            const numOfRes = resolutions.length;
                            for (let currResIndex = 0; currResIndex < numOfRes; currResIndex++) {
                                let currVariantIndex = 0;
                                const resolutionObject = parseResolution(resolutions[currResIndex]);
                                for (;currVariantIndex < representations.length; ) if (representations[currVariantIndex][Constants.ATTR_WIDTH] && representations[currVariantIndex][Constants.ATTR_HEIGHT] && representations[currVariantIndex][Constants.ATTR_WIDTH] === resolutionObject.width && representations[currVariantIndex][Constants.ATTR_HEIGHT] === resolutionObject.height) {
                                    if (currVariantIndex != newIndex) {
                                        const splicedEle = representations.splice(currVariantIndex, 1)[0];
                                        representations.splice(newIndex, 0, splicedEle), logger.log("updateRepresentations representation updated at index %s", newIndex), 
                                        logger.log("updateRepresentations currVariantIndex %s", currVariantIndex), logger.log("updateRepresentations element spliced %s", splicedEle), 
                                        newIndex++, currVariantIndex++;
                                    }
                                } else currVariantIndex++;
                            }
                        })(adaptationSet[Constants.REPRESENTATION]);
                    }));
                }));
            } catch (error) {
                throw new Error(`DashParser: failed to updateRepresentations due to ${error.message}`);
            }
        }, this.filterAdaptationSetsByAudioLanguage = (mpdJson, languages) => {
            if (!mpdJson) throw new Error("DashParser: filterAdaptationSetsByAudioLanguage api failed,dash mpd json object cannot be empty");
            if (!languages || 0 === languages.length) throw new Error("DashParser: filterAdaptationSetsByAudioLanguage api failed,languages cannot be empty");
            if (!Array.isArray(languages)) throw new Error("DashParser: filterAdaptationSetsByAudioLanguage api failed,languages should be an array");
            if (!languages.every((item => "string" == typeof item))) throw new Error("DashParser: filterAdaptationSetsByAudioLanguage api failed,languages should be an array of strings");
            try {
                mpdJson[Constants.MPD][Constants.PERIOD].forEach((period => {
                    const filteredRenditions = period[Constants.ADAPTATION_SET].filter((element => {
                        let result = !1;
                        const [_contentType, _mimeType] = getContentType(element);
                        if (logger.log("filterAdaptationSetsByAudioLanguage filterFnForAudioAdaptationSet _contentType %s", _contentType), 
                        logger.log("filterAdaptationSetsByAudioLanguage filterFnForAudioAdaptationSet _mimeType %s", _mimeType), 
                        !_mimeType && !_contentType) return !0;
                        if (_mimeType && !_mimeType.startsWith(Constants.MIME_TYPE_AUDIO_PREFIX) || _contentType && _contentType != Constants.MEDIA_TYPE_AUDIO) return !0;
                        const lang = element[Constants.ATTR_LANG] ? element[Constants.ATTR_LANG] : "";
                        return result = languages.includes(lang), logger.log("filterAdaptationSetsByAudioLanguage filterFnForAudioAdaptationSet language matches %s", languages.includes(lang)), 
                        result;
                    }));
                    period[Constants.ADAPTATION_SET] = filteredRenditions, filteredRenditions.forEach((adaptationSet => {
                        const languageFromAdaptationSet = adaptationSet[Constants.ATTR_LANG] ? adaptationSet[Constants.ATTR_LANG] : "", filteredRepresentation = adaptationSet[Constants.REPRESENTATION].filter((languageFromAdaptationSet => element => {
                            let result = !1;
                            const _mimeType = element[Constants.ATTR_MIME_TYPE] ? element[Constants.ATTR_MIME_TYPE] : "", _contentType = element[Constants.ATTR_CONTENT_TYPE] ? element[Constants.ATTR_CONTENT_TYPE] : "";
                            if (!_mimeType.startsWith(Constants.MIME_TYPE_AUDIO_PREFIX) || _contentType != Constants.MEDIA_TYPE_AUDIO) return !0;
                            const lang = element[Constants.ATTR_LANG] ? element[Constants.ATTR_LANG] : languageFromAdaptationSet;
                            return result = languages.includes(lang), logger.log("filterAdaptationSetsByAudioLanguage filterFnForAudioRepresentation language matches %s", languages.includes(lang)), 
                            result;
                        })(languageFromAdaptationSet));
                        adaptationSet[Constants.REPRESENTATION] = filteredRepresentation;
                    }));
                }));
            } catch (error) {
                throw new Error(`DashParser: failed to filterAdaptationSetsByAudioLanguage due to ${error.message}`);
            }
        }, this.filterAdaptationSetsBySubtitlesLanguage = (mpdJson, languages) => {
            if (!mpdJson) throw new Error("DashParser: filterAdaptationSetsBySubtitlesLanguage api failed,dash mpd json object cannot be empty");
            if (!languages || 0 === languages.length) throw new Error("DashParser: filterAdaptationSetsBySubtitlesLanguage api failed,languages cannot be empty");
            if (!Array.isArray(languages)) throw new Error("DashParser: filterAdaptationSetsBySubtitlesLanguage api failed,languages should be an array");
            if (!languages.every((item => "string" == typeof item))) throw new Error("DashParser: filterAdaptationSetsBySubtitlesLanguage api failed,languages should be an array of strings");
            try {
                mpdJson[Constants.MPD][Constants.PERIOD].forEach((period => {
                    const filteredRenditions = period[Constants.ADAPTATION_SET].filter((element => {
                        let result = !1;
                        const [_contentType, _mimeType] = getContentType(element);
                        if (logger.log("filterAdaptationSetsBySubtitlesLanguage filterFnForSubtitleAdaptationSet _contentType %s", _contentType), 
                        logger.log("filterAdaptationSetsBySubtitlesLanguage filterFnForSubtitleAdaptationSet _mimeType %s", _mimeType), 
                        _mimeType && !_mimeType.startsWith(Constants.MIME_TYPE_TEXT_PREFIX) || _contentType && _contentType != Constants.MEDIA_TYPE_TEXT) return !0;
                        const lang = element[Constants.ATTR_LANG] ? element[Constants.ATTR_LANG] : "";
                        return result = languages.includes(lang), logger.log("filterAdaptationSetsBySubtitlesLanguage filterFnForSubtitleAdaptationSet language matches %s", languages.includes(lang)), 
                        result;
                    }));
                    period[Constants.ADAPTATION_SET] = filteredRenditions, filteredRenditions.forEach((adaptationSet => {
                        const languageFromAdaptationSet = adaptationSet[Constants.ATTR_LANG] ? adaptationSet[Constants.ATTR_LANG] : "", filteredRepresentation = adaptationSet[Constants.REPRESENTATION].filter((languageFromAdaptationSet => element => {
                            let result = !1;
                            const _mimeType = element[Constants.ATTR_MIME_TYPE] ? element[Constants.ATTR_MIME_TYPE] : "", _contentType = element[Constants.ATTR_CONTENT_TYPE] ? element[Constants.ATTR_CONTENT_TYPE] : "";
                            if (!_mimeType.startsWith(Constants.MIME_TYPE_TEXT_PREFIX) || _contentType != Constants.MEDIA_TYPE_TEXT) return !0;
                            const lang = element[Constants.ATTR_LANG] ? element[Constants.ATTR_LANG] : languageFromAdaptationSet;
                            return result = languages.includes(lang), logger.log("filterAdaptationSetsBySubtitlesLanguage filterFnForSubtitleRepresentation language matches %s", languages.includes(lang)), 
                            result;
                        })(languageFromAdaptationSet));
                        adaptationSet[Constants.REPRESENTATION] = filteredRepresentation;
                    }));
                }));
            } catch (error) {
                throw new Error(`DashParser: failed to filterAdaptationSetsBySubtitlesLanguage due to ${error.message}`);
            }
        }, this.bumperInsertion = (mpd, bumperPlaylistArrayObject) => {
            const self = this;
            try {
                if (!mpd || !bumperPlaylistArrayObject || 0 == bumperPlaylistArrayObject.length) throw new Error("Invalid arguments!");
                const mpdPeriod = mpd[Constants.MPD][Constants.PERIOD], result = [], midRollObjectsDuration = (bumperPlaylistArrayObject = bumperPlaylistArrayObject.sort(((a, b) => a.afterSeconds - b.afterSeconds))).filter((obj => obj.afterSeconds > 0)).map((obj => obj.afterSeconds)), currentMediaDuration = mpd[Constants.MPD]["@" + Constants.ATTR_MEDIA_PRESENTATION_DURATION];
                1 == mpdPeriod.length && (mpdPeriod[0]["@" + Constants.ATTR_DURATION] || (mpdPeriod[0]["@" + Constants.ATTR_DURATION] = currentMediaDuration)), 
                logger.log("bumperInsertion currentMediaDuration", currentMediaDuration);
                const bumperDurations = bumperPlaylistArrayObject.map((bumper => {
                    const bumperResponse = bumper.responseBodyObject;
                    return convertTimeInMPDToSeconds(bumperResponse[Constants.MPD][Constants.PERIOD][0]["@" + Constants.ATTR_DURATION] ? bumperResponse[Constants.MPD][Constants.PERIOD][0]["@" + Constants.ATTR_DURATION] : bumperResponse[Constants.MPD]["@" + Constants.ATTR_MEDIA_PRESENTATION_DURATION]);
                }));
                logger.log("bumperInsertion midroll object durations", midRollObjectsDuration);
                let jsonStr, midRollDuration = [];
                for (let i = 0; i < midRollObjectsDuration.length; i++) {
                    midRollDuration[i] = 0 === i ? midRollObjectsDuration[i] : midRollObjectsDuration[i] - midRollObjectsDuration[i - 1];
                    const bumperToBeInserted = bumperPlaylistArrayObject[i].responseBodyObject;
                    logger.log("midroll bumperToBeInserted", bumperToBeInserted);
                    const periodToBeInserted = bumperToBeInserted[Constants.MPD][Constants.PERIOD][0];
                    let periodDuration;
                    periodToBeInserted["@" + Constants.ATTR_DURATION] || (periodDuration = bumperToBeInserted[Constants.MPD]["@" + Constants.ATTR_MEDIA_PRESENTATION_DURATION], 
                    periodToBeInserted["@" + Constants.ATTR_DURATION] = periodDuration), self.midRollAdInsert(mpd, periodToBeInserted, midRollDuration[i], result);
                }
                if (midRollObjectsDuration.length > 0) {
                    jsonStr = JSON.parse(JSON.stringify(mpdPeriod));
                    let sum = 0;
                    for (let i = 0; i < midRollDuration.length; i++) result.push(midRollDuration[i], bumperDurations[i]), 
                    sum += midRollDuration[i];
                    result[result.length] = convertTimeInMPDToSeconds(currentMediaDuration) - sum, logger.log("bumperInsertion result", result);
                    for (let j = 0; j < result.length; j++) jsonStr[j].midroll && (jsonStr[j]["@" + Constants.ATTR_DURATION] = "PT" + result[j] + "S");
                    mpd[Constants.MPD][Constants.PERIOD] = jsonStr;
                }
                const preRollObjects = bumperPlaylistArrayObject.filter((object => -1 === object.afterSeconds)), postRollObjects = bumperPlaylistArrayObject.filter((object => 0 === object.afterSeconds));
                if (preRollObjects.length > 0 && self.preRollAdInsert(mpd, preRollObjects), postRollObjects.length > 0 && self.postRollAdInsert(mpd, postRollObjects), 
                preRollObjects.length > 0 || postRollObjects.length > 0) {
                    const mpdPeriod1 = mpd[Constants.MPD][Constants.PERIOD];
                    jsonStr = JSON.parse(JSON.stringify(mpdPeriod1));
                }
                let periodDuration, mediaDurationAfterBumperInsertion = "PT0S";
                const startTime = "PT0S";
                for (let index = 0; index < jsonStr.length; index++) {
                    const period = jsonStr[index];
                    if (period["@" + Constants.ATTR_ID] = index, periodDuration = period["@" + Constants.ATTR_DURATION], 
                    0 == index) period["@" + Constants.ATTR_START] = startTime; else {
                        const periodStart = jsonStr[index - 1]["@" + Constants.ATTR_START], prevPeriodDuration = jsonStr[index - 1]["@" + Constants.ATTR_DURATION];
                        period["@" + Constants.ATTR_START] = addTimeInMPD(periodStart, prevPeriodDuration);
                    }
                    mediaDurationAfterBumperInsertion = addTimeInMPD(mediaDurationAfterBumperInsertion, periodDuration);
                }
                mpd[Constants.MPD][Constants.PERIOD] = jsonStr, mpd[Constants.MPD]["@" + Constants.ATTR_MEDIA_PRESENTATION_DURATION] = mediaDurationAfterBumperInsertion;
            } catch (error) {
                throw new Error(`DashParser: failed to perform bumper insertion due to ${error.message}`);
            }
        }, this.postRollAdInsert = (mpd, bumper) => {
            for (let i = 0; i < bumper.length; i++) {
                const periodToBeInserted = bumper[i].responseBodyObject[Constants.MPD][Constants.PERIOD][0];
                mpd[Constants.MPD][Constants.PERIOD].push(periodToBeInserted);
            }
        }, this.preRollAdInsert = (mpd, bumper) => {
            for (let i = 0; i < bumper.length; i++) {
                const periodToBeInserted = bumper[i].responseBodyObject[Constants.MPD][Constants.PERIOD][0];
                mpd[Constants.MPD][Constants.PERIOD].splice(i, 0, periodToBeInserted);
            }
        }, this.midRollAdInsert = (mpd, bumper, secondsAfterWhichAdHasToBeInserted, result) => {
            const Period = mpd[Constants.MPD][Constants.PERIOD][0];
            Period[Constants.ATTR_MIDROLL] = !0;
            const periodCopy = JSON.parse(JSON.stringify(Period));
            periodCopy[Constants.ATTR_MIDROLL] = !0;
            let startNumber, segmentTemplateDuration, segmentTimescale, segmentDuration;
            periodCopy[Constants.ADAPTATION_SET].forEach((adaptationSet => {
                const segmentTemplate = adaptationSet[Constants.SEGMENT_TEMPLATE];
                if (segmentTemplate) segmentTemplateDuration = segmentTemplate["@" + Constants.ATTR_DURATION], 
                segmentTimescale = segmentTemplate["@" + Constants.ATTR_TIMESCALE], segmentDuration = parseInt((segmentTemplateDuration / segmentTimescale).toFixed(2), 10), 
                startNumber = Math.ceil(secondsAfterWhichAdHasToBeInserted / segmentDuration), logger.log("bumperInsertion segmentTemplate", segmentTemplate), 
                segmentTemplate["@" + Constants.ATTR_START_NUMBER] = startNumber + 1; else {
                    adaptationSet[Constants.REPRESENTATION].forEach((rep => {
                        const segTemplate = rep[Constants.SEGMENT_TEMPLATE], segTimeLine = segTemplate[Constants.SEGMENT_TIMELINE];
                        segmentTimescale = segTemplate["@" + Constants.ATTR_TIMESCALE];
                        const segment = segTimeLine[Constants.S], segmentLength = segment.length;
                        let presentationTimeOffset;
                        segmentTemplateDuration = segment[0]["@d"], 1 == segmentLength ? (segmentDuration = parseInt((segmentTemplateDuration / segmentTimescale).toFixed(2), 10), 
                        startNumber = Math.ceil(secondsAfterWhichAdHasToBeInserted / segmentDuration) + 1, 
                        logger.log("bumperInsertion segment object secondsAfterWhichAdHasToBeInserted", secondsAfterWhichAdHasToBeInserted, segmentDuration, startNumber)) : startNumber = this.calculateStartNumberForMultipleSegmentTimeline(segment, segmentTimescale, secondsAfterWhichAdHasToBeInserted), 
                        presentationTimeOffset = (startNumber - 1) * segmentDuration * segmentTimescale, 
                        segment[0]["@" + Constants.ATTR_T] = presentationTimeOffset, segTemplate["@" + Constants.ATTR_START_NUMBER] = startNumber, 
                        segTemplate["@" + Constants.ATTR_PRESENTATION_TIME_OFFSET] = presentationTimeOffset;
                    }));
                }
            })), this.insertMidRollBumper(mpd, periodCopy, bumper);
        }, this.calculateStartNumberForMultipleSegmentTimeline = (segment, SegmentTimescale, secondsAfterWhichAdHasToBeInserted) => {
            let duration = 0, startNumber = 1;
            return segment.forEach((seg => {
                const segmentTimelineDuration = seg["@d"], segmentTimelineRepetition = seg["@r"] ? seg["@r"] : 0, segmentDuration = parseInt((segmentTimelineDuration / SegmentTimescale).toFixed(2), 10);
                for (let i = 0; i <= segmentTimelineRepetition; i++) {
                    if (!(duration < secondsAfterWhichAdHasToBeInserted)) return startNumber;
                    duration += segmentDuration, startNumber += 1;
                }
            })), segment.map((seg => {
                delete seg["@" + Constants.ATTR_T];
            })), startNumber;
        }, this.insertMidRollBumper = (mpd, periodCopy, bumper) => {
            mpd[Constants.MPD][Constants.PERIOD].push(bumper, periodCopy);
        }, this.dashMPD = new DashMPD;
    }
    parseMPD(mpdXml) {
        try {
            this.dashMPD.parse(mpdXml);
        } catch (error) {
            throw new Error(`DashParser: failed to parseMPD due to ${error.message}`);
        }
    }
    getJSON() {
        return this.dashMPD.getJSON();
    }
    setJSON(mpdJson) {
        this.dashMPD.setJSON(mpdJson);
    }
    stringifyMPD() {
        try {
            return this.dashMPD.getMPD();
        } catch (error) {
            throw new Error(`DashParser: failed to parseMPD due to ${error.message}`);
        }
    }
}

export { DashParser };
