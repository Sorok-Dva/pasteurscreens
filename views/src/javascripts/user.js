deleteAccount = () => {
  if (confirm('WARNING: This action cannot be revert. \n\nYou will NOT be able to register again with this nickname NOR this email address that is linked to it.\n\nAre you sure you want to delete your account ?')) {
    let password = $('#delPassword').val(), text;
    $.post('/user/deleteAccount', { password }, function (data) {
      if (!data.error) {
        text = '<b>Thank you</b> !' +
          '<br><br>The deletion of the account will be done the next time you log out of the site.' +
          "<br><br><a href='/logout'>Click here if you want to disconnect immediately.</a>";
      } else {
        text = 'Erreur : Le mot de passe que vous avez entré est incorrect.';
      }
      showDialog(text);
    }, 'json');
  }
};

changePassword = () => {
  const oldPassword = $('#oldPassword').val();
  const newPassword = $('#newPassword').val();
  const confNewPassword = $('#confNewPassword').val();

  if (!isEmpty(oldPassword) && !isEmpty(newPassword) && !isEmpty(confNewPassword)) {
    $.post('/user/changePassword',
      { oldPassword, newPassword, confNewPassword }, (data) => {
        if (data.res !== 'error' && !data.errors) {
          if (data.res === 'OK') {
            $('#oldPassword').val('');
            $('#newPassword').val('');
            $('#confNewPassword').val('');
            $('.ut-form-response-error').hide();
            $('.ut-form-response-success').empty().html('Password successfully updated.').show();
          } else {
            $('.ut-form-response-success').hide();
            $('.ut-form-response-error').empty().html(data.message).show();
          }
        } else {
          if (data.errors.length > 0) {
            const resperror = $('.ut-form-response-error');
            const errors = data.errors;

            $('.ut-form-response-success').hide();
            resperror.empty();
            errors.forEach(error => {
              resperror.html(error.msg + '<br>').show();
            });
          }
        }
      }, 'json');
  }
  else {
    $('.ut-form-response-success').hide();
    $('.ut-form-response-error').empty().html('<h3>Please fill all inputs</h3>').show();
  }
};

changeEmail = () => {
  const oldEmail = $('#oldMail').val();
  const newEmail = $('#newMail').val();
  const confNewEmail = $('#confNewMail').val();

  if (!isEmpty(oldEmail) && !isEmpty(newEmail) && !isEmpty(confNewEmail)) {
    $.post('/user/changeMail',
      { oldEmail, newEmail, confNewEmail }, (data) => {
        if (data.res !== 'error' && !data.errors) {
          if (data.res === 'OK') {
            $('#oldMail').val('');
            $('#newMail').val('');
            $('#confNewMail').val('');
            $('.ut-form-response-error').hide();
            $('.ut-form-response-success').empty().html('Email successfully updated.').show();
          } else {
            $('.ut-form-response-success').hide();
            $('.ut-form-response-error').empty().html(data.message).show();
          }
        } else {
          if (data.errors.length > 0) {
            const resperror = $('.ut-form-response-error');
            const errors = data.errors;

            $('.ut-form-response-success').hide();
            resperror.empty();
            errors.forEach(error => {
              resperror.html(error.msg + '<br>').show();
            });
          }
        }
      }, 'json');
  }
  else {
    $('.ut-form-response-success').hide();
    $('.ut-form-response-error').empty().html('<h3>Please fill all inputs</h3>').show();
  }
};

isEmpty = (str) => {
  return !str.replace(/^\s+/g, '').length;
};