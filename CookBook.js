// Database class:
var CookBook = function(doneLoadingDelegate)
{
    // Return object
    var that = {};
    
    // Private:
    var recipes = {};

    // Password
    var password = "";

    // Delegate used during password checking
    var passedDelegate;
    
    // Load the data from the server.
    $.ajax({
        type: "GET",
        url: "recipes/recipes.json",
        success : function (data)
        {
            recipes = JSON.parse(data);
            doneLoadingDelegate();
            return;
        },
    });

    var onTestSecurity = function(body)
    {
        if (body === "yes")
        {
            passedDelegate(true);
        }
        else
        {
            passedDelegate(false);
        }
    }

    // Public:
    that.getRecipeText = function(id,successDelegate)
    {
        $.ajax({
            type: "GET",
            url: "recipes/"+id,
            success : successDelegate
        });
    };

    that.importRecipe = function(url, successDelegate)
    {
        $.ajax({
            type: "GET",
            url: "import",
            success: successDelegate,
            data: url,
        });
    };
    
    that.testSecurity = function(delegate)
    {
        // Store the delegate to be called in the onTestSecurity
        // callback:
        passedDelegate = delegate;
        
        $.ajax({
            type: "GET",
            url: "security",
            beforeSend: function (xhr)
            {
                xhr.setRequestHeader('Authorization', password);
            },
            success : onTestSecurity
        });
    };

    that.putRecipes = function(successDelegate) {
        $.ajax({
            type: "POST",
            url: "recipes/recipes.json",
            beforeSend: function (xhr)
            {
                xhr.setRequestHeader('Authorization', password);
            },
            data : JSON.stringify(recipes),
            success : successDelegate
        });
    };

    that.putRecipeText = function(id,text,successDelegate)
    {
        $.ajax({
            type: "POST",
            url: "recipes/"+id,
            beforeSend: function (xhr)
            {
                xhr.setRequestHeader('Authorization', password);
            },
            data : text,
            success : successDelegate
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
                "lunch"     : null,
                "dinner"    : null,
                "dessert"   : null,
                "crockpot"  : null,
                "no cook"   : null,
                "salad"     : null,
                "favorite"  : null };
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

    that.setPassword = function(input)
    {
        password = input||"";
    };
    
    return that;
};
