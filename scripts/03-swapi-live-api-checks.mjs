import test from 'node:test';
import assert from 'node:assert/strict';
import { readAppFile } from './lib/app-inspector.mjs';

function getSwapiBaseUrl() {
  const callerSrc = readAppFile('src/react-query/utils/apiCallers.js');
  const match = callerSrc.match(/const\s+SWAPI_HOST\s*=\s*['"]([^'"]+)['"]/);
  assert.ok(match, 'Could not extract SWAPI_HOST from apiCallers.js');
  return match[1].replace(/\/+$/, '');
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  assert.equal(res.status, 200, `Expected HTTP 200 from ${url}, got ${res.status}`);
  return res.json();
}

test('SWAPI-01 [PASS]: Configured SWAPI host is reachable and returns Luke Skywalker & Darth Vader profile particulars', async () => {
  const baseUrl = getSwapiBaseUrl();
  const people = await fetchJson(`${baseUrl}/people/?page=1`);

  assert.ok(Array.isArray(people), 'Expected SWAPI /people response to be an array');
  assert.ok(people.length >= 2, 'Expected multiple Star Wars characters');

  const luke = people.find((p) => p.name === 'Luke Skywalker');
  const vader = people.find((p) => p.name === 'Darth Vader');

  assert.ok(luke, 'Luke Skywalker not found in SWAPI people');
  assert.ok(vader, 'Darth Vader not found in SWAPI people');

  for (const field of ['height', 'mass', 'birth_year', 'gender']) {
    assert.ok(luke[field], `Luke missing ${field}`);
    assert.ok(vader[field], `Darth Vader missing ${field}`);
  }
});

test('SWAPI-02 [PASS]: Configured SWAPI host returns starships with all fields expected by GroupDetailScreen', async () => {
  const baseUrl = getSwapiBaseUrl();
  const starships = await fetchJson(`${baseUrl}/starships/?page=1`);

  assert.ok(Array.isArray(starships), 'Expected SWAPI /starships response to be an array');
  assert.ok(starships.length > 0, 'Expected non-empty starships list');

  const sample = starships[0];
  const expectedFields = [
    'name',
    'model',
    'manufacturer',
    'cost_in_credits',
    'length',
    'max_atmosphering_speed',
    'crew',
    'passengers',
    'cargo_capacity',
  ];
  for (const field of expectedFields) {
    assert.ok(field in sample, `Starship payload missing field: ${field}`);
  }
});

test('SWAPI-03 [BUG-FUNC-13]: SwapiScreen server-side ?search= query actually filters results on SWAPI_HOST', async () => {
  const baseUrl = getSwapiBaseUrl();
  const searchResult = await fetchJson(`${baseUrl}/people/?search=vader`);

  // SwapiScreen passes /people/?search=${search} assuming server-side filtering like swapi.dev
  const allAreVader =
    Array.isArray(searchResult) &&
    searchResult.length > 0 &&
    searchResult.every((person) => person.name.toLowerCase().includes('vader'));

  assert.ok(
    allAreVader,
    `[BUG-FUNC-13] ${baseUrl}/people/?search=vader ignored the search query and returned ${searchResult.length} unfiltered records starting with "${searchResult[0]?.name}"`
  );
});

test('SWAPI-04 [BUG-FUNC-13b]: SwapiScreen handleLoadMore expects paginated object with data.next property', async () => {
  const baseUrl = getSwapiBaseUrl();
  const pageData = await fetchJson(`${baseUrl}/people/?page=1`);
  const swapiSrc = readAppFile('src/screens/SwapiScreen/index.js');

  assert.match(swapiSrc, /data\?\.next/, 'Expected SwapiScreen to check data?.next');
  assert.ok(
    !Array.isArray(pageData) && typeof pageData.next !== 'undefined',
    `[BUG-FUNC-13b] ${baseUrl}/people/?page=1 returns a flat array (${pageData.length} items) with data.next === undefined, breaking SwapiScreen pagination logic`
  );
});
