$( document ).ready(function() {

    
    criarCronometro();
});

function parseNumber(num) {
    return parseFloat(num.replace(/[^\d]/)) || 0;
}

var movePopUp = (function() {

    var startX;
    var startY;

    var currentPopUp = null;
    var currentWidth = 0;
    var currentHeight = 0;
    //var currentLeft = 0;
    var currentRight = 0;
    var currentTop = 0;
    var callMoveOnPopUp = null;
    var callMoveStopPopUp = null;

    var contentMove = '.popup .title';
    var move = false;

    var marginStop = 30;
    var maxWidth = window.innerWidth - marginStop;
    var maxHeight = window.innerHeight - marginStop;

    jQuery(contentMove).on('mousedown', function(e) {
        currentPopUp = this.parentNode.parentNode;
        //currentLeft = parseNumber(currentPopUp.style.left);
        currentRight = parseNumber(currentPopUp.style.right);
        currentTop = parseNumber(currentPopUp.style.top);

        startX = e.clientX;
        startY = e.clientY;
        if (typeof(callMoveOnPopUp) == 'function')
            callMoveOnPopUp(currentPopUp);
        move = true;
    });

    jQuery(document).on('mouseup', function() {
        if (currentPopUp == null) return;
        if (typeof(callMoveStopPopUp) == 'function')
            callMoveStopPopUp(currentPopUp);
        currentPopUp = null;
        move = false;
    })

    jQuery(document).on('mousemove', function(e) {
        if (move == true) {
            //var newX = currentLeft + e.clientX - startX;
            var newX = currentRight - e.clientX + startX;
            var newY = currentTop + e.clientY - startY;

            if (marginStop > e.clientX) return;
            if (marginStop > e.clientY) return;
            if (maxWidth < e.clientX) return;
            if (maxHeight < e.clientY) return;

            jQuery(currentPopUp).css({
                'right': newX,
                'top': newY,
            });
        }
    });

    return function(func1, func2) {
        callMoveOnPopUp = func1;
        callMoveStopPopUp = func2;
    }
})();

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
        
        if( h == 0 & m == 0 & s == 0)
        {
            elemento.innerHTML = 
                '<span class="cronometro cronometro_padrao' + (alerta ? ' alerta' : '') + '">' +
                    'Iniciado'
                '<span>';
        }
        else
        {
            elemento.innerHTML =
                '<span class="cronometro cronometro_padrao' + (alerta ? ' alerta' : '') + '">' +
                    (h < 10 ? '0' : '') + h +
                    ':' +
                    (m < 10 ? '0' : '') + m +
                    ':' +
                    (s < 10 ? '0' : '') + s;
                '<span>';
        }
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

function criarCronometro() {
    var elemento = document.createElement('div');
    elemento.id = 'container_cronometro_0';
    elemento.style.padding = '10px';
    elemento.style.borderBottom = 'dashed 1px ligthgray';
    elemento.innerHTML =
    '<div style="padding-bottom: 10px; border-bottom: dashed 1px #aaaaaa;">'+
        '<div id="d_0">'+
            '<div id="cronometro_0"></div>'+
        '</div>'+
    '</div>';
    document.getElementById('painel_cronometros').appendChild(elemento);
    var parametros = {
        segundos: parseInt(secondsDiff(), 10),
        alertar_faltando_segundos: parseInt(60, 10),
        regressivo: true,
        iniciar: true,
        ao_terminar: null,
        elemento: document.getElementById('cronometro_0'),
        funcao_para_mostrar: cronometror.mostrarPadrao
    };
    cronometror.criar(parametros);
}

function secondsDiff() {
    var dataUTCNow = new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"});

    var dataNow = new Date(
            dataUTCNow.substring(6,10),
            dataUTCNow.substring(3,5)-1,
            dataUTCNow.substring(0,2),
            dataUTCNow.substring(11,13),
            dataUTCNow.substring(14,16),
            dataUTCNow.substring(17,19)
        ).getTime()

    var dataExcecao = new Date(
        dataUTCNow.substring(6,10),
        dataUTCNow.substring(3,5)-1,
        dataUTCNow.substring(0,2),
        23, 59, 59
    ).getTime()

    var ms = dataExcecao - dataNow
    var sec = ms < 0 ? 0 : Math.ceil(ms/1000)

    return sec;
}

function showPopup() {

    var element = document.getElementsByClassName('popup')[0];

    console.log(document.getElementsByClassName('popup')[0].style.visibility)

    if (element.style.visibility == 'hidden')
    {
        element.style.visibility = '';
    }
    else if(element.style.visibility == '' | element.style.visibility == null)
    {
        element.style.visibility = 'hidden'
    }
    
}