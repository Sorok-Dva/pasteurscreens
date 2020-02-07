$(document).ready(function () {
  appNotifications.init();
  $('#notificationsContainer').on('click', '.notif-li', function(event) {
    event.preventDefault();
    event.stopPropagation();

    let notifId = $(event.currentTarget).attr('data-notif-id');
    $('#notificationsContainer').hide();

    $.get(`/api/user/notification/${notifId}`, (data) => {
      loadTemplate('/views/notification/main.hbs', data, (html) => {
        $('#notificationData').html(html).show();
        $('#notif-see-all').hide();
        $('#notif-back').attr('data-id', notifId);
        $('#notif-back').show();
      });
    });
  });

  $('#notif-back').click(function(event) {
    event.preventDefault();
    event.stopPropagation();
    $('#notificationsContainer').show();
    $('#notificationData').hide();
    $('#notif-see-all').show();
    $('#notif-back').hide();
    let id = $('#notif-back').attr('data-id');
    $.put('/api/user/notification/read', { _csrf, id }, (data) => {
      count--;
      appNotifications.loadAll();
    });
  });

  $('#notificationData').on('click', '.notificationCTA', function(event) {
    event.preventDefault();
    event.stopPropagation();
    let target = $(event.target);
    let action = target.attr('data-action');
    let availability = target.attr('data-availability');
    switch (action) {
      case 'nc/availability':
        let ncid = target.attr('data-ncid');
        $.post(`/api/candidate/nc/${ncid}/availability`, { _csrf, availability}, (data) => {
          if (data === 'done') {
            notification({
              icon: 'check-circle',
              type: 'success',
              title: 'Disponibilité enregistrée.',
              message: `Nous venons d'informer l'établissement de votre disponibilité.`
            });
            $('#notif-back').trigger('click');
          }
        }).catch((xhr, status, error) => catchError(xhr, status, error));
        break;
      case 'conf/availability':
        let confid = target.attr('data-confid');
        $.post(`/api/candidate/conference/${confid}/availability`, { _csrf, availability}, (data) => {
          if (data === 'done') {
            notification({
              icon: 'check-circle',
              type: 'success',
              title: 'Disponibilité enregistrée.',
              message: `Nous venons d'informer l'établissement de votre disponibilité pour cet entretien.`
            });
            $('#notif-back').trigger('click');
          }
        }).catch((xhr, status, error) => catchError(xhr, status, error));
        break;
    }
  })
});

let count = 0;
let lastCount = 0;
let appNotifications = {
  init: () => {
    $("#notificationsBadge").hide();
    $("#notificationAucune").hide();

    // bind click on notifications
    $("#notifications-dropdown").on('click', function () {
      let open = $("#notifications-dropdown").attr("aria-expanded");

      if (open === "false") {
        appNotifications.loadAll();
      }
    });

    // Load notifications
    appNotifications.loadAll();

    // Polling
    // Every 3 minutes we check if new notifications
    setInterval(function () {
      appNotifications.loadNumber();
    }, 900000);

    // Binding de marquage comme lue desktop
    $('.notification-read-desktop').on('click', function (event) {
      appNotifications.markAsReadDesktop(event, $(this));
    });
  },
  loadAll: () => {
    appNotifications.loadNumber();
  },
  badgeLoadingMask: function (show) {
    if (show === true) {
      $("#notificationsBadge").html(appNotifications.badgeSpinner);
      $("#notificationsBadge").show();
      // Mobile
      $("#notificationsBadgeMobile").html(count);
      $("#notificationsBadgeMobile").show();
    }
    else {
      $("#notificationsBadge").html(count);
      if (count > 0) {
        $("#notificationsIcon").removeClass("fa-bell-o");
        $("#notificationsIcon").addClass("fa-bell");
        $("#notificationsBadge").show();
        // Mobile
        $("#notificationsIconMobile").removeClass("fa-bell-o");
        $("#notificationsIconMobile").addClass("fa-bell");
        $("#notificationsBadgeMobile").show();
      }
      else {
        $("#notificationsIcon").addClass("fa-bell-o");
        $("#notificationsBadge").hide();
        // Mobile
        $("#notificationsIconMobile").addClass("fa-bell-o");
        $("#notificationsBadgeMobile").hide();
      }
    }
  },
  loadingMask: function (show) {
    if (show === true) {
      $("#notificationAucune").hide();
      $("#notificationsLoader").show();
    } else {
      $("#notificationsLoader").hide();
      if (count > 0) {
        $("#notificationAucune").hide();
      }
      else {
        $("#notificationAucune").show();
      }
    }
  },
  loadNumber: () => {
    appNotifications.badgeLoadingMask(true);

    $.get('/api/user/notifications', data => {
      lastCount = count;
      count = data.count;
      $("#notificationsBadge").html(data.count);
      appNotifications.badgeLoadingMask(false);
      appNotifications.load(data.rows);
    });
  },
  load: (notifications) => {
    appNotifications.loadingMask(true);

    $('#notificationsContainer').html('');

    lastCount = count;

    notifications.forEach(notif => {
      let template = $('#notificationTemplate').html();
      template = template.replace("{{id}}", notif.id);
      template = template.replace("{{image}}", notif.image);
      template = template.replace("{{subject}}", notif.subject);
      template = template.replace("{{date}}", moment(notif.createdAt).fromNow());
      $('#notificationsContainer').append(template);
    });
    // bind mark as read
    $('.notification-read').on('click', (event) => appNotifications.markAsRead(event, $(this)));

    // Stop loading mask
    appNotifications.loadingMask(false);

    // enable button
    $("#notifications-dropdown").prop("disabled", false);
  },
  // Set notification as read
  markAsRead: (event) => {
    // Allow to keep list open
    event.preventDefault();
    event.stopPropagation();

    // Remove notification
    let elem = $(event.currentTarget).parent('.dropdown-notification');
    let id = elem.attr('data-notif-id');
    elem.remove();
    $.put('/api/user/notification/read', { _csrf, id }, (data) => {
      count--;
      appNotifications.loadAll();
    });
  },
  // Marquer une notification comme lue version bureau
  markAsReadDesktop: function (event, elem) {
    // Permet de ne pas change de page
    event.preventDefault();
    event.stopPropagation();

    // Suppression de la notification
    elem.parent('.dropdown-notification').removeClass("notification-unread");
    elem.remove();

    // On supprime le focus
    if (document.activeElement) {
      document.activeElement.blur();
    }

    count--;

    // update count
    appNotifications.loadAll();
  },
  badgeSpinner: '<i class="fal fa-spinner fa-pulse fa-fw" aria-hidden="true"></i>'
};