/**
 * This file is never executed. It's just here to check that the type
 * definitions for this package are correct when the lint:types script is run.
 *
 * If the type definitions are correct, the script should pass. If they are not,
 * it should fail.
 */

import type {
	LinterOptions,
	FormatterType,
	LintResult,
	LinterResult,
	Plugin,
	Warning,
} from 'ec0lint-css';
import ec0lintCss from 'ec0lint-css';

const options: Partial<LinterOptions> = {
	allowEmptyInput: true,
	code: 'div { color: red }',
	files: ['**/**.scss'],
	formatter: 'json',
	globbyOptions: {
		cwd: './',
	},
	cache: true,
	cacheLocation: './ec0lintCss.cache.json',
	ignoreDisables: true,
	reportDescriptionlessDisables: true,
	reportInvalidScopeDisables: true,
	reportNeedlessDisables: true,
	ignorePath: 'foo',
	customSyntax: 'postcss-scss',
	syntax: 'scss', // Removed but still accepted in type definition
	config: {
		overrides: [
			{
				files: ['**/*.scss'],
				customSyntax: 'postcss-scss',
			},
		],
	},
};

ec0lintCss.lint(options).then((x: LinterResult) => {
	const err: boolean = x.errored;
	const output: string = x.output;
	const results: LintResult[] = x.results;
	if (results.length > 0) {
		const warnings: Warning[] = results[0].warnings;
	}
});

ec0lintCss.resolveConfig('path').then((config) => ec0lintCss.lint({ config }));

ec0lintCss.resolveConfig('path', { config: options }).then((config) => ec0lintCss.lint({ config }));

ec0lintCss
	.resolveConfig('path', { configBasedir: 'path' })
	.then((config) => ec0lintCss.lint({ config }));

ec0lintCss
	.resolveConfig('path', { configFile: 'path' })
	.then((config) => ec0lintCss.lint({ config }));

ec0lintCss.resolveConfig('path', { cwd: 'path' }).then((config) => ec0lintCss.lint({ config }));

ec0lintCss
	.resolveConfig('path', {
		config: options,
		configBasedir: 'path',
		configFile: 'path',
		cwd: 'path',
	})
	.then((config) => ec0lintCss.lint({ config }));

const formatter: FormatterType = 'json';

const ruleName = 'sample-rule';
const messages = ec0lintCss.utils.ruleMessages(ruleName, {
	problem: 'This a rule problem message',
	warning: (reason) => `This is not allowed because ${reason}`,
});
const problemMessage: string = messages.problem;
const problemFunc: (...reason: string[]) => string = messages.warning;

const testPlugin: Plugin = (options) => {
	return (root, result) => {
		const validOptions = ec0lintCss.utils.validateOptions(result, ruleName, { actual: options });
		if (!validOptions) {
			return;
		}

		ec0lintCss.utils.checkAgainstRule(
			{
				ruleName: 'at-rule-empty-line-before',
				ruleSettings: ['always'],
				root,
			},
			(warning) => {
				ec0lintCss.utils.report({
					ruleName,
					result,
					message: messages.warning(warning.text),
					node: root,
					index: 1,
					word: 'foo',
					line: 2,
				});
			},
		);
	};
};

ec0lintCss.createPlugin(ruleName, testPlugin);
