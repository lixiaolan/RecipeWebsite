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
(setq name (ljj-get-between-string "<meta property=\"og:title\" content=\"" " Recipe\" />"))

;; Ingredients
(while (setq ingredient (ljj-get-between-string "itemprop=\"ingredients\">" "</span>"))
  (setq ingredient
        (ljj-remove-excess-whitespace-in-string
         (ljj-remove-newlines-in-string
          (ljj-remove-html-in-string 
           ingredient))))
  (setq ingredients (append ingredients (list ingredient))))

;; Directions
(while (setq direction (ljj-get-between-string "<span class=\"recipe-directions__list--item\">" "</span>"))
  (setq direction
        (ljj-remove-excess-whitespace-in-string
         (ljj-remove-newlines-in-string
          (ljj-remove-html-in-string 
           direction))))
  (setq directions (append directions (list direction))))

;; Kill the rest
(delete-region (point-min) (point-max))

(insert (ljj-recipe-string name description ingredients directions))

(save-buffer)


