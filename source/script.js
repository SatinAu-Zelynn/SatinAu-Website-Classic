/* 📧 邮箱复制（支持多地址） */
function copyEmail(email) {
  navigator.clipboard.writeText(email).then(() => {
    const tip = document.getElementById("copiedTip");
    if (tip) {
      tip.textContent = "📋 已复制: " + email;
      tip.classList.add("show");
      setTimeout(() => tip.classList.add("done"), 250);
      setTimeout(() => { tip.classList.remove("show", "done"); }, 1800);
    }
  });
}

/* 📧 邮箱选择弹窗逻辑 */
function showEmailPopup() {
  document.getElementById("emailOverlay").classList.add("show");
  document.getElementById("emailPopup").classList.add("show");
}
function closeEmailPopup() {
  document.getElementById("emailOverlay").classList.remove("show");
  document.getElementById("emailPopup").classList.remove("show");
}

/* 📱 iOS 弹窗逻辑 */
let pendingUrl = null;

function showIosAlert(url, msg = "是否跳转到外部链接？") {
  pendingUrl = url;
  const msgEl = document.getElementById("iosAlertMsg");
  if (msgEl) msgEl.textContent = msg;
  const alertEl = document.getElementById("iosAlert");
  const overlayEl = document.getElementById("iosOverlay");
  if (alertEl) alertEl.classList.add("show");
  if (overlayEl) overlayEl.classList.add("show");
}

function closeIosAlert() {
  const alertEl = document.getElementById("iosAlert");
  const overlayEl = document.getElementById("iosOverlay");
  if (alertEl) alertEl.classList.remove("show");
  if (overlayEl) overlayEl.classList.remove("show");
  pendingUrl = null;
}

function confirmIosAlert() {
  if (pendingUrl) { window.open(pendingUrl, "_blank"); }
  closeIosAlert();
}

/* 📱 微信二维码弹窗逻辑 */
function showWeChatQR() {
  document.getElementById("wechatOverlay").classList.add("show");
  document.getElementById("wechatQR").classList.add("show");
}
function closeWeChatQR() {
  document.getElementById("wechatOverlay").classList.remove("show");
  document.getElementById("wechatQR").classList.remove("show");
}

/* ✨ 页面加载动画 & 卡片入场 */
window.onload = function () {
  document.body.style.opacity = 1;

  // 🚀 自动为每个 contact-card 分配错位淡入延迟
  document.querySelectorAll('.contact-card').forEach((card, index) => {
    new IntersectionObserver((entries, observer) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          // 每个卡片比前一个延迟 0.2s
          e.target.style.animationDelay = `${0.2 + index * 0.2}s`;
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 }).observe(card);
  });

  /* 🚀 页面进入动画（目标是 .page 而不是 body） */
  const PAGE = document.querySelector('.page') || document.body;
  const from = sessionStorage.getItem("from");
  if (from === "index") {
    PAGE.classList.add("slide-in-right");
  } else if (from === "zelynn") {
    PAGE.classList.add("slide-in-left");
  }
  sessionStorage.removeItem("from");
};

/* 📌 底部导航栏页面切换（对 .page 做退出动画） */
document.querySelectorAll(".bottom-nav a").forEach(link => {
  link.addEventListener("click", function (e) {
    const target = this.getAttribute("href") || "";
    if (!target.endsWith(".html")) return; // 只处理站内页面
    e.preventDefault();

    const PAGE = document.querySelector('.page') || document.body;

    if (target.includes("zelynn")) {
      PAGE.classList.add("slide-out-left");
      sessionStorage.setItem("from", "index");
    } else {
      PAGE.classList.add("slide-out-right");
      sessionStorage.setItem("from", "zelynn");
    }

    setTimeout(() => { window.location.href = target; }, 500);
  });
});
