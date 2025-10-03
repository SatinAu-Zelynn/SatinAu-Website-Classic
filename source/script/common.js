/*
  Copyright 2025 缎金SatinAu

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

/* ========== 公用逻辑 ========== */

// 页面加载完成后设置当前年份
document.addEventListener('DOMContentLoaded', function() {
  // 获取当前年份
  const currentYear = new Date().getFullYear();
  // 设置到页面元素
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = currentYear;
  }
});

/* iOS 弹窗逻辑 */
let pendingUrl = null;

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function showIosAlert(url, msg = "是否跳转到外部链接？", appUrl = null) {
  pendingUrl = {
    webUrl: url,
    appUrl: appUrl
  };
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
  if (pendingUrl) {
    // 移动端优先尝试唤起APP
    if (isMobileDevice() && pendingUrl.appUrl) {
      try {
        // 尝试打开APP
        showToast("尝试打开APP");
        window.location.href = pendingUrl.appUrl;
        
        // 2秒后跳转网页作为备用
        setTimeout(() => {
          window.open(pendingUrl.webUrl, "_blank");
          closeIosAlert();
        }, 2000);
      } catch (err) {
        // 失败时直接跳转网页
        window.open(pendingUrl.webUrl, "_blank");
        closeIosAlert();
      }
    } else {
      // 桌面端直接跳转网页
      window.open(pendingUrl.webUrl, "_blank");
      closeIosAlert();
    }
  }
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
window.addEventListener('DOMContentLoaded', function() {
  // 优先显示页面UI
  document.body.style.opacity = 1;
  
  // 页面进入动画（目标是 .page 而不是 body）
  const PAGE = document.querySelector('.page') || document.body;
  const from = sessionStorage.getItem("from");
  if (from === "index") {
    PAGE.classList.add("slide-in-right");
  } else if (from === "zelynn") {
    PAGE.classList.add("slide-in-left");
  }
  sessionStorage.removeItem("from");

  // 处理卡片入场动画
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

  // 延迟加载需要后端数据的内容
  setTimeout(() => {
    document.body.style.width = '100%';
    window.dispatchEvent(new Event('resize'));
    if (document.body.id === "blog-page") {
      // 显示加载动画
      const loader = document.getElementById("loadingOverlay");
      if (loader) {
        loader.classList.add("show");
      }
      initBlog(); // 博客数据加载
    }
  }, 100); // 给UI渲染留一点时间
});

// SPA页面切换逻辑
document.addEventListener('DOMContentLoaded', function() {
  // 初始化SPA导航
  initSpaNavigation();
  toggleMoreMenu();
});

// 初始化SPA导航系统
function initSpaNavigation() {
  // 拦截底部导航点击
  document.querySelectorAll('.bottom-nav a').forEach(link => {
    link.addEventListener('click', function(e) {
      const targetUrl = this.getAttribute('href');
      // 只处理内部HTML页面
      if (targetUrl && targetUrl.endsWith('.html') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        spaNavigate(targetUrl);
      }
    });
  });

  // 处理浏览器历史记录
  window.addEventListener('popstate', function(e) {
    if (e.state && e.state.url) {
      loadPageContent(e.state.url, false);
    }
  });

  toggleMoreMenu();
}

// 页面导航核心函数
function spaNavigate(targetUrl) {
  const currentPage = document.querySelector('.page');
  const isZelynn = targetUrl.includes('zelynn');
  
  // 添加退出动画
  currentPage.classList.add(isZelynn ? 'slide-out-left' : 'slide-out-right');
  
  // 动画结束后加载新内容
  currentPage.addEventListener('animationend', function handler() {
    currentPage.removeEventListener('animationend', handler);
    loadPageContent(targetUrl, true);
  }, { once: true });
}

// 加载页面内容
function loadPageContent(url, addToHistory) {
  // 显示加载动画
  const loader = document.getElementById('loadingOverlay');
  if (loader) loader.classList.add('show');

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('加载失败');
      return response.text();
    })
    .then(html => {
      // 解析HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // 提取需要替换的内容
      const newPageContent = doc.querySelector('.page').innerHTML;
      const newTitle = doc.title;
      const newBodyId = doc.body.id;
      
      // 更新页面内容
      document.querySelector('.page').innerHTML = newPageContent;
      document.title = newTitle;
      document.body.id = newBodyId;
      
      // 更新历史记录
      if (addToHistory) {
        history.pushState({ url: url }, newTitle, url);
      }
      
      // 添加入场动画
      const page = document.querySelector('.page');
      const fromIndex = url.includes('zelynn');
      page.classList.remove('slide-out-left', 'slide-out-right');
      page.classList.add(fromIndex ? 'slide-in-left' : 'slide-in-right');
      
      // 动画结束后清理
      page.addEventListener('animationend', function handler() {
        page.removeEventListener('animationend', handler);
        page.classList.remove('slide-in-left', 'slide-in-right');
      }, { once: true });
      
      // 执行页面初始化逻辑
      if (newBodyId === 'zelynn-page' && typeof initZelynnPage === 'function') {
        initZelynnPage();
      } else if (newBodyId === 'blog-page' && typeof initBlog === 'function') {
        initBlog();
      }
      
      // 重新绑定事件
      initSpaNavigation();
      toggleMoreMenu();
      
      // 隐藏加载动画
      if (loader) loader.classList.remove('show');
    })
    .catch(error => {
      console.error('页面加载失败:', error);
      if (loader) loader.classList.remove('show');
      // 失败时降级为普通跳转
      window.location.href = url;
    });
}

