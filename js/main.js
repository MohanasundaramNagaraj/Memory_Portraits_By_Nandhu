/* =========================================================================
   Memory Portraits By Nandhu — Photography Portfolio
   main.js  (vanilla JavaScript, no dependencies)
   -------------------------------------------------------------------------
   Contents
   1.  Studio configuration  ← verified business details live here
   2.  Utilities
   3.  Preloader & page-enter
   4.  Header (transparent → solid)
   5.  Mobile navigation overlay
   6.  Scroll reveal (IntersectionObserver)
   7.  Gallery image fade-in
   8.  Lightbox
   9.  Contact / enquiry form (WhatsApp + email hand-off)
   10. Page transitions
   11. Init
   ========================================================================= */

(function () {
    "use strict";

    /* ---------------------------------------------------------------------
       1. Studio configuration
       Verified business details. Change them here and every page updates.
       email / website are intentionally empty until real values exist —
       features that need them (email hand-off) hide themselves automatically.
       --------------------------------------------------------------------- */
    const STUDIO_CONFIG = {
        name: "Memory Portraits By Nandhu",
        phone: "+91 97519 47133",
        whatsapp: "919751947133",

        address: "AK Square, 95/1, Gandhiji Street, Karur Rd, Kollampalayam, Tamil Nadu 638002, India",

        weddingInstagram: "https://www.instagram.com/memory_portraits_by_nandhu/",
        littleMemoriesInstagram: "https://www.instagram.com/little_memoryportraits/",

        email: "",
        website: "",

        // Pre-filled text when someone taps a WhatsApp button.
        whatsappGreeting: "Hello, I would like to enquire about a photography session.",
        emailSubject: "Photography enquiry from website"
    };



    /* ---------------------------------------------------------------------
       2. Utilities
       --------------------------------------------------------------------- */
    var doc = document;
    var body = doc.body;
    var html = doc.documentElement;
    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function qs(selector, scope) {
        return (scope || doc).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || doc).querySelectorAll(selector));
    }

    function whatsappUrl(message) {
        var text = encodeURIComponent(message || STUDIO_CONFIG.whatsappGreeting);
        return "https://wa.me/" + STUDIO_CONFIG.whatsapp + "?text=" + text;
    }

    function mapsUrl() {
        return "https://www.google.com/maps/search/?api=1&query=" +
            encodeURIComponent(STUDIO_CONFIG.name + ", " + STUDIO_CONFIG.address);
    }

    function hideWithParent(el) {
        var li = el.closest("li");
        (li || el).hidden = true;
    }

    function applyConfig() {
        qsa("[data-config]").forEach(function (el) {
            var key = el.getAttribute("data-config");

            switch (key) {
                case "whatsapp":
                    el.setAttribute("href", whatsappUrl());
                    el.setAttribute("target", "_blank");
                    el.setAttribute("rel", "noopener");
                    break;
                case "phone":
                    el.setAttribute("href", "tel:+" + STUDIO_CONFIG.whatsapp);
                    if (el.hasAttribute("data-config-text")) { el.textContent = STUDIO_CONFIG.phone; }
                    break;
                case "maps":
                    el.setAttribute("href", mapsUrl());
                    el.setAttribute("target", "_blank");
                    el.setAttribute("rel", "noopener");
                    break;
                case "email":
                    if (STUDIO_CONFIG.email) {
                        el.setAttribute("href", "mailto:" + STUDIO_CONFIG.email);
                        if (el.hasAttribute("data-config-text")) { el.textContent = STUDIO_CONFIG.email; }
                    } else {
                        hideWithParent(el);
                    }
                    break;
                case "website":
                    if (STUDIO_CONFIG.website) { el.setAttribute("href", STUDIO_CONFIG.website); } else { hideWithParent(el); }
                    break;
                default:
                    break;
            }
        });

        // Email hand-off in the enquiry form only makes sense with a real address.
        if (!STUDIO_CONFIG.email) {
            qsa(".js-email-action").forEach(function (btn) { btn.hidden = true; });
        }

        qsa("[data-year]").forEach(function (el) {
            el.textContent = String(new Date().getFullYear());
        });
    }



    /* ---------------------------------------------------------------------
       3. Preloader & page-enter
       Shows the studio mark briefly, then fades into the hero.
       Repeat visits within the same session use a much shorter hold.
       --------------------------------------------------------------------- */
    function initPreloader() {
        var preloader = qs(".preloader");
        var visited = false;

        try { visited = sessionStorage.getItem("visited") === "1"; } catch (e) { /* storage unavailable */ }

        var minHold = visited ? 250 : 900;
        var maxWait = 2500;
        var started = Date.now();
        var finished = false;

        function finish() {
            if (finished) { return; }
            finished = true;
            var elapsed = Date.now() - started;
            var wait = Math.max(0, minHold - elapsed);

            setTimeout(function () {
                if (preloader) { preloader.classList.add("is-done"); }
                body.classList.add("is-ready");
                try { sessionStorage.setItem("visited", "1"); } catch (e) { /* ignore */ }
                setTimeout(function () {
                    if (preloader && preloader.parentNode) { preloader.parentNode.removeChild(preloader); }
                }, 800);
            }, wait);
        }

        var heroImg = qs(".hero__media img");
        if (heroImg && !heroImg.complete) {
            heroImg.addEventListener("load", finish, { once: true });
            heroImg.addEventListener("error", finish, { once: true });
        } else if (doc.readyState === "complete") {
            finish();
        } else {
            window.addEventListener("load", finish, { once: true });
        }

        setTimeout(finish, maxWait);
    }


    /* ---------------------------------------------------------------------
       4. Header — transparent over hero, solid after scrolling
       --------------------------------------------------------------------- */
    function initHeader() {
        var header = qs(".site-header");
        if (!header) { return; }

        var threshold = 24;
        var ticking = false;

        function update() {
            header.classList.toggle("is-scrolled", window.scrollY > threshold);
            ticking = false;
        }

        window.addEventListener("scroll", function () {
            if (!ticking) {
                window.requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });

        update();
    }


    /* ---------------------------------------------------------------------
       5. Mobile navigation overlay
       --------------------------------------------------------------------- */
    function initNav() {
        var toggle = qs(".nav-toggle");
        var overlay = qs(".nav-overlay");
        if (!toggle || !overlay) { return; }

        function setOpen(open) {
            body.classList.toggle("nav-open", open);
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
            overlay.setAttribute("aria-hidden", open ? "false" : "true");
            if (open) {
                var first = qs("a", overlay);
                if (first) { setTimeout(function () { first.focus(); }, 350); }
            } else {
                toggle.focus();
            }
        }

        toggle.addEventListener("click", function () {
            setOpen(!body.classList.contains("nav-open"));
        });

        qsa("a", overlay).forEach(function (link) {
            link.addEventListener("click", function () {
                if (body.classList.contains("nav-open")) { body.classList.remove("nav-open"); toggle.setAttribute("aria-expanded", "false"); }
            });
        });

        doc.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && body.classList.contains("nav-open")) { setOpen(false); }
        });

        window.matchMedia("(min-width: 1024px)").addEventListener("change", function (e) {
            if (e.matches && body.classList.contains("nav-open")) { setOpen(false); }
        });
    }


    /* ---------------------------------------------------------------------
       6. Scroll reveal
       --------------------------------------------------------------------- */
    function initReveal() {
        var targets = qsa(".reveal, .reveal-stagger, .image-break");
        if (!targets.length) { return; }

        if (!("IntersectionObserver" in window) || prefersReducedMotion) {
            targets.forEach(function (el) { el.classList.add("is-visible"); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

        targets.forEach(function (el) { observer.observe(el); });
    }


    /* ---------------------------------------------------------------------
       7. Gallery image fade-in
       Images are hidden until loaded so lazy-loaded photos ease in.
       --------------------------------------------------------------------- */
    function initImageFade() {
        qsa(".gallery-item img").forEach(function (img) {
            function markLoaded() { img.classList.add("is-loaded"); }
            if (img.complete && img.naturalWidth > 0) {
                markLoaded();
            } else {
                img.addEventListener("load", markLoaded, { once: true });
                img.addEventListener("error", markLoaded, { once: true });
            }
        });
    }


    /* ---------------------------------------------------------------------
       8. Lightbox
       Groups: any element with [data-gallery]; items: a.gallery-item__link
       --------------------------------------------------------------------- */
    function initLightbox() {
        var groups = qsa("[data-gallery]");
        if (!groups.length) { return; }

        var lightbox = doc.createElement("div");
        lightbox.className = "lightbox";
        lightbox.setAttribute("role", "dialog");
        lightbox.setAttribute("aria-modal", "true");
        lightbox.setAttribute("aria-label", "Image viewer");
        lightbox.setAttribute("aria-hidden", "true");
        lightbox.innerHTML =
            '<div class="lightbox__stage">' +
                '<img class="lightbox__img" src="" alt="">' +
            '</div>' +
            '<span class="lightbox__counter" aria-live="polite"></span>' +
            '<p class="lightbox__caption"></p>' +
            '<button class="lightbox__btn lightbox__close" type="button" aria-label="Close">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
            '</button>' +
            '<button class="lightbox__btn lightbox__prev" type="button" aria-label="Previous image">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>' +
            '</button>' +
            '<button class="lightbox__btn lightbox__next" type="button" aria-label="Next image">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>' +
            '</button>';
        body.appendChild(lightbox);

        var stage = qs(".lightbox__stage", lightbox);
        var imgEl = qs(".lightbox__img", lightbox);
        var counterEl = qs(".lightbox__counter", lightbox);
        var captionEl = qs(".lightbox__caption", lightbox);
        var closeBtn = qs(".lightbox__close", lightbox);
        var prevBtn = qs(".lightbox__prev", lightbox);
        var nextBtn = qs(".lightbox__next", lightbox);

        var items = [];
        var index = 0;
        var isOpen = false;
        var lastFocus = null;
        var switchTimer = null;

        function collect(group) {
            return qsa("a.gallery-item__link", group).map(function (link) {
                var img = qs("img", link);
                var title = qs(".gallery-item__title", link.parentNode);
                var label = qs(".gallery-item__label", link.parentNode);
                return {
                    src: link.getAttribute("href"),
                    alt: img ? img.getAttribute("alt") || "" : "",
                    caption: [label && label.textContent.trim(), title && title.textContent.trim()].filter(Boolean).join(" — ")
                };
            });
        }

        function preload(i) {
            if (!items[i]) { return; }
            var im = new Image();
            im.src = items[i].src;
        }

        function show(i, immediate) {
            index = (i + items.length) % items.length;
            var item = items[index];

            function swap() {
                imgEl.setAttribute("src", item.src);
                imgEl.setAttribute("alt", item.alt);
                captionEl.textContent = item.caption;
                counterEl.textContent = (index + 1) + " / " + items.length;
                if (imgEl.complete) {
                    imgEl.classList.remove("is-switching");
                } else {
                    imgEl.addEventListener("load", function () { imgEl.classList.remove("is-switching"); }, { once: true });
                    imgEl.addEventListener("error", function () { imgEl.classList.remove("is-switching"); }, { once: true });
                }
                preload(index + 1);
                preload(index - 1);
            }

            var single = items.length < 2;
            prevBtn.hidden = single;
            nextBtn.hidden = single;
            counterEl.hidden = single;

            if (immediate || prefersReducedMotion) {
                imgEl.classList.add("is-switching");
                swap();
                return;
            }

            imgEl.classList.add("is-switching");
            clearTimeout(switchTimer);
            switchTimer = setTimeout(swap, 180);
        }

        function open(groupItems, i) {
            items = groupItems;
            lastFocus = doc.activeElement;
            isOpen = true;
            lightbox.classList.add("is-open");
            lightbox.setAttribute("aria-hidden", "false");
            body.classList.add("lightbox-open");
            show(i, true);
            setTimeout(function () { closeBtn.focus(); }, 50);
        }

        function close() {
            if (!isOpen) { return; }
            isOpen = false;
            lightbox.classList.remove("is-open");
            lightbox.setAttribute("aria-hidden", "true");
            body.classList.remove("lightbox-open");
            setTimeout(function () { imgEl.setAttribute("src", ""); }, 400);
            if (lastFocus && typeof lastFocus.focus === "function") { lastFocus.focus(); }
        }

        groups.forEach(function (group) {
            var links = qsa("a.gallery-item__link", group);
            links.forEach(function (link, i) {
                link.addEventListener("click", function (e) {
                    e.preventDefault();
                    open(collect(group), i);
                });
            });
        });

        closeBtn.addEventListener("click", close);
        prevBtn.addEventListener("click", function () { show(index - 1); });
        nextBtn.addEventListener("click", function () { show(index + 1); });

        // Click on the backdrop (outside the image) closes.
        stage.addEventListener("click", function (e) {
            if (e.target === stage) { close(); }
        });

        doc.addEventListener("keydown", function (e) {
            if (!isOpen) { return; }
            switch (e.key) {
                case "Escape": close(); break;
                case "ArrowLeft": show(index - 1); break;
                case "ArrowRight": show(index + 1); break;
                case "Tab": trapFocus(e); break;
                default: break;
            }
        });

        function trapFocus(e) {
            var focusable = [closeBtn, prevBtn, nextBtn].filter(function (b) { return !b.hidden; });
            var first = focusable[0];
            var last = focusable[focusable.length - 1];
            if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
        }

        // Touch swipe
        var touchStartX = 0;
        var touchStartY = 0;
        stage.addEventListener("touchstart", function (e) {
            touchStartX = e.changedTouches[0].clientX;
            touchStartY = e.changedTouches[0].clientY;
        }, { passive: true });

        stage.addEventListener("touchend", function (e) {
            var dx = e.changedTouches[0].clientX - touchStartX;
            var dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
                show(dx < 0 ? index + 1 : index - 1);
            }
        }, { passive: true });
    }


    /* ---------------------------------------------------------------------
       9. Contact / enquiry form
       Static site: validate client-side, then hand off to WhatsApp or email.
       --------------------------------------------------------------------- */
    function initContactForm() {
        var form = qs("#enquiry-form");
        if (!form) { return; }

        var status = qs(".form-status", form);
        var lastAction = "whatsapp";

        qsa("button[data-action]", form).forEach(function (btn) {
            btn.addEventListener("click", function () { lastAction = btn.getAttribute("data-action"); });
        });

        var validators = {
            name: function (v) { return v.trim().length >= 2 || "Please tell us your name."; },
            phone: function (v) { return /^[+\d][\d\s\-()]{6,17}$/.test(v.trim()) || "Please enter a valid phone number."; },
            email: function (v) { return v.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Please enter a valid email address."; },
            type: function (v) { return v !== "" || "Please choose a photography type."; },
            date: function () { return true; },
            message: function (v) { return v.trim().length >= 10 || "Please share a few words about your session."; }
        };

        function setError(field, message) {
            var wrap = field.closest(".form-field");
            var error = wrap ? qs(".form-error", wrap) : null;
            if (message) {
                wrap && wrap.classList.add("has-error");
                field.setAttribute("aria-invalid", "true");
                if (error) { error.textContent = message; }
            } else {
                wrap && wrap.classList.remove("has-error");
                field.removeAttribute("aria-invalid");
                if (error) { error.textContent = ""; }
            }
        }

        function validate() {
            var firstInvalid = null;
            Object.keys(validators).forEach(function (name) {
                var field = form.elements[name];
                if (!field) { return; }
                var result = validators[name](field.value);
                var message = result === true ? "" : result;
                setError(field, message);
                if (message && !firstInvalid) { firstInvalid = field; }
            });
            return firstInvalid;
        }

        qsa("input, select, textarea", form).forEach(function (field) {
            field.addEventListener("blur", function () {
                if (validators[field.name]) {
                    var result = validators[field.name](field.value);
                    setError(field, result === true ? "" : result);
                }
            });
            field.addEventListener("input", function () {
                if (field.closest(".form-field").classList.contains("has-error")) {
                    var result = validators[field.name] ? validators[field.name](field.value) : true;
                    if (result === true) { setError(field, ""); }
                }
            });
        });

        function buildMessage() {
            var f = form.elements;
            var lines = [
                "Hello, I would like to enquire about a photography session.",
                "",
                "Name: " + f.name.value.trim(),
                "Phone: " + f.phone.value.trim()
            ];
            if (f.email.value.trim()) { lines.push("Email: " + f.email.value.trim()); }
            lines.push("Photography type: " + f.type.options[f.type.selectedIndex].text);
            if (f.date.value) { lines.push("Preferred date: " + f.date.value); }
            lines.push("", f.message.value.trim());
            return lines.join("\n");
        }

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var firstInvalid = validate();

            if (firstInvalid) {
                firstInvalid.focus();
                if (status) { status.textContent = "Please check the highlighted fields."; }
                return;
            }

            var message = buildMessage();

            if (lastAction === "email") {
                var mailto = "mailto:" + STUDIO_CONFIG.email +
                    "?subject=" + encodeURIComponent(STUDIO_CONFIG.emailSubject) +
                    "&body=" + encodeURIComponent(message);
                if (status) { status.textContent = "Opening your email app…"; }
                window.location.href = mailto;
            } else {
                if (status) { status.textContent = "Opening WhatsApp…"; }
                window.open(whatsappUrl(message), "_blank", "noopener");
            }
        });
    }


    /* ---------------------------------------------------------------------
       10. Page transitions
       Fade out before navigating to another page of this site.
       --------------------------------------------------------------------- */
    function initPageTransitions() {
        if (prefersReducedMotion) { return; }

        var overlay = doc.createElement("div");
        overlay.className = "page-transition";
        overlay.setAttribute("aria-hidden", "true");
        body.appendChild(overlay);

        doc.addEventListener("click", function (e) {
            // Ignore clicks another handler has already dealt with (e.g. the lightbox).
            if (e.defaultPrevented) { return; }

            var link = e.target.closest("a[href]");
            if (!link) { return; }

            var href = link.getAttribute("href");
            if (!href || href.charAt(0) === "#" || link.hasAttribute("download") || link.target === "_blank") { return; }
            if (/^(mailto:|tel:|https?:|javascript:)/i.test(href) && link.origin !== window.location.origin) { return; }
            if (link.hasAttribute("data-no-transition")) { return; }
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) { return; }

            // Same page anchor (e.g. index.html#section) — let the browser handle it.
            var url = new URL(link.href, window.location.href);
            if (url.pathname === window.location.pathname && url.hash) { return; }

            // Only fade between HTML pages of this site, never for images or files.
            if (!/(\.html?|\/)$/i.test(url.pathname)) { return; }
            if (link.closest("[data-gallery]")) { return; }

            e.preventDefault();
            body.classList.add("is-leaving");
            setTimeout(function () { window.location.href = link.href; }, 320);
        });

        // Back/forward cache restore: make sure the page is visible again.
        window.addEventListener("pageshow", function (e) {
            if (e.persisted) { body.classList.remove("is-leaving"); }
        });
    }


    /* ---------------------------------------------------------------------
       11. Init
       --------------------------------------------------------------------- */
    function init() {
        applyConfig();
        initPreloader();
        initHeader();
        initNav();
        initReveal();
        initImageFade();
        initLightbox();
        initContactForm();
        initPageTransitions();
    }

    if (doc.readyState === "loading") {
        doc.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
