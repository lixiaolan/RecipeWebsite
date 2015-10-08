;; Get the patch command line arg
(setq path (elt argv 0))

;; Open the buffer containing the file
(find-file path)

;; ljj-get-between
(load-file "../ljj-scrape.el")

;; Trim end
(search-forward "<div class=categories>")
(delete-region (point) (point-max))
(goto-char (point-min))
(set-mark (point))

;; Title
(ljj-get-between "<meta property=og:title content=\"" "\"/>")
(set-mark (point))

;; Ingredients
(while (ljj-kill-up-to "<li itemprop=ingredients>" )
  (set-mark (point))
  (search-forward "</li>" nil t)
  (ljj-remove-html)
  (insert "\n")
  (set-mark (point)))

;; Directions
(insert "\n")
(set-mark (point))
(search-forward "itemprop=recipeInstructions>")
(while (ljj-kill-up-to "<p>")
  (set-mark (point))
  (search-forward "</p>" nil t)
  (ljj-remove-html)
  (insert "\n")
  (set-mark (point)))

(delete-region (point) (point-max))

(save-buffer)
