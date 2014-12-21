$(document).ready(function(){
    Console = $('#hy-console').jqconsole(
        'hy ({hy_version}) [{server_software}]\n'.supplant({
            hy_version: hy_version,
            server_software: server_software
        }), "=> ", "... ");
    Console.backlog = [];

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
            balance : true
	});
        return (isbalanced === null) ? 0 : false;
    }

    Console.startPrompt = function() {
        Console.Prompt(true, function(input) {
            $.ajax({
                type: 'POST',
                url: '/eval',
                data: JSON.stringify({code: input, env: Console.backlog}),
                contentType: 'application/json',
                dataType: 'json',
                success: function(data) {
                    Console.Write(data.stdout, 'jquery-console-message-value');
                    Console.Write(data.stderr, 'jquery-console-message-error');
                    Console.backlog.push(input);
                    Console.startPrompt();
                    Console.scrollToBottom();
                }
            });
        }, multiline);
    };

    Console.scrollToBottom = function() {
        $(".jqconsole").scrollTop($(".jqconsole")[0].scrollHeight);
    }

    $("#hy-console :input").keydown(function(){
        Console.scrollToBottom();
    });

    Console.RegisterShortcut('E', function() {
        this.MoveToEnd();
    });

    Console.RegisterShortcut('A', function() {
        this.MoveToStart();
    });

    Console.startPrompt();
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
