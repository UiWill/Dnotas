// Elementos do DOM
const loginSection = document.getElementById('login-section');
const ordersSection = document.getElementById('orders-section');
const shopIdInput = document.getElementById('shop-id');
const refreshTokenInput = document.getElementById('refresh-token');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const refreshBtn = document.getElementById('refresh-btn');
const dateFilter = document.getElementById('date-filter');
const ordersContainer = document.getElementById('orders-container');
const orderTemplate = document.getElementById('order-template');

// Variáveis globais para armazenar o estado da aplicação
let currentShopId = '';
let currentRefreshToken = '';
let accessToken = '';
let currentUser = null;

// Endpoint base da API
const API_BASE_URL = 'https://api.dnotas.com.br';

// Configuração do Supabase - usar a instância já criada na página index.html
const supabaseClient = window.supabaseClient;

// Adicionar estilos CSS para o modal de detalhes e ajustar contraste
document.addEventListener('DOMContentLoaded', function() {
    console.log('App inicializado - Verificando autenticação');
    initializeApp();
});

// Inicialização do aplicativo
function initializeApp() {
    // Oculta a tela de carregamento inicial após um breve delay
    setTimeout(() => {
        document.getElementById('initial-loading').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('initial-loading').style.display = 'none';
        }, 300);
    }, 800);

    // Estilizar o corpo e adicionar o fundo azul escuro com inspiração no Kast.xyz
    document.body.style.background = 'linear-gradient(150deg, #000000 0%, #0a1128 85%, #0f2a57 100%)';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.minHeight = '100vh';
    document.body.style.overflow = 'auto';
    document.body.style.color = '#fff';
    document.body.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, sans-serif';
    
    // CSS para todos os elementos
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        :root {
            --primary-blue: #2563eb;
            --light-blue: #3b82f6;
            --dark-blue: #0d1b38;
            --bg-dark: #000000;
            --bg-card: rgba(13, 18, 30, 0.7);
            --text-color: #f8fafc;
            --border-color: rgba(255, 255, 255, 0.1);
            --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        }
        
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(ellipse at top right, rgba(37, 99, 235, 0.1) 0%, transparent 35%),
                radial-gradient(ellipse at bottom left, rgba(37, 99, 235, 0.05) 0%, transparent 25%);
            pointer-events: none;
            z-index: -2;
        }
        
        body::after {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            opacity: 0.2;
            pointer-events: none;
            z-index: -1;
        }
        
        /* Efeitos de vidro e relevo */
        .app-header {
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(37, 99, 235, 0.15);
            padding: 16px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
        }
        
        .logo-container {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .dnotas-logo {
            filter: drop-shadow(0 0 8px rgba(37, 99, 235, 0.5));
            animation: pulse 4s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { filter: drop-shadow(0 0 8px rgba(37, 99, 235, 0.3)); }
            50% { filter: drop-shadow(0 0 12px rgba(37, 99, 235, 0.6)); }
        }
        
        .logo-text {
            font-size: 24px;
            font-weight: 700;
            background: linear-gradient(90deg, #f8fafc, #93c5fd);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: 0.5px;
        }
        
        .header-subtitle {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
            font-weight: 500;
        }
        
        /* Seções de login e pedidos */
        #login-section, #orders-section {
            background: rgba(10, 15, 25, 0.7);
            backdrop-filter: blur(12px);
            border-radius: 16px;
            border: 1px solid rgba(37, 99, 235, 0.1);
            box-shadow: 
                0 25px 50px -12px rgba(0, 0, 0, 0.25),
                0 1px 0 rgba(37, 99, 235, 0.05) inset;
            padding: 24px;
            margin: 24px auto;
            max-width: 1200px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        #login-section::before, #orders-section::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at center, rgba(37, 99, 235, 0.05) 0%, transparent 70%);
            transform: rotate(-3deg);
            z-index: -1;
        }
        
        /* Tabela de pedidos */
        .table-container {
            background: rgba(5, 10, 20, 0.6);
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
            overflow: hidden;
            border: 1px solid rgba(37, 99, 235, 0.08);
            max-height: 450px;
            overflow-y: auto;
            margin: 20px 0;
        }
        
        /* Estilizar a scrollbar para ficar mais moderna */
        .table-container::-webkit-scrollbar {
            width: 6px;
        }
        
        .table-container::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.4);
        }
        
        .table-container::-webkit-scrollbar-thumb {
            background: rgba(37, 99, 235, 0.4);
            border-radius: 3px;
        }
        
        .table-container::-webkit-scrollbar-thumb:hover {
            background: rgba(37, 99, 235, 0.6);
        }
        
        .orders-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .orders-table thead {
            position: sticky;
            top: 0;
            background: rgba(5, 10, 20, 0.95);
            backdrop-filter: blur(4px);
            z-index: 10;
        }
        
        .orders-table th {
            text-align: left;
            padding: 16px;
            font-weight: 600;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.9);
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid rgba(37, 99, 235, 0.1);
        }
        
        .orders-table td {
            padding: 12px 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.03);
            font-size: 14px;
        }
        
        .orders-table tr:last-child td {
            border-bottom: none;
        }
        
        .orders-table tr:hover {
            background: rgba(37, 99, 235, 0.05);
        }
        
        /* Status e botões */
        .status-cell {
            text-align: center;
        }
        
        .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            background: rgba(5, 10, 20, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .status.processed, .status.shipped, .status.completed {
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
            border: 1px solid rgba(34, 197, 94, 0.2);
            color: #4ade80;
        }
        
        .status.ready_to_ship {
            background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(37, 99, 235, 0.05));
            border: 1px solid rgba(37, 99, 235, 0.2);
            color: #93c5fd;
        }
        
        .status.cancelled {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
            border: 1px solid rgba(239, 68, 68, 0.2);
            color: #f87171;
        }
        
        .actions-cell {
            text-align: center;
        }
        
        .actions {
            display: flex;
            justify-content: center;
            gap: 8px;
        }
        
        .actions button {
            background: rgba(10, 15, 25, 0.7);
            color: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.05);
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.2s ease;
            min-width: 80px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .actions button:hover:not(:disabled) {
            background: rgba(37, 99, 235, 0.7);
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .actions button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .btn-details {
            background: rgba(37, 99, 235, 0.05) !important;
            border: 1px solid rgba(37, 99, 235, 0.2) !important;
            color: #93c5fd !important;
        }
        
        .btn-shipping {
            background: rgba(34, 197, 94, 0.05) !important;
            border: 1px solid rgba(34, 197, 94, 0.2) !important;
            color: #4ade80 !important;
        }
        
        /* Responsividade */
        @media (max-width: 768px) {
            .table-container {
                max-height: 350px;
            }
            
            .actions {
                flex-direction: column;
            }
            
            .actions button {
                width: 100%;
                margin-bottom: 4px;
            }
        }
    `;
    document.head.appendChild(styleElement);

    // Verifica se já existe tokens salvos no localStorage
    const shopId = localStorage.getItem('shopId');
    const refreshToken = localStorage.getItem('refreshToken');

    if (shopId && refreshToken) {
        console.log('Tokens encontrados no localStorage, restaurando sessão');
        // Restaurar valores globais das variáveis
        currentShopId = shopId;
        currentRefreshToken = refreshToken;
        
        // Carregar os pedidos
        loadOrders();
        showOrdersScreen();
    } else {
        // Verifica se existe uma sessão do Supabase
        const session = supabaseClient?.auth?.session?.();
        if (session) {
            console.log('Sessão do Supabase encontrada, buscando tokens');
            fetchUserTokens(session.user.id);
        } else {
            // Sem tokens e sem sessão, mostra a tela de login
            showLoginScreen();
        }
    }

    // Adicionar header com logo da Dnotas
    const header = document.createElement('header');
    header.className = 'app-header';
    header.innerHTML = `
        <div class="logo-container">
            <svg class="dnotas-logo" width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" stroke="#2563eb" stroke-width="8"/>
                <circle cx="50" cy="50" r="20" fill="#2563eb"/>
            </svg>
            <span class="logo-text">DNOTAS</span>
        </div>
        <div class="header-subtitle">Gerenciamento de Pedidos</div>
    `;
    
    // Inserir o header antes do primeiro elemento no body
    document.body.insertBefore(header, document.body.firstChild);

    // Configura os event listeners
    setupEventListeners();
    
    console.log('Aplicação inicializada - usando API em:', API_BASE_URL);
}

/**
 * Mostra a tela de pedidos
 */
function showOrdersScreen() {
    if (!loginSection || !ordersSection) return;
    
    loginSection.style.display = 'none';
    ordersSection.style.display = 'block';
    
    console.log('Exibindo tela de pedidos');
}

/**
 * Mostra a tela de login
 */
function showLoginScreen() {
    if (!loginSection || !ordersSection) return;
    
    loginSection.style.display = 'block';
    ordersSection.style.display = 'none';
    
    console.log('Exibindo tela de login');
}

/**
 * Busca os tokens do usuário na tabela shopee_tokens
 */
async function fetchUserTokens(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('shopee_tokens')
            .select('shop_id, refresh_token')
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        
        if (data) {
            console.log('Tokens encontrados para o usuário');
            localStorage.setItem('shopId', data.shop_id);
            localStorage.setItem('refreshToken', data.refresh_token);
            
            // Salvar nas variáveis globais
            currentShopId = data.shop_id;
            currentRefreshToken = data.refresh_token;
            
            // Carregar os pedidos
            loadOrders();
            showOrdersScreen();
        } else {
            console.log('Tokens não encontrados para o usuário');
            showLoginScreen();
        }
    } catch (error) {
        console.error('Erro ao buscar tokens:', error);
        showLoginScreen();
    }
}

/**
 * Atualiza o header com informações do usuário logado
 */
function updateHeaderUser(userName) {
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.innerHTML = `
        <span class="user-name">${userName}</span>
        <div class="user-avatar">${userName.charAt(0).toUpperCase()}</div>
    `;
    
    const header = document.querySelector('.app-header');
    if (header) {
        // Remover info de usuário existente, se houver
        const existingInfo = header.querySelector('.user-info');
        if (existingInfo) {
            header.removeChild(existingInfo);
        }
        
        // Adicionar novo elemento
        header.appendChild(userInfo);
    }
}

/**
 * Mostra um indicador de carregamento
 */
function showLoadingIndicator(message = 'Carregando...') {
    // Remover qualquer loading existente
    hideLoadingIndicator();
    
    // Criar novo loading
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.id = 'loading-overlay';
    
    loadingOverlay.innerHTML = `
        <div class="loading-content">
            <p>${message}</p>
            <div class="spinner"></div>
        </div>
    `;
    
    document.body.appendChild(loadingOverlay);
}

/**
 * Esconde o indicador de carregamento
 */
function hideLoadingIndicator() {
    const existing = document.getElementById('loading-overlay');
    if (existing) {
        document.body.removeChild(existing);
    }
}

/**
 * Exibe uma notificação para o usuário
 */
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Ícone baseado no tipo
    let icon = '&#9432;'; // Info
    if (type === 'success') icon = '&#10004;'; // Check
    if (type === 'error') icon = '&#10060;'; // X
    
    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-message">${message}</div>
    `;
    
    // Adicionar à página
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remover após alguns segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * Função de login com formulário simples
 */
function handleLogin() {
    const shopId = shopIdInput.value.trim();
    const refreshToken = refreshTokenInput.value.trim();
    
    if (!shopId || !refreshToken) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    // Salvar dados e mostrar tela de pedidos
    currentShopId = shopId;
    currentRefreshToken = refreshToken;
    
    // Salvar no localStorage
    localStorage.setItem('shopId', shopId);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Mostrar seção de pedidos
    showOrdersScreen();
    
    // Carregar pedidos
    loadOrders();
}

/**
 * Encerra a sessão do usuário
 */
async function handleLogout() {
    try {
        showLoadingIndicator('Saindo...');
        
        // Deslogar do Supabase, se estiver disponível
        if (window.supabaseClient) {
            try {
                await window.supabaseClient.auth.signOut();
                console.log('Logout do Supabase realizado');
            } catch (supaError) {
                console.error('Erro ao fazer logout do Supabase:', supaError);
            }
        }
        
        // Limpar variáveis de sessão
        currentShopId = '';
        currentRefreshToken = '';
        accessToken = '';
        currentUser = null;
        
        // Limpar localStorage
        localStorage.removeItem('shopId');
        localStorage.removeItem('refreshToken');
        
        // Mostrar a tela de login
        showLoginScreen();
        
        console.log('Logout realizado com sucesso');
        
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        showNotification('Erro ao sair do sistema', 'error');
    } finally {
        hideLoadingIndicator();
    }
}

/**
 * Carrega os pedidos da API
 */
async function loadOrders() {
    if (!currentShopId) {
        console.error('Usuário não autenticado');
        return;
    }
    
    // Mostrar mensagem de carregamento
    ordersContainer.innerHTML = '<p class="empty-message">Carregando pedidos...</p>';
    refreshBtn.disabled = true;
    refreshBtn.textContent = 'Carregando...';
    
    try {
        // Construir a URL com parâmetros na querystring para facilitar o CORS
        const url = `${API_BASE_URL}/shopee/orders?shop_id=${currentShopId}&order_status=ALL`;
        console.log("Solicitando pedidos da URL:", url);
        
        // Abordagem direta usando XMLHttpRequest
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.withCredentials = true;
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onload = function() {
            console.log("Resposta recebida com status:", xhr.status);
            if (xhr.status === 200) {
                try {
                    const listData = JSON.parse(xhr.responseText);
                    console.log("Resposta completa da API:", listData);
                    if (listData.response && listData.response.order_list) {
                        console.log("Número de pedidos recebidos:", listData.response.order_list.length);
                    }
                    processOrdersList(listData);
                } catch (error) {
                    console.error("Erro ao processar resposta JSON:", error);
                    handleOrdersError(error);
                }
            } else {
                console.error("Erro na resposta da API:", xhr.status, xhr.statusText);
                handleOrdersError(new Error(`Erro ${xhr.status}: ${xhr.statusText}`));
            }
        };
        
        xhr.onerror = function(e) {
            console.error("Erro de rede ao carregar pedidos:", e);
            // Tentar abordagem alternativa
            fallbackLoadOrders();
        };
        
        xhr.send();
        console.log("Requisição enviada");
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        // Tentar abordagem alternativa
        fallbackLoadOrders();
    }
}

/**
 * Método alternativo para carregar pedidos
 */
async function fallbackLoadOrders() {
    try {
        console.log("Tentando método alternativo para carregar pedidos");
        
        // Mostrar mensagem de erro clara sem dados simulados
        ordersContainer.innerHTML = `
            <div class="error-message">
                <h3>Não foi possível carregar os pedidos devido a restrições de CORS</h3>
                <p>Por favor, execute esta aplicação a partir de um servidor que tenha acesso à API, ou utilize a extensão CORS Unblock em seu navegador.</p>
                <button class="btn btn-primary" id="retry-btn">Tentar Novamente</button>
            </div>
        `;
        
        document.getElementById('retry-btn').addEventListener('click', loadOrders);
    } catch (error) {
        console.error('Erro no fallback:', error);
        ordersContainer.innerHTML = `<p class="empty-message">Erro ao carregar pedidos: ${error.message}</p>`;
    } finally {
        // Restaurar o botão
        refreshBtn.disabled = false;
        refreshBtn.textContent = 'Atualizar';
    }
}

/**
 * Processa a lista de pedidos obtida da API
 */
function processOrdersList(listData) {
    try {
        console.log("Processando lista de pedidos:", listData);
        
        // Obter todos os pedidos sem filtrar por data
        const basicOrdersList = listData.response?.order_list || [];
        
        console.log("Total de pedidos recebidos:", basicOrdersList.length);
        
        // Logar cada pedido para debug
        basicOrdersList.forEach((order, index) => {
            console.log(`Pedido ${index+1}:`, 
                        "ID:", order.order_sn, 
                        "Create time:", order.create_time, 
                        "Data:", new Date(order.create_time * 1000).toLocaleString(),
                        "Status:", order.order_status);
        });
        
        if (basicOrdersList.length === 0) {
            ordersContainer.innerHTML = '<p class="empty-message">Nenhum pedido encontrado para o período selecionado</p>';
            refreshBtn.disabled = false;
            refreshBtn.textContent = 'Atualizar';
            return;
        }
        
        // Exibir os pedidos
        displayOrders(basicOrdersList);
    } catch (error) {
        handleOrdersError(error);
    } finally {
        // Restaurar o botão
        refreshBtn.disabled = false;
        refreshBtn.textContent = 'Atualizar';
    }
}

/**
 * Trata erros ao carregar pedidos
 */
function handleOrdersError(error) {
    console.error('Erro ao processar pedidos:', error);
    
    // Mensagem mais detalhada para o usuário
    ordersContainer.innerHTML = `
        <div class="error-message">
            <h3>Erro ao carregar pedidos</h3>
            <p>${error.message}</p>
            <p>Verifique o console do navegador para mais detalhes.</p>
            <button class="btn btn-primary" id="retry-btn">Tentar Novamente</button>
        </div>
    `;
    
    // Adicionar evento ao botão de retry
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
        retryBtn.addEventListener('click', loadOrders);
    }
    
    refreshBtn.disabled = false;
    refreshBtn.textContent = 'Atualizar';
}

