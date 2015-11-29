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
    that.saveRecipes = function(successDelegate) {
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

    that.getRecipe = function(id)
    {
        return recipes[id];
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
        return count.toString();
    };

    // Updates or creates recipe with given id.
    that.modifyRecipe = function(id, title, tags, text)
    {
        // Create empty recipe if it does not exist:
        recipes[id] = recipes[id] || {};

        // Add the title and tags objects:
        recipes[id].title = title;
        recipes[id].tags = tags;

        // TODO: Save the new text based on the title

        return true;
    };

    that.deleteRecipe = function(id)
    {
        delete recipes[id];

        // TODO: Do work to update the database
    };
    
    that.getTags = function()
    {
        // Return a set of all tags
        var set = {};
        for (var key in recipes)
        {
            var tags = recipes[key].tags;

            for (var tag in tags)
            {
                set[tag] = null
            }
        }
        
        return set;
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

// Model class for each recipe being viewed
var RecipeModel = function (recipeId, modelBook)
{
    var id = recipeId;

    // We want a more descriptive dom Id.
    var domId = "recipe" + id;
    
    var book = modelBook;

    var recpieText;

    // Do work when done loading
    var doneLoadingDelegate = function (data)
    {
        recipeText = data;
        $('div.active').removeClass('active').removeClass('in');
        $('li.active').removeClass('active');

        // Get recipe:
        var recipe = book.getRecipe(id);
        
        $('#myTabsContents')
            .append('<div class="tab-pane in active" id="'+domId+'">'+recipeText+'</div>');
        $('#myTabs')
            .append('<li><a href="#'+domId+'">'+recipe.title+'</a></li>');
        
        
        $('#myTabs a:last').tab('show');
  
    };

    // Make ajax call to get recipe text
    book.getRecipeText(recipeId, doneLoadingDelegate);
    
    var that = {};

    // public:
    that.getId = function()
    {
        return id;
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
            $('#tagList').append('<label class="btn btn-primary" onclick="pageController.tagToggled(this);"><input type="checkbox" autocomplete="off">' + i + '</label>');
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

    that.addSelectedRecipe = function(id)
    {
        var recipeModel = RecipeModel(id, book);
        selectedRecipeModels.push(recipeModel);
    };
    
    // Return:
    return that;
};

var PageController = function () {

    // Return object
    var that = {};
    
    // Private:
    
    // Public:
    
    that.tagToggled = function(element)
    {
        var tags = {};
        tags[element.textContent] = null;
        
        if (element.className === "btn btn-primary")
        {
            pageModel.putSelectedTags(tags);
        }
        else
        {
            pageModel.deleteSelectedTags(tags);
        }        
    }

    that.openRecipe = function(id)
    {
        pageModel.addSelectedRecipe(id);
    }
    
    // Return:
    return that;
}

var pageModel = PageModel();

var pageController = PageController();
