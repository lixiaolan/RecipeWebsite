(defun ljj-get-between (start end)
  "Get text between start and end search strings (not
  including). Delete stuff from mark to start and add a new line
  right after content. Leave point before end"

  (set-mark (point))
  
  (let (savePoint firstBool secondBool firstPos)
    (setq savePoint (point))
    (setq firstBool (search-forward start nil t))
    (setq firstPos (point))
    (setq secondBool (search-forward end nil t))

    (if (and firstBool secondBool)
        (progn
          (goto-char (match-beginning 0))
          (delete-region (mark) firstPos)
          (insert "\n")
          (set-mark (point))
          t)
      (goto-char savePoint)
      nil)))

(defun ljj-kill-up-to (string)
  "Kill everything up to but not including string"
  (if (search-forward string nil t)
      (progn 
        (goto-char (match-beginning 0))
        (delete-region (mark) (point))
        t)
    nil))

(defun ljj-remove-html ()
  "remove all html tags in region"
  (save-excursion
    (replace-regexp "<.*?>" "" nil (point) (mark))))

(defun ljj-remove-newlines ()
  "remove all newlines in region"
  (save-excursion
    (replace-regexp "\n" "" nil (point) (mark))))

(defun ljj-remove-excess-whitespace ()
  "remove all newlines in region"
  (save-excursion
    (replace-regexp "[[:space:]]+" " " nil (point) (mark))))
