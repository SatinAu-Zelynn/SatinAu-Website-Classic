/* ========== 公用逻辑 ========== */

/* 📱 iOS 弹窗逻辑 */
let pendingUrl = null;

function showIosAlert(url, msg = "是否跳转到外部链接？") {
  pendingUrl = url;
  const msgEl = document.getElementById("iosAlertMsg");
  if (msgEl) msgEl.textContent = msg;
  toggleModal("iosOverlay", true);
  toggleModal("iosAlert", true);
}

function closeIosAlert() {
  toggleModal("iosOverlay", false);
  toggleModal("iosAlert", false);
  pendingUrl = null;
}

function confirmIosAlert() {
  if (pendingUrl) { window.open(pendingUrl, "_blank"); }
  closeIosAlert();
}

/* ✨ 通用工具函数 */
function toggleModal(id, show = true) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle("show", show);
}

function showToast(msg) {
  const tip = document.getElementById("copiedTip");
  if (!tip) return;
  tip.textContent = msg;
  tip.classList.add("show");
  setTimeout(() => tip.classList.add("done"), 250);
  setTimeout(() => { tip.classList.remove("show", "done"); }, 1800);
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


/* ========== index.html 独有逻辑 ========== */
if (document.body.id === "index-page") {
  /* 📧 邮箱复制（支持多地址） */
  window.copyEmail = function(email) {
    navigator.clipboard.writeText(email).then(() => {
      showToast("📋 已复制: " + email);
    });
  };

  /* 📧 邮箱选择弹窗 */
  window.showEmailPopup  = () => { toggleModal("emailOverlay", true); toggleModal("emailPopup", true); };
  window.closeEmailPopup = () => { toggleModal("emailOverlay", false); toggleModal("emailPopup", false); };

  /* 📱 微信二维码弹窗 */
  window.showWeChatQR  = () => { toggleModal("wechatOverlay", true); toggleModal("wechatQR", true); };
  window.closeWeChatQR = () => { toggleModal("wechatOverlay", false); toggleModal("wechatQR", false); };
}


/* ========== zelynn.html 独有逻辑（预留） ========== */
if (document.body.id === "zelynn-page") {
  // 未来如果要加交互逻辑，可以写在这里
}
