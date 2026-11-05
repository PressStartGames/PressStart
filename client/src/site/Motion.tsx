import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { desktop, loadGsap, motionOk, type Gsap } from '../lib/gsap';

// The motion director (DESIGN.md "Motion rules"). Pages only mark their elements:
//   .rv                  an in-view reveal, every device (CSS in site.css; this sets data-in)
//   data-m="hero"        the hero screen sinks into the chassis as the page scrolls
//   data-m="panel"       a dark act rises out of the chassis as it enters
//   data-m="flag"        a sticky strength stage scrubbed by scroll: [data-word] letters, [data-at] items,
//                        [data-tick] a running tick, [data-layer] exploded layers, [data-flash] a conflict
//   data-m="film"        a sticky film strip whose [data-track] runs sideways with the scroll
//   data-m="words"       a headline whose words rise once when it enters
//   data-m="count"       [data-count] numbers count up once when they enter
//   data-m="bar"         [data-seg] segments grow from the left once when they enter
// The prerendered HTML is the final state of all of it. GSAP is loaded after the browser is idle, on
// desktop with motion allowed only, and everything it creates is reverted on route change.
export function Motion() {
  const { pathname } = useLocation();

  useEffect(() => {
    const main = document.getElementById('main');
    if (!main) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute('data-in', '');
          io.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    main.querySelectorAll('.rv').forEach((el) => io.observe(el));

    if (!motionOk() || !desktop()) return () => io.disconnect();

    let cancelled = false;
    let revert: (() => void) | undefined;
    const idle =
      'requestIdleCallback' in window
        ? (cb: () => void) => window.requestIdleCallback(cb, { timeout: 1200 })
        : (cb: () => void) => window.setTimeout(cb, 60);
    idle(() => {
      void loadGsap(true).then((g) => {
        if (cancelled) return;
        revert = direct(g, main);
      });
    });
    return () => {
      cancelled = true;
      io.disconnect();
      revert?.();
    };
  }, [pathname]);

  return null;
}

function direct({ gsap, ScrollTrigger, SplitText }: Gsap, main: HTMLElement): () => void {
  const splits: Array<{ revert: () => void }> = [];
  const all = (sel: string, root: ParentNode = main) =>
    Array.from(root.querySelectorAll<HTMLElement>(sel));

  const ctx = gsap.context(() => {
    for (const el of all('[data-m="hero"]')) {
      const screen = el.querySelector<HTMLElement>('[data-hero-screen]');
      const copy = el.querySelector<HTMLElement>('[data-hero-copy]');
      const st = { trigger: el, start: 'top top', end: 'bottom top', scrub: true };
      if (screen) {
        gsap.to(screen, { scale: 0.9, borderRadius: 32, ease: 'none', scrollTrigger: st });
      }
      if (copy) gsap.to(copy, { yPercent: -18, autoAlpha: 0.15, ease: 'none', scrollTrigger: st });
    }

    for (const el of all('[data-m="panel"]')) {
      gsap.fromTo(
        el,
        { scale: 0.93, borderRadius: 40 },
        {
          scale: 1,
          borderRadius: 0,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 25%', scrub: true },
        },
      );
    }

    for (const el of all('[data-m="words"]')) {
      const split = new SplitText(el, { type: 'words', mask: 'words', wordsClass: 'split-w' });
      splits.push(split);
      gsap.from(split.words, {
        yPercent: 105,
        duration: 0.9,
        ease: 'power4.out',
        stagger: 0.05,
        // The masks did their job; give the headline back its plain text (and its descenders).
        onComplete: () => split.revert(),
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    }

    for (const el of all('[data-m="flag"]')) {
      el.setAttribute('data-gsap', '');
      const tl = gsap.timeline({ defaults: { ease: 'none' } });
      const word = el.querySelector<HTMLElement>('[data-word]');
      if (word) {
        const split = new SplitText(word, { type: 'chars', mask: 'chars', charsClass: 'split-c' });
        splits.push(split);
        tl.from(
          split.chars,
          { yPercent: 110, duration: 1.6, stagger: 0.12, ease: 'power3.out' },
          0,
        );
      }
      for (const item of all('[data-at]', el)) {
        const at = Number(item.dataset.at ?? 0);
        tl.from(item, { autoAlpha: 0, y: 14, duration: 0.6, ease: 'power2.out' }, 1 + at * 6);
      }
      for (const tick of all('[data-tick]', el)) {
        const end = Number(tick.dataset.tick ?? 0);
        const p = { t: 0 };
        tl.to(
          p,
          {
            t: end,
            duration: 6,
            onUpdate: () => {
              tick.textContent = String(Math.round(p.t)).padStart(3, '0');
            },
          },
          1,
        );
      }
      for (const layer of all('[data-layer]', el)) {
        tl.from(
          layer,
          { y: Number(layer.dataset.layer ?? 0), duration: 5, ease: 'power2.inOut' },
          1,
        );
      }
      for (const flash of all('[data-flash]', el)) {
        tl.fromTo(
          flash,
          { backgroundColor: '#ffb547' },
          { backgroundColor: 'transparent', duration: 0.3, repeat: 3, yoyo: true },
          1 + Number(flash.dataset.flash ?? 0) * 6,
        );
      }
      tl.to({}, { duration: 1.2 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        animation: tl,
      });
    }

    for (const el of all('[data-m="film"]')) {
      const track = el.querySelector<HTMLElement>('[data-track]');
      if (!track) continue;
      el.setAttribute('data-gsap', '');
      gsap.to(track, {
        x: () => -(track.scrollWidth - document.documentElement.clientWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });
    }

    for (const el of all('[data-m="count"]')) {
      const nums = all('[data-count]', el);
      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          for (const n of nums) {
            const end = Number(n.dataset.count ?? 0);
            const p = { v: 0 };
            gsap.to(p, {
              v: end,
              duration: 1.4,
              ease: 'power3.out',
              onUpdate: () => {
                n.textContent = String(Math.round(p.v));
              },
            });
          }
        },
      });
    }

    for (const el of all('[data-m="bar"]')) {
      gsap.from(all('[data-seg]', el), {
        scaleX: 0,
        transformOrigin: '0% 50%',
        duration: 1.1,
        ease: 'power3.inOut',
        stagger: 0.18,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    }
  }, main);

  ScrollTrigger.refresh();
  return () => {
    ctx.revert();
    for (const s of splits) s.revert();
    main.querySelectorAll('[data-gsap]').forEach((el) => el.removeAttribute('data-gsap'));
  };
}
