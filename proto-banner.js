/* ZEAL prototype notice: shows a fixed banner on every page of a concept build. */
(function () {
  if (document.getElementById('zeal-proto-banner')) return;
  var bar = document.createElement('div');
  bar.id = 'zeal-proto-banner';
  bar.setAttribute('role', 'note');
  bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:2147483647;background:#191b21;color:#fff;' +
    'font:14px/1.45 system-ui,-apple-system,Segoe UI,sans-serif;padding:10px 44px 10px 16px;text-align:center';
  bar.textContent = 'Concept prototype by ZEAL: a banking interface scaffold. Not a real bank. ' +
    'No accounts are opened and no money moves. Please do not enter real personal or card details.';
  var x = document.createElement('button');
  x.type = 'button'; x.setAttribute('aria-label', 'Close notice'); x.textContent = '\u00d7';
  x.style.cssText = 'position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:0;color:#fff;font-size:22px;cursor:pointer';
  x.onclick = function () { bar.remove(); };
  bar.appendChild(x);
  (document.body || document.documentElement).appendChild(bar);
})();
