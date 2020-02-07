let clipboard = new ClipboardJS('.copyShareLink');
clipboard.on('success', e => {
  $.notify({
    icon: 'fa fa-check-circle',
    title: 'Url copied to your clipboard',
    message: ''
  }, {
    type: 'success',
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
    delay: 1000,
    timer: 2500,
    animate: {
      enter: 'animated fadeInDown',
      exit: 'animated fadeOutUp'
    }
  });
  e.clearSelection();
});
let showScreen = (key, privacy) => {
  let url = privacy === 1 ? 'https://pasteurscreens.tk' : 'https://purs.tk';
  $(location).attr('href', `${url}/-${key}`);
};

let askDelete = (key) => {
  let deleteButton = $(`button[data-key="${key}"][data-action="delete"]`);
  deleteButton.html('Really ?').attr('onclick', `return deleteScreen('${key}');`);
  $(document).click(() => {
    if (!$(event.target).is('button')) {
      deleteButton.html('Delete').attr('onclick', `return askDelete('${key}');`)
    }
  });
};

let deleteScreen = (key) => {
  $.post(`/screens/delete/${key}`, {_csrf}, result => {
    if (result.state === 'deleted') {
      $(`div[data-main-div="${key}"]`).fadeOut(300, () => $(this).remove());
    }
  });
};

let changePrivacy = (privacy, key) => {
  let route = privacy === 1 ? 'public' : 'private';
  $.post(`/screens/set/${route}/${key}`, { _csrf }, result => {
    if (result.state === 'privacy updated') {
      if (route === 'public') {
        $(`button.copyShareLink[data-key="${key}"]`).show();
        $(`div.imgFrame[data-key="${key}"]`).attr('onclick', `return showScreen('${key}', 0)`);
        $(`button.changePrivacy[data-key="${key}"]`)
          .removeClass('btn-success').addClass('btn-warning')
          .attr('onclick', `return changePrivacy(0, "${key}")`)
          .html('Set Private');
      } else {
        $(`button.copyShareLink[data-key="${key}"]`).hide();
        $(`div.imgFrame[data-key="${key}"]`).attr('onclick', `return showScreen('${key}', 1)`);
        $(`button.changePrivacy[data-key="${key}"]`)
          .removeClass('btn-warning').addClass('btn-success')
          .attr('onclick', `return changePrivacy(1, "${key}")`)
          .html('Set Public');
      }
    }
  });
};

$(document).ready(() => {
  let items = $('#products .item');
  $('#list').click(event => { event.preventDefault(); items.addClass('list-group-item'); });
  $('#grid').click(event => {
    event.preventDefault(); items.removeClass('list-group-item'); items.addClass('grid-group-item');
  });
});