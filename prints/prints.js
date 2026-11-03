// Prints shop: the grid of prints and the enlarged view where you pick size and frame.
// To sell a combination, paste its Stripe payment link into `links` below.

// Small, medium and large, all 3:2, so the photo fits the print without cropping.
var SIZES = ['12 × 8 in', '18 × 12 in', '24 × 16 in'];
var SIZE_INCHES = [[12, 8], [18, 12], [24, 16]];

// Lumaprints' framed print, in real inches, used to draw it to scale. It orders a 2 in mat and
// a 0.875 in frame, and states: the mat covers 1/8 in of the picture on each side, and the frame
// covers 1/4 in of the mat. A 12 × 8 therefore shows 11.75 × 7.75 in and is 17 × 13 in overall.
var MAT_IN = 1.75; // the part of the 2 in mat you can see
var FRAME_IN = 0.875;
var FRAMED_TRIM = { long: 0.25, short: 0.25 };

// Unframed prints, per size: the white border built into the print file, and the ready-made
// frame the paper then fits.
var UNFRAMED = [
  { border: 2, label: '2 in', frame: '16 × 12 in' },
  { border: 3, label: '3 in', frame: '24 × 18 in' },
  { border: 2, label: '2 in', frame: '28 × 20 in' }
];

// prints/room.jpg in real inches, measured from the room's light switch (4.8 in tall):
// its size, and where the center of a hung print goes.
var ROOM = { w: 117.8, h: 88.3, centerX: 58.7, centerY: 27.5 };

// A size is offered only if the print file has at least this many pixels per inch
// on both sides at that size, so every print on sale is excellent quality.
// Pixel sizes come from prints/pixels.js (made by tools/measure-prints.sh).
var MIN_PPI = 250;

var FINISHES = [
  { id: 'unframed', name: 'Unframed' },
  { id: 'black', name: 'Black frame' },
  { id: 'white', name: 'White frame' }
];

// Price in dollars for [size][framed?]
var PRICES = {
  unframed: [130, 160, 180],
  framed: [200, 250, 300]
};

var PRINTS = [
  {
    id: 'perseus',
    title: 'New York — Perseus',
    series: 'Full Emptiness',
    image: 'DSC08162',
    // Key: size index + '-' + finish id, e.g. '0-unframed'. Empty = not on sale yet.
    links: {}
  },
  {
    id: 'praying-woman',
    title: 'New York — Praying Woman',
    series: 'Full Emptiness',
    image: 'DSC00957',
    links: {}
  },
  {
    // From ~/Desktop/website photography/BnW
    id: 'iceland-plant',
    title: 'Iceland — Plant',
    series: 'Black & White',
    image: 'DSC00772',
    links: {}
  },
  {
    id: 'abstract-i',
    title: 'Abstract I',
    series: 'Abstract',
    image: 'DSC01636',
    links: {}
  }
];

// The rest of the site's photos, for now with numbered placeholder titles.
// 'portrait' marks upright photos; 'noxl' marks photos without a 3000 px file.
[
  ['Full Emptiness', 'DSC01143 DSC05030 DSC06860 DSC08831 DSC09177 DSC09492 DSC04867 DSC09303 DSC05457 DSC08278 DSC07141-copy DSC07494-2', 3],
  ['Abstract', 'DSC00326-1:portrait DSC09005:portrait DSC08895 DSC09616 DSC02930 DSC00037 DSC03373-1', 2],
  ['Sovrastation', 'DSC00479 DSC00488 DSC01674:portrait DSC02787:noxl DSC01579 DSC01049', 1]
].forEach(function (group) {
  group[1].split(' ').forEach(function (entry, i) {
    var parts = entry.split(':');
    var n = toRoman(group[2] + i);
    PRINTS.push({
      id: (group[0] + '-' + n).toLowerCase().replace(/ /g, '-'),
      title: group[0] + ' ' + n,
      series: group[0],
      image: parts[0],
      portrait: parts[1] === 'portrait',
      noxl: parts[1] === 'noxl',
      links: {}
    });
  });
});

