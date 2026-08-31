/* CrossTech contact form → Firestore `leads`.
   Vanilla JS. The Firebase SDK + config are loaded by contact.html from
   Firebase Hosting's reserved URLs (/__/firebase/...), so NO credentials
   exist in this repo. The lead document shape below is consumed by the
   mail process on the Firebase project side — do not rename fields. */
(function () {
  "use strict";

  var form = document.getElementById("contactForm");
  if (!form) return;

  var EMAIL_RE = /^[^\s()<>@,;:\/]+@\w[\w.-]+\.[a-z]{2,}$/i;

  function validateField(input) {
    var rule = input.getAttribute("data-rule");
    if (!rule) return true;

    var value = input.value.trim();
    var ok = true;
    var parts = rule.split(":");

    switch (parts[0]) {
      case "required":
        ok = value !== "";
        break;
      case "minlen":
        ok = value.length >= parseInt(parts[1], 10);
        break;
      case "email":
        ok = EMAIL_RE.test(value);
        break;
    }

    var msgEl = input.parentElement.querySelector(".validation");
    if (msgEl) msgEl.textContent = ok ? "" : (input.getAttribute("data-msg") || "Invalid input");
    return ok;
  }

  function generateReference(length) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var out = "";
    for (var i = 0; i < length; i++) {
      out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return out;
  }

  function sanitizeString(s) {
    return s.replace(/[^@.,!a-zA-Z0-9 ]/g, "");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var fields = form.querySelectorAll("input[data-rule], textarea[data-rule]");
    var allValid = true;
    fields.forEach(function (f) {
      if (!validateField(f)) allValid = false;
    });
    if (!allValid) return;

    var okBox = document.getElementById("sendMessage");
    var errBox = document.getElementById("errorMessage");
    var submitBtn = document.getElementById("submit");
    var ref = generateReference(10);

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    var db = firebase.firestore();
    db.collection("leads")
      .add({
        name: sanitizeString(document.getElementById("name").value),
        subject: sanitizeString(document.getElementById("subject").value),
        to: sanitizeString(document.getElementById("email").value),
        query: sanitizeString(document.getElementById("message").value),
        message: {
          subject: "CrossTech website query - " + ref,
          html:
            "<p>Thank you for your email.</p>" +
            "<p>This is an automated response to let you know that we have received your request and will respond to you within the next one to two working days.</p>" +
            "<p>Your reference number is " + ref + "</p>",
          text:
            "Thank you for your email. This is an automated response to let you know that we have received your request and will respond to you within the next one to two working days. Your reference number is " + ref,
          ccUids: "h2irRfsH1pEk5vmx3oNn"
        },
        timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
        actioned: false,
        emailSent: false,
        leadFrom: "Website",
        reference: ref
      })
      .then(function () {
        form.hidden = true;
        document.getElementById("refNumber").textContent = ref;
        okBox.classList.add("visible");
        errBox.classList.remove("visible");
      })
      .catch(function (err) {
        console.error("Lead submit failed:", err);
        errBox.classList.add("visible");
        submitBtn.disabled = false;
        submitBtn.textContent = "Send message";
      });
  });
})();
