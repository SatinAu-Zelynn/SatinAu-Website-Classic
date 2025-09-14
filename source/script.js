/* ========== 公用逻辑 ========== */

/* iOS 弹窗逻辑 */
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

/* 通用工具函数 */
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

/* 页面加载动画 & 卡片入场 */
window.onload = function () {
  document.body.style.opacity = 1;

  // 自动为每个 contact-card 分配错位淡入延迟（仅首页和泽凌）
  document.querySelectorAll('.contact-card').forEach((card, index) => {
    if (document.body.id !== "blog-page") { // 博客页面不走这段逻辑
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

  /* 页面进入动画（目标是 .page 而不是 body） */
  const PAGE = document.querySelector('.page') || document.body;
  const from = sessionStorage.getItem("from");
  if (from === "index") {
    PAGE.classList.add("slide-in-right");
  } else if (from === "zelynn") {
    PAGE.classList.add("slide-in-left");
  }
  sessionStorage.removeItem("from");
};

/* 底部导航栏页面切换（对 .page 做退出动画） */
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
  /* 邮箱复制（支持多地址，带回退方案） */
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

  /* 邮箱选择弹窗 */
  window.showEmailPopup  = () => { toggleModal("emailOverlay", true); toggleModal("emailPopup", true); };
  window.closeEmailPopup = () => { toggleModal("emailOverlay", false); toggleModal("emailPopup", false); };

  /* 微信二维码弹窗 */
  window.showWeChatQR  = () => { toggleModal("wechatOverlay", true); toggleModal("wechatQR", true); };
  window.closeWeChatQR = () => { toggleModal("wechatOverlay", false); toggleModal("wechatQR", false); };
}


/* ========== zelynn.html 独有逻辑（预留） ========== */
if (document.body.id === "zelynn-page") {
  // 未来如果要加交互逻辑，可以写在这里
}


/* ========== blog.html 独有逻辑 ========== */
if (document.body.id === "blog-page") {
  // DOM元素引用
  const listEl = document.getElementById("blogList");
  const postView = document.getElementById("postView");
  const postTitle = document.getElementById("postTitle");
  const postDate = document.getElementById("postDate");
  const postContent = document.getElementById("postContent");
  const backToList = document.getElementById("backToList");
  const loader = document.getElementById("loadingOverlay");
  const emptyState = document.getElementById("emptyState");
  const errorState = document.getElementById("errorState");
  const retryBtn = document.getElementById("retryBtn");
  const postError = document.getElementById("postError");
  
  // 缓存机制
  const postCache = new Map();
  let postsData = [];
  let currentPost = null;

  // 初始化
  function initBlog() {
    loadPostsList();
    
    // 返回列表按钮事件
    backToList.addEventListener("click", () => {
      postView.style.display = "none";
      listEl.style.display = "grid";
    });
    
    // 重试按钮事件
    retryBtn.addEventListener("click", loadPostsList);
    
    // 文章内重试按钮事件委托
    postView.addEventListener("click", (e) => {
      if (e.target.closest(".retryPost") && currentPost) {
        loadPost(currentPost, true);
      }
    });
  }

  // 加载文章列表
  function loadPostsList() {
    // 显示加载状态
    showLoading(true);
    listEl.style.display = "none";
    emptyState.style.display = "none";
    errorState.style.display = "none";

    fetch("https://blog.satinau.cn/index.json")
      .then(res => {
        if (!res.ok) throw new Error("网络响应异常");
        return res.json();
      })
      .then(posts => {
        postsData = posts;
        renderPostsList(posts);
        
        // 隐藏加载状态，显示列表
        showLoading(false);
        listEl.style.display = "grid";
        
        // 如果没有文章，显示空状态
        if (posts.length === 0) {
          listEl.style.display = "none";
          emptyState.style.display = "block";
        }
      })
      .catch(err => {
        console.error("加载文章列表失败:", err);
        showLoading(false);
        errorState.style.display = "block";
      });
  }

  // 渲染文章列表
  function renderPostsList(posts) {
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
      
      // 点击事件 - 使用防抖处理
      card.addEventListener("click", debounce(() => loadPost(post), 300));
      listEl.appendChild(card);

      // 加入错位淡入动画
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
  }

  // 加载单篇文章
  function loadPost(post, forceRefresh = false) {
    currentPost = post;
    postError.style.display = "none";
    postContent.innerHTML = "";
    
    // 显示加载动画
    showLoading(true);
    
    // 检查缓存
    if (!forceRefresh && postCache.has(post.file)) {
      renderPost(post, postCache.get(post.file));
      showLoading(false);
      return;
    }

    // 从网络加载
    fetch(`https://blog.satinau.cn/${post.file}`)
      .then(res => {
        if (!res.ok) throw new Error("文章加载失败");
        return res.text();
      })
      .then(md => {
        // 存入缓存
        postCache.set(post.file, md);
        renderPost(post, md);
      })
      .catch(err => {
        console.error("加载文章失败:", err);
        showLoading(false);
        postContent.innerHTML = "";
        postError.style.display = "block";
      });
  }

  // 渲染文章内容
  function renderPost(post, mdContent) {
    postTitle.textContent = post.title;
    postDate.textContent = post.date;
    
    // 优化Markdown渲染
    try {
      // 处理图片路径
      const processedMd = mdContent.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
        // 如果是相对路径，添加前缀
        if (!src.startsWith('http://') && !src.startsWith('https://')) {
          return `![${alt}](blog/${src})`;
        }
        return match;
      });
      
      postContent.innerHTML = marked.parse(processedMd);
      
      // 处理链接跳转
      postContent.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && 
            !href.startsWith('http://') && 
            !href.startsWith('https://')) {
          link.setAttribute('href', `blog/${href}`);
        }
        
        // 外部链接处理
        if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
          
          // 对于iOS设备使用弹窗确认
          link.addEventListener('click', (e) => {
            if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
              e.preventDefault();
              showIosAlert(href);
            }
          });
        }
      });
    } catch (err) {
      console.error("Markdown渲染失败:", err);
      postContent.innerHTML = "<p>文章解析错误，请稍后重试</p>";
    }
    
    // 显示文章视图
    listEl.style.display = "none";
    postView.style.display = "block";

    // 触发文章淡入动画
    postView.classList.remove("animate");
    void postView.offsetWidth; // 强制重绘
    postView.classList.add("animate");
    
    // 隐藏加载动画
    showLoading(false);
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 显示/隐藏加载动画
  function showLoading(show) {
    if (show) {
      loader.classList.add("show");
    } else {
      loader.classList.remove("show");
    }
  }

  // 防抖函数
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // 初始化博客页面
  document.addEventListener('DOMContentLoaded', initBlog);
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

