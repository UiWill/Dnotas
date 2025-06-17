// Lista de prestadores (será carregada do localStorage ou dados padrão)
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
    
    // Mostrar dica sobre organização das tabelas
    showTableOrganizationTip();
}

// Configurar event listeners
function setupEventListeners() {
    // Formulário de contribuição
    document.getElementById('formContribuicao').addEventListener('submit', handleSubmit);
    
    // Gerenciamento de funcionários
    document.getElementById('addEmployeeBtn').addEventListener('click', function(event) {
        event.preventDefault();
        addEmployee();
    });
    document.getElementById('newEmployee').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addEmployee();
        }
    });
    
    // Easter egg do tubarão - funciona em qualquer campo de texto
    document.addEventListener('input', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            if (e.target.value.toLowerCase().includes('tubarao')) {
                triggerSharkEasterEgg();
                // Limpar o campo que ativou o easter egg
                e.target.value = e.target.value.replace(/tubarao/gi, '');
            }
        }
    });
    
    // Botões de ação
    document.getElementById('btnLimparTudo').addEventListener('click', limparPontuacoes);
    
    // Botões fixos
    setupFixedButtons();
}

// Atualizar select de prestadores
function updateCollaboratorSelect() {
    const selectElement = document.getElementById('nome');
    if (!selectElement) return;
    
    // Limpar opções existentes (exceto a primeira)
    selectElement.innerHTML = '<option value="">Selecione um prestador</option>';
    
    // Adicionar prestadores como opções
    funcionarios.forEach(funcionario => {
        const option = document.createElement('option');
        option.value = funcionario;
        option.textContent = funcionario;
        selectElement.appendChild(option);
    });
}

// Carregar prestadores
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

// Adicionar prestador
function addEmployee(nome = null) {
    const newEmployeeInput = document.getElementById('newEmployee');
    if (!newEmployeeInput) {
        console.error('Campo de novo prestador não encontrado');
        return;
    }
    
    const nomeToAdd = nome || newEmployeeInput.value.trim();
    
    if (!nomeToAdd || nomeToAdd === '') {
        showNotification('Digite o nome do prestador', 'warning');
        return;
    }
    
    if (funcionarios.includes(nomeToAdd)) {
        showNotification('Este prestador já existe', 'warning');
        return;
    }
    
    console.log('Adicionando prestador:', nomeToAdd);
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
    
    showNotification(`Prestador "${nomeToAdd}" adicionado com sucesso!`, 'success');
}

// Remover prestador (versão antiga - mantida para compatibilidade)
function removeEmployee(nome) {
    if (confirm(`Deseja remover o prestador "${nome}"?`)) {
        funcionarios = funcionarios.filter(func => func !== nome);
        
        // Salvar no Firebase e localStorage
        saveEmployeesToFirebase();
        localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
        
        // Atualizar interface
        updateEmployeeList();
        updateCollaboratorSelect();
        
        showNotification(`Prestador "${nome}" removido`, 'success');
    }
}

// Remover prestador por índice (versão mais confiável)
function removeEmployeeByIndex(index, nome) {
    console.log(`Tentando remover prestador: ${nome} (índice: ${index})`);
    
    if (index < 0 || index >= funcionarios.length) {
        console.error('Índice inválido:', index);
        showNotification('Erro ao remover prestador', 'error');
        return;
    }
    
    // Solicitar senha de administrador
    const senha = prompt('Digite a senha de administrador para remover prestador:');
    if (!senha || senha !== '102030') {
        if (senha) showNotification('Senha incorreta!', 'error');
        return;
    }
    
    if (confirm(`Deseja remover o prestador "${nome}"?`)) {
        // Remover pelo índice para maior precisão
        funcionarios.splice(index, 1);
        
        console.log('Prestadores restantes:', funcionarios);
        
        // Salvar no Firebase e localStorage
        saveEmployeesToFirebase();
        localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
        
        // Atualizar interface
        updateEmployeeList();
        updateCollaboratorSelect();
        
        showNotification(`Prestador "${nome}" removido com sucesso!`, 'success');
    }
}

