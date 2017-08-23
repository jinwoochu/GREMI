$(document).ready(function() {
  $('.confirm-building').on('click', function(event) {
    event.preventDefault();
    
    var data = new FormData();
    
    data.append('b_id', $(this).data('building-id'));

    $.ajax({
      url: '/admin/building/confirm',
      type: 'POST',
      data: data,
      contentType: false,
      processData: false,
      dataType: "json",
      success: function(result) {
        if (result.status == 0) {
          alert(result.error_message);
        } else {
          window.location.href = "/admin/building";
        }
      } 
    });
  });
});