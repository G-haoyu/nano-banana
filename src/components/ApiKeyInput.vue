<template>
    <div class="bg-white border-4 border-black rounded-lg p-3 shadow-lg">
        <div class="mb-2">
            <div class="flex items-center justify-between mb-2">
                <h3 class="font-bold text-gray-800 flex items-center gap-2">
                    🔑 API 配置
                    <span v-if="modelValue" class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">密钥已保存</span>
                </h3>
                <!-- OAuth 切换开关 -->
                <div class="flex items-center gap-2">
                    <span class="text-xs font-semibold text-gray-600">自动登录</span>
                    <button 
                        @click="toggleOAuth"
                        class="relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none"
                        :class="useOAuth ? 'bg-orange-500' : 'bg-gray-300'"
                    >
                        <span
                            class="inline-block h-3 w-3 transform rounded-full bg-white transition-transform"
                            :class="useOAuth ? 'translate-x-6' : 'translate-x-1'"
                        />
                    </button>
                </div>
            </div>
            <p class="text-sm text-gray-600">
            可自定义 API 密钥与端点，默认使用 
            <a href="https://ai.analysemusic.com" target="_blank" class="hover:text-blue-500 underline">One Time AI</a> 
            中转站
            </p>
        </div>

        <div class="space-y-3">
            <!-- OAuth 登录按钮 -->
            <div v-if="useOAuth" class="py-2">
                <button
                    @click="handleOAuthLogin"
                    :disabled="oauthLoading"
                    class="w-full py-3 px-4 bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2"
                >
                    <span v-if="oauthLoading" class="animate-spin">⏳</span>
                    <span v-else>🔐</span>
                    {{ oauthLoading ? '正在登录...' : (modelValue ? '重新授权登录' : '点击授权登录 One Time AI') }}
                </button>
                <p v-if="oauthError" class="text-xs text-red-600 mt-2 text-center font-medium">❌ {{ oauthError }}</p>
                <p v-else-if="modelValue" class="text-xs text-green-600 mt-2 text-center font-medium">✅ 已通过 OAuth 成功授权</p>
            </div>

            <div v-if="!useOAuth">
                <label class="block text-xs font-semibold text-gray-600 mb-1">API 密钥</label>
                <div class="flex gap-2">
                    <input
                        type="password"
                        :value="modelValue"
                        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
                        placeholder="输入你的 API 密钥..."
                        class="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                    <button
                        v-if="modelValue"
                        @click="clearApiKey"
                        class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        title="清除缓存的API密钥"
                    >
                        🗑️
                    </button>
                </div>
                <div class="flex items-center justify-between mt-1">
                    <p class="text-xs text-gray-500">
                        从 <a href="https://ai.analysemusic.com/" target="_blank" class="text-orange-500 hover:underline font-medium">One Time AI</a> 获取你的 API 密钥
                    </p>
                    <p v-if="modelValue" class="text-xs text-green-600 flex items-center gap-1">💾 已自动保存到本地</p>
                </div>
            </div>

            <div v-if="!useOAuth">
                <label class="block text-xs font-semibold text-gray-600 mb-1">API 端点</label>
                <div class="flex gap-2">
                    <input
                        type="text"
                        :value="endpoint"
                        @input="$emit('update:endpoint', ($event.target as HTMLInputElement).value)"
                        placeholder="例如 https://ai.analysemusic.com/v1/chat/completions"
                        class="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                    <button
                        v-if="isCustomEndpoint"
                        @click="resetEndpoint"
                        class="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        title="恢复默认端点"
                    >
                        ♻️
                    </button>
                </div>
                <p class="text-xs text-gray-500 mt-1">如果你的模型提供方与 One Time AI 不同，可在此填写自定义地址</p>
            </div>

            <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">重试次数</label>
                <div class="flex gap-2">
                    <input
                        type="number"
                        min="0"
                        max="5"
                        :value="maxRetries"
                        @input="$emit('update:maxRetries', Number(($event.target as HTMLInputElement).value))"
                        placeholder="失败重试次数 (0-5)"
                        class="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                    <button
                        v-if="maxRetries !== DEFAULT_MAX_RETRIES"
                        @click="resetMaxRetries"
                        class="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        title="恢复默认重试次数"
                    >
                        ♻️
                    </button>
                </div>
                <p class="text-xs text-gray-500 mt-1">生成失败时的自动重试次数</p>
            </div>

            <div>
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <button
                        @click="$emit('fetch-models')"
                        :disabled="!canFetchModels || modelLoading"
                        :class="[
                            'px-3 py-2 rounded-lg border-2 border-black font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2',
                            modelLoading
                                ? 'bg-gray-300 text-gray-600 cursor-wait'
                                : canFetchModels
                                  ? 'bg-purple-500 text-white hover:bg-purple-600'
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        ]"
                    >
                        <span v-if="modelLoading">⏳ 正在获取...</span>
                        <span v-else>📥 获取模型列表</span>
                    </button>
                    <span v-if="models.length" class="text-xs text-gray-600">已载入 {{ models.length }} 个模型</span>
                </div>
                <p v-if="modelError" class="text-xs text-red-600 mt-2">⚠️ {{ modelError }}</p>

                <div class="mt-3">
                    <label class="block text-xs font-semibold text-gray-600 mb-1">选择文生图模型</label>
                    <select
                        :value="model"
                        @change="handleModelChange"
                        class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    >
                        <option v-for="item in optionList" :key="item.id" :value="item.id">
                            {{ item.supportsImages ? '🖼️ ' : '' }}{{ item.label }}
                        </option>
                    </select>
                    <p v-if="selectedModelInfo" class="text-xs text-gray-500 mt-1">{{ selectedModelInfo }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, toRefs, onMounted } from 'vue'
