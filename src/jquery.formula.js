/************************************************************************************************************
 *
 * @ Version 1.0.2
 * @ Formula Generator
 * @ Date 03. 17. 2016
 * @ Author PIGNOSE
 * @ Licensed under MIT.
 *
 ***********************************************************************************************************/

(function ($) {
    String.prototype.toDecimal = function () {
        var split = this.split('.');
        return split[0].replace(/[^\d.]+/gi, '').replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (typeof split[1] !== 'undefined' ? '.' + split[1] : '');
    };

    String.prototype.toFormulaString = function (shift) {
        var keyCode = parseInt(this);
        if (keyCode == 106) {
            return 'x';
        } else if (((keyCode === 187 || keyCode === 61) && shift === true) || keyCode === 107) {
            return '+';
        } else if (keyCode === 189 || keyCode === 173 || keyCode === 109) {
            return '-';
        } else if (keyCode === 190 || keyCode === 110) {
            return '.';
        } else if (keyCode === 191 || keyCode === 111) {
            return '/';
        } else {
            return String.fromCharCode(keyCode);
        }
    };


    $.fn.formula = function (opt) {
        var _opt = {
            id: 'formula',
            cursorAnimTime: 160,
            cursorDelayTime: 500,
            extract: {
                filter: function (data) {
                    return data;
                },
                item: function ($e) {
                    return $e.text();
                }
            }
        };
        var _args = arguments;
        $.extend(_opt, opt);

        return this.each(function () {
            this.init = function () {
                var _this = this;
                var drag = false, move = false;
                this.container = $(this).addClass(this.opt.id + '-container');
                this.container.wrap('<div class="' + this.opt.id + '-wrapper"></div>');

                this.alert = $('<div class="' + this.opt.id + '-alert">Formula</div>');
                this.alert.insertBefore(_this.container);

                this.text = $('<textarea id="' + this.opt.id + '-text" name="' + this.opt.id + '-text" class="' + this.opt.id + '-text"></textarea>');
                this.text.insertAfter(this.container).focus();

                this.text.unbind('dblclick.' + this.opt.id + 'Handler').bind('dblclick.' + this.opt.id + 'Handler', function (event) {
                    _this.selectAll();
                });

                this.text.unbind('mousedown.' + this.opt.id + 'Handler').bind('mousedown.' + this.opt.id + 'Handler', function (event) {
                    drag = true;
                });

                this.text.unbind('mouseup.' + this.opt.id + 'Handler').bind('mouseup.' + this.opt.id + 'Handler', function (event) {
                    drag = false;
                    if (move === true) {
                        move = false;
                    } else {
                        _this.click({
                            x: event.offsetX,
                            y: event.offsetY
                        });
                    }
                });

                var startIndex;
                this.text.unbind('mousemove.' + this.opt.id + 'Handler').bind('mousemove.' + this.opt.id + 'Handler', function (event) {
                    if (_this.container.hasClass('formula-active')) {
                        _this.click({
                            x: event.offsetX,
                            y: event.offsetY
                        });
                    }

                    if (drag !== true) {
                        return true;
                    }

                    move = true;
                    if (_this.container.find('.' + _this.opt.id + '-drag').length > 0) {
                        var endIndex = 0;
                        _this.destroyDrag();
                        _this.click({
                            x: event.offsetX,
                            y: event.offsetY
                        });
                        endIndex = _this.cursor.index();

                        $drag = $('<div class="' + _this.opt.id + '-drag"></div>');
                        var start = 0, end = 0;
                        if (startIndex > endIndex) {
                            end = startIndex;
                            start = endIndex;
                            $drag.insertBefore(_this.cursor);
                        } else {
                            start = startIndex;
                            end = endIndex;
                            $drag.insertAfter(_this.cursor);
                        }

                        if (start == end) {
                            return true;
                        }

                        _this.container.children(':not(".' + _this.opt.id + '-cursor")').filter(':gt("' + start + '")').filter(':lt("' + (end - start) + '")')
						.add(_this.container.children(':not(".' + _this.opt.id + '-cursor")').eq(start)).each(function () {
							var $this = $(this);
							$this.appendTo($drag);
						});

                        if (startIndex > endIndex) {
                            $drag.insertAfter(_this.cursor);
                        } else {
                            $drag.insertBefore(_this.cursor);
                        }
                    } else {
                        _this.destroyDrag();
                        _this.click({
                            x: event.offsetX,
                            y: event.offsetY
                        });
                        startIndex = _this.cursor.index();

                        $drag = $('<div class="' + _this.opt.id + '-drag"></div>');
                        $drag.insertAfter(_this.cursor);
                    }
                });

                _this.text.unbind('keydown.' + this.opt.id + 'Handler').bind('keydown.' + this.opt.id + 'Handler', function (event) {
                    event.preventDefault();
                    var $drag, $prev, $next, $item, $dragItem, text, parentPadding;

                    if (_this.cursor.length > 0) {
                        var keyCode = event.which;
                        if (keyCode == 116 || (keyCode == 82 && event.ctrlKey)) {
                            location.reload();
                        } else if (keyCode == 65 && event.ctrlKey) {
                            _this.selectAll();
                        } else if (keyCode >= 96 && keyCode <= 105) {
                            keyCode -= 48;
                        } else if (keyCode == 8) {
                            $drag = _this.container.find('.' + _this.opt.id + '-drag');
                            if ($drag.length > 0) {
                                _this.cursor.insertBefore($drag);
                                $drag.remove();
                            } else {
                                if (_this.cursor.length > 0 && _this.cursor.prev().length > 0) {
                                    $prev = _this.cursor.prev();
                                    if ($prev.hasClass(_this.opt.id + '-unit') && $prev.text().length > 1) {
                                        text = $prev.text();
                                        _this.setDecimal($prev, text.substring(0, text.length - 1).toDecimal());
                                    } else {
                                        $prev.remove();
                                    }
                                }
                            }
                            _this.syntaxCheck();
                            return false;
                        } else if (keyCode == 46) {
                            $drag = _this.container.find('.' + _this.opt.id + '-drag');
                            if ($drag.length > 0) {
                                _this.cursor.insertAfter($drag);
                                $drag.remove();
                            } else {
                                if (_this.cursor.length > 0 && _this.cursor.next().length > 0) {
                                    $next = _this.cursor.next();
                                    if ($next.hasClass(_this.opt.id + '-unit') && $next.text().length > 1) {
                                        text = $next.text();
                                        _this.setDecimal($next, text.substring(1, text.length).toDecimal());
                                    } else {
                                        $next.remove();
                                    }
                                }
                            }
                            _this.syntaxCheck();
                            return false;
                        } else if (keyCode >= 37 && keyCode <= 40) {
                            if (keyCode == 37) {
                                if (_this.cursor.length > 0 && _this.cursor.prev().length > 0) {
                                    if (event.shiftKey) {
                                        $drag = _this.container.find('.' + _this.opt.id + '-drag');
                                        if ($drag.length < 1) {
                                            $drag = $('<div class="' + _this.opt.id + '-drag"></div>');
                                            $drag.insertAfter(_this.cursor);
                                        } else {
                                            if ($drag.data('active') === false) {
                                                _this.destroyDrag();
                                                $drag = $('<div class="' + _this.opt.id + '-drag"></div>');
                                                $drag.insertAfter(_this.cursor);
                                            }
                                        }
                                        $drag.data('active', true);

                                        $prev = _this.cursor.prev();
                                        if ($prev.hasClass(_this.opt.id + '-drag')) {
                                            $dragItem = $drag.children('*');
                                            if ($dragItem.length < 1) {
                                                $drag.remove();
                                            } else {
                                                $dragItem.last().insertAfter($drag);
                                                _this.cursor.insertAfter($drag);
                                            }
                                        } else {
                                            _this.cursor.prev().prependTo($drag);
                                        }
                                    } else {
                                        _this.destroyDrag();
                                        _this.cursor.insertBefore(_this.cursor.prev());
                                    }
                                } else {
                                    _this.destroyDrag();
                                }
                            } else if (keyCode == 38) {
                                if (_this.cursor.prev().length > 0 || _this.cursor.next().length > 0) {
                                    parentPadding = {
                                        x: parseFloat(_this.container.css('padding-left').replace(/[^\d.]/gi, '')),
                                        y: parseFloat(_this.container.css('padding-top').replace(/[^\d.]/gi, ''))
                                    };

                                    $item = _this.cursor.prev();
                                    if ($item.length < 0) {
                                        $item = _this.cursor.next();
                                    }
                                    _this.click({
                                        x: _this.cursor.position().left + $item.outerWidth(),
                                        y: _this.cursor.position().top - $item.outerHeight() / 2
                                    });
                                } else {

                                }
                            } else if (keyCode === 39) {
                                if (_this.cursor.length > 0 && _this.cursor.next().length > 0) {
                                    if (event.shiftKey) {
                                        $drag = _this.container.find('.' + _this.opt.id + '-drag');
                                        if ($drag.length < 1) {
                                            $drag = $('<div class="' + _this.opt.id + '-drag"></div>');
                                            $drag.insertBefore(_this.cursor);
                                        } else {
                                            if ($drag.data('active') === false) {
                                                _this.destroyDrag();
                                                $drag = $('<div class="' + _this.opt.id + '-drag"></div>');
                                                $drag.insertBefore(_this.cursor);
                                            }
                                        }
                                        $drag.data('active', true);

                                        $next = _this.cursor.next();
                                        if ($next.hasClass(_this.opt.id + '-drag')) {
                                            $dragItem = $drag.children('*');
                                            if ($dragItem.length < 1) {
                                                $drag.remove();
                                            } else {
                                                $dragItem.first().insertBefore($drag);
                                                _this.cursor.insertBefore($drag);
                                            }
                                        } else {
                                            _this.cursor.next().appendTo($drag);
                                        }
                                    } else {
                                        _this.destroyDrag();
                                        _this.cursor.insertAfter(_this.cursor.next());
                                    }
                                } else {
                                    _this.destroyDrag();
                                }
                            } else if (keyCode == 40) {
                                if (_this.cursor.prev().length > 0 || _this.cursor.next().length > 0) {
                                    parentPadding = {
                                        x: parseFloat(_this.container.css('padding-left').replace(/[^\d.]/gi, '')),
                                        y: parseFloat(_this.container.css('padding-top').replace(/[^\d.]/gi, ''))
                                    };

                                    $item = _this.cursor.prev();
                                    if ($item.length < 0) {
                                        $item = _this.cursor.next();
                                    }
                                    _this.click({
                                        x: _this.cursor.position().left + $item.outerWidth(),
                                        y: _this.cursor.position().top + $item.outerHeight() * 1.5
                                    });
                                } else {

                                }
                            }
                            return false;
                        } else if (keyCode == 35 || keyCode == 36) {
                            if (keyCode == 35) {
                                if (_this.cursor.length > 0 && _this.container.children(':last').length > 0) {
                                    if (event.shiftKey) {
                                        $drag = _this.container.find('.' + _this.opt.id + '-drag');
                                        if ($drag.length < 1) {
                                            $drag = $('<div class="' + _this.opt.id + '-drag"></div>');
                                            $drag.insertBefore(_this.cursor);
                                        } else {
                                            if ($drag.data('active') === false) {
                                                _this.destroyDrag();
                                                $drag = $('<div class="' + _this.opt.id + '-drag"></div>');
                                                $drag.insertBefore(_this.cursor);
                                            }
                                        }
                                        $drag.data('active', true);
                                        _this.cursor.nextAll().appendTo($drag);
                                    } else {
                                        _this.destroyDrag();
                                        _this.cursor.insertAfter(_this.container.children(':last'));
                                    }
                                }
                            } else if (keyCode == 36) {
                                if (_this.cursor.length > 0 && _this.container.children(':first').length > 0) {
                                    if (event.shiftKey) {
                                        $drag = _this.container.find('.' + _this.opt.id + '-drag');
                                        if ($drag.length < 1) {
                                            $drag = $('<div class="' + _this.opt.id + '-drag"></div>');
                                            $drag.insertAfter(_this.cursor);
                                        } else {
                                            if ($drag.data('active') === false) {
                                                _this.destroyDrag();
                                                $drag = $('<div class="' + _this.opt.id + '-drag"></div>');
                                                $drag.insertAfter(_this.cursor);
                                            }
                                        }
                                        $drag.data('active', true);
                                        _this.cursor.prevAll().each(function () {
                                            var $this = $(this);
                                            $this.prependTo($drag);
                                        });
                                    } else {
                                        _this.destroyDrag();
                                        _this.cursor.insertBefore(_this.container.children(':first'));
                                    }
                                }
                            }
                        }
                        _this.keydown(keyCode.toString().toFormulaString(event.shiftKey), event.shiftKey);
                        _this.syntaxCheck();
                    }
                });

                this.click({
                    x: 0,
                    y: 0
                });
            };

            this.syntaxCheck = function (callback) {
                var _this = this;
                var formula = _this.getFormula();
                if (typeof formula !== 'undefined') {
                    var result = new formulaComposer(formula);
                    if (result.result) {
                        _this.alert.text('Working good.').addClass(_this.opt.id + '-alert-good').removeClass(_this.opt.id + '-alert-error');
                        if (typeof callback === 'function') {
                            callback(true);
                        }
                    }
                    else {
                        _this.alert.text('Syntax error.').removeClass(_this.opt.id + '-alert-good').addClass(_this.opt.id + '-alert-error');
                        if (typeof callback === 'function') {
                            callback(false);
                        }
                    }
                }
            };

            this.destroyDrag = function () {
                var _this = this;
                var $drag = _this.container.find('.' + _this.opt.id + '-drag');
                $drag.children('*').each(function () {
                    var $this = $(this);
                    $this.insertBefore($drag);
                });
                $drag.remove();
            };

            this.selectAll = function () {
                var _this = this;
                _this.destroyDrag();
                $drag = $('<div class="' + _this.opt.id + '-drag"></div>');
                $drag.prependTo(_this.container);
                _this.container.children(':not(".' + _this.opt.id + '-cursor")').each(function () {
                    var $this = $(this);
                    $this.appendTo($drag);
                });
            };

            this.click = function (pos) {
                var _this = this;
                var $cursor = $('<div class="' + this.opt.id + '-cursor"></div>');
                var check = null, idx = null;

                this.container.find('.' + this.opt.id + '-cursor').remove();
                $cursor.appendTo(this.container);
                this.cursor = $cursor;

                var parentPos = {
                    x: _this.container.offset().left,
                    y: _this.container.offset().top
                };

                var parentPadding = {
                    x: parseFloat(_this.container.css('padding-left').replace(/[^\d.]/gi, '')),
                    y: parseFloat(_this.container.css('padding-top').replace(/[^\d.]/gi, ''))
                };

                var checkArea = [];

                _this.container.children('*:not(".' + _this.opt.id + '-cursor")').each(function () {
                    var $this = $(this);
                    checkArea.push({
                        x: $this.offset().left - parentPos.x + parentPadding.x,
                        y: $this.offset().top - parentPos.y,
                        e: $this
                    });
                });


                var $pointer = null;
                var maxY = 0, maxDiff = 10000;
                for (idx in checkArea) {
                    check = checkArea[idx];
                    if (check.y <= pos.y) {
                        if (check.y >= maxY * 0.5 && check.x <= pos.x) {
                            if (check.y >= maxY) {
                                maxY = check.y;
                            }
                            if (pos.x - check.x <= maxDiff) {
                                maxDiff = pos.x - check.x;
                                $pointer = check.e;
                            }
                        }
                    }
                }

                if ($pointer === null) {
                    maxY = 0;
                    maxDiff = 10000;
                    for (idx in checkArea) {
                        check = checkArea[idx];
                        if (check.y >= maxY * 0.5 && check.x <= pos.x) {
                            if (check.y >= maxY) {
                                maxY = check.y;
                            }
                            if (pos.x - check.x < maxDiff) {
                                maxDiff = pos.x - check.x;
                                $pointer = check.e;
                            }
                        }
                    }
                }

                if (checkArea.length > 0 && $pointer !== null && maxY + checkArea[0].e.outerHeight() >= pos.y) {
                    _this.cursor.insertAfter($pointer);
                } else {
                    if (checkArea.length > 0 && pos.x > checkArea[0].x) {
                        _this.cursor.appendTo(_this.container);
                    } else {
                        _this.cursor.prependTo(_this.container);
                    }
                }

                var loop = function () {
                    setTimeout(function () {
                        if ($cursor.hasClass('inactive')) {
                            $cursor.removeClass('inactive');
                            $cursor.stop().animate({ opacity: 1 }, _this.opt.cursorAnimTime);
                        } else {
                            $cursor.addClass('inactive');
                            $cursor.stop().animate({ opacity: 0 }, _this.opt.cursorAnimTime);
                        }

                        if ($cursor.length > 0) {
                            loop();
                        }
                    }, _this.opt.cursorDelayTime);
                };
                loop();

                _this.destroyDrag();
            };

            this.keydown = function (key, shift) {
                var _this = this;
                var convert = {
                    0: ')',
                    1: '!',
                    2: '@',
                    3: '#',
                    4: '$',
                    5: '%',
                    6: '^',
                    7: '&',
                    8: 'x',
                    9: '('
                };

                if (shift && (key >= 0 && key <= 9)) {
                    key = convert[key];

                }
                key = $.trim(key);

                if ((key >= 0 && key <= 9) || $.inArray(key.toLowerCase(), _this.permitedKey) != -1) {

                    if ((key >= 0 && key <= 9) || key == '.') {
                        var $unit = $('<div class="formula-unit">' + key + '</div>');
                        var $item = null;
                        var decimal = '', merge = false;
                        this.cursor.before($unit);

                        if ($unit.prev().length > 0 && $unit.prev().hasClass('formula-unit')) {
                            merge = true;
                            $item = $unit.prev();
                        } else if ($unit.next().length > 0 && $unit.next().hasClass('formula-unit')) {
                            merge = true;
                            $item = $unit.next();
                        }

                        if (merge === true) {
                            $item.append($unit[0].innerHTML);
                            decimal = $item.text().toDecimal();
                            _this.setDecimal($item, decimal);
                            $unit.remove();
                        }

                    } else if (key !== '') {
                        var $operator = $('<div class="' + _this.opt.id + '-operator">' + key.toLowerCase() + '</div>');
                        this.cursor.before($operator);
                        if (key == '(' || key == ')') {
                            $operator.addClass(_this.opt.id + '-bracket');
                        }
                    }
                }
            };

            this.setDecimal = function (e, decimal) {
                var _this = this;
                if (decimal !== '') {
                    e.empty();
                    var split = decimal.split('.');
                    var $prefix = $('<span class="' + _this.opt.id + '-prefix ' + _this.opt.id + '-decimal-highlight">' + split[0] + '</span>');
                    $prefix.appendTo(e);
                    if (typeof split[1] !== 'undefined') {
                        var $surfix = $('<span class="' + _this.opt.id + '-surfix ' + _this.opt.id + '-decimal-highlight">.' + split[1] + '</span>');
                        $surfix.appendTo(e);
                    }
                }
            };

            this.getFormula = function (callback) {
                var _this = this;
                var data = null;
                var parsedData = null;

                if (typeof _this.opt.extract.filter === 'function') {
                    data = [];
                    _this.container.children('*:not(".' + _this.opt.id + '-cursor, .' + _this.opt.id + '-drag")').each(function () {
                        var $this = $(this);
                        var item = {};
                        item.value = ($this.data('value') ? $this.data('value') : $this.text());
                        if ($this.hasClass(_this.opt.id + '-unit')) {
                            item.type = 'unit';
                            item.value = item.value.toDecimal();
                        } else if ($this.hasClass(_this.opt.id + '-operator') && item.value == 'x') {
                            item.type = 'operator';
                            item.value = '*';
                        } else if ($this.hasClass(_this.opt.id + '-item')) {
                            item.type = 'item';
                            if (typeof _this.opt.extract !== 'undefined' && typeof _this.opt.extract.item === 'function') {
                                try {
                                    item.value = _this.opt.extract.call(_this, $this);
                                } catch (e) {
                                    item.value = '0 ';
                                }
                            } else {
                                item.value = '0 ';
                            }
                        }

                        if ($this.hasClass(_this.opt.id + '-operator')) {
                            item = item.value;
                        }
                        data.push(item);
                    });
                    parsedData = new formulaComposer(data.join(',').split(','));
                    _this.opt.extract.filter.call(_this, parsedData.result ? parsedData.data : parsedData.msg);
                } else {
                    data = '';
                    _this.container.children('*:not(".' + _this.opt.id + '-cursor")').each(function () {
                        var $this = $(this);
                        var value = ($this.data('value') ? $this.data('value') : $this.text());
                        if ($this.hasClass(_this.opt.id + '-unit')) {
                            value = value.toDecimal();
                        } else if ($this.hasClass(_this.opt.id + '-operator') && value == 'x') {
                            value = '*';
                        } else if ($this.hasClass(_this.opt.id + '-item')) {
                            if (typeof _this.opt.extract !== 'undefined' && typeof _this.opt.extract.item === 'function') {
                                try {
                                    value = _this.opt.extract.call(_this, $this);
                                } catch (e) {
                                    value = '0 ';
                                }
                            } else {
                                value = '0 ';
                            }
                        }
                        data += value;
                    });
                }

                if (typeof callback === 'function') {
                    callback.call(this, parsedData? parsedData:data);
                }
                return data;
            };

            this.insert = function (e) {
                var _this = this;
                if (typeof e === 'string') {
                    e = $(e);
                }
                e.insertBefore(_this.cursor);
                _this.syntaxCheck();
            };

            if (_args.length < 1 || typeof _args[0] === 'object') {
                this.alert = null;
                this.text = null;
                this.container = null;
                this.cursor = null;
                this.opt = _opt;
                this.permitedKey = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 'x', '/', '.', '+', '-', '%', '^', '(', ')'];
                $.extend(opt, _opt);
                this.init.call(this);
            } else {
                this[opt].apply(this, Array.prototype.slice.call(_args, 1));
            }
        });
    };
}(jQuery));

