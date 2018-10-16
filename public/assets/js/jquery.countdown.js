! function(a) {
    a.fn.countdown = function(b) {
        function k() {
            var a = new Date,
                b = h - a;
            b = Math.floor(b / 1e3), 1 > b && (b = 0), i || 0 == b && (i = !0, j.onComplete());
            var k = Math.floor(b / 86400);
            j.show_day && (c.children(".counter").text(k), b %= 86400);
            var l = Math.floor(b / 3600);
            j.show_hour && (d.children(".counter").text(l), b %= 3600);
            var m = Math.floor(b / 60);
            j.show_minute && (e.children(".counter").text(m), b %= 60);
            var n = Math.floor(b);
            if (j.show_second && f.children(".counter").text(n), 0 != j.progress) {
                var o = Math.round(h - g),
                    p = Math.round(a - g),
                    q = 100 * (p / o);
                q > 100 && (q = 100), j.update_progress(q, j.progress)
            }
        }
        var c, d, e, f, g, h, i = !1,
            j = a.extend({
                start_time: null,
                end_time: null,
                show_day: !0,
                show_hour: !0,
                show_minute: !0,
                show_second: !0,
                update_int: 1,
                progress: !1,
                onComplete: function() {},
                wrapper: function(b) {
                    var unitTxt;
                    switch (b) {
                        case 'Day':
                            unitTxt = 'Jours';
                            break;
                        case 'Hour':
                            unitTxt = 'Heures';
                            break;
                        case 'Minute':
                            unitTxt = 'Minutes';
                            break;
                        case 'Second':
                            unitTxt = 'Secondes';
                            break;
                    }
                    var c = a('<div class="' + b.toLowerCase() + '_wrapper" />');
                    return c.append('<span class="counter" />'), c.append('<span class="title">' + unitTxt + "</span>"), c
                },
                update_progress: function(a, b) {
                    b.attr("aria-valuenow", Math.floor(a)), b.css("width", Math.floor(a) + "%"), b.text(Math.floor(a) + "%")
                }
            }, b);
        g = null == j.start_time ? new Date : new Date(j.start_time), h = null == j.end_time ? new Date(new Date + 9e7) : new Date(j.end_time), console.log(j.end_time), j.show_day && (c = j.wrapper("Day")), j.show_hour && (d = j.wrapper("Hour")), j.show_minute && (e = j.wrapper("Minute")), j.show_second && (f = j.wrapper("Second")), k(), setInterval(k, 1e3 * j.update_int), this.prepend(f), this.prepend(e), this.prepend(d), this.prepend(c)
    }
}(jQuery);
(function($) {
    $.fn.countdown = function(options) {
        var dwcd_day, dwcd_hour, dwcd_minute, dwcd_second, dwcd_start_time, dwcd_end_time, dwcd_complete = false;
        var settings = $.extend({
            start_time: null,
            end_time: null,
            show_day: true,
            show_hour: true,
            show_minute: true,
            show_second: true,
            update_int: 1,
            progress: false,
            onComplete: function() {},
            wrapper: function(unit) {
                var unitTxt;
                switch (unit) {
                    case 'Day':
                        unitTxt = 'Jours';
                        break;
                    case 'Hour':
                        unitTxt = 'Heures';
                        break;
                    case 'Minute':
                        unitTxt = 'Minutes';
                        break;
                    case 'Second':
                        unitTxt = 'Secondes';
                        break;
                }
                var wrapper = $('<div class="' + unit.toLowerCase() + '_wrapper" />');
                wrapper.append('<span class="counter" />');
                wrapper.append('<span class="title">' + unitTxt + "</span>");
                return wrapper
            },
            update_progress: function(progress, element) {
                element.attr("aria-valuenow", Math.floor(progress));
                element.animate({ width: progress + "%"}, 500);
                element.text(Math.floor(progress) + "%")
            }
        }, options);
        if (settings.start_time == null) dwcd_start_time = new Date;
        else dwcd_start_time = new Date(settings.start_time);
        if (settings.end_time == null) dwcd_end_time = new Date(new Date + 25 * 60 * 60 * 1e3);
        else dwcd_end_time = new Date(settings.end_time);
        if (settings.show_day) dwcd_day = settings.wrapper("Day");
        if (settings.show_hour) dwcd_hour = settings.wrapper("Hour");
        if (settings.show_minute) dwcd_minute = settings.wrapper("Minute");
        if (settings.show_second) dwcd_second = settings.wrapper("Second");
        update();
        setInterval(update, settings.update_int * 1e3);
        this.prepend(dwcd_second);
        this.prepend(dwcd_minute);
        this.prepend(dwcd_hour);
        this.prepend(dwcd_day);

        function update() {
            var now = new Date;
            var left = dwcd_end_time - now;
            left = Math.floor(left / 1e3);
            if (left < 1) left = 0;
            if (!dwcd_complete) {
                if (left == 0) {
                    dwcd_complete = true;
                    settings.onComplete()
                }
            }
            var days = Math.floor(left / (60 * 60 * 24));
            if (settings.show_day) {
                dwcd_day.find(".counter").text(days);
                left = left % (60 * 60 * 24)
            }
            var hours = Math.floor(left / (60 * 60));
            if (settings.show_hour) {
                dwcd_hour.find(".counter").text(hours);
                left = left % (60 * 60)
            }
            var minutes = Math.floor(left / 60);
            if (settings.show_minute) {
                dwcd_minute.find(".counter").text(minutes);
                left = left % 60
            }
            var seconds = Math.floor(left);
            if (settings.show_second) {
                dwcd_second.find(".counter").text(seconds)
            }
            if (settings.progress != false) {
                var total_time = Math.round(dwcd_end_time - dwcd_start_time);
                var spent_time = Math.round(now - dwcd_start_time);
                var progress = spent_time / total_time * 100;
                if (progress > 100) progress = 100;
                settings.update_progress(progress, settings.progress)
            }
        }
    }
})(jQuery);