/**
 * Exibe os pedidos na interface
 */
function displayOrders(orders) {
    // Limpar o container
    ordersContainer.innerHTML = '';
    
    if (!orders.length) {
        ordersContainer.innerHTML = '<p class="empty-message">Nenhum pedido encontrado para o período selecionado</p>';
        return;
    }
    
    // Mapear status para legendas em português
    const statusMap = {
        'READY_TO_SHIP': 'Pronto para envio',
        'PROCESSED': 'Processado',
        'RETRY_SHIP': 'Reenviar',
        'SHIPPED': 'Enviado',
        'COMPLETED': 'Concluído',
        'CANCELLED': 'Cancelado',
        'TO_CONFIRM_RECEIVE': 'A confirmar recebimento',
        'TO_RETURN': 'Para devolução',
        'UNPAID': 'Não pago'
    };
    
    // Criar título da seção com estilo
    const ordersTitle = document.createElement('h2');
    ordersTitle.textContent = 'Vendas Recentes';
    ordersTitle.style.fontSize = '24px';
    ordersTitle.style.fontWeight = '600';
    ordersTitle.style.marginBottom = '20px';
    ordersTitle.style.color = 'white';
    
    ordersContainer.appendChild(ordersTitle);
    
    // Criar container para a tabela com rolagem
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';
    
    // Criar tabela para os pedidos
    const table = document.createElement('table');
    table.className = 'orders-table';
    
    // Cabeçalho da tabela - simplificado
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th style="width: 35%">Pedido</th>
            <th style="width: 25%">Status</th>
            <th style="width: 40%">Ações</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Corpo da tabela
    const tbody = document.createElement('tbody');
    
    // Criar e adicionar cada elemento de pedido
    orders.forEach(order => {
        // Criar linha da tabela
        const tr = document.createElement('tr');
        tr.dataset.id = order.order_sn;
        tr.className = 'order-row';
        
        // Status - verificar campos alternativos
        const status = order.order_status || order.status;
        const statusText = statusMap[status] || status;
        
        // Montar a linha da tabela - simplificada
        tr.innerHTML = `
            <td class="order-id">${order.order_sn}</td>
            <td class="status-cell"><span class="status ${status?.toLowerCase()}">${statusText}</span></td>
            <td class="actions-cell">
                <div class="actions">
                    <button class="btn-confirm ${status === 'PROCESSED' ? 'processed' : ''}" 
                            ${status === 'PROCESSED' || status === 'SHIPPED' ? 'disabled' : ''}>
                        ${status === 'PROCESSED' || status === 'SHIPPED' ? 'Processado' : 'Confirmar'}
                    </button>
                    <button class="btn-shipping" 
                            ${status !== 'PROCESSED' && status !== 'SHIPPED' && status !== 'READY_TO_SHIP' ? 'disabled' : ''}>
                        Etiqueta
                    </button>
                    <button class="btn-details">Detalhes</button>
                </div>
            </td>
        `;
        
        // Adicionar a linha à tabela
        tbody.appendChild(tr);
        
        // Adicionar eventos aos botões
        const confirmBtn = tr.querySelector('.btn-confirm');
        const shippingBtn = tr.querySelector('.btn-shipping');
        const detailsBtn = tr.querySelector('.btn-details');
        
        // Obter tracking number se disponível
        const trackingNumber = order.tracking_number || 
                              (order.package_list && order.package_list[0] && 
                               order.package_list[0].shipping_carrier ? 
                               order.package_list[0].shipping_carrier.tracking_number : '');
        
        // Adicionar eventos
        confirmBtn.addEventListener('click', () => handleConfirmOrder(order.order_sn, trackingNumber));
        shippingBtn.addEventListener('click', () => handleGetShippingLabel(order.order_sn, trackingNumber));
        detailsBtn.addEventListener('click', () => handleViewDetails(order.order_sn));
    });
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    ordersContainer.appendChild(tableContainer);
    
    // Restaurar o botão
    refreshBtn.disabled = false;
    refreshBtn.textContent = 'Atualizar';
}

