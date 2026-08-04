// Coordenadas e escala definidas pela Secretaria da Fazenda (EPSG:4326)
var initialCoordinates = [-22.9711941, -46.9937834];

// Escala 1:1700 convertida para nível de zoom do Leaflet (padrão OGC: pixel = 0.28mm)
// zoomSnap: 0 permite zoom fracionado para reproduzir a escala com precisão
var initialZoomLevel = 18.21;

var map = L.map('map', {
    zoomSnap: 0,
    zoomDelta: 0.25
}).setView(initialCoordinates, initialZoomLevel);

// camada de tiles do OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; Contribuidores do <a href="https://osm.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// mostra a escala gráfica no canto do mapa (útil para conferir a escala 1:1700)
L.control.scale({ metric: true, imperial: false, maxWidth: 150 }).addTo(map);

// marcador (pino) da unidade selecionada
var marcadorSelecionado = null;

// ===================================================================
// Dados das unidades de saúde, combinando:
//  - TABELA_DE_REFERÊNCIA_01 (nome, endereço, telefone, horário, categoria)
//  - PLANILHA_SAÚDE.xlsx (coordenadas geográficas, EPSG:4326)
// A junção foi feita pela coluna UNIDADE, presente nas duas planilhas.
// As coordenadas não são exibidas na interface (uso interno do mapa).
// ===================================================================
var unidadesDeSaude = [
    {
        "categoria": "caps",
        "nome": "CAPS 2",
        "unidade": "CAPS II ESPERANÇA",
        "endereco": "Rua Casimiro de Abreu, 196",
        "telefone": "(19) 3829-2524 (19) 3849-1335",
        "horario": "Segunda a sexta-feira, das 08h às 17h",
        "lat": -22.979123,
        "lon": -46.995597
    },
    {
        "categoria": "caps",
        "nome": "CAPS Infantil",
        "unidade": "CAPS INFANTIL",
        "endereco": "Rua Casimiro de Abreu, 138",
        "telefone": "(19) 3829-3457 (19) 3849-4623",
        "horario": "Segunda a sexta-feira, das 08h às 17h",
        "lat": -22.978757,
        "lon": -46.996026
    },
    {
        "categoria": "caps",
        "nome": "Centro Municipal de Atendimento Psicopedagógico e Fonoaudiológico (CEMAP) \u201dJosé Natal Capovilla\u201d",
        "unidade": "CENTRO AMB. SAÚDE MENTAL (ADLSA)",
        "endereco": "Rua João Moleta, nº 140",
        "telefone": "(19) 3869-1113",
        "horario": "Segunda a sexta-feira, das 07h às 16h",
        "lat": -22.960825,
        "lon": -46.99305
    },
    {
        "categoria": "cev",
        "nome": "Centro de Especialidades de Valinhos (CEV) 1 – Dr. Admar Concon",
        "unidade": "CEV 1",
        "endereco": "Avenida dos Esportes, 335",
        "telefone": "(19) 3829-5120",
        "horario": "Segunda a sexta-feira, das 07h às 17h",
        "lat": -22.973869,
        "lon": -46.997579
    },
    {
        "categoria": "cev",
        "nome": "Centro de Especialidades de Valinhos (CEV) 2 - Decio Zenone",
        "unidade": "CEV 2",
        "endereco": "Rua João Bissoto Filho, 21",
        "telefone": "(19) 3869-8367",
        "horario": "Segunda a sexta-feira, das 07h às 16h",
        "lat": -22.975623,
        "lon": -46.988091
    },
    {
        "categoria": "cev",
        "nome": "Centro de Especialidades de Valinhos (CEV) 3",
        "unidade": "CEV 3",
        "endereco": "Rua Luiz Moscatini, 34",
        "telefone": "(19) 3871-3509",
        "horario": "Segunda a sexta-feira, das 07h às 16h",
        "lat": -22.945818,
        "lon": -46.982034
    },
    {
        "categoria": "cras",
        "nome": "CRAS CENTRAL",
        "unidade": "CRAS CENTRAL",
        "endereco": "Rua Silvio Concon, 78",
        "telefone": "(19) 3859-2100",
        "horario": "das 8h30 às 16 horas",
        "lat": -22.96972,
        "lon": -46.997348
    },
    {
        "categoria": "caps",
        "nome": "Centro de Referência em Atendimento Psicossocial (CREAPS)",
        "unidade": "CENTRO MUN. DE ATENDIMENTO PSICOPEDAGÓGICO",
        "endereco": "",
        "telefone": "(19) 3829-2073",
        "horario": "Segunda a sexta-feira, das 08h às 16h30",
        "lat": -22.981978,
        "lon": -46.983017
    },
    {
        "categoria": "farmacia",
        "nome": "SECRETARIA DA SAÚDE",
        "unidade": "FARMÁCIA CENTRAL",
        "endereco": "Rua Itália, 477",
        "telefone": "(19) 3849-7070",
        "horario": "Segunda a sexta-feira, das 07h30 às 16h",
        "lat": -22.973008,
        "lon": -46.999693
    },
    {
        "categoria": "farmacia",
        "nome": "FARMÁCIA DO POVO",
        "unidade": "FARMÁCIA DO POVO",
        "endereco": "Avenida dos Esportes nº 50 - Centro",
        "telefone": "—",
        "horario": "SUS e Alto Custo<br>Horário de atendimento: segunda a sexta-feira, das 7h30 às 16h<br>Expediente administrativo: segunda a sexta-feira, das 7h às 17h<br><br>Mandado Judicial<br>Horário de atendimento: segunda a sexta-feira, das 8h às 11h e das 13h às 16h<br>Terça e sexta: livre demanda<br>Segunda, quarta e quinta: pacientes agendados",
        "lat": -22.971412,
        "lon": -46.994869
    },
    {
        "categoria": "ubs-upa",
        "nome": "UBS PINHEIROS \u2013 Dr. Luiz Tozzo Filho",
        "unidade": "UBS PINHEIROS",
        "endereco": "Rua Horácio Salles Cunha, 258",
        "telefone": "(19) 3871-2218",
        "horario": "Segunda a sexta-feira, das 07h às 16h",
        "lat": -22.962735,
        "lon": -46.982124
    },
    {
        "categoria": "ubs-upa",
        "nome": "UBS VILA SANTANA \u2013 Dr. Silvio Jos\u00e9 Olivo",
        "unidade": "UBS VILA SANTANA",
        "endereco": "Avenida Brasil, 144",
        "telefone": "(19) 3829-5678(19) 3829-5686",
        "horario": "Segunda a sexta-feira, das 07h às 16h",
        "lat": -22.965973,
        "lon": -46.993615
    },
    {
        "categoria": "ubs-upa",
        "nome": "UBS BOM RETIRO \u2013 Durvalina Pinheiro Favarin",
        "unidade": "UBS BOM RETIRO",
        "endereco": "Rua Joaquim Simões Salgueiro, 16",
        "telefone": "(19) 3871-5364       (19) 3849-1526",
        "horario": "Segunda a sexta-feira, das 07h às 16h",
        "lat": -22.980272,
        "lon": -46.986455
    },
    {
        "categoria": "ubs-upa",
        "nome": "UBS PARQUE PORTUGAL \u2013 Eng. Arthur Bryan Walker",
        "unidade": "UBS PARQUE PORTUGAL",
        "endereco": "Rua Abrantes, 550",
        "telefone": "(19)3849-5708",
        "horario": "Segunda a sexta-feira, das 07h às 16h",
        "lat": -22.918087,
        "lon": -46.971213
    },
    {
        "categoria": "ubs-upa",
        "nome": "UBS PARA\u00cdSO \u2013 Helena Maria Joana Brandi",
        "unidade": "UBS PARAÍSO",
        "endereco": "Ruas das Acácias, s/n º",
        "telefone": "(19) 3929-6040(19) 3869-3977",
        "horario": "Segunda a sexta-feira, das 07h às 16h",
        "lat": -22.949672,
        "lon": -46.9794
    },
    {
        "categoria": "ubs-upa",
        "nome": "UBS VILA IT\u00c1LIA - Ilidio de Albuquerque Cabral",
        "unidade": "UBS VILA ITÁLIA",
        "endereco": "Rua Alexandre Pedroni, 137",
        "telefone": "(19)3869-8976",
        "horario": "Segunda a sexta-feira, das 07h às 16h",
        "lat": -22.974627,
        "lon": -47.00361
    },
    {
        "categoria": "ubs-upa",
        "nome": "UBS JUREMA \u2013 Jos\u00e9 Gasparim",
        "unidade": "UBS JUREMA",
        "endereco": "Rua José Salles Pupo, 71",
        "telefone": "(19) 3929-6928",
        "horario": "Segunda a sexta-feira, das 07h às 16h",
        "lat": -22.955658,
        "lon": -47.00785
    },
    {
        "categoria": "ubs-upa",
        "nome": "UBS MACUCO - Fumio Iamazaki",
        "unidade": "UBS MACUCO",
        "endereco": "Rua Valdemar Lazaretti, 269",
        "telefone": "(19) 3881-2828  (19) 3881-2336",
        "horario": "Segunda a sexta-feira, das 07h às 16h",
        "lat": -22.998943,
        "lon": -47.047852
    },
    {
        "categoria": "ubs-upa",
        "nome": "UBS MARACAN\u00c3 - Jo\u00e3o Zanucchi",
        "unidade": "UBS MARACANÃ",
        "endereco": "Rua Pedro de Lucca, 285",
        "telefone": "(19) 3871-0679",
        "horario": "Segunda a sexta-feira, das 07h às 16h",
        "lat": -22.996893,
        "lon": -46.994555
    },
    {
        "categoria": "ubs-upa",
        "nome": "UBS S\u00c3O BENTO \u2013 Prof. M\u00e1rio Pires",
        "unidade": "UBS SÃO BENTO",
        "endereco": "Rua Itajaí, 70",
        "telefone": "(19) 3849-7476(19) 3869-9443",
        "horario": "Segunda a sexta-feira, das 07h às 16h",
        "lat": -22.962156,
        "lon": -46.918929
    },
    {
        "categoria": "ubs-upa",
        "nome": "UBS REFORMA AGRÁRIA\u00c1RIA",
        "unidade": "UBS REFORMA AGRÁRIA",
        "endereco": "Núcleo Reforma Agrária, s/nº",
        "telefone": "(19) 3881-2611",
        "horario": "Segunda a sexta-feira, das 07h às 16h",
        "lat": -23.009742,
        "lon": -47.07148
    },
    {
        "categoria": "ubs-upa",
        "nome": "UBS FRUTAL \u2013 Ronildo Bento",
        "unidade": "UBS FRUTAL",
        "endereco": "Rua Julia Lovisaro Vicentini, 2.100",
        "telefone": "(19) 3859-1721(19) 3849-0802",
        "horario": "Segunda a sexta-feira, das 07h às 16h",
        "lat": -22.938867,
        "lon": -46.971687
    },
    {
        "categoria": "ubs-upa",
        "nome": "UBS PINHEIROS \u2013 Rosina Tom\u00e9 Calzavara",
        "unidade": "UBS IMPERIAL",
        "endereco": "Rua Campinas, 633",
        "telefone": "(19) 3871-3131(19) 3829-1757(19) 3869-7957",
        "horario": "Segunda a sexta-feira, das 07h às 16h",
        "lat": -22.982635,
        "lon": -46.996448
    },
    {
        "categoria": "ubs-upa",
        "nome": "UBS S\u00c3O MARCOS \u2013 Vereador Jos\u00e9 Eduardo Franco de Moraes \"Zel\u00e3o\"",
        "unidade": "UBS SÃO MARCOS",
        "endereco": "Rua Cinco, s/nº",
        "telefone": "(19) 3871-4517",
        "horario": "Segunda a sexta-feira, das 07h às 16h",
        "lat": -22.942343,
        "lon": -46.994834
    },
    {
        "categoria": "ubs-upa",
        "nome": "Unidade de Saúde Jardim São Marcos",
        "unidade": "ESTRATÉGIA SAÚDE DA FAMÍLIA",
        "endereco": "Rua três, s/nº",
        "telefone": "—",
        "horario": "Segunda a sexta-feira, das 08h às 17h",
        "lat": -22.942967,
        "lon": -46.9943
    },
    {
        "categoria": "ubs-upa",
        "nome": "UPA 24H \u2013 Prefeito Jos\u00e9 Spadaccia \"Bepe\"",
        "unidade": "UPA 24H",
        "endereco": "Av. Gessy Lever, 550",
        "telefone": "(19) 3849-3753",
        "horario": "24 horas, todos os dias",
        "lat": -22.963264,
        "lon": -46.993746
    },
    {
        "categoria": "ubs-upa",
        "nome": "MATERNO INFANTIL \u2013 UPAMI 24h",
        "unidade": "UPA MATERNO INFANTIL",
        "endereco": "Av. Brasil, 53",
        "telefone": "(19) 3869-1422",
        "horario": "Segunda a sexta-feira, das 07h às 16h",
        "lat": -22.96689,
        "lon": -46.993521
    }
];

