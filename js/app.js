(function () {
  'use strict';

  var DU = window.DateUtils;

  var form = document.getElementById('calc-form');
  var fromInput = document.getElementById('date-from');
  var toInput = document.getElementById('date-to');
  var fromWeekday = document.getElementById('weekday-from');
  var toWeekday = document.getElementById('weekday-to');
  var swapButton = document.getElementById('swap');
  var result = document.getElementById('result');
  var resultValue = document.getElementById('result-value');
  var resultDetail = document.getElementById('result-detail');
  var errorBox = document.getElementById('error');

  function todayISO() {
    var now = new Date();
    return now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');
  }

  function formatJa(date) {
    return date.y + '年' + date.m + '月' + date.d + '日（' + DU.weekdayJa(date.y, date.m, date.d) + '）';
  }

  function updateWeekday(input, badge) {
    var date = DU.parseISODate(input.value);
    var index = date ? DU.weekdayIndex(date.y, date.m, date.d) : -1;
    badge.textContent = date ? DU.WEEKDAYS_JA[index] + '曜日' : '−';
    badge.classList.toggle('is-sun', index === 0);
    badge.classList.toggle('is-sat', index === 6);
    badge.classList.toggle('is-empty', !date);
    hideResult();
  }

  function hideResult() {
    result.hidden = true;
    errorBox.hidden = true;
  }

  function showError(message) {
    result.hidden = true;
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function calculate() {
    var from = DU.parseISODate(fromInput.value);
    var to = DU.parseISODate(toInput.value);
    if (!from || !to) {
      showError(!from && !to ? '2つの日付を入力してください。'
        : !from ? '開始日を正しく入力してください。' : '終了日を正しく入力してください。');
      return;
    }

    var days = DU.diffDays(from, to);
    var abs = Math.abs(days);
    resultValue.textContent = days.toLocaleString('ja-JP');

    var lines = [formatJa(from) + ' から ' + formatJa(to) + ' まで'];
    if (abs >= 7) {
      var weeks = Math.floor(abs / 7);
      var rest = abs % 7;
      lines.push('約 ' + weeks.toLocaleString('ja-JP') + '週' + (rest ? ' と ' + rest + '日' : 'ちょうど'));
    }
    if (days !== 0) {
      lines.push('両端の日を含めると ' + (abs + 1).toLocaleString('ja-JP') + '日間');
    }
    if (days < 0) {
      lines.push('終了日が開始日より前のため、マイナスで表示しています。');
    }
    resultDetail.innerHTML = '';
    lines.forEach(function (text) {
      var li = document.createElement('li');
      li.textContent = text;
      resultDetail.appendChild(li);
    });

    errorBox.hidden = true;
    result.hidden = false;
    result.classList.remove('pop');
    void result.offsetWidth; // アニメーションを再生し直す
    result.classList.add('pop');
  }

  fromInput.addEventListener('input', function () { updateWeekday(fromInput, fromWeekday); });
  toInput.addEventListener('input', function () { updateWeekday(toInput, toWeekday); });

  document.querySelectorAll('[data-today]').forEach(function (button) {
    button.addEventListener('click', function () {
      var input = document.getElementById(button.getAttribute('data-today'));
      input.value = todayISO();
      input.dispatchEvent(new Event('input'));
    });
  });

  swapButton.addEventListener('click', function () {
    var tmp = fromInput.value;
    fromInput.value = toInput.value;
    toInput.value = tmp;
    updateWeekday(fromInput, fromWeekday);
    updateWeekday(toInput, toWeekday);
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    calculate();
  });

  // 初期表示: 両方とも今日
  fromInput.value = todayISO();
  toInput.value = todayISO();
  updateWeekday(fromInput, fromWeekday);
  updateWeekday(toInput, toWeekday);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function (err) {
        console.warn('Service Worker の登録に失敗しました', err);
      });
    });
  }
})();