/**
 * Solicita a etiqueta de envio
 */
async function handleGetShippingLabel(orderSn, trackingNumber) {
    try {
        console.log(`Tentando obter etiqueta para pedido ${orderSn}, tracking number: ${trackingNumber || 'não fornecido'}`);
        
        // Se não temos um tracking number, obter via API de tracking
        if (!trackingNumber) {
            try {
                // Obter via API de tracking conforme instrução
                const trackingUrl = `${API_BASE_URL}/shopee/tracking/${orderSn}?shop_id=${currentShopId}`;
                console.log(`Buscando tracking number via: ${trackingUrl}`);
                
                const response = await fetch(trackingUrl);
                if (response.ok) {
                    const data = await response.json();
                    console.log("Resposta da API de tracking:", data);
                    
                    if (data.tracking_number) {
                        trackingNumber = data.tracking_number;
                        console.log(`Tracking number obtido da API: ${trackingNumber}`);
                    } else {
                        throw new Error("API não retornou um tracking number válido");
                    }
                } else {
                    const errorData = await response.json();
                    throw new Error(`API retornou erro: ${errorData.message || response.statusText}`);
                }
            } catch (trackingError) {
                console.error("Erro ao obter tracking number:", trackingError);
                alert(`Erro ao obter número de rastreio: ${trackingError.message}`);
                return;
            }
        }
        
        // Agora que temos o tracking number, gerar a etiqueta
        if (trackingNumber) {
            // Criar a URL da etiqueta
            const etiquetaUrl = `${API_BASE_URL}/shopee/etiqueta/${orderSn}?shop_id=${currentShopId}&tracking_number=${encodeURIComponent(trackingNumber)}`;
            console.log(`URL da etiqueta: ${etiquetaUrl}`);
            
            // Mostrar um indicador de carregamento
            const loadingMessage = document.createElement('div');
            loadingMessage.className = 'loading-message';
            loadingMessage.innerHTML = `
                <div class="loading-overlay">
                    <div class="loading-content">
                        <p>Baixando etiqueta...</p>
                        <div class="spinner"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(loadingMessage);
            
            try {
                // Baixar o arquivo usando Fetch API
                const pdfResponse = await fetch(etiquetaUrl, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/pdf'
                    }
                });
                
                if (!pdfResponse.ok) {
                    throw new Error(`Erro ao baixar etiqueta: ${pdfResponse.status} ${pdfResponse.statusText}`);
                }
                
                // Obter o blob do PDF
                const blob = await pdfResponse.blob();
                
                // Criar um URL para o blob
                const url = window.URL.createObjectURL(blob);
                
                // Criar um elemento de link invisível
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `etiqueta_${orderSn}_${trackingNumber}.pdf`;
                
                // Adicionar à página, clicar e remover
                document.body.appendChild(a);
                a.click();
                
                // Limpar após o download
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                alert(`Etiqueta para o pedido ${orderSn} baixada com sucesso!`);
            } catch (downloadError) {
                console.error('Erro ao baixar etiqueta:', downloadError);
                alert(`Erro ao baixar etiqueta: ${downloadError.message}`);
                
                // Se falhar o download direto, oferecer a opção de abrir em nova aba
                if (confirm('Não foi possível baixar automaticamente. Deseja tentar abrir em uma nova aba?')) {
                    window.open(etiquetaUrl, '_blank');
                }
            } finally {
                // Remover mensagem de carregamento
                document.body.removeChild(loadingMessage);
            }
            
        } else {
            alert('Não foi possível obter o número de rastreio para gerar a etiqueta.');
        }
        
    } catch (error) {
        console.error('Erro ao obter etiqueta:', error);
        alert(`Erro ao obter etiqueta: ${error.message}`);
    }
}

/**
 * Confirma uma venda (processa o pedido)
 */
async function handleConfirmOrder(orderSn, trackingNumber) {
    // Verificar se temos detalhes do pedido para confirmar
    try {
        // Buscar detalhes para verificar status atual
        const detailsUrl = `${API_BASE_URL}/shopee/orders/${orderSn}?shop_id=${currentShopId}`;
        console.log(`Verificando status atual do pedido: ${detailsUrl}`);
        
        const detailsResponse = await fetch(detailsUrl);
        if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json();
            console.log("Detalhes do pedido:", detailsData);
            
            if (detailsData.response?.order_list?.[0]) {
                const status = detailsData.response.order_list[0].order_status;
                
                if (status === 'PROCESSED' || status === 'SHIPPED') {
                    alert(`Este pedido já está processado (status: ${status}). Você pode obter a etiqueta diretamente.`);
                    
                    // Se já está processado mas não temos tracking number, obter antes de gerar etiqueta
                    if (!trackingNumber) {
                        try {
                            const trackingUrl = `${API_BASE_URL}/shopee/tracking/${orderSn}?shop_id=${currentShopId}`;
                            console.log(`Pedido já processado, buscando tracking number via: ${trackingUrl}`);
                            
                            const response = await fetch(trackingUrl);
                            if (response.ok) {
                                const data = await response.json();
                                console.log("Resposta da API de tracking:", data);
                                
                                if (data.tracking_number) {
                                    trackingNumber = data.tracking_number;
                                    console.log(`Tracking number obtido: ${trackingNumber}`);
                                }
                            }
                        } catch (trackingError) {
                            console.error("Erro ao obter tracking number:", trackingError);
                        }
                    }
                    
                    return await handleGetShippingLabel(orderSn, trackingNumber);
                }
            }
        }
    } catch (error) {
        console.error("Erro ao verificar status do pedido:", error);
    }
    
    if (!confirm(`Deseja confirmar o processamento do pedido ${orderSn}?`)) {
        return;
    }
    
    try {
        // Se não temos um tracking number, tentar obtê-lo ou gerar um temporário
        let trackingNo = trackingNumber;
        if (!trackingNo) {
            try {
                const trackingUrl = `${API_BASE_URL}/shopee/tracking/${orderSn}?shop_id=${currentShopId}`;
                console.log(`Buscando tracking number: ${trackingUrl}`);
                
                const response = await fetch(trackingUrl);
                if (response.ok) {
                    const data = await response.json();
                    console.log("Resposta da API de tracking:", data);
                    
                    if (data.tracking_number) {
                        trackingNo = data.tracking_number;
                        console.log(`Tracking number obtido: ${trackingNo}`);
                    }
                }
                
                if (!trackingNo) {
                    // Código temporário para processamento
                    trackingNo = `TEMP${Date.now()}`;
                    console.log("Usando tracking number temporário:", trackingNo);
                }
            } catch (trackingError) {
                console.error("Erro ao obter tracking number:", trackingError);
                trackingNo = `TEMP${Date.now()}`;
            }
        }
        
        // Enviar requisição para processar o pedido
        const url = `${API_BASE_URL}/shopee/ship-order`;
        console.log(`Enviando pedido para processamento: ${url}`);
        
        const data = {
            shop_id: currentShopId,
            order_sn: orderSn,
            tracking_number: trackingNo
        };
        
        console.log("Dados enviados:", data);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        console.log("Resposta do processamento:", result);
        
        if (response.ok) {
            alert('Pedido processado com sucesso!');
            
            // Verificar se temos o tracking number válido na resposta
            if (result.tracking_number) {
                trackingNo = result.tracking_number;
            }
            
            // Perguntar se deseja gerar a etiqueta
            if (confirm('Pedido processado com sucesso! Deseja gerar a etiqueta de envio?')) {
                await handleGetShippingLabel(orderSn, trackingNo);
            }
            
        } else if (result.error === 'logistics.package_already_shipped') {
            alert('Este pedido já foi processado anteriormente. Você pode obter a etiqueta diretamente.');
            
            // Buscar tracking number atualizado
            try {
                const trackingUrl = `${API_BASE_URL}/shopee/tracking/${orderSn}?shop_id=${currentShopId}`;
                const trackingResponse = await fetch(trackingUrl);
                if (trackingResponse.ok) {
                    const trackingData = await trackingResponse.json();
                    if (trackingData.tracking_number) {
                        trackingNo = trackingData.tracking_number;
                    }
                }
            } catch (e) {
                console.error("Erro ao buscar tracking number atualizado:", e);
            }
            
            // Perguntar se deseja gerar a etiqueta
            if (confirm('Deseja gerar a etiqueta de envio?')) {
                await handleGetShippingLabel(orderSn, trackingNo);
            }
            
        } else {
            alert(`Erro ao processar pedido: ${result.message || response.statusText}`);
        }
        
        // Recarregar a lista para atualizar o status
        loadOrders();
        
    } catch (error) {
        console.error('Erro ao confirmar pedido:', error);
        alert(`Erro ao confirmar pedido: ${error.message}`);
    }
}

/**
 * Visualiza detalhes completos do pedido
 */
async function handleViewDetails(orderSn) {
    console.log(`Visualizando detalhes do pedido ${orderSn}`);
    
    try {
        // Mostrar mensagem de carregamento
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'loading-message';
        loadingMessage.innerHTML = `
            <div class="loading-overlay">
                <div class="loading-content">
                    <p>Carregando detalhes do pedido...</p>
                    <div class="spinner"></div>
                </div>
            </div>
        `;
        document.body.appendChild(loadingMessage);
        
        // Buscar detalhes do pedido
        const detailsUrl = `${API_BASE_URL}/shopee/orders/${orderSn}?shop_id=${currentShopId}`;
        console.log(`Buscando detalhes do pedido: ${detailsUrl}`);
        
        const response = await fetch(detailsUrl, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`Erro ao buscar detalhes: ${response.status} ${response.statusText}`);
        }
        
        const detailsData = await response.json();
        console.log("Detalhes completos do pedido:", detailsData);
        
        // Remover mensagem de carregamento
        document.body.removeChild(loadingMessage);
        
        // Verificar se temos dados válidos
        if (!detailsData.response?.order_list?.[0]) {
            alert('Não foi possível obter os detalhes deste pedido.');
            return;
        }
        
        const orderDetails = detailsData.response.order_list[0];
        
        // Formatar data
        const createDate = new Date(orderDetails.create_time * 1000);
        const payDate = orderDetails.pay_time ? new Date(orderDetails.pay_time * 1000) : null;
        const shipByDate = orderDetails.ship_by_date ? new Date(orderDetails.ship_by_date * 1000) : null;
        
        // Obter endereço completo
        const address = orderDetails.recipient_address || {};
        
        // Criar modal para exibir detalhes
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // Montar conteúdo do modal com as informações do pedido
        modalContent.innerHTML = `
            <div class="modal-header">
                <h2>Detalhes do Pedido #${orderDetails.order_sn}</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="order-details-section">
                    <h3>Informações do Pedido</h3>
                    <table class="details-table">
                        <tr>
                            <th>Status:</th>
                            <td>${orderDetails.order_status}</td>
                        </tr>
                        <tr>
                            <th>Data de Criação:</th>
                            <td>${createDate.toLocaleString('pt-BR')}</td>
                        </tr>
                        <tr>
                            <th>Data de Pagamento:</th>
                            <td>${payDate ? payDate.toLocaleString('pt-BR') : 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Enviar até:</th>
                            <td>${shipByDate ? shipByDate.toLocaleString('pt-BR') : 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Método de Pagamento:</th>
                            <td>${orderDetails.payment_method || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Valor Total:</th>
                            <td>R$ ${orderDetails.total_amount.toFixed(2).replace('.', ',')}</td>
                        </tr>
                        <tr>
                            <th>Transportadora:</th>
                            <td>${orderDetails.shipping_carrier || 'N/A'}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="order-details-section">
                    <h3>Informações do Cliente</h3>
                    <table class="details-table">
                        <tr>
                            <th>Nome:</th>
                            <td>${address.name || orderDetails.buyer_username || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>CPF:</th>
                            <td>${orderDetails.buyer_cpf_id || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Telefone:</th>
                            <td>${address.phone || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Endereço:</th>
                            <td>${address.full_address || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Cidade:</th>
                            <td>${address.city || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Estado:</th>
                            <td>${address.state || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>CEP:</th>
                            <td>${address.zipcode || 'N/A'}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="order-details-section">
                    <h3>Itens do Pedido</h3>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Quantidade</th>
                                <th>Preço</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(orderDetails.item_list || []).map(item => `
                                <tr>
                                    <td>${item.item_name}</td>
                                    <td>${item.model_quantity_purchased}</td>
                                    <td>R$ ${item.model_discounted_price.toFixed(2).replace('.', ',')}</td>
                                    <td>R$ ${(item.model_discounted_price * item.model_quantity_purchased).toFixed(2).replace('.', ',')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="order-details-actions">
                    <button class="btn-confirm-modal ${orderDetails.order_status === 'PROCESSED' ? 'processed' : ''}" 
                            ${orderDetails.order_status === 'PROCESSED' || orderDetails.order_status === 'SHIPPED' ? 'disabled' : ''}>
                        ${orderDetails.order_status === 'PROCESSED' || orderDetails.order_status === 'SHIPPED' ? 'Processado' : 'Confirmar'}
                    </button>
                    <button class="btn-shipping-modal" 
                            ${orderDetails.order_status !== 'PROCESSED' && orderDetails.order_status !== 'SHIPPED' && orderDetails.order_status !== 'READY_TO_SHIP' ? 'disabled' : ''}>
                        Etiqueta
                    </button>
                </div>
            </div>
        `;
        
        // Adicionar modal ao documento
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
        
        // Adicionar eventos
        const closeBtn = modalContent.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
        });
        
        // Fechar ao clicar fora do modal
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
            }
        });
        
        // Adicionar eventos aos botões do modal
        const confirmBtnModal = modalContent.querySelector('.btn-confirm-modal');
        const shippingBtnModal = modalContent.querySelector('.btn-shipping-modal');
        
        // Obter tracking number se disponível
        const trackingNumber = orderDetails.tracking_number || 
                               (orderDetails.package_list && orderDetails.package_list[0] && 
                                orderDetails.package_list[0].shipping_carrier ? 
                                orderDetails.package_list[0].shipping_carrier.tracking_number : '');
        
        // Adicionar eventos
        confirmBtnModal.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
            handleConfirmOrder(orderDetails.order_sn, trackingNumber);
        });
        
        shippingBtnModal.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
            handleGetShippingLabel(orderDetails.order_sn, trackingNumber);
        });
        
    } catch (error) {
        console.error('Erro ao visualizar detalhes do pedido:', error);
        alert(`Erro ao carregar detalhes: ${error.message}`);
        
        // Remover mensagem de carregamento se existir
        const loadingMessage = document.querySelector('.loading-message');
        if (loadingMessage) {
            document.body.removeChild(loadingMessage);
        }
    }
}

// Configura os event listeners para os botões
function setupEventListeners() {
    // Event listener para o botão de login
    document.getElementById('login-btn').addEventListener('click', function() {
        const shopId = document.getElementById('shop-id').value.trim();
        const refreshToken = document.getElementById('refresh-token').value.trim();
        
        if (shopId && refreshToken) {
            // Salva os tokens no localStorage
            localStorage.setItem('shopId', shopId);
            localStorage.setItem('refreshToken', refreshToken);
            
            // Salvar nas variáveis globais
            currentShopId = shopId;
            currentRefreshToken = refreshToken;
            
            // Carrega os pedidos
            loadOrders();
            
            // Mostra a tela de pedidos
            showOrdersScreen();
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    });
    
    // Event listener para o botão de logout
    document.getElementById('logout-btn').addEventListener('click', function() {
        // Remove os tokens do localStorage
        localStorage.removeItem('shopId');
        localStorage.removeItem('refreshToken');
        
        // Limpar variáveis globais
        currentShopId = null;
        currentRefreshToken = null;
        
        // Mostra a tela de login
        showLoginScreen();
    });
    
    // Event listener para o botão de refresh
    document.getElementById('refresh-btn').addEventListener('click', function() {
        loadOrders();
    });
    
    // Event listener para o filtro de data
    document.getElementById('date-filter').addEventListener('change', function() {
        loadOrders();
    });
} 