var painelVazio = document.getElementById('painel-vazio');
var listaUnidades = document.getElementById('lista-unidades');
var botoesFiltro = document.querySelectorAll('.filtro-btn');
var filtroAtivo = null;
var unidadeSelecionadaIndex = null;

var nomesCategorias = {
    'ubs-upa': 'UBS / UPA',
    'cev': 'CEV',
    'farmacia': 'Farmácia',
    'caps': 'CAPS',
    'cras': 'CRAS'
};

function renderizarLista(tipo) {
    listaUnidades.innerHTML = '';
    unidadeSelecionadaIndex = null;

    var unidadesFiltradas = [];
    unidadesDeSaude.forEach(function (u, indice) {
        if (u.categoria === tipo) {
            unidadesFiltradas.push({ unidade: u, indice: indice });
        }
    });

    if (unidadesFiltradas.length === 0) {
        painelVazio.style.display = 'block';
        painelVazio.textContent = 'Nenhuma unidade cadastrada para ' + nomesCategorias[tipo] + '.';
        return;
    }

    painelVazio.style.display = 'none';

    unidadesFiltradas.forEach(function (item) {
        var botaoUnidade = document.createElement('button');
        botaoUnidade.type = 'button';
        botaoUnidade.className = 'unidade-item';
        botaoUnidade.dataset.indice = item.indice;

        var textoSemGeo = (item.unidade.lat === null) ? '<span class="sem-geo">Sem localização no mapa</span>' : '';
        botaoUnidade.innerHTML = item.unidade.nome + textoSemGeo;

        botaoUnidade.addEventListener('click', function () {
            selecionarUnidade(item.indice, botaoUnidade);
        });

        listaUnidades.appendChild(botaoUnidade);
    });
}

