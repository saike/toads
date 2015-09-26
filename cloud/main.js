//add TOADER Role to every registered user
Parse.Cloud.afterSave(Parse.User, function(request, response) {
  if(request.object.existed()){
    //some code may be in future
  }
  else {
    Parse.Cloud.useMasterKey(); // grant us administrative access, required to write to the secured UserRole PFRole
    var user = request.object;

    //set toad counter to zero
    user.set('toads_count', 0);
    user.save();

    var query = new Parse.Query(Parse.Role);
    query.equalTo("name", "toader");
    query.first ( {
      success: function(object) {
        object.relation("users").add(user);
        object.save();
        //response.success("The user has been authorized.");
      },
      error: function(error) {
        //response.error("User authorization failed!");
      }
    });
  }
});

//add author to toad
Parse.Cloud.beforeSave("Toad", function(request, response) {
  var user = request.user;
  if(user) {
    request.object.set('toader', user);
    if(!request.object.existed()){
      var toads_count = user.get('toads_count') || 0;
      user.set('toads_count', toads_count+=1);
      user.save();
    }
    response.success();
  }
});