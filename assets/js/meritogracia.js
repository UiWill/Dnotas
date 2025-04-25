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
                next:       "Próximo",
                previous:   "Anterior"
            },
            zeroRecords: "Nenhum registro encontrado",
            emptyTable: "Nenhum dado disponível na tabela"
        },
        drawCallback: function(settings) {
            var api = this.api();
            // Controla visibilidade da paginação baseada nos dados
            if (api.data().count() === 0) {
                $(api.table().container()).find('.dataTables_paginate').hide();
                $(api.table().container()).find('.dataTables_empty').show();
            } else {
                $(api.table().container()).find('.dataTables_paginate').show();
            }

            // Remove texto "Próximo" fantasma das células após renderização
            setTimeout(function() {
                api.cells().nodes().to$().each(function(index, cell) {
                    $(cell).contents().each(function(i, node) {
                        if (node.nodeType === 3 && $(node).text().trim() === 'Próximo') {
                            $(node).remove();
                        }
                    });
                });
            }, 50); // Pequeno atraso
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
                    if (row.status === 'Pendente') {
                        botoesHtml += `<button class="btn-acao btn-validar" onclick="validarContribuicao(${row.id})">Validar</button>`;
                        botoesHtml += `<button class="btn-acao" onclick="rejeitarContribuicao(${row.id})">Rejeitar</button>`;
                    }
                    botoesHtml += `<button class="btn-acao btn-excluir" onclick="excluirContribuicao(${row.id})">Excluir</button>`;
                    botoesHtml += '</div>';
                    return botoesHtml;
                }
            }
        ]
    });