function selecionarUnidade(indice, botaoClicado) {
    unidadeSelecionadaIndex = indice;
    var unidade = unidadesDeSaude[indice];

    // remove um eventual card de detalhes já aberto (de outro item)
    var detalheAnterior = listaUnidades.querySelector('.detalhe-card');
    if (detalheAnterior) {
        detalheAnterior.remove();
    }

    // destaca o item selecionado na lista
    document.querySelectorAll('.unidade-item').forEach(function (item) {
        item.classList.toggle('selecionada', Number(item.dataset.indice) === indice);
    });

    // centraliza o mapa e fixa um pino na unidade (quando há coordenadas)
    if (marcadorSelecionado) {
        map.removeLayer(marcadorSelecionado);
        marcadorSelecionado = null;
    }

    var avisoSemGeo = '';
    if (unidade.lat !== null && unidade.lon !== null) {
        map.setView([unidade.lat, unidade.lon], 18);
        marcadorSelecionado = L.marker([unidade.lat, unidade.lon]).addTo(map);

        var popupHTML =
            '<div class="popup-titulo">' + unidade.nome + '</div>' +
            '<div class="popup-linha"><strong>Endereço:</strong> ' + (unidade.endereco || '—') + '</div>' +
            '<div class="popup-linha"><strong>Telefone:</strong> ' + unidade.telefone + '</div>' +
            '<div class="popup-linha"><strong>Horário:</strong> ' + unidade.horario + '</div>';

        marcadorSelecionado.bindPopup(popupHTML).openPopup();
    } else {
        avisoSemGeo = '<div class="detalhe-aviso">Esta unidade ainda não possui coordenadas cadastradas para exibição no mapa.</div>';
    }

    // monta o card de detalhes (dados combinados das duas planilhas, sem exibir coordenadas)
    // e insere logo após o item clicado na lista
    var cardDetalhe = document.createElement('div');
    cardDetalhe.className = 'detalhe-card';
    cardDetalhe.innerHTML =
        '<div class="detalhe-titulo">' + unidade.nome + '</div>' +
        '<div class="detalhe-linha"><strong>Unidade:</strong> ' + unidade.unidade + '</div>' +
        '<div class="detalhe-linha"><strong>Endereço:</strong> ' + (unidade.endereco || '—') + '</div>' +
        '<div class="detalhe-linha"><strong>Telefone:</strong> ' + unidade.telefone + '</div>' +
        '<div class="detalhe-linha"><strong>Horário:</strong> ' + unidade.horario + '</div>' +
        avisoSemGeo;

    botaoClicado.insertAdjacentElement('afterend', cardDetalhe);
}

