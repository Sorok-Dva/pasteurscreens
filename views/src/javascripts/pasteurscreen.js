const imgPreview = $('#imgPreview');
const postUpload = () => {
  // todo add a uniq key generated by server to ensure that the method is call in legit way
  const base64 = imgPreview.attr('data-base64');
  const size = imgPreview.attr('data-size');
  const title = $('#screenTitle').val();
  const _csrf = $('#_csrf').val();
  const privacy = $('#screenPrivacy option:selected').text() === 'Private' ? 1 : 0;
  if (base64.length < 30) return false;
  $.post('/screens/save', { base64, size, title, privacy, _csrf }, (data) => {
    if (data.path) {
      const url = data.private === '1' ? 'https://pasteurscreens.tk' : 'https://purs.tk';
      $(location).attr('href', `${url}/-${data.shareKey}`)
    }
  })
};

$('body').bind('paste', (e) => {
  $('#imgPreview > img').remove();
  const data = e.originalEvent.clipboardData.items[0].getAsFile();
  if (data instanceof File) {
    $('#postSetting').show();
    const fr = new FileReader();

    fr.readAsDataURL(data);
    fr.onloadend = () => {
      const img = new Image();
      img.onload = () => imgPreview.append(img);
      img.src = fr.result;
      img.classList = 'img-fluid center-block';
      imgPreview.attr('data-size', data.size).attr('data-base64', fr.result);
    };
  } else {
    $.notify({
      icon: 'fa fa-exclamation',
      title: 'Wrong Content :',
      message: 'Your actual clipboard isn\'t a screenshot.'
    }, {
      type: 'danger',
      allow_dismiss: true,
      newest_on_top: false,
      showProgressbar: false,
      placement: {
        from: 'bottom',
        align: 'left'
      },
      offset: 20,
      spacing: 10,
      z_index: 1031,
      delay: 1500,
      timer: 5000,
      animate: {
        enter: 'animated fadeInDown',
        exit: 'animated fadeOutUp'
      }
    });
  }
});