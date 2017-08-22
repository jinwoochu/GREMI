function request_ajax(type, url, data, callback) {
  $.ajax({
    url: url,
    type: type,
    data: data,
    dataType: "json",
    success: callback
  });
}