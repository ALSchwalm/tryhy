$(document).ready(function(){
    Editor = ace.edit("hy-editor");

    // For now, just use the existing clojure mode
    Editor.getSession().setMode("ace/mode/clojure")

    Editor.loadExample = function(fileName) {
        $.get("/static/examples/"+fileName, function(data) {
            Editor.getSession().setValue(data);
        });
    }

    Editor.eval = function() {
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
                Console.ClearPromptText().AbortPrompt().startPrompt();
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
        Editor.eval();
    })

    $(".example").click(function(e){
        e.preventDefault();
        Editor.loadExample($(this).attr("href"));
    }).first().click();
});
