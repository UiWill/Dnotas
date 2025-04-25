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

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDPbFGQy9Tl_9GxQXKrwgNXpHHVkpvDPxE",
    authDomain: "dnotas-site.firebaseapp.com",
    projectId: "dnotas-site",
    storageBucket: "dnotas-site.appspot.com",
    messagingSenderId: "1093565472044",
    appId: "1:1093565472044:web:c7c7f7c0f0d5d5d5d5d5d5",
    databaseURL: "https://dnotas-site-default-rtdb.firebaseio.com"
};

// Inicializa o Firebase
let database;
try {
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    console.log('Firebase inicializado com sucesso!');
} catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
    alert('Erro ao conectar ao banco de dados. Por favor, recarregue a página.');
}

// Referências do banco de dados
const contribuicoesRef = database.ref('contribuicoes');
const pontosRef = database.ref('pontos');

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

// Função para formatar data
function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

// Função para gerar ID único
function gerarId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Função para lidar com o envio do formulário
async function handleSubmit(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const descricao = document.getElementById('descricao').value;
    const data = document.getElementById('data').value;

    if (!nome || !descricao || !data) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    try {
        const novaContribuicao = {
            id: gerarId(),
            nome: nome,
            descricao: descricao,
            data: data,
            status: 'Pendente',
            pontos: 0,
            timestamp: Date.now()
        };

        await contribuicoesRef.child(novaContribuicao.id).set(novaContribuicao);
        
        document.getElementById('formContribuicao').reset();
        alert('Contribuição registrada com sucesso!');
    } catch (error) {
        console.error('Erro ao registrar contribuição:', error);
        alert('Erro ao registrar contribuição. Por favor, tente novamente.');
    }
}

// Função para validar contribuição
async function validarContribuicao(id) {
    const senha = prompt('Digite a senha de administrador (2020):');
    if (!senha) return;
    
    if (senha !== '2020') {
        alert('Senha incorreta!');
        return;
    }

    try {
        const snapshot = await contribuicoesRef.child(id).once('value');
        if (snapshot.exists()) {
            const contribuicao = snapshot.val();
            
            // Atualiza o status e pontos da contribuição
            await contribuicoesRef.child(id).update({
                status: 'Validado',
                pontos: 1
            });

            // Atualiza os pontos do usuário
            const pontosSnapshot = await pontosRef.child(contribuicao.nome).once('value');
            const pontosAtuais = pontosSnapshot.exists() ? pontosSnapshot.val() : 0;
            await pontosRef.child(contribuicao.nome).set(pontosAtuais + 1);

            alert('Contribuição validada com sucesso!');
        }
    } catch (error) {
        console.error('Erro ao validar contribuição:', error);
        alert('Erro ao validar contribuição. Tente novamente.');
    }
}

// Função para rejeitar contribuição
async function rejeitarContribuicao(id) {
    const senha = prompt('Digite a senha de administrador (2020):');
    if (!senha) return;
    
    if (senha !== '2020') {
        alert('Senha incorreta!');
        return;
    }

    try {
        await contribuicoesRef.child(id).update({
            status: 'Rejeitado',
            pontos: 0
        });
        alert('Contribuição rejeitada com sucesso!');
    } catch (error) {
        console.error('Erro ao rejeitar contribuição:', error);
        alert('Erro ao rejeitar contribuição. Tente novamente.');
    }
}

// Função para excluir contribuição
async function excluirContribuicao(id) {
    if (!confirm('Tem certeza que deseja excluir esta contribuição?')) {
        return;
    }

    const senha = prompt('Digite a senha de administrador (2020):');
    if (!senha) return;
    
    if (senha !== '2020') {
        alert('Senha incorreta!');
        return;
    }

    try {
        await contribuicoesRef.child(id).remove();
        alert('Contribuição excluída com sucesso!');
    } catch (error) {
        console.error('Erro ao excluir contribuição:', error);
        alert('Erro ao excluir contribuição. Tente novamente.');
    }
}

// Função para limpar todas as pontuações
async function limparPontuacoes() {
    if (!confirm('ATENÇÃO! Tem certeza que deseja limpar TODAS as contribuições e pontuações?')) {
        return;
    }

    const senha = prompt('Digite a senha de administrador (2020):');
    if (!senha) return;
    
    if (senha !== '2020') {
        alert('Senha incorreta!');
        return;
    }

    try {
        await contribuicoesRef.remove();
        await pontosRef.remove();
        alert('Todas as contribuições e pontuações foram limpas!');
    } catch (error) {
        console.error('Erro ao limpar pontuações:', error);
        alert('Erro ao limpar pontuações. Tente novamente.');
    }
}

// Inicialização das tabelas DataTables
document.addEventListener('DOMContentLoaded', function() {
    // Tabela de contribuições
    const tabelaContribuicoes = $('#tabelaContribuicoes').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/pt-BR.json'
        },
        order: [[0, 'desc']], // Ordena por data decrescente
        columns: [
            { data: 'data' },
            { data: 'nome' },
            { data: 'descricao' },
            { 
                data: 'status',
                render: function(data) {
                    const classes = {
                        'Pendente': 'status-pendente',
                        'Validado': 'status-validado',
                        'Rejeitado': 'status-rejeitado'
                    };
                    return `<span class="${classes[data]}">${data}</span>`;
                }
            },
            {
                data: null,
                render: function(data) {
                    let html = '<div class="acao-botoes">';
                    if (data.status === 'Pendente') {
                        html += `<button onclick="validarContribuicao('${data.id}')" class="btn-acao btn-validar">Validar</button>`;
                        html += `<button onclick="rejeitarContribuicao('${data.id}')" class="btn-acao">Rejeitar</button>`;
                    }
                    html += `<button onclick="excluirContribuicao('${data.id}')" class="btn-acao btn-excluir">Excluir</button>`;
                    html += '</div>';
                    return html;
                }
            }
        ]
    });

    // Atualiza a tabela quando houver mudanças no Firebase
    contribuicoesRef.on('value', (snapshot) => {
        const contribuicoes = [];
        snapshot.forEach((childSnapshot) => {
            contribuicoes.push(childSnapshot.val());
        });
        
        tabelaContribuicoes.clear();
        tabelaContribuicoes.rows.add(contribuicoes);
        tabelaContribuicoes.draw();
    });

    // Configura o formulário
    document.getElementById('formContribuicao').addEventListener('submit', handleSubmit);

    // Configura o botão de limpar pontuações
    document.getElementById('btnLimparTudo').addEventListener('click', limparPontuacoes);
});

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