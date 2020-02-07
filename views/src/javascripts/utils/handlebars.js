Handlebars.registerHelper('date', (context, format) => {
  return moment(new Date(context)).format(format);
});

/**
 * Returns age from dateObject with age format (years, months, weeks, days, hours, minutes, seconds)
 *
 * ```handlebars
 * {{age dateObject 'years'}}
 * <!-- results in: '18' -->
 * ```
 * @param {Date} `context` Date Object
 * @param {String} `format` Age Format wanted
 * @return {String} Date object formatted in age.
 */
Handlebars.registerHelper('age', (context, format) => {
  return moment().diff(new Date(context), format);
});

/**
 * Returns a number to LocaleString (huge numbers formatted)
 *
 * ```handlebars
 * {{number 10000}}
 * <!-- results in: '10,000' for FR locale for example -->
 * ```
 * @param {Number} `number` Number
 * @return {String} Number in locale String
 */
Handlebars.registerHelper('number', (number) => {
  if (number) {
    return number.toLocaleString();
  } else {
    return number;
  }
});

/**
 * Returns a formatted text for users role
 *
 * ```handlebars
 * {{rolify user.role}}
 * <!-- results in: 'Utilisateur' -->
 * ```
 * @param {String} `role` A User Role or Type (User, Admin, admin, es, demo, candidate)
 * @return {String} data role into prettiest format
 */
Handlebars.registerHelper('rolify', (role) => {
  switch (role) {
    case 'User': return 'Utilisateur';
    case 'Admin': return 'Administrateur';
    case 'admin': return 'Administrateur';
    case 'es': return 'Établissement';
    case 'demo': return 'Démo';
    case 'candidate': return 'Candidat';
    default: return role
  }
});

/**
 * Returns "selected" css class for stars rating system
 *
 * ```handlebars
 * {{rating knowledge.stars 1}}
 * <!-- results in: 'selected' -->
 * ```
 * @param {Number} `stars` Number of stars defined by user
 * @param {Number} `star` Current li star
 * @return {String} "selected" class for the right li of rating class system
 */
Handlebars.registerHelper('rating', (stars, star) => {
  if (star <= stars) {
    return 'selected';
  }
});

Handlebars.registerHelper('ifCond', (v1, operator, v2, options) => {
  switch (operator) {
    case '==':
      return v1 == v2 ? options.fn(this) : options.inverse(this);
    case '===':
      return v1 === v2 ? options.fn(this) : options.inverse(this);
    case '!=':
      return v1 != v2 ? options.fn(this) : options.inverse(this);
    case '!==':
      return v1 !== v2 ? options.fn(this) : options.inverse(this);
    case '<':
      return v1 < v2 ? options.fn(this) : options.inverse(this);
    case '<=':
      return v1 <= v2 ? options.fn(this) : options.inverse(this);
    case '>':
      return v1 > v2 ? options.fn(this) : options.inverse(this);
    case '>=':
      return v1 >= v2 ? options.fn(this) : options.inverse(this);
    case '&&':
      return v1 && v2 ? options.fn(this) : options.inverse(this);
    case '||':
      return v1 || v2 ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});

/**
 * Returns result of math operation
 *
 * ```handlebars
 * {{math 6 '*' 7}}
 * <!-- results in: '42' -->
 * ```
 * @param {Number} `lvalue`
 * @param {String} `operator`
 * @param {Number} `rvalue`
 * @return {String} Operation result
 */
Handlebars.registerHelper('math', (lvalue, operator, rvalue) => {
  lvalue = parseFloat(lvalue);
  rvalue = parseFloat(rvalue);

  return {
    '+': lvalue + rvalue,
    '-': lvalue - rvalue,
    '*': lvalue * rvalue,
    '/': lvalue / rvalue,
    '%': lvalue % rvalue
  }[operator];
});

Handlebars.registerHelper('discount', (price, discount) => Number(price) - (Number(price) * Number(discount) / 100));

Handlebars.registerHelper('has_passed', (dateString, options) => {
  if (moment(dateString).isAfter(moment())) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('countFiles', (object, type) => {
  let count = 0;
  if (!_.isNil(object)) object.forEach((e, i) => object[i].type === type ? count++ : null);
  return count;
});

Handlebars.registerHelper('weekStats', (object) => {
  let res = [];
  for (let day = 6; day >= 0; day--) {
    let date = day === 0 ? moment().format('MMM Do YY') : moment().subtract(day, 'days').format('MMM Do YY');
    let isNull = true;
    object.map((user) => {
      if (date === moment(user.createdAt).format('MMM Do YY')){
        res.push(user.dataValues.count);
        isNull = false;
      }
    });
    if (isNull) res.push(0);
  }
  return res;
});

Handlebars.registerHelper('repeat', function (n, block) {
  let accum = '';
  for (let i = 0; i < n; ++i)
    accum += block.fn(i);
  return accum;
});

Handlebars.registerHelper('json', function (context) {
  return JSON.stringify(context);
});


Handlebars.registerHelper('countInObject', (object, property, search) => {
  let count = 0;
  if (!_.isNil(object)) object.forEach((e, i) => object[i][property] === search ? count++ : null);
  return count;
});

/* eslint-disable no-console */
Handlebars.registerHelper('debug', function () {
  console.log('Context:', this);
  debug(Array.prototype.slice.call(arguments, 0, -1));
});

Handlebars.registerHelper('log', function () {
  console.log(['Values:'].concat(
    Array.prototype.slice.call(arguments, 0, -1)
  ));
});
/* eslint-enable no-console */

Handlebars.registerHelper('breaklines', function(text) {
  text = Handlebars.Utils.escapeExpression(text);
  text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
  return new Handlebars.SafeString(text);
});