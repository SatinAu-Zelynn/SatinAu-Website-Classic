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

class NavigateBar extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // 获取当前页面路径作为默认激活项
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    // 主导航项数据
    const navItems = [
      { cn: '缎金', en: 'SatinAu', href: 'index.html' },
      { cn: '博客', en: 'Blog', href: 'blog.html' },
      { cn: '泽凌', en: 'Zelynn', href: 'zelynn.html' }
    ];

    // 更多选项菜单数据
    const moreItems = [
      { label: '网站设置', href: 'settings.html' },
    ];

    // 构建HTML结构
    this.innerHTML = `
      <nav class="bottom-nav">
        <div class="nav-avatar">
          <img src="/source/image/favicon.ico" alt="Avatar">
        </div>
        ${navItems.map(item => `
          <a 
            href="/${item.href}" 
            class="${currentPath === item.href ? 'active' : ''}"
          >
            <span class="nav-cn">${item.cn}</span>
            <span class="nav-en">${item.en}</span>
          </a>
        `).join('')}
        <div class="more-menu-container">
          <button class="more-btn" onclick="toggleMoreMenu()">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <circle cx="6" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="18" cy="12" r="2" />
            </svg>
          </button>
          <div class="more-dropdown">
            <a href="https://c6.y.qq.com/base/fcgi-bin/u?__=Fy3CGi4gRscv" target="_blank" class="dropdown-item">
              我的歌单
            </a>
            ${moreItems.map(item => `
              <a 
                href="/pages/${item.href}" 
                class="dropdown-item ${currentPath === item.href ? 'active' : ''}"
                onclick="window.location.href='/pages/settings.html'; return false;"
                ${item.target ? `target="${item.target}"` : ''}
              >
                ${item.label}
              </a>
            `).join('')}
          </div>
        </div>
      </nav>
    `;
  }
}

// 定义自定义元素
customElements.define('navigate-bar', NavigateBar);