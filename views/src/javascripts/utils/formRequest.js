const FormRequest = {};

FormRequest.Init = (id, callback, opts) => {
  $(`form${id}`).submit(function(e) {
    e.preventDefault();
    $(`form${id} input`).removeClass('is-invalid').addClass('is-valid');
    let fields = $(this).serializeArray();
    let data = {};
    fields.map(e => {
      if (opts && opts.type && opts.type[e.name]) {
        if (data[e.name] === undefined) {
          switch (opts.type[e.name].val) {
            case 'array':
              data[e.name] = [];
              break;
          }
        }
        switch (opts.type[e.name].val) {
          case 'array':
            data[e.name].push(e.value);
            break;
          default: data[e.name] = e.value;
        }
      } else data[e.name] = e.value
    });
    let method = $(this).attr('method');
    let action = $(this).attr('action');
    $[method](action, data, response => {
      let errors = [];
      if (response.validationErrors) {
        response.validationErrors.map(e => errors.push(`ValidationError: Field ${e.param} (${e.msg})`));
        response.errors.map(e => {
          if (e.field) $(`input[name="${e.field}"`).removeClass('is-valid').addClass('is-invalid')
        });
      }
      if (response.errors) {
        response.errors.map(e => errors.push(`Erreur: ${e.msg}`));
        response.errors.map(e => {
          if (e.field) $(`input[name="${e.field}"`).removeClass('is-valid').addClass('is-invalid')
        });
      }
      if (response.error) {
        if (response.error.msg) {
          if (response.error.field) $(`input[name="${response.error.field}"`).addClass('is-invalid');
          errors.push(`Erreur: ${response.error.msg}`);
        } else errors.push(`Erreur: ${response.error}`);

      }
      if (response.sequelizeError) {
        response.sequelizeError.errors.map(e => errors.push(`DatabaseError: ${e.message}`));
      }

      if (errors.length > 0) {
        $('#flashContainer').empty();
        errors.forEach(e => $('#flashContainer').append(`<div class="alert alert-danger">${e}</div>`))
      } else {
        return callback(response, data);
      }
    }).catch((xhr, status, error) => catchError(xhr, status, error));

    return false;
  })
};