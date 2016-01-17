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

;; Trim end
(search-forward "<div class=\"categories\">" nil t)
(delete-region (point) (point-max))
(goto-char (point-min))

;; Title
(setq name (ljj-get-between-string "<title>" "</title>"))

;; Ingredients
(while (search-forward "<li itemprop=\"ingredients\">" nil t )
  (set-mark (match-beginning 0))
  (search-forward "</li>" nil t)
  (setq ingredient
        (ljj-remove-excess-whitespace-in-string
         (ljj-remove-newlines-in-string
          (ljj-remove-html-in-string 
           (buffer-substring (mark) (point))))))
  (setf ingredients (append ingredients (list ingredient))))

;; Move forward
(search-forward "itemprop=\"recipeInstructions\">" nil t)

;; Directions
(while (search-forward "<p>" nil t )
  (set-mark (match-beginning 0))
  (search-forward "</p>" nil t)
  (setq direction
        (ljj-remove-excess-whitespace-in-string
         (ljj-remove-newlines-in-string
          (ljj-remove-html-in-string 
           (buffer-substring (mark) (point))))))
  (setf directions (append directions (list direction))))

;; Clear file and insert recipe html
(delete-region (point-min) (point-max))

(insert (ljj-recipe-string name description ingredients directions))

(save-buffer)
