$('body').bind('paste', (e) => {
  let data = e.originalEvent.clipboardData.items[0].getAsFile();
  if (data instanceof File) {
    let fr = new FileReader;

    fr.onloadend = () => {
      let img = new Image;
      img.onload = () => $('#imgPreview').append(img);
      img.src = fr.result;
      $.post('/screens/save', {base64: fr.result}, (data) => {
        if (data.state === 'saved') {
          $(location).attr('href', `https://purs.tk/-${data.key}`)
        }
      })
    };
    fr.readAsDataURL(data);
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