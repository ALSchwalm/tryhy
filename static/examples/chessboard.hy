; An example stolen shamelessly from a Clojure page:
; Let's list all the blocks of a Chessboard:

; You can import python modules directly
(import [pprint [pprint]])

; list comprehensions work too, in python this would be
; pprint([(x,y) for x in range(1, 9) for y in "ABCDEFGH"])
(pprint (list-comp (, x y)
                   (x (range 1 9)
                      y "ABCDEFGH")))
