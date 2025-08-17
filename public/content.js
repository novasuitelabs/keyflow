const c=(e,t=null)=>{try{return chrome.runtime?.id?(t?chrome.runtime.sendMessage(e,o=>{if(chrome.runtime.lastError){chrome.runtime.lastError.message.includes("Extension context invalidated")?console.log("KeyFlow: Extension updated, please reload page for full functionality"):console.warn("KeyFlow: Runtime error:",chrome.runtime.lastError.message);return}t(o)}):chrome.runtime.sendMessage(e).catch(o=>{o.message.includes("Extension context invalidated")?console.log("KeyFlow: Extension updated, please reload page for full functionality"):console.warn("KeyFlow: Failed to send message:",o.message)}),!0):(console.log("KeyFlow: Extension context invalidated, please reload page for full functionality"),!1)}catch(o){return o.message.includes("Extension context invalidated")?console.log("KeyFlow: Extension updated, please reload page for full functionality"):console.warn("KeyFlow: Error sending message:",o.message),!1}},g=()=>{try{document.querySelectorAll('input[type="password"]').forEach(o=>u(o,"password")),['input[type="email"]','input[type="text"][name*="user"]','input[type="text"][name*="email"]','input[type="text"][name*="login"]','input[type="text"][id*="user"]','input[type="text"][id*="email"]','input[type="text"][id*="login"]','input[autocomplete="username"]','input[autocomplete="email"]','input[name="username"]','input[name="email"]','input[name="login"]','input[placeholder*="email" i]','input[placeholder*="username" i]','input[placeholder*="user" i]'].forEach(o=>{document.querySelectorAll(o).forEach(n=>{v(n)&&u(n,"username")})})}catch(e){console.error("KeyFlow: Error in detectLoginForms:",e)}},v=e=>{const t=[/search/i,/query/i,/filter/i,/name.*first/i,/name.*last/i,/fname/i,/lname/i,/phone/i,/address/i,/city/i,/zip/i,/postal/i],o=(e.name+" "+e.id+" "+e.placeholder+" "+e.className).toLowerCase();for(const r of t)if(r.test(o))return!1;const s=e.closest("form");return s?!!s.querySelector('input[type="password"]'):!!document.querySelector('input[type="password"]')},u=(e,t)=>{try{if(e.dataset.keyflowProcessed==="true")return;e.dataset.keyflowProcessed="true",e.dataset.keyflowFieldType=t;const o=e.parentElement;if(!o)return;const s=window.getComputedStyle(o);s.position!=="absolute"&&s.position!=="relative"&&s.position!=="fixed"&&(o.style.position="relative");const n=h(t);o.appendChild(n),e.keyflowIcon=n,e.addEventListener("focus",()=>{k(n)}),e.addEventListener("blur",()=>{setTimeout(()=>{E(n)},150)})}catch(o){console.error("KeyFlow: Error adding KeyFlow to field:",o)}},h=(e="password")=>{const t=document.createElement("div");t.className=`keyflow-${e}-icon`,t.dataset.fieldType=e;const o=document.createElement("img");return o.src=chrome.runtime.getURL("icons/keyflowfill.png"),o.alt="KeyFlow",o.style.cssText=`
    width: 16px;
    height: 16px;
    display: block;
  `,t.appendChild(o),t.style.cssText=`
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    width: 20px;
    height: 20px;
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    pointer-events: auto;
    transition: all 0.2s ease;
    border-radius: 2px;
  `,t.addEventListener("mouseenter",()=>{t.style.transform="translateY(-50%) scale(1.1)",t.style.opacity="0.8"}),t.addEventListener("mouseleave",()=>{t.style.transform="translateY(-50%) scale(1)",t.style.opacity="1"}),t.addEventListener("mousedown",s=>{s.preventDefault()}),t.addEventListener("click",s=>{s.preventDefault(),s.stopPropagation(),c({type:e==="username"?"SHOW_USERNAME_SUGGESTIONS":"SHOW_PASSWORD_SUGGESTIONS",url:window.location.hostname,fieldType:e})}),t},k=e=>{e.style.display="flex",setTimeout(()=>{e.style.opacity="1",e.style.transform="translateY(-50%) scale(1)"},10)},E=e=>{e.style.opacity="0",e.style.transform="translateY(-50%) scale(0.8)",setTimeout(()=>{e.style.display="none"},200)},S=e=>{try{const t=document.querySelector(".keyflow-save-prompt");t&&t.remove(),c({type:"CHECK_EXISTING_PASSWORD",domain:e.domain,username:e.username},o=>{o&&o.exists?showUpdatePasswordPrompt(e):F(e)})}catch(t){console.error("KeyFlow: Error showing save prompt:",t)}},F=e=>{const t=document.createElement("div");t.className="keyflow-save-prompt",t.style.cssText=`
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    z-index: 10002;
    width: 350px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: slideIn 0.3s ease-out;
  `,t.innerHTML=`
    <div style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <div style="width: 20px; height: 20px; background: #4f46e5; border-radius: 4px; margin-right: 8px; display: flex; align-items: center; justify-content: center;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9C9 10.1 9.9 11 11 11V22H13V11C14.1 11 15 10.1 15 9H21Z"/>
          </svg>
        </div>
        <span style="font-weight: 600; color: #1f2937;">Save Password?</span>
        <button onclick="this.closest('.keyflow-save-prompt').remove()" style="margin-left: auto; background: none; border: none; font-size: 18px; cursor: pointer; color: #6b7280;">×</button>
      </div>
      <div style="color: #6b7280; font-size: 14px;">
        Save password for <strong>${e.site}</strong>?
      </div>
    </div>
    <div style="padding: 12px 16px;">
      <div style="margin-bottom: 8px; font-size: 14px;">
        <strong>Site:</strong> ${e.site}
      </div>
      ${e.username?`<div style="margin-bottom: 12px; font-size: 14px;"><strong>Username:</strong> ${e.username}</div>`:""}
      <div style="display: flex; gap: 8px;">
        <button class="keyflow-save-btn" style="
          flex: 1;
          background: #4f46e5;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        ">Save</button>
        <button class="keyflow-never-btn" style="
          flex: 1;
          background: #e5e7eb;
          color: #374151;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        ">Never</button>
        <button class="keyflow-cancel-btn" style="
          background: none;
          border: none;
          color: #6b7280;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        ">Not now</button>
      </div>
    </div>
  `;const o=document.createElement("style");o.textContent=`
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `,document.head.appendChild(o);const s=t.querySelector(".keyflow-save-btn"),n=t.querySelector(".keyflow-never-btn"),r=t.querySelector(".keyflow-cancel-btn");s.addEventListener("click",()=>{m(e,"save"),t.remove()}),n.addEventListener("click",()=>{m(e,"never"),t.remove()}),r.addEventListener("click",()=>{t.remove()}),document.body.appendChild(t),setTimeout(()=>{t.parentNode&&t.remove()},1e4)},m=(e,t)=>{try{t==="save"?c({type:"CHECK_VAULT_STATUS"},o=>{if(o&&o.locked){L();return}c({type:"SAVE_PASSWORD",password:{site:e.site,username:e.username,password:e.password,url:e.url}},s=>{s&&s.success?(console.log("KeyFlow: Password saved successfully"),C()):console.error("KeyFlow: Failed to save password")})}):t==="never"&&c({type:"ADD_NEVER_SAVE",domain:e.domain})}catch(o){console.error("KeyFlow: Error handling save action:",o)}},L=()=>{const e=document.createElement("div");if(e.className="keyflow-save-locked",e.style.cssText=`
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border: 1px solid #e5e7eb;
    border-left: 4px solid #dc2626;
    border-radius: 6px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    z-index: 10003;
    padding: 16px;
    max-width: 300px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: slideInRight 0.3s ease-out;
  `,e.innerHTML=`
    <div style="display: flex; align-items: start; gap: 12px;">
      <div style="width: 20px; height: 20px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-top: 2px;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#dc2626">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9C9 10.1 9.9 11 11 11V22H13V11C14.1 11 15 10.1 15 9H21Z"/>
        </svg>
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px; font-size: 14px;">Cannot Save Password</div>
        <div style="color: #6b7280; font-size: 13px; line-height: 1.4; margin-bottom: 12px;">
          KeyFlow vault is locked. Unlock it to save passwords.
        </div>
        <button onclick="this.closest('.keyflow-save-locked').remove(); chrome.runtime.sendMessage({type: 'OPEN_POPUP'});" style="
          background: #4f46e5;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
        ">Unlock KeyFlow</button>
      </div>
      <button onclick="this.closest('.keyflow-save-locked').remove()" style="
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        padding: 0;
        width: 20px;
        height: 20px;
      ">×</button>
    </div>
  `,!document.querySelector("#keyflow-slide-animations")){const t=document.createElement("style");t.id="keyflow-slide-animations",t.textContent=`
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `,document.head.appendChild(t)}document.body.appendChild(e),setTimeout(()=>{e.parentNode&&e.remove()},6e3)},C=()=>{const e=document.createElement("div");e.style.cssText=`
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 16px;
    border-radius: 6px;
    z-index: 10003;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
  `,e.textContent="✓ Password saved to KeyFlow",document.body.appendChild(e),setTimeout(()=>{e.remove()},3e3)};let y=null;const x=()=>{try{document.querySelectorAll("form").forEach(t=>{t.dataset.keyflowMonitored==="true"||t.querySelectorAll('input[type="password"]').length===0||(t.dataset.keyflowMonitored="true",t.addEventListener("submit",s=>{T(t,s)}),console.log("KeyFlow: Monitoring form for auto-save:",t))})}catch(e){console.error("KeyFlow: Error detecting forms:",e)}},T=(e,t)=>{try{const o=K(e);o&&o.password&&(y={...o,url:window.location.href,domain:window.location.hostname,timestamp:Date.now()},setTimeout(()=>{S(y)},1e3))}catch(o){console.error("KeyFlow: Error handling form submission:",o)}},K=e=>{try{const t={username:"",password:"",site:""},o=e.querySelector('input[type="password"]');if(!o||!o.value)return null;t.password=o.value,t.site=window.location.hostname;const s=['input[type="email"]','input[type="text"][name*="user"]','input[type="text"][name*="email"]','input[type="text"][name*="login"]','input[type="text"][id*="user"]','input[type="text"][id*="email"]','input[type="text"][id*="login"]','input[autocomplete="username"]','input[autocomplete="email"]','input[name="username"]','input[name="email"]','input[name="login"]'];for(const n of s){const r=e.querySelector(n);if(r&&r.value){t.username=r.value;break}}if(!t.username)for(const n of s){const r=document.querySelector(n);if(r&&r.value){t.username=r.value;break}}return t}catch(t){return console.error("KeyFlow: Error extracting form data:",t),null}},M=(e,t,o="password")=>{try{const s=document.querySelector(".keyflow-suggestions");if(s&&s.remove(),e.length===0){w(t);return}const n=document.createElement("div");n.className="keyflow-suggestions",n.style.cssText=`
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      z-index: 10001;
      min-width: 300px;
      max-width: 400px;
      max-height: 400px;
      overflow-y: auto;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;const r=document.createElement("div");r.style.cssText=`
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      font-weight: 600;
      color: #1f2937;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;const a=o==="username"?"👤 KeyFlow - Choose Account":"🔐 KeyFlow - Choose Password";r.innerHTML=`
      <span>${a}</span>
      <button style="background: none; border: none; font-size: 18px; cursor: pointer; color: #6b7280;">×</button>
    `,r.querySelector("button").addEventListener("click",()=>{n.remove()}),n.appendChild(r),e.forEach((i,z)=>{const l=document.createElement("div");l.style.cssText=`
        padding: 12px 16px;
        border-bottom: 1px solid #f3f4f6;
        cursor: pointer;
        transition: background-color 0.2s;
      `,l.innerHTML=`
        <div style="font-weight: 500; color: #1f2937; margin-bottom: 4px;">${i.site}</div>
        <div style="font-size: 14px; color: #6b7280;">${i.username}</div>
      `,l.addEventListener("mouseenter",()=>{l.style.backgroundColor="#f9fafb"}),l.addEventListener("mouseleave",()=>{l.style.backgroundColor="white"}),l.addEventListener("click",()=>{b(i),n.remove()}),n.appendChild(l)}),document.body.appendChild(n);const d=i=>{n.contains(i.target)||(n.remove(),document.removeEventListener("click",d))};setTimeout(()=>{document.addEventListener("click",d)},100)}catch(s){console.error("KeyFlow: Error displaying credential suggestions:",s)}},P=(e,t)=>{try{const o=document.querySelector(".keyflow-suggestions");if(o&&o.remove(),e.length===0){w(t);return}const s=document.createElement("div");s.className="keyflow-suggestions",s.style.cssText=`
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      z-index: 10001;
      min-width: 300px;
      max-width: 400px;
      max-height: 400px;
      overflow-y: auto;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;const n=document.createElement("div");n.style.cssText=`
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      font-weight: 600;
      color: #1f2937;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `,n.innerHTML=`
      <span>🔐 KeyFlow - Choose Password</span>
      <button style="background: none; border: none; font-size: 18px; cursor: pointer; color: #6b7280;">×</button>
    `,n.querySelector("button").addEventListener("click",()=>{s.remove()}),s.appendChild(n),e.forEach((a,d)=>{const i=document.createElement("div");i.style.cssText=`
        padding: 12px 16px;
        border-bottom: 1px solid #f3f4f6;
        cursor: pointer;
        transition: background-color 0.2s;
      `,i.innerHTML=`
        <div style="font-weight: 500; color: #1f2937; margin-bottom: 4px;">${a.site}</div>
        <div style="font-size: 14px; color: #6b7280;">${a.username}</div>
      `,i.addEventListener("mouseenter",()=>{i.style.backgroundColor="#f9fafb"}),i.addEventListener("mouseleave",()=>{i.style.backgroundColor="white"}),i.addEventListener("click",()=>{b(a),s.remove()}),s.appendChild(i)}),document.body.appendChild(s);const r=a=>{s.contains(a.target)||(s.remove(),document.removeEventListener("click",r))};setTimeout(()=>{document.addEventListener("click",r)},100)}catch(o){console.error("KeyFlow: Error displaying suggestions:",o)}},I=(e,t="password")=>{try{console.log("KeyFlow: displayVaultLockedMessage called with url:",e,"fieldType:",t);const o=document.querySelector(".keyflow-suggestions");o&&o.remove();const s=document.createElement("div");s.className="keyflow-vault-locked",s.style.cssText=`
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      z-index: 10001;
      padding: 24px;
      text-align: center;
      min-width: 300px;
      max-width: 400px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: scaleIn 0.3s ease-out;
    `;const n=t==="username"?"fill usernames":"access passwords";s.innerHTML=`
      <div style="margin-bottom: 16px;">
        <div style="width: 60px; height: 60px; background: #fee2e2; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#dc2626">
            <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 7C13.1 7 14 7.9 14 9C14 10.1 13.1 11 12 11C10.9 11 10 10.1 10 9C10 7.9 10.9 7 12 7ZM17 19H7V17.5C7 15.5 11 14.5 12 14.5C13 14.5 17 15.5 17 17.5V19Z"/>
          </svg>
        </div>
        <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px; font-size: 18px;">🔒 Vault Locked</div>
        <div style="color: #6b7280; margin-bottom: 20px; line-height: 1.5;">
          KeyFlow vault is locked. You need to unlock it to ${n}.
        </div>
      </div>
      
      <div style="display: flex; gap: 8px; justify-content: center;">
        <button id="keyflow-unlock-vault" style="
          background: #4f46e5;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s ease;
        ">Open KeyFlow</button>
        <button onclick="this.closest('.keyflow-vault-locked').remove()" style="
          background: #e5e7eb;
          color: #374151;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        ">Cancel</button>
      </div>
    `;const r=s.querySelector("#keyflow-unlock-vault");r.addEventListener("mouseenter",()=>{r.style.background="#4338ca",r.style.transform="translateY(-1px)"}),r.addEventListener("mouseleave",()=>{r.style.background="#4f46e5",r.style.transform="translateY(0)"}),r.addEventListener("click",()=>{try{chrome.runtime.sendMessage({type:"OPEN_POPUP"}),s.remove()}catch{r.textContent="Click KeyFlow icon in toolbar",r.style.background="#6b7280",r.disabled=!0,setTimeout(()=>{s.remove()},3e3)}}),document.body.appendChild(s),setTimeout(()=>{s.parentNode&&s.remove()},8e3);const a=d=>{s.contains(d.target)||(s.remove(),document.removeEventListener("click",a))};setTimeout(()=>{document.addEventListener("click",a)},100)}catch(o){console.error("KeyFlow: Error displaying vault locked message:",o)}},w=e=>{const t=document.createElement("div");t.className="keyflow-no-passwords",t.style.cssText=`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    z-index: 10001;
    padding: 24px;
    text-align: center;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `,t.innerHTML=`
    <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
    <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px;">No passwords found</div>
    <div style="color: #6b7280; margin-bottom: 16px;">No saved passwords for ${e}</div>
    <button style="background: #4f46e5; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">OK</button>
  `,t.querySelector("button").addEventListener("click",()=>{t.remove()}),document.body.appendChild(t),setTimeout(()=>{t.remove()},3e3)},b=e=>{try{const t=['input[type="email"]','input[type="text"][name*="user"]','input[type="text"][name*="email"]','input[type="text"][id*="user"]','input[type="text"][id*="email"]','input[autocomplete="username"]','input[autocomplete="email"]'];let o=null;for(const n of t)if(o=document.querySelector(n),o)break;const s=document.querySelector('input[type="password"]');o&&e.username&&(o.value=e.username,o.dispatchEvent(new Event("input",{bubbles:!0})),o.dispatchEvent(new Event("change",{bubbles:!0}))),s&&e.password&&(s.value=e.password,s.dispatchEvent(new Event("input",{bubbles:!0})),s.dispatchEvent(new Event("change",{bubbles:!0}))),console.log("KeyFlow: Password filled successfully")}catch(t){console.error("KeyFlow: Error filling password:",t)}};document.body&&new MutationObserver(t=>{t.some(s=>s.type==="childList"&&s.addedNodes.length>0&&Array.from(s.addedNodes).some(n=>n.nodeType===Node.ELEMENT_NODE&&!n.classList?.contains("keyflow-password-icon")&&!n.classList?.contains("keyflow-username-icon")&&!n.classList?.contains("keyflow-suggestions")&&!n.classList?.contains("keyflow-no-passwords")&&!n.classList?.contains("keyflow-save-prompt")))&&N()}).observe(document.body,{childList:!0,subtree:!0});chrome.runtime.onMessage.addListener((e,t,o)=>{console.log("KeyFlow: Content script received message:",e.type),e.type==="DISPLAY_PASSWORD_SUGGESTIONS"?(P(e.passwords,e.url),o({success:!0})):e.type==="DISPLAY_CREDENTIAL_SUGGESTIONS"?(M(e.passwords,e.url,e.fieldType),o({success:!0})):e.type==="DISPLAY_VAULT_LOCKED"&&(console.log("KeyFlow: Displaying vault locked message for fieldType:",e.fieldType),I(e.url,e.fieldType),o({success:!0}))});let f;const N=()=>{clearTimeout(f),f=setTimeout(()=>{try{g(),x()}catch(e){console.error("KeyFlow: Observer detection failed:",e)}},100)},p=()=>{try{g(),x()}catch(e){console.error("KeyFlow: Initialization failed:",e)}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",p):p();if(!document.body){const e=new MutationObserver(()=>{document.body&&(p(),e.disconnect())});e.observe(document.documentElement,{childList:!0})}
