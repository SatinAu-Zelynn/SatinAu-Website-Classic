/* 页面切换逻辑 */
let currentPage = "home"; // 默认首页

function switchPage(target) {
  if (target === currentPage) return;

  const currentEl = document.getElementById(currentPage);
  const targetEl = document.getElementById(target);

  // 重置目标页初始状态
  targetEl.classList.remove("to-left", "to-right", "active");
  targetEl.style.transition = "none";

  if (target === "zelynn") {
    targetEl.classList.add("to-right");
  } else {
    targetEl.classList.add("to-left");
  }

  // 强制 reflow 以应用初始位置
  targetEl.offsetHeight;

  // 播放动画：当前页滑出，目标页滑入
  targetEl.style.transition = "";
  currentEl.classList.remove("active");

  if (target === "zelynn") {
    currentEl.classList.add("to-left");
    targetEl.classList.remove("to-right");
  } else {
    currentEl.classList.add("to-right");
    targetEl.classList.remove("to-left");
  }

  targetEl.classList.add("active");

  // 更新底栏高亮状态
  document.querySelectorAll(".navbar button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === target);
  });

  currentPage = target;
}

/* 邮箱复制 */
function copyEmail() {
  const email = "mifanz090820@outlook.com";
  navigator.clipboard.writeText(email).then(()=>{
    const tip = document.getElementById("copiedTip");
    if (tip) {
      tip.classList.add("show");
      setTimeout(()=> tip.classList.add("done"), 250);
      setTimeout(()=>{ tip.classList.remove("show","done"); }, 1800);
    }
  });
}

/* iOS 弹窗逻辑 */
let pendingUrl = null;
function showIosAlert(url, msg="是否跳转到外部链接？") {
  pendingUrl = url;
  document.getElementById("iosAlertMsg").textContent = msg;
  document.getElementById("iosAlert").classList.add("show");
  document.getElementById("iosOverlay").classList.add("show");
}
function closeIosAlert() {
  document.getElementById("iosAlert").classList.remove("show");
  document.getElementById("iosOverlay").classList.remove("show");
  pendingUrl = null;
}
function confirmIosAlert() {
  if (pendingUrl) { window.open(pendingUrl, "_blank"); }
  closeIosAlert();
}

/* 页面加载动画 & 卡片入场 */
window.onload=function(){
  document.body.style.opacity=1;

  document.querySelectorAll('.contact-card').forEach(card=>{
    new IntersectionObserver((entries,observer)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    },{threshold:0.2}).observe(card);
  });

  // 底栏按钮事件绑定
  document.querySelectorAll(".navbar button").forEach(btn=>{
    btn.addEventListener("click", ()=> switchPage(btn.dataset.page));
    if (btn.dataset.page === currentPage) {
      btn.classList.add("active");
    }
  });

  /* ========== 手势滑动切换 ========== */
  let startX = 0;
  let endX = 0;

  document.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  document.addEventListener("touchend", e => {
    endX = e.changedTouches[0].clientX;
    const diff = endX - startX;

    if (Math.abs(diff) > 80) { // 滑动阈值
      if (diff < 0 && currentPage === "home") {
        // 左滑 → 去泽凌
        switchPage("zelynn");
      } else if (diff > 0 && currentPage === "zelynn") {
        // 右滑 → 回缎金SatinAu
        switchPage("home");
      }
    }
  });
};
