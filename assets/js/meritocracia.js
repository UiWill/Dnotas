// Lista de funcionários (será carregada do localStorage ou dados padrão)
let funcionarios = [
    "Diego", "William", "Cristiano", "Eliezer", "Rennan", 
    "Pablo", "Guilherme", "Erick", "Fabricio"
];

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDPbFGQy9Tl_9GxQXKrwgNXpHHVkpvDPxE",
    authDomain: "dnotas-site.firebaseapp.com",
    projectId: "dnotas-site",
    storageBucket: "dnotas-site.appspot.com",
    messagingSenderId: "1093565472044",
    appId: "1:1093565472044:web:c7c7f7c0f0d5d5d5d5d5d5",
    databaseURL: "https://merito-b807d-default-rtdb.firebaseio.com"
};

// Inicializa o Firebase
let database;
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    database = firebase.database();
    console.log('Firebase inicializado com sucesso!');
} catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
    showNotification('Erro ao conectar ao banco de dados. Alguns recursos podem não funcionar.', 'error');
}

// Referências do banco de dados
const contribuicoesRef = database ? database.ref('contribuicoes') : null;
const pontosRef = database ? database.ref('pontos') : null;
const funcionariosRef = database ? database.ref('funcionarios') : null;

// Variáveis globais
let contribuicoes = [];
let tabelaContribuicoes;
let tabelaRanking;

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    initializeSystem();
    setupEventListeners();
    loadEmployees();
    observarContribuicoes();
    observarPontos();
});

// Inicializar sistema
function initializeSystem() {
    // Carregar dados do localStorage como fallback
    carregarDadosLocais();
    
    // Inicializar tabelas
    initializeTables();
    
    // Mostrar notificação de boas-vindas
    setTimeout(() => {
        showNotification('Sistema de Meritocracia carregado com sucesso!', 'success');
    }, 1000);
}

// Configurar event listeners
function setupEventListeners() {
    // Formulário de contribuição
    document.getElementById('formContribuicao').addEventListener('submit', handleSubmit);
    
    // Gerenciamento de funcionários
    document.getElementById('addEmployeeBtn').addEventListener('click', addEmployee);
    document.getElementById('newEmployee').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addEmployee();
        }
    });
    
    // Botões de ação
    document.getElementById('btnLimparTudo').addEventListener('click', limparPontuacoes);
    
    // Botões fixos
    setupFixedButtons();
}

// Atualizar select de colaboradores
function updateCollaboratorSelect() {
    const selectElement = document.getElementById('nome');
    if (!selectElement) return;
    
    // Limpar opções existentes (exceto a primeira)
    selectElement.innerHTML = '<option value="">Selecione um colaborador</option>';
    
    // Adicionar funcionários como opções
    funcionarios.forEach(funcionario => {
        const option = document.createElement('option');
        option.value = funcionario;
        option.textContent = funcionario;
        selectElement.appendChild(option);
    });
}

// Carregar funcionários
function loadEmployees() {
    // Tentar carregar do Firebase primeiro
    if (funcionariosRef) {
        funcionariosRef.once('value', (snapshot) => {
            if (snapshot.exists()) {
                funcionarios = Object.values(snapshot.val());
            } else {
                // Salvar lista padrão no Firebase
                saveEmployeesToFirebase();
            }
            updateEmployeeList();
            updateCollaboratorSelect();
        });
    } else {
        // Carregar do localStorage
        const savedEmployees = localStorage.getItem('funcionarios');
        if (savedEmployees) {
            funcionarios = JSON.parse(savedEmployees);
        }
        updateEmployeeList();
        updateCollaboratorSelect();
    }
}

// Adicionar funcionário
function addEmployee(nome = null) {
    const newEmployeeInput = document.getElementById('newEmployee');
    if (!newEmployeeInput) {
        console.error('Campo de novo funcionário não encontrado');
        return;
    }
    
    const nomeToAdd = nome || newEmployeeInput.value.trim();
    
    if (!nomeToAdd) {
        showNotification('Digite o nome do funcionário', 'warning');
        return;
    }
    
    if (funcionarios.includes(nomeToAdd)) {
        showNotification('Este funcionário já existe', 'warning');
        return;
    }
    
    console.log('Adicionando funcionário:', nomeToAdd);
    funcionarios.push(nomeToAdd);
    funcionarios.sort(); // Manter lista ordenada
    console.log('Lista atualizada:', funcionarios);
    
    // Salvar no Firebase e localStorage
    saveEmployeesToFirebase();
    localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
    
    // Atualizar interface
    updateEmployeeList();
    updateCollaboratorSelect();
    newEmployeeInput.value = '';
    
    showNotification(`Funcionário "${nomeToAdd}" adicionado com sucesso!`, 'success');
}

