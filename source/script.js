/* 邮箱复制 */
function copyEmail() {
  const email = "mifanz090820@outlook.com";
  navigator.clipboard.writeText(email).then(()=>{
    const tip = document.getElementById("copiedTip");
    if (tip) {
      tip.classList.add("show");
      setTimeout(()=> tip.classList.add("done"), 250);
      setTimeout(()=>{
        tip.classList.remove("show","done");
      }, 1800);
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
};
