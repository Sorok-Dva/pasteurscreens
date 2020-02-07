let activeBtnLoader;
const _csrf = $('meta[name="csrf-token"]').attr('content');

jQuery.each(['put', 'patch', 'delete'], (i, method) => {
  jQuery[method] = (url, data, callback, type) => {
    if (jQuery.isFunction(data)) {
      type = type || callback;
      callback = data;
      data = undefined;
    }
    return jQuery.ajax({
      url: url,
      type: method,
      dataType: type,
      data: data,
      headers: data.headers,
      success: callback
    });
  };
});

const debug = (data) => {
  const debugEnable = $('meta[name="debug"]').attr('content');
  if (debugEnable === 'false') return false;
  console.time('debug finished in');
  console.log('%c [DEBUG] :', 'color: orange; font-weight: bold', data);
  console.trace('StackTrace');
  if (typeof data === 'object') console.table(data);
  console.timeEnd('debug finished in');
};

const notification = (opts) => {
  $.notify({
    icon: `fal fa-${opts.icon}`,
    title: `<b>${opts.title}</b>`,
    message: `${opts.message || ''}`
  }, {
    type: `${opts.type}`,
    allow_dismiss: true,
    newest_on_top: true,
    showProgressbar: true,
    placement: {
      from: 'bottom',
      align: 'left'
    },
    offset: 20,
    spacing: 10,
    z_index: 9999999999,
    delay: opts.timer || 5000,
    animate: {
      enter: 'animated fadeInDown',
      exit: 'animated fadeOutUp'
    },
    onClosed: opts.onClosed
  });
};

const errorsHandler = data => {
  debug(data);
  if (_.isNil(data.responseJSON)) {
    notification({
      icon: 'exclamation',
      type: 'danger',
      title: 'Une erreur est survenue :',
      message: data.responseText
    });
  } else {
    const error = data === undefined ? null : data.responseJSON;
    if (error.errors) {
      error.errors.forEach((e, i) => {
        notification({
          icon: 'exclamation',
          type: 'danger',
          title: 'Champ invalide :',
          message: `${e.param}`
        });
      });
    } else {
      let message = error.sequelizeError
        ? `<b>${errors.sequelizeError.name}</b>: ${errors.sequelizeError.original.sqlMessage}`
        : error.message || error || 'Unknown Error';
      message = (typeof message === 'object') ? message.name : message;
      notification({
        icon: 'exclamation',
        type: 'danger',
        title: 'Une erreur est survenue :',
        message
      });
    }
  }
};

const catchError = (xhr, status, error) => {
  debug({ xhr, status, error });
  let title, message;
  switch (error) {
  case 'Bad Request':
    title = 'Bad Request';
    break;
  case 'Internal Server Error':
    title = 'An internal server error occurred.';
    if (xhr.responseJSON) {
      if (typeof xhr.responseJSON.message === 'object') {
        switch (xhr.responseJSON.message.name) {
        case 'SequelizeForeignKeyConstraintError':
          message = `ForeignKeyConstraintError: ${xhr.responseJSON.message.original.sqlMessage}`;
          break;
        default:
          message = xhr.responseJSON.message.sqlMessage;
        }
      } else if (typeof xhr.responseJSON.message === 'string') {
        message = xhr.responseJSON.message;
      }
    }
    break;
  case 'Forbidden':
    title = 'Access not allowed :';
    message = 'You can\'t access this page.';
    break;
  case 'Not Found':
    title = xhr.responseJSON ? xhr.responseJSON.message : 'Page not found.';
    break;
  case 'Request Time-out':
    title = 'Request Time-out.';
    break;
  case 'Unauthorized':
    title = 'Unauthorized.';
    break;
  case '':
    title = 'Connection lost:';
    message = 'Connection between you and AO Files is actually unavailable. Please take a look at your connection or retry in few minutes.';
    break;
  default:
    title = xhr.responseJSON ? xhr.responseJSON.name : `Unknown Error (HTTP Error ${error})`;
    message = xhr.responseJSON ? xhr.responseJSON.message : null;
  }
  if (!_.isNil(title)) {
    notification({
      icon: 'exclamation',
      type: 'danger',
      title,
      message
    });
  }
};

const loadTemplate = (url, data, callback) => {
  if (data.partials) {
    for (let i = 0; i < data.partials.length; i++) {
      $.ajax({
        url: `/views/partials/${data.partials[i]}.hbs`,
        cache: true,
        success: (source) => {
          Handlebars.registerPartial(`${data.partials[i]}`, source);
        }
      }).catch((xhr, status, error) => {
        $('#loadingModal').modal('hide');
        catchError(xhr, status, error)
      });
    }
  }
  $.ajax({
    url,
    cache: true,
    success: (source) => {
      if (data.modal) {
        $.ajax({
          url: `/views/modals/partials/${data.modal}.hbs`,
          cache: true,
          success: (modal) => {
            Handlebars.registerPartial(`${data.modal}`, modal);
            const template = Handlebars.compile(source);
            return callback(template(data));
          }
        }).catch((xhr, status, error) => {
          $('#loadingModal').modal('hide');
          catchError(xhr, status, error);
        });
      } else {
        const template = Handlebars.compile(source);
        return callback(template(data));
      }
    }
  }).catch((xhr, status, error) => {
    $('#loadingModal').modal('hide');
    catchError(xhr, status, error);
  });
};

const createModal = (opts, callback) => {
  $('#loadingModal').modal({
    backdrop: 'static',
    keyboard: false
  });
  if ($(`#${opts.id}`).length > 0) {
    $(`#${opts.id}`).modal('hide');
    $(`#${opts.id}`).remove();
  }
  loadTemplate('/views/modals/main.hbs', opts, (html) => {
    $('body').append(html);
    $('#loadingModal').modal('hide');
    if ('cantBeClose' in opts) {
      if (opts.cantBeClose) {
        $(`#${opts.id}`).modal({
          backdrop: 'static',
          keyboard: false
        });
      } else $(`#${opts.id}`).modal();
    } else $(`#${opts.id}`).modal();
    if (callback) return callback();
  });
};

$(document).ready(function () {
  $('body').prepend('<div id="dialog"></div>');
  $('#dialog').dialog({
    autoOpen: false,
    show: { effect: 'fade' },
    hide: { effect: 'fade' },
    modal: true,
    width: 650,
    position: { my: 'top', at: 'top+150' },
    close: (event, ui) => $('#wrap').show(),
    open: (event, ui) => {
      $('.ui-widget-overlay').bind('click', () => {
        $('#dialog').dialog('close');
      });
    }
  });

  $(document).on('click', '.btn-loader', (e) => {
    const $this = $(e.target);
    activeBtnLoader = $this;
    const loadingText = $this.attr('data-loading-text');
    if ($this.html() !== loadingText) {
      $this.data('original-text', $this.html());
      $this.html(loadingText);
    }
    setTimeout(function () {
      $this.html($this.data('original-text'));
    }, 10000);
  });

  // Initialize tooltips
  $('.nav-tabs > li a[title]').tooltip();

  // Wizard
  $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
    const $target = $(e.target);
    if ($target.parent().hasClass('disabled')) {
      return false;
    }
  });

  $('.stop-step').click(function (e) {
    history.back()
  });
});

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
});