// Salvar prestadores no Firebase
function saveEmployeesToFirebase() {
    if (funcionariosRef) {
        funcionariosRef.set(funcionarios)
            .then(() => {
                console.log('Prestadores salvos no Firebase com sucesso');
            })
            .catch((error) => {
                console.error('Erro ao salvar prestadores no Firebase:', error);
            });
    } else {
        console.log('Firebase não disponível, salvando apenas no localStorage');
    }
}

// Atualizar lista de prestadores na interface
function updateEmployeeList() {
    const employeeList = document.getElementById('employeeList');
    if (!employeeList) {
        console.error('Lista de prestadores não encontrada');
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
        responsive: {
            details: {
                type: 'column',
                target: 'tr'
            }
        },
        pageLength: 10,
        dom: '<"top"lf>rt<"bottom"ip>',
        order: [],
        columnDefs: [
            {
                targets: '_all',
                className: 'dt-body-nowrap'
            }
        ]
    };
    
    // Inicializar tabela de contribuições
    tabelaContribuicoes = $('#tabelaContribuicoes').DataTable({
        ...commonConfig,
        columns: [
            { data: 'nome', title: 'Prestador', width: '15%' },
            { data: 'pontuacao', title: 'Pts', render: renderPontuacao, width: '7%', className: 'text-center' },
            { data: 'categoria', title: 'Categoria', render: renderCategoria, width: '15%' },
            { data: 'descricao', title: 'Descrição', width: '30%' },
            { data: 'status', title: 'Status', render: renderStatus, width: '12%', className: 'text-center' },
            { data: 'timestamp', title: 'Data', render: renderData, width: '13%', className: 'text-center' },
            { data: null, title: 'Ações', render: renderAcoes, orderable: false, width: '8%', className: 'text-center' }
        ],
        order: [[5, 'desc']], // Ordenar por data, mais recente primeiro
        scrollX: true,
        autoWidth: false,
        createdRow: function(row, data, dataIndex) {
            // Adicionar classe para penalidades
            if (data.pontuacao < 0) {
                $(row).addClass('penalty-row');
            }
        }
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
        order: [[2, 'desc']], // Ordenar por pontos, maior primeiro
        createdRow: function(row, data, dataIndex) {
            // Adicionar atributo para destacar funcionários com 0 pontos
            $(row).attr('data-total-pontos', data.totalPontos);
        }
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

// Renderizar pontuação com destaque para negativas
function renderPontuacao(data) {
    if (data < 0) {
        return `<span class="penalty-points">${data}</span>`;
    } else {
        return `<span style="color: #4caf50; font-weight: bold;">+${data}</span>`;
    }
}

// Renderizar categoria com destaque para penalidades
function renderCategoria(data) {
    const penaltyCategories = ['Atraso', 'Qualidade-Negativa', 'Comportamento', 'Negligencia', 'Conflito', 'Descumprimento', 'Improdutividade'];
    
    if (penaltyCategories.includes(data)) {
        return `<span class="penalty-category">${data}</span>`;
    }
    return data;
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
        // Contribuição pendente - botões compactos apenas com ícones
        botoes = `
            <div style="display: flex; flex-direction: column; gap: 2px; align-items: center; min-width: 45px;">
                <button class="btn btn-success btn-sm btn-icon" onclick="validarContribuicao('${row.id}')" title="Aprovar">
                    <i class="bi bi-check"></i>
                </button>
                <button class="btn btn-warning btn-sm btn-icon" onclick="rejeitarContribuicao('${row.id}')" title="Rejeitar">
                    <i class="bi bi-x"></i>
                </button>
                <button class="btn btn-danger btn-sm btn-icon" onclick="excluirContribuicao('${row.id}')" title="Excluir">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
    } else {
        // Contribuição já aprovada ou rejeitada - apenas botão de excluir
        botoes = `
            <button class="btn btn-danger btn-sm btn-icon" onclick="excluirContribuicao('${row.id}')" title="Excluir (Admin)">
                <i class="bi bi-trash"></i>
            </button>
        `;
    }
    
    return botoes;
}

// Renderizar ações para contribuições processadas (apenas excluir)
function renderAcoesProcessadas(data, type, row) {
    return `
        <button class="btn btn-danger btn-sm btn-icon" onclick="excluirContribuicao('${row.id}')" title="Excluir Contribuição (Remove pontos se aprovada)">
            <i class="bi bi-trash"></i>
        </button>
    `;
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
    
    if (pontuacao < -50 || pontuacao > 100 || pontuacao === 0) {
        showNotification('A pontuação deve estar entre -50 e +100 (não pode ser zero)!', 'error');
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
        
        // Mensagem diferente para penalidades
        if (pontuacao < 0) {
            showNotification(`Penalidade de ${Math.abs(pontuacao)} pontos registrada para ${nome}!`, 'warning');
        } else {
            showNotification(`Contribuição de +${pontuacao} pontos registrada para ${nome}!`, 'success');
        }
        
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

// Atualizar tabela de contribuições (apenas pendentes)
function atualizarTabelaContribuicoes() {
    if (tabelaContribuicoes) {
        // Filtrar apenas contribuições pendentes
        const pendingContributions = contribuicoes.filter(contrib => contrib.status === 'Pendente');
        
        tabelaContribuicoes.clear();
        tabelaContribuicoes.rows.add(pendingContributions);
        tabelaContribuicoes.draw();
        
        // Atualizar tabela processadas se estiver visível
        if (tabelaContribuicoesProcessadas && document.getElementById('processedTable').style.display !== 'none') {
            updateProcessedTable();
        }
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
    
    // Ordenar por pontos (TODOS os funcionários, incluindo com 0 pontos)
    const rankingData = Object.values(estatisticas)
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
            
            // Mensagem diferente para penalidades aprovadas
            if (contribuicao.pontuacao < 0) {
                showNotification(`Penalidade de ${contribuicao.nome} aprovada! (${contribuicao.pontuacao} pontos)`, 'warning');
            } else {
                showNotification(`Contribuição de ${contribuicao.nome} aprovada! (+${contribuicao.pontuacao} pontos)`, 'success');
            }
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
        
        // Primeiro, buscar a contribuição para verificar se estava validada
        const snapshot = await contribuicoesRef.child(id).once('value');
        if (snapshot.exists()) {
            const contribuicao = snapshot.val();
            console.log('Excluindo contribuição:', contribuicao);
            
            // Se a contribuição estava validada, remover os pontos do funcionário
            if (contribuicao.status === 'Validado' && pontosRef) {
                const pontosSnapshot = await pontosRef.child(contribuicao.nome).once('value');
                const pontosAtuais = pontosSnapshot.exists() ? pontosSnapshot.val() : 0;
                const novosPontos = Math.max(0, pontosAtuais - contribuicao.pontuacao); // Não deixar negativo
                
                if (novosPontos === 0) {
                    // Se chegou a zero, remover a entrada
                    await pontosRef.child(contribuicao.nome).remove();
                } else {
                    // Atualizar com o novo valor
                    await pontosRef.child(contribuicao.nome).set(novosPontos);
                }
                
                console.log(`Pontos de ${contribuicao.nome}: ${pontosAtuais} -> ${novosPontos}`);
            }
            
            // Remover a contribuição
            await contribuicoesRef.child(id).remove();
            
            let mensagem = 'Contribuição excluída!';
            if (contribuicao.status === 'Validado') {
                mensagem += ` Pontos de ${contribuicao.nome} foram ajustados (-${contribuicao.pontuacao}).`;
            }
            
            showNotification(mensagem, 'success');
        } else {
            showNotification('Contribuição não encontrada!', 'error');
        }
    } catch (error) {
        console.error('Erro ao excluir contribuição:', error);
        showNotification('Erro ao excluir contribuição. Tente novamente.', 'error');
    }
}

// Limpar todas as pontuações e contribuições
async function limparPontuacoes() {
    const senha = prompt('Digite a senha de administrador para limpar TODOS os dados:');
    if (!senha || senha !== '102030') {
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

// Easter Egg do Tubarão 🦈
function triggerSharkEasterEgg() {
    // Prevenir múltiplas execuções
    if (document.getElementById('shark-overlay')) {
        return;
    }
    
    // Criar overlay do tubarão
    const sharkOverlay = document.createElement('div');
    sharkOverlay.id = 'shark-overlay';
    sharkOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 20, 40, 0.9);
        z-index: 999999;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        animation: sharkFadeIn 0.3s ease;
    `;
    
    // Adicionar CSS da animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes sharkFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes sharkBounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0) scale(1); }
            40% { transform: translateY(-30px) scale(1.1); }
            60% { transform: translateY(-15px) scale(1.05); }
        }
        @keyframes sharkSway {
            0%, 100% { transform: rotate(-5deg); }
            50% { transform: rotate(5deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Criar tubarão gigante
    const shark = document.createElement('div');
    shark.style.cssText = `
        font-size: 15rem;
        animation: sharkBounce 1s ease infinite, sharkSway 2s ease-in-out infinite;
        text-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
        user-select: none;
    `;
    shark.textContent = '🦈';
    
    // Texto dramático
    const text = document.createElement('div');
    text.style.cssText = `
        color: #ff4444;
        font-size: 3rem;
        font-weight: bold;
        text-align: center;
        margin-top: 2rem;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        animation: sharkBounce 1s ease infinite;
        user-select: none;
    `;
    text.textContent = 'TUBARÃO DETECTADO! 🚨';
    
    // Texto adicional
    const subText = document.createElement('div');
    subText.style.cssText = `
        color: #ffffff;
        font-size: 1.5rem;
        text-align: center;
        margin-top: 1rem;
        opacity: 0.9;
        user-select: none;
    `;
    subText.textContent = 'EVACUEM A ÁREA IMEDIATAMENTE!';
    
    sharkOverlay.appendChild(shark);
    sharkOverlay.appendChild(text);
    sharkOverlay.appendChild(subText);
    document.body.appendChild(sharkOverlay);
    
    // Tocar "grito" usando Web Audio API
    playScreamSound();
    
    // Remover após 2 segundos
    setTimeout(() => {
        sharkOverlay.style.animation = 'sharkFadeIn 0.3s ease reverse';
        setTimeout(() => {
            if (document.body.contains(sharkOverlay)) {
                document.body.removeChild(sharkOverlay);
            }
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        }, 300);
    }, 2000);
}

// Gerar som de "grito" usando Web Audio API
function playScreamSound() {
    try {
        // Tentar reproduzir som primeiro com interação do usuário
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Verificar se precisa de interação do usuário
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                playActualSound(audioContext);
            });
        } else {
            playActualSound(audioContext);
        }
        
    } catch (error) {
        console.log('Não foi possível tocar o som do tubarão:', error);
        // Fallback: mostrar notificação dramática
        showNotification('🦈 TUBARÃO! AAAHHHHH! 🦈', 'error');
        
        // Tentar vibração no dispositivo móvel
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
    }
}

function playActualSound(audioContext) {
    // Criar som dramático usando osciladores
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const oscillator3 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Configurar frequências para som mais dramático (como um grito)
    oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator1.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
    oscillator1.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.8);
    oscillator1.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 1.5);
    oscillator1.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 2);
    
    oscillator2.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.4);
    oscillator2.frequency.exponentialRampToValueAtTime(900, audioContext.currentTime + 1);
    oscillator2.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 2);
    
    oscillator3.frequency.setValueAtTime(1000, audioContext.currentTime);
    oscillator3.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.2);
    oscillator3.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.6);
    oscillator3.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 1.2);
    oscillator3.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 2);
    
    // Configurar tipo de onda para som mais dramático
    oscillator1.type = 'sawtooth';
    oscillator2.type = 'square';
    oscillator3.type = 'triangle';
    
    // Configurar volume com mais dramaticidade
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.4, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.2, audioContext.currentTime + 0.5);
    gainNode.gain.exponentialRampToValueAtTime(0.3, audioContext.currentTime + 1);
    gainNode.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 1.5);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
    
    // Conectar tudo
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    oscillator3.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Tocar por 2 segundos
    oscillator1.start();
    oscillator2.start();
    oscillator3.start();
    oscillator1.stop(audioContext.currentTime + 2);
    oscillator2.stop(audioContext.currentTime + 2);
    oscillator3.stop(audioContext.currentTime + 2);
}

