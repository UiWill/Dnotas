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

// Registra uma nova contribuição
async function handleSubmit(e) {
    e.preventDefault(); // Impede o recarregamento da página
    
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
    if (!colaborador) {
        alert('Colaborador não encontrado!');
        return;
    }
    
    try {
        // Cria o objeto de contribuição
        const novaContribuicao = {
            id: Date.now(),
            data: new Date().toLocaleDateString('pt-BR'),
            colaboradorId: colaboradorId,
            colaborador: colaborador.nome,
            tipo: tipoContribuicao,
            descricao: descricaoContribuicao,
            status: 'Pendente',
            pontos: 0
        };
        
        // Salva no Firebase
        const contribuicaoRef = window.databaseRef(window.database, 'contribuicoes/' + novaContribuicao.id);
        await window.databaseSet(contribuicaoRef, novaContribuicao);
        
        // Limpa o formulário
        document.getElementById('formMerito').reset();
        
        alert('Contribuição registrada com sucesso!');
    } catch (error) {
        console.error('Erro ao registrar contribuição:', error);
        alert('Erro ao registrar contribuição. Por favor, tente novamente.');
    }
}

// Inicializa o formulário com os colaboradores
function inicializarFormulario() {
    const selectColaborador = document.getElementById('colaborador');
    if (!selectColaborador) return;
    
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
    const form = document.getElementById('formMerito');
    if (form) {
        form.removeEventListener('submit', handleSubmit); // Remove listener anterior se existir
        form.addEventListener('submit', handleSubmit);
    }
}

// Inicializa as tabelas DataTables
function inicializarTabelas() {
    // Tabela de contribuições
    window.tabelaContribuicoes = $('#tabelaContribuicoes').DataTable({
        responsive: true,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/pt-BR.json'
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
                    if (data === 'Pendente') classeCor = 'status-pendente';
                    else if (data === 'Validado') classeCor = 'status-validado';
                    else if (data === 'Rejeitado') classeCor = 'status-rejeitado';
                    return `<span class="${classeCor}">${data}</span>`;
                }
            },
            { data: 'pontos' },
            {
                data: null,
                render: function(data) {
                    let html = '<div class="acao-botoes">';
                    if (data.status === 'Pendente') {
                        html += `<button onclick="validarContribuicao(${data.id})" class="btn-acao btn-validar">Validar</button>`;
                        html += `<button onclick="rejeitarContribuicao(${data.id})" class="btn-acao">Rejeitar</button>`;
                    }
                    html += `<button onclick="excluirContribuicao(${data.id})" class="btn-acao btn-excluir">Excluir</button>`;
                    html += '</div>';
                    return html;
                }
            }
        ]
    });
}

// Atualiza a tabela de contribuições quando houver mudanças
window.atualizarTabelaContribuicoes = function(contribuicoes) {
    if (window.tabelaContribuicoes) {
        window.tabelaContribuicoes.clear();
        if (contribuicoes && contribuicoes.length > 0) {
            window.tabelaContribuicoes.rows.add(contribuicoes);
        }
        window.tabelaContribuicoes.draw();
    }
};

// Inicializa o sistema quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    inicializarFormulario();
    inicializarTabelas();
    
    // Adiciona listener para o botão Limpar Tudo
    const btnLimpar = document.getElementById('btnLimparTudo');
    if (btnLimpar) {
        btnLimpar.addEventListener('click', limparPontuacoes);
    }
});

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