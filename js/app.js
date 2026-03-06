document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  const $ = (id) => document.getElementById(id);

  // Helper: tampilkan pesan error
  function showError(elementId, message) {
    const el = $(elementId);
    if (el) el.textContent = message;
  }

  // Navigasi
  const go = (url) => window.location.href = url;

  // Reset sesi (tombol New di navbar)
  const resetNav = document.getElementById('resetNav');
  if (resetNav) {
    resetNav.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Mulai sesi baru? Semua data sesi saat ini akan hilang.')) {
        sessionStorage.clear();
        go('index.html');
      }
    });
  }

  // Halaman Home
  if (page === 'home') {
    const startBtn = $('startBtn');
    if (startBtn) {
      startBtn.addEventListener('click', () => go('vent.html'));
    }

    const sessions = JSON.parse(localStorage.getItem('mindhoops_sessions') || '[]');
    const stats = $('sessionStats');
    if (stats) {
      const count = sessions.length;
      stats.innerHTML = `<i class="fas fa-history"></i> Kamu telah melakukan <b>${count}</b> sesi refleksi.`;
    }
  }

  // Halaman Vent
  if (page === 'vent') {
    const ventBox = $('ventBox');
    const releaseBtn = $('releaseBtn');
    const errorDiv = $('ventError');

    ventBox.value = sessionStorage.getItem('ventTextDraft') || '';
    ventBox.addEventListener('input', () => {
      sessionStorage.setItem('ventTextDraft', ventBox.value);
    });

    releaseBtn.addEventListener('click', () => {
      const text = ventBox.value.trim();
      if (text.length < 3) {
        showError('ventError', 'Tulis setidaknya beberapa kata.');
        return;
      }
      sessionStorage.setItem('ventText', text);
      sessionStorage.removeItem('ventTextDraft');
      go('tip.html');
    });
  }

  // Halaman Tip
  if (page === 'tip') {
    const ventText = sessionStorage.getItem('ventText');
    if (!ventText) { go('index.html'); return; }

    const tipTitle = $('tipTitle');
    const tipText = $('tipText');
    const lower = ventText.toLowerCase();

    if (lower.includes('miss') || lower.includes('airball') || lower.includes('brick')) {
      tipTitle.textContent = 'Mistakes Are Data';
      tipText.textContent = 'Every shooter misses. Focus on your next play, not your last one. — Stephen Curry';
    } else if (lower.includes('coach') || lower.includes('bench') || lower.includes('yell')) {
      tipTitle.textContent = 'Coach Pressure Reset';
      tipText.textContent = 'Inhale 4s, hold 2s, exhale 6s (x3). Then choose one small improvement for next practice.';
    } else if (lower.includes('turnover')) {
      tipTitle.textContent = 'Protect The Ball';
      tipText.textContent = 'Turnovers happen. Learn what caused it and visualize a better decision next time.';
    } else if (lower.includes('foul')) {
      tipTitle.textContent = 'Play Tough, Stay Smart';
      tipText.textContent = 'Aggressive defense is good. Adjust your positioning without fouling.';
    } else if (lower.includes('loss') || lower.includes('lose')) {
      tipTitle.textContent = 'Loss = Lesson';
      tipText.textContent = 'Every loss teaches something. Write down one thing to improve.';
    } else if (lower.includes('teammate')) {
      tipTitle.textContent = 'Team First';
      tipText.textContent = 'Talk to your teammate. A quick "we\'ll get the next one" builds trust.';
    } else {
      tipTitle.textContent = 'Take 3 Slow Breaths';
      tipText.textContent = 'Breathe in 4 seconds, hold 2, out 6. Repeat 3 times.';
    }

    $('nextBtn').addEventListener('click', () => go('reflect.html'));
  }

  // Halaman Reflect
  if (page === 'reflect') {
    if (!sessionStorage.getItem('ventText')) { go('index.html'); return; }

    const pills = document.querySelectorAll('.pill');
    const hurtRadios = document.querySelectorAll('input[name="hurtMost"]');
    const positiveInput = $('positiveOne');
    const finishBtn = $('finishBtn');

    const savedStrength = sessionStorage.getItem('feelingStrength');
    if (savedStrength) {
      pills.forEach(p => { if (p.dataset.value === savedStrength) p.classList.add('selected'); });
    }
    const savedHurt = sessionStorage.getItem('hurtMost');
    if (savedHurt) {
      hurtRadios.forEach(r => { if (r.value === savedHurt) r.checked = true; });
    }
    positiveInput.value = sessionStorage.getItem('positiveOne') || '';

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('selected'));
        pill.classList.add('selected');
        sessionStorage.setItem('feelingStrength', pill.dataset.value);
        showError('strengthError', '');
      });
    });

    hurtRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        sessionStorage.setItem('hurtMost', radio.value);
        showError('hurtError', '');
      });
    });

    positiveInput.addEventListener('input', () => {
      sessionStorage.setItem('positiveOne', positiveInput.value);
    });

    finishBtn.addEventListener('click', () => {
      const strength = sessionStorage.getItem('feelingStrength');
      const hurt = sessionStorage.getItem('hurtMost');
      const pos = (sessionStorage.getItem('positiveOne') || '').trim();
      let valid = true;

      if (!strength) { showError('strengthError', 'Pilih kekuatan perasaanmu.'); valid = false; }
      if (!hurt) { showError('hurtError', 'Pilih apa yang paling mengganggu.'); valid = false; }
      if (pos.length < 3) { showError('positiveError', 'Tulis satu hal positif (min. 3 karakter).'); valid = false; }

      if (valid) go('track.html');
    });
  }

  // Halaman Track
  if (page === 'track') {
    if (!sessionStorage.getItem('ventText')) { go('index.html'); return; }

    const moodInput = $('moodAfter');
    const saveBtn = $('saveAfterBtn');
    const resultLine = $('resultLine');
    const newSessionBtn = $('newSessionBtn');
    const homeBtn = $('homeBtn');
    const chartContainer = $('chartContainer');
    const summaryDiv = $('currentSummary');
    const comparisonDiv = $('comparison');

    // Data sesi saat ini
    const strength = sessionStorage.getItem('feelingStrength') || '-';
    const hurt = sessionStorage.getItem('hurtMost') || '-';
    const positive = sessionStorage.getItem('positiveOne') || '-';
    // Konversi feeling strength (1-5) ke skala 2-10 agar sebanding dengan mood after (1-10)
    const beforeMood = strength !== '-' ? parseInt(strength) * 2 : null;

    if (summaryDiv) {
      summaryDiv.innerHTML = `
        <div class="summary-item"><span>😤 Feeling:</span> <span>${strength}/5</span></div>
        <div class="summary-item"><span>😟 Hurt most:</span> <span>${hurt}</span></div>
        <div class="summary-item"><span>👍 Positive:</span> <span>${positive}</span></div>
      `;
    }

    // Fungsi render chart
    function renderChart() {
      const sessions = JSON.parse(localStorage.getItem('mindhoops_sessions') || '[]');
      const lastFive = sessions.slice(-5);
      chartContainer.innerHTML = '';
      if (lastFive.length === 0) {
        chartContainer.innerHTML = '<p class="small">Belum ada data historis. Selesaikan sesi pertamamu!</p>';
        return;
      }
      lastFive.forEach((s, i) => {
        if (!s.moodAfter) return;
        const bar = document.createElement('div');
        bar.className = 'bar';
        const height = (s.moodAfter / 10) * 140;
        bar.style.height = height + 'px';
        bar.setAttribute('data-value', s.moodAfter);
        // Label sesi (misal: Sesi ke-n)
        const sessionLabel = document.createElement('span');
        sessionLabel.textContent = `Sesi ${sessions.indexOf(s) + 1}`;
        bar.appendChild(sessionLabel);
        chartContainer.appendChild(bar);
      });
    }

    renderChart();

    // Update perbandingan before-after
    function updateComparison() {
      if (!comparisonDiv) return;
      const after = sessionStorage.getItem('moodAfter');
      if (beforeMood && after) {
        const beforeVal = beforeMood; // skala 2-10
        const afterVal = parseInt(after);
        const change = afterVal - beforeVal;
        let arrow = '', changeText = '';
        if (change > 0) {
          arrow = '▲';
          changeText = `membaik ${change} poin`;
        } else if (change < 0) {
          arrow = '▼';
          changeText = `menurun ${Math.abs(change)} poin`;
        } else {
          arrow = '•';
          changeText = 'stabil';
        }
        comparisonDiv.innerHTML = `
          <span class="before">Before: ${beforeVal/2}/5 (${beforeVal}/10)</span>
          <span class="arrow">→</span>
          <span class="after">After: ${afterVal}/10</span>
          <div style="margin-top:8px; color:${change > 0 ? '#4caf50' : (change < 0 ? '#ff4d4d' : '#a9b3c7')}">
            ${arrow} ${changeText}
          </div>
        `;
      } else {
        comparisonDiv.innerHTML = 'Simpan mood setelah refleksi untuk melihat perbandingan.';
      }
    }
    updateComparison();

    // Simpan mood after
    saveBtn.addEventListener('click', () => {
      const mood = Number(moodInput.value);
      if (mood < 1 || mood > 10 || isNaN(mood)) {
        showError('moodError', 'Masukkan angka 1–10.');
        return;
      }

      const sessionData = {
        timestamp: new Date().toISOString(),
        feelingStrength: sessionStorage.getItem('feelingStrength') || '',
        hurtMost: sessionStorage.getItem('hurtMost') || '',
        positiveOne: sessionStorage.getItem('positiveOne') || '',
        moodAfter: mood,
        ventText: (sessionStorage.getItem('ventText') || '').substring(0, 50) + '...'
      };

      let sessions = JSON.parse(localStorage.getItem('mindhoops_sessions') || '[]');
      sessions.push(sessionData);
      if (sessions.length > 10) sessions.shift();
      localStorage.setItem('mindhoops_sessions', JSON.stringify(sessions));

      sessionStorage.setItem('moodAfter', String(mood));
      resultLine.innerHTML = '✅ Sesi selesai! Kamu telah merefleksikan perasaanmu.';
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saved ✓';

      renderChart();
      updateComparison();
    });

    newSessionBtn.addEventListener('click', () => {
      sessionStorage.clear();
      go('index.html');
    });

    homeBtn.addEventListener('click', () => go('index.html'));

    const savedMood = sessionStorage.getItem('moodAfter');
    if (savedMood) {
      moodInput.value = savedMood;
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saved ✓';
      resultLine.innerHTML = '✅ Sesi selesai!';
      updateComparison();
    }
  }
});