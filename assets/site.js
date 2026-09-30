// Emmanuel Bruno — small bits of behaviour. The site still works if this file fails to load.

// Homepage: pointing at a project title fades in that project's cover photo.
(function () {
  var list = document.querySelector('.hero-titles');
  if (!list) return;
  var layers = document.querySelectorAll('.hero-bg');
  var canHover = window.matchMedia('(hover: hover)').matches;

  // Covers only load on computers; phones can't hover, so they skip the download.
  if (canHover) {
    document.querySelectorAll('.hero-bg img[data-src]').forEach(function (img) {
      img.srcset = img.dataset.srcset;
      img.src = img.dataset.src;
    });
  }

  function show(i) {
    layers.forEach(function (layer, n) { layer.classList.toggle('is-active', n === i); });
  }

  if (!canHover) return;
  list.querySelectorAll('a[data-cover]').forEach(function (a) {
    var i = Number(a.dataset.cover);
    a.addEventListener('mouseenter', function () { show(i); });
    a.addEventListener('focus', function () { show(i); });
  });
  list.addEventListener('mouseleave', function () { show(0); });
  list.addEventListener('focusout', function (e) {
    if (!list.contains(e.relatedTarget)) show(0);
  });
})();

// Project slideshows: arrows, thumbnails, keyboard and swipe (swipe is native scrolling).
document.querySelectorAll('.slideshow').forEach(function (show) {
  var track = show.querySelector('.slides');
  var slides = track.children;
  var prev = show.querySelector('.slide-btn.prev');
  var next = show.querySelector('.slide-btn.next');
  var count = show.parentNode.querySelector('.slide-count');
  var thumbs = show.parentNode.querySelectorAll('.thumbs button');
  var current = 0;

  function render(i) {
    current = i;
    count.textContent = (i + 1) + ' / ' + slides.length;
    prev.disabled = i === 0;
    next.disabled = i === slides.length - 1;
    thumbs.forEach(function (t, n) { t.setAttribute('aria-current', n === i ? 'true' : 'false'); });
    // Keep the active thumbnail in view when the strip scrolls sideways (phones)
    var active = thumbs[i], strip = active && active.closest('.thumbs');
    if (strip && strip.scrollWidth > strip.clientWidth) {
      var a = active.getBoundingClientRect(), s = strip.getBoundingClientRect();
      strip.scrollTo({ left: strip.scrollLeft + a.left - s.left - s.width / 2 + a.width / 2, behavior: 'smooth' });
    }
  }

  function go(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    render(i);
    track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
  }

  prev.addEventListener('click', function () { go(current - 1); });
  next.addEventListener('click', function () { go(current + 1); });
  thumbs.forEach(function (t, n) { t.addEventListener('click', function () { go(n); }); });

  // After a swipe settles, sync the counter and thumbnails to where it landed
  var settle;
  track.addEventListener('scroll', function () {
    clearTimeout(settle);
    settle = setTimeout(function () {
      var i = Math.round(track.scrollLeft / track.clientWidth);
      if (i !== current) render(i);
    }, 120);
  });
  window.addEventListener('resize', function () { go(current); });

  document.addEventListener('keydown', function (e) {
    if (e.target.closest('input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowLeft') { go(current - 1); e.preventDefault(); }
    if (e.key === 'ArrowRight') { go(current + 1); e.preventDefault(); }
  });

  render(0);
});

// Photos drift in as you scroll to them.
(function () {
  var items = document.querySelectorAll('.fade-in');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  items.forEach(function (el) { io.observe(el); });
})();