// Nova variável global para a tabela de contribuições processadas
let tabelaContribuicoesProcessadas;

// Função para alternar visibilidade da seção de contribuições processadas
function toggleProcessedContributions() {
    const processedTable = document.getElementById('processedTable');
    const toggleIcon = document.getElementById('processedToggleIcon');
    
    if (processedTable.style.display === 'none') {
        processedTable.style.display = 'block';
        toggleIcon.style.transform = 'rotate(180deg)';
        
        // Inicializar a tabela se ainda não foi inicializada
        if (!tabelaContribuicoesProcessadas) {
            initializeProcessedTable();
        }
        
        // Atualizar dados da tabela
        updateProcessedTable();
    } else {
        processedTable.style.display = 'none';
        toggleIcon.style.transform = 'rotate(0deg)';
    }
}

// Inicializar tabela de contribuições processadas
function initializeProcessedTable() {
    const commonConfig = {
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json'
        },
        responsive: true,
        pageLength: 10,
        dom: '<"top"lf>rt<"bottom"ip>',
        order: []
    };
    
    tabelaContribuicoesProcessadas = $('#tabelaContribuicoesProcessadas').DataTable({
        ...commonConfig,
        columns: [
            { data: 'nome', title: 'Prestador', width: '15%' },
            { data: 'pontuacao', title: 'Pts', render: renderPontuacao, width: '8%', className: 'text-center' },
            { data: 'categoria', title: 'Categoria', render: renderCategoria, width: '15%' },
            { data: 'descricao', title: 'Descrição', width: '32%' },
            { data: 'status', title: 'Status', render: renderStatus, width: '12%', className: 'text-center' },
            { data: 'timestamp', title: 'Data', render: renderData, width: '10%', className: 'text-center' },
            { data: null, title: 'Ações', render: renderAcoesProcessadas, orderable: false, width: '8%', className: 'text-center' }
        ],
        order: [[5, 'desc']], // Ordenar por data, mais recente primeiro
        scrollX: true,
        autoWidth: false,
        createdRow: function(row, data, dataIndex) {
            // Adicionar classe para penalidades
            if (data.pontuacao < 0) {
                $(row).addClass('penalty-row');
            }
            // Adicionar classe baseada no status
            if (data.status === 'Validado') {
                $(row).addClass('status-approved');
            } else if (data.status === 'Rejeitado') {
                $(row).addClass('status-rejected');
            }
        }
    });
}

