# feature-toggle-api

> Gives you advanced feature-toggle for any Framework

[![npm version](https://img.shields.io/npm/v/-feature-toggle-api.svg)](https://www.npmjs.com/package/feature-toggle-api)
[![npm downloads](https://img.shields.io/npm/dt/feature-toggle-api.svg)](https://www.npmjs.com/package/feature-toggle-api)
[![npm downloads](https://img.shields.io/github/license/mashape/apistatus.svg)](https://www.npmjs.com/package/feature-toggle-api)
## Install

``` shell
    npm install feature-toggle-api --save
```

## The Problem
Imagine you have an onlineshop with an testmode and in multiple languages. 
One part uses a html-template that looks like this:
``` html
<content-area>
    <!-- Show important debugging information for testmode -->
    <testmode-nav onload="showIf(testmode)"></testmode-nav>

    <!-- That's the old one, in a few days the new one, commented out here will be released 
        <left-nav-new></left-nav-new>
    -->
    <left-nav></left-nav>

    <!-- Every shop has a slider with amazing foodinfo on the startpage-->
    <div id="startpage-slider-de" ref="food/bratwurst" onload="showIf(shop=='de')">...</div>
    <div id="startpage-slider-en" ref="food/fishnchips" onload="showIf(shop=='en')">...</div>
    <div id="startpage-slider-fr" ref="food/croissant" onload="showIf(shop=='fr')">...</div>

    <footer-new></footer-new>
    <!-- 
    New footer just went live. When there are some problems, we rollback and comment out the new footer and uncomment the old one
    <footer-old></footer-old> -->
</content-area>
```
It's generally a bad idea to have visibility rules in the template. Of course, by refactoring the template a little bit the code will look better. 
But that's not the point. The problem is: The view-logic is spread in .html and .js files and if the viewlogic changes, you have to change at least them. And all visibility rules are spread over the whole system.
That's not good.

## The solution
Feature-toggle. All View-Logic is placed in one place. This can be a config file, a webservice or a tool with a User Interface.a
When you want to change a visibility rule, for example "Show feature XYZ also in the french shop", you just have to update the config or add this info in an UI. And no developer is needed for it.

<a href="https://martinfowler.com/articles/feature-toggles.html">Read the article from Martin Fowler about feature toggle for a better understanding.</a>

## The Usage
Look in the example folder for working examples in HTML Templates.

### Initialisation
Create a new project, type
``` shell
    npm install feature-toggle-api --save
```
You want to include it as a scripttag? Here's a sample HTML-Template 
Replace the index.html - file with the following:
``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Basic Feature-Toggle-API-Test</title>
    <script>/*Quickhack to handle es-modules in Browser*/ var exports = {};</script>
    <script src="../dist/feature-toggle-api.min.js"></script>
</head>
<body>
    <div class="feature1">This is text from feature1</div>
    <div class="feature2">This is text from feature2</div>
    <script>
        var api = featuretoggleapi({
            feature1: true
        });
        var feature1Visible = api.isVisible('feature1');
        var feature2Visible = api.isVisible('feature2');
        
        //here we could also use jquery or any other library,... The api has done its job.
        if(!feature1Visible) document.querySelector(".feature1").style.display = 'none';
        if(!feature2Visible) document.querySelector(".feature2").style.display = 'none';
    </script>
</body>
</html>
```
You have a node-module? Nothing is easier then that:
``` javascript
var featuretoggleapi = require('feature-toggle-api').default;
var api = featuretoggleapi({
    feature1: true
});
var feature1Visible = api.isVisible('feature1');
var feature2Visible = api.isVisible('feature2');

//now you can do sth with the visibilities
```

### Initialisation
Initialisation is very simple
```javascript
//This api has already initialized some visiblity rules:
var api = new featuretoggleapi({
    feature1: true, //feature1 will be shown
    feature2: false, //feature2 won't be shown,
    // a rule can also be a function. important: it must return a boolean value; feature 3 would be shown
    feature3: function(data, name, variant){return true;}, 
    feature4: true,
    "feature4:new": false //feature 4 will be shown - but if variant is new, it won't be. 
});

//You could also write it like this:
var api = new featuretoggleapi();
api.visibility('feature1',true);
api.visibility('feature2',false);
api.visibility('feature3',function(data, name, variant){return true});
api.visibility('feature4',true);
api.visibility('feature4','new',false);
```

### Features
For the next examples we will imagine, the properties are mapped to the visibility rules.
```html
<div id="app">
    <!-- Just imagine, the properties are matched to the visibility rules -->
    <feature name="feature1">This is "Feature1"</feature>
    <feature name="feature2">This is "Feature2"</feature>
    <feature name="feature2" variant="new">This is "Feature2" with variant "new"</feature>
    <feature name="feature2" variant="old">This "Feature2" with variant "old"</feature>
    <feature name="feature2" variant="grumpfel">This "Feature2" with variant "grumpfel"</feature>
    
    <feature name="feature3" variant="old" data="grumpfel">This "Feature3" with variant "old" has some Data.</feature>
    <feature name="feature3" variant="new" data="{'text':'grumpfel'}">This "Feature3" with variant "old" has some Data.</feature>
</div>
```
#### Basic visibility
```javascript
// shows Feature1
//Feature2 is not configured, so it will be hidden
api.visibility('feature1',true);

//Remember: you can also wrap it in functions - but the example above is better to read
api.visibility('feature1',function (data, name, variant) {
        //here would be some more complex logic, in this example we keep it simple
        return true;
});
```
```javascript
/* 
    shows all features with name feature2, in this case: 
    api.isVisible('feature1') -> return false
    api.isVisible('feature2') -> return true
    api.isVisible('feature2','new') -> return true
    api.isVisible('feature2','old') -> return true
    api.isVisible('feature2','grumpfel') -> return true
    
 */
api.visibility('feature2', true);

/*
    This overwrites the rule above for "feature2", variant "new"    
    api.isVisible('feature1') -> return false
    api.isVisible('feature2') -> return true - because of rule above 
    api.isVisible('feature2','new') -> return false
    api.isVisible('feature2','old') -> return true
    api.isVisible('feature2','grumpfel') -> return true
*/
api.visibility('feature2','new', false);
```
```javascript
/*
    feature.isVisible('feature3','new','grumpfel'); //returns true
    feature.isVisible('feature3','new','grumpfelbu'); //returns false
*/
api.visibility('feature3','new', function (data,name,variant) {
     //data could also be an object or whatever you want
      return data == "grumpfel";
});
```
#### Default Visibility
Bored of writing the same visibility rule again and again? Use defaultVisibility. This is the default-rule and will be overwritten by feature.visibility() - rules.
``` javascript
feature.defaultVisibility(function(data,name,variant){
    return true;
});

feature.visibility('feature2', 'new', function(data,name,variant){
    return false;
});
/*
    "Feature2", variant "new" is overwritten, all other features have the defaultVisibility
    api.isVisible('feature1') -> return true
    api.isVisible('feature2') -> return true
    api.isVisible('feature2','new') -> return false
    api.isVisible('feature2','old') -> return true
    api.isVisible('feature2','grumpfel') -> return true
*/
```
You already want to initialize it in the constructor? No Problem.
```javascript
    var api = new featuretoggleapi({
    _default: true, //default visibility always returns true; again: this could also be a function
 });
```

#### Required Visibility
This rule is allways executed, before the other rules. When it returns false, the other rules are ignored.
``` javascript
/*
   Imagine a config that is loaded via ajax. When the name is in the config, it returns true.
   And this config looks like this: 
   var globalConfig = { "feature2" : true }
*/

feature.requiredVisibility(function(data,name,variant){
    //In this case it returns true, when name == 'feture2'
    return globalConfig[name] === true;
});

/*
  feature2, variant "new" returns false, but requiredConfig returns true. Both rules must match, so it will be hidden
*/
feature.visibility('feature2','new',function(data,name,variant){
    return false;
});

/*
  feature3 returns true, but requiredConfig returns false. Both rules must match, so Feature3 is hidden
*/
feature.visibility('feature3',function(data,name,variant){
    return true;
});

/*
    api.isVisible('feature2') -> return true
    api.isVisible('feature2','new') -> return false
    api.isVisible('feature2','old') -> return true
    api.isVisible('feature2','grumpfel') -> return true

    api.isVisible('feature3','new') -> return false
    api.isVisible('feature3','old') -> return false
*/
```
You already want to initialize it in the constructor? No Problem.
```javascript
    var api = new featuretoggleapi({
    _required: true, //default visibility always returns true; again: this could also be a function
 });
```

#### Function isVisible
The api for this function:
```javascript
// prooves if feature2 is visible
var isVisible = feature.isVisible('feature2');

// prooves if tag feature "feature2", variant "new" is visible
var isVisible_new = feature.isVisible('feature2','new');

// prooves if tag feature "feature2", variant "new" with data "grumpfl" is visible
var isVisible_data = feature.isVisible('feature2','new','grumpfl');

// prooves if tag feature "feature2" with data "grumpfl" is visible
var isVisible_data_onlyname = feature.isVisible('feature2',null,'grumpfl');
```

#### ShowLogs
Imagine this following html-snippet:
```javascript
    /* Why is this ******* feature hidden? I checked the visibilityrule. It should be visible... */
    api.isVisible('anamazingFeature') //returns false, but should return true... wtf???
```
All developers of the world agree with you, debugging sth like this is horrible. But don't worry, we have a perfect solution for it. And it's just one line of code.
```javascript
feature.showLogs(); //or feature.showLogs(true);
```
This returns a log like the following:
```html
Check Visibility of Feature "anAmazingFeature".
The requiredVisibility rule returns false. This feature will be hidden.

Check Visibility of Feature "anotherAmazingFeature", variant "new" with data {"id":"bla"}.
The requiredVisibility rule returns true. This feature will be shown when no other rule rejects it.
No visibility rule found matching name and variant.
No rules found for name anotherAmazingFeature without variants.
No default rule found.
Only the requiredVisibility rule was found. This returned true. => This feature will be visible.
```
With this you don't have to waste your time with debugging the visibility state. 

#### Log
Log a custom message, when showLogs() == true.
```javascript
api.log("Here's my custom message");
```

## License	
<a href="https://opensource.org/licenses/MIT">MIT</a>.
Copyright (c) 2018 Manuel Gelsen