function limparPainel() {
    listaUnidades.innerHTML = '';
    painelVazio.style.display = 'block';
    painelVazio.textContent = 'Selecione uma categoria acima para ver as unidades disponíveis.';

    if (marcadorSelecionado) {
        map.removeLayer(marcadorSelecionado);
        marcadorSelecionado = null;
    }
}

botoesFiltro.forEach(function (botao) {
    botao.addEventListener('click', function () {
        var tipoSelecionado = botao.getAttribute('data-tipo');

        botoesFiltro.forEach(function (b) {
            b.classList.remove('active');
        });

        if (filtroAtivo === tipoSelecionado) {
            filtroAtivo = null;
            limparPainel();
            return;
        }

        filtroAtivo = tipoSelecionado;
        botao.classList.add('active');
        renderizarLista(tipoSelecionado);
    });
});

// ===================================================================
// BUSCAR MINHA UBS/UPA
// Lê o arquivo UBS_REFERENCIA.csv (mesmo diretório desta página),
// que traz LOGRADOURO, LOT./CON, NOME DO LOTEAMENTO/BAIRRO/CONDOMÍNIO,
// UBS DE REFERÊNCIA (coluna D) e CEP. A busca aceita CEP ou nome da rua,
// ignorando acentos, maiúsculas/minúsculas e a primeira palavra do
// logradouro (Rua, Avenida, Estrada etc.).
// ===================================================================

