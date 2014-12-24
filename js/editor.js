$(document).ready(function(){
    Editor = ace.edit("hy-editor");

    // For now, just use the existing clojure mode
    Editor.getSession().setMode("ace/mode/clojure")

    Editor.loadExample = function(fileName) {
        $.ajax({
            url: "/static/examples/"+fileName,
            success: function(data) {
                Editor.getSession().setValue(data);
            },
            error: function(error) {
                  console.log(error);
                  Util.error("Unable to load " + fileName + " from server.");
            }});
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
                Console.ClearPromptText();
                Console.AbortPrompt()
                Console.startPrompt();
                var currentText = Console.SetPromptText(currentText);

                Console.Write(data.stdout, 'jquery-console-message-value');
                Console.Write(data.stderr, 'jquery-console-message-error');
                Console.scrollToBottom();

                // Allow the repl to be able to call functions/access variables
                // defined by evalauating the contents of the editor
                Console.backlog.push(input)
            },
            error: function(error) {
                Util.error("Unable to execute script.");
            }
        });
    }

    $("#editor-run").click(function() { Editor.eval(); });

    // Fade in/out the run button
    $("#hy-editor")
        .mouseleave(function(){ return $("#editor-run").fadeIn("fast"); })
         .mousemove(function(){ return $("#editor-run").fadeIn("fast"); })
           .keydown(function(){ return $("#editor-run").fadeOut("fast"); });

    // Automatically load the first example into the editor
    $(".example").click(function(e){
        e.preventDefault();
        Editor.loadExample($(this).attr("href"));
        $(".example").parent().removeClass("active");
        $(this).parent().addClass("active");
    }).first().click();
});
