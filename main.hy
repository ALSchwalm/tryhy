(import [os]
        [sys]
        [StringIO [StringIO]]
        [json]
        [hy.cmdline [HyREPL run_command]]
        [hy]
        [flask [Flask redirect request render_template]])

(defclass MyHyREPL [HyREPL]
  [[evaluate (fn [self code repl]
               (setv old-stdout sys.stdout)
               (setv old-stderr sys.stderr)
               (setv fake-stdout (StringIO))
               (setv sys.stdout fake-stdout)
               (setv fake-stderr (StringIO))
               (setv sys.stderr fake-stderr)

               (if repl
                 (HyREPL.runsource self code "<input>" "single")
                 (run_command code))

               (setv sys.stdout old-stdout)
               (setv sys.stderr old-stderr)
               {"stdout" (fake-stdout.getvalue) "stderr" (fake-stderr.getvalue)})]])

(def app (Flask __name__))

(with-decorator (apply app.route ["/"] {"methods" ["GET"]})
  (fn []
    (apply render_template ["index.html"]
           {"hy_version" hy.__version__ "server_software" (get os.environ "SERVER_SOFTWARE")})
    ))

(with-decorator (apply app.route ["/eval_repl"] {"methods" ["POST"]})
  (fn []
    (let [[repl (MyHyREPL)] [input (request.get_json)]]
      (for [expr (get input "env")]
        (repl.evaluate expr True))
      (json.dumps (repl.evaluate (get input "code") True))
    )))

(with-decorator (apply app.route ["/eval_file"] {"methods" ["POST"]})
  (fn []
    (let [[repl (MyHyREPL)] [input (request.get_json)]]
      (json.dumps (repl.evaluate (get input "code") False))
    )))
