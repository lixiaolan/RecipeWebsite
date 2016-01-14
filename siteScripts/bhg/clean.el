;; Get the patch command line arg
(setq path (elt argv 0))

;; Open the buffer containing the file
(find-file path)

;; ljj-get-between
(load-file "../ljj-scrape.el")

;; Title
(ljj-get-between
 "<meta property=\"og:title\" content=\""
 "\">")

;; Ingredients
(while (ljj-kill-up-to "<li class=\"ingredient\"" )
  (set-mark (point))
  (search-forward "</li>" nil t)
  (ljj-remove-html)
  (ljj-remove-newlines)
  (ljj-remove-excess-whitespace)
  (insert "\n")
  (set-mark (point)))

;; Directions
(while (ljj-kill-up-to "<span itemprop=\"recipeInstructions\">" )
  (set-mark (point))
  (search-forward "</span>" nil t)
  (ljj-remove-html)
  (ljj-remove-newlines)
  (ljj-remove-excess-whitespace)
  (insert "\n")
  (set-mark (point)))

;; Kill the rest
(delete-region (point) (point-max))

(save-buffer)