// Atualizar tabela de contribuições processadas
function updateProcessedTable() {
    if (!tabelaContribuicoesProcessadas) return;
    
    // Filtrar apenas contribuições processadas (aprovadas ou rejeitadas)
    const processedContributions = contribuicoes.filter(contrib => 
        contrib.status === 'Validado' || contrib.status === 'Rejeitado'
    );
    
    // Limpar e recarregar dados
    tabelaContribuicoesProcessadas.clear();
    tabelaContribuicoesProcessadas.rows.add(processedContributions);
    tabelaContribuicoesProcessadas.draw();
}

// Função para notificar sobre nova organização das tabelas
function showTableOrganizationTip() {
    const hasSeenTip = localStorage.getItem('seenTableTip');
    if (!hasSeenTip) {
        setTimeout(() => {
            showNotification('💡 Nova organização: Contribuições pendentes ficam na primeira tabela. As processadas (aprovadas/rejeitadas) ficam na seção "Contribuições Processadas" abaixo.', 'info');
            localStorage.setItem('seenTableTip', 'true');
        }, 3000);
    }
}

// Tornar funções globais para uso nos botões HTML
window.validarContribuicao = validarContribuicao;
window.rejeitarContribuicao = rejeitarContribuicao;
window.excluirContribuicao = excluirContribuicao;
window.removeEmployee = removeEmployee;
window.removeEmployeeByIndex = removeEmployeeByIndex;
window.toggleProcessedContributions = toggleProcessedContributions; 