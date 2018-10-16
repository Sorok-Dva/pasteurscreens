/**
 * Handlebars helpers
 */
const moment = require('moment');

module.exports.register = async (Handlebars) => {
    Handlebars.registerHelper('dateFormat', (context, format) => {
        return moment(new Date(context)).format(format);
    });

    Handlebars.registerHelper('number', (number) => {
        if (number) {
            return number.toLocaleString();
        } else {
            return number;
        }
    });

    Handlebars.registerHelper('ticketStatus', (status) => {
        switch (status) {
        case 0:
            return 'Waiting';
        case 1:
            return 'Ongoing';
        case 2:
            return 'Need more info';
        case 3:
            return 'Resolved';
        case 4:
            return 'Resolved';
        }
    });

    Handlebars.registerHelper('ticketObject', (status) => {
        switch (status) {
        case 2:
            return 'Bug IG';
        case 3:
            return 'Bug Site';
        case 4:
            return 'Comportement';
        case 5:
            return 'Candidature';
        case 6:
            return 'Autre';
        }
    });

    Handlebars.registerHelper('ticketDelay', (start, status) => {
        if (status === 3 || status === 4) return '';
        return moment(new Date(start)).startOf('minute').fromNow();
    });

    Handlebars.registerHelper('ifCond', (v1, operator, v2, options) => {
        switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
        }
    });

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

    Handlebars.registerHelper('has_passed', (dateString, options) => {
        if(moment(dateString).isAfter(moment())) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
};