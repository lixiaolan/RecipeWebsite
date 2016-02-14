;; Get the patch command line arg
(setq path (elt argv 0))

;; Open the buffer containing the file
(find-file path)

;; ljj-get-between
(load-file "../ljj-scrape.el")

;; Define variables
(setq name nil)
(setq description '())
(setq ingredients '())
(setq directions '())

;; Title
(setq name
      (ljj-remove-excess-whitespace-in-string
       (ljj-remove-html-in-string
        (ljj-get-between-string-and-endpoints "<h1 class=\"entry-title" "</h1>"))))

(save-excursion
  (setq endPoint (search-forward "<ul>")))

(while (re-search-forward "<p>\\([[:unibyte:]]*\\)</p>" endPoint t)
  (setq temp (ljj-remove-html-in-string (match-string 1)))
  (unless (string= temp "Ingredients:")
    (setq description (append description (list temp)))))

(save-excursion
  (setq endPoint (search-forward "</ul>")))

(while (re-search-forward "<li>\\([[:unibyte:]]*\\)</li>" endPoint t)
  (setq ingredients (append ingredients (list (ljj-remove-html-in-string (match-string 1))))))

(save-excursion
  (setq endPoint (search-forward "<div")))

(while (re-search-forward "<li>\\([[:unibyte:]]*\\)</li>" endPoint t)
  (setq directions (append directions (list (ljj-remove-html-in-string (match-string 1))))))

;; Kill the rest
(delete-region (point-min) (point-max))

(insert (ljj-recipe-string name description ingredients directions))

(save-buffer)


