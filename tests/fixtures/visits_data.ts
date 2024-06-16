
const monthYear = new Date().toISOString().split('-').slice(0, 2).join('-');

const data = [
    { timestamp: `${monthYear}-21T01:00:00.000Z`, ip_address: '1.2.3.4', platform: 'something', version: 'someversion', os: 'linux', browser: 'chrome', path: 'page1' },
    { timestamp: `${monthYear}-21T02:00:00.000Z`, ip_address: '1.2.3.5', platform: 'something', version: 'someversion', os: 'linux', browser: 'chrome', path: 'page2' },
    { timestamp: `${monthYear}-21T02:00:00.000Z`, ip_address: '1.2.3.4', platform: 'something', version: 'someversion', os: 'mac', browser: 'chrome', path: 'page3' },
    { timestamp: `${monthYear}-22T03:00:00.000Z`, ip_address: '1.2.3.4', platform: 'something', version: 'someversion', os: 'linux', browser: 'chrome', path: 'page1' },
    { timestamp: `${monthYear}-22T02:00:00.000Z`, ip_address: '1.2.3.4', platform: 'something', version: 'someversion', os: 'linux', browser: 'chrome', path: 'page1' },
    { timestamp: `${monthYear}-26T04:00:00.000Z`, ip_address: '1.2.3.4', platform: 'something', version: 'someversion', os: 'linux', browser: 'chrome', path: 'page1' },
    { timestamp: `${monthYear}-22T01:00:00.000Z`, ip_address: '1.2.3.4', platform: 'something', version: 'someversion', os: 'linux', browser: 'chrome', path: 'page4' },
    { timestamp: `${monthYear}-21T01:00:00.000Z`, ip_address: '1.2.3.4', platform: 'something', version: 'someversion', os: 'linux', browser: 'chrome', path: 'page1' },
    { timestamp: `${monthYear}-24T01:00:00.000Z`, ip_address: '1.2.3.4', platform: 'something', version: 'someversion', os: 'linux', browser: 'chrome', path: 'page2' },
    { timestamp: `${monthYear}-26T01:00:00.000Z`, ip_address: '1.2.3.4', platform: 'something', version: 'someversion', os: 'linux', browser: 'explorer', path: 'page1' }
];

export = {
    monthYear,
    data
}
