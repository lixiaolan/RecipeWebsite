var cookBook = function(recipesObj)
{
    // Return object
    var that = {};
    
    // Private:
    var recipes = recipesObj;
    
    var newId = function()
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

    // Public:
    that.getRecipes = function()
    {
        return recipes;
    };
    
    that.addRecipe = function(title, tags, text)
    {
        var Id = newId();
        var recipe = {};

        recipe.title = title;
        recipe.tags = tags;
        recipes[Id] = recipe;

        // TODO: Save new recipe obj and text to DB
        
        return newId;
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
                set[tag] = null;
            }
        }
        
        var array = [];
        for (var key in set)
        {
            array.push(key);
        }

        return array.sort();
    };

    return that;
}

var recipes = {
    6 : {
        "title" : "<title string>",
        "tags" :
        {
            "a" : null,
            "r" : null,
            "d" : null,
        },
    },
}

var test = cookBook(recipes);

var title = "Recipe One";
var tags = {"d" : null, "e" : null};
var text = "this is the full text of the recipe";

test.addRecipe(title, tags, text);

console.log(test.getTags());


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