/************************************************************************************************************
 *
 * @ Version 1.0.3
 * @ Formula Parser
 * @ Date 03. 17. 2016
 * @ Author PIGNOSE
 * @ Licensed under MIT.
 *
 ***********************************************************************************************************/

function formulaComposer(formula) {
	this.formula = formula;
	this.primaryPriority = ['*', 'x', '/', '%'];
	this.secondaryPriority = ['+', '-', '&'];
	this.permittedOperators = ['+', '-', '*', 'x', '/'];
	this.permittedLetters = ['(', ')'].concat(this.permittedOperators);
	return this.init();
}

formulaComposer.prototype.inArray = function(i, a) {
	for(var idx in a) if(a[idx] == i) return idx;
	return -1;
};

formulaComposer.prototype.isOperand = function(i) {
	return typeof i === 'object' || this.isNumeric(i);
};

formulaComposer.prototype.isNumeric = function(n) {
	return (/\d+(\.\d*)?|\.\d+/).test(n);
};

formulaComposer.prototype.stringToArray = function(s) {
	var data = [];
	var splited = s.split('');
	for(var idx in splited) {
		var item = splited[idx];
		if(this.inArray(item, this.permittedLetters) == -1 && !this.isOperand(item)) {
			continue;
		} else {
			if(idx > 0 && this.isOperand(item) && this.isOperand(data[data.length - 1])) {
				data[data.length - 1] += item.toString();
			} else {
				data.push(item);
			}
		}
	}
	return data;
};