var CSV_REFERENCIA_URL = 'UBS_REFERENCIA.csv';

var referenciaEnderecos = [];
var referenciaCarregada = false;

// Corrige nomes da coluna "UBS DE REFERÊNCIA" do CSV (inclusive
// variações/erros de digitação, como "UBS São Marco") para o valor
// exato usado no campo "unidade" de unidadesDeSaude, em script.js.
var mapaUBSParaUnidade = {
    'ubs bom retiro': 'UBS BOM RETIRO',
    'ubs frutal': 'UBS FRUTAL',
    'ubs imperial': 'UBS IMPERIAL',
    'ubs jurema': 'UBS JUREMA',
    'ubs macuco': 'UBS MACUCO',
    'ubs maracana': 'UBS MARACANÃ',
    'ubs paraiso': 'UBS PARAÍSO',
    'ubs pinheiros': 'UBS PINHEIROS',
    'ubs portugal': 'UBS PARQUE PORTUGAL',
    'ubs reforma agraria': 'UBS REFORMA AGRÁRIA',
    'ubs sao bento': 'UBS SÃO BENTO',
    'ubs sao marco': 'UBS SÃO MARCOS',
    'ubs sao marcos': 'UBS SÃO MARCOS',
    'ubs vila italia': 'UBS VILA ITÁLIA',
    'ubs vila santana': 'UBS VILA SANTANA'
};

