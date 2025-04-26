document.addEventListener('DOMContentLoaded', function () {
    // Ajusta para garantir que o site comece no topo ao recarregar
    if (window.location.hash !== '#inicio') {
        window.location.hash = '#inicio';
    }

    const backToTopButton = document.getElementById('backToTop');
    const whatsappButton = document.getElementById('whatsappButton');
    
    // Verifica se é um dispositivo móvel
    const isMobile = window.innerWidth <= 768;

    // Função para exibir ou esconder os botões ao rolar a página
    function toggleButtons() {
        // Em dispositivos móveis, sempre mostrar os botões
        if (isMobile) {
            backToTopButton.style.display = 'flex';
            whatsappButton.style.display = 'flex';
            backToTopButton.style.opacity = '1';
            whatsappButton.style.opacity = '1';
            return;
        }
        
        // Comportamento normal para desktop
        const scrollPosition = window.scrollY;
        if (scrollPosition > 100) {
            backToTopButton.style.display = 'flex';
            whatsappButton.style.display = 'flex';
            setTimeout(() => {
                backToTopButton.style.opacity = '1';
                whatsappButton.style.opacity = '1';
            }, 10);
        } else {
            backToTopButton.style.opacity = '0';
            whatsappButton.style.opacity = '0';
            setTimeout(() => {
                backToTopButton.style.display = 'none';
                whatsappButton.style.display = 'none';
            }, 500);
        }
    }

    // Inicializa o estado dos botões
    toggleButtons();

    // Adiciona o evento de scroll para exibir ou esconder os botões
    document.addEventListener('scroll', toggleButtons);
    
    // Atualiza em caso de redimensionamento da janela
    window.addEventListener('resize', function() {
        const wasMobile = isMobile;
        const newIsMobile = window.innerWidth <= 768;
        
        // Se houve uma mudança no estado (mobile/desktop)
        if (wasMobile !== newIsMobile) {
            location.reload(); // Recarrega a página para aplicar os estilos corretos
        }
    });

    // Ação ao clicar no botão "Voltar ao Topo"
    backToTopButton.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Ação ao clicar no botão do WhatsApp
    whatsappButton.addEventListener('click', function () {
        window.location.href = 'https://wa.me/553791979016';
    });
});
