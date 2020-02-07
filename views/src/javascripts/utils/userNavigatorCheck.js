function isChromeForIos(userAgent){
  return userAgent.indexOf('CriOS') > -1;
}

function isSafari(userAgent){
  return userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Chromium') > -1;
}

function noIE(){
  if ( confirm( "Internet explorer n'est plus à jour, merci de télécharger et d'installer Microsoft Edge." ) ) {
    $(location).attr('href', 'https://www.microsoft.com/fr-fr/windows/microsoft-edge');
  } else {
    $(location).attr('href', 'https://www.microsoft.com/fr-fr/windows/microsoft-edge');
  }
}

$(document).ready(function() {
  if ((navigator.userAgent.indexOf('Opera') || navigator.userAgent.indexOf('OPR')) !== -1) {
  } else if (navigator.userAgent.indexOf('Chrome') !== -1) {
  } else if (navigator.userAgent.indexOf('Firefox') !== -1) {
  } else if (isChromeForIos(navigator.userAgent)) {
  } else if (isSafari(navigator.userAgent)) {
  } else if ((navigator.userAgent.indexOf('Trident') !== -1) || (!!document.documentMode === true)) {
    noIE();
  }
});