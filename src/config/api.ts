export const DEFAULT_API_ENDPOINT = 'https://ai-us.analysemusic.com/v1/chat/completions'
export const DEFAULT_MODEL_ID = 'gemini-3-pro-image-preview'
export const DEFAULT_MAX_RETRIES = 1

// OAuth Config
export const OAUTH_AUTH_URL = 'https://ai.analysemusic.com'
export const OAUTH_API_BASE_URL = 'https://oauth.ai.analysemusic.com'
// @ts-ignore
export const OAUTH_CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID || 'nano-banana-OneTimeAI'
// @ts-ignore
export const OAUTH_CLIENT_SECRET = import.meta.env.VITE_OAUTH_CLIENT_SECRET || 'nano-banana-OneTimeAI'
export const OAUTH_ENDPOINT = 'https://ai-us.analysemusic.com/v1/chat/completions'
