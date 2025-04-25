// Configuração do Firebase
const firebaseConfig = {
    projectId: "merito-b807d",
    // Ainda precisamos das seguintes informações do seu projeto Firebase:
    apiKey: "", // Você precisa gerar uma chave de API Web
    authDomain: "merito-b807d.firebaseapp.com",
    databaseURL: "https://merito-b807d-default-rtdb.firebaseio.com",
    storageBucket: "merito-b807d.appspot.com",
    messagingSenderId: "247842978800",
    appId: "" // Você precisa pegar este no console do Firebase
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Referência para o banco de dados
const database = firebase.database();

// Função para adicionar pontos
function adicionarPontos(usuario, pontos) {
    const pontosRef = database.ref('pontos/' + usuario);
    pontosRef.transaction((currentPoints) => {
        return (currentPoints || 0) + pontos;
    });
}

// Função para resetar pontos mensalmente
function resetarPontos() {
    const pontosRef = database.ref('pontos');
    pontosRef.set({});
}

// Função para obter pontos em tempo real
function observarPontos(callback) {
    const pontosRef = database.ref('pontos');
    pontosRef.on('value', (snapshot) => {
        callback(snapshot.val());
    });
}

// Função para obter pontos de um usuário específico
function obterPontosUsuario(usuario, callback) {
    const pontosRef = database.ref('pontos/' + usuario);
    pontosRef.once('value', (snapshot) => {
        callback(snapshot.val() || 0);
    });
} 