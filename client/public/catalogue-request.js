(function () {
  var form = document.getElementById('form');
  var send = document.getElementById('send');
  var err = document.getElementById('err');
  var ask = document.getElementById('ask');
  var done = document.getElementById('done');
  var dl = document.getElementById('dl');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    err.textContent = '';
    send.disabled = true;
    send.textContent = 'One moment…';
    var body = {
      name: form.name.value,
      email: form.email.value,
      note: form.note.value,
      website: form.website.value
    };
    fetch('/api/catalogue/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; });
      })
      .then(function (res) {
        if (!res.ok) throw new Error(res.d.error || 'Something went wrong. Please try again.');
        if (res.d.url) {
          dl.href = res.d.url;
          ask.hidden = true;
          done.hidden = false;
          window.location.href = res.d.url;
        } else {
          ask.hidden = true;
          done.hidden = false;
          done.querySelector('p').textContent = 'Thank you. We’ll be in touch.';
          dl.hidden = true;
        }
      })
      .catch(function (ex) {
        err.textContent = ex.message || 'Something went wrong. Please try again.';
        send.disabled = false;
        send.textContent = 'Get the catalogue';
      });
  });
})();
