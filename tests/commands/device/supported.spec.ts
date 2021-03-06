import { expect } from 'chai';
import { BalenaAPIMock } from '../../balena-api-mock';
import { cleanOutput, runCommand } from '../../helpers';

describe('balena devices supported', function() {
	let api: BalenaAPIMock;

	beforeEach(() => {
		api = new BalenaAPIMock();
	});

	afterEach(() => {
		// Check all expected api calls have been made and clean up.
		api.done();
	});

	it('should print help text with the -h flag', async () => {
		api.expectWhoAmI();
		api.expectMixpanel();

		const { out, err } = await runCommand('devices supported -h');

		expect(cleanOutput(out)).to.contain('$ balena devices supported');

		expect(err).to.eql([]);
	});

	it('should list currently supported devices, with correct filtering', async () => {
		api.expectWhoAmI();
		api.expectMixpanel();

		// TODO: Using the alias api.expect here causes route /config/vars to be called unexpectedly - why?
		api.scope
			.get('/device-types/v1')
			.replyWithFile(200, __dirname + '/device-types.api-response.json', {
				'Content-Type': 'application/json',
			});

		const { out, err } = await runCommand('devices supported');

		const lines = cleanOutput(out);

		expect(lines[0].replace(/  +/g, ' ')).to.equal('SLUG NAME');
		expect(lines).to.have.lengthOf.at.least(2);

		// Discontinued devices should be filtered out from results
		expect(lines.some(l => l.includes('DISCONTINUED'))).to.be.false;

		// Experimental devices should be listed as beta
		expect(lines.some(l => l.includes('EXPERIMENTAL'))).to.be.false;
		expect(lines.some(l => l.includes('BETA'))).to.be.true;

		expect(err).to.eql([]);
	});
});
