/* ========== index.html 独有逻辑 ========== */
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