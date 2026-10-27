// 実行: node --test tests/*.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const DU = require('../js/date-utils.js');

const d = (y, m, day) => ({ y, m, d: day });

test('仕様の例', () => {
  assert.equal(DU.diffDays(d(2026, 10, 26), d(2026, 10, 27)), 1);
  assert.equal(DU.diffDays(d(2026, 10, 27), d(2026, 10, 27)), 0);
  assert.equal(DU.diffDays(d(2026, 10, 28), d(2026, 10, 27)), -1);
});

test('閏年', () => {
  assert.equal(DU.isLeapYear(2024), true);
  assert.equal(DU.isLeapYear(1900), false);
  assert.equal(DU.isLeapYear(2000), true);
  assert.equal(DU.isLeapYear(2100), false);
  assert.equal(DU.diffDays(d(2024, 2, 28), d(2024, 3, 1)), 2);
  assert.equal(DU.diffDays(d(2023, 2, 28), d(2023, 3, 1)), 1);
  assert.equal(DU.diffDays(d(1900, 2, 28), d(1900, 3, 1)), 1);
  assert.equal(DU.diffDays(d(2000, 2, 28), d(2000, 3, 1)), 2);
  assert.equal(DU.diffDays(d(2024, 1, 1), d(2025, 1, 1)), 366);
  assert.equal(DU.diffDays(d(2025, 1, 1), d(2026, 1, 1)), 365);
  assert.equal(DU.diffDays(d(2000, 1, 1), d(2400, 1, 1)), 146097);
});

test('不正な日付は弾く', () => {
  assert.equal(DU.parseISODate('2023-02-29'), null);
  assert.equal(DU.parseISODate('2026-04-31'), null);
  assert.equal(DU.parseISODate('2026-13-01'), null);
  assert.equal(DU.parseISODate(''), null);
  assert.deepEqual(DU.parseISODate('2024-02-29'), d(2024, 2, 29));
  assert.deepEqual(DU.parseISODate('0001-01-01'), d(1, 1, 1));
});

test('曜日', () => {
  assert.equal(DU.weekdayJa(2026, 10, 27), '火');
  assert.equal(DU.weekdayJa(1970, 1, 1), '木');
  assert.equal(DU.weekdayJa(2000, 1, 1), '土');
  assert.equal(DU.weekdayJa(1, 1, 1), '月');
  assert.equal(DU.weekdayJa(2024, 2, 29), '木');
});

test('Date.UTC との突き合わせ（0001〜9999年の各年・各月の初日と末日）', () => {
  const ms = 86400000;
  const utc = (y, m, day) => { const t = new Date(0); t.setUTCFullYear(y, m - 1, day); return t.getTime() / ms; };
  for (let y = 1; y <= 9999; y++) {
    for (let m = 1; m <= 12; m++) {
      for (const day of [1, DU.daysInMonth(y, m)]) {
        assert.equal(DU.daysFromCivil(y, m, day), utc(y, m, day), `${y}-${m}-${day}`);
        assert.equal(DU.weekdayIndex(y, m, day), new Date(utc(y, m, day) * ms).getUTCDay());
      }
    }
  }
});