// Remover funcionário (versão antiga - mantida para compatibilidade)
function removeEmployee(nome) {
    if (confirm(`Deseja remover o funcionário "${nome}"?`)) {
        funcionarios = funcionarios.filter(func => func !== nome);
        
        // Salvar no Firebase e localStorage
        saveEmployeesToFirebase();
        localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
        
        // Atualizar interface
        updateEmployeeList();
        updateCollaboratorSelect();
        
        showNotification(`Funcionário "${nome}" removido`, 'success');
    }
}

// Remover funcionário por índice (versão mais confiável)
function removeEmployeeByIndex(index, nome) {
    console.log(`Tentando remover funcionário: ${nome} (índice: ${index})`);
    
    if (index < 0 || index >= funcionarios.length) {
        console.error('Índice inválido:', index);
        showNotification('Erro ao remover funcionário', 'error');
        return;
    }
    
    if (confirm(`Deseja remover o funcionário "${nome}"?`)) {
        // Remover pelo índice para maior precisão
        funcionarios.splice(index, 1);
        
        console.log('Funcionários restantes:', funcionarios);
        
        // Salvar no Firebase e localStorage
        saveEmployeesToFirebase();
        localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
        
        // Atualizar interface
        updateEmployeeList();
        updateCollaboratorSelect();
        
        showNotification(`Funcionário "${nome}" removido com sucesso!`, 'success');
    }
}

// Salvar funcionários no Firebase
function saveEmployeesToFirebase() {
    if (funcionariosRef) {
        funcionariosRef.set(funcionarios)
            .then(() => {
                console.log('Funcionários salvos no Firebase com sucesso');
            })
            .catch((error) => {
                console.error('Erro ao salvar funcionários no Firebase:', error);
            });
    } else {
        console.log('Firebase não disponível, salvando apenas no localStorage');
    }
}

// Atualizar lista de funcionários na interface
function updateEmployeeList() {
    const employeeList = document.getElementById('employeeList');
    if (!employeeList) {
        console.error('Lista de funcionários não encontrada');
        return;
    }
    
    employeeList.innerHTML = '';
    
    funcionarios.forEach((funcionario, index) => {
        const tag = document.createElement('div');
        tag.className = 'employee-tag';
        
        // Criar elementos separadamente para evitar problemas com caracteres especiais
        const icon = document.createElement('i');
        icon.className = 'bi bi-person';
        
        const span = document.createElement('span');
        span.textContent = funcionario;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.title = 'Remover funcionário';
        removeBtn.innerHTML = '<i class="bi bi-x"></i>';
        
        // Adicionar event listener diretamente ao botão
        removeBtn.addEventListener('click', function() {
            removeEmployeeByIndex(index, funcionario);
        });
        
        // Montar o elemento
        tag.appendChild(icon);
        tag.appendChild(span);
        tag.appendChild(removeBtn);
        
        employeeList.appendChild(tag);
    });
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    // Remover notificação existente
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Ícones por tipo
    let icon = '💬';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="font-size: 1.2rem;">${icon}</div>
            <div>${message}</div>
        </div>
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
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Inicializar tabelas
function initializeTables() {
    // Configuração comum para DataTables
    const commonConfig = {
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json'
        },
        responsive: true,
        pageLength: 10,
        dom: '<"top"lf>rt<"bottom"ip>',
        order: []
    };
    
    // Inicializar tabela de contribuições
    tabelaContribuicoes = $('#tabelaContribuicoes').DataTable({
        ...commonConfig,
        columns: [
            { data: 'nome', title: 'Colaborador' },
            { data: 'pontuacao', title: 'Pontos' },
            { data: 'categoria', title: 'Categoria' },
            { data: 'descricao', title: 'Descrição' },
            { data: 'status', title: 'Status', render: renderStatus },
            { data: 'timestamp', title: 'Data', render: renderData },
            { data: null, title: 'Ações', render: renderAcoes, orderable: false }
        ],
        order: [[5, 'desc']] // Ordenar por data, mais recente primeiro
    });
    
    // Inicializar tabela de ranking
    tabelaRanking = $('#tabelaRanking').DataTable({
        ...commonConfig,
        columns: [
            { data: 'posicao', title: 'Posição', render: renderPosicao },
            { data: 'nome', title: 'Colaborador' },
            { data: 'totalPontos', title: 'Total de Pontos' },
            { data: 'contribuicoes', title: 'Contribuições' },
            { data: 'media', title: 'Média', render: renderMedia }
        ],
        order: [[2, 'desc']] // Ordenar por pontos, maior primeiro
    });
}

