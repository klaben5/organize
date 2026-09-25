(function () {
    "use strict";

    // Mobile navigation
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.getElementById("nav-menu");
    toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    menu.addEventListener("click", function (e) {
        if (e.target.tagName === "A") {
            menu.classList.remove("open");
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Open menu");
        }
    });

    // Turnover cost calculator
    var money = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    });
    var count = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

    function num(id) {
        var v = parseFloat(document.getElementById(id).value);
        return isFinite(v) && v > 0 ? v : 0;
    }

    function setText(id, text) {
        document.getElementById(id).textContent = text;
    }

    function updateCalc() {
        var employees = num("employees");
        var salary = num("salary");
        var rate = num("rate") / 100;
        var cost = num("cost") / 100;
        var reduce = num("reduce") / 100;

        var leavers = employees * rate;
        var annualCost = leavers * salary * cost;
        var savings = annualCost * reduce;

        setText("rate-out", Math.round(rate * 100) + "%");
        setText("cost-out", Math.round(cost * 100) + "%");
        setText("reduce-out", Math.round(reduce * 100) + "%");
        setText("res-leavers", count.format(leavers));
        setText("res-cost", money.format(annualCost));
        setText("res-savings", money.format(savings));
    }

    var calc = document.getElementById("calc-form");
    calc.addEventListener("input", updateCalc);
    calc.addEventListener("submit", function (e) { e.preventDefault(); });
    updateCalc();

    // Contact form: validate before handing off to the mail client
    var form = document.getElementById("contact-form");
    var status = document.getElementById("form-status");
    form.addEventListener("submit", function (e) {
        if (!form.checkValidity()) {
            e.preventDefault();
            status.textContent = "Please enter your name and a valid work email.";
            form.reportValidity();
            return;
        }
        status.textContent = "Thanks! Your email app should open so you can send your request.";
    });

    setText("year", new Date().getFullYear());
})();
