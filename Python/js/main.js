// ── SIDEBAR TOGGLE ──
const sidebar = document.getElementById('sidebar');
const hamburger = document.getElementById('hamburger');
if (hamburger && sidebar) {
  hamburger.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

// ── ACTIVE NAV ──
document.querySelectorAll('.nav-item').forEach(link => {
  if (link.href === window.location.href) {
    link.classList.add('active');
  }
});

// ── COPY BUTTON ──
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const pre = btn.closest('.code-block').querySelector('pre');
    navigator.clipboard.writeText(pre.innerText).then(() => {
      btn.textContent = '✓ Copied!';
      setTimeout(() => btn.textContent = 'Copy', 2000);
    });
  });
});

// ── SIDEBAR SEARCH ──
const searchInput = document.getElementById('nav-search');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase();
    document.querySelectorAll('.nav-item').forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(q) ? '' : 'none';
    });
    document.querySelectorAll('.nav-section').forEach(sec => {
      sec.style.display = '';
    });
  });
}

// ── QUIZ ──
document.querySelectorAll('.quiz-option').forEach(opt => {
  opt.addEventListener('click', () => {
    const quiz = opt.closest('.quiz');
    if (quiz.dataset.answered) return;
    quiz.dataset.answered = '1';
    const correct = opt.dataset.correct === 'true';
    opt.classList.add(correct ? 'correct' : 'wrong');
    if (!correct) {
      quiz.querySelectorAll('[data-correct="true"]').forEach(o => o.classList.add('correct'));
    }
    const msg = quiz.querySelector('.quiz-feedback');
    if (msg) {
      msg.textContent = correct ? '✓ Correct! Well done.' : '✗ Not quite. The correct answer is highlighted.';
      msg.style.color = correct ? 'var(--accent3)' : 'var(--red)';
    }
  });
});

// ── READING PROGRESS ──
const progressBar = document.getElementById('reading-progress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const total = document.body.scrollHeight - window.innerHeight;
    progressBar.style.width = (window.scrollY / total * 100) + '%';
  });
}

// ── SMOOTH SCROLL ANCHORS ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
  });
});
