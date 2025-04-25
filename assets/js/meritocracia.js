// Dados de exemplo para colaboradores
const colaboradores = [
    { id: 1, nome: "Diego" },
    { id: 2, nome: "William" },
    { id: 3, nome: "Cristiano" },
    { id: 4, nome: "Eliezer" },
    { id: 5, nome: "Rennan" },
    { id: 6, nome: "Pablo" },
    { id: 7, nome: "Guilherme" },
    { id: 8, nome: "Erick" },
    { id: 9, nome: "Fabricio" }
];

// Inicialização das tabelas e contribuições no localStorage
let contribuicoes = [];
let tabelaContribuicoes;
let tabelaRanking;

// Verifica se já existe dados no localStorage
function carregarDadosLocais() {
    const dadosContribuicoes = localStorage.getItem('contribuicoes');
    if (dadosContribuicoes) {
        contribuicoes = JSON.parse(dadosContribuicoes);
    }
}

// Salva os dados no localStorage
function salvarDadosLocais() {
    localStorage.setItem('contribuicoes', JSON.stringify(contribuicoes));
}

// Inicializa o sistema
document.addEventListener('DOMContentLoaded', function() {
    // Carrega dados do localStorage
    carregarDadosLocais();
    
    // Inicializa o formulário
    inicializarFormulario();
    
    // Adiciona listener para o botão Limpar Tudo
    document.getElementById('btnLimparTudo').addEventListener('click', limparPontuacoes);
    
    // Inicializa as tabelas DataTables
    inicializarTabelas();
    
    // Atualiza os dados nas tabelas
    atualizarTabelas();
});

// Inicializa o formulário com os colaboradores
function inicializarFormulario() {
    const selectColaborador = document.getElementById('colaborador');
    
    // Limpa opções existentes
    selectColaborador.innerHTML = '<option value="" disabled selected>Selecione o colaborador</option>';
    
    // Adiciona os colaboradores à lista
    colaboradores.forEach(colaborador => {
        const option = document.createElement('option');
        option.value = colaborador.id;
        option.textContent = colaborador.nome;
        selectColaborador.appendChild(option);
    });
    
    // Configura o evento de submit do formulário
    document.getElementById('formMerito').addEventListener('submit', function(e) {
        e.preventDefault();
        registrarContribuicao();
    });
}

// Registra uma nova contribuição
async function registrarContribuicao() {
    const colaboradorId = parseInt(document.getElementById('colaborador').value);
    const tipoContribuicao = document.getElementById('tipoContribuicao').value;
    const descricaoContribuicao = document.getElementById('descricaoContribuicao').value;
    
    // Valida os campos
    if (!colaboradorId || !tipoContribuicao || !descricaoContribuicao) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    // Obtém o nome do colaborador
    const colaborador = colaboradores.find(c => c.id === colaboradorId);
    
    // Cria o objeto de contribuição
    const novaContribuicao = {
        id: Date.now(), // Usa timestamp como ID único
        data: new Date().toLocaleDateString('pt-BR'),
        colaboradorId: colaboradorId,
        colaborador: colaborador.nome,
        tipo: tipoContribuicao,
        descricao: descricaoContribuicao,
        status: 'Pendente',
        pontos: 0
    };
    
    // Salva no Firebase
    const contribuicoesRef = ref(database, 'contribuicoes/' + novaContribuicao.id);
    await set(contribuicoesRef, novaContribuicao);
    
    // Limpa o formulário
    document.getElementById('formMerito').reset();
    
    alert('Contribuição registrada com sucesso!');
}