// Shop categories. A photo can be in more than one.
// Placeholder sorting for now, until EB sends the real selection for each category.
var CATEGORIES = [
  { id: 'bw', name: 'Black & White' },
  { id: 'abstract', name: 'Abstract' },
  { id: 'landscape', name: 'Landscape' },
  { id: 'nature', name: 'Nature' },
  { id: 'street', name: 'Street' }
];
var PHOTO_CATEGORIES = {
  DSC08162: 'bw street', DSC00957: 'bw street', DSC00772: 'bw', DSC01636: 'abstract',
  DSC01143: 'bw street', DSC05030: 'bw street', DSC06860: 'bw street',
  DSC08831: 'bw landscape', DSC09177: 'bw landscape street', DSC09492: 'bw street',
  DSC04867: 'bw street', DSC09303: 'bw street', DSC05457: 'bw street',
  DSC08278: 'bw abstract', 'DSC07141-copy': 'bw street', 'DSC07494-2': 'bw nature',
  'DSC00326-1': 'abstract', DSC09005: 'abstract nature', DSC08895: 'abstract nature',
  DSC09616: 'abstract nature', DSC02930: 'abstract landscape', DSC00037: 'abstract nature',
  'DSC03373-1': 'abstract nature', DSC00479: 'bw landscape', DSC00488: 'bw landscape',
  DSC01674: 'bw nature', DSC02787: 'bw nature', DSC01579: 'bw nature', DSC01049: 'bw nature'
};
PRINTS.forEach(function (p) { p.categories = (PHOTO_CATEGORIES[p.image] || '').split(' '); });

// Which sizes each print file can make at MIN_PPI. A photo with no measured file,
// or too few pixels for even the smallest size, is left out of the shop.
var PIXELS = window.PIXELS || {};
PRINTS.forEach(function (p) {
  var px = PIXELS[p.image] || PIXELS[p.image.replace(/-copy$/, '')];
  p.sizes = [];
  if (!px) return;
  var long = Math.max(px[0], px[1]), short = Math.min(px[0], px[1]);
  SIZE_INCHES.forEach(function (inches, i) {
    if (long / inches[0] >= MIN_PPI && short / inches[1] >= MIN_PPI) p.sizes.push(i);
  });
});
var NOT_PRINTABLE = PRINTS.filter(function (p) { return !p.sizes.length; });
if (NOT_PRINTABLE.length) {
  console.info('Left out of the shop (no print file, or too few pixels):',
    NOT_PRINTABLE.map(function (p) { return p.title + ' (' + p.image + ')'; }).join(', '));
}
PRINTS = PRINTS.filter(function (p) { return p.sizes.length; });

function toRoman(n) {
  var out = '', table = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  table.forEach(function (t) { while (n >= t[0]) { out += t[1]; n -= t[0]; } });
  return out;
}

