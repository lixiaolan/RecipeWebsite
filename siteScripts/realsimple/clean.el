;; Get the patch command line arg
(setq path (elt argv 0))

;; Open the buffer containing the file
(find-file path)

;; ljj-get-between
(load-file "../ljj-scrape.el")

;; Title
(ljj-get-between "<meta property=\"og:title\" content=\"" "\" />")

;; Ingredients
(while (ljj-kill-up-to "<span class=\"ingredient-amt\">" )
  (set-mark (point))
  (search-forward "</span>" nil t 2)
  (ljj-remove-html)
  (ljj-remove-newlines)
  (ljj-remove-excess-whitespace)
  (insert "\n")
  (set-mark (point)))

;; Directions
(ljj-kill-up-to "<section class=\"directions")
(search-forward "<section class=\"directions")
(set-mark (point))
(ljj-get-between "<ol>" "</ol>")

(delete-region (point) (point-max))

(goto-char (point-min))
(search-forward "<section class=\"directions")
(goto-char (match-beginning 0))
(set-mark (point))

(while (ljj-get-between "<li>" "</li>"))

(delete-region (point) (point-max))

(save-buffer)
