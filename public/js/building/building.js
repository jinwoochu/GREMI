$(document).ready(function() {
  $('#building_register_form').on('submit', function(event) {
    event.preventDefault();

    var formData = new FormData();

    var images = []
    $.each($(".files")[0].files, function (key, file){
      images.push(file);
    });  

    formData.append('images', images);

    $.each($(this).serializeArray(), function (i, obj) {
      formData.append(obj.name, obj.value)
    });
    
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
    
  });

  $('#building_menu').on('click', 'a', function(event) {
    event.preventDefault();
    $('#building_menu li').toggleClass('active');
    $('.building-content').toggleClass('hidden');
  });
});