let postUpload = () => {
  let base64 = $('#base64').html();
  let title = $('#screenTitle').val();
  let privacy = $('#screenPrivacy option:selected').text() === "Private" ? 1 : 0;
  if (base64.length < 30) return false;
  $.post('/screens/save', {base64, title, privacy}, (data) => {
    if (data.state === 'saved') {
      let url = data.private === '1' ? 'https://pasteurscreens.tk' : 'https://purs.tk';
      $(location).attr('href', `${url}/-${data.key}`)
    }
  })
};

$('body').bind('paste', (e) => {
  $('#imgPreview > img').remove();
  let data = e.originalEvent.clipboardData.items[0].getAsFile();
  if (data instanceof File) {
    $('#postSetting').show();
    let fr = new FileReader;

    fr.readAsDataURL(data);
    fr.onloadend = () => {
      let img = new Image;
      img.onload = () => $('#imgPreview').append(img);
      img.src = fr.result;
      img.classList = 'img-fluid center-block';
      $('#base64').html(fr.result).hide();
    };
  } else {
    $.notify({
      icon: 'fa fa-exclamation',
      title: 'Wrong Content :',
      message: 'Your actual clipboard isn\'t a file.' ,
    },{
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