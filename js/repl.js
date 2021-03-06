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
        Console.Prompt(true, function(code) {
            var input = $('#editor-input').val();
            $.ajax({
                type: 'POST',
                url: '/eval_repl',
                data: JSON.stringify({code: code, input: input,
                                      env: Console.backlog}),
                contentType: 'application/json',
                dataType: 'json',
                success: function(data) {
                    Console.Write(data.stdout, 'jquery-console-message-value');
                    Console.Write(data.stderr, 'jquery-console-message-error');
                    Console.backlog.push({code: code, input: input});
                    Console.startPrompt();
                    Console.scrollToBottom();
                },
                error: function(data) {
                    Util.error("Unable to evaluate line.");
                    Console.startPrompt();
                }
            });
        }, multiline);
    };

    Console.scrollToBottom = function() {
        $(".jqconsole").scrollTop($(".jqconsole")[0].scrollHeight);
    }

    Console.toggleRetroView = function() {
        if (!$(".retro").length) {
            $("#editor-container").hide();
            $("#repl-editor-container").addClass("retro");
        } else {
            $("#editor-container").show();
            $(".retro").removeClass("retro");
        }
    }

    // Connect the style dropdown menu
    $(".style").click(function(e){
        e.preventDefault();
        Console.toggleRetroView();
        $(".style").parent().removeClass("active");
        $(this).parent().addClass("active");
    })

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
