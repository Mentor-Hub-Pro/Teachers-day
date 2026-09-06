/* =========================================================
   THE GOLDEN MEMORY BOOK — engine
   ========================================================= */
(function () {
  'use strict';

  const P   = window.TD_PHOTOS   || [];
  const MAP = window.TD_MAP      || {};
  const T   = window.TD_TEACHER  || {};
  const S   = window.TD_STUDENTS || [];
  const J   = window.TD_JOURNEY  || [];
  const Q   = window.TD_QUOTE    || {};
  const W   = window.TD_WISHES   || [];

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const photo = i => (P[((i % P.length) + P.length) % P.length] || {});
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- PRELOADER ---------------- */
  function preloader() {
    const pre = $('#preloader');
    if (!pre) return;
    if (!reduced) {
      [['#cw', 1.5, .5], ['#cw2', 1.1, 1.5]].forEach(([sel, dur, delay]) => {
        const path = $(sel);
        if (!path || !path.getTotalLength) return;
        const len = path.getTotalLength();
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
        path.style.transition = `stroke-dashoffset ${dur}s ease-in-out ${delay}s`;
        requestAnimationFrame(() => { path.style.strokeDashoffset = '0'; });
      });
    }
    let opened = false;
    const open = () => {
      if (opened) return;
      opened = true;
      pre.classList.add('open');
      document.body.classList.remove('locked');
      setTimeout(() => pre.classList.add('done'), 300);
    };
    setTimeout(open, reduced ? 400 : 3300);
    pre.addEventListener('click', open);
  }

  /* ---------------- HERO ---------------- */
  function heroPic() {
    const pic = $('#teacherPic');
    if (!pic) return;
    const ov = savedFaces();
    const idx = ov.teacher != null ? ov.teacher : (MAP.teacher || 0);
    pic.src = photo(idx).url || '';
    pic.alt = (T.name || 'Teacher') + ' — profile';
  }

  function hero() {
    heroPic();
    if (T.name)   $('#sirName').textContent  = T.name;
    if (T.title)  $('#sirTitle').textContent = T.title;

    const chip = $('#dateChip');
    if (chip) {
      const d = new Date();
      chip.textContent = '🗓️ ' + d.toLocaleDateString('bn-IN',
        { day: 'numeric', month: 'long', year: 'numeric' });
    }

    // typewriter
    const el = $('#typewriter');
    const lines = (T.tagline && T.tagline.length) ? T.tagline : ['Happy Teachers\' Day'];
    if (el) {
      if (reduced) { el.textContent = lines[0]; return; }
      let li = 0, ci = 0, del = false;
      (function tick() {
        const t = lines[li];
        el.textContent = del ? t.slice(0, --ci) : t.slice(0, ++ci);
        if (!del && ci === t.length) { del = true; return setTimeout(tick, 1900); }
        if (del && ci === 0) { del = false; li = (li + 1) % lines.length; }
        setTimeout(tick, del ? 24 : 58);
      })();
    }

    // 3D tilt on portrait
    const pt = $('#portrait');
    if (pt && !reduced && matchMedia('(hover:hover)').matches) {
      pt.addEventListener('mousemove', e => {
        const r = pt.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        pt.style.transform = `perspective(800px) rotateY(${x * 16}deg) rotateX(${-y * 16}deg)`;
      });
      pt.addEventListener('mouseleave', () => { pt.style.transform = ''; });
      pt.style.transition = 'transform .5s cubic-bezier(.2,.8,.2,1)';
    }
  }

  /* ---------------- DEDICATION STACK ---------------- */
  function dedication() {
    const box = $('#dediStack');
    if (!box) return;
    const ids = MAP.dedication || [0, 1, 2];
    box.innerHTML = ids.slice(0, 3).map(i => {
      const p = photo(i);
      return `<div class="ph"><img src="${esc(p.url)}" loading="lazy" alt="${esc(p.caption)}"></div>`;
    }).join('');
  }

  /* ---------------- TIMELINE ---------------- */
  function timeline() {
    const box = $('#timeline');
    if (!box) return;
    const ids = MAP.timeline || [];
    const html = J.map((it, i) => {
      const p = photo(ids[i] != null ? ids[i] : i);
      return `<div class="tl-item${i % 2 ? ' right' : ''}">
        <div class="tl-card">
          <img src="${esc(p.url)}" loading="lazy" alt="${esc(it.title)}">
          <div class="tl-body">
            <span class="tl-year">${esc(it.year)}</span>
            <h3>${esc(it.title)}</h3>
            <p>${esc(it.text)}</p>
          </div>
        </div></div>`;
    }).join('');
    box.insertAdjacentHTML('beforeend', html);

    const items = $$('.tl-item', box);
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: .2 });
    items.forEach(i => io.observe(i));

    const fill = $('#tlFill');
    const onScroll = () => {
      const r = box.getBoundingClientRect();
      const vh = innerHeight;
      const total = r.height;
      const passed = Math.min(Math.max(vh * .62 - r.top, 0), total);
      fill.style.height = passed + 'px';
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- STUDENTS ---------------- */
  const PKEY = 'td_faces_v1';
  const savedFaces = () => {
    try { return JSON.parse(localStorage.getItem(PKEY)) || {}; } catch (_) { return {}; }
  };
  // resolved photo index for student i, or null for monogram
  function faceIndex(i) {
    const ov = savedFaces();
    if (ov[i] != null) return ov[i];
    const ids = MAP.students || [];
    return ids[i] != null ? ids[i] : null;
  }

  function avatarHTML(s, i) {
    const idx = faceIndex(i);
    if (idx == null) {
      const initial = (s.name || '?').trim().charAt(0).toUpperCase();
      return `<div class="mono">${esc(initial)}</div>`;
    }
    const p = photo(idx);
    return `<img src="${esc(p.url)}" loading="lazy" alt="${esc(s.name)}">`;
  }

  function students() {
    const box = $('#studentGrid');
    if (!box) return;
    box.innerHTML = S.map((s, i) => `
      <div class="flip" tabindex="0" data-s="${i}"><div class="flip-in">
        <div class="face">
          <button class="pickbtn" data-pick="${i}" title="এই জনের ছবি বাছুন">✎</button>
          <div class="avatar">${avatarHTML(s, i)}</div>
          <b>${esc(s.name)}</b>
          <div class="bnname">${esc(s.bn || '')}</div>
          <div class="role">Student</div>
        </div>
        <div class="face back">
          <div class="qm">"</div>
          <div class="q">${esc(s.quote || '')}</div>
          <small>— ${esc(s.name)}</small>
        </div>
      </div></div>`).join('');

    $$('.flip', box).forEach(f => {
      const toggle = e => {
        if (e && e.target && e.target.closest('.pickbtn')) return;
        f.classList.toggle('flipped');
      };
      f.addEventListener('click', toggle);
      f.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  }

  /* ---------------- PHOTO STUDIO ---------------- */
  function studio() {
    const modal = $('#studio');
    if (!modal) return;
    const grid = $('#studioGrid'), title = $('#studioTitle');
    let who = 0; // number = student index, 'teacher' = hero portrait

    const curIndex = () => {
      if (who === 'teacher') {
        const ov = savedFaces();
        return ov.teacher != null ? ov.teacher : (MAP.teacher || 0);
      }
      return faceIndex(who);
    };

    const paintGrid = () => {
      const cur = curIndex();
      grid.innerHTML = P.map((p, i) =>
        `<div class="sp${i === cur ? ' sel' : ''}" data-i="${i}">
           <img src="${esc(p.url)}" loading="lazy" alt="">
           <span class="n">${i + 1}</span>
         </div>`).join('');
    };
    const open = i => {
      who = i;
      title.textContent = (i === 'teacher')
        ? (T.name || 'Sir') + ' — স্যারের ছবি বাছুন'
        : ((S[i] && S[i].name ? S[i].name : 'ছাত্র') + ' — ছবি বাছুন');
      paintGrid();
      modal.classList.add('on');
      document.body.classList.add('locked', 'studio');
    };
    const close = () => {
      modal.classList.remove('on');
      document.body.classList.remove('locked', 'studio');
    };
    const save = (i, val) => {
      const ov = savedFaces();
      if (val == null) delete ov[i]; else ov[i] = val;
      try { localStorage.setItem(PKEY, JSON.stringify(ov)); } catch (_) {}
      if (i === 'teacher') heroPic(); else students();
    };

    document.addEventListener('click', e => {
      const b = e.target.closest('.pickbtn');
      if (b) {
        e.stopPropagation();
        open(b.dataset.pick === 'teacher' ? 'teacher' : +b.dataset.pick);
      }
    });
    grid.addEventListener('click', e => {
      const c = e.target.closest('.sp');
      if (!c) return;
      save(who, +c.dataset.i);
      paintGrid();
      setTimeout(close, 220);
    });
    $('#studioClose').addEventListener('click', close);
    $('#studioClear').addEventListener('click', () => { save(who, null); paintGrid(); });
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    $('#studioCopy').addEventListener('click', () => {
      const ov = savedFaces();
      const tIdx = ov.teacher != null ? ov.teacher : (MAP.teacher || 0);
      const arr = S.map((_, i) => faceIndex(i));
      const text =
        '  teacher:   ' + tIdx + ',\n' +
        '  students:  [' + arr.map(v => (v == null ? 'null' : v)).join(', ') + '],';
      const btn = $('#studioCopy');
      const done = ok => {
        btn.textContent = ok ? '✓ কপি হয়েছে!' : '⚠ কপি হয়নি';
        setTimeout(() => { btn.textContent = '📋 Copy config'; }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => done(true)).catch(() => {
          prompt('assets/js/data.js-এর TD_MAP-এ এই দুটো লাইন বসান —', text);
        });
      } else {
        prompt('assets/js/data.js-এর TD_MAP-এ এই দুটো লাইন বসান —', text);
      }
    });
  }

  /* ---------------- GALLERY + LIGHTBOX ---------------- */
  let lbIndex = 0;
  function gallery() {
    const box = $('#masonry');
    if (!box) return;
    box.innerHTML = P.map((p, i) =>
      `<div class="mitem" data-i="${i}">
         <img src="${esc(p.url)}" loading="lazy" alt="${esc(p.caption)}">
         <div class="ov"><span>${esc(p.caption)}</span></div>
       </div>`).join('');

    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: .05 });
    $$('.mitem', box).forEach((m, i) => {
      m.style.transitionDelay = (i % 8) * 55 + 'ms';
      io.observe(m);
    });
  }

  function lightbox() {
    const lb = $('#lightbox'), img = $('#lbImg'), cap = $('#lbCap');
    if (!lb) return;
    const show = i => {
      lbIndex = ((i % P.length) + P.length) % P.length;
      const p = photo(lbIndex);
      img.src = p.url; img.alt = p.caption || '';
      cap.textContent = p.caption || '';
    };
    const open = i => { show(i); lb.classList.add('on'); document.body.classList.add('locked'); };
    const close = () => { lb.classList.remove('on'); document.body.classList.remove('locked'); };

    document.addEventListener('click', e => {
      const m = e.target.closest('.mitem');
      if (m) return open(+m.dataset.i);
      const pol = e.target.closest('.polaroid');
      if (pol) return open(+pol.dataset.i);
    });
    $('#lbClose').addEventListener('click', close);
    $('#lbPrev').addEventListener('click', e => { e.stopPropagation(); show(lbIndex - 1); });
    $('#lbNext').addEventListener('click', e => { e.stopPropagation(); show(lbIndex + 1); });
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    addEventListener('keydown', e => {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(lbIndex - 1);
      if (e.key === 'ArrowRight') show(lbIndex + 1);
    });
    // swipe
    let x0 = null;
    lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) show(lbIndex + (dx < 0 ? 1 : -1));
      x0 = null;
    }, { passive: true });
  }

  /* ---------------- SLIDESHOW ---------------- */
  function slideshow() {
    const box = $('#show'), dotBox = $('#showDots');
    if (!box) return;
    const ids = (MAP.slideshow && MAP.slideshow.length) ? MAP.slideshow : P.map((_, i) => i);
    const list = ids.map(i => photo(i));

    box.insertAdjacentHTML('afterbegin', list.map((p, i) =>
      `<div class="slide${i === 0 ? ' on' : ''}">
         <img src="${esc(p.url)}" loading="${i < 2 ? 'eager' : 'lazy'}" alt="${esc(p.caption)}">
         <div class="cap">${esc(p.caption)}</div>
       </div>`).join(''));
    dotBox.innerHTML = list.map((_, i) => `<i class="${i === 0 ? 'on' : ''}" data-i="${i}"></i>`).join('');

    const slides = $$('.slide', box), dots = $$('i', dotBox);
    let cur = 0, timer = null;
    const go = n => {
      cur = ((n % slides.length) + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('on', i === cur));
      dots.forEach((d, i) => d.classList.toggle('on', i === cur));
      const im = slides[cur].querySelector('img');
      if (im && !reduced) { im.style.animation = 'none'; void im.offsetWidth; im.style.animation = ''; }
    };
    const play = () => { stop(); timer = setInterval(() => go(cur + 1), 4200); };
    const stop = () => { if (timer) clearInterval(timer); timer = null; };

    dots.forEach(d => d.addEventListener('click', () => { go(+d.dataset.i); play(); }));
    $('#showPrev').addEventListener('click', () => { go(cur - 1); play(); });
    $('#showNext').addEventListener('click', () => { go(cur + 1); play(); });
    box.addEventListener('mouseenter', stop);
    box.addEventListener('mouseleave', play);

    let sx = null;
    box.addEventListener('touchstart', e => { sx = e.touches[0].clientX; stop(); }, { passive: true });
    box.addEventListener('touchend', e => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 45) go(cur + (dx < 0 ? 1 : -1));
      sx = null; play();
    }, { passive: true });

    // only autoplay while visible
    new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? play() : stop()),
      { threshold: .25 }).observe(box);
  }

  /* ---------------- POLAROID BOARD ---------------- */
  function board() {
    const box = $('#polaroidBoard');
    if (!box) return;
    const ids = MAP.polaroid || [0, 1, 2, 3, 4];
    box.innerHTML = ids.map(i => {
      const p = photo(i);
      return `<div class="polaroid" data-i="${i}">
        <img src="${esc(p.url)}" loading="lazy" alt="${esc(p.caption)}">
        <em>${esc(p.caption)}</em></div>`;
    }).join('');
  }

  /* ---------------- LETTERS ---------------- */
  function letters() {
    const box = $('#letterGrid');
    if (!box) return;
    box.innerHTML = S.map((s, i) => {
      const initial = (s.name || '?').trim().charAt(0).toUpperCase();
      return `<div class="env" data-i="${i}" tabindex="0">
        <div class="seal">${esc(initial)}</div>
        <div class="who"><b>${esc(s.name)}</b><span>চিঠি খুলুন</span></div>
      </div>`;
    }).join('');

    const modal = $('#letterModal');
    const openL = i => {
      const s = S[i]; if (!s) return;
      $('#paperName').textContent = 'প্রিয় স্যার,';
      $('#paperText').textContent = s.letter || '';
      $('#paperFrom').textContent = '— ' + s.name;
      modal.classList.add('on');
      document.body.classList.add('locked');
    };
    const closeL = () => { modal.classList.remove('on'); document.body.classList.remove('locked'); };

    $$('.env', box).forEach(e => {
      const i = +e.dataset.i;
      e.addEventListener('click', () => openL(i));
      e.addEventListener('keydown', ev => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openL(i); }
      });
    });
    $('#paperClose').addEventListener('click', closeL);
    modal.addEventListener('click', e => { if (e.target === modal) closeL(); });
    addEventListener('keydown', e => { if (e.key === 'Escape') closeL(); });
  }

  /* ---------------- WISH WALL ---------------- */
  const WKEY = 'td_wishes_v1';
  function wishes() {
    const box = $('#wishGrid');
    if (!box) return;
    const mine = () => { try { return JSON.parse(localStorage.getItem(WKEY)) || []; } catch (_) { return []; } };
    const render = () => {
      const all = W.concat(mine());
      box.innerHTML = all.map(w =>
        `<div class="note"><p>${esc(w.text)}</p><b>— ${esc(w.name)}</b></div>`).join('');
    };
    render();

    $('#wishAdd').addEventListener('click', () => {
      const n = $('#wishName').value.trim() || 'একজন শুভাকাঙ্ক্ষী';
      const t = $('#wishText').value.trim();
      if (!t) { $('#wishText').focus(); return; }
      const list = mine(); list.push({ name: n, text: t });
      try { localStorage.setItem(WKEY, JSON.stringify(list)); } catch (_) {}
      $('#wishText').value = '';
      render();
      const last = box.lastElementChild;
      if (last) last.scrollIntoView({ behavior: 'smooth', block: 'center' });
      confetti(60);
    });
    $('#wishReset').addEventListener('click', () => {
      try { localStorage.removeItem(WKEY); } catch (_) {}
      render();
    });
  }

  /* ---------------- QUOTE + DIYA ---------------- */
  const DKEY = 'td_diya_v1';
  function quote() {
    if ($('#sanskrit')) $('#sanskrit').textContent = Q.sanskrit || '';
    if ($('#meaning'))  $('#meaning').textContent  = Q.meaning  || '';

    const d = $('#diya'), c = $('#diyaCount');
    if (!d) return;
    let n = 0;
    try { n = parseInt(localStorage.getItem(DKEY) || '0', 10) || 0; } catch (_) {}
    const paint = () => {
      c.textContent = n > 0 ? `আপনি ${n} বার প্রণাম জানিয়েছেন 🙏` : '';
      d.classList.toggle('lit', n > 0);
    };
    paint();
    d.addEventListener('click', () => {
      n++;
      try { localStorage.setItem(DKEY, String(n)); } catch (_) {}
      paint();
      d.classList.remove('lit'); void d.offsetWidth; d.classList.add('lit');
      sparkle(d);
    });
  }

  function sparkle(el) {
    if (reduced) return;
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('div');
      const a = Math.random() * Math.PI * 2, dist = 40 + Math.random() * 60;
      s.style.cssText = `position:fixed;left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;
        width:5px;height:5px;border-radius:50%;background:#ffce6a;pointer-events:none;z-index:300;
        box-shadow:0 0 10px #ffb347;transition:transform .9s cubic-bezier(.2,.8,.2,1),opacity .9s`;
      document.body.appendChild(s);
      requestAnimationFrame(() => {
        s.style.transform = `translate(${Math.cos(a) * dist}px,${Math.sin(a) * dist - 30}px) scale(0)`;
        s.style.opacity = '0';
      });
      setTimeout(() => s.remove(), 950);
    }
  }

  /* ---------------- FINALE ---------------- */
  function finale() {
    const sg = $('#signs');
    if (sg) sg.innerHTML = S.map(s => `<span>${esc((s.name || '').split(' ')[0])}</span>`).join('');

    const cb = $('#celebrate');
    if (cb) cb.addEventListener('click', () => confetti(170));

    const sh = $('#share');
    if (sh) sh.addEventListener('click', () => {
      const txt = `Happy Teachers' Day, ${T.name || 'Sir'}! 🙏 আমাদের বানানো এই পাতাটা দেখুন — `;
      const url = location.href.split('#')[0];
      if (navigator.share) {
        navigator.share({ title: "Happy Teachers' Day", text: txt, url }).catch(() => {});
      } else {
        open('https://wa.me/?text=' + encodeURIComponent(txt + url), '_blank');
      }
    });
  }

  /* ---------------- CONFETTI ---------------- */
  function confetti(count) {
    if (reduced) return;
    const c = document.createElement('canvas');
    c.style.cssText = 'position:fixed;inset:0;z-index:250;pointer-events:none';
    c.width = innerWidth; c.height = innerHeight;
    document.body.appendChild(c);
    const g = c.getContext('2d');
    const cols = ['#e8c26a', '#f7e3a8', '#fff6d8', '#b98f3e', '#ffffff', '#ffce6a'];
    const bits = Array.from({ length: count }, () => ({
      x: innerWidth / 2 + (Math.random() - .5) * 160,
      y: innerHeight * .68,
      vx: (Math.random() - .5) * 16,
      vy: Math.random() * -17 - 5,
      w: Math.random() * 9 + 4,
      h: Math.random() * 6 + 3,
      c: cols[~~(Math.random() * cols.length)],
      r: Math.random() * 6, vr: (Math.random() - .5) * .38, life: 1
    }));
    (function frame() {
      g.clearRect(0, 0, c.width, c.height);
      let alive = false;
      bits.forEach(b => {
        b.vy += .44; b.vx *= .995;
        b.x += b.vx; b.y += b.vy; b.r += b.vr; b.life -= .008;
        if (b.life > 0 && b.y < c.height + 40) {
          alive = true;
          g.save(); g.translate(b.x, b.y); g.rotate(b.r);
          g.globalAlpha = Math.max(b.life, 0); g.fillStyle = b.c;
          g.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); g.restore();
        }
      });
      alive ? requestAnimationFrame(frame) : c.remove();
    })();
  }

  /* ---------------- PARTICLES ---------------- */
  function particles() {
    const cv = $('#particles');
    if (!cv || reduced) return;
    const cx = cv.getContext('2d');
    let ps = [];
    const resize = () => {
      cv.width = innerWidth; cv.height = innerHeight;
      const n = innerWidth < 700 ? 30 : 62;
      ps = Array.from({ length: n }, () => ({
        x: Math.random() * cv.width, y: Math.random() * cv.height,
        r: Math.random() * 1.9 + .4, s: Math.random() * .4 + .1,
        o: Math.random() * .5 + .12, d: Math.random() * .5
      }));
    };
    resize();
    addEventListener('resize', resize);
    (function draw() {
      cx.clearRect(0, 0, cv.width, cv.height);
      ps.forEach(p => {
        p.y -= p.s; p.x += Math.sin(p.y * .012) * p.d * .35;
        if (p.y < -8) { p.y = cv.height + 8; p.x = Math.random() * cv.width; }
        cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 7);
        cx.fillStyle = 'rgba(232,194,106,' + p.o + ')'; cx.fill();
      });
      requestAnimationFrame(draw);
    })();
  }

  /* ---------------- NAV / SCROLL ---------------- */
  function chrome() {
    const nav = $('#nav'), prog = $('#progress'), topBtn = $('#topBtn');
    const links = $$('.navlinks a');
    const secs = links.map(a => $(a.getAttribute('href'))).filter(Boolean);

    const onScroll = () => {
      const y = scrollY;
      const h = document.documentElement;
      prog.style.width = (y / (h.scrollHeight - h.clientHeight) * 100) + '%';
      nav.classList.toggle('stuck', y > 60);
      topBtn.classList.toggle('hide', y < 500);
      let act = -1;
      secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= innerHeight * .38) act = i; });
      links.forEach((l, i) => l.classList.toggle('active', i === act));
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    topBtn.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

    const burger = $('#burger'), nl = $('#navlinks');
    burger.addEventListener('click', () => nl.classList.toggle('open'));
    links.forEach(l => l.addEventListener('click', () => nl.classList.remove('open')));
  }

  /* ---------------- COUNTERS ---------------- */
  function counters() {
    $$('[data-count]').forEach(el => {
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const to = +el.dataset.count;
        let v = 0;
        const step = Math.max(Math.floor(900 / Math.max(to, 1)), 24);
        const t = setInterval(() => { v++; el.textContent = v; if (v >= to) clearInterval(t); }, step);
      }), { threshold: .5 });
      io.observe(el);
    });
  }

  /* ---------------- REVEAL ---------------- */
  function reveal() {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: .08, rootMargin: '0px 0px -40px' });
    $$('.rv').forEach(e => io.observe(e));
  }

  /* ---------------- MUSIC ---------------- */
  function music() {
    const btn = $('#musicBtn');
    if (!btn) return;
    let ctx = null, nodes = [], on = false;

    // gentle ambient chord — no external audio file needed
    const start = () => {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      const master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(.055, ctx.currentTime + 2.5);
      master.connect(ctx.destination);
      [261.63, 329.63, 392.00, 523.25].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.value = .25 / (i + 1);
        lfo.frequency.value = .05 + i * .017; lg.gain.value = .12 / (i + 1);
        lfo.connect(lg); lg.connect(g.gain);
        o.connect(g); g.connect(master);
        o.start(); lfo.start();
        nodes.push(o, lfo);
      });
    };
    const stop = () => {
      nodes.forEach(n => { try { n.stop(); } catch (_) {} });
      nodes = [];
      if (ctx) { try { ctx.close(); } catch (_) {} ctx = null; }
    };
    btn.addEventListener('click', () => {
      on = !on;
      btn.classList.toggle('playing', on);
      btn.textContent = on ? '🔊' : '🎵';
      btn.title = on ? 'Music off' : 'Music on';
      on ? start() : stop();
    });
  }

  /* ---------------- FIRST-VISIT TIP ---------------- */
  const TIPKEY = 'td_tip_seen_v1';
  function tip() {
    const el = $('#tip');
    if (!el) return;
    let seen = false;
    try { seen = localStorage.getItem(TIPKEY) === '1'; } catch (_) {}
    const anySet = Object.keys(savedFaces()).length > 0;
    if (seen || anySet) { el.remove(); return; }
    setTimeout(() => el.classList.add('on'), 5200);
    $('#tipOk').addEventListener('click', () => {
      el.classList.remove('on');
      try { localStorage.setItem(TIPKEY, '1'); } catch (_) {}
      setTimeout(() => el.remove(), 800);
    });
  }

  /* ---------------- INIT ---------------- */
  document.addEventListener('DOMContentLoaded', () => {
    preloader(); hero(); dedication(); timeline(); students(); studio();
    gallery(); lightbox(); slideshow(); board(); letters();
    wishes(); quote(); finale(); particles(); chrome();
    counters(); reveal(); music(); tip();
  });
})();
