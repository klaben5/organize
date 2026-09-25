(function () {
    "use strict";

    // ---------------------------------------------------------------
    // Settings
    // ---------------------------------------------------------------

    // Paste your 30-minute event link here to turn on the embedded
    // scheduler, e.g. "https://calendly.com/your-name/30min" or
    // "https://cal.com/your-name/30min". Leave it empty to use the
    // built-in intake form, which emails the request to CONTACT_EMAIL.
    var SCHEDULER_URL = "";
    var CONTACT_EMAIL = "max@reduceturnover.ai";

    // ---------------------------------------------------------------
    // Conversion tracking (works with Plausible or GA4 if installed)
    // ---------------------------------------------------------------

    function track(name, props) {
        try {
            if (typeof window.plausible === "function") {
                window.plausible(name, { props: props || {} });
            }
            if (typeof window.gtag === "function") {
                window.gtag("event", name, props || {});
            }
        } catch (e) { /* analytics must never break the page */ }
    }

    // Carry UTM tags from launch links into the scheduler so bookings
    // can be traced back to LinkedIn, email, or DMs.
    function withUtm(url) {
        var params = new URLSearchParams(window.location.search);
        var out = new URL(url);
        params.forEach(function (value, key) {
            if (key.indexOf("utm_") === 0) {
                out.searchParams.set(key, value);
            }
        });
        if (out.hostname.indexOf("calendly.com") !== -1) {
            out.searchParams.set("embed_domain", window.location.hostname || "localhost");
            out.searchParams.set("embed_type", "Inline");
        } else if (out.hostname.indexOf("cal.com") !== -1) {
            out.searchParams.set("embed", "true");
        }
        return out.toString();
    }

    // ---------------------------------------------------------------
    // Consult pop-up
    // ---------------------------------------------------------------

    var modal = document.getElementById("consult-modal");
    var box = document.getElementById("modal-box");
    var schedulerView = document.getElementById("scheduler-view");
    var intakeView = document.getElementById("intake-view");
    var thanksView = document.getElementById("thanks-view");
    var intakeForm = document.getElementById("intake-form");
    var lastFocus = null;

    function show(view) {
        [schedulerView, intakeView, thanksView].forEach(function (v) {
            v.hidden = v !== view;
        });
        box.classList.toggle("wide", view === schedulerView);
    }

    function openModal() {
        lastFocus = document.activeElement;
        if (SCHEDULER_URL) {
            if (!schedulerView.firstChild) {
                var frame = document.createElement("iframe");
                frame.className = "scheduler-frame";
                frame.title = "Pick a time for your free consult";
                frame.src = withUtm(SCHEDULER_URL);
                schedulerView.appendChild(frame);
            }
            show(schedulerView);
        } else {
            show(intakeView);
        }
        modal.hidden = false;
        document.body.classList.add("modal-open");
        var first = modal.querySelector(SCHEDULER_URL ? ".modal-close" : "input");
        if (first) {
            first.focus();
        }
    }

    function closeModal() {
        modal.hidden = true;
        document.body.classList.remove("modal-open");
        if (lastFocus) {
            lastFocus.focus();
        }
    }

    function booked() {
        track("booking_completed");
        show(thanksView);
    }

    document.querySelectorAll("[data-consult]").forEach(function (el) {
        el.addEventListener("click", function (e) {
            e.preventDefault();
            track("consult_click", { location: el.getAttribute("data-cta") || "" });
            openModal();
        });
    });

    modal.addEventListener("click", function (e) {
        if (e.target === modal || e.target.hasAttribute("data-close")) {
            closeModal();
        }
    });

    document.addEventListener("keydown", function (e) {
        if (modal.hidden) {
            return;
        }
        if (e.key === "Escape") {
            closeModal();
        }
        // Keep keyboard focus inside the dialog
        if (e.key === "Tab") {
            var focusable = Array.prototype.filter.call(
                box.querySelectorAll("button, a[href], input, iframe"),
                function (el) { return el.offsetParent !== null; }
            );
            if (!focusable.length) {
                return;
            }
            var first = focusable[0];
            var last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    // Other pages link to "/#schedule" to open the pop-up on arrival
    if (window.location.hash === "#schedule") {
        history.replaceState(null, "", window.location.pathname + window.location.search);
        track("consult_click", { location: "link" });
        openModal();
    }

    // Booking confirmations posted by the embedded scheduler
    window.addEventListener("message", function (e) {
        var d = e.data;
        if (!d || typeof d !== "object") {
            return;
        }
        var calendlyBooked = d.event === "calendly.event_scheduled";
        var calcomBooked = d.originator === "CAL" &&
            (d.type === "bookingSuccessful" || d.type === "bookingSuccessfulV2");
        if (calendlyBooked || calcomBooked) {
            booked();
        }
    });

    // Fallback: turn the intake answers into an email request
    intakeForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!intakeForm.checkValidity()) {
            intakeForm.reportValidity();
            return;
        }
        var f = intakeForm.elements;
        var body = [
            "Name: " + f.name.value,
            "Email: " + f.email.value,
            "Company and role: " + f.company.value,
            "Approximate headcount: " + f.headcount.value,
            "People who left in the last 12 months: " + f.exits.value
        ].join("\n");
        window.location.href = "mailto:" + CONTACT_EMAIL +
            "?subject=" + encodeURIComponent("Free consult request: " + f.company.value) +
            "&body=" + encodeURIComponent(body);
        track("booking_completed", { method: "intake_form" });
        thanksView.querySelector("h2").textContent = "Thanks, we'll be in touch.";
        thanksView.querySelector("p").textContent =
            "Send the email that just opened and we'll reply with times within one business day. " +
            "Before we talk, jot down the role where turnover hurts most.";
        show(thanksView);
    });

    // ---------------------------------------------------------------
    // Cost model
    // ---------------------------------------------------------------

    var calc = document.getElementById("calc-form");
    if (calc) {
        var money = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0
        });

        var value = function (id) {
            var v = parseFloat(document.getElementById(id).value);
            return isFinite(v) && v > 0 ? v : 0;
        };

        var update = function () {
            var headcount = value("headcount");
            var exits = value("exits");
            var costPerExit = value("cost-per-exit");
            var annual = exits * costPerExit;

            document.getElementById("res-rate").textContent =
                headcount ? Math.round(exits / headcount * 100) + "%" : "–";
            document.getElementById("res-cost").textContent = money.format(annual);
            document.getElementById("res-savings").textContent = money.format(annual * 0.25);
        };

        var tracked = false;
        calc.addEventListener("input", function () {
            update();
            if (!tracked) {
                tracked = true;
                track("cost_model_used");
            }
        });
        calc.addEventListener("submit", function (e) { e.preventDefault(); });
        update();
    }
})();
