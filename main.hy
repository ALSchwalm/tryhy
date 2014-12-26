(import [os]
        [sys]
        [StringIO [StringIO]]
        [json]
        [hy.cmdline [HyREPL run_command]]
        [hy]
        [traceback]
        [flask [Flask redirect request render_template]])

(defclass MyHyREPL [HyREPL]
  [[evaluate (fn [self script repl]
               (setv code (get script "code"))
               (setv input (get script "input"))
               (setv old-stdout sys.stdout)
               (setv old-stderr sys.stderr)
               (setv old-stdin  sys.stdin)
               (setv fake-stdout (StringIO))
               (setv sys.stdout fake-stdout)
               (setv fake-stderr (StringIO))
               (setv sys.stderr fake-stderr)
               (setv fake-stdin (StringIO input))
               (setv sys.stdin fake-stdin)

               (if repl
                 (HyREPL.runsource self code "<input>" "single")
                 (try (run_command code)
                      (catch [_ Exception]
                        (sys.stderr.write (traceback.format_exc)))))

               (setv sys.stdout old-stdout)
               (setv sys.stderr old-stderr)
               (setv sys.stdin  old-stdin)
               {"stdout" (fake-stdout.getvalue)
                "stderr" (fake-stderr.getvalue)})]])

(def app (Flask __name__))

(with-decorator (apply app.route ["/"] {"methods" ["GET"]})
  (fn []
    (apply render_template ["index.html"]
           {"hy_version" hy.__version__
            "server_software" (get os.environ "SERVER_SOFTWARE")})))

(with-decorator (apply app.route ["/about.html"] {"methods" ["GET"]})
  (fn []
    (apply render_template ["about.html"]{ "title" "About this website" })))

(with-decorator (apply app.route ["/eval_repl"] {"methods" ["POST"]})
  (fn []
    (let [[repl (MyHyREPL)] [input (request.get_json)]]
      (for [expr (get input "env")]
        (repl.evaluate expr true))
      (json.dumps (repl.evaluate input true)))))

(with-decorator (apply app.route ["/eval_script"] {"methods" ["POST"]})
  (fn []
    (let [[repl (MyHyREPL)] [script (request.get_json)]]
      (json.dumps (repl.evaluate script false)))))