// 保留原有代码，在底部导航部分修改预加载逻辑
document.querySelectorAll(".bottom-nav a").forEach(link => {
  // 移除原有的点击跳转逻辑，保留预加载
  link.addEventListener('mouseenter', preloadPage);
  link.addEventListener('touchstart', preloadPage, { passive: true });

  function preloadPage() {
    const target = link.getAttribute("href");
    if (target && target.endsWith(".html")) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'prefetch';
      preloadLink.href = target;
      document.head.appendChild(preloadLink);

      link.removeEventListener('mouseenter', preloadPage);
      link.removeEventListener('touchstart', preloadPage);
    }
  }
});

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

// ---- 样式切换逻辑 ----
document.addEventListener('DOMContentLoaded', () => {
  // 初始化样式选项
  const styleOptions = document.querySelectorAll('input[name="style"]');
  const savedStyle = localStorage.getItem('preferredStyle') || 'satinau';

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
      let msg = '已切换到SatinAu Design';
      if (this.value === 'fluent') msg = '已切换到Fluent UI';
      if (this.value === 'material') msg = '已切换到Material Design';
      showToast(msg);
    });
  });
});

// 应用CSS版本
function applyCssVersion(style) {
  const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
  cssLinks.forEach(link => {
    if (link.href.includes('fluent.css')) {
      link.disabled = style !== 'fluent';
    } else if (link.href.includes('material.css')) {
      link.disabled = style !== 'material';
    } else if (link.href.includes('satinau.css') && !link.href.includes('fluent.css') && !link.href.includes('material.css')) {
      link.disabled = style !== 'satinau';
    }
  });
}

// 更多菜单控制
let moreMenuVisible = false;

function toggleMoreMenu() {
  const dropdown = document.querySelector('.more-dropdown');
  if (dropdown) {
    moreMenuVisible = !moreMenuVisible;
    dropdown.classList.toggle('show', moreMenuVisible);
  }
}

// 点击其他区域关闭菜单
document.addEventListener('click', function(e) {
  const container = document.querySelector('.more-menu-container');
  if (moreMenuVisible && !container.contains(e.target)) {
    document.querySelector('.more-dropdown').classList.remove('show');
    moreMenuVisible = false;
  }
});

// 动态问候语
if (document.body.id === "index-page") {
  const greetingEl = document.getElementById('greeting');
  if (greetingEl) {
    const hour = new Date().getHours();
    let greeting = '';
    if (hour < 6) greeting = '凌晨好 🌙';
    else if (hour < 9) greeting = '早上好 🌞';
    else if (hour < 12) greeting = '上午好 ☀️';
    else if (hour < 14) greeting = '中午好 🍚';
    else if (hour < 18) greeting = '下午好 🌆';
    else if (hour < 22) greeting = '晚上好 🌃';
    else greeting = '夜深了，休息一下吧~';
    
    greetingEl.textContent = greeting;
    greetingEl.style.animation = 'fadeIn 1s ease forwards';
  }
}

// 控制台美化效果
function consoleBeautify() {
  // 输出带样式的文字信息
  console.log(
    "%c这里是缎金SatinAu https://satinau.cn",
    "color: #00FFCC; font-size: 16px; font-weight: bold;"
  );

  console.log(
    "%cCopyright 2025 缎金SatinAu",
    "color: #FFE92C; font-size: 14px;",
  );
  
  console.log(
    "%c当前页面: %s",
    "color: #5E447B; font-size: 14px;",
    window.location.pathname
  );
  
  console.log(
    "%c问题反馈请前往https://github.com/SatinAu-Zelynn/SatinAu-Website-Classic/issues/",
    "color: #FF9999; font-style: italic;"
  );
}

// 页面加载完成后执行
window.addEventListener('load', consoleBeautify);