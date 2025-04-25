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
    alert('Erro ao conectar ao banco de dados. Por favor, recarregue a página.');
}

// Referências do banco de dados
const contribuicoesRef = database ? database.ref('contribuicoes') : null;
const pontosRef = database ? database.ref('pontos') : null;

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
    const pontuacao = document.getElementById('pontuacao').value;
    const descricao = document.getElementById('descricao').value;

    if (!nome || !pontuacao || !descricao) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    try {
        const novaContribuicao = {
            id: gerarId(),
            nome: nome,
            pontuacao: parseInt(pontuacao, 10),
            descricao: descricao,
            status: 'Pendente',
            timestamp: Date.now()
        };

        // Verificar se temos acesso ao Firebase
        if (contribuicoesRef) {
            await contribuicoesRef.child(novaContribuicao.id).set(novaContribuicao);
        } else {
            // Fallback para armazenamento local se o Firebase falhar
            contribuicoes.push(novaContribuicao);
            salvarDadosLocais();
        }
        
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
        if (!contribuicoesRef) {
            alert('Não foi possível conectar ao banco de dados.');
            return;
        }

        const snapshot = await contribuicoesRef.child(id).once('value');
        if (snapshot.exists()) {
            const contribuicao = snapshot.val();
            
            // Atualiza o status e pontos da contribuição
            await contribuicoesRef.child(id).update({
                status: 'Validado'
            });

            // Atualiza os pontos do usuário
            if (pontosRef) {
                const pontosSnapshot = await pontosRef.child(contribuicao.nome).once('value');
                const pontosAtuais = pontosSnapshot.exists() ? pontosSnapshot.val() : 0;
                await pontosRef.child(contribuicao.nome).set(pontosAtuais + contribuicao.pontuacao);
            }

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
        if (!contribuicoesRef) {
            alert('Não foi possível conectar ao banco de dados.');
            return;
        }

        await contribuicoesRef.child(id).update({
            status: 'Rejeitado'
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
        if (!contribuicoesRef) {
            alert('Não foi possível conectar ao banco de dados.');
            return;
        }

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
        if (!contribuicoesRef || !pontosRef) {
            alert('Não foi possível conectar ao banco de dados.');
            return;
        }

        await contribuicoesRef.remove();
        await pontosRef.remove();
        alert('Todas as contribuições e pontuações foram limpas!');
    } catch (error) {
        console.error('Erro ao limpar pontuações:', error);
        alert('Erro ao limpar pontuações. Tente novamente.');
    }
}

// Função para observar pontos (adicionada para corrigir o erro)
function observarPontos() {
    if (!pontosRef) {
        console.error('Referência de pontos não disponível');
        return;
    }
    
    pontosRef.on('value', (snapshot) => {
        const pontos = {};
        snapshot.forEach((childSnapshot) => {
            pontos[childSnapshot.key] = childSnapshot.val();
        });
        atualizarTabelaPontos(pontos);
    });
}

// Adicionar ao escopo global
window.observarPontos = observarPontos;

// Inicialização das tabelas DataTables
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se o elemento da tabela existe antes de inicializar
    const tabelaContribuicoesElement = document.getElementById('tabelaContribuicoes');
    if (tabelaContribuicoesElement) {
        // Tabela de contribuições
        tabelaContribuicoes = $('#tabelaContribuicoes').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/pt-BR.json'
            },
            order: [[0, 'desc']], // Ordena por data decrescente
            columns: [
                { data: 'nome' },
                { data: 'pontuacao' },
                { data: 'descricao' },
                { 
                    data: 'status',
                    render: function(data) {
                        const classes = {
                            'Pendente': 'status-pendente',
                            'Validado': 'status-aprovado',
                            'Rejeitado': 'status-rejeitado'
                        };
                        return `<span class="status ${classes[data]}">${data}</span>`;
                    }
                },
                {
                    data: null,
                    render: function(data) {
                        let html = '<div class="acao-botoes">';
                        if (data.status === 'Pendente') {
                            html += `<button onclick="validarContribuicao('${data.id}')" class="btn-merito btn-primario btn-sm">Validar</button>`;
                            html += `<button onclick="rejeitarContribuicao('${data.id}')" class="btn-merito btn-perigo btn-sm">Rejeitar</button>`;
                        }
                        html += `<button onclick="excluirContribuicao('${data.id}')" class="btn-merito btn-perigo btn-sm">Excluir</button>`;
                        html += '</div>';
                        return html;
                    }
                }
            ]
        });
    } else {
        console.error('Elemento tabelaContribuicoes não encontrado no DOM');
    }

    // Inicializar tabela de ranking
    const tabelaRankingElement = document.getElementById('tabelaRanking');
    if (tabelaRankingElement) {
        tabelaRanking = $('#tabelaRanking').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/pt-BR.json'
            },
            order: [[2, 'desc']], // Ordena por total de pontos
            columns: [
                { data: 'posicao' },
                { data: 'nome' },
                { data: 'pontos' },
                { data: 'contribuicoes' }
            ]
        });
    } else {
        console.error('Elemento tabelaRanking não encontrado no DOM');
    }

    // Atualiza as tabelas quando houver mudanças no Firebase
    if (contribuicoesRef) {
        contribuicoesRef.on('value', (snapshot) => {
            const contribuicoes = [];
            snapshot.forEach((childSnapshot) => {
                contribuicoes.push(childSnapshot.val());
            });
            
            // Limpar e recarregar a tabela
            if (tabelaContribuicoes) {
                tabelaContribuicoes.clear();
                tabelaContribuicoes.rows.add(contribuicoes).draw();
            }
        });
    } else {
        console.error('Referência contribuicoesRef não disponível');
    }

    // Iniciar observação de pontos
    observarPontos();

    // Botão para limpar todas as pontuações
    const btnLimparTudo = document.getElementById('btnLimparTudo');
    if (btnLimparTudo) {
        btnLimparTudo.addEventListener('click', limparPontuacoes);
    }

    // Formulário de contribuição
    const formContribuicao = document.getElementById('formContribuicao');
    if (formContribuicao) {
        formContribuicao.addEventListener('submit', handleSubmit);
    } else {
        console.error('Formulário de contribuição não encontrado');
    }
});

function atualizarTabelaPontos(pontos) {
    if (!tabelaRanking) {
        console.error('Tabela de ranking não inicializada');
        return;
    }
    
    // Converte o objeto de pontos em um array
    const pontosArray = Object.entries(pontos).map(([nome, pontos]) => ({
        nome,
        pontos
    }));
    
    // Ordena por pontos (decrescente)
    pontosArray.sort((a, b) => b.pontos - a.pontos);
    
    // Adiciona posição e formata para a tabela
    const dados = pontosArray.map((item, index) => ({
        posicao: index + 1,
        nome: item.nome,
        pontos: item.pontos,
        contribuicoes: 0 // Será calculado mais tarde
    }));
    
    // Contagem de contribuições
    if (contribuicoesRef) {
        contribuicoesRef.once('value', (snapshot) => {
            const contribuicoes = [];
            snapshot.forEach((childSnapshot) => {
                contribuicoes.push(childSnapshot.val());
            });
            
            // Conta contribuições por usuário
            dados.forEach(item => {
                item.contribuicoes = contribuicoes.filter(
                    c => c.nome === item.nome && c.status === 'Validado'
                ).length;
            });
            
            // Atualiza a tabela
            tabelaRanking.clear();
            tabelaRanking.rows.add(dados).draw();
        });
    } else {
        // Atualiza a tabela sem contar contribuições
        tabelaRanking.clear();
        tabelaRanking.rows.add(dados).draw();
    }
} 