$(document).ready(function(){
    var backlog = [];
    var jqconsole = $('#hy-console').jqconsole(
        'hy ({hy_version}) [{server_software}]\n'.supplant({
            hy_version: hy_version,
            server_software: server_software
        }), "=> ", "... ");

    // Test if an input is part of a multiline input by removing all string
    // literals and then running the input through balance.js to test if
    // the parentheses and brackets are balanced.
    var multiline = function(input) {
        if (input === "") {
            return false;
        }

        // Remove all strings first
        // NOTE: this does not work correctly with backslash literals
        input = input.replace(/[^\\]".*?[^\\]"/g, "");
	var isbalanced = balanced.matches({
	    source: input,
	    open: ['{', '[', '('],
	    close: ['}', ']', ')'],
	    ignore: []
	});
        return (isbalanced.length === 0) ? -1 : false;
    }

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
        }, multiline);
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