// Renderizar status
function renderStatus(data) {
    const statusMap = {
        'Pendente': { class: 'status-pending', icon: 'bi-clock', text: 'Pendente' },
        'Validado': { class: 'status-approved', icon: 'bi-check-circle', text: 'Aprovado' },
        'Rejeitado': { class: 'status-rejected', icon: 'bi-x-circle', text: 'Rejeitado' }
    };
    
    const status = statusMap[data] || statusMap['Pendente'];
    return `
        <span class="status-badge ${status.class}">
            <i class="bi ${status.icon}"></i>
            ${status.text}
        </span>
    `;
}

// Renderizar data
function renderData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

// Renderizar posição no ranking
function renderPosicao(data, type, row, meta) {
    const posicao = meta.row + 1;
    let emoji = '';
    if (posicao === 1) emoji = '🥇';
    else if (posicao === 2) emoji = '🥈';
    else if (posicao === 3) emoji = '🥉';
    
    return `${emoji} ${posicao}°`;
}

// Renderizar média
function renderMedia(data) {
    return data.toFixed(1);
}

// Renderizar ações
function renderAcoes(data, type, row) {
    let botoes = '';
    
    if (row.status === 'Pendente') {
        // Contribuição pendente - mostrar botões de aprovar e rejeitar
        botoes = `
            <button class="btn btn-success btn-sm" onclick="validarContribuicao('${row.id}')" title="Aprovar">
                <i class="bi bi-check"></i>
            </button>
            <button class="btn btn-warning btn-sm" onclick="rejeitarContribuicao('${row.id}')" title="Rejeitar">
                <i class="bi bi-x"></i>
            </button>
        `;
    } else {
        // Contribuição já aprovada ou rejeitada - mostrar status apenas
        let statusInfo = '';
        if (row.status === 'Validado') {
            statusInfo = `
                <span class="btn btn-success btn-sm" style="cursor: default; opacity: 0.7;" title="Já aprovado">
                    <i class="bi bi-check"></i> Aprovado
                </span>
            `;
        } else if (row.status === 'Rejeitado') {
            statusInfo = `
                <span class="btn btn-warning btn-sm" style="cursor: default; opacity: 0.7;" title="Já rejeitado">
                    <i class="bi bi-x"></i> Rejeitado
                </span>
            `;
        }
        botoes = statusInfo;
    }
    
    // Botão excluir sempre disponível para administradores
    botoes += `
        <button class="btn btn-danger btn-sm" onclick="excluirContribuicao('${row.id}')" title="Excluir (Admin)">
            <i class="bi bi-trash"></i>
        </button>
    `;
    
    return `<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">${botoes}</div>`;
}

// Manipular envio do formulário
async function handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const nome = formData.get('nome').trim();
    const pontuacao = parseInt(formData.get('pontuacao'));
    const categoria = formData.get('categoria');
    const descricao = formData.get('descricao').trim();
    
    // Validações
    if (!nome || !pontuacao || !categoria || !descricao) {
        showNotification('Por favor, preencha todos os campos!', 'error');
        return;
    }
    
    if (pontuacao < 1 || pontuacao > 100) {
        showNotification('A pontuação deve estar entre 1 e 100!', 'error');
        return;
    }
    
    try {
        const novaContribuicao = {
            id: gerarId(),
            nome: nome,
            pontuacao: pontuacao,
            categoria: categoria,
            descricao: descricao,
            status: 'Pendente',
            timestamp: Date.now()
        };
        
        // Salvar no Firebase
        if (contribuicoesRef) {
            await contribuicoesRef.child(novaContribuicao.id).set(novaContribuicao);
        } else {
            // Fallback para localStorage
            contribuicoes.push(novaContribuicao);
            salvarDadosLocais();
            atualizarTabelaContribuicoes();
        }
        
        // Limpar formulário
        form.reset();
        
        showNotification('Contribuição registrada com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao registrar contribuição:', error);
        showNotification('Erro ao registrar contribuição. Tente novamente.', 'error');
    }
}