import { 
    DEFAULT_API_ENDPOINT, 
    DEFAULT_MODEL_ID, 
    DEFAULT_MAX_RETRIES,
    OAUTH_AUTH_URL,
    OAUTH_API_BASE_URL,
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET,
    OAUTH_ENDPOINT
} from '../config/api'
import { LocalStorage } from '../utils/storage'
import type { ModelOption } from '../types'

const props = defineProps<{
    modelValue: string
    endpoint: string
    maxRetries: number
    models: ModelOption[]
    model: string
    modelLoading: boolean
    modelError: string | null
}>()

const emit = defineEmits<{
    'update:modelValue': [value: string]
    'update:endpoint': [value: string]
    'update:maxRetries': [value: number]
    'update:model': [value: string]
    'fetch-models': []
    'model-picked': []
}>()

const { modelValue, endpoint, maxRetries, models, model } = toRefs(props)

const useOAuth = ref(false)
const oauthLoading = ref(false)
const oauthError = ref<string | null>(null)

onMounted(() => {
    useOAuth.value = LocalStorage.getUseOAuth()
})

const toggleOAuth = () => {
    useOAuth.value = !useOAuth.value
    LocalStorage.saveUseOAuth(useOAuth.value)
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const fetchWithRetry = async (url: string, options: RequestInit, retries = 3): Promise<Response> => {
    try {
        const response = await fetch(url, options)
        if (!response.ok && retries > 0) {
            await sleep(1000)
            return fetchWithRetry(url, options, retries - 1)
        }
        return response
    } catch (err) {
        if (retries > 0) {
            await sleep(1000)
            return fetchWithRetry(url, options, retries - 1)
        }
        throw err
    }
}

const handleOAuthLogin = () => {
    oauthError.value = null
    const state = Math.random().toString(36).substring(7)
    // 切换回主页回调
    const redirectUri = window.location.origin + window.location.pathname
    const authUrl = `${OAUTH_AUTH_URL}/oauth?client_id=${OAUTH_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&response_type=code`
    
    const width = 600
    const height = 700
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2
    
    const authWindow = window.open(
        authUrl, 
        'OAuthLogin', 
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
    )

    if (!authWindow) {
        oauthError.value = '弹出窗口被屏蔽，请允许弹出窗口后重试'
        return
    }

    const messageListener = async (event: MessageEvent) => {
        // 验证来源
        if (event.origin !== window.location.origin) return
        
        if (event.data && event.data.type === 'OAUTH_CODE') {
            const { code } = event.data
            window.removeEventListener('message', messageListener)
            authWindow.close()
            
            oauthLoading.value = true
            try {
                // 1. 换取 Token
                const tokenResponse = await fetchWithRetry(`${OAUTH_API_BASE_URL}/oauth/token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        client_id: OAUTH_CLIENT_ID,
                        client_secret: OAUTH_CLIENT_SECRET,
                        code: code
                    })
                })
                const tokenData = await tokenResponse.json()
                if (!tokenData.access_token) throw new Error('获取 access_token 失败')

                // 2. 获取用户信息 (API Key)
                const apiResponse = await fetchWithRetry(`${OAUTH_API_BASE_URL}/api`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
                })
                const apiData = await apiResponse.json()
                if (!apiData.api_key) throw new Error('获取 API Key 失败')

                // 3. 更新状态
                emit('update:modelValue', apiData.api_key)
                emit('update:endpoint', OAUTH_ENDPOINT)
                
                // 自动刷新模型列表
                setTimeout(() => {
                    emit('fetch-models')
                }, 100)
            } catch (err: any) {
                oauthError.value = err.message || '授权过程出错'
            } finally {
                oauthLoading.value = false
            }
        }
    }

    window.addEventListener('message', messageListener)

    const checkWindow = setInterval(() => {
        if (authWindow.closed) {
            clearInterval(checkWindow)
            // 延迟一点时间清理，以防 message 先到
            setTimeout(() => {
                window.removeEventListener('message', messageListener)
            }, 1000)
        }
    }, 1000)
}

const clearApiKey = () => {
    LocalStorage.clearApiKey()
    LocalStorage.clearModelId()
    LocalStorage.clearMaxRetries()
    emit('update:modelValue', '')
    emit('update:model', '')
    emit('update:maxRetries', DEFAULT_MAX_RETRIES)
}

const resetEndpoint = () => {
    emit('update:endpoint', DEFAULT_API_ENDPOINT)
    emit('update:model', '')
}

const resetMaxRetries = () => {
    emit('update:maxRetries', DEFAULT_MAX_RETRIES)
}

const isCustomEndpoint = computed(() => endpoint.value !== '' && endpoint.value !== DEFAULT_API_ENDPOINT)
const canFetchModels = computed(() => modelValue.value.trim() !== '' && endpoint.value.trim() !== '')
const optionList = computed<ModelOption[]>(() => {
    if (models.value.length) {
        return models.value
    }

    const fallbackId = model.value || DEFAULT_MODEL_ID

    return [
        {
            id: fallbackId,
            label: buildFallbackLabel(fallbackId),
            description: '',
            supportsImages: true
        }
    ]
})

const selectedModelInfo = computed(() => {
    const current = optionList.value.find(option => option.id === model.value)
    if (!current) return ''
    if (current.description) {
        return current.description
    }
    return current.supportsImages ? '支持生成图片' : ''
})

const handleModelChange = (event: Event) => {
    const value = (event.target as HTMLSelectElement).value
    emit('update:model', value)
    emit('model-picked')
}

function buildFallbackLabel(modelId: string): string {
    const segments = modelId.split('/')
    const lastSegment = segments[segments.length - 1]
    return lastSegment || modelId
}
</script>
