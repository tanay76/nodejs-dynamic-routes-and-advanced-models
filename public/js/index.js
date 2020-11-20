$(function() {
  $('#ok_btn').on('click', function() {
    console.log('Button clicked');
    $('.user-message--success').css('display', 'none');
  })
});