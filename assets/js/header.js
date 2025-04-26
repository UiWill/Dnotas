document.addEventListener('DOMContentLoaded', function () {
    // Elementos de controle do menu
    const menuToggle = document.getElementById('menuToggle');
    const menuAberto = document.querySelector('.menu-aberto');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const body = document.body;
    const header = document.querySelector('.header');

    // Função para fechar o menu
    function closeMenu() {
        menuToggle.checked = false;
        menuAberto.classList.remove('active');
        body.classList.remove('no-scroll');
    }

    // Abre/fecha o menu ao mudar o estado do checkbox
    menuToggle.addEventListener('change', function () {
        if (menuToggle.checked) {
            menuAberto.classList.add('active');
            body.classList.add('no-scroll');
        } else {
            closeMenu();
        }
    });

    // Fecha o menu ao clicar em um link de navegação
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            closeMenu();
        });
    });
    
    // Fecha o menu ao rolar a página (em dispositivos móveis)
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        let st = window.pageYOffset || document.documentElement.scrollTop;
        
        // Verifica se o movimento de scroll foi significativo (mais de 50px)
        if (Math.abs(lastScrollTop - st) > 50) {
            closeMenu();
            
            // Esconde o header ao rolar para baixo em dispositivos móveis
            if (window.innerWidth <= 768) {
                if (st > lastScrollTop && st > header.offsetHeight) {
                    // Rolando para baixo
                    header.style.top = '-100px';
                } else {
                    // Rolando para cima
                    header.style.top = '0';
                }
            }
        }
        
        lastScrollTop = st <= 0 ? 0 : st;
    }, false);
    
    // Adiciona evento de toque fora do menu para fechá-lo em dispositivos móveis
    document.addEventListener('touchstart', function(e) {
        if (menuToggle.checked && !menuAberto.contains(e.target) && !header.contains(e.target)) {
            closeMenu();
        }
    });
});