(function () {
  var grid = document.getElementById('shop-grid');
  var view = document.getElementById('print-view');
  if (!grid || !view) return;

  var printEl = view.querySelector('.pv-print');
  var img = document.getElementById('pv-img');
  var sizesEl = document.getElementById('pv-sizes');
  var finishesEl = document.getElementById('pv-finishes');
  var buy = document.getElementById('pv-buy');
  var current = null, size = 0, finish = 'unframed';
  // Inches or centimeters, remembered for the next visit where the browser allows it
  var unit = 'in';
  try { if (localStorage.getItem('printUnit') === 'cm') unit = 'cm'; } catch (e) {}

  // Upright photos read height × width the other way round: 10 × 15 in
  function sizeLabel(i) {
    return current && current.portrait ? SIZES[i].replace(/([\d.]+) × ([\d.]+)/, '$2 × $1') : SIZES[i];
  }
  // The same size in centimeters: 30.5 × 20.3 cm
  function cm(inches) { return (inches * 2.54).toFixed(1); }
  function sizeCm(i) {
    var a = SIZE_INCHES[i][0], b = SIZE_INCHES[i][1];
    return current && current.portrait ? cm(b) + ' × ' + cm(a) + ' cm' : cm(a) + ' × ' + cm(b) + ' cm';
  }
  // A frame size such as '12 × 16 in', in the chosen unit
  function frameText(frame) {
    var turned = current && current.portrait ? frame.replace(/([\d.]+) × ([\d.]+)/, '$2 × $1') : frame;
    return unit === 'cm' ? turned.replace(/([\d.]+) × ([\d.]+) in/, function (m, a, b) { return cm(+a) + ' × ' + cm(+b) + ' cm'; }) : turned;
  }
  function borderText(u) { return unit === 'cm' ? cm(u.border) + ' cm' : u.label; }
  function price(s, f) { return PRICES[f === 'unframed' ? 'unframed' : 'framed'][s]; }
  function money(n) { return '$' + n.toLocaleString('en-US'); }
  // Cheapest unframed to dearest framed, among the sizes this print offers
  function range(p) {
    var low = PRICES.unframed[p.sizes[0]], high = PRICES.framed[p.sizes[p.sizes.length - 1]];
    return money(low) + ' – ' + money(high);
  }

  // Grid cards
  PRINTS.forEach(function (p) {
    var li = document.createElement('li');
    li.className = 'shop-card' + (p.portrait ? ' is-portrait' : '');
    li.innerHTML =
      '<a href="#' + p.id + '">' +
        '<span class="shop-card-stage">' +
          '<span class="shop-card-print"><img src="../images/sm/' + p.image + '.jpg" width="' + (p.portrait ? '1200" height="1799' : '1200" height="801') + '" alt="' + p.title + '" loading="lazy" decoding="async"></span>' +
        '</span>' +
        '<span class="shop-card-title">' + p.title + '</span>' +
        '<span class="shop-card-price">' + range(p) + '</span>' +
      '</a>';
    li.dataset.categories = p.categories.join(' ');
    grid.appendChild(li);
  });

  // Category filter: All, then one button per category. The choice is kept in the
  // address (?category=street) so a category can be shared as a link.
  var filterEl = document.getElementById('shop-filter');
  function showCategory(id) {
    grid.querySelectorAll('.shop-card').forEach(function (li) {
      li.hidden = id !== 'all' && li.dataset.categories.split(' ').indexOf(id) < 0;
    });
    filterEl.querySelectorAll('button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.category === id ? 'true' : 'false');
    });
  }
  [{ id: 'all', name: 'All' }].concat(CATEGORIES).forEach(function (c) {
    var count = c.id === 'all' ? PRINTS.length :
      PRINTS.filter(function (p) { return p.categories.indexOf(c.id) >= 0; }).length;
    var b = document.createElement('button');
    b.type = 'button';
    b.dataset.category = c.id;
    b.innerHTML = c.name + ' <span>' + count + '</span>';
    b.addEventListener('click', function () {
      showCategory(c.id);
      var url = location.pathname + (c.id === 'all' ? '' : '?category=' + c.id) + location.hash;
      history.replaceState(null, '', url);
    });
    filterEl.appendChild(b);
  });
  var asked = new URLSearchParams(location.search).get('category');
  showCategory(CATEGORIES.some(function (c) { return c.id === asked; }) ? asked : 'all');

  // Big screens: one scroll, small or long, moves on by exactly one set of 4.
  // Without this a small wheel turn snaps back to the set it started from.
  var bigScreen = matchMedia('(min-width: 1100px)'), wheelBusy = false, wheelQuiet;
  document.addEventListener('wheel', function (e) {
    if (!bigScreen.matches || view.open || e.ctrlKey || !e.deltaY) return;
    e.preventDefault();
    clearTimeout(wheelQuiet);
    wheelQuiet = setTimeout(function () { wheelBusy = false; }, 160); // a trackpad's glide is one scroll
    if (wheelBusy) return;
    wheelBusy = true;
    var page = document.scrollingElement, now = page.scrollTop;
    var stops = [document.querySelector('.shop-hero'), document.querySelector('.shop-intro')]
      .map(function (el) { return el.getBoundingClientRect().top + now; });
    grid.querySelectorAll('.shop-card:not([hidden])').forEach(function (li) {
      stops.push(li.getBoundingClientRect().top + now - 72); // its scroll-margin-top
    });
    stops.push(page.scrollHeight - innerHeight);
    var next = e.deltaY > 0 ?
      stops.filter(function (y) { return y > now + 1; }).sort(function (a, b) { return a - b; })[0] :
      stops.filter(function (y) { return y < now - 1; }).sort(function (a, b) { return b - a; })[0];
    if (next !== undefined) window.scrollTo({ top: next, behavior: 'smooth' });
  }, { passive: false });

  // Size and finish buttons
  SIZES.forEach(function (label, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.addEventListener('click', function () { size = i; render(); });
    sizesEl.appendChild(b);
  });
  FINISHES.forEach(function (f) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch swatch-' + f.id;
    b.setAttribute('aria-label', f.name);
    b.title = f.name;
    b.addEventListener('click', function () { finish = f.id; render(); });
    finishesEl.appendChild(b);
  });

  // The print's real measurements in inches, for this photo's orientation
  function printInches(s, f) {
    var i = SIZE_INCHES[s], framed = f !== 'unframed';
    var long = i[0] - (framed ? FRAMED_TRIM.long : 0), short = i[1] - (framed ? FRAMED_TRIM.short : 0);
    var w = current.portrait ? short : long, h = current.portrait ? long : short;
    var mat = framed ? MAT_IN : UNFRAMED[s].border, frame = framed ? FRAME_IN : 0;
    return { w: w, h: h, mat: mat, frame: frame, outerW: w + 2 * (mat + frame), outerH: h + 2 * (mat + frame) };
  }

  // One scale for every size and finish: either the largest framed print fills the stage,
  // or the whole room does, with the print hanging on its wall.
  function drawPrint() {
    if (!view.open) return;
    var stage = printEl.parentNode, css = getComputedStyle(stage);
    var largest = printInches(SIZES.length - 1, 'black'), inches = printInches(size, finish);
    var w = stage.clientWidth - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight);
    var h = stage.clientHeight - parseFloat(css.paddingTop) - parseFloat(css.paddingBottom);
    var px = inRoom ? Math.min(w / ROOM.w, h / ROOM.h) : Math.min(w / largest.outerW, h / largest.outerH);
    printEl.style.width = inches.outerW * px + 'px';
    printEl.style.padding = inches.mat * px + 'px';
    printEl.style.borderWidth = inches.frame * px + 'px';
    img.style.height = inches.h * px + 'px';
    if (inRoom) {
      var left = (w - ROOM.w * px) / 2, top = (h - ROOM.h * px) / 2;
      roomImg.style.width = ROOM.w * px + 'px';
      roomImg.style.left = left + 'px';
      roomImg.style.top = top + 'px';
      printEl.style.left = left + (ROOM.centerX - inches.outerW / 2) * px + 'px';
      printEl.style.top = top + (ROOM.centerY - inches.outerH / 2) * px + 'px';
    } else {
      printEl.style.left = printEl.style.top = '';
    }
  }

  // Print or Room view, with the print shown first
  var inRoom = false;
  var stageEl = printEl.parentNode;
  var roomImg = document.createElement('img');
  roomImg.className = 'pv-room';
  roomImg.src = 'room.jpg';
  roomImg.alt = '';
  stageEl.insertBefore(roomImg, printEl);
  var viewsEl = document.createElement('div');
  viewsEl.className = 'pv-views';
  viewsEl.setAttribute('role', 'group');
  viewsEl.setAttribute('aria-label', 'View');
  [['Print', false], ['Room', true]].forEach(function (v) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = v[0];
    b.addEventListener('click', function () { inRoom = v[1]; showView(); });
    viewsEl.appendChild(b);
  });
  stageEl.appendChild(viewsEl);
  function showView() {
    stageEl.classList.toggle('in-room', inRoom);
    viewsEl.querySelectorAll('button').forEach(function (b, i) {
      b.setAttribute('aria-pressed', (i === 1) === inRoom ? 'true' : 'false');
    });
    drawPrint();
  }
  showView();

  function render() {
    if (finish === 'unframed' && !UNFRAMED[size]) finish = 'black';
    printEl.dataset.finish = finish;
    document.getElementById('pv-price').textContent = money(price(size, finish));
    document.getElementById('pv-finish-name').textContent =
      FINISHES.filter(function (f) { return f.id === finish; })[0].name;
    sizesEl.querySelectorAll('button').forEach(function (b, i) {
      b.hidden = current.sizes.indexOf(i) < 0;
      b.textContent = unit === 'cm' ? sizeCm(i) : sizeLabel(i);
      b.setAttribute('aria-pressed', i === size ? 'true' : 'false');
    });
    document.querySelectorAll('#pv-units button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.unit === unit ? 'true' : 'false');
    });
    document.getElementById('pv-mat-size').textContent = unit === 'cm' ? cm(2) + ' cm' : '2 in';
    finishesEl.querySelectorAll('button').forEach(function (b, i) {
      b.hidden = FINISHES[i].id === 'unframed' && !UNFRAMED[size];
      b.setAttribute('aria-pressed', FINISHES[i].id === finish ? 'true' : 'false');
    });
    var fits = document.getElementById('pv-fits');
    // Kept in the layout when hidden, so choosing a finish doesn't move anything
    fits.hidden = false;
    fits.style.visibility = finish === 'unframed' ? 'visible' : 'hidden';
    if (UNFRAMED[size]) {
      fits.innerHTML = 'With a ' + borderText(UNFRAMED[size]) + ' white border. Fits a standard ' +
        frameText(UNFRAMED[size].frame) + ' frame, without a mat.';
    }
    var link = current.links[size + '-' + finish];
    if (link) {
      buy.href = link;
      buy.textContent = 'Buy';
      buy.removeAttribute('aria-disabled');
    } else {
      buy.href = 'mailto:emmanuelmaria.bruno@gmail.com?subject=' +
        encodeURIComponent('Print: ' + current.title + ', ' + sizeLabel(size) + ', ' + finish);
      buy.textContent = 'Available soon — ask me';
      buy.setAttribute('aria-disabled', 'true');
    }
    drawPrint();
  }

  document.getElementById('pv-units').addEventListener('click', function (e) {
    var chosen = e.target.dataset.unit;
    if (!chosen) return;
    unit = chosen;
    try { localStorage.setItem('printUnit', unit); } catch (err) {}
    render();
  });

  function open(id) {
    var p = PRINTS.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    current = p;
    size = p.sizes[0];
    finish = 'unframed';
    img.src = '../images/' + p.image + '.jpg';
    img.alt = p.title + ', from the series ' + p.series;
    printEl.dataset.orient = p.portrait ? 'portrait' : 'landscape';
    document.getElementById('pv-title').textContent = p.title;
    document.getElementById('pv-series').textContent = p.series;
    render();
    if (!view.open) view.showModal();
    drawPrint();
  }

  function close() {
    if (view.open) view.close();
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  }

  // The address carries the open print (#new-york), so a print can be shared as a link.
  function fromHash() {
    var id = location.hash.slice(1);
    if (id) open(id); else if (view.open) view.close();
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();

  // Clicking the print shows it full screen, at full resolution, with the chosen mat and frame
  var zoom = document.getElementById('pv-zoom');
  var zoomPrint = document.getElementById('pv-zoom-print');
  var zoomImg = document.getElementById('pv-zoom-img');
  // Fills the screen, keeping the real proportions of photo, mat and frame for the chosen size
  function drawZoom() {
    if (zoom.hidden) return;
    var pad = parseFloat(getComputedStyle(zoom).paddingLeft), inches = printInches(size, finish);
    var px = Math.min((innerWidth - 2 * pad) / inches.outerW, (innerHeight - 2 * pad) / inches.outerH);
    zoomImg.style.width = inches.w * px + 'px';
    zoomImg.style.height = inches.h * px + 'px';
    zoomPrint.style.padding = inches.mat * px + 'px';
    zoomPrint.style.borderWidth = inches.frame * px + 'px';
  }
  window.addEventListener('resize', function () { drawPrint(); drawZoom(); });
  printEl.addEventListener('click', function () {
    zoomPrint.dataset.finish = finish;
    zoomImg.src = '../images/' + current.image + '.jpg';
    zoomImg.srcset = '../images/' + current.image + '.jpg 2500w' +
      (current.noxl ? '' : ', ../images/xl/' + current.image + '.jpg 3000w');
    zoomImg.sizes = '100vw';
    zoomImg.alt = img.alt;
    zoom.hidden = false;
    drawZoom();
    zoom.querySelector('.pv-zoom-close').focus();
  });
  function unzoom() { zoom.hidden = true; printEl.focus(); }
  zoom.addEventListener('click', unzoom);
  // Esc closes the full-screen photo first, then the enlarged view
  view.addEventListener('cancel', function (e) {
    if (!zoom.hidden) { e.preventDefault(); unzoom(); }
  });

  view.querySelector('.pv-close').addEventListener('click', close);
  view.addEventListener('close', function () {
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  });
  // Clicking the dim backdrop outside the panel closes it
  view.addEventListener('click', function (e) { if (e.target === view) close(); });
})();
