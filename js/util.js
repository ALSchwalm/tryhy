
function Util(){}

/*
 * Insert a div showing an error message, styled as a boostrap "alert".
 * Duplicate messages are ignored.
 */
Util.error = function(message) {
    var html =
    '<div class="alert alert-danger alert-dismissible" role="alert"> \
       <button type="button" class="close" data-dismiss="alert" aria-label="Close"> \
       <span aria-hidden="true">&times;</span></button> \
       <strong>Error!</strong> <span class="alert-message">' + message + '<\span>' +
    '</div>';

    var duplicate = $('.alert-message').map(function(){
        return $(this).text();
    }).toArray().indexOf(message) != -1;

    if (!duplicate) {
        $('#alert').append($(html));
    }
}
