(function($) {
	var Plugin = function(_opt) {
		this.alert = null;
		this.container = null;
		this.cursor = null;
		this.opt = _opt;
		this.permitedKey = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '*', '/', '.', '+', '-', '%', '^', '(', ')'];
	};

	Plugin.prototype.init = function(e) {
		var _this = this;
		this.container = e.addClass(this.opt.id + '-container');

		_this.alert = $alert = $('<div class="' + this.opt.id + '-alert"></div>');
		$alert.appendTo(_this.container);

		e.unbind('click.' + this.opt.id + 'Handler').bind('click.' + this.opt.id + 'Handler', function(event) {
			event.preventDefault();
			_this.click({
				x: event.offsetX,
				y: event.offsetY
			})
		});

		$(document).unbind('keydown.' + this.opt.id + 'Handler').bind('keydown.' + this.opt.id + 'Handler', function(event) {
			if(_this.cursor.length > 0) {
				var keyCode = event.which;
				if(keyCode >= 96 && keyCode <= 105) {
					keyCode -= 48;
				} else if(keyCode == 8) {
					if(_this.cursor.length > 0 && _this.cursor.prev().length > 0) {
						_this.cursor.prev().remove();
					}
					return false;					
				} else if(keyCode == 46) {
					if(_this.cursor.length > 0 && _this.cursor.next().length > 0) {
						_this.cursor.next().remove();
					}
					return false;
				} else if(keyCode >= 37 && keyCode <= 40) {
					if(keyCode == 37) {
						if(_this.cursor.length > 0 && _this.cursor.prev().length > 0) {
							_this.cursor.insertBefore(_this.cursor.prev());
						}
					} else if(keyCode == 39) {
						if(_this.cursor.length > 0 && _this.cursor.next().length > 0) {
							_this.cursor.insertAfter(_this.cursor.next());
						}
					}
					return false;
				} else if(keyCode == 35 || keyCode == 36) {
					if (keyCode == 35) {
						if(_this.cursor.length > 0 && _this.container.children(':last').length > 0) {
							_this.cursor.insertAfter(_this.container.children(':last'));
						}
					} else if(keyCode == 36) {
						if(_this.cursor.length > 0 && _this.container.children(':first').length > 0) {
							_this.cursor.insertBefore(_this.container.children(':first'));
						}
					}
				}
				_this.keydown(keyCode.toString().toFormulaString(event.shiftKey), event.shiftKey);
			}
		});

		this.click({
			x: 0,
			y: 0
		});
	};

	Plugin.prototype.click = function(pos) {
		var _this = this;
		var $cursor = $('<div class="' + this.opt.id + '-cursor"></div>');
		this.container.find('.' + this.opt.id + '-cursor').remove();
		$cursor.appendTo(this.container);
		this.cursor = $cursor;

		var parentPos = {
			x: _this.container.offset().left,
			y: _this.container.offset().top
		}
		var checkArea = [];

		_this.container.children('*:not(".' + _this.opt.id + '-cursor, .' + _this.opt.id + '-alert")').each(function() {
			var $this = $(this);
			var condY = $this.offset().top - parentPos.y + $this.outerHeight();
			if(condY >= pos.y) {
				checkArea.push({
					x: $this.offset().left - parentPos.x,
					y: $this.offset().top - parentPos.y,
					e: $this
				});
			}
		});

		var maxY = 0, maxDiff = 10000;
		var $pointer = null;
		for(var idx in checkArea) {
			var check = checkArea[idx];
			if(check.y >= maxY && check.x < pos.x) {
				maxY = check.y;
				if(pos.x - check.x < maxDiff) {
					maxDiff = pos.x - check.x;
					$pointer = check.e;
				}
			} else {
				break;
			}
		}

		if($pointer != null) {
			_this.cursor.insertAfter($pointer);
		} else {
			if(maxY < pos.y) {
				_this.cursor.appendTo(_this.container);
			} else {
				_this.cursor.prependTo(_this.container);
			}
		}

		var loop = function() {
			setTimeout(function() {
				if($cursor.hasClass('inactive')) {
					$cursor.removeClass('inactive');
					$cursor.stop().animate({opacity: 1}, _this.opt.cursorAnimTime);
				} else {
					$cursor.addClass('inactive');
					$cursor.stop().animate({opacity: 0}, _this.opt.cursorAnimTime);
				}

				if($cursor.length > 0) {
					loop();
				}
			}, _this.opt.cursorDelayTime);
		};
		loop();
	};

	Plugin.prototype.keydown = function(key, shift) {
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
			8: '*',
			9: '('
		};

		if(shift && (key >= 0 && key <= 9)) {
			key = convert[key];
		}

		if((key >= 0 && key <= 9) || $.inArray(key, _this.permitedKey) != -1) {

			if((key >= 0 && key <= 9) || key == '.') {
				var $unit = $('<div class="formula-unit">' + key + '</div>');
				this.cursor.before($unit);
				if($unit.prev().length > 0 && $unit.prev().hasClass('formula-unit')) {
					var $prev = $unit.prev();
					$prev.append($unit[0].innerHTML);
					$prev.text($prev[0].innerHTML.toDecimal());
					$unit.remove();
				} else if($unit.next().length > 0 && $unit.next().hasClass('formula-unit')) {
					var $next = $unit.next();
					$next.append($unit[0].innerHTML);
					$next.text($next[0].innerHTML.toDecimal());
					$unit.remove();
				}
			} else if(key != '') {
				var $operator = $('<div class="formula-operator">' + key + '</div>');
				this.cursor.before($operator);
			}

			var formula = _this.getFormula();
			console.log(formula);
			try {
				eval(formula);
				_this.alert.text('Working good.').addClass('formula-alert-good').removeClass('formula-alert-error');
			} catch(e) {
				_this.alert.text('Syntax error.').removeClass('formula-alert-good').addClass('formula-alert-error');
			}
		}
	};

	Plugin.prototype.getFormula = function() {
		var _this = this;
		var formula = '';
		_this.container.children('*:not(".' + _this.opt.id + '-cursor, .' + _this.opt.id + '-alert")').each(function() {
			var $this = $(this);
			formula += ($this.data('value')? $this.data('value'):$this.text());
		});
		return formula;
	};

	String.prototype.toDecimal = function() {
		var split = this.split('.');
		return split[0].replace(/[^\d.]+/gi, '').replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (typeof split[1] !== 'undefined'? '.' + split[1]:'');
	};

	String.prototype.toFormulaString = function(shift) {
		var keyCode = this;
		if((keyCode == 187 && shift == true) || keyCode == 107) {
			return '+';
		} else if(keyCode == 189 || keyCode == 109) {
			return '-';
		} else if(keyCode == 190 || keyCode == 110) {
			return '.';
		} else if(keyCode == 191 || keyCode == 111) {
			return '/';
		} else {
			return String.fromCharCode(keyCode);
		}
	};

	$.fn.formula = function(_opt) {
		var opt = {
			id: 'formula',
			cursorAnimTime: 160,
			cursorDelayTime: 500
		};

		$.extend(opt, _opt);

		return this.each(function() {
			var $this = $(this);
			var plugin = new Plugin(opt);
			plugin.init($this);
		});
	};
} (jQuery));