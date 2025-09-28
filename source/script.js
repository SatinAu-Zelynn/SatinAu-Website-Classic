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

/* 底部导航栏页面切换（对 .page 做退出动画） */
document.querySelectorAll(".bottom-nav a").forEach(link => {
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

  link.addEventListener("click", function (e) {
    const target = this.getAttribute("href") || "";
    if (!target.endsWith(".html")) return;
    e.preventDefault();

    const PAGE = document.querySelector('.page') || document.body;

    PAGE.addEventListener('animationend', () => {
      PAGE.classList.add('finished');
      window.location.href = target;
    }, { once: true });

    PAGE.classList.add(
      target.includes("zelynn") ? "slide-out-left" : "slide-out-right"
    );
    sessionStorage.setItem(
      "from",
      target.includes("zelynn") ? "index" : "zelynn"
    );
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


/* ========== zelynn.html 独有逻辑 ========== */
window.initZelynnPage = function() {
  // 确保DOM完全加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initZelynnContent);
  } else {
    initZelynnContent();
  }

  function initZelynnContent() {
    try {
      // 移动端尺寸适配处理
      handleMobileLayout();
      
      // 处理卡片入场动画
      const contactCards = document.querySelectorAll('.contact-card');
      if (contactCards.length && document.body.id === "zelynn-page") {
        contactCards.forEach((card, index) => {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                card.style.animationDelay = `${0.2 + index * 0.2}s`;
                card.classList.add('visible');
                observer.unobserve(card);
              }
            });
          }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
          });
          
          observer.observe(card);
        });
      }

      // 样式切换功能增强
      setupStyleSwitcher();
      
    } catch (error) {
      console.error('泽凌页面初始化错误:', error);
      document.querySelectorAll('.contact-card').forEach(card => {
        card.classList.add('visible');
      });
    }
  }

  // 移动端布局适配处理
  function handleMobileLayout() {
    // 针对小屏幕设备的特殊处理
    function adjustLayout() {
      const isMobile = window.innerWidth < 768;
      const container = document.querySelector('.container');
      
      if (container) {
        // 确保容器不超出屏幕宽度
        container.style.paddingLeft = isMobile ? '16px' : '24px';
        container.style.paddingRight = isMobile ? '16px' : '24px';
      }
      
      // 调整卡片容器在移动端的布局
      const langWrapper = document.querySelector('.lang-wrapper');
      if (langWrapper) {
        langWrapper.style.gridTemplateColumns = isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))';
      }
    }

    // 初始化时调整一次
    adjustLayout();
    // 窗口大小变化时重新调整
    window.addEventListener('resize', adjustLayout);
  }

  // 增强样式切换器稳定性
  function setupStyleSwitcher() {
    const styleSwitcher = document.querySelector('.style-switcher');
    if (!styleSwitcher) return;

    const styleLinks = {
      'sainau': document.querySelector('link[href="source/style.css"]'),
      'fluent': document.querySelector('link[href="source/style-fluent.css"]'),
      'material': document.querySelector('link[href="source/style-material.css"]')
    };

    // 从localStorage恢复用户偏好设置
    try {
      const savedStyle = localStorage.getItem('preferredStyle');
      if (savedStyle && styleLinks[savedStyle]) {
        Object.keys(styleLinks).forEach(key => {
          styleLinks[key].disabled = key !== savedStyle;
        });
        const radio = styleSwitcher.querySelector(`input[value="${savedStyle}"]`);
        if (radio) radio.checked = true;
      }
    } catch (e) {
      console.error('读取样式偏好失败:', e);
    }

    // 绑定切换事件
    styleSwitcher.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', function() {
        const style = this.value;
        if (styleLinks[style]) {
          Object.keys(styleLinks).forEach(key => {
            styleLinks[key].disabled = key !== style;
          });
          try {
            localStorage.setItem('preferredStyle', style);
          } catch (e) {
            console.error('保存样式偏好失败:', e);
          }
        }
      });
    });
  }
};