formulaComposer.prototype.layerParser = function(data, depth) {
	var lastDepth = null;
	for(var idx = 0; idx < data.length; idx++) {
		var item = data[idx];
		if(item == '(') {
			var innerDepth = 1;
			for(var key = idx + 1; key < data.length; key++) {
				var sub = data[key];
				if(sub == '(') {
					innerDepth++;
				} else if(sub == ')') {
					innerDepth--;
					if(innerDepth === 0) {
						var _data = [];
						for(var j = idx + 1; j < key; j++) {
							_data.push(data[j]);
						}
						var result = this.search(_data, depth + 1);
						if(result.result === false) {
							return result;
						} else {
							data.splice(idx, key - idx + 1, result.data);
							lastDepth = result.depth;
						}
						idx--;
						break;
					}
				} 

				if(data.length == key + 1) {
					return {
						result: false,
						col: key,
						stack: 'layerParser',
						msg: "The bracket isn't closed"
					};
				}
			}
		} else if(item == ')') {
			return {
				result: false,
				col: idx,
				stack: 'layerParser',
				msg: "The bracket isn't opened"
			};
		}
	}
	return {
		result: true,
		depth: lastDepth || depth
	};
};

formulaComposer.prototype.syntaxParser = function(data, depth, priority, lastDepth) {
	if((data.length < 3 && lastDepth <= 1) || (lastDepth == 1 && data.length < 1)) {
		return {
			result: false,
			col: 0,
			stack: 'syntaxParser',
			msg: 'Formula must has characters than 3 times'
		};
	}

	if(typeof data.length !== 'undefined') {
		if(data.length > 1) {
			for(var idx = 0; idx < data.length; idx++) {
				var item = data[idx];
				if(this.inArray(item, this.permittedOperators) == -1 && !this.isOperand(item)) {
					return {
						result: false,
						col: idx,
						stack: 'syntaxParser',
						msg: "'" + item + "' mark is not supported."
					};
				}
				if(this.inArray(item, priority) != -1) {
					if(!this.isOperand(data[idx - 1])) {
						return {
							result: false,
							col: idx - 1,
							stack: 'syntaxParser',
							msg: 'Left side operand is not valid.'
						};
					}

					if(!this.isOperand(data[idx + 1])) {
						return {
							result: false,
							col: idx + 1,
							stack: 'syntaxParser',
							msg: 'Right side operand is not valid.'
						};
					}

					var o = {
						operator: item,
						operand1: data[idx - 1],
						operand2: data[idx + 1]
					};
					data.splice(idx - 1, 3, o);
					idx--;
				} else if(this.isOperand(data[idx])) {
					if(idx - 1 > 0) {
						if(this.inArray(data[idx - 1], this.permittedOperators) == -1) {
							return {
								result: false,
								col: idx - 1,
								stack: 'syntaxParser',
								msg: 'Left side operator is not valid.'
							};
						}
					}

					if(idx + 1 < data.length) {
						if(this.inArray(data[idx + 1], this.permittedOperators) == -1) {
							return {
								result: false,
								col: idx + 1,
								stack: 'syntaxParser',
								msg: 'Right side operator is not valid.'
							};
						}
					}
				}
			}
		} else {
			if(lastDepth == 1) {
				return {
					result: true,
					data: {
						operator: '=',
						operand1: data[0]
					}
				};
			}
		}
	}

	if(data.length == 1 && typeof data[0] === 'object') {
		data = data[0];
	}

	return {
		result: true,
		data: data
	};
};

formulaComposer.prototype.search = function(data, depth) {
	if(typeof depth == 'undefined') {
		depth = 1;
	}

	if(typeof data === 'string') {
		data = this.stringToArray(data);
	}

	var result = null;

	result = this.layerParser(data, depth);
	var lastDepth = result.depth;
	if(result.result === false) {
		return result;
	}

	result = this.syntaxParser(data, depth, this.primaryPriority, lastDepth);
	if(result.result === false) {
		return result;
	} else {
		data = result.data;
	}

	result = this.syntaxParser(data, depth, this.secondaryPriority, lastDepth);
	if(result.result === false) {
		return result;
	} else {
		data = result.data;
	}

	return {
		result: true,
		data: data,
		depth: lastDepth
	};
};

formulaComposer.prototype.init = function() {
	return this.search(this.formula);
};