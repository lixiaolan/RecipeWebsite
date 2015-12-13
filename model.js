// Database class:
var CookBook = function(doneLoadingDelegate)
{
    // Return object
    var that = {};
    
    // Private:
    var recipes = {};

    // Load the data from the server.
    $.ajax({
        type: "GET",
        url: "recipes.json",
        success : function (data)
        {
            recipes = JSON.parse(data);
            doneLoadingDelegate();
            return;
        },
    });
    
    // Public:
    that.putRecipes = function(successDelegate) {
        $.ajax({
            type: "POST",
            url: "recipes.json",
            data : JSON.stringify(recipes),
            success : successDelegate
        });
    };

    that.getRecipeText = function(id,doneLoadingDelegate)
    {
        $.ajax({
            type: "GET",
            url: "recipes/"+id,
            success : doneLoadingDelegate
        });
    };

    that.putRecipeText = function(id,text,doneSavingDelegate)
    {
        $.ajax({
            type: "POST",
            url: "recipes/"+id,
            data : text,
            success : doneSavingDelegate
        });
    };

    that.getRecipe = function(id)
    {
        return recipes[id];
    };

    that.getRecipeTagsCopy = function(id)
    {
        var recipe = recipes[id];
        var tags = {};

        // Perform a deep copy of the js object:
        for (var tag in recipe.tags)
        {
            tags[tag] = recipe.tags[tag];
        }

        // Return the fresh copy
        return tags;
    };

    // Method to set the tags of a recipe. The method makes sure to
    // perform a copy of the input tags object.
    that.setRecipeTagsCopy = function(id, inTags)
    {
        // Clear the existing tags
        var recipe = recipes[id];
        delete recipe.tags;
        recipe.tags = {};

        // set the tags according to input
        for (var tag in inTags)
        {
            recipe.tags[tag] = null;
        }
    };
    
    that.getAllRecipes = function()
    {
        return recipes;
    };

    // Returns an unused recipe id
    that.newId = function()
    {
        // Get the smallest id not yet used
        var count = 0;
        while(1)
        {
            if (!(count in recipes)) break;
            count++;
        }

        // return count;
        return count;
    };

    // Updates or creates recipe with given id.
    that.modifyRecipe = function(id, title, tags)
    {
        // Create empty recipe if it does not exist:
        recipes[id] = recipes[id] || {};

        // Add the title and tags objects:
        recipes[id].title = title;
        recipes[id].tags = tags;

        // TODO: Save the new text based on the title

        return true;
    };

    // Change title of recipe.
    that.setTitle = function(id, title)
    {
        recipes[id].title = title;
    };

    // Change title of recipe.
    that.getTitle = function(id)
    {
        return recipes[id].title;
    };
    
    that.deleteRecipe = function(id)
    {
        delete recipes[id];
    };
    
    that.getTags = function()
    {
        // // Return a set of all tags
        // var set = {};
        // for (var key in recipes)
        // {
        //     var tags = recipes[key].tags;

        //     for (var tag in tags)
        //     {
        //         set[tag] = null
        //     }
        // }
        
        // return set;
        
        // Right now we just hard code this into the model:
        return {"appetizer" : null,
                "breakfast" : null,
                "lunch" : null,
                "dinner" : null,
                "dessert" : null,
                "crockpot" : null,
                "no cook" : null,
                "salad" : null,
                "favorite" : null };
    };

    that.getTaggedRecipes = function(inTags)
    {
        var outRecipes = {};
        for (var recipeId in recipes)
        {
            outRecipes[recipeId] = recipes[recipeId];
            for (var tagKey in inTags)
            {
                if (!recipes[recipeId].tags.hasOwnProperty(tagKey))
                {
                    delete outRecipes[recipeId];
                    break;
                }
            }
            
            // for (var tagKey in recipes[recipeId].tags)
            // {   
            //     if (inTags[tagKey] !== 1)
            //     {
            //         delete outRecipes[recipeId];
            //         break;
            //     }
            // }
        }
        return outRecipes;
    };
    
    return that;
};


// Model class for the overall page. Should contain a list of
// submodels for each recipe being viewed.
var PageModel = function ()
{
    // private:
    var that = {};

    // List of tags to show
    var selectedTags = {};
    
    // The slected Recipe(s) to display in tabs
    var selectedRecipeModels = [];

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
    };
    
    // recipe data:
    var book = CookBook(dataLoadedDelegate);
    
    // public:

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
        var recipeModel = RecipeModel(id, book);
        selectedRecipeModels.push(recipeModel);
    };

    that.removeRecipe = function(id)
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
        that.removeRecipe(id);

        // Delete the recipe from the book
        book.deleteRecipe(id);

        // Save the book to the DB
        book.putRecipes();

        // Update the view:
        updateVisibleRecipes("crap");
    }

    // Method to add new recipe
    that.newRecipe = function()
    {
        var newId = book.newId();
        book.modifyRecipe(newId,"New Recipe",{})
        book.putRecipeText(newId,"",(function () {}));
        that.addSelectedRecipe(newId);
    }
    
    // Return:
    return that;
};

