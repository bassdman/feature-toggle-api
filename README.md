# feature-toggle-api

> Gives you advanced feature-toggle for any Framework

[![npm version](https://img.shields.io/npm/v/feature-toggle-api.svg)](https://www.npmjs.com/package/feature-toggle-api)
[![npm downloads](https://img.shields.io/npm/dt/feature-toggle-api.svg)](https://www.npmjs.com/package/feature-toggle-api)
[![npm downloads](https://img.shields.io/github/license/mashape/apistatus.svg)](https://www.npmjs.com/package/feature-toggle-api)
## Install

``` shell
    npm install feature-toggle-api --save
```

 - [Quicklink to the API](#api-description)
 - [Quicklink to the HTML-Plugin](https://github.com/bassdman/feature-toggle-api/blob/master/src/plugins/htmlplugin/readme.md)
 - [Quicklink to the URL-Plugin](https://github.com/bassdman/feature-toggle-api/blob/master/src/plugins/urlplugin/readme.md)
 - [Quicklink to the vue-Plugin (package vue-feature-toggle)](https://github.com/bassdman/vue-feature-toggle)

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
Feature-toggle. All View-Logic is placed in one place. This can be a config file, a webservice or a tool with a User Interface.
When you want to change a visibility rule, for example "Show feature XYZ also in the french shop", you just have to update the config or add this info in an UI. And no developer is needed for it.

<a href="https://martinfowler.com/articles/feature-toggles.html">Read the article from Martin Fowler about feature toggle for a better understanding.</a>

## The Usage
Look in the example folder for working examples in HTML Templates.

### Initialisation
Create a new project, type
``` shell
    npm install feature-toggle-api --save
```

Use it in your script
``` javascript
import { useFeatureToggle } from "feature-toggle-api";

//initialize it with your feature-flags
const feature = useFeatureToggle({      
    a:true, 
});

console.log(feature.isActive('a')); //true
console.log(feature.isActive('c')); //false
```

You use commonjs-scripts? Here we go:
``` javascript
const { useFeatureToggle } = require("feature-toggle-api/dist/feature-toggle.cjs");

//initialize it with your feature-flags
const feature = useFeatureToggle({      
    a:true, 
});

console.log(feature.isActive('a')); //true
console.log(feature.isActive('c')); //false
```


Or you want to include it as a scripttag? Here's a sample HTML-File. 
``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Basic Feature-Toggle-API-Test</title>
    <script src="path/to/feature-toggle-api/dist/feature-toggle.umd.min.js"></script>
</head>
<body>
    <div class="feature1">This is text from feature1</div>
    <div class="feature2">This is text from feature2</div>
    <script>
        var api = useFeatureToggle({
            feature1: true
        });
        var feature1Visible = api.isActive('feature1');
        var feature2Visible = api.isActive('feature2');
        
        //here we could also use jquery or any other library,... The api has done its job.
        if(!feature1Visible) document.querySelector(".feature1").style.display = 'none';
        if(!feature2Visible) document.querySelector(".feature2").style.display = 'none';
    </script>
</body>
</html>
```


### Initialisation
Initialisation is very simple
```javascript
//This api has already initialized some visiblity rules:
var api = useFeatureToggle({
    feature1: true, //feature1 will be shown
    feature2: false, //feature2 won't be shown,
    // a rule can also be a function. important: it must return a boolean value; feature 3 would be shown
    feature3: function(rule){return true;}, 
    feature4: true,
    "feature4:new": false, //feature 4 will be shown - but if variant is new, it won't be. 
});

//You could also write it like this:
var api = useFeatureToggle();
api.setFlag('feature1',true);
api.setFlag('feature2',false);
api.setFlag('feature3',function(rule){return true});
api.setFlag('feature4',true);
api.setFlag('feature4','new',false);
//only possible via functioncall: pass some data; maybe necessary in the listener
api.setFlag('feature4','new',"some custom data",false);
```

Important: A visibilityrule must not start with an underscore or $. Both is reserved. Attributes starting with an it are reserved for configuration settings.
```javascript
//This api has already initialized some visiblity rules:
var api = useFeatureToggle({
    feature1: true,  //visibilityrule feature1 -> true
    plugins: true,   //visibilityrule plugins -> true
    _feature1: true, //_ is reserved for configuration (deprecated)-> this attribute does nothing
    _plugins: [],    //_ is reserved for configuration -> add plugins (deprecated). use $plugins instead

    $plugins: [],    //$ is reserved for configuration -> add plugins
});
```

### Features
For the next examples we will imagine, the properties are mapped to the visibility rules. (Btw, the [html-plugin](https://github.com/bassdman/feature-toggle-api/blob/master/src/plugins/htmlplugin/readme.md) does this for you ;)
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
api.setFlag('feature1',true);

//Remember: you can also wrap it in functions - but the example above is better to read
api.setFlag('feature1',function ( rule) {
        //here would be some more complex logic, in this example we keep it simple
        return true;
});
```
```javascript
/* 
    shows all features with name feature2, in this case: 
    api.isActive('feature1') -> return false
    api.isActive('feature2') -> return true
    api.isActive('feature2','new') -> return true
    api.isActive('feature2','old') -> return true
    api.isActive('feature2','grumpfel') -> return true
    
 */
api.setFlag('feature2', true);

/*
    This overwrites the rule above for "feature2", variant "new"    
    api.isActive('feature1') -> return false
    api.isActive('feature2') -> return true - because of rule above 
    api.isActive('feature2','new') -> return false
    api.isActive('feature2','old') -> return true
    api.isActive('feature2','grumpfel') -> return true
*/
api.setFlag('feature2','new', false);
```
```javascript
/*
    feature.isActive('feature3','new','grumpfel'); //returns true
    feature.isActive('feature3','new','grumpfelbu'); //returns false
*/
api.setFlag('feature3','new', function (rule) {
     //rule.data could also be an object or whatever you want
     //you could also use rule.name, rule.variant,...
      return rule.data == "grumpfel";
});
```
#### Default Visibility
Bored of writing the same visibility rule again and again? Use defaultFlag. This is the default-rule and will be overwritten by feature.setFlag() - rules.
``` javascript
feature.setDefaultFlag(function(rule){
    return true;
});

feature.setFlag('feature2', 'new', function(rule){
    return false;
});
/*
    "Feature2", variant "new" is overwritten, all other features have the defaultFlag
    api.isActive('feature1') -> return true
    api.isActive('feature2') -> return true
    api.isActive('feature2','new') -> return false
    api.isActive('feature2','old') -> return true
    api.isActive('feature2','grumpfel') -> return true
*/
```
You already want to initialize it in the constructor? No Problem.
```javascript
    var api = useFeatureToggle({
    _default: true, //default visibility always returns true; again: this could also be a function
 });
```

#### Required Visibility
This rule is always executed, before the other rules. When it returns false, the other rules are ignored.
``` javascript
/*
   Imagine a config that is loaded via ajax. When the name is in the config, it returns true.
   And this config looks like this: 
   var globalConfig = { "feature2" : true }
*/

feature.setRequiredFlag(function(rule){
    //In this case it returns true, when name == 'feture2'
    return globalConfig[rule.name] === true;
});

/*
  feature2, variant "new" returns false, but requiredConfig returns true. Both rules must match, so it will be hidden
*/
feature.setFlag('feature2','new',function(rule){
    return false;
});

/*
  feature3 returns true, but requiredConfig returns false. Both rules must match, so Feature3 is hidden
*/
feature.setFlag('feature3',function(rule){
    return true;
});

/*
    api.isActive('feature2') -> return true
    api.isActive('feature2','new') -> return false
    api.isActive('feature2','old') -> return true
    api.isActive('feature2','grumpfel') -> return true

    api.isActive('feature3','new') -> return false
    api.isActive('feature3','old') -> return false
*/
```
You already want to initialize it in the constructor? No Problem.
```javascript
    var api = useFeatureToggle({
    _required: true, //default visibility always returns true; again: this could also be a function
 });
```

#### Function isActive
Example for this function:
```javascript
// prooves if feature2 is visible
var isActive = feature.isActive('feature2');

// prooves if tag feature "feature2", variant "new" is visible
var isActive_new = feature.isActive('feature2','new');

// prooves if tag feature "feature2", variant "new" with data "grumpfl" is visible
var isActive_data = feature.isActive('feature2','new','grumpfl');

// prooves if tag feature "feature2" with data "grumpfl" is visible
var isActive_data_onlyname = feature.isActive('feature2',null,'grumpfl');
```

#### Function setData
if you want to update the data without updating the whole visibilityrule, use the setData-Function.
```javascript
    api.setData('featurename','variantname','anydata'); //will set the data for featurename#variantnam -> anydata
    //or
    api.setData('featurename','anydata2'); // will set the data for featurename -> anydata2

    //api.setData() calls the listener.
    api.on('visibilityrule', function (rule) {
        console.log(rule.data); 
    });

    api.setFlag('feature', 'variant','gruempfel',true); // logs 'gruempfel'
    api.setData('feature','variant','newgruempfel');  // logs 'newgruempfel'
    api.setFlag('feature2', null,'gruempfel2',true);  // logs 'gruempfel2'
    api.setData('feature2','newgruempfel2');  // logs 'newgruempfel2'
```

#### Listeners
If you want to 'watch' every initialisation of a visibility rule, you can append a watcher on it.
```javascript
    var api = useFeatureToggle({feature: true});
    api.setFlag("feature2","variant","data",true);
    
    //Calling the listener will also regard already added visibility rules
    //The result: 
    //true, 'feature', undefined, undefined
    //true, 'feature2, 'variant', "data"
    api.on('visibilityrule', function (event) {
        console.log(event.result+","+event.name+","+event.variant+","+event.data);
    })
```

You can also add custom events and triggers whenever you want.
```javascript
    var api = useFeatureToggle();
    api.on('customevent', function (param) {
        console.log("customevent " + param);
    });

    api.trigger('customevent','fired');
    //logs "customevent fired"
```

#### Plugins
You can add more functionality to the feature-toggle-api with plugins. Imagine you want an api that watches url-parameters - then you can add a plugin that implemented this logic. Or (if it does not exist) write a custom one.

##### Use existing plugins
The feature toggle api already implemented some Plugins that can be used without installing other packages.
Some plugins are included within this package:

###### HTML-Plugin
You can use the api with <feature> tags
```html
    <feature name="feature1">
        <!-- Will be shown because feature1 is visible -->
    </feature>
```
[Read more about this plugin here.](https://github.com/bassdman/feature-toggle-api/blob/master/src/plugins/htmlplugin/readme.md)

###### URL-Plugin
The api sets the features according to the url-parameters.

Example: 
URL: https://anydomain.de?feature1=true&feature2=false
-> sets feature1=true and feature2=false

[Read more about this plugin here.](https://github.com/bassdman/feature-toggle-api/blob/master/src/plugins/urlplugin/readme.md)


##### Write a custom plugin
A plugin is just a function with a parameter. You can add it with the .addPlugin()-Function.
Calling addPlugin() prevents you from from adding a plugin multiple times, so if you do this, the plugin will only be executed once. 
```javascript
    function customFunctionPlugin(api){
        //adds function customFunction to your api

        return {
            customFunction(){console.log('custom function created')}
        }
    }
    
    //1st option: via constructor
    //Important: don't forget the _ in the property _plugins!!!
    const api = useFeatureToggle({_plugins:[customFunctionPlugin]});

    //2nd option: via function
    api.addPlugin(customFunctionPlugin);

    //-> now api.customFunction() logs "custom function created"
```

Here's the way, how to add parameters to your plugin
```javascript
    function pluginWithParams(param1)
    {
        return function (api){
            //adds function customFunction to your api
            return {
                customFunction = function(){console.log('Hello ' + param1)}
            }
        }
    }

    //1st option: via constructor
    //Important: don't forget the _ in the property _plugins!!!
    const api = useFeatureToggle({$plugins:[pluginWithParams('Peter')]});

    //2nd option: via function
    api.addPlugin(pluginWithParams('Peter'));

    //-> now api.customFunction() logs "Hello Peter"
```

#### ShowLogs
Imagine this following html-snippet:
```javascript
    /* Why is this ******* feature hidden? I checked the visibilityrule. It should be visible... */
    api.isActive('anamazingFeature') //returns false, but should return true... wtf???
```
All developers of the world agree with you, debugging sth like this is horrible. But don't worry, we have a perfect solution for it. And it's just one line of code.
```javascript
feature.showLogs(); //or feature.showLogs(true);
```
This returns a log like the following:
```html
Check Visibility of Feature "anAmazingFeature".
The requiredFlag rule returns false. This feature will be hidden.

Check Visibility of Feature "anotherAmazingFeature", variant "new" with data {"id":"bla"}.
The requiredFlag rule returns true. This feature will be shown when no other rule rejects it.
No visibility rule found matching name and variant.
No rules found for name anotherAmazingFeature without variants.
No default rule found.
Only the requiredFlag rule was found. This returned true. => This feature will be visible.
```
With this you don't have to waste your time with debugging the visibility state. 


## API-Description
### Constructor
 - 1 paramter; must be an object; optional;
 - all parameters _not_ starting with an _ are visibilityrules
 - all parameters starting with an _ are _not_ visibilityrules, but configuration for the api
 - possible configuration settings:
    - _plugins: Adds a plugin; Array of functions; optional

```javascript
//initializes a visibilityrule and adds a plugin
var api = useFeatureToggle({
    feature1: true,
},{
    plugins:[]
})
```

### Flag
Adds a Flag.

Parameters:
 - name: name of the feature; required; type string
 - variant: variant of the feature; optional; type string
 - data: corresp. data for the feature; optional; type any
 - result: result for this feature; required; boolean or function that returns boolean

Returns:
    nothing
```javascript
//possible parameters
api.setFlag(name,result);
api.setFlag(name,variant,result);
api.setFlag(name,variant,data,result);
```
Example: 
```javascript
//possible parameters
api.setFlag('name',true);
api.setFlag('name','variant',true);
api.setFlag('name','variant','data',true);

//if result is a function
api.setFlag('name',function(rule){
    /*
    rule has the following parameters
        name: Name of the feature,
        variant: Variant: Variant of the feature
        data: Data of the feature
    }
    */
   return true
});
```

### isActive
Prooves if a function is visible.

Parameters:
 - name: name of the feature; required; type string
 - variant: variant of the feature; optional; type string
 - data: corresp. data for the feature; optional; type any

Returns:
    boolean: weather the feature is visible or not

```javascript
//possible parameters
api.isActive(name);
api.isActive(name,variant);
api.isActive(name,variant,data);
```

### on
A listener that is executed, everytime a function visibility rule is added or changed. Is also executed for rules that are passed via constructor.

Parameters:
 - eventname: name of event; required; type string; 
 - eventfunction: function that is executed when a rule changes; required; type function

Events:
 - visibilityrule: executed, everytime a function visibility rule is added or changed. Is also executed for rules that are passed via constructor.

Returns
    Nothing

```javascript
api.on('visibilityrule', function (event) {
    /*
        Parameters: 
        event.name, 
        event.variant, 
        event.data, 
        event.result
    */
})
```

### trigger
triggers an Event
Parameters:
 - eventname: name of event; required; type string; 
 - parameter: optional; will be passed to the event as 1st parameter

Returns
    Nothing

```javascript
api.on('eventname', function (event) {
    console.log('doSth');
})
api.trigger('eventname'); //triggers event eventname
api.trigger('eventname','parameter');
```

### setData
Sets the data for the corresp. feature;
Also triggers listener "visibilityrule".

Parameters:
 - name: name of the feature; required; type string
 - variant: variant of the feature; optional; type string
 - data: corresp. data for the feature; required; type any

Returns
    nothing

```javascript
     api.setData(name,data); 
     api.setData(name,variant,data);
```

### requiredFlag
Sets the function for the required visibility.

Parameters: 
 - requiredFlagFunction

Returns:
 - nothing

```javascript
//possible parameters
api.setRequiredFlag(function(rule){
    //do sth
    /* Parameters: 
        event.name, 
        event.variant, 
        event.data, 
    */
});
```

### defaultFlag
Sets the function for the default visibility.

Parameters: 
 - defaultFlagFunction

Returns:
 - nothing

```javascript
//possible parameters
api.setDefaultFlag(function(rule){
    //do sth
    /* Parameters: 
        event.name, 
        event.variant, 
        event.data, 
    */
});
```

### addPlugin
Adds a plugin to the api. A plugin will only be executed once, even if the function is called multiple times.

Parameters: 
 - plugin: required -> adds a plugin to the api

Returns:
 - nothing

```javascript
api.addPlugin(plugin);
```

### showLogs
Shows the Logs of a visibilityrule when function is called or listener is triggered.

Parameters:
 - showLogs: should logs be shown or not?; optional; type boolean; default: true

Returns
    nothing

```javascript
api.showLogs(); 
//is the same as
api.showLogs(true);
```

## License	
<a href="https://opensource.org/licenses/MIT">MIT</a>.
Copyright (c) 2018 Manuel Gelsen
