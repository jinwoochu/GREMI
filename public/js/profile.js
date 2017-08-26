// var myCenter = new google.maps.LatLng(37.250943, 127.028344);
// var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';

// function initMap() {
//   map = new google.maps.Map(
//     document.getElementById('map'), {
//       zoom: 2,
//       center: {lat: 37.250943, lng: 127.028344},
//       panControl: false,
//       zoomControl: false,
//       scaleConrtol: false,
//       mapTypeControl: false,
//       streetViewControl: false,
//       overviewMapControl: false,
//       scrollwheel: false,
//       draggable: false
//     });
// }

// $(document).ready(function() {
//   $('#investment_menu').on('click', 'a', function(event) {
//     event.preventDefault();
//     $('#investment_menu li').removeClass('active');
//     $(this).addClass('active');

//     $('.profile_item').css('display', 'none');
//     $($(this).attr('href')).css('display', 'block');
//   });

//   $('#calendar').fullCalendar({
//     header: {
//           // lef  t: 'prev,next today',
//           // center: 'title',
//           // right: 'month,agendaWeek,agendaDay'
//         },
//         defaultDate: '2017-05-12',
//         selectable: true,
//         selectHelper: true,
//         height: 420,
//         select: function(start, end) {
//           var title = prompt('Event Title:');
//           var eventData;
//           if (title) {
//             eventData = {
//               title: title,
//               start: start,
//               end: end
//             };
//           $('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
//         }
//         $('#calendar').fullCalendar('unselect');
//       },
//       editable: true,
//       eventLimit: true, // allow "more" link when too many events
//       events: [{
//         title: 'All Day Event',
//         start: '2017-05-01'
//       }]
//     });
// });

$(document).ready(function() {
  $('#profile_menu').on('click', function() {
    $('.profile-contents').addClass('hidden');
    $('#profile_content').removeClass('hidden');
  });

  $('#wallet_menu').on('click', function() {
    $('.profile-contents').addClass('hidden');
    $('#wallet_content').removeClass('hidden');
  });

  $('#callandar_menu').on('click', function() {
    $('.profile-contents').addClass('hidden');
    $('#callandar_content').removeClass('hidden');
  });

  $('#asset_menu').on('click', function() {
    $('.profile-contents').addClass('hidden');
    $('#asset_content').removeClass('hidden');
    //TODO
    $.ajax({
      url: '/asset',
      type: "get",
      dataType: "json",
      success: function(result) {
        console.log(result);
        var sum = 0;

        for(var i = 0 ; i < result.buyerLogs.length ; i++) {
          sum += result.buyerLogs[i].invest_amount;
        }

        $("#buyTempl").tmpl({'logs': result.buyerLogs, 'totalAmount': sum}).appendTo("#buy_list");

        var sum = 0;
        for(var i = 0 ; i < result.buildings.length ; i++) {
          sum += result.buildings[i].price;
        }

        $("#sellTmpl").tmpl({'logs': result.buildings, 'totalAmount': sum}).appendTo("#sell_list");
      }
    });
  });

  $('#asset_detail_menu').on('click', 'a', function() {
    $('.asset_content').toggleClass('hidden');
  });


  $('.currency-type').on('click', 'a', function() {
    $(this).parents('.currency-form').find('.currency-info').text($(this).data('currency-type'));
  });
});