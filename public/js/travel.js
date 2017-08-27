var travel = {};

$(document).ready(function() {
  $('#building_list').on('click', '.list-group-item', function(){
    $('#building_list').find('.list-group-item').removeClass('active');
    $(this).addClass('active');
    $('#calendar').fullCalendar('removeEvents');
    $('#total_price').text(0);  
    $('#travel_btn').data('building-id', $(this).data('building-id'));
  });  

  $('#calendar').fullCalendar({
    header: {
      left: 'prev',
      right: 'next',
      center: 'title',
    },
    defaultDate: new Date(),
    selectable: true,
    selectHelper: true,
    select: calendarSelect,
    eventClick: cancle,
    editable: true,
    eventLimit: true,
    events: []
  });

  function calendarSelect(start, end) {
    var dateToday = new Date();
    dateToday.setUTCHours(0,0,0,0);

    if(start < dateToday ) {
      $('#calendar').fullCalendar('unselect');
      return false;
    }

    eventData = {
      title: '',
      start: start,
      end: end
    };

    travel.startDate = start;
    travel.endDate = end;

    var totalPrice = $('#total_price').text() - 0;
    var perDayPrice = $('#building_list').find('.active').find('.price').text() - 0;
    var days = Math.ceil((end - start) / (1000 * 3600 * 24));

    totalPrice = parseInt((totalPrice +  perDayPrice * days) * 100) / 100;

    $('#total_price').text(totalPrice);

    $('#calendar').fullCalendar('renderEvent', eventData, true); 
  }

  function cancle(calEvent, jsEvent, view) {           
    var totalPrice = $('#total_price').text() - 0;
    var perDayPrice = $('#building_list').find('.active').find('.price').text() - 0;
    var days = Math.ceil((calEvent.end - calEvent.start) / (1000 * 3600 * 24));

    totalPrice = parseInt((totalPrice -  perDayPrice * days) * 100) / 100;

    $('#total_price').text(totalPrice);

    $('#calendar').fullCalendar('removeEvents', calEvent._id);
  }

  $('#travel_btn').on('click', function() {
    var password = prompt("Please enter your password:");
    var data = new FormData();

    data.append('buildingId', $(this).data('building-id'));
    data.append('start_date', new Date(travel.startDate).toISOString().slice(0, 19).replace('T', ' '));
    data.append('end_date', new Date(travel.endDate - 1).toISOString().slice(0, 19).replace('T', ' '));
    data.append('price', $('#total_price').text() - 0);
    data.append('password', password);

    $.ajax({
      url: '/travel',
      type: 'POST',
      data: data,
      contentType: false,
      processData: false,
      dataType: "json",
      success: function(result) {
        debugger;
        if(result.status == 1) {
          $('#balance').text(result.coin);
        } 
        alert(result.error_message);
      }
    });
  });
});