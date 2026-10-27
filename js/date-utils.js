/*
 * 日付計算ユーティリティ
 *
 * JavaScript の Date はタイムゾーン・夏時間・0〜99年の扱い（1900年代に
 * 解釈される）などの落とし穴があるため、ここでは使わない。
 * 代わりに先発グレゴリオ暦の「通日（1970-01-01 を 0 とする日数）」を
 * 整数演算だけで求め、その差を取ることで閏年を含めて正確に計算する。
 * アルゴリズム: Howard Hinnant "days_from_civil"
 */
(function (global) {
  'use strict';

  var WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土'];

  function isLeapYear(y) {
    return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  }

  function daysInMonth(y, m) {
    if (m === 2) return isLeapYear(y) ? 29 : 28;
    return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
  }

  function isValidDate(y, m, d) {
    return Number.isInteger(y) && Number.isInteger(m) && Number.isInteger(d) &&
      m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(y, m);
  }

  // 1970-01-01 からの日数（負の値もあり）
  function daysFromCivil(y, m, d) {
    y -= m <= 2 ? 1 : 0;
    var era = Math.floor(y / 400);
    var yoe = y - era * 400;                                    // [0, 399]
    var mp = (m + 9) % 12;                                      // 3月始まり [0, 11]
    var doy = Math.floor((153 * mp + 2) / 5) + d - 1;           // [0, 365]
    var doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy; // [0, 146096]
    return era * 146097 + doe - 719468;
  }

  // 0 = 日曜日 … 6 = 土曜日（1970-01-01 は木曜日）
  function weekdayIndex(y, m, d) {
    var n = daysFromCivil(y, m, d);
    return ((n % 7) + 7 + 4) % 7;
  }

  function weekdayJa(y, m, d) {
    return WEEKDAYS_JA[weekdayIndex(y, m, d)];
  }

  // from から to までの日数（to が前なら負）
  function diffDays(from, to) {
    return daysFromCivil(to.y, to.m, to.d) - daysFromCivil(from.y, from.m, from.d);
  }

  // "YYYY-MM-DD"（<input type="date"> の値）を {y, m, d} に変換。不正なら null
  function parseISODate(str) {
    var match = /^(\d{4,6})-(\d{2})-(\d{2})$/.exec(str || '');
    if (!match) return null;
    var date = { y: +match[1], m: +match[2], d: +match[3] };
    return isValidDate(date.y, date.m, date.d) ? date : null;
  }

  var api = {
    WEEKDAYS_JA: WEEKDAYS_JA,
    isLeapYear: isLeapYear,
    daysInMonth: daysInMonth,
    isValidDate: isValidDate,
    daysFromCivil: daysFromCivil,
    weekdayIndex: weekdayIndex,
    weekdayJa: weekdayJa,
    diffDays: diffDays,
    parseISODate: parseISODate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.DateUtils = api;
  }
})(typeof self !== 'undefined' ? self : this);
