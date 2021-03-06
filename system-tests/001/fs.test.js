'use strict';

const ec0lintCss = require('../../lib');
const { caseConfigFile, caseFiles, prepForSnapshot } = require('../systemTestUtils');

const CASE_NUMBER = '001';

it('fs - valid sanitize.css and their config', async () => {
	expect(
		prepForSnapshot(
			await ec0lintCss.lint({
				files: caseFiles(CASE_NUMBER),
				configFile: caseConfigFile(CASE_NUMBER),
			}),
		),
	).toMatchSnapshot();
}, 10000);
