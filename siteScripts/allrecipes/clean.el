
;; Get the patch command line arg
(setq path (elt argv 0))

;; Open the buffer containing the file
(find-file path)

;; ljj-get-between
(load-file "../ljj-scrape.el")

;; Title
(ljj-get-between "<meta property=\"og:title\" content=\"" " Recipe\" />")

;; Ingredients
(while (ljj-get-between "itemprop=\"ingredients\">" "</span>"))

;; Directions
(while (ljj-get-between "<span class=\"recipe-directions__list--item\">" "</span>"))

;; Kill the rest
(delete-region (point) (point-max))

(save-buffer)