// 页面切换时的清理工作
window.addEventListener('beforeunload', function() {
  if (document.body.id === "zelynn-page") {
    // 移除resize事件监听
    window.removeEventListener('resize', handleMobileLayout);
  }
});


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
  const supabaseUrl = 'https://fluqmhywopwayiehzdik.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsdXFtaHl3b3B3YXlpZWh6ZGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MzgzMjUsImV4cCI6MjA3MzUxNDMyNX0.NEWnUQGvuhD55PDfUnJwxXYCfQHO_PONGSUBrT5_ta4';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userInfo = document.getElementById('userInfo');
  const authModal = document.getElementById('authModal');
  const closeAuthModal = document.getElementById('closeAuthModal');
  const emailLoginBtn = document.getElementById('emailLoginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const githubLoginBtn = document.getElementById('githubLoginBtn');
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  const authError = document.getElementById('authError');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const authTabs = document.querySelectorAll('.auth-tab');
  
  // 缓存机制
  const postCache = new Map();
  let postsData = [];
  let currentPost = null;

  // 初始化
  function initBlog() {
    // 先隐藏错误状态，显示加载状态
    const loader = document.getElementById("loadingOverlay");
    const emptyState = document.getElementById("emptyState");
    const errorState = document.getElementById("errorState");
  
    if (emptyState) emptyState.style.display = 'none';
    if (errorState) errorState.style.display = 'none';
    if (loader) loader.classList.add("show");

    loadPostsList().finally(() => {
      // 无论成功失败都隐藏加载动画
      if (loader) loader.classList.remove("show");
    });

    checkUserSession();
    setupAuthEventListeners();
    setupAuthStateListener();
    initBlogButtons();

  // 检查用户会话
  async function checkUserSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('会话检查失败:', error);
      return;
    }

    if (session) {
      showUserInfo(session.user);
    } else {
      showLoginButton();
    }
  }

  // 显示用户信息
  function showUserInfo(user) {
    // 从元数据中优先获取用户名
    const meta = user.raw_user_meta_data || {};
    const displayName = meta.name || meta.user_name || meta.preferred_username || user.email;
    userInfo.innerHTML = `欢迎, ${displayName}`;
    userInfo.style.display = 'inline-block';
    logoutBtn.style.display = 'inline-block';
    loginBtn.style.display = 'none';
  }

  // 显示登录按钮
  function showLoginButton() {
    loginBtn.style.display = 'inline-block';
    userInfo.style.display = 'none';
    logoutBtn.style.display = 'none';
  }

  function setupAuthStateListener() {
    // 监听登录状态变化（包括OAuth回调）
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // 登录成功，显示用户信息
        showUserInfo(session.user);
        // 关闭登录弹窗（如果打开）
        authModal.style.display = 'none';
        // 可以在这里添加登录成功后的其他操作（如刷新文章列表等）
        showToast('登录成功');
      } else if (event === 'SIGNED_OUT') {
        // 登出成功
        showLoginButton();
        showToast('已退出登录');
      }
    });
  }
    
  // 设置认证事件监听
  function setupAuthEventListeners() {
    // 登录按钮
    loginBtn.addEventListener('click', () => {
      authModal.style.display = 'block';
      authModal.classList.add('show');
      const modalContent = authModal.querySelector('.modal');
      if (modalContent) {
        modalContent.classList.add('show');
      }
    });

    // 关闭弹窗
    closeAuthModal.addEventListener('click', () => {
      authModal.style.display = 'none';
      authModal.classList.remove('show')
      const modalContent = authModal.querySelector('.modal');
      if (modalContent) {
        modalContent.classList.remove('show');
      }
      authError.textContent = '';
    });

    // 标签切换
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        authTabs.forEach(t => t.style.display = 'none');
        btn.classList.add('active');
        document.getElementById(`${tab}Tab`).style.display = 'block';
      });
    });

    // 邮箱登录
    emailLoginBtn.addEventListener('click', async () => {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        authError.textContent = error.message;
      } else {
        showUserInfo(data.user);
        authModal.style.display = 'none';
      }
    });

    // 注册新用户
    signupBtn.addEventListener('click', async () => {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) {
        authError.textContent = error.message;
      } else {
        authError.textContent = '注册成功';
        authError.style.color = 'green'; // 改为绿色提示
        document.getElementById('emailTab').style.display = 'block';
        document.getElementById('oauthTab').style.display = 'none';
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelector('[data-tab="email"]').classList.add('active');
      }
    });

    // GitHub 登录
    githubLoginBtn.addEventListener('click', async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          // 指定回调地址
          redirectTo: window.location.origin + '/blog'
        }
      });
    
      if (error) {
        authError.textContent = error.message;
      }
    });

    // Google 登录
    googleLoginBtn.addEventListener('click', async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      });
      
      if (error) {
        authError.textContent = error.message;
      }
    });

    // 退出登录
    logoutBtn.addEventListener('click', async () => {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        showLoginButton();
      }
    });

    // 监听认证状态变化
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        showUserInfo(session.user);
      } else {
        showLoginButton();
      }
    });
  }
    
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

    // 显式返回 fetch 的 Promise 链
    return fetch("https://blog.satinau.cn/index.json")
      .then(res => {
        if (!res.ok) throw new Error("网络响应异常");
        return res.json();
      })
      .then(posts => {
        postsData = posts;
        renderPostsList(posts);
      
        // 隐藏加载状态，显示列表
        listEl.style.display = "grid";
      
        // 如果没有文章，显示空状态
        if (posts.length === 0) {
          listEl.style.display = "none";
          emptyState.style.display = "block";
        }
      })
      .catch(err => {
        console.error("加载文章列表失败:", err);
        errorState.style.display = "block";
        throw err; // 继续抛出错误，让调用者可以捕获
      })
      .finally(() => {
        // 无论成功失败，最终都隐藏加载动画
        showLoading(false);
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
      document.querySelector('.bottom-nav').style.pointerEvents = 'auto';
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

  // 初始化按钮事件监听
  function initBlogButtons() {
    // 返回文章列表按钮
    const backToListBtn = document.getElementById('backToListBtn');
    if (backToListBtn) {
      backToListBtn.addEventListener('click', () => {
        postView.style.display = 'none';
        listEl.style.display = 'grid';
        emptyState.style.display = 'none';
        window.scrollTo(0, 0);
      });
    }

    // 返回顶部按钮
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }

  const downloadBtn = document.getElementById('downloadArticle');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadCurrentArticle);
  }

  function downloadCurrentArticle() {
    // 获取文章标题和内容
    const title = postTitle ? postTitle.textContent.trim() : '未命名文章';
    const date = postDate ? postDate.textContent.trim() : '';
    const content = postContent ? postContent.innerText.trim() : '';
  
    // 构建要下载的文本内容
    let textContent = `${title}\n\n`;
    if (date) textContent += `发布日期: ${date}\n\n`;
    textContent += content;
    textContent += `\n---\n`;
    textContent += `作者: 缎金SatinAu\n`;
    textContent += `来源: https://satinau.cn/\n`;
  
    // 创建Blob对象
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  
    // 创建下载链接
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
  
    // 设置下载属性
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.txt`; // 替换空格为下划线
  
    // 触发下载
    document.body.appendChild(a);
    a.click();
  
    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('文章已下载');
    }, 0);
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
      let msg = '已切换到SainAu Design';
      if (this.value === 'fluent') msg = '已切换到Microsoft Fluent';
      if (this.value === 'material') msg = '已切换到Google Material';
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
      link.disabled = style !== 'satinau';
    }
  });
}
