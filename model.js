var cookBook = function(doneLoadingDelegate)
{
    // Return object
    var that = {};
    
    // Private:
    var recipes = {};

    // Load the data from the server.
    var loadRecipes = $.ajax("")
        .done(function ()
              {
                  $.parseJSON(loadRecipes.responseText);
                  doneLoadingDelegate();
                  return;
              }
             );    

    // Public:
    that.getRecipes = function()
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
                set[tag] = 1;
            }
        }
        
        var array = [];
        for (var key in set)
        {
            array.push(key);
        }

        return array.sort();
    };

    that.getRecipes = function(inTags)
    {
        outRecipes = {};
        for (var recipeId in recipes)
        {
            for (var tagKey in recipes[recipeId].tags)
            {
                if (inTags[tagKey])
                    outRecipes[recipeId] = recipes[recipeId];
            }
        }
        return outRecipes;
    };
    
    return that;
}

var recipes =
    {
        6 : {
            "title" : "<title string>",
            "tags" :
            {
                "a" : 1,
                "r" : 1,
                "d" : 1,
            },
        },
        5 : {
            "title" : "yabababab",
            "tags" :
            {
                "c" : 1,
                "d" : 1,
            }
        },
    };


var test = cookBook(recipes);

var title = "Recipe One";
var tags = {"d" : 1, "e" : 1};
var text = "this is the full text of the recipe";

test.modifyRecipe(test.newId(),title, tags, text);

console.log(test.getTags());
console.log(test.getRecipes({"a" : 1, "d" : 1}));


// Not sure if I need this:

// "tags":
// [
//     {
//         "id" : "<string name>",
//         "recipes" : [
//             "recipeId1",
//             "recipeId2",
//             "recipeId3"]
//     }
// ]
