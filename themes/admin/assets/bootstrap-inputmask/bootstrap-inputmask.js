/* ===========================================================
 * bootstrap-inputmask.js j2
 * http://twitter.github.com/bootstrap/javascript.html#tooltips
 * Based on Masked Input plugin by Josh Bush (digitalbush.com)
 * ===========================================================
 * Copyright 2012 Jasny BV, Netherlands.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

!function ($) {

    "use strict"; // jshint ;_;

    var isIphone = (window.orientation !== undefined),
            isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1


    /* INPUTMASK PUBLIC CLASS DEFINITION
     * ================================= */

    var Inputmask = function (element, options) {
        if (isAndroid)
            return; // No support because caret positioning doesn't work on Android

        this.$element = $(element);
        this.options = $.extend({}, $.fn.inputmask.defaults, options);
        this.mask = String(options.mask);

        this.init();
        this.listen();

        this.checkVal(); //Perform initial check for existing values
    }

    Inputmask.prototype = {
        init: function () {
            var defs = this.options.definitions
            var len = this.mask.length

            this.tests = []
            this.partialPosition = this.mask.length
            this.firstNonMaskPos = null

            // maskChars must include placeholder char
            if (this.options.placeholder && $.inArray(this.options.placeholder, this.options.maskChars) === -1) {
                this.options.maskChars += this.options.placeholder;
            }

            $.each(this.mask.split(""), $.proxy(function (i, c) {
                if (c == '?') {
                    len--
                    this.partialPosition = i
                } else if (defs[c]) {
                    this.tests.push(new RegExp(defs[c]))
                    if (this.firstNonMaskPos === null)
                        this.firstNonMaskPos = this.tests.length - 1
                } else {
                    this.tests.push(null);
                    // append c to maskChars, seperator also a mask char
                    if ($.inArray(c, this.options.maskChars) === -1) {
                        this.options.maskChars += c;
                    }
                }
            }, this));

            this.buffer = $.map(this.mask.split(""), $.proxy(function (c, i) {
                if (c != '?')
                    return defs[c] ? this.options.placeholder : c
            }, this))

            if (this.options.reverse) {
                // clone array for the first time, don't use reference so we make it mess
                this.reverseBuffer = this.buffer.slice();
            }
            this.focusText = this.$element.val();



            // what you see is not what you get :D
            if (!this.options.rawValue) {
                var that = this;
                // fake by other input
                this.$element.after('<input type="hidden" name="' + this.$element.attr('name') + '"/>');
                this.$element.removeAttr('name');
                that.$element.next().val(this.focusText).change(function () {
                    that.$element.val(this.value);
                    that.focusEvent();
                });
            }

            this.$element.data("rawMaskFn", $.proxy(function () {
                return $.map(this.buffer, function (c, i) {
                    return this.tests[i] && c != this.options.placeholder ? c : null
                }).join('')
            }, this));

        },
        listen: function () {
            if (this.$element.attr("readonly"))
                return

            var pasteEventName = (navigator.userAgent.match(/msie/i) ? 'paste' : 'input') + ".mask"

            this.$element
                    .on("unmask", $.proxy(this.unmask, this))

                    .on("focus.mask", $.proxy(this.focusEvent, this))
                    .on("blur.mask", $.proxy(this.blurEvent, this))

                    .on("keydown.mask", $.proxy(this.keydownEvent, this))
                    .on("keypress.mask", $.proxy(this.keypressEvent, this))

                    .on(pasteEventName, $.proxy(this.pasteEvent, this))
        },
        //Helper Function for Caret positioning
        caret: function (begin, end) {
            if (this.$element.length === 0)
                return
            if (typeof begin == 'number') {
                end = (typeof end == 'number') ? end : begin
                return this.$element.each(function () {
                    if (this.setSelectionRange) {
                        this.setSelectionRange(begin, end)
                    } else if (this.createTextRange) {
                        var range = this.createTextRange()
                        range.collapse(true)
                        range.moveEnd('character', end)
                        range.moveStart('character', begin)
                        range.select()
                    }
                })
            } else {
                if (this.$element[0].setSelectionRange) {
                    begin = this.$element[0].selectionStart
                    end = this.$element[0].selectionEnd
                } else if (document.selection && document.selection.createRange) {
                    var range = document.selection.createRange()
                    begin = 0 - range.duplicate().moveStart('character', -100000)
                    end = begin + range.text.length
                }
                return {
                    begin: begin,
                    end: end
                }
            }
        },
        seekNext: function (pos) {
            var len = this.mask.length
            while (++pos <= len && !this.tests[pos])
                ;

            return pos
        },
        seekPrev: function (pos) {
            while (--pos >= 0 && !this.tests[pos])
                ;

            return pos;
        },
        shiftL: function (begin, end) {
            var len = this.mask.length;

            if (begin < 0)
                return;

            for (var i = begin, j = this.seekNext(end); i < len; i++) {
                if (this.tests[i]) {
                    if (j < len && this.tests[i].test(this.buffer[j])) {
                        this.buffer[i] = this.buffer[j];
                        this.buffer[j] = this.options.placeholder;
                    } else
                        break
                    j = this.seekNext(j);
                }
            }
            this.writeBuffer();
            this.caret(Math.max(this.firstNonMaskPos, begin));
        },
        shiftR: function (pos) {
            var len = this.mask.length;

            for (var i = pos, c = this.options.placeholder; i < len; i++) {
                if (this.tests[i]) {
                    var j = this.seekNext(i);
                    var t = this.buffer[i];
                    this.buffer[i] = c;
                    if (j < len && this.tests[j].test(t))
                        c = t;
                    else
                        break;
                }
            }
        },
        unmask: function () {
            this.$element
                    .unbind(".mask")
                    .removeData("inputmask")
        },
        focusEvent: function () {
            this.focusText = this.$element.val();
            var len = this.mask.length;
            var pos = this.checkVal();
            this.writeBuffer();
            var that = this;
            var moveCaret = function () {
                if (pos == len)
                    that.caret(0, pos);
                else
                    that.caret(pos);
            }

            if ($.browser.msie)
                moveCaret();
            else
                setTimeout(moveCaret, 0);
        },
        blurEvent: function () {
            this.checkVal();
            if (this.$element.val() != this.focusText)
                this.$element.trigger('change')
        },
        keydownEvent: function (e) {
            var k = e.which

            //backspace, delete, and escape get special treatment
            if (k == 8 || k == 46 || (isIphone && k == 127)) {
                var pos = this.caret(),
                        begin = pos.begin,
                        end = pos.end

                if (end - begin === 0) {
                    begin = k != 46 ? this.seekPrev(begin) : (end = this.seekNext(begin - 1))
                    end = k == 46 ? this.seekNext(end) : end
                }
                this.clearBuffer(begin, end)
                this.shiftL(begin, end - 1)

                return false
            } else if (k == 27) {//escape
                this.$element.val(this.focusText)
                this.caret(0, this.checkVal())
                return false
            }
        },
        keypressEvent: function (e) {
            var len = this.mask.length

            var k = e.which,
                    pos = this.caret()

            if (e.ctrlKey || e.altKey || e.metaKey || k < 32) {//Ignore
                return true
            } else if (k) {
                if (pos.end - pos.begin !== 0) {
                    this.clearBuffer(pos.begin, pos.end)
                    this.shiftL(pos.begin, pos.end - 1)
                }
                var p = 0;
                // always write at the end?
                if (this.options.reverse) {
                    var count = 0;
                    var reverseTest = this.options.showMask ? this.reverseBuffer : this.$element.val().split('');

                    for (var i = 0; i < pos.begin; i++) {
                        if ($.inArray(reverseTest[i], this.options.maskChars) === -1) {
                            count++;
                        }
                    }


                    if (count !== 0) {
                        for (p = 0; p < len; p++) {
                            if (this.tests[p] && $.inArray(this.buffer[p], this.options.maskChars) === -1) {
                                count--;
                                if (count <= 0) {
                                    p++;
                                    break;
                                }
                            }

                        }
                    }

                    p = Math.max(0, p);
                    p = this.seekNext(p - 1);


                } else {
                    p = this.seekNext(pos.begin - 1);
                }
                if (p < len) {
                    var c = String.fromCharCode(k);

                    if (this.tests[p].test(c)) {
                        this.shiftR(p)
                        this.buffer[p] = c
                        this.writeBuffer()
                        var next = this.seekNext(p)
                        this.caret(next);
                    }
                }
                return false
            }
        },
        pasteEvent: function () {
            var that = this

            setTimeout(function () {
                that.caret(that.checkVal(true))
            }, 0)
        },
        clearBuffer: function (start, end) {
            var len = this.mask.length

            for (var i = start; i < end && i < len; i++) {
                if (this.tests[i])
                    this.buffer[i] = this.options.placeholder
            }
        },
        writeBuffer: function () {
            var writeVal = '';
            if (this.options.reverse) {
                // shift value but not mark :D
                var len = this.buffer.length;


                // find distance to shift right
                var distance = -1;
                for (var i = len - 1; i >= 0; i--) {
                    // not place holder, not a mask
                    if (this.tests[i] && $.inArray(this.buffer[i], this.options.maskChars) === -1) {
                        distance = len - 1 - i;
                        break;
                    }
                }

                // just copy
                if (distance === 0) {
                    // copy buffer
                    for (var i = 0; i < len; i++) {
                        this.reverseBuffer[i] = this.buffer[i];
                    }
                }
                // empty value do nothing
                else {

                    // init new buffer but remain mask
                    for (var i = 0; i < len; i++) {
                        if (this.tests[i])
                            this.reverseBuffer[i] = this.options.placeholder
                        else
                            this.reverseBuffer[i] = this.buffer[i];
                    }

                    if (distance !== -1) {

                        // collect value
                        var rawBuffer = [];
                        for (var i = 0; i < len - distance; i++) {
                            if (this.tests[i] && $.inArray(this.buffer[i], this.options.maskChars) === -1) {
                                rawBuffer.push(this.buffer[i]);
                            }
                        }

                        // assign value again
                        for (var i = distance; i < len; i++) {
                            // ignore place holder
                            if (this.tests[i]) {
                                // if char is place holder then can be replace
                                this.reverseBuffer[i] = rawBuffer.shift();
                            }
                        }
                    }
                }


                writeVal = this.reverseBuffer.join('');
            } else {
                writeVal = this.buffer.join('');
            }


            // remove mask if empty value
            if (!this.options.showMask) {
                // at the start
                while ($.inArray(writeVal.charAt(0), this.options.maskChars) !== -1) {
                    writeVal = writeVal.substring(1);
                }

                // at the end
                while ($.inArray(writeVal.charAt(writeVal.length - 1), this.options.maskChars) !== -1) {
                    writeVal = writeVal.substring(0, writeVal.length - 1);
                }
            }

            if (!this.options.rawValue) {
                var rawValue = '';
                for (var i = 0; i < writeVal.length; i++) {
                    if ($.inArray(writeVal[i], this.options.maskChars) === -1) {
                        rawValue += writeVal[i];
                    }
                }
                this.$element.next().val(rawValue);
            }

            return this.$element.val(writeVal).val();
        },
        checkVal: function (allow) {
            // default should mark by this
            if (allow === undefined) {
                // empty placeholder allow remain value
                allow = !this.options.matchExact || this.options.placeholder === '';
            }

            var len = this.mask.length
            //try to place characters where they belong
            var test = this.$element.val()
            var lastMatch = -1

            for (var i = 0, pos = 0; i < len; i++) {
                if (this.tests[i]) {
                    this.buffer[i] = this.options.placeholder
                    while (pos++ < test.length) {
                        var c = test.charAt(pos - 1)
                        if (this.tests[i].test(c)) {
                            this.buffer[i] = c
                            lastMatch = i
                            break
                        }
                    }
                    if (pos > test.length)
                        break
                } else if (this.buffer[i] == test.charAt(pos) && i != this.partialPosition) {
                    pos++
                    lastMatch = i
                }
            }
            if (!allow && lastMatch + 1 < this.partialPosition) {
                this.$element.val("")
                this.clearBuffer(0, len)
            } else if (allow || lastMatch + 1 >= this.partialPosition) {
                this.writeBuffer()
                if (!allow)
                    this.$element.val(this.$element.val().substring(0, lastMatch + 1))
            }
            return (this.partialPosition ? i : this.firstNonMaskPos)
        }
    }


    /* INPUTMASK PLUGIN DEFINITION
     * =========================== */

    $.fn.inputmask = function (options) {
        return this.each(function () {
            var $this = $(this)
                    , data = $this.data('inputmask')
            if (!data)
                $this.data('inputmask', (data = new Inputmask(this, options)))
        })
    }

    $.fn.inputmask.defaults = {
        maskChars: ":-.()/,_ +",
        matchExact: false,
        reverse: false,
        showMask: false,
        mask: "",
        rawValue: false, // post the same value, and remain the same value without change it automatically
        placeholder: "_",
        definitions: {
            '9': "[0-9]",
            'a': "[A-Za-z]",
            '?': "[A-Za-z0-9]",
            '*': "."
        }
    }

    $.fn.inputmask.Constructor = Inputmask;

    // helper function, just for mask
    $.fn.maskVal = function (val) {
        return this.prev().focus().select()
                .trigger({type: 'keypress', which: 46, keyCode: 46}).end().val(val).change();
    };


    /* INPUTMASK DATA-API
     * ================== */

    $(document).on('focus.inputmask.data-api', '[data-mask]', function (e) {
        var $this = $(this)
        if ($this.data('inputmask'))
            return
        e.preventDefault();
        $this.inputmask($this.data())
    });

    $(function () {

        // auto for mask that don't represent raw values
        function autoInit() {
            // only raw value we return, else we init it automatically
            var $this = $(this);
            if ($this.attr('data-raw-value')) {
                return;
            }
            var $this = $(this)
            if ($this.data('inputmask'))
                return;
            $this.inputmask($this.data());
        }

        // init the first time
        $('[data-mask]').each(autoInit);

        // init for the new nodes
        if (App.Track.options.isAnimationSupported) {

            App.Track.listenNewNode('[data-mask]', autoInit);
        }
    });

}(window.jQuery);
