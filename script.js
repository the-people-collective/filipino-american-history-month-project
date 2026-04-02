/* ============================================================
   FILIPINO AMERICAN HISTORY MONTH — script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // === CONSTANTS ===
  const navbar      = document.getElementById('navbar');
  const navToggle   = document.getElementById('nav-toggle');
  const navMenu     = document.getElementById('nav-menu');
  const navLinks    = document.querySelectorAll('.nav-link');
  const sections    = document.querySelectorAll('main section[id]');
  const timelineTrack = document.getElementById('timeline-track');
  const prevBtn     = document.getElementById('timeline-prev');
  const nextBtn     = document.getElementById('timeline-next');
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const figureCards = document.querySelectorAll('.figure-card');
  const footerYear  = document.getElementById('footer-year');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // === FOOTER YEAR ===
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  // === NAVBAR SHADOW ON SCROLL ===
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // === MOBILE NAV TOGGLE ===
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      navMenu.classList.toggle('nav--open', !isOpen);
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Close on nav link click
    navMenu.addEventListener('click', (e) => {
      if (e.target.classList.contains('nav-link')) {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('nav--open');
        document.body.style.overflow = '';
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('nav--open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('nav--open');
        document.body.style.overflow = '';
        navToggle.focus();
      }
    });
  }

  // === SMOOTH SCROLL WITH NAV OFFSET ===
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = navbar ? navbar.offsetHeight : 64;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'instant' : 'smooth' });
    });
  });

  // === ACTIVE NAV LINK ON SCROLL (IntersectionObserver) ===
  if (sections.length && navLinks.length) {
    const observerOptions = {
      root: null,
      rootMargin: `-${navbar ? navbar.offsetHeight : 64}px 0px -60% 0px`,
      threshold: 0,
    };
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${entry.target.id}`;
            link.classList.toggle('nav-link--active', isActive);
          });
        }
      });
    }, observerOptions);
    sections.forEach(section => sectionObserver.observe(section));
  }

  // === TIMELINE HORIZONTAL SCROLL ARROWS ===
  if (timelineTrack && prevBtn && nextBtn) {
    const SCROLL_AMOUNT = 340; // roughly one card width

    const updateArrows = () => {
      const { scrollLeft, scrollWidth, clientWidth } = timelineTrack;
      prevBtn.disabled = scrollLeft <= 4;
      nextBtn.disabled = scrollLeft >= scrollWidth - clientWidth - 4;
    };

    prevBtn.addEventListener('click', () => {
      timelineTrack.scrollBy({ left: -SCROLL_AMOUNT, behavior: prefersReducedMotion ? 'instant' : 'smooth' });
    });
    nextBtn.addEventListener('click', () => {
      timelineTrack.scrollBy({ left: SCROLL_AMOUNT, behavior: prefersReducedMotion ? 'instant' : 'smooth' });
    });

    timelineTrack.addEventListener('scroll', updateArrows, { passive: true });
    updateArrows(); // initial state
  }

  // === STUDENT ACTIVITY TOGGLES ===
  document.querySelectorAll('.student-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      const panelId = toggle.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);
      if (!panel) return;

      toggle.setAttribute('aria-expanded', String(!isOpen));
      panel.hidden = isOpen;
    });
  });

  // Grade tab switching (delegated to each .student-activities panel)
  document.querySelectorAll('.student-activities').forEach(panel => {
    const tabs = panel.querySelectorAll('.grade-tab');
    const contents = panel.querySelectorAll('.grade-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const grade = tab.dataset.grade;

        tabs.forEach(t => t.classList.remove('grade-tab--active'));
        tab.classList.add('grade-tab--active');

        contents.forEach(c => {
          c.classList.toggle('grade-content--hidden', c.dataset.grade !== grade);
        });
      });
    });
  });

  // === QUIZ ===
  const quiz = document.getElementById('history-quiz');
  if (quiz) {
    const questions = quiz.querySelectorAll('.quiz__question');
    const scoreEl   = document.getElementById('quiz-score');
    const scoreNum  = scoreEl.querySelector('.quiz__score-number');
    const scoreMsg  = scoreEl.querySelector('.quiz__score-message');
    const retryBtn  = scoreEl.querySelector('.quiz__retry');
    let answered = 0;
    let score = 0;

    const MESSAGES = [
      "Don't give up — every expert started as a beginner! 💪",
      "Good start! Read through the timeline to learn more. 📚",
      "Good start! Read through the timeline to learn more. 📚",
      "Great job! You know your history! Keep exploring. 🎉",
      "Great job! You know your history! Keep exploring. 🎉",
      "Perfect score! You're a Filipino American history expert! 🌟",
    ];

    questions.forEach(question => {
      const options = question.querySelectorAll('.quiz-option');

      options.forEach(option => {
        option.addEventListener('click', () => {
          const isCorrect = option.dataset.correct === 'true';

          // Mark answer
          option.classList.add(isCorrect ? 'is-correct' : 'is-wrong');

          // If wrong, reveal the correct answer
          if (!isCorrect) {
            options.forEach(o => {
              if (o.dataset.correct === 'true') o.classList.add('is-correct');
            });
          }

          // Disable all options for this question
          options.forEach(o => { o.disabled = true; });

          if (isCorrect) score++;
          answered++;

          // All questions answered — show score
          if (answered === questions.length) {
            quiz.querySelector('.quiz__questions').setAttribute('aria-hidden', 'true');
            scoreNum.textContent = `${score} / ${questions.length}`;
            scoreMsg.textContent = MESSAGES[score];
            scoreEl.hidden = false;
          }
        });
      });
    });

    // Retry button — reset quiz
    retryBtn.addEventListener('click', () => {
      score = 0;
      answered = 0;
      questions.forEach(question => {
        question.querySelectorAll('.quiz-option').forEach(o => {
          o.disabled = false;
          o.classList.remove('is-correct', 'is-wrong');
        });
      });
      quiz.querySelector('.quiz__questions').removeAttribute('aria-hidden');
      scoreEl.hidden = true;
    });
  }

  // === NOTABLE FIGURES CATEGORY FILTER ===
  if (filterBtns.length && figureCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        // Update active button
        filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
        btn.classList.add('filter-btn--active');

        // Show/hide cards
        figureCards.forEach(card => {
          const match = filter === 'all' || card.dataset.category === filter;
          card.classList.toggle('is-hidden', !match);
        });
      });
    });
  }

});
