$(document).ready(function(){
    var backlog = [];
    var jqconsole = $('#hy-console').jqconsole(
        'hy ({hy_version}) [{server_software}]\n'.supplant({
            hy_version: hy_version,
            server_software: server_software
        }), "=>", "... ");

    var startPrompt = function() {
        jqconsole.Prompt(true, function(input) {
            $.ajax({
                type: 'POST',
                url: '/eval',
                data: JSON.stringify({code: input, env: backlog}),
                contentType: 'application/json',
                dataType: 'json',
                success: function(data) {
                    jqconsole.Write(data.stdout, 'jquery-console-message-value');
                    jqconsole.Write(data.stderr, 'jquery-console-message-error');
                    backlog.push(input);
                    startPrompt();
                }
            });
        });
    };
    startPrompt();

    jqconsole.RegisterShortcut('E', function() {
        this.MoveToEnd();
    });

    jqconsole.RegisterShortcut('A', function() {
        this.MoveToStart();
    });
});


if (!String.prototype.supplant) {
    String.prototype.supplant = function (o) {
        return this.replace(
            /\{([^{}]*)\}/g,
            function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    };
}
