import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// 处理 OAuth 回调消息
const urlParams = new URLSearchParams(window.location.search)
const code = urlParams.get('code')
if (code && window.opener) {
    window.opener.postMessage({ type: 'OAUTH_CODE', code }, window.location.origin)
    // 给用户一点提示，然后尝试关闭窗口
    document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;"><h2>授权成功，正在返回...</h2></div>'
    setTimeout(() => window.close(), 1000)
}

createApp(App).mount('#app')
