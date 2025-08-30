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

  // 🚀 自动为每个 contact-card 分配错位淡入延迟（仅首页和泽凌）
  document.querySelectorAll('.contact-card').forEach((card, index) => {
    if (document.body.id !== "blog-page") { // ✅ 博客页面不走这段逻辑
      new IntersectionObserver((entries, observer) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.style.animationDelay = `${0.2 + index * 0.2}s`;
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      }, { threshold: 0.2 }).observe(card);
    }
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
  /* 📧 邮箱复制（支持多地址，带回退方案） */
  window.copyEmail = function(email) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(() => {
        showToast("📋 已复制: " + email);
      }).catch(err => {
        fallbackCopyText(email);
      });
    } else {
      fallbackCopyText(email);
    }
  };

  function fallbackCopyText(text) {
    const input = document.createElement("textarea");
    input.value = text;
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand("copy");
      showToast("📋 已复制: " + text);
    } catch (err) {
      alert("复制失败，请手动复制: " + text);
    }
    document.body.removeChild(input);
  }

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


/* ========== blog.html 独有逻辑 ========== */
if (document.body.id === "blog-page") {
  const listEl = document.getElementById("blogList");
  const postView = document.getElementById("postView");
  const postTitle = document.getElementById("postTitle");
  const postDate = document.getElementById("postDate");
  const postContent = document.getElementById("postContent");
  const backToList = document.getElementById("backToList");
  const loader = document.getElementById("loadingOverlay");

  // 加载 index.json
  fetch("blog/index.json")
    .then(res => res.json())
    .then(posts => {
      listEl.innerHTML = "";
      posts.forEach((post, index) => {
        const card = document.createElement("a");
        card.className = "contact-card";
        card.href = "javascript:void(0);";
        card.innerHTML = `
          <div class="text">
            <div class="value">${post.title}</div>
            <div class="label">${post.date}</div>
          </div>
        `;
        card.addEventListener("click", () => loadPost(post));
        listEl.appendChild(card);

        // ✅ 加入错位淡入动画
        new IntersectionObserver((entries, observer) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.style.animationDelay = `${0.2 + index * 0.2}s`;
              e.target.classList.add('visible');
              observer.unobserve(e.target);
            }
          });
        }, { threshold: 0.2 }).observe(card);
      });
    });

  // 加载单篇文章
  function loadPost(post) {
    loader.classList.add("show"); // 👉 点击卡片后立刻显示加载动画

    fetch("blog/" + post.file)
      .then(res => res.text())
      .then(md => {
        postTitle.textContent = post.title;
        postDate.textContent = post.date;
        postContent.innerHTML = marked.parse(md);
        listEl.style.display = "none";
        postView.style.display = "block";

        // ✅ 触发文章淡入动画
        postView.classList.remove("animate");
        void postView.offsetWidth; // 强制重绘
        postView.classList.add("animate");
      })
      .finally(() => {
        loader.classList.remove("show"); // 👉 加载完成后隐藏动画
      });
  }

  // 返回列表
  backToList.addEventListener("click", () => {
    postView.style.display = "none";
    listEl.style.display = "grid";
  });
}


/* ===================== Unified 3-page left/right transitions ===================== */
(function(){
  var ORDER = ["index","blog","zelynn"];

  function pageIdFromHref(href){
    if(!href) return null;
    var name = href.split("?")[0].split("#")[0].split("/").pop();
    if (name.indexOf("zelynn")>-1) return "zelynn";
    if (name.indexOf("blog")>-1) return "blog";
    if (name.indexOf("index")>-1) return "index";
    return null;
  }
  function currentId(){
    var id = (document.body && document.body.id) || "";
    return id.replace("-page","") || "index";
  }
  function clearAnims(el){
    ["slide-in-right","slide-in-left","slide-out-right","slide-out-left"].forEach(function(c){ el.classList.remove(c); });
  }
  function animateEnter(){
    try{
      var from = sessionStorage.getItem("from");
      if(!from) return;
      var to = currentId();
      var fromIdx = ORDER.indexOf(from);
      var toIdx = ORDER.indexOf(to);
      var page = document.querySelector(".page") || document.body;
      clearAnims(page);
      if (fromIdx>-1 && toIdx>-1){
        page.classList.add(toIdx>fromIdx ? "slide-in-right" : "slide-in-left");
        page.addEventListener("animationend", function handler(){ page.classList.remove("slide-in-right","slide-in-left"); page.removeEventListener("animationend", handler); }, { once:true });
      }
      sessionStorage.removeItem("from");
    }catch(e){}
  }
  function animateExit(toId, href){
    var cur = currentId();
    var page = document.querySelector(".page") || document.body;
    clearAnims(page);
    var curIdx = ORDER.indexOf(cur);
    var toIdx = ORDER.indexOf(toId);
    var dirClass = (toIdx>curIdx) ? "slide-out-left" : "slide-out-right";
    page.classList.add(dirClass);
    var navigated = false;
    var go = function(){ if(navigated) return; navigated = true; window.location.href = href; };
    page.addEventListener("animationend", go, { once:true });
    setTimeout(go, 480);
    try{ sessionStorage.setItem("from", cur); }catch(e){}
  }

  function interceptNav(){
    var links = document.querySelectorAll('.bottom-nav a[href$=".html"]');
    links.forEach(function(a){
      a.addEventListener("click", function(e){
        var href = a.getAttribute("href");
        var toId = pageIdFromHref(href);
        if(!toId) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        animateExit(toId, href);
      }, true);
    });
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", function(){
      interceptNav();
      animateEnter();
    });
  } else {
    interceptNav();
    animateEnter();
  }
})();

// 存储当前CSS版本状态
let usingFluentCss = localStorage.getItem('useFluentCss') === 'true';

// 初始化CSS版本
document.addEventListener('DOMContentLoaded', () => {
  applyCssVersion(usingFluentCss);
});

// 切换CSS版本
function toggleCssVersion() {
  usingFluentCss = !usingFluentCss;
  localStorage.setItem('useFluentCss', usingFluentCss);
  applyCssVersion(usingFluentCss);
  
  // 显示切换提示
  showCopiedTip(usingFluentCss ? '已切换到Fluent样式' : '已切换到原版样式');
}

// 应用CSS版本
function applyCssVersion(useFluent) {
  // 获取所有CSS链接
  const styleLink = document.querySelector('link[href="source/style.css"]');
  const fluentStyleLink = document.querySelector('link[href="source/style-fluent.css"]');
  
  if (useFluent) {
    // 启用Fluent CSS，禁用原版CSS
    if (styleLink) styleLink.disabled = true;
    if (fluentStyleLink) {
      fluentStyleLink.disabled = false;
    } else {
      // 如果不存在则创建Fluent CSS链接
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'source/style-fluent.css';
      document.head.appendChild(link);
    }
  } else {
    // 启用原版CSS，禁用Fluent CSS
    if (fluentStyleLink) fluentStyleLink.disabled = true;
    if (styleLink) {
      styleLink.disabled = false;
    } else {
      // 如果不存在则创建原版CSS链接
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'source/style.css';
      document.head.appendChild(link);
    }
  }
}

// 显示提示信息（复用现有提示功能）
function showCopiedTip(text) {
  const tip = document.querySelector('.copied-tip') || createCopiedTip();
  tip.textContent = text;
  tip.classList.add('show');
  
  setTimeout(() => {
    tip.classList.remove('show');
  }, 2000);
}

// 创建提示元素（如果不存在）
function createCopiedTip() {
  const tip = document.createElement('div');
  tip.className = 'copied-tip';
  document.body.appendChild(tip);
  return tip;
}