// Model class for each recipe being viewed
var RecipeModel = function (recipeId, modelBook)
{
    // The id of the recipe
    var id = recipeId;

    // We want a more descriptive dom Id.
    var domId = "recipe" + id;

    // Local reference to the data bookg
    var book = modelBook;

    // Holds the recipe text. This information is not stored in the in
    // the book object directly. Instead it is saved directly to files
    // corresponding to individual recpies.
    var recpieText;

    // A local copy of the tags associated with the model. This is
    // only put into the data model when the recipe is saved.
    var tags = book.getRecipeTagsCopy(id);
    
    // The internal state of the Recipe Model is either "view" or
    // "edit".
    var state; 
    
    // Do work when done loading. This loads all of the dom elemnts
    // into the page. Then it sets the state of the the recipe model
    // to "view" which hides the un-needed dom elemnts
    var doneLoadingDelegate = function (data)
    {
        // Set the recpie text:
        recipeText = data;

        $('div.active').removeClass('active').removeClass('in');
        $('li.active').removeClass('active');

        // Get recipe:
        var recipe = book.getRecipe(id);
        
        $('#myTabsContents')
            .append('<div class="tab-pane in active" id="'+domId+'"></div>');

        var contents = $('#'+domId);

        // Add recipe View area
        contents
            .append('<div class="row"><div class="col-md-5" id="recipeView">'+recipeText+'</div></div>');

        // Add recipe text area
        contents
            .append('<div class="row"><textarea class="col-md-5" id="recipeEdit">'+recipeText+'</textarea><div class="col-md-5"><div id="recipeTags" data-toggle="buttons"></div></div>')

        // Add buttons
        contents
            .append('<div class="row"><button type="button" id="CloseBtn" class="btn btn-warning">Close</button><button type="button" id="SaveBtn" class="btn btn-primary">Save</button><button type="button" id="DeleteBtn" class="btn btn-danger">Delete</button></div>');
        
        $('#myTabs')
            .append('<li><a href="#'+domId+'">'+recipe.title+'</a></li>');

        // Make this tab clickable
        $('#myTabs a[href="#'+domId+'"]').click(
            function (e)
            {
                e.preventDefault();
                $(this).tab('show');
            });

        // Make the recipeView section mirror the text included in the
        // recipeEdit textarea. Note I had to use .bind here because
        // the element was created dynamically. For some reason, this
        // matters.
        $('#'+domId+' #recipeEdit').bind('change', function()
                                         {
                                             recipeText = $('#'+domId+' #recipeEdit').val();
                                             $('#'+domId+' #recipeView').empty();
                                             $('#'+domId+' #recipeView').append(recipeText);
                                         });
        
        // Behavior for the save button.
        $('#'+domId+' #SaveBtn').bind('click', pageController.saveRecipeFunction(id));
        
        // Close button behavior
        $('#'+domId+' #CloseBtn').bind('click', pageController.closeRecipeFunction(id));

        // Behavior for the close button
        $('#'+domId+' #DeleteBtn').bind('click', pageController.deleteRecipeFunction(id));

        // Set up the tag buttons with the appropriate handlers
        var buttons = $('#'+domId+' #recipeTags');
        buttons.empty();
        var tagsToDisplay = book.getTags();
        for (var i in tagsToDisplay)
        {
            if (tags.hasOwnProperty(i))
            {
                buttons.append('<label class="btn btn-primary active" onclick="pageController.recipeTagToggled(this,\''+i+'\',\''+id+'\');"><input type="checkbox" autocomplete="off">' + i + '</label>');
            }
            else
            {
                buttons.append('<label class="btn btn-primary" onclick="pageController.recipeTagToggled(this,\''+i+'\',\''+id+'\');"><input type="checkbox" autocomplete="off">' + i + '</label>');
            }
        }
        
        // Show the just added tab
        $('#myTabs a:last').tab('show');
    };

    // Method which defineds how we get a new title given the HTML
    // content of the recipe. Right now this simply looks for the
    // first h1 element in recipe.
    var getTitleFromHTML = function()
    {
        return $('#'+domId+" #recipeView h1").text();
    }
    
    // Make ajax call to get recipe text
    book.getRecipeText(recipeId, doneLoadingDelegate);
    
    var that = {};

    // public:

    // Method to add tags to local recipe model
    that.putTags = function(inTags)
    {
        for (var tag in inTags)
        {
            tags[tag] = null;
        }
    }
    
    // Method to remove tags from local recipe model
    that.deleteTags = function(inTags)
    {
        for (var tag in inTags)
        {
            delete tags[tag];
        }
    }
    
    // Saves recipe text to the DB and saves new title and new title
    // and tags to the database class "book".
    that.save = function()
    {
        // Since we sync up the recipe text with the recipe view, we
        // should always save the recipe text:
        book.putRecipeText(id,recipeText,(function () {alert("saved");}));

        // Update the title
        var newTitle = getTitleFromHTML();
        
        // Make sure the title isn't blank
        if (!newTitle)
        {
            newTitle = "No Title";
        }
        // Set the title
        book.setTitle(id, newTitle);

        // Set the tags
        book.setRecipeTagsCopy(id, tags);
        
        // Update the tab text accordingly:
        var tabText = $('#myTabs a[href="#'+domId+'"]');
        tabText.empty();
        tabText.append(newTitle);

    }

    that.getId = function()
    {
        return id;
    };

    that.remove = function()
    {
        $('#'+domId).remove();
        $('#myTabs a[href="#'+domId+'"]').parent().remove();
    }
    
    return that;
};

var PageController = function () {

    // Return object
    var that = {};

    // Private:

    // Public:
    that.newRecipe = function()
    {
        pageModel.newRecipe();
    };
    
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
        pageModel.removeRecipe(id);
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

    
    // Return:
    return that;
}

var pageModel = PageModel();

var pageController = PageController();

// Attach controller to static dom elements
$(document).ready(function () {
    $('#NewBtn').bind('click',pageController.newRecipe);    
});
