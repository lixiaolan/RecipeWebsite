// 
var PageController = function ()
{
    // Return object
    var that = {};

    // Private:
    var viewState = 0;
    
    // Public:
    that.searchStringChanged = function()
    {
        var searchString = $('#searchString').val();
        pageModel.setSearchString(searchString);
    };

    that.newRecipe = function()
    {
        pageModel.newRecipe();
    };

    that.login = function ()
    {
        var password = $('#passwordInput').val();
        $('#passwordInput').val("");
        pageModel.login(password);
    }

    that.importRecipe = function()
    {
        var importURL = $('#importURL').val();
        $('#importURL').val("");
        pageModel.importRecipe(importURL);
    }
    
    that.logout = function ()
    {
        pageModel.logout();
    }
    
    // Method to  handle a tag  being toggeled in the  recipe slection
    // section of the website.
    that.tagToggled = function(element, tag)
    {
        var tags = {};
        tags[tag] = null;

        if (element.className === "btn btn-primary")
        {
            pageModel.putSelectedTags(tags);
        }
        else
        {
            pageModel.deleteSelectedTags(tags);
        }     
    }

    // Method to  handle a tag  being toggeled in the  recipe slection
    // section of the website.
    that.recipeTagToggled = function(element, tag, id)
    {
        var tags = {};
        tags[tag] = null;

        var intId = parseInt(id, 10);
        
        if (element.className === "btn btn-primary")
        {
            pageModel.putRecipeTags(tags, intId);
        }
        else
        {
            pageModel.deleteRecipeTags(tags, intId);
        }
    }
    
    // Method to handle when user wants to add a recipe.
    that.openRecipe = function(id)
    {
        // First check that the recipe is not already open
        if (!pageModel.hasRecipeModel(id))
        {
            pageModel.addSelectedRecipe(id);
        }
    }

    // Called when a recipe is closed
    that.closeRecipe = function(id)
    {        
        pageModel.removeSelectedRecipe(id);
    }

    // Called when a recipe is saved
    that.saveRecipe = function(id)
    {        
        pageModel.saveRecipe(id);
    }

    // Called when deleting a recipe
    that.deleteRecipe = function(id)
    {
        pageModel.deleteRecipe(id);
    }
    
    // Called when a recipe is closed
    that.closeRecipeFunction = function(id)
    {
        return function()
        {
            that.closeRecipe(id);
        }
    }

    // Called when a recipe is saved
    that.saveRecipeFunction = function(id)
    {
        return function()
        {
            that.saveRecipe(id);
        }
    }

    // Called when a recipe is closed
    that.deleteRecipeFunction = function(id)
    {
        return function()
        {
            that.deleteRecipe(id);
        }
    }

    that.toggleView = function()
    {
        viewState = ((viewState + 1) % 3);
        if (viewState == 0)
        {
            $('#recipeListCollapsable').collapse("show");
            $('#tagListCollapsable').collapse("hide");
            return;
        }
        if (viewState == 1)
        {
            $('#recipeListCollapsable').collapse("show");
            $('#tagListCollapsable').collapse("show");
            return;
        }
        if (viewState == 2)
        {
            $('#recipeListCollapsable').collapse("hide");
            $('#tagListCollapsable').collapse("hide");
            return;
        }
    }
    
    // Return:
    return that;
}
