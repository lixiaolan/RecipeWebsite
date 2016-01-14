;; Load the test file
(load-file "ljj-scrape.el")

(setq test (make-recipe))

(setf (recipe-name test) "bla")

(message (recipe-name test))