// Observar mudanças nas contribuições
function observarContribuicoes() {
    if (contribuicoesRef) {
        contribuicoesRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                contribuicoes = Object.values(snapshot.val());
                atualizarTabelaContribuicoes();
            }
        });
    }
}

// Observar mudanças nos pontos
function observarPontos() {
    if (pontosRef) {
        pontosRef.on('value', (snapshot) => {
            const pontos = snapshot.exists() ? snapshot.val() : {};
            atualizarTabelaRanking(pontos);
        });
    }
}

// Atualizar tabela de contribuições
function atualizarTabelaContribuicoes() {
    if (tabelaContribuicoes) {
        tabelaContribuicoes.clear();
        tabelaContribuicoes.rows.add(contribuicoes);
        tabelaContribuicoes.draw();
    }
}

// Atualizar tabela de ranking
function atualizarTabelaRanking(pontos) {
    if (!tabelaRanking) return;
    
    // Calcular estatísticas por funcionário
    const estatisticas = {};
    
    funcionarios.forEach(funcionario => {
        estatisticas[funcionario] = {
            nome: funcionario,
            totalPontos: pontos[funcionario] || 0,
            contribuicoes: 0,
            media: 0
        };
    });
    
    // Calcular contribuições e médias
    contribuicoes.filter(c => c.status === 'Validado').forEach(contribuicao => {
        if (estatisticas[contribuicao.nome]) {
            estatisticas[contribuicao.nome].contribuicoes++;
        }
    });
    
    // Calcular média
    Object.values(estatisticas).forEach(stat => {
        if (stat.contribuicoes > 0) {
            stat.media = stat.totalPontos / stat.contribuicoes;
        }
    });
    
    // Ordenar por pontos
    const rankingData = Object.values(estatisticas)
        .filter(stat => stat.totalPontos > 0)
        .sort((a, b) => b.totalPontos - a.totalPontos);
    
    tabelaRanking.clear();
    tabelaRanking.rows.add(rankingData);
    tabelaRanking.draw();
}

// Validar contribuição
async function validarContribuicao(id) {
    const senha = prompt('Digite a senha de administrador:');
    if (!senha || senha !== '2020') {
        if (senha) showNotification('Senha incorreta!', 'error');
        return;
    }
    
    try {
        if (!contribuicoesRef) {
            showNotification('Não foi possível conectar ao banco de dados.', 'error');
            return;
        }
        
        const snapshot = await contribuicoesRef.child(id).once('value');
        if (snapshot.exists()) {
            const contribuicao = snapshot.val();
            
            // Verificar se já foi processada
            if (contribuicao.status !== 'Pendente') {
                showNotification(`Esta contribuição já foi ${contribuicao.status.toLowerCase()}!`, 'warning');
                return;
            }
            
            // Atualizar status
            await contribuicoesRef.child(id).update({ 
                status: 'Validado',
                processadoEm: Date.now(),
                processadoPor: 'admin'
            });
            
            // Atualizar pontos
            if (pontosRef) {
                const pontosSnapshot = await pontosRef.child(contribuicao.nome).once('value');
                const pontosAtuais = pontosSnapshot.exists() ? pontosSnapshot.val() : 0;
                await pontosRef.child(contribuicao.nome).set(pontosAtuais + contribuicao.pontuacao);
            }
            
            showNotification(`Contribuição de ${contribuicao.nome} aprovada! (+${contribuicao.pontuacao} pontos)`, 'success');
        }
    } catch (error) {
        console.error('Erro ao validar contribuição:', error);
        showNotification('Erro ao validar contribuição. Tente novamente.', 'error');
    }
}