var btnBuscarUBS = document.getElementById('btn-buscar-ubs');
var painelBuscaUBS = document.getElementById('busca-ubs-painel');
var inputBuscaUBS = document.getElementById('busca-ubs-input');
var submitBuscaUBS = document.getElementById('busca-ubs-submit');
var resultadoBuscaUBS = document.getElementById('busca-ubs-resultado');

function normalizar(str) {
    if (!str) return '';
    return str
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

function apenasDigitos(str) {
    return (str || '').replace(/\D/g, '');
}

// ---- Leitor de CSV simples (suporta campos entre aspas, caso existam) ----
function parseLinhaCSV(linha) {
    var campos = [];
    var atual = '';
    var entreAspas = false;

    for (var i = 0; i < linha.length; i++) {
        var ch = linha[i];

        if (entreAspas) {
            if (ch === '"') {
                if (linha[i + 1] === '"') {
                    atual += '"';
                    i++;
                } else {
                    entreAspas = false;
                }
            } else {
                atual += ch;
            }
        } else {
            if (ch === '"') {
                entreAspas = true;
            } else if (ch === ',') {
                campos.push(atual);
                atual = '';
            } else {
                atual += ch;
            }
        }
    }
    campos.push(atual);
    return campos;
}

function parseCSV(texto) {
    texto = texto.replace(/^\uFEFF/, ''); // remove BOM, se houver
    var linhasBrutas = texto.split(/\r\n|\r|\n/);
    var linhas = [];
    for (var i = 0; i < linhasBrutas.length; i++) {
        if (linhasBrutas[i].length === 0) continue;
        linhas.push(parseLinhaCSV(linhasBrutas[i]));
    }
    return linhas;
}

function montarIndiceEnderecos(linhas) {
    var lista = [];

    // primeira linha é o cabeçalho (LOGRADOURO, LOT./CON, NOME DO
    // LOTEAMENTO/BAIRRO/CONDOMÍNIO, UBS DE REFERÊNCIA, CEP) - ignora
    for (var i = 1; i < linhas.length; i++) {
        var campos = linhas[i];
        if (!campos || campos.length < 4) continue;

        var logradouro = (campos[0] || '').replace(/\u00a0/g, ' ').trim();
        var ubs = (campos[3] || '').replace(/\u00a0/g, ' ').trim();
        var cepBruto = (campos[4] || '').trim();

        if (!logradouro || !ubs) continue;

        var cepList = [];
        if (cepBruto) {
            cepBruto.split('/').forEach(function (parte) {
                var digitos = apenasDigitos(parte);
                if (digitos) {
                    while (digitos.length < 8) digitos = '0' + digitos;
                    cepList.push(digitos);
                }
            });
        }

        var nf = normalizar(logradouro);
        var partes = logradouro.split(/\s+/);
        var ns = partes.length > 1 ? normalizar(partes.slice(1).join(' ')) : '';

        lista.push({ l: logradouro, nf: nf, ns: ns, ubs: ubs, cep: cepList });
    }

    return lista;
}

function carregarReferenciaUBS() {
    fetch(CSV_REFERENCIA_URL)
        .then(function (resposta) {
            if (!resposta.ok) {
                throw new Error('Não foi possível carregar ' + CSV_REFERENCIA_URL);
            }
            return resposta.text();
        })
        .then(function (texto) {
            var linhas = parseCSV(texto);
            referenciaEnderecos = montarIndiceEnderecos(linhas);
            referenciaCarregada = true;

            inputBuscaUBS.disabled = false;
            submitBuscaUBS.disabled = false;
            inputBuscaUBS.placeholder = 'Ex.: 13270-005 ou Rua Itália';
        })
        .catch(function (erro) {
            console.error('Erro ao carregar a base de endereços:', erro);
            resultadoBuscaUBS.className = 'busca-ubs-resultado erro';
            resultadoBuscaUBS.textContent =
                'Não foi possível carregar a base de endereços (' + CSV_REFERENCIA_URL +
                '). Verifique se o arquivo está na mesma pasta desta página.';
        });
}

carregarReferenciaUBS();

// Remove o número da casa e pontuação (ex.: "Rua Itália, 477" -> "Rua Itália")
// e devolve o texto pronto para normalização/comparação.
function prepararTermoBusca(str) {
    var limpo = str.replace(/[,.]/g, ' ').replace(/\s+/g, ' ').trim();
    var tokens = limpo.split(' ');
    if (tokens.length > 1 && /^\d+$/.test(tokens[tokens.length - 1])) {
        tokens.pop();
        limpo = tokens.join(' ');
    }
    return limpo;
}

function palavrasDe(str) {
    return str.split(' ').filter(Boolean);
}

function buscarEnderecoReferencia(entrada) {
    var digitos = apenasDigitos(entrada);
    var soTemDigitosEPontuacao = /^[\d\s\-.]+$/.test(entrada.trim());

    // 1) Se o usuário digitou 8 dígitos, tenta como CEP
    if (digitos.length === 8) {
        var porCep = referenciaEnderecos.find(function (e) {
            return e.cep.indexOf(digitos) !== -1;
        });
        if (porCep) return porCep;
    }

    // Se o texto digitado só tem números/traços/pontos (ex.: um CEP
    // incompleto ou digitado errado), não faz sentido buscar por nome
    // de rua com o que sobrar - encerra a busca aqui.
    if (soTemDigitosEPontuacao) {
        return null;
    }

    // 2) Busca por nome do logradouro
    var termoBase = prepararTermoBusca(entrada);
    var termoCompleto = normalizar(termoBase);
    var partesTermo = termoBase.split(' ');
    var termoSemPrimeira = partesTermo.length > 1 ? normalizar(partesTermo.slice(1).join(' ')) : '';

    var achado = referenciaEnderecos.find(function (e) {
        return e.ns && (e.ns === termoCompleto || (termoSemPrimeira && e.ns === termoSemPrimeira));
    });
    if (achado) return achado;

    achado = referenciaEnderecos.find(function (e) {
        return e.nf === termoCompleto;
    });
    if (achado) return achado;

    // 3) Correspondência aproximada, como último recurso: todas as
    // palavras do termo mais curto precisam existir por inteiro no
    // outro nome (evita "achar" coisas por coincidência de substring,
    // como confundir o número "2" dentro de um CEP com a rua "Rua 2").
    if (termoCompleto.length >= 4) {
        var candidatos = referenciaEnderecos.filter(function (e) {
            if (!e.ns || e.ns.length < 4) return false;

            var palavrasTermo = palavrasDe(termoCompleto);
            var palavrasEndereco = palavrasDe(e.ns);
            var menor = palavrasTermo.length <= palavrasEndereco.length ? palavrasTermo : palavrasEndereco;
            var maior = palavrasTermo.length <= palavrasEndereco.length ? palavrasEndereco : palavrasTermo;

            return menor.length > 0 && menor.every(function (p) {
                return p.length >= 3 && maior.indexOf(p) !== -1;
            });
        });

        if (candidatos.length > 0) {
            candidatos.sort(function (a, b) {
                return Math.abs(a.ns.length - termoCompleto.length) - Math.abs(b.ns.length - termoCompleto.length);
            });
            return candidatos[0];
        }
    }

    return null;
}

function selecionarUBSNoPainel(unidadeCodigo) {
    var indice = -1;
    for (var i = 0; i < unidadesDeSaude.length; i++) {
        if (unidadesDeSaude[i].categoria === 'ubs-upa' && unidadesDeSaude[i].unidade === unidadeCodigo) {
            indice = i;
            break;
        }
    }
    if (indice === -1) return null;

    filtroAtivo = 'ubs-upa';
    botoesFiltro.forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-tipo') === 'ubs-upa');
    });

    renderizarLista('ubs-upa');

    var botaoUnidade = listaUnidades.querySelector('.unidade-item[data-indice="' + indice + '"]');
    if (botaoUnidade) {
        selecionarUnidade(indice, botaoUnidade);
        botaoUnidade.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return unidadesDeSaude[indice];
}

