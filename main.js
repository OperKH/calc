'use strict';
(() => {
	const [ screen ] = document.getElementsByClassName('screen');
	const [ lastCalculationEl ] = screen.getElementsByClassName('last-calculation');
	const [ lastOperatorEl ] = screen.getElementsByClassName('last-operator');
	const [ resultEl ] = screen.getElementsByClassName('row2');
	const [ keyboard ] = document.getElementsByClassName('keyboard');
	const validButtonsRegExp = /^[\d\.=\+\-\*\/]$/;
	const operatorButtonRegExp = /^[\+\-\*\/]$/;
	const operandButtonRegExp = /^[\d\./]$/;
	const equalButtonRegExp = /^=$/;

	let lastCalculation = null;
	let lastOperator = '';
	let result = null;

	init();

	function init() {
		document.addEventListener('keydown', e => {
			const { key } = e;
			if (key === 'Enter') {
				e.preventDefault();
			}
			emulateButtonAction(key, true);
		});
		document.addEventListener('keyup', ({key}) => {
			emulateButtonAction(key, false);
		});
		keyboard.addEventListener('click', ({target}) => {
			if (!target.classList.contains('key')) {
				return;
			}
			processButton(target.value);
		});
		render();
	}

	function emulateButtonAction(key, isDown) {
		const buttonValue = getButtonValueByKey(key);
		if (!validButtonsRegExp.test(buttonValue)) {
			return;
		}
		const [ calcButton ] = keyboard.querySelectorAll(`[value="${buttonValue}"]`);
		if (isDown) {
			calcButton.classList.add('hover', 'active');
		} else {
			calcButton.classList.remove('hover', 'active');
			processButton(buttonValue);
		}
	}

	function processButton(buttonValue) {
		switch (true) {
			case operatorButtonRegExp.test(buttonValue):
				processOperatorButton(buttonValue);
				break;
			case operandButtonRegExp.test(buttonValue):
				processOperandButton(buttonValue);
				break;
			case equalButtonRegExp.test(buttonValue):
				processEqualButton(buttonValue);
				break;
		}
		render();
	}

	function processOperatorButton(buttonValue) {
		if (result) {
			lastCalculation = lastCalculation ? eval(`${lastCalculation} ${lastOperator} ${parseFloat(result)}`) : result;
			result = null;
		}
		lastOperator = buttonValue;
	}
	function processOperandButton(buttonValue) {
		if (buttonValue === '.' && String(result).includes('.')) {
			return;
		}
		const isLastOperatorEqual = equalButtonRegExp.test(lastOperator);
		if (!isLastOperatorEqual && result && String(result).length < 8) {
			result += buttonValue;
		} else if (!result) {
			result = buttonValue;
		} else if (isLastOperatorEqual) {
			result = buttonValue;
			lastOperator = null;
		}
		result = result.replace(/^00/, '0');
	}
	function processEqualButton(buttonValue) {
		if (!lastCalculation) {
			lastOperator = buttonValue;
			return;
		}
		result = result ? eval(`${lastCalculation} ${lastOperator} ${parseFloat(result)}`) : lastCalculation;
		lastCalculation = null;
		lastOperator = buttonValue;
	}

	function render() {
		lastCalculationEl.textContent = equalButtonRegExp.test(lastOperator) ? 'result' : limitOutput(lastCalculation);
		lastOperatorEl.textContent = lastOperator || '\xa0';
		resultEl.textContent = limitOutput(result);
	}

	function limitOutput(num) {
		let output = num;
		if (isFinite(num)) {
			const isInteger = Number.isInteger(Number(num));
			if ( Math.abs(num) > 99999999) {
				output = 'big num';
			} else if (!isInteger) {
				const sign = num < 0 ? -1 : 1;
				output = parseFloat(String(num).slice(0, 8)) * sign;
			}
		}
		return output;
	}

	function getButtonValueByKey(key) {
		switch (key) {
			case 'Enter':
				return '=';
			case ',':
				return '.';
			default:
			return key;
		}
	}
})();
