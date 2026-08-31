//Contact
var submitButton = document.getElementById('submit')

if (submitButton) {
    submitButton.addEventListener('click', event => {
        var f = $('form.contactForm').find('.form-group'),
            ferror = false,
            emailExp = /^[^\s()<>@,;:\/]+@\w[\w\.-]+\.[a-z]{2,}$/i;

        f.children('input').each(function () { // run all inputs

            var i = $(this); // current input
            var rule = i.attr('data-rule');

            if (rule !== undefined) {
                var ierror = false; // error flag for current input
                var pos = rule.indexOf(':', 0);
                if (pos >= 0) {
                    var exp = rule.substr(pos + 1, rule.length);
                    rule = rule.substr(0, pos);
                } else {
                    rule = rule.substr(pos + 1, rule.length);
                }

                switch (rule) {
                    case 'required':
                        if (i.val() === '') {
                            ferror = ierror = true;
                        }
                        break;

                    case 'minlen':
                        if (i.val().length < parseInt(exp)) {
                            ferror = ierror = true;
                        }
                        break;

                    case 'email':
                        if (!emailExp.test(i.val())) {
                            ferror = ierror = true;
                        }
                        break;

                    case 'checked':
                        if (!i.is(':checked')) {
                            ferror = ierror = true;
                        }
                        break;

                    case 'regexp':
                        exp = new RegExp(exp);
                        if (!exp.test(i.val())) {
                            ferror = ierror = true;
                        }
                        break;
                }
                i.next('.validation').html((ierror ? (i.attr('data-msg') !== undefined ? i.attr('data-msg') : 'wrong Input') : '')).show('blind');
            }
        });
        f.children('textarea').each(function () { // run all inputs

            var i = $(this); // current input
            var rule = i.attr('data-rule');

            if (rule !== undefined) {
                var ierror = false; // error flag for current input
                var pos = rule.indexOf(':', 0);
                if (pos >= 0) {
                    var exp = rule.substr(pos + 1, rule.length);
                    rule = rule.substr(0, pos);
                } else {
                    rule = rule.substr(pos + 1, rule.length);
                }

                switch (rule) {
                    case 'required':
                        if (i.val() === '') {
                            ferror = ierror = true;
                        }
                        break;

                    case 'minlen':
                        if (i.val().length < parseInt(exp)) {
                            ferror = ierror = true;
                        }
                        break;
                }
                i.next('.validation').html((ierror ? (i.attr('data-msg') != undefined ? i.attr('data-msg') : 'wrong Input') : '')).show('blind');
            }
        });
        if (ferror) {
            return false;
        } else {
            var leadName = document.getElementById('name').value;
            var leadEmail = document.getElementById('email').value;
            var leadSubject = document.getElementById('subject').value;
            var leadMessage = document.getElementById('message').value;

            if (leadSubject != "" && leadEmail != "" && leadName != "") {
                var db = firebase.firestore();
                var docRef = db.collection("leads");
                var ref = generateReference(10);

                docRef.add({
                    name: sanitizeString(leadName),
                    subject: sanitizeString(leadSubject),
                    to: sanitizeString(leadEmail),
                    query: sanitizeString(leadMessage),
                    message: {
                        subject: 'CrossTech website query - ' + ref,
                        html: `<p>Thank you for your email.</p>
                      <p>This is an automated response to let you know that we have received your request and will respond to you within the next one to two working days.</p>
                      <p>Your reference number is ${ref}</p>`,
                        text: `Thank you for your email. This is an automated response to let you know that we have received your request and will respond to you within the next one to two working days. Your reference number is ${ref}`,
                        ccUids: 'h2irRfsH1pEk5vmx3oNn'
                    },
                    timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
                    actioned: false,
                    emailSent: false,
                    leadFrom: 'Website',
                    reference: ref
                }).then(function () {
                    $('.contactForm').hide();
                    $('<p>' + ref + '<p/>').appendTo('#sendMessage');
                    $('.sendMessage').css('display', 'block');
                    $('.errorMessage').css('display', 'none');
                }).catch(function (err) {
                    console.log(err);
                    $('.errorMessage').css('display', 'block');
                });
            }
        }
    });
}

function generateReference(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function sanitizeString(oldString) {
    return oldString.replace(/[^@.,!a-zA-Z0-9 ]/g, "");
}

