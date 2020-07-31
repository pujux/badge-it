const request = require('@aero/centra');

/**
 * Calculate how many years
 * User has been on Github.
 *
 * @param {string} user   - The name of user
 * @param {Object} config - The app config
 *
 * @returns {string} - The difference since account creation
 */
module.exports = async (user, { parsed: { GITHUB_ID: GITHUB_ID, GITHUB_TOKEN: GITHUB_TOKEN } }) => {
	const GITHUB_BASE = btoa(`${GITHUB_ID}:${GITHUB_TOKEN}`);
	const GITHUB_API = 'https://api.github.com';

	//* TODO: Figure out a way to maybe cache the result.
	const { created_at: creation } = await request(`${GITHUB_API}/users/${user}`, 'GET')
		.header({
			Authorization: `Basic ${GITHUB_BASE}`,
			'User-Agent': 'pufler-dev'
		}).json();

	return new Date().getFullYear()- new Date(creation).getFullYear();
}

/**
 * Convert a string to base64
 *
 * @param {string} string
 *
 * @returns {string}
 */

function btoa(string) {
	const binary = Buffer.from(string, 'utf8');
	return binary.toString('base64');
}
