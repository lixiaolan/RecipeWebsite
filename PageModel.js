// Model class for the overall page. Should contain a list of
// submodels for each recipe being viewed.
var PageModel = function ()
{
    // private:
    var that = {};

    // login state boolean
    var loginState = false;

    // boolean to indicate if the tags are showing
    var tagsShowing = false;
    
    // List of tags to show
    var selectedTags = {};

    // The slected Recipe(s) to display in tabs
    var selectedRecipeModels = [];

    var defaultRecipeText = "<h1>Title</h1>\n\n<h2>Description</h2>\n<p>Text</p>\n\n<h2>Ingredients</h2>\n\n<ul>\n<li>Thing One</li>\n<li>Thing Two</li>\n</ul>\n\n<h2>Instructions</h2>\n\n<ul>\n<li>Step One</li>\n<li>Step Two</li>\n</ul>";
    
    // Function to show a list of visible recipes based on the filters
    var updateVisibleRecipes = function(searchString)
    {
        // Make sure the data is loaded
        if (!book) return;

        var recipesToDisplay  = book.getTaggedRecipes(selectedTags);

        $('#recipeList').empty();
        
        for (var i in recipesToDisplay)
        {
            $('#recipeList').append('<li><a onclick="pageController.openRecipe('+i+')">' + recipesToDisplay[i].title + '</a></li>');
        }        
    };

    // Function to show a list of visible recipes based on the filters
    var updateVisibleTags = function()
    {
        // Make sure the data is loaded
        if (!book) return;
        
        $('#tagList').empty();

        var tagsToDisplay = book.getTags();
        
        for (var i in tagsToDisplay)
        {
            $('#tagList').append('<label class="btn btn-primary" onclick="pageController.tagToggled(this,\''+i+'\');"><input type="checkbox" autocomplete="off">'+i+'</label>');
        }        
    };
    
    // Called when data is loaded from the database
    var dataLoadedDelegate = function()
    {
        updateVisibleRecipes("BLANK");
        updateVisibleTags();
        switchToLoginState();
        updateTagsShowing();
    };
    
    // recipe data:
    var book = CookBook(dataLoadedDelegate);

    // Switch to current loginstate
    var switchToLoginState = function()
    {
        // Update all recipe models
        selectedRecipeModels.map(
            function(recipe) {
                recipe.setEditMode(loginState);
            });

        // Update page model
        if (loginState)
        {
            $('#NewBtn').removeClass('hidden');
            $('#LogoutBtn').removeClass('hidden');
            $('#LoginBtn').addClass('hidden');
        }
        else
        {
            $('#NewBtn').addClass('hidden');
            $('#LogoutBtn').addClass('hidden');
            $('#LoginBtn').removeClass('hidden');            
        }
    }

    var passedSecurity = function(successBool)
    {
        if (successBool)
        {
            loginState = true;
        }
        else
        {
            loginState = false;
        }
        switchToLoginState();
    }

    var updateTagsShowing = function()
    {
        if (tagsShowing)
        {
            // Show correct button
            $('#HideTagsBtn').removeClass('hidden');
            $('#ShowTagsBtn').addClass('hidden');

            // Show the tags div
            $('#tagListDiv').removeClass('hidden');
        }
        else
        {
            // Show correct button
            $('#HideTagsBtn').addClass('hidden');
            $('#ShowTagsBtn').removeClass('hidden');

            // Hide the tags div
            $('#tagListDiv').addClass('hidden');
        }
    }
    
    // public:

    that.setTagsShowing = function(inputBool)
    {
        tagsShowing = inputBool;
        updateTagsShowing();
    }

    that.importRecipe = function(importURL)
    {
        book.importRecipe(importURL, function (body) {
            that.newRecipe(body);
        });
    }
    
    // Method to handle the login
    that.login = function (password)
    {
        // Check security and specify callback of "passedSecurity"
        book.setPassword(password);
        book.testSecurity(passedSecurity);
    }        

    // Method to handle the logout
    that.logout = function ()
    {
        book.setPassword("");
        loginState = false;
        switchToLoginState();
    }
    
    // Method to get a recipe object given an id
    that.getRecipeById = function(id)
    {
        for (var i = 0; i < selectedRecipeModels.length; i++)
        {
            if (selectedRecipeModels[i].getId() === id)
                return selectedRecipeModels[i];
        }
    }
    
    that.hasRecipeModel = function(id)
    {
        for (var i = 0; i < selectedRecipeModels.length; i++)
        {
            if (selectedRecipeModels[i].getId() === id) return true;
        }
        return false;
    }
    
    // Add a selected tag
    that.putSelectedTags = function(tags)
    {
        
        for (var i in tags)
        {
            selectedTags[i] = null;
        }

        updateVisibleRecipes("crap");
    };

    that.deleteSelectedTags = function(tags)
    {
        for (var i in tags)
        {
            delete selectedTags[i];
        }

        updateVisibleRecipes("crap");
    };
    
    // Add a selected tag
    that.putRecipeTags = function(tags, id)
    {
        var recipe = that.getRecipeById(id);
        
        recipe.putTags(tags);        
    };

    that.deleteRecipeTags = function(tags, id)
    {
        var recipe = that.getRecipeById(id);

        recipe.deleteTags(tags);
    };

    that.addSelectedRecipe = function(id)
    {
        // Pass the the doneLoadingDelegate of "switchToLoginState" so
        // that the state of the newly created recipe model is set
        // correctly upon loading
        var recipeModel = RecipeModel(id, book, switchToLoginState);
        selectedRecipeModels.push(recipeModel);
    };

    that.removeSelectedRecipe = function(id)
    {
        for (var i = 0; i < selectedRecipeModels.length; i++)
        {
            if (selectedRecipeModels[i].getId() === id) break;
        }

        selectedRecipeModels[i].remove();
        selectedRecipeModels.splice(i,1);

        // Show the last remaining tab (if any):
        $('#myTabs a:last').tab('show');
    }

    that.saveRecipe = function(id)
    {
        // Find and save the selected recipe
        var recipe = that.getRecipeById(id);

        recipe.save();

        // Save the book
        book.putRecipes();

        // Since a title may have changed, we update visible recipes.
        updateVisibleRecipes("crap");
    }

    // Delete recipe from the model.
    that.deleteRecipe = function(id)
    {
        // First remove the recipe (if applicable)
        that.removeSelectedRecipe(id);

        // Delete the recipe from the book
        book.deleteRecipe(id);

        // Save the book to the DB
        book.putRecipes();

        // Update the view:
        updateVisibleRecipes("crap");
    }

    // Method to add new recipe
    that.newRecipe = function(recipeText)
    {
        var newId = book.newId();

        book.putRecipeText(newId,
                           recipeText || defaultRecipeText,
                           function (body)
                           {
                               if (body !== "no")
                               {
                                   book.modifyRecipe(newId,"Title",{})
                                   that.addSelectedRecipe(newId);
                                   updateVisibleRecipes("crap");
                               }
                           }
                          );
    }
    
    // Return:
    return that;
};