// Rejeitar contribuição
async function rejeitarContribuicao(id) {
    const senha = prompt('Digite a senha de administrador:');
    if (!senha || senha !== '2020') {
        if (senha) showNotification('Senha incorreta!', 'error');
        return;
    }
    
    const motivo = prompt('Motivo da rejeição (opcional):');
    
    try {
        if (!contribuicoesRef) {
            showNotification('Não foi possível conectar ao banco de dados.', 'error');
            return;
        }
        
        const snapshot = await contribuicoesRef.child(id).once('value');
        if (snapshot.exists()) {
            const contribuicao = snapshot.val();
            
            // Verificar se já foi processada
            if (contribuicao.status !== 'Pendente') {
                showNotification(`Esta contribuição já foi ${contribuicao.status.toLowerCase()}!`, 'warning');
                return;
            }
            
            // Atualizar status
            await contribuicoesRef.child(id).update({ 
                status: 'Rejeitado',
                processadoEm: Date.now(),
                processadoPor: 'admin',
                motivoRejeicao: motivo || 'Não informado'
            });
            
            showNotification(`Contribuição de ${contribuicao.nome} rejeitada!`, 'warning');
        }
    } catch (error) {
        console.error('Erro ao rejeitar contribuição:', error);
        showNotification('Erro ao rejeitar contribuição. Tente novamente.', 'error');
    }
}

// Excluir contribuição
async function excluirContribuicao(id) {
    if (!confirm('Tem certeza que deseja excluir esta contribuição?')) {
        return;
    }
    
    const senha = prompt('Digite a senha de administrador:');
    if (!senha || senha !== '2020') {
        if (senha) showNotification('Senha incorreta!', 'error');
        return;
    }
    
    try {
        if (!contribuicoesRef) {
            showNotification('Não foi possível conectar ao banco de dados.', 'error');
            return;
        }
        
        await contribuicoesRef.child(id).remove();
        showNotification('Contribuição excluída!', 'success');
    } catch (error) {
        console.error('Erro ao excluir contribuição:', error);
        showNotification('Erro ao excluir contribuição. Tente novamente.', 'error');
    }
}

// Limpar todas as pontuações e contribuições
async function limparPontuacoes() {
    const senha = prompt('Digite a senha de administrador para limpar TODOS os dados:');
    if (!senha || senha !== '2020') {
        if (senha) showNotification('Senha incorreta!', 'error');
        return;
    }
    
    if (!confirm('ATENÇÃO: Isso irá apagar TODAS as pontuações e contribuições registradas. Esta ação é IRREVERSÍVEL! Confirma?')) {
        return;
    }
    
    try {
        console.log('Iniciando limpeza completa dos dados...');
        
        // Limpar no Firebase
        if (contribuicoesRef && pontosRef) {
            await Promise.all([
                contribuicoesRef.remove(),
                pontosRef.remove()
            ]);
            console.log('Dados removidos do Firebase');
        }
        
        // Limpar dados locais
        contribuicoes = [];
        localStorage.removeItem('contribuicoes');
        console.log('Dados locais limpos');
        
        // Atualizar tabelas na interface
        if (tabelaContribuicoes) {
            tabelaContribuicoes.clear().draw();
            console.log('Tabela de contribuições limpa');
        }
        
        if (tabelaRanking) {
            tabelaRanking.clear().draw();
            console.log('Tabela de ranking limpa');
        }
        
        showNotification('Todos os dados foram limpos com sucesso! Sistema reiniciado.', 'success');
        
        // Dar um tempo para a notificação aparecer e depois recarregar
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao limpar dados:', error);
        showNotification('Erro ao limpar dados. Tente novamente.', 'error');
    }
}



// Configurar botões fixos
function setupFixedButtons() {
    // Botão voltar ao topo
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        // Mostrar/ocultar baseado na posição do scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.style.display = 'flex';
            } else {
                backToTop.style.display = 'none';
            }
        });
    }
    
    // Botão WhatsApp
    const whatsappButton = document.getElementById('whatsappButton');
    if (whatsappButton) {
        whatsappButton.addEventListener('click', () => {
            window.open('https://wa.me/5511999999999', '_blank');
        });
    }
}

// Funções utilitárias
function gerarId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function carregarDadosLocais() {
    const dadosContribuicoes = localStorage.getItem('contribuicoes');
    if (dadosContribuicoes) {
        contribuicoes = JSON.parse(dadosContribuicoes);
    }
}

function salvarDadosLocais() {
    localStorage.setItem('contribuicoes', JSON.stringify(contribuicoes));
}

// Tornar funções globais para uso nos botões HTML
window.validarContribuicao = validarContribuicao;
window.rejeitarContribuicao = rejeitarContribuicao;
window.excluirContribuicao = excluirContribuicao;
window.removeEmployee = removeEmployee;
window.removeEmployeeByIndex = removeEmployeeByIndex; 