// Inicializa as tabelas DataTables
function inicializarTabelas() {
    // Tabela de contribuições
    tabelaContribuicoes = $('#tabelaContribuicoes').DataTable({
        responsive: true,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/pt-BR.json',
            search: "Buscar:",
            lengthMenu: "Mostrar _MENU_ entradas",
            info: "Mostrando _START_ a _END_ de _TOTAL_ entradas",
            infoEmpty: "Mostrando 0 a 0 de 0 entradas",
            infoFiltered: "(filtrado de _MAX_ entradas totais)",
            paginate: {
                first:      "Primeiro",
                last:       "Último",
                previous:   "Anterior"
            },
            zeroRecords: "Nenhum registro encontrado",
            emptyTable: "Nenhum dado disponível na tabela"
        },
        // Adiciona um callback para ser executado a cada redesenho da tabela
        drawCallback: function(settings) {
            var api = this.api();
            // Verifica se a tabela está vazia
            if (api.data().count() === 0) {
                // Tenta esconder o container de paginação inteiro se a tabela estiver vazia
                // Isso deve esconder os botões e textos "Anterior"/"Próximo"
                $(api.table().container()).find('.dataTables_paginate').hide();
                // Garante que a mensagem "Nenhum dado disponível" seja exibida corretamente
                $(api.table().container()).find('.dataTables_empty').show(); 
            } else {
                // Mostra o container de paginação se a tabela tiver dados
                $(api.table().container()).find('.dataTables_paginate').show();
            }
        },
        columns: [
            { data: 'data' },
            { data: 'colaborador' },
            { data: 'tipo' },
            { data: 'descricao' },
            { 
                data: 'status',
                render: function(data) {
                    let classeCor = '';
                    
                    if (data === 'Pendente') {
                        classeCor = 'status-pendente';
                    } else if (data === 'Validado') {
                        classeCor = 'status-validado';
                    } else if (data === 'Rejeitado') {
                        classeCor = 'status-rejeitado';
                    }
                    
                    return `<span class="${classeCor}">${data}</span>`;
                }
            },
            { data: 'pontos' },
            {
                data: null,
                orderable: false, // Impede ordenação pela coluna de ações
                render: function(data, type, row) {
                    let botoesHtml = '<div class="acao-botoes">';
                    
                    // Adiciona botões Validar/Rejeitar se pendente
                    if (row.status === 'Pendente') {
                        botoesHtml += `<button class="btn-acao btn-validar" onclick="validarContribuicao(${row.id})">Validar</button>`;
                        botoesHtml += `<button class="btn-acao" onclick="rejeitarContribuicao(${row.id})">Rejeitar</button>`; // Botão Rejeitar já tem estilo vermelho pelo CSS
                    }
                    
                    // Adiciona botão Excluir para todas as linhas
                    botoesHtml += `<button class="btn-acao btn-excluir" onclick="excluirContribuicao(${row.id})">Excluir</button>`;
                    
                    botoesHtml += '</div>';
                    
                    // Retorna vazio se não houver botões (nunca deve acontecer agora com Excluir sempre presente)
                    return botoesHtml !== '<div class="acao-botoes"></div>' ? botoesHtml : '';
                }
            }
        ]
    });
    
    // Tabela de ranking
    tabelaRanking = $('#tabelaRanking').DataTable({
        responsive: true,
        paging: false,
        searching: false,
        info: false,
        order: [[2, 'desc']], // Ordena por pontos (maior para menor)
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/pt-BR.json'
        },
        columns: [
             { data: 'posicao', orderable: false },
             { data: 'colaborador' },
             { data: 'pontos' },
             { data: 'contribuicoes' }
        ]
    });
}

// Atualiza as tabelas com os dados atuais
function atualizarTabelas() {
    // Limpa as tabelas
    tabelaContribuicoes.clear();
    tabelaRanking.clear();
    
    // Adiciona as contribuições à tabela
    tabelaContribuicoes.rows.add(contribuicoes).draw();
    
    // Cria o ranking
    const ranking = criarRanking();
    
    // Limpa e adiciona o ranking à tabela, recalculando a posição
    tabelaRanking.clear();
    ranking.sort((a, b) => b.pontos - a.pontos); // Garante a ordenação por pontos
    ranking.forEach((item, index) => {
        item.posicao = index + 1; // Atualiza a posição baseada na ordenação
    });
    tabelaRanking.rows.add(ranking).draw();
}

// Cria o ranking de pontos
function criarRanking() {
    const rankingData = [];
    
    // Agrupa as contribuições por colaborador e calcula os pontos
    const pontosAgrupados = {};
    const contribAgrupadas = {};
    
    // Inicializa todos os colaboradores com zero
    colaboradores.forEach(colaborador => {
        pontosAgrupados[colaborador.id] = 0;
        contribAgrupadas[colaborador.id] = 0;
    });
    
    // Conta apenas contribuições validadas
    contribuicoes.forEach(contribuicao => {
        if (contribuicao.status === 'Validado') {
            pontosAgrupados[contribuicao.colaboradorId] += contribuicao.pontos;
            contribAgrupadas[contribuicao.colaboradorId] += 1;
        }
    });
    
    // Cria o array de ranking
    colaboradores.forEach((colaborador, index) => {
        rankingData.push({
            posicao: index + 1, // Será reordenado pelo DataTables
            colaborador: colaborador.nome,
            pontos: pontosAgrupados[colaborador.id],
            contribuicoes: contribAgrupadas[colaborador.id]
        });
    });
    
    return rankingData;
}

// Função para verificar a senha de administrador
async function verificarSenhaAdmin(senha) {
    // Senha fixa "2020"
    return senha === "2020";
}

// Função para atualizar a interface com os dados do Firebase
function atualizarInterface(dados) {
    if (!dados) return;
    
    // Limpa as tabelas
    tabelaContribuicoes.clear();
    tabelaRanking.clear();
    
    // Adiciona as contribuições à tabela
    if (dados.contribuicoes) {
        const contribuicoesArray = Object.values(dados.contribuicoes);
        tabelaContribuicoes.rows.add(contribuicoesArray).draw();
    }
    
    // Atualiza o ranking
    if (dados.pontos) {
        const ranking = criarRanking(dados.pontos);
        tabelaRanking.rows.add(ranking).draw();
    }
}

