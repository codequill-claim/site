(function () {
    'use strict';

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Service-status (hero pill + footer link) ───────────
    function refreshStatus() {
        var targets = document.querySelectorAll('[data-status-pill], [data-status-footer]');
        if (!targets.length) return;
        fetch('https://status.codequill.xyz/api/status-page/codequill', { cache: 'no-store' })
            .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
            .then(function (data) {
                var hasIncident = !!(data && data.incident);
                var underMaintenance = !!(data && Array.isArray(data.maintenanceList) && data.maintenanceList.length);
                var status = hasIncident ? 'down' : underMaintenance ? 'degraded' : 'operational';
                var label = status === 'operational' ? 'All Systems Operational'
                    : status === 'degraded' ? 'Under Maintenance' : 'Active Incident';
                targets.forEach(function (el) {
                    el.setAttribute('data-status', status);
                    var labelEl = el.querySelector('[data-status-label]');
                    if (labelEl) labelEl.textContent = label;
                });
            })
            .catch(function () { /* keep current state silently */ });
    }
    refreshStatus();
    setInterval(refreshStatus, 60000);

    // ── Scroll-driven nav pill compression ─────────────────
    var header = document.getElementById('siteHeader');
    if (header) {
        var update = function () {
            if (window.scrollY > 50) header.classList.add('is-scrolled');
            else header.classList.remove('is-scrolled');
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
    }

    // ── Active section tracking ────────────────────────────
    if (header && 'IntersectionObserver' in window) {
        var sections = document.querySelectorAll('section[id]');
        var visible = new Map();
        var setActive = function () {
            var top = null;
            var best = -Infinity;
            visible.forEach(function (ratio, id) {
                if (ratio > best) { best = ratio; top = id; }
            });
            if (top) header.setAttribute('data-active-section', top);
        };
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) visible.set(e.target.id, e.intersectionRatio);
                else visible.delete(e.target.id);
            });
            setActive();
        }, { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });
        sections.forEach(function (s) { obs.observe(s); });
    }

    // ── Reveal-on-scroll (progressive enhancement) ──────────
    // Default is opacity 1; only elements still BELOW the fold get the hidden state.
    // Above-the-fold elements stay visible. As scrolling reveals more, IO swaps each in.
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
        document.documentElement.classList.add('js-anim');
        var vh = window.innerHeight;
        var revealObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    e.target.classList.add('is-visible');
                    revealObs.unobserve(e.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
        document.querySelectorAll('.reveal-on-scroll').forEach(function (el) {
            var rect = el.getBoundingClientRect();
            if (rect.top < vh) {
                el.classList.add('is-visible');
            } else {
                revealObs.observe(el);
            }
        });
    }

    // ── Mobile menu ────────────────────────────────────────
    var menuToggle = document.getElementById('landingMenuToggle');
    var menu = document.getElementById('landingMobileMenu');
    if (menuToggle && menu) {
        var openIcon = menuToggle.querySelector('.landing-nav-mobile-open');
        var closeIcon = menuToggle.querySelector('.landing-nav-mobile-close');
        var setOpen = function (open) {
            menu.hidden = !open;
            menuToggle.setAttribute('aria-expanded', String(open));
            if (openIcon) openIcon.style.display = open ? 'none' : '';
            if (closeIcon) closeIcon.style.display = open ? '' : 'none';
            document.body.style.overflow = open ? 'hidden' : '';
        };
        menuToggle.addEventListener('click', function () {
            setOpen(menu.hidden);
        });
        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () { setOpen(false); });
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !menu.hidden) setOpen(false);
        });
    }
})();
