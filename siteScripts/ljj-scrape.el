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

(defun ljj-get-between-string (start end)
  "Get text between start and end search strings (not
  including). Delete stuff from mark to start and add a new line
  right after content. Leave point before end"

  (search-forward start nil t)
  (set-mark (point))
  (search-forward end nil t)
  (buffer-substring (mark) (match-beginning 0)))

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

;; create sting processing version
(defun ljj-remove-html-in-string (string)
  "remove all html tags in string"
  (replace-regexp-in-string "<.*?>" "" string))

(defun ljj-remove-newlines-in-string (string)
  "remove all newlines in string"
  (replace-regexp-in-string "\n" "" string))

(defun ljj-remove-excess-whitespace-in-string (string)
  "remove all newlines in string"
  (replace-regexp-in-string "[[:space:]]+" " " string))

(defun ljj-recipe-string (name description ingredients directions)
  "method returns html formatted recipe based on the input"
  (setq stringList (list "<h1>" name "</h1>\n\n"))

  (if description (progn 
                    (setq stringList (append stringList (list "<h2>Description</h2>\n\n")))
                    
                    (mapcar (lambda (element)
                              (setq tempList (list "<p>" element "</p>\n"))
                              (setq stringList (append stringList tempList)))
                            description)
                    ))

  (if ingredients (progn
                    (setq stringList (append stringList (list "<h2>Ingredients</h2>\n\n<ul>\n")))
                    
                    (mapcar (lambda (element)
                              (setq tempList (list "<li>" element "</li>\n"))
                              (setq stringList (append stringList tempList)))
                            ingredients)

                    (setq stringList (append stringList (list "</ul>\n\n")))))


  (if directions (progn
                   (setq stringList (append stringList (list "<h2>Directions</h2>\n\n")))
                   
                   (mapcar (lambda (element)
                             (setq tempList (list "<p>" element "</p>\n\n"))
                             (setq stringList (append stringList tempList)))
                           directions)))

  (setq returnString "")
  
  (mapcar (lambda (element)
            (setq returnString (concat returnString element)))
          stringList)

  returnString)
