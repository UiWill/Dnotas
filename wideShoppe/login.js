// Elementos do DOM
const loginForm = document.getElementById('login-form');
const shopIdInput = document.getElementById('shop-id');
const refreshTokenInput = document.getElementById('refresh-token');
const loginBtn = document.getElementById('login-btn');
const errorMessage = document.getElementById('error-message');
const authLinkBtn = document.getElementById('auth-link-btn');

// Endpoint base da API
const API_BASE_URL = 'https://api.dnotas.com.br';

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar evento de login
    loginForm.addEventListener('submit', handleLogin);
    
    // Adicionar evento de geração de link de autorização
    authLinkBtn.addEventListener('click', generateAuthLink);
    
    // Verificar localStorage para autopreenchimento
    const savedShopId = localStorage.getItem('shopId');
    if (savedShopId) {
        shopIdInput.value = savedShopId;
    }
    
    console.log('Login inicializado - usando API em:', API_BASE_URL);
});

/**
 * Lida com o processo de login extremamente simplificado
 * Apenas armazena as credenciais sem validação
 */
function handleLogin(event) {
    event.preventDefault();
    
    const shopId = shopIdInput.value.trim();
    const refreshToken = refreshTokenInput.value.trim();
    
    // Validações básicas
    if (!shopId) {
        showError('Por favor, informe o Shop ID');
        return;
    }
    
    if (!refreshToken) {
        showError('Por favor, informe o Refresh Token');
        return;
    }
    
    // Armazenar no localStorage
    localStorage.setItem('shopId', shopId);
    localStorage.setItem('refreshToken', refreshToken);
    
    console.log('Credenciais salvas:', { 
        shopId,
        refreshToken: refreshToken.substring(0, 5) + '...' 
    });
    
    // Redirecionar para a página principal
    window.location.href = 'index.html';
}

/**
 * Exibe uma mensagem de erro
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

/**
 * Gera um link de autorização para a Shopee
 * Versão simplificada que apenas abre a URL de autorização da Shopee
 */
function generateAuthLink() {
    // Mostrar alerta com instruções
    alert(`Para obter um novo Shop ID e Refresh Token, siga os passos:
    
1. Acesse o Partner Center da Shopee
2. Faça login com sua conta de desenvolvedor
3. Vá em "My Apps" e selecione seu aplicativo
4. Copie o Shop ID e Refresh Token gerados
    
Se precisar de ajuda, contate o suporte técnico.`);
} 