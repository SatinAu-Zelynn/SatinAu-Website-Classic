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

class SiteFooter extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <footer>
        <p>
            © <span id="current-year"></span> 缎金SatinAu. 保留所有权利
            <br>
            <img src="/source/image/svg/cloudflare.svg" role="img" alt="Cloudflare" style="width:1em;height:1em;vertical-align:middle;margin:0 4px;">
            Cloudflare
            <img src="/source/image/svg/cloudflarepages.svg" role="img" alt="Cloudflare Pages" style="width:1em;height:1em;vertical-align:middle;margin:0 4px;">
            <img src="/source/image/svg/cloudflareworkers.svg" role="img" alt="Cloudflare Workers" style="width:1em;height:1em;vertical-align:middle;margin:0 4px;">
            提供边缘计算服务
            <br>
            <a href="/LICENSE" target="_blank" type="text/plain">开源协议</a>
            <a href="/sitemap.xml" target="_blank">站点地图</a>
            <a href="https://github.com/SatinAu-Zelynn/SatinAu-Website-Classic/issues/new" target="_blank">问题反馈</a>
        </p>
      </footer>
    `;
  }
}

customElements.define('site-footer', SiteFooter);