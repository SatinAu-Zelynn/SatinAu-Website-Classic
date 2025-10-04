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

/* ============= zelynn.html 独有逻辑 ============= */
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
      'satinau': document.querySelector('link[href="source/style/satinau.css"]'),
      'fluent': document.querySelector('link[href="source/style/fluent.css"]'),
      'material': document.querySelector('link[href="source/style/material.css"]')
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