// Valida uma contribuição
async function validarContribuicao(id) {
    const senha = prompt("Digite a senha de administrador (2020):", "");
    
    if (!senha) {
        alert('Operação cancelada.');
        return;
    }

    const senhaValida = await verificarSenhaAdmin(senha);
    
    if (!senhaValida) {
        alert('Senha incorreta! A senha é: 2020');
        return;
    }

    // Atualiza no Firebase
    const contribuicaoRef = ref(database, 'contribuicoes/' + id);
    const snapshot = await get(contribuicaoRef);
    
    if (snapshot.exists()) {
        const contribuicao = snapshot.val();
        contribuicao.status = 'Validado';
        contribuicao.pontos = 1;
        
        // Atualiza a contribuição
        await set(contribuicaoRef, contribuicao);
        
        // Atualiza os pontos do colaborador
        const pontosRef = ref(database, 'pontos/' + contribuicao.colaborador);
        const pontosSnapshot = await get(pontosRef);
        const pontosAtuais = pontosSnapshot.exists() ? pontosSnapshot.val() : 0;
        await set(pontosRef, pontosAtuais + 1);
        
        alert('Contribuição validada com sucesso!');
    }
}

// Rejeita uma contribuição
async function rejeitarContribuicao(id) {
    const senha = prompt("Digite a senha de administrador (2020):", "");
    
    if (!senha) {
        alert('Operação cancelada.');
        return;
    }

    const senhaValida = await verificarSenhaAdmin(senha);
    
    if (!senhaValida) {
        alert('Senha incorreta! A senha é: 2020');
        return;
    }

    // Atualiza no Firebase
    const contribuicaoRef = ref(database, 'contribuicoes/' + id);
    const snapshot = await get(contribuicaoRef);
    
    if (snapshot.exists()) {
        const contribuicao = snapshot.val();
        contribuicao.status = 'Rejeitado';
        contribuicao.pontos = 0;
        await set(contribuicaoRef, contribuicao);
        alert('Contribuição rejeitada!');
    }
}

// Exclui uma contribuição
function excluirContribuicao(id) {
    if (confirm('Tem certeza que deseja excluir esta contribuição? Esta ação não pode ser desfeita.')) {
        const index = contribuicoes.findIndex(c => c.id === id);
        
        if (index !== -1) {
            contribuicoes.splice(index, 1); // Remove a contribuição do array
            salvarDadosLocais();
            atualizarTabelas();
            alert('Contribuição excluída com sucesso!');
        } else {
            alert('Erro ao encontrar a contribuição para excluir.');
        }
    }
}

// Limpa todas as contribuições (Reset Mensal)
async function limparPontuacoes() {
    if (!confirm('ATENÇÃO! Tem certeza que deseja limpar TODAS as contribuições e pontuações?')) {
        return;
    }

    const senha = prompt("Digite a senha de administrador (2020):", "");
    
    if (!senha) {
        alert('Operação cancelada.');
        return;
    }

    const senhaValida = await verificarSenhaAdmin(senha);
    
    if (!senhaValida) {
        alert('Senha incorreta! A senha é: 2020');
        return;
    }

    // Limpa os dados no Firebase
    await set(ref(database, 'contribuicoes'), null);
    await set(ref(database, 'pontos'), null);
    
    alert('Todas as contribuições e pontuações foram limpas!');
}

// Função para atualizar a tabela de pontos
function atualizarTabelaPontos(pontos) {
    const tabelaContainer = document.getElementById('tabela-pontos');
    if (!tabelaContainer) return;

    let html = `
        <table class="table">
            <thead>
                <tr>
                    <th>Usuário</th>
                    <th>Pontos</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (const [usuario, pontosUsuario] of Object.entries(pontos)) {
        html += `
            <tr>
                <td>${usuario}</td>
                <td>${pontosUsuario}</td>
                <td>
                    <button onclick="adicionarPontosUsuario('${usuario}', 1)" class="btn btn-success btn-sm">+1</button>
                    <button onclick="adicionarPontosUsuario('${usuario}', -1)" class="btn btn-danger btn-sm">-1</button>
                </td>
            </tr>
        `;
    }

    html += `
            </tbody>
        </table>
        <div class="mt-3">
            <button onclick="adicionarNovoUsuario()" class="btn btn-primary">Adicionar Novo Usuário</button>
            <button onclick="resetarTodosPontos()" class="btn btn-warning">Resetar Pontos</button>
        </div>
    `;

    tabelaContainer.innerHTML = html;
}

// Função para adicionar pontos a um usuário
function adicionarPontosUsuario(usuario, quantidade) {
    window.adicionarPontos(usuario, quantidade);
}

// Função para adicionar novo usuário
function adicionarNovoUsuario() {
    const usuario = prompt("Digite o nome do novo usuário:");
    if (usuario) {
        window.adicionarPontos(usuario, 0);
    }
}

// Função para resetar todos os pontos
function resetarTodosPontos() {
    if (confirm("Tem certeza que deseja resetar todos os pontos?")) {
        window.resetarPontos();
    }
}

// Inicializar observador de pontos
document.addEventListener('DOMContentLoaded', () => {
    window.observarPontos(atualizarTabelaPontos);
}); 