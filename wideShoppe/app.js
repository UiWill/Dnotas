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

// Endpoint base da API
const API_BASE_URL = 'https://api.dnotas.com.br';

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se o usuário já está logado
    checkLocalStorage();
    
    // Adicionar eventos
    loginBtn.addEventListener('click', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    refreshBtn.addEventListener('click', loadOrders);
    dateFilter.addEventListener('change', loadOrders);
    
    // Adicionar header com logo da Dnotas
    const header = document.createElement('header');
    header.className = 'app-header';
    header.innerHTML = `
        <div class="logo-container">
            <svg class="dnotas-logo" width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" stroke="#2196F3" stroke-width="8"/>
                <circle cx="50" cy="50" r="20" fill="#2196F3"/>
            </svg>
            <span class="logo-text">DNOTAS</span>
        </div>
        <div class="header-subtitle">Gerenciamento de Pedidos</div>
    `;
    
    // Inserir o header antes do primeiro elemento no body
    document.body.insertBefore(header, document.body.firstChild);
    
    // Adicionar estilos CSS modernos inspirados no site Kast
    const style = document.createElement('style');
    style.textContent = `
        /* Fontes e estilos base */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            background-color: #0a0a0a;
            color: #f5f5f5;
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            padding-top: 80px;
            background-image: 
                radial-gradient(circle at 10% 10%, rgba(33, 150, 243, 0.05) 0%, transparent 30%),
                radial-gradient(circle at 90% 90%, rgba(33, 150, 243, 0.05) 0%, transparent 30%);
            background-attachment: fixed;
        }
        
        /* Header e Logo */
        .app-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 70px;
            background-color: rgba(18, 18, 18, 0.95);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 24px;
            box-shadow: 0 2px 15px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .logo-container {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .dnotas-logo {
            animation: pulse 6s infinite alternate;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .logo-text {
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 1px;
            color: white;
            position: relative;
        }
        
        .header-subtitle {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
            font-weight: 400;
        }
        
        /* Containers e Seções */
        #login-section, #orders-section {
            background-color: rgba(25, 25, 25, 0.8);
            backdrop-filter: blur(10px);
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            margin: 20px auto;
            max-width: 1200px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
        }
        
        h1, h2, h3 {
            color: #fff;
            font-weight: 600;
            margin-bottom: 20px;
        }
        
        /* Formulários e inputs */
        label {
            color: #ddd;
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 500;
        }
        
        input, select {
            background-color: rgba(45, 45, 45, 0.8);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            width: 100%;
            max-width: 400px;
            font-family: 'Inter', sans-serif;
            transition: all 0.2s;
        }
        
        input:focus, select:focus {
            border-color: #2196F3;
            outline: none;
            box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.2);
        }
        
        /* Botões */
        button {
            background-color: #2196F3;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s ease;
            font-family: 'Inter', sans-serif;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        button:hover {
            background-color: #1e88e5;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
        }
        
        button:active {
            transform: translateY(0);
            box-shadow: 0 2px 6px rgba(33, 150, 243, 0.2);
        }
        
        button:disabled {
            background-color: #444;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        /* Filtro de data e botão de atualizar */
        .filter-controls {
            display: flex;
            gap: 16px;
            align-items: center;
            margin-bottom: 24px;
            flex-wrap: wrap;
        }
        
        #date-filter {
            max-width: 200px;
            margin-bottom: 0;
        }
        
        /* Container da tabela com rolagem */
        .table-container {
            max-height: 400px;
            overflow-y: auto;
            margin-top: 20px;
            border-radius: 12px;
            background-color: rgba(30, 30, 30, 0.6);
            position: relative;
            scrollbar-width: thin;
            scrollbar-color: #444 #222;
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }
        
        /* Estilizar a barra de rolagem para navegadores WebKit */
        .table-container::-webkit-scrollbar {
            width: 8px;
        }
        
        .table-container::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 4px;
        }
        
        .table-container::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
        }
        
        .table-container::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        
        /* Fixar cabeçalho da tabela */
        .orders-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            background-color: transparent;
            table-layout: fixed;
        }
        
        .orders-table thead {
            position: sticky;
            top: 0;
            z-index: 1;
        }
        
        .orders-table th {
            text-align: left;
            padding: 14px 16px;
            background-color: rgba(20, 20, 20, 0.95);
            color: #aaa;
            font-weight: 500;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .orders-table th:first-child {
            border-top-left-radius: 12px;
        }
        
        .orders-table th:last-child {
            border-top-right-radius: 12px;
        }
        
        /* Colunas com largura definida */
        .orders-table th:first-child {
            width: 35%;
        }
        
        .orders-table th:nth-child(2) {
            width: 25%;
        }
        
        .orders-table th:last-child {
            width: 40%;
        }
        
        .orders-table td {
            padding: 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            color: #eee;
            vertical-align: middle;
        }
        
        .status-cell {
            text-align: center;
        }
        
        .actions-cell {
            text-align: center;
        }
        
        .actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            justify-content: center;
        }
        
        .actions button {
            padding: 8px 12px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            margin-bottom: 4px;
            min-width: 90px;
        }
        
        .order-row {
            transition: background-color 0.15s ease;
        }
        
        .order-row:hover {
            background-color: rgba(50, 50, 50, 0.5) !important;
        }
        
        tr:nth-child(even) {
            background-color: rgba(40, 40, 40, 0.3);
        }
        
        tr:nth-child(odd) {
            background-color: rgba(30, 30, 30, 0.3);
        }
        
        .order-id {
            font-weight: 500;
            color: #2196F3;
            font-family: monospace;
            font-size: 14px;
        }
        
        .status {
            font-weight: 500;
            display: inline-block;
            padding: 4px 10px;
            border-radius: 16px;
            font-size: 13px;
            text-align: center;
            min-width: 120px;
        }
        
        .status.processed {
            color: #4CAF50;
            background-color: rgba(76, 175, 80, 0.1);
            border: 1px solid rgba(76, 175, 80, 0.3);
        }
        
        .status.ready_to_ship {
            color: #2196F3;
            background-color: rgba(33, 150, 243, 0.1);
            border: 1px solid rgba(33, 150, 243, 0.3);
        }
        
        .status.shipped {
            color: #9C27B0;
            background-color: rgba(156, 39, 176, 0.1);
            border: 1px solid rgba(156, 39, 176, 0.3);
        }
        
        .btn-confirm {
            background-color: #4CAF50;
            color: white;
        }
        
        .btn-shipping {
            background-color: #2196F3;
            color: white;
        }
        
        .btn-details {
            background-color: rgba(255, 255, 255, 0.1);
            color: white;
            backdrop-filter: blur(5px);
        }
        
        .btn-details:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }
        
        .btn-confirm.processed {
            background-color: rgba(76, 175, 80, 0.2);
            color: #4CAF50;
            border: 1px solid rgba(76, 175, 80, 0.3);
        }
        
        /* Estilos para o modal */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(5px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .modal-content {
            background-color: #121212;
            width: 80%;
            max-width: 900px;
            max-height: 90vh;
            border-radius: 12px;
            overflow-y: auto;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            animation: slideUp 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            background-color: rgba(33, 33, 33, 0.8);
            position: sticky;
            top: 0;
            z-index: 2;
            backdrop-filter: blur(10px);
        }
        
        .modal-header h2 {
            margin: 0;
            font-size: 18px;
            color: #fff;
            font-weight: 600;
        }
        
        .close-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #aaa;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s;
        }
        
        .close-btn:hover {
            background-color: rgba(255, 255, 255, 0.1);
            color: #fff;
            transform: none;
            box-shadow: none;
        }
        
        .modal-body {
            padding: 24px;
            background-color: #121212;
        }
        
        .order-details-section {
            margin-bottom: 32px;
            background-color: transparent;
        }
        
        .order-details-section h3 {
            margin-top: 0;
            margin-bottom: 16px;
            padding-bottom: 8px;
            color: #2196F3;
            background-color: #121212;
            position: sticky;
            top: 72px;
            z-index: 1;
            font-size: 16px;
            border-bottom: 1px solid rgba(33, 150, 243, 0.3);
        }
        
        .details-table, .items-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-top: 10px;
            background-color: transparent;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .details-table th, .items-table th {
            text-align: left;
            padding: 12px 16px;
            background-color: rgba(40, 40, 40, 0.8);
            color: #aaa;
            font-weight: 500;
            font-size: 13px;
        }
        
        .details-table td, .items-table td {
            padding: 12px 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            color: #eee;
            background-color: transparent;
        }
        
        /* Garantir que as linhas pares nas tabelas também sejam escuras */
        .details-table tr:nth-child(even) td, 
        .items-table tr:nth-child(even) td {
            background-color: rgba(40, 40, 40, 0.3);
        }
        
        .order-details-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 20px;
            background-color: transparent;
            position: sticky;
            bottom: 0;
            padding: 15px 0;
            z-index: 1;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .empty-message {
            color: rgba(255, 255, 255, 0.6);
            text-align: center;
            padding: 40px 20px;
            background-color: rgba(20, 20, 20, 0.5);
            border-radius: 12px;
            margin-top: 20px;
            font-size: 15px;
            border: 1px dashed rgba(255, 255, 255, 0.1);
        }
        
        .error-message {
            color: #ff5252;
            background-color: rgba(255, 82, 82, 0.1);
            border-left: 4px solid #ff5252;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
        
        /* Indicador de loading */
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }
        
        .loading-content {
            background-color: rgba(30, 30, 30, 0.8);
            backdrop-filter: blur(10px);
            color: #fff;
            padding: 30px 40px;
            border-radius: 12px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
        }
        
        .spinner {
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top: 3px solid #2196F3;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 15px auto;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Adicionar estilo para o template de ordem original */
        #order-template {
            display: none;
        }
        
        /* Corrigir estilo para todos os elementos pré-existentes */
        .hidden {
            display: none !important;
        }
        
        #no-orders-message {
            color: rgba(255, 255, 255, 0.7);
            padding: 40px 20px;
            background-color: rgba(20, 20, 20, 0.5);
            border-radius: 12px;
            text-align: center;
            border: 1px dashed rgba(255, 255, 255, 0.1);
        }
        
        /* Responsividade para telas menores */
        @media (max-width: 768px) {
            .app-header {
                padding: 0 16px;
            }
            
            .header-subtitle {
                display: none;
            }
            
            body {
                padding-top: 70px;
            }
            
            #login-section, #orders-section {
                padding: 20px;
                margin: 15px;
                border-radius: 10px;
            }
            
            .actions {
                flex-direction: column;
                gap: 4px;
            }
            
            .actions button {
                width: 100%;
            }
            
            .table-container {
                max-height: 350px;
            }
            
            .modal-content {
                width: 95%;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Reorganizar os elementos de filtro para melhor apresentação
    const filterControls = document.createElement('div');
    filterControls.className = 'filter-controls';
    
    // Mover elementos existentes para o novo container
    const dateFilterLabel = document.querySelector('label[for="date-filter"]');
    if (dateFilterLabel) {
        filterControls.appendChild(dateFilterLabel);
        filterControls.appendChild(dateFilter);
        filterControls.appendChild(refreshBtn);
        
        // Encontrar o container principal
        const container = dateFilter.parentNode;
        container.insertBefore(filterControls, dateFilter.nextSibling);
    }
    
    console.log('Aplicação inicializada - usando API em:', API_BASE_URL);
});

/**
 * Verifica se há dados de login salvos e inicia sessão automaticamente
 */
function checkLocalStorage() {
    const savedShopId = localStorage.getItem('shopId');
    const savedRefreshToken = localStorage.getItem('refreshToken');
    
    if (savedShopId && savedRefreshToken) {
        shopIdInput.value = savedShopId;
        refreshTokenInput.value = savedRefreshToken;
        
        currentShopId = savedShopId;
        currentRefreshToken = savedRefreshToken;
        
        // Mostrar a seção de pedidos
        loginSection.classList.add('hidden');
        ordersSection.classList.remove('hidden');
        
        // Carregar os pedidos
        loadOrders();
    }
}

/**
 * Fazer requisição à API com tratamento especial para CORS
 */
async function fetchApi(url, options = {}) {
    // Adicionar timestamp para prevenir cache
    const timestampedUrl = url.includes('?') 
        ? `${url}&_t=${Date.now()}`
        : `${url}?_t=${Date.now()}`;
    
    console.log("Requisição para:", timestampedUrl);
    
    try {
        // Configuração correta para requisições cross-origin
        const fetchOptions = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            credentials: 'include',
            body: options.body
        };
        
        console.log("Opções de fetch:", fetchOptions);
        
        const response = await fetch(timestampedUrl, fetchOptions);
        
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Resposta recebida:", data);
        return data;
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}

/**
 * Lida com o processo de login
 */
function handleLogin() {
    const shopId = shopIdInput.value.trim();
    const refreshToken = refreshTokenInput.value.trim();
    
    if (!shopId || !refreshToken) {
        alert('Por favor, preencha o Shop ID e o Refresh Token');
        return;
    }
    
    // Salvar credenciais
    currentShopId = shopId;
    currentRefreshToken = refreshToken;
    
    // Salvar no localStorage para login automático
    localStorage.setItem('shopId', shopId);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Mostrar a seção de pedidos
    loginSection.classList.add('hidden');
    ordersSection.classList.remove('hidden');
    
    // Carregar os pedidos
    loadOrders();
}

/**
 * Encerra a sessão do usuário
 */
function handleLogout() {
    // Limpar variáveis de sessão
    currentShopId = '';
    currentRefreshToken = '';
    accessToken = '';
    
    // Limpar localStorage
    localStorage.removeItem('shopId');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessToken');
    
    // Voltar para a tela de login
    ordersSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    
    // Limpar o container de pedidos
    ordersContainer.innerHTML = '<p class="empty-message">Faça login para ver os pedidos</p>';
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
            <th>Pedido</th>
            <th>Status</th>
            <th>Ações</th>
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