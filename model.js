var pageModel = PageModel();

var pageController = PageController();

// Attach controller to static dom elements
$(document).ready(function () {
    $('#NewBtn').bind('click',pageController.newRecipe);
    $('#LogoutBtn').bind('click',pageController.logout);
    $('#passwordConfirmButton').bind('click', pageController.login);
});
