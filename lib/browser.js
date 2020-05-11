'use strict';

const LazyResult = require('postcss/lib/lazy-result');
const postcss = require('postcss');
const postcssSafeParser = require('postcss-safe-parser');

const createPartialStylelintResult = require('./createPartialStylelintResult');
const jsonFormatter = require('./formatters/jsonFormatter');
const lintPostcssResult = require('./lintPostcssResult');
const normalizeAllRuleSettings = require('./normalizeAllRuleSettings');
const prepareReturnValue = require('./prepareReturnValue');

const postcssProcessor = postcss();

/** @typedef {import('stylelint').StylelintStandaloneOptions} StylelintStandaloneOptions */
/** @typedef {import('stylelint').StylelintStandaloneReturnValue} StylelintStandaloneReturnValue */
/** @typedef {import('stylelint').StylelintResult} StylelintResult */
/** @typedef {import('stylelint').StylelintInternalApi} StylelintInternalApi */

/**
 * @param {StylelintStandaloneOptions} options
 * @returns {Promise<StylelintStandaloneReturnValue>}
 */
async function lint(options) {
	if (!options.code) throw new Error('No code provided');

	if (!options.config) throw new Error('No config provided');

	let syntax;

	if (options.syntax) {
		throw new Error('You must use the customSyntax option');
	} else {
		syntax = cssSyntax(options);
	}

	if (options.customSyntax) {
		// ESM dynamic import used here. It will survive bundling and work in the browser...!
		const module = await import(options.customSyntax);
		syntax = module.default;
		console.log(`syntax is!`, syntax);
	}

	const postcssOptions = {
		syntax,
		from: undefined,
	};

	let cssResult;
	let stylelintResult /** @type StylelintResult */;

	try {
		const lazyResult = await new LazyResult(postcssProcessor, options.code, postcssOptions);

		cssResult = Object.assign(lazyResult, {
			stylelint: {
				ruleSeverities: {},
				customMessages: {},
				disabledRanges: {},
			},
		});

		const normalizedConfig = normalizeAllRuleSettings(options.config);

		await lintPostcssResult(options, cssResult, normalizedConfig);

		stylelintResult = createPartialStylelintResult(cssResult);
	} catch (error) {
		// This is equivalent to the `handleError` function in standalone.js
		if (error.name === 'CssSyntaxError') {
			stylelintResult = createPartialStylelintResult(undefined, error);
		} else {
			throw error;
		}
	}

	// TODO: this is mostly the same in standalone.js. Extract out?
	const postcssResult = stylelintResult._postcssResult;
	const returnValue = prepareReturnValue([stylelintResult], options, jsonFormatter);

	if (options.fix && postcssResult && !postcssResult.stylelint.ignored) {
		if (!postcssResult.stylelint.disableWritingFix) {
			if (!postcssResult.root) {
				throw new Error(
					'Missing postcssResult.opts.syntax or postcssResult.root. Unable to output fixed code.',
				);
			}

			// If we're fixing, the output should be the fixed code
			returnValue.output = postcssResult.root.toString(syntax);
		} else {
			// If the writing of the fix is disabled, the input code is returned as-is
			returnValue.output = options.code;
		}
	}

	return returnValue;
}

/**
 * @param {StylelintInternalApi} stylelint
 * @returns {Syntax}
 */
function cssSyntax(options) {
	return {
		parse: options.fix ? postcssSafeParser : postcss.parse,
		stringify: postcss.stringify,
	};
}

module.exports = lint;