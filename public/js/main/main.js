$(document).ready(function() {
  $('#user_register_form, #login_form').on('submit', function(event) {
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
});