// ---- 样式切换逻辑 更新版 ----
document.addEventListener('DOMContentLoaded', () => {
  // 初始化样式选项
  const styleOptions = document.querySelectorAll('input[name="style"]');
  const savedStyle = localStorage.getItem('preferredStyle') || 'sainau';

  // 设置初始选中状态
  const savedOption = document.querySelector(`input[name="style"][value="${savedStyle}"]`);
  if (savedOption) {
    savedOption.checked = true;
  }

  // 应用初始样式
  applyCssVersion(savedStyle);

  // 为每个选项添加change事件监听
  styleOptions.forEach(option => {
    option.addEventListener('change', function() {
      applyCssVersion(this.value);
      localStorage.setItem('preferredStyle', this.value);
      let msg = '已切换到SainAu Design样式';
      if (this.value === 'fluent') msg = '已切换到Microsoft Fluent样式';
      if (this.value === 'material') msg = '已切换到Google Material样式';
      showToast(msg);
    });
  });
});

// 应用CSS版本
function applyCssVersion(style) {
  const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
  cssLinks.forEach(link => {
    if (link.href.includes('style-fluent.css')) {
      link.disabled = style !== 'fluent';
    } else if (link.href.includes('style-material.css')) {
      link.disabled = style !== 'material';
    } else if (link.href.includes('style.css') && !link.href.includes('style-fluent.css') && !link.href.includes('style-material.css')) {
      link.disabled = style !== 'sainau';
    }
  });
}
