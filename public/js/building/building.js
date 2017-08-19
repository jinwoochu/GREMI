$(document).ready(function() {
  $('#building_register_form').on('submit', function(event) {
    var formData = $(this).serialize();
    $.ajax({
      url: $(this).attr('action'),
      type: "POST",
      data: formData,
      dataType: "json",
      success: function(result) { 
        if (result.status == 0) {
          alert(result.error_message);
        } else {
          document.cookie = "email=" + result.key;
          window.location.href = "/news_feed";
        }
      }
    }); 
    event.preventDefault();
  });

  $('#building_menu').on('click', 'a', function(event) {
    event.preventDefault();
    $('#building_menu li').toggleClass('active');
    $('.building-content').toggleClass('hidden');
  });
});