var pageModel = PageModel();

var pageController = PageController();

// Attach controller to static dom elements
$(document).ready(function () {
    $('#NewBtn').bind('click', pageController.newRecipe);
    $('#LogoutBtn').bind('click', pageController.logout);
    $('#ShowTagsBtn').bind('click', pageController.showTags);
    $('#HideTagsBtn').bind('click', pageController.hideTags);    
    $('#passwordConfirmButton').bind('click', pageController.login);
    $('#importButton').bind('click', pageController.importRecipe); 
});
