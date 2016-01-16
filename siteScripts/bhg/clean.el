;; Get the patch command line arg
(setq path (elt argv 0))

;; Open the buffer containing the file
(find-file path)

(load-file "../ljj-scrape.el")

(setq name nil)
(setq description '())
(setq ingredients '())
(setq directions '())

;; name
(setq name
 (ljj-get-between-string
  "<meta property=\"og:title\" content=\""
  "\">"))

;; Ingredients
(while (search-forward "<li class=\"ingredient\"" nil t )
  (set-mark (match-beginning 0))
  (search-forward "</li>" nil t)
  (setq ingredient
        (ljj-remove-excess-whitespace-in-string
         (ljj-remove-newlines-in-string
          (ljj-remove-html-in-string 
           (buffer-substring (mark) (point))))))
  (setf ingredients (append ingredients (list ingredient))))

(search-forward "<ol class=\"directions\"" nil t)

;; Directions
(while (search-forward "<li itemprop=\"itemListElement\">" nil t )
  (set-mark (match-beginning 0))
  (search-forward "</li>" nil t)
  (setq direction
        (ljj-remove-excess-whitespace-in-string
         (ljj-remove-newlines-in-string
          (ljj-remove-html-in-string 
           (buffer-substring (mark) (point))))))
  (setf directions (append directions (list direction))))

(delete-region (point-min) (point-max))

(insert (ljj-recipe-string name description ingredients directions))

(save-buffer)
