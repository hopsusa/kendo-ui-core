;(function($, window) {
    var kendo = window.kendo = window.kendo || {},
        extend = $.extend,
        proxy = $.proxy,
        Template,
        JSON = JSON || {},
        support = {},
        dateCheck = /\d/;
//Event ================================
    function Event() {
        this._isPrevented = false;
    }

    Event.prototype = {
        preventDefault: function() {
            this._isPrevented = true;
        },
        isDefaultPrevented: function() {
            return this._isPrevented;
        }
    };

//Observable ================================
    function Observable() {
        this._events = {};
    }

    Observable.prototype = {
        bind: function(eventName, handlers) {
            var that = this,
                idx,
                eventNames = $.isArray(eventName) ? eventName : [eventName],
                length,
                events;

            for (idx = 0, length = eventNames.length; idx < length; idx++) {
                eventName = eventNames[idx];

                handler = $.isFunction(handlers) ? handlers : handlers[eventName];

                if (handler) {
                    events = that._events[eventName] || []
                    events.push(handler);
                    that._events[eventName] = events;
                }
            }

            return that;
        },

        trigger: function(eventName, parameter) {
            var that = this,
                events = that._events[eventName],
                args = $.extend(new Event(), parameter),
                idx,
                length;

            if (events) {
                for (idx = 0, length = events.length; idx < length; idx++) {
                    events[idx].call(that, args);
                }
            }

            return args.isDefaultPrevented();
        },

        unbind: function(eventName, handler) {
            var that = this,
                events = that._events[eventName],
                idx,
                length;

            if (events) {
                if (handler) {
                    for (idx = 0, length = events.length; idx < length; idx++) {
                        if (events[idx] === handler) {
                            events.splice(idx, 1);
                        }
                    }
                } else {
                    that._events[eventName] = [];
                }
            }

            return that;
        }
    }

//Template ================================
    Template = {
        paramName: "data", // name of the parameter of the generated template
        useWithBlock: true, // whether to wrap the template in a with() block
        begin: "<%", // the marker which denotes the beginning of executable code
        end: "%>", // the marker which denotes the end of executable code
        compile: function(template, options) {
            var settings = extend({}, this, options),
                paramName = settings.paramName,
                begin = settings.begin,
                end = settings.end,
                useWithBlock = settings.useWithBlock,
                functionBody = "var o='';",
                evalRegExp = new RegExp(begin + "=(.+?)" + end, "g"),
                quoteRegExp = new RegExp("'(?=[^" + end[0] + "]*" + end + ")", "g");

            functionBody += useWithBlock ? "with(" + paramName + "){" : "";

            functionBody += "o+='";

            functionBody += template.replace(/[\r\t\n]/g, " ")
                .replace(quoteRegExp,"\t")
                .split("'").join("\\'")
                .split("\t").join("'")
                .replace(evalRegExp, "'; o+=$1; o+='")
                .split(begin).join("';")
                .split(end).join("o+='");

            functionBody += useWithBlock ? "'}" : "';";

            functionBody += "return o;";

            return new Function(paramName, functionBody);
        }
    };

    function pad(n) {
        return n < 10 ? "0" + n : n;
    }

    //JSON stringify
(function() {
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"" : '\\"',
            "\\": "\\\\"
        },
        rep,
        formatters,
        FUNCTION = "function",
        STRING = "string",
        NUMBER = "number",
        OBJECT = "object",
        NULL = "null",
        BOOLEAN = "boolean",
        toString = {}.toString,
        hasOwnProperty = {}.hasOwnProperty;

    if (typeof Date.prototype.toJSON !== FUNCTION) {

        Date.prototype.toJSON = function (key) {
            var that = this;

            return isFinite(that.valueOf()) ?
                that.getUTCFullYear()     + "-" +
                pad(that.getUTCMonth() + 1) + "-" +
                pad(that.getUTCDate())      + "T" +
                pad(that.getUTCHours())     + ":" +
                pad(that.getUTCMinutes())   + ":" +
                pad(that.getUTCSeconds())   + "Z" : null;
        };

        String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? "\"" + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === STRING ? c :
                "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
        }) + "\"" : "\"" + string + "\"";
    }

    function str(key, holder) {
        var i,
            k,
            v,
            length,
            mind = gap,
            partial,
            value = holder[key],
            type;

        if (value && typeof value === OBJECT && typeof value.toJSON === FUNCTION) {
            value = value.toJSON(key);
        }

        if (typeof rep === FUNCTION) {
            value = rep.call(holder, key, value);
        }

        type = typeof value;
        if (type === STRING) {
            return quote(value);
        } else if (type === NUMBER) {
            return isFinite(value) ? String(value) : NULL;
        } else if (type === BOOLEAN || type === NULL) {
            return String(value);
        } else if (type === OBJECT) {
            if (!value) {
                return NULL;
            }
            gap += indent;
            partial = [];
            if (toString.apply(value) === "[object Array]") {
                length = value.length;
                for (i = 0; i < length; i++) {
                    partial[i] = str(i, value) || NULL;
                }
                v = partial.length === 0 ? "[]" : gap ?
                    "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" :
                    "[" + partial.join(",") + "]";
                gap = mind;
                return v;
            }
            if (rep && typeof rep === OBJECT) {
                length = rep.length;
                for (i = 0; i < length; i++) {
                    if (typeof rep[i] === STRING) {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ": " : ":") + v);
                        }
                    }
                }
            } else {
                for (k in value) {
                    if (hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ": " : ":") + v);
                        }
                    }
                }
            }

            v = partial.length === 0 ? "{}" : gap ?
                "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" :
                "{" + partial.join(",") + "}";
            gap = mind;
            return v;
        }
    }

    if (typeof JSON.stringify !== FUNCTION) {
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = "";
            indent = "";

            if (typeof space === NUMBER) {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }

            } else if (typeof space === STRING) {
                indent = space;
            }

            rep = replacer;
            if (replacer && typeof replacer !== FUNCTION && (typeof replacer !== OBJECT || typeof replacer.length !== NUMBER)) {
                throw new Error("JSON.stringify");
            }

            return str("", {"": value});
        };
    }
})();

    var CultureInfo = {
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        abbrDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        shortestDays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        abbrMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        longTime: "h:mm:ss tt",
        longDate: "dddd, MMMM dd, yyyy",
        shortDate: "M/d/yyyy",
        shortTime: "h:mm tt",
        fullDateTime: "dddd, MMMM dd, yyyy h:mm:ss tt",
        generalDateShortTime: "M/d/yyyy h:mm tt",
        generalDateTime: "M/d/yyyy h:mm:ss tt",
        sortableDateTime: "yyyy'-'MM'-'ddTHH':'mm':'ss",
        universalSortableDateTime: "yyyy'-'MM'-'dd HH':'mm':'ss'Z'",
        monthYear: "MMMM, yyyy",
        monthDay: "MMMM dd",
        today: "today",
        tomorrow: "tomorrow",
        yesterday: "yesterday",
        next: "next",
        last: "last",
        year: "year",
        month: "month",
        week: "week",
        day: "day",
        am: "AM",
        pm: "PM",
        dateSeparator: "/",
        timeSeparator: ":",
        firstDayOfWeek: 0,
        currencydecimaldigits: 2,
        currencydecimalseparator: '.',
        currencygroupseparator: ',',
        currencygroupsize: 3,
        currencynegative: 0,
        currencypositive: 0,
        currencysymbol: '$',
        numericdecimaldigits: 2,
        numericdecimalseparator: '.',
        numericgroupseparator: ',',
        numericgroupsize: 3,
        numericnegative: 1,
        percentdecimaldigits: 2,
        percentdecimalseparator: '.',
        percentgroupseparator: ',',
        percentgroupsize: 3,
        percentnegative: 0,
        percentpositive: 0,
        percentsymbol: '%'
    };
    
    function DateTime() {
        if (arguments.length == 0)
            this.value = new Date();
        else if (arguments.length == 1)
            this.value = new Date(arguments[0]);
        else if (arguments.length == 3)
            this.value = new Date(arguments[0], arguments[1], arguments[2]);
        else if (arguments.length == 6)
            this.value = new Date(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
        else
            this.value = new Date(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);

        return this;
    }

    extend(DateTime, {
        msPerMinute: 60000,
        msPerDay: 86400000,
        add: function (date, valueToAdd) {
            var tzOffsetBefore = date.timeOffset(),
                resultDate = new DateTime(date.time() + valueToAdd),
                tzOffsetDiff = resultDate.timeOffset() - tzOffsetBefore;
            return new DateTime(resultDate.time() + tzOffsetDiff * DateTime.msPerMinute);
        },

        firstDayOfMonth: function (date) {
            return new DateTime(0)
                        .hours(date.hours())
                        .minutes(date.minutes())
                        .seconds(date.seconds())
                        .milliseconds(date.milliseconds())
                        .year(date.year(), date.month(), 1);
        },

        firstVisibleDay: function (date) {
            var firstDayOfWeek = CultureInfo.firstDayOfWeek,
                firstVisibleDay = new DateTime(date.year(), date.month(), 0, date.hours(), date.minutes(), date.seconds(), date.milliseconds());
            while (firstVisibleDay.day() != firstDayOfWeek) {
                DateTime.modify(firstVisibleDay, -1 * DateTime.msPerDay)
            }
            return firstVisibleDay;
        },

        modify: function (date, value) {
            var tzOffsetBefore = date.timeOffset(),
                resultDate = new DateTime(date.time() + value),
                tzOffsetDiff = resultDate.timeOffset() - tzOffsetBefore;
            date.time(resultDate.time() + tzOffsetDiff * DateTime.msPerMinute);
        },

        parse: function (options) {
            var value = options.value,
                format = options.format;

            if (value && value.value) return value;

            format = DateTime.standardFormat(format) ? DateTime.standardFormat(format) : format;
            if (dateCheck.test(value))
                return DateTime.parseMachineDate({
                    value: value,
                    format: format,
                    shortYearCutOff: options.shortYearCutOff,
                    baseDate: options.baseDate,
                    AM: CultureInfo.am,
                    PM: CultureInfo.pm
                });

            return DateTime.parseByToken ? DateTime.parseByToken(value, options.today) : null;
        },

        parseMachineDate: function (options) {

            var AM = options.AM,
                PM = options.PM,
                value = options.value,
                format = options.format,
                baseDate = options.baseDate,
                shortYearCutOff = options.shortYearCutOff || 30,
                year = -1,
                month = -1,
                day = -1,
                hours = 0,
                minutes = 0,
                seconds = 0,
                milliseconds = 0,
                isAM,
                isPM,
                literal = false,
                matches = function (match) {
                    return (formatPosition + 1 < format.length && format.charAt(formatPosition + 1) == match);
                },
                // Returns count of the format character in the date format string
                lookAhead = function (match) {
                    var index = 0;
                    while (matches(match)) {
                        index++;
                        formatPosition++
                    }
                    return index;
                },
                // Extract a number from the string value
                getNumber = function (size) {
                    var digits = new RegExp("^\\d{1," + size + "}"),
                        num = value.substr(currentTokenIndex).match(digits);
                    if (num) {
                        currentTokenIndex += num[0].length;
                        return parseInt(num[0], 10);
                    } else {
                        return -1;
                    }
                },
                // Extract a name from the string value and convert to an index
                getName = function (names) {
                    for (var i = 0; i < names.length; i++) {
                        if (value.substr(currentTokenIndex, names[i].length) == names[i]) {
                            currentTokenIndex += names[i].length;
                            return i + 1;
                        }
                    }
                    return -1;
                },
                checkLiteral = function () {
                    if (value.charAt(currentTokenIndex) == format.charAt(formatPosition)) {
                        currentTokenIndex++;
                    }
                },
                normalizeTime = function (val) {
                    return val === -1 ? 0 : val;
                },
                count = 0,
                currentTokenIndex = 0,
                valueLength = value.length;

            for (var formatPosition = 0, flength = format.length; formatPosition < flength; formatPosition++) {
                if (currentTokenIndex == valueLength) break;
                if (literal) {
                    checkLiteral();
                    if (format.charAt(formatPosition) == "'")
                        literal = false;
                } else {
                    switch (format.charAt(formatPosition)) {
                        case "d":
                            count = lookAhead("d");
                            day = count <= 1 ? getNumber(2) : getName(CultureInfo[count == 3 ? "days" : "abbrDays"]);
                            break;
                        case "M":
                            count = lookAhead("M");
                            month = count <= 1 ? getNumber(2) : getName(CultureInfo[count == 3 ? "months" : "abbrMonths"]);
                            break;
                        case "y":
                            count = lookAhead("y");
                            year = getNumber(count <= 1 ? 2 : 4);
                            break;
                        case "H": // 0-24 hours
                            count = lookAhead("H");
                            hours = normalizeTime(getNumber(2));
                            break;
                        case "h": // 0-12 hours
                            lookAhead("h")
                            hours = normalizeTime(getNumber(2));
                            break;
                        case "m":
                            lookAhead("m");
                            minutes = normalizeTime(getNumber(2));
                            break;
                        case "s":
                            lookAhead("s");
                            seconds = normalizeTime(getNumber(2));
                            break;
                        case "f":
                            count = lookAhead("f");
                            milliseconds = normalizeTime(getNumber(count <= 0 ? 1 : count + 1));
                            break;
                        case "t": // AM/PM or A/P
                            count = lookAhead("t");
                            AM = count > 0 ? AM : "a";
                            PM = count > 0 ? PM : "p";

                            var subValue = value.substr(currentTokenIndex).toLowerCase();
                            isAM = subValue.indexOf(AM.toLowerCase()) != -1;
                            isPM = subValue.indexOf(PM.toLowerCase()) != -1;

                            currentTokenIndex += isPM ? PM.length : isAM ? AM.length : 0;
                            break;
                        case "'":
                            checkLiteral();
                            literal = true;
                            break;
                        default:
                            checkLiteral();
                    }
                }
            }

            var date = new DateTime();

            if (year != -1 && year < 100) {
                year += date.year() - date.year() % 100 + (year <= shortYearCutOff ? 0 : -100);
            }

            hours = (isPM && hours < 12)
                  ? hours + 12
                  : hours == 12 && isAM
                  ? 0
                  : hours;

            if (baseDate == undefined) {
                if (year == -1) { 
                    year = date.year();
                }

                date = new DateTime(year, month - 1, day, hours, minutes, seconds, milliseconds);

                if (date.year() != year || date.month() != (month - 1) || date.date() != day) {
                    return null;
                }
            } else {
                date = baseDate.year(year != -1 ? year : baseDate.year())
                               .month(month != -1 ? month - 1 : baseDate.month())
                               .date(day != -1 ? day : baseDate.date())
                               .hours(hours)
                               .minutes(minutes)
                               .seconds(seconds)
                               .milliseconds(milliseconds);

                if ((year != -1 && date.year() != year)
                 || (month != -1 && date.month() != (month - 1))
                 || (day != -1 && date.date() != day)
                 || (hours != -1 && date.hours() != hours)
                 || (minutes != -1 && date.minutes() != minutes)
                 || (seconds != -1 && date.seconds() != seconds)
                 || (milliseconds != -1 && date.milliseconds() != milliseconds))
                    return null;
            }
            return date;
        }
    });

    DateTime.prototype = {
        year: function () {
            if (arguments.length == 0) {
                return this.value.getFullYear();
            }
            else if (arguments.length == 1) {
                this.value.setFullYear(arguments[0]);
            }
            else {
                this.value.setFullYear(arguments[0], arguments[1], arguments[2]);
            }

            return this;
        },

        timeOffset: function () {
            return this.value.getTimezoneOffset();
        },

        day: function () {
            return this.value.getDay();
        },

        toDate: function () {
            return this.value;
        },

        addMonth: function (value) {
            this.month(this.month() + value);
        },

        addYear: function (value) {
            this.year(this.year() + value);
        }
    };

    $.each(["Month", "Date", "Hours", "Minutes", "Seconds", "Milliseconds", "Time"], function (index, timeComponent) {
        DateTime.prototype[timeComponent.toLowerCase()] =
            function () {
                if (arguments.length == 1) {
                    this.value["set" + timeComponent](arguments[0]);
                }
                else {
                    return this.value["get" + timeComponent]();
                }

                return this;
            };
    });

    var formatters = {};

    (function() {
        var culture = CultureInfo,
            customFormatRegEx = /[0#?]/,
            standardFormats = {
                d: culture.shortDate,
                D: culture.longDate,
                F: culture.fullDateTime,
                g: culture.generalDateShortTime,
                G: culture.generalDateTime,
                m: culture.monthDay,
                M: culture.monthDay,
                s: culture.sortableDateTime,
                t: culture.shortTime,
                T: culture.longTime,
                u: culture.universalSortableDateTime,
                y: culture.monthYear,
                Y: culture.monthYear
            },
            numericPatterns = {
                numeric: {
                    negative: ['(n)', '-n', '- n', 'n-', 'n -']
                },
                currency: {
                    positive: ['*n', 'n*', '* n', 'n *'],
                    negative: ['(*n)', '-*n', '*-n', '*n-', '(n*)', '-n*', 'n-*', 'n*-', '-n *', '-* n', 'n *-', '* n-', '* -n', 'n- *', '(* n)', '(n *)']
                },
                percent: {
                    positive: ['n *', 'n*', '*n'],
                    negative: ['-n *', '-n*', '-*n']
                }
            };

        function formatDate(date, format) {
            var d = date.getDate(),
                day = date.getDay(),
                M = date.getMonth(),
                y = date.getFullYear(),
                h = date.getHours(),
                m = date.getMinutes(),
                s = date.getSeconds(),
                f = date.getMilliseconds();

            var dateFormatters = {
                d: d,
                dd: pad(d),
                ddd: culture.abbrDays[day],
                dddd: culture.days[day],

                M: M + 1,
                MM: pad(M + 1),
                MMM: culture.abbrMonths[M],
                MMMM: culture.months[M],

                yy: pad(y % 100),
                yyyy: y,

                h: h % 12 || 12,
                hh: pad(h % 12 || 12),
                H: h,
                HH: pad(h),

                m: m,
                mm: pad(m),

                s: s,
                ss: pad(s),

                f: Math.floor(f / 100),
                ff: Math.floor(f / 10),
                fff: f,

                tt: h < 12 ? culture.am : culture.pm
            };

            format = format in standardFormats ? standardFormats[format] : format;

            return format.replace(/d{1,4}|M{1,4}|yy(?:yy)?|([Hhmstf])\1*|"[^"]*"|'[^']*'/g, function (match) {
                return match in dateFormatters ? dateFormatters[match] : match.slice(1, match.length - 1);
            });
        }

        //number formatting
        function round(value, precision) {
            var power = Math.pow(10, precision || 0);
            return Math.round(value * power) / power;
        }

        function reverse(str) {
            return str.split('').reverse().join('');
        }

        function injectInFormat(val, format, appendExtras) {
            var i = 0, j = 0,
                fLength = format.length,
                vLength = val.length,
                builder = [];

            while (i < fLength && j < vLength && format.substring(i).search(customFormatRegEx) >= 0) {

                if (format.charAt(i).match(customFormatRegEx)){
                    builder.push(val.charAt(j++));
                } else {
                    builder.push(format.charAt(i));
                }

                i++;
            }

            if (j < vLength && appendExtras) {
                builder.push(val.substring(j));
            }
            if(i < fLength) {
                builder.push(format.substring(i));
            }

            var result = reverse(builder.join("")),
                zeroIndex;

            if (result.indexOf('#') > -1) {
                zeroIndex = result.indexOf('0');
            }

            if (zeroIndex > -1) {
                var first = result.slice(0, zeroIndex),
                    second = result.slice(zeroIndex, result.length);
                result = first.replace(/#/g, '') + second.replace(/#/g, '0');
            } else {
                result = result.replace(/#/g, '');
            }

            if (result.indexOf(',') == 0) {
                result = result.replace(/,/g, '');
            }

            return appendExtras ? result : reverse(result);
        }

        function lastIndexOf(value, character) {
            var characterLength = character.length;
            for (var i = value.length - 1; i > -1; i--){
                if (value.substr(i, characterLength) == character) {
                    return i;
                }
            }
            return -1;
        }

        function zeroPad (str, count, left) {
            for (var l = str.length; l < count; l++) {
                str = left ? ('0' + str) : (str + '0');
            }
            return str;
        }

        function addGroupSeparator (number, groupSeparator, groupSize) {
            if (groupSeparator && groupSize != 0) {
                var regExp = new RegExp('(-?[0-9]+)([0-9]{' + groupSize + '})');
                while (regExp.test(number)) {
                    number = number.replace(regExp, '$1' + groupSeparator + '$2');
                }
            }
            return number;
        }
        
        function formatNumber (number, format) {
            var type,
                customFormat,
                isCustomFormat,
                negativeFormat,
                zeroFormat,
                exponent,
                left,
                right,
                undefined,
                sign = number < 0;

            format = format.split(":");
            format = format.length > 1 ? format[1].replace("}", "") : format[0];
            isCustomFormat = format.search(customFormatRegEx) != -1;

            if (isCustomFormat) {
                format = format.split(";");
                customFormat = format[0];
                negativeFormat = format[1];
                zeroFormat = format[2];
                format = (sign && negativeFormat ? negativeFormat : customFormat).indexOf('%') != -1 ? "p" : "n";
            }

            switch (format.toLowerCase()) {
                case "d":
                    return Math.round(number).toString();
                case "c":
                    type = "currency"; break;
                case "n":
                    type = "numeric"; break;
                case "p":
                    type = "percent";
                    number = Math.abs(number) * 100;
                    break;
                default:
                    return number.toString();
            }

            var digits = culture[type + "decimaldigits"],
                separator = culture[type + "decimalseparator"],
                groupSeparator = culture[type + "groupseparator"],
                groupSize = culture[type + "groupsize"],
                negative = culture[type + "negative"],
                positive = culture[type + "positive"],
                symbol = culture[type + "symbol"];

            if (isCustomFormat) {
                var splits = (sign && negativeFormat ? negativeFormat : customFormat).split('.'),
                    leftF = splits[0],
                    rightF = splits.length > 1 ? splits[1] : '',
                    lastIndexZero = lastIndexOf(rightF, '0'),
                    lastIndexSharp = lastIndexOf(rightF, '#');
                digits = (lastIndexSharp > lastIndexZero ? lastIndexSharp : lastIndexZero) + 1;
            }

            var rounded = round(number, digits);
            number = isFinite(rounded) ? rounded : number;

            var split = number.toString().split(/e/i);
            exponent = split.length > 1 ? parseInt(split[1]) : 0;
            split = split[0].split('.');

            left = split[0];
            left = sign ? left.replace('-', '') : left;
            right = split.length > 1 ? split[1] : '';

            if (exponent) {
                if (!sign) {
                    right = zeroPad(right, exponent, false);
                    left += right.slice(0, exponent);
                    right = right.substr(exponent);
                } else {
                    left = zeroPad(left, exponent + 1, true);
                    right = left.slice(exponent, left.length) + right;
                    left = left.slice(0, exponent);
                }
            }

            var result,
                rightLength = right.length;

            if (digits < 1 || (isCustomFormat && lastIndexZero == -1 && rightLength === 0)){
                right = '';
            } else {
                right = rightLength > digits ? right.slice(0, digits) : zeroPad(right, digits, false);
            }

            if (isCustomFormat) {
                if (left == 0) {
                     left = '';
                }

                left = injectInFormat(reverse(left), reverse(leftF), true);
                left = leftF.indexOf(',') != -1 ? addGroupSeparator(left, groupSeparator, groupSize) : left;

                right = right && rightF ? injectInFormat(right, rightF) : '';

                if(number === 0 && zeroFormat) {
                    result = zeroFormat;
                } else {
                    result = (sign && !negativeFormat ? '-' : '') + left + (right.length > 0 ? separator + right : '');
                }
            } else {
                var pattern,
                    numberString,
                    patterns = numericPatterns[type];

                if(sign) {
                    pattern = patterns['negative'][negative];
                } else {
                    pattern = symbol ? patterns['positive'][positive] : null;
                }

                left = addGroupSeparator(left, groupSeparator, groupSize);
                numberString = left + (right.length > 0 ? separator + right : '');
                result = pattern ? pattern.replace('n', numberString).replace('*', symbol) : numberString;
            }
            return result;
        }

        extend(formatters, {
            date: formatDate,
            number: formatNumber
        });
    })();

    function format(fmt) {
        var values = arguments;

        return fmt.replace(/{(\d+)(:[^\}]+)?}/g, function(match, index, placeholderFormat) {
            var value = values[parseInt(index) + 1];

            return toString(value, placeholderFormat ? placeholderFormat.substring(1) : "");
        });
    }

    function toString(value, fmt) {
        var type = $.type(value);

        if (formatters[type] && fmt) {
            return formatters[type](value, fmt);
        }

        return value !== undefined ? value : "";
    }

    // feature detection
    (function() {
        var table = document.createElement("table");

        // Internet Explorer does not support setting the innerHTML of TBODY and TABLE elements
        try {
            table.innerHTML = "<tr><td></td></tr>";
            support.tbodyInnerHtml = true;
        } catch (e) {
            support.tbodyInnerHtml = false;
        }

        support.touch = "ontouchstart" in window;

        support.transitions = false;

        $.each([ 'Moz', 'webkit', 'O', 'ms' ], function () {
            var prefix = this;

            if (typeof table.style[prefix + 'Transition'] === 'string') {
                prefix = prefix.toLowerCase();

                support.transitions = {
                    css: '-' + prefix + '-',
                    event: (prefix === 'o' || prefix === 'webkit') ? prefix : ''
                }

                return false;
            }
        });
    })();

    function animate(element, options, duration, reverse, complete) {
        var effects = {};

        if (typeof options === "string") {
            // options is the list of effect names separated by space e.g. animate(element, "fadeIn slideDown")

            $.each(options.split(" "), function() {
                effects[this] = {};
            });

            // only callback is provided e.g. animate(element, options, function() {});
            if ($.isFunction(duration)) {
                complete = duration;
                duration = 400;
                reverse = false;
            } if (typeof duration === "boolean"){
                duration = 400;
                reverse = duration;
            }

            options = {
                effects: effects,
                duration: duration,
                reverse: reverse,
                complete: complete
            };
        }

        options = extend({
            //default options
            effects: {},
            duration: 400, //jQuery default duration
            reverse: false,
            complete: $.noop
        }, options);

        return element.queue(function () {
            var promises = [];

            // create a promise for each effect
            $.each(options.effects, function(effectName, settings) {
                var promise = $.Deferred(function(deferred) {
                    var effect = kendo.fx[effectName];

                    if (effect) {
                        settings.options = extend(settings.options, { 
                            complete: deferred.resolve
                        });

                        effect[options.reverse? "reverse" : "play"](element, settings.properties, settings.options);
                    } else {
                        deferred.resolve();
                    }
                }).promise();

                promises.push(promise);
            });

            //wait for all effects to complete
            $.when.apply(null, promises).then(function() {
                element.dequeue(); // call next animation from the queue
                options.complete(); // call the complete callback
            });
       });
    }

    $.fn.kendoAnimate = function(options, reverse, complete) {
        return animate(this, options, reverse, complete);
    };

    extend(kendo, {
        ui: {},
        fx: {},
        data: {},
        support: support,
        animate: animate,
        Observable: Observable,
        Template: Template,
        template: proxy(Template.compile, Template),
        stringify: proxy(JSON.stringify, JSON),
        format: format,
        formatters: formatters,
        CultureInfo: CultureInfo
    });

    // This is required for Internet Explorer as jQuery.extend will not copy toString properly
    kendo.toString = toString;

    function Component(element, options) {
        var that = this;

        Observable.call(that);

        that.element = $(element);
        that.options = extend(true, {}, that.options, options);
    }

    Component.prototype = new Observable();


    extend(kendo.ui, {
        Component: Component,
        plugin: function(name, component, base) {
            // copy the prototype of the component
            var proto = component.prototype;

            // replace it with the base prototype
            component.prototype = new base();

            // extend it with the original prototoype
            extend(component.prototype, proto);

            // expose it in the kendo.ui namespace
            kendo.ui[name] = component;

            name = "kendo" + name;
            // expose a jQuery plugin
            $.fn[name] = function(options) {
                $(this).each(function() {
                    var comp = new component(this, options);
                    $(this).data(name, comp);

                    comp.trigger("init");
                });
                return this;
            }
        }
    });
})(jQuery, window);
