let ValidatePassword = function () {
  let rules = [{
    Pattern: '[A-Z]',
    Target: 'uppercase'
  }, {
    Pattern: '[a-z]',
    Target: 'lowercase'
  }, {
    Pattern: '[0-9]',
    Target: 'number'
  }, {
    Pattern: '[!@#$%^&*]',
    Target: 'symbol'
  }];

  let password = $(this).val();

  $('#length')
    .removeClass(password.length > 8 ? 'bad-rule' : 'good-rule')
    .addClass(password.length > 8 ? 'good-rule' : 'bad-rule');

  if ($('#passwordConfirm').val() === password && password.length > 8) {
    $('#password').removeClass('is-invalid').addClass('is-valid');
    $('#same').removeClass('bad-rule').addClass('good-rule');
  } else {
    $('#password').removeClass('is-valid').addClass('is-invalid');
    $('#passwordConfirm').removeClass('is-valid').addClass('is-invalid');
    $('#same').removeClass('good-rule').addClass('bad-rule');
    $('button#validateForm').attr('disabled', 'disabled');
  }
  for (let i = 0; i < rules.length; i++) {
    $('#' + rules[i].Target)
      .removeClass(new RegExp(rules[i].Pattern).test(password) ? 'bad-rule' : 'good-rule')
      .addClass(new RegExp(rules[i].Pattern).test(password) ? 'good-rule' : 'bad-rule');
  }
  if ($('ul').find('.bad-rule').length === 0) {
    $('button#validateForm').removeAttr('disabled');
    $('#password').removeClass('is-invalid').addClass('is-valid');
  } else if ($('ul').find('.bad-rule').length === 1 && $('#same').hasClass('bad-rule')) {
    $('#password').removeClass('is-invalid').addClass('is-valid');
    $('button#validateForm').attr('disabled', 'disabled');
  } else {
    $('button#validateForm').attr('disabled', 'disabled');
    $('#password').removeClass('is-valid').addClass('is-invalid');
  }
};

let ValidateConfirmPassword = function () {
  let passwordConfirm = $(this).val();

  let rules = [{
    Pattern: (passwordConfirm === $('#password').val()),
    Target: 'same'
  }];

  if (rules[0].Pattern) {
    $('#' + rules[0].Target).removeClass('bad-rule').addClass('good-rule');
    $(this).removeClass('is-invalid').addClass('is-valid');
    $('button#validateForm').removeAttr('disabled');
  } else {
    $('#' + rules[0].Target).removeClass('good-rule').addClass('bad-rule');
    $(this).removeClass('is-valid').addClass('is-invalid');
    $('button#validateForm').attr('disabled', 'disabled');
  }
};

$(document).ready(() => {
  $('#password').on('keyup', ValidatePassword);
  $('#passwordConfirm').on('keyup', ValidateConfirmPassword);
});