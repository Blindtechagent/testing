$(document).ready(function () {
  const accountBtn = document.getElementById("accountBtn");
  const loginBtn = document.getElementById("loginBtn");
  const menuBtn = $('.menuBtn');
  const menuItems = $('#menuItems');

  if (accountBtn && loginBtn) {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        accountBtn.innerHTML = "Manage Account";
        accountBtn.href = "../menu/manageAccount.html";
        loginBtn.style.display = 'none';
      } else {
        accountBtn.innerHTML = "Create Account";
        accountBtn.href = "../menu/createAccount.html";
        loginBtn.style.display = 'block';
        loginBtn.href = "../menu/login.html";
      }
    });
  }

  if (menuBtn.length > 0 && menuItems.length > 0) {
    menuBtn.click(function () {
      const isHidden = menuItems.css("display") === "none";
      menuItems.toggle(500);
      menuBtn.attr("aria-expanded", !isHidden);
      menuBtn.attr("aria-label", isHidden ? "Close Navigation Menu" : "Open Navigation Menu");
    });
  }

  const copyBtns = document.querySelectorAll(".copyBtn");
  copyBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      const parent = btn.parentElement;
      const textCopy = parent.querySelector(".textCopy") || document.querySelector(".textCopy");
      if (textCopy) {
        const text = textCopy.innerText || textCopy.textContent;
        const input = document.createElement('textarea');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        announce("Text copied successfully!");
      }
    });
  });

  const copyTextBoxBtns = document.querySelectorAll(".copyTextBoxBtn");
  copyTextBoxBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      const parent = btn.parentElement;
      const textBoxCopy = parent.querySelector(".textBoxCopy") || document.querySelector(".textBoxCopy");
      if (textBoxCopy) {
        textBoxCopy.select();
        document.execCommand("copy");
        announce("Text copied successfully!");
      }
    });
  });
});

function announce(message) {
  var announcement = document.getElementById("announcement");
  if (announcement) {
    announcement.textContent = message;
    setTimeout(function() {
      announcement.textContent = "";
    }, 3000);
  }
}
