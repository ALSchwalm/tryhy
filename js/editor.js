$(document).ready(function(){
    var editor = ace.edit("hy-editor");

    // For now, just use the existing clojure mode
    editor.getSession().setMode("ace/mode/clojure")

    editor.eval = function() {
        var input = this.getValue();
        $.ajax({
            type: 'POST',
            url: '/eval',

            // eval with no environment means the execution of the
            // script will not be affected by the contents of the repl
            data: JSON.stringify({code: input, env: []}),
            contentType: 'application/json',
            dataType: 'json',
            success: function(data) {

                // Stop and start the console to force a new prompt to be printed
                var currentText = Console.GetPromptText();
                Console.ClearPromptText();
                Console.AbortPrompt();
                Console.startPrompt();
                var currentText = Console.SetPromptText(currentText);

                Console.Write(data.stdout, 'jquery-console-message-value');
                Console.Write(data.stderr, 'jquery-console-message-error');

                // Allow the repl to be able to call functions/access variables
                // defined by evalauating the contents of the editor
                Console.backlog.push(input)
            }
        });
    }

    $("#editor-run").click(function() {
        editor.eval();
    })

    $.get("/static/examples/quickstart.hy", function(data) {
        editor.insert(data);
    })
});
