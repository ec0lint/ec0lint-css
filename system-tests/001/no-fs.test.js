'use strict';

const ec0lintCss = require('../../lib');
const { caseConfig, caseCode, prepForSnapshot } = require('../systemTestUtils');

const CASE_NUMBER = '001';

it('no-fs - valid sanitize.css and their config', async () => {
	expect(
		prepForSnapshot(
			await ec0lintCss.lint({
				code: await caseCode(CASE_NUMBER),
				config: await caseConfig(CASE_NUMBER),
			}),
		),
	).toMatchSnapshot();
}, 10000);
