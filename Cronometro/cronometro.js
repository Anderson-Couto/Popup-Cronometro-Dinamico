var cronometror = {
    instancias: [],
    intervalo_milisegundos: 100,
    interval: null,
    dados_padrao: {
        segundos: 0,
        alertar_faltando_segundos: null,
        regressivo: false,
        iniciar: true,
        ao_terminar: null,
        elemento: null,
        pausado: true,
        funcao_para_mostrar: null
    },
    criar: function (dados) {
        cronometror.dados_padrao.funcao_para_mostrar = cronometror.mostraPadrao;
        for (var i in cronometror.dados_padrao) {
            if (typeof dados[i] == 'undefined') {
                dados[i] = cronometror.dados_padrao[i];
            }
        }
        dados.segundos_atuais = dados.regressivo ? dados.segundos : 0;
        dados.segundos_iniciais = 0;
        dados.tempo_inicio = null;
        var i = cronometror.instancias.push(dados) - 1;
        cronometror.mostrar(i);
        if (dados.iniciar) {
            cronometror.iniciar(i);
        }
        return i;
    },
    iniciar: function (i) {
        cronometror.instancias[i].pausado = false;
        cronometror.zerar(i);
        cronometror.ativarIntervalo();
    },
    ativarIntervalo: function () {
        if (!cronometror.interval) {
            cronometror.interval = setInterval(cronometror.atualizar, cronometror.intervalo_milisegundos);
        }
    },
    pausar: function (i, status) {
        status = typeof status == 'undefined' ? true : status;
        with(cronometror.instancias[i]) {
            if (status) {
                if (!pausado) {
                    cronometror.setar(i, segundos_iniciais + ((new Date() - tempo_inicio) / 1000));
                }
            } else {
                if (pausado) {
                    tempo_inicio = new Date();
                    cronometror.ativarIntervalo();
                }
            }
            pausado = status;
        }
    },
    setar: function (i, segundos) {
        cronometror.instancias[i].segundos_iniciais = segundos;
    },
    zerar: function (i) {
        with(cronometror.instancias[i]) {
            tempo_inicio = new Date();
            segundos_iniciais = 0;
            segundos_atuais = regressivo ? segundos : 0;
        }
        cronometror.mostrar(i);
    },
    destruir: function (i, destruir_elemento) {
        if (typeof destruir_elemento != 'undefined' && destruir_elemento) {
            cronometror.instancias[i].elemento.parentNode.removeChild(cronometror.instancias[i].elemento);
        }
        delete cronometror.instancias[i];
    },
    mostrarPadrao: function (elemento, h, m, s, alerta) {
        elemento.innerHTML =
            '<span class="cronometro cronometro_padrao' + (alerta ? ' alerta' : '') + '">' +
            (h < 10 ? '0' : '') + h +
            ':' +
            (m < 10 ? '0' : '') + m +
            ':' +
            (s < 10 ? '0' : '') + s;
        '<span>';
    },
    mostrarAmigavel: function (elemento, h, m, s, alerta) {
        elemento.innerHTML =
            '<span class="cronometro cronometro_amigavel' + (alerta ? ' alerta' : '') + '">' +
            (h ? h + 'h' : '') +
            (m ? (h && m < 10 ? '0' : '') + m + 'm' : '') +
            (m && s < 10 ? '0' : '') + s + 's';
        '<span>';
    },
    mostrar: function (i) {
        var hs, ms, ss, alerta;
        with(cronometror.instancias[i]) {
            hs = (segundos_atuais / 3600) | 0;
            ms = ((segundos_atuais - (hs * 3600)) / 60) | 0;
            ss = segundos_atuais - (hs * 3600) - (ms * 60);
            ss = regressivo ? Math.ceil(ss) : Math.floor(ss);
            alerta =
                alertar_faltando_segundos ?
                (
                    regressivo ?
                    segundos_atuais <= alertar_faltando_segundos :
                    segundos && segundos - segundos_atuais <= alertar_faltando_segundos
                ) :
                false;
            funcao_para_mostrar(elemento, hs, ms, ss, alerta, i);
        }
    },
    atualizar: function () {
        var tempo = new Date();
        for (var i in cronometror.instancias) {
            with(cronometror.instancias[i]) {
                if (pausado) {
                    continue;
                }
                if (regressivo) {
                    segundos_atuais = segundos - ((tempo - tempo_inicio) / 1000) - segundos_iniciais;
                    if (segundos_atuais <= 0) {
                        segundos_atuais = 0;
                        cronometror.pausar(i);
                        if (typeof ao_terminar == 'function') {
                            ao_terminar(i);
                        }
                    }
                } else {
                    segundos_atuais = ((tempo - tempo_inicio) / 1000) + segundos_iniciais;
                    if (segundos && segundos_atuais >= segundos) {
                        segundos_atuais = segundos;
                        cronometror.pausar(i);
                        if (typeof ao_terminar == 'function') {
                            ao_terminar(i);
                        }
                    }
                }
                cronometror.mostrar(i);
            }
        }
    }
};