function executarBuscaUBS() {
    var termo = inputBuscaUBS.value.trim();

    if (!referenciaCarregada) {
        resultadoBuscaUBS.className = 'busca-ubs-resultado aviso';
        resultadoBuscaUBS.textContent = 'Aguarde, a base de endereços ainda está carregando...';
        return;
    }

    if (!termo) {
        resultadoBuscaUBS.className = 'busca-ubs-resultado aviso';
        resultadoBuscaUBS.textContent = 'Digite um CEP ou o nome de uma rua.';
        return;
    }

    var endereco = buscarEnderecoReferencia(termo);

    if (!endereco) {
        resultadoBuscaUBS.className = 'busca-ubs-resultado erro';
        resultadoBuscaUBS.textContent =
            'Não localizamos uma UBS de referência para "' + termo + '". ' +
            'Tente digitar apenas o nome da rua (sem "Rua", "Avenida" etc.) ou o CEP completo.';
        return;
    }

    var codigoUnidade = mapaUBSParaUnidade[normalizar(endereco.ubs)];
    var unidade = codigoUnidade ? selecionarUBSNoPainel(codigoUnidade) : null;

    if (!unidade) {
        resultadoBuscaUBS.className = 'busca-ubs-resultado erro';
        resultadoBuscaUBS.textContent =
            'O endereço "' + endereco.l + '" está cadastrado, mas não foi possível localizar a ' +
            'unidade "' + endereco.ubs + '" no mapa. Entre em contato com a Secretaria de Saúde.';
        return;
    }

    resultadoBuscaUBS.className = 'busca-ubs-resultado sucesso';
    resultadoBuscaUBS.textContent =
        'Endereço encontrado: ' + endereco.l + ' — UBS de referência: ' + unidade.nome + '.';
}

btnBuscarUBS.addEventListener('click', function () {
    var estaVisivel = !painelBuscaUBS.hasAttribute('hidden');
    if (estaVisivel) {
        painelBuscaUBS.setAttribute('hidden', '');
    } else {
        painelBuscaUBS.removeAttribute('hidden');
        inputBuscaUBS.focus();
    }
});

submitBuscaUBS.addEventListener('click', executarBuscaUBS);

inputBuscaUBS.addEventListener('keydown', function (evento) {
    if (evento.key === 'Enter') {
        evento.preventDefault();
        executarBuscaUBS();
    }
});
