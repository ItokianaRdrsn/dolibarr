import axios from 'axios'

// ========== CONFIGURATION ==========
const API_BASE_URL = import.meta.env.VITE_DOLIBARR_API_URL || 'http://localhost/dolibarr-23.0.3/htdocs/api/index.php'
const API_KEY = import.meta.env.VITE_DOLIBARR_API_KEY || ''


// ========== HEADERS PAR DÉFAUT ==========
const defaultJsonHeaders = {
  Accept: 'application/json',
}

// ========== CLIENT AXIOS ==========
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: defaultJsonHeaders,
})

// ========== INTERCEPTEUR REQUÊTE ==========
apiClient.interceptors.request.use(
  (config) => {
    const method = config.method?.toLowerCase()
    const isFormDataRequest = typeof FormData !== 'undefined' && config.data instanceof FormData

    // Gestion du Content-Type
    if (isFormDataRequest) {
      delete config.headers['Content-Type']
      delete config.headers['content-type']
    } else if (method === 'post' || method === 'put' || method === 'patch') {
      config.headers['Content-Type'] = 'application/json'
    } else {
      delete config.headers['Content-Type']
      delete config.headers['content-type']
    }

    // Ajout de la clé API
    if (API_KEY) {
      config.headers['DOLAPIKEY'] = API_KEY
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ========== INTERCEPTEUR RÉPONSE ==========
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
  
    return Promise.reject(error)
  }
)

// ========== EXPORTS ==========
export default apiClient

export {
  apiClient,
}