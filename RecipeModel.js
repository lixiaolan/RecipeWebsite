// Model class for each recipe being viewed. The constructor takes the
// recipe id, the cook book from the model (to make db calls when
// needed), and an onLoadedDelegate to be caled when the constructor
// finishes running.
var RecipeModel = function (recipeId, modelBook, onLoadedDelegate)
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
    var recipeText;

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
        
        // Add the close button
        contents
            .append(' <div> <button type="button" id="CloseBtn" class="btn btn-warning">Close</button> </div>');
        

        // Add recipe text area and edit buttons
        contents
            .append(' <div id="editComponents"> <div class="btn-group" id="recipeTags" data-toggle="buttons"></div> <div> <textarea class="form-control" rows="10" id="recipeEdit">'+recipeText+'</textarea> </div> <div class="row"> <div class="col-lg-6 col-md-6 col-xs-6"> <button type="button" id="SaveBtn" class="btn btn-primary">Save</button> </div> <div class="col-lg-6 col-md-6 col-xs-6"> <button type="button" id="DeleteBtn" class="btn btn-danger">Delete</button> </div> </div> </div>')

        // Add recipe View area
        contents
            .append('<div id="recipeView">'+recipeText+'</div>');
                
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
        //$('#myTabs a:last').tab('show');
        that.show();

        // Make external doneLoading function call
        onLoadedDelegate();
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

    // Method to show the tab corresponding to this recipe.
    that.show = function()
    {
        $('#myTabs a[href="#'+domId+'"]').tab('show');
    }
    
    // Method to toggle edit mode
    that.setEditMode = function(isEditMode)
    {
        if (isEditMode)
        {
            $('#'+domId+' #editComponents')
                .removeClass('hidden');
        }
        else
        {
            $('#'+domId+' #editComponents')
                .addClass('hidden');
        }
    }
    
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
        book.putRecipeText(id,recipeText,(function () {}));

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