var indice = 0;

function criarCronometro() {
    var elemento = document.createElement('div');
    elemento.id = 'container_cronometro_' + indice;
    elemento.style.padding = '10px';
    elemento.style.borderBottom = 'dashed 1px ligthgray';
    elemento.innerHTML =
        '<div style="padding-bottom: 10px; border-bottom: dashed 1px #aaaaaa;">' +
        '<div>' +
        'Cronômetro ' + indice +
        '</div>' +
        '<div id="d_' + indice + '">' +
        '<div id="cronometro_' + indice + '">' +
        '</div>' +
        '<label style="cursor: pointer">' +
        '<input' +
        ' id="check_' + indice + '"' +
        ' type="checkbox"' +
        ' onchange="cronometror.pausar(' + indice + ', this.checked);"' +
        (document.getElementById('c4').checked ? '' : ' checked') +
        '/> ' +
        'pausado' +
        '</label>' +
        '<span style="padding: 0 5px;">' +
        '|' +
        '</span>' +
        '<a' +
        ' style="cursor: pointer"' +
        ' onclick="cronometror.zerar(' + indice + ');"' +
        '>' +
        'zerar' +
        '</a>' +
        '<span style="padding: 0 5px;">' +
        '|' +
        '</span>' +
        '<a' +
        ' style="cursor: pointer"' +
        ' onclick=' +
        '"' +
        "cronometror.destruir(" + indice + ");" +
        "document.getElementById('d_" + indice + "').innerHTML = 'este cronômetro não existe mais';" +
        '"' +
        '>' +
        'destruir' +
        '</a>' +
        '<span style="padding: 0 5px;">' +
        '|' +
        '</span>' +
        '<a' +
        ' style="cursor: pointer"' +
        ' onclick=' +
        '"' +
        "var b = '\\n';" +
        "var h = '';" +
        "for (var i in cronometror.instancias[" + indice + "]) " +
        "h += i + ': ' + b + String(cronometror.instancias[" + indice + "][i]) + b + b;" +
        "alert(h);" +
        '"' +
        '>' +
        'configurações' +
        '</a>' +
        '</div>' +
        '</div>';
    document.getElementById('painel_cronometros').appendChild(elemento);
    var parametros = {
        segundos: parseInt(document.getElementById('c1').value, 10),
        alertar_faltando_segundos: parseInt(document.getElementById('c2').value, 10),
        regressivo: document.getElementById('c3').checked,
        iniciar: document.getElementById('c4').checked,
        ao_terminar: new Function('i', document.getElementById('c5').value),
        elemento: document.getElementById('cronometro_' + indice),
        funcao_para_mostrar: null
    };
    if (document.getElementById('c6').checked) {
        parametros.funcao_para_mostrar = cronometror.mostrarPadrao;
    }
    if (document.getElementById('c7').checked) {
        parametros.funcao_para_mostrar = cronometror.mostrarAmigavel;
    }
    if (document.getElementById('c8').checked) {
        parametros.funcao_para_mostrar = new Function(document.getElementById('c9').value);
    }
    cronometror.criar(parametros);
    ++indice;
}