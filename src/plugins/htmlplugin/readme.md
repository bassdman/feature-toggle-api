# HTML-Plugin

Use Feature-Tags in the html to show / hide features depending on the visibility rules.
Watch the [example](https://github.com/bassdman/feature-toggle-api/blob/master/examples/example-htmlplugin.html) as an example.

## Usage

### Basic usage
```html
<html lang="en">
<head>
    <title>HTML-Plugin Minimal example</title>
    <script src="../../../feature-toggle-api.min.js"></script>
    <script src="../../../plugin-html.js"></script>
</head>
<body>
    <!-- The name property is required -->
    <feature name="feature1">This is "Feature1"</feature>
    <feature name="feature2">This is "Feature2"</feature>
    <feature name="feature3" variant="new" data='{"text":"grumpfel"}'>
        This "Feature3" with variant "old" has some Data. 
    </feature>
    <script>
        var api = featuretoggleapi({
            "feature2": true,
            _plugins: [htmlplugin()]
        });
        api.visibility("feature3",function(rule){
            return rule.data.text == 'grumpfel';
        })
    </script>
</body>
</html>
```
This example will show feature2 and feature3 and hide feature1.

These feature tags will be rendered to: 
```html
    <div _feature="true" name="feature1" style="display:none">This is "Feature1"</div>
    <div _feature="true" name="feature2" style="display:block">This is "Feature2"</div>
    <div _feature="true" name="feature3" variant="new" data='{"text":"grumpfel"}' style="display:block">
        This "Feature3" with variant "old" has some Data. 
    </div>
```

### Modify rendered tag
If div-elements already have unwanted styles due to legacy code, you can choose a custom rendered tag. You can do this in two ways:

#### Attribute tag
```html
    <feature name="feature1" tag="span">This is "Feature1"</feature>
    <feature name="feature2">This is "Feature2"</feature>
```
will be rendered to:
```html
    <span _feature="true" tag="h1" name="feature1" style="display:none">This is "Feature1"</span>
    <div _feature="true" name="feature2" style="display:block">This is "Feature2"</div>
```

#### Config attribute
```html
    <feature name="feature1">This is "Feature1"</feature>
    <feature name="feature2">This is "Feature2"</feature>
    <script>
        var api = featuretoggleapi({
            _plugins: [htmlplugin({
                renderedTag: 'span'
            },
            feature2: true
            )]
        });
    </script>
```
will be rendered to:
```html
    <span _feature="true" name="feature1" style="display:none">This is "Feature1"</span>
    <span _feature="true" name="feature2" style="display:block">This is "Feature2"</span>
```

### Modify display attribute
Maybe display:block is not what you want for visible features. Maybe display:inline is better for you. Configure it.



#### Attribute tag
```html
    <feature name="feature1">This is "Feature1"</feature>
    <feature name="feature2" display="inline">This is "Feature2"</feature>
```
will be rendered to:
```html
    <div _feature="true" tag="h1" name="feature1" style="display:none">This is "Feature1"</div>
    <div _feature="true" name="feature2" style="display:inline">This is "Feature2"</div>
```

#### Config attribute
```html
    <feature name="feature1">This is "Feature1"</feature>
    <feature name="feature2">This is "Feature2"</feature>
    <script>
        var api = featuretoggleapi({
            _plugins: [htmlplugin({
                defaultDisplay: 'inline'
            },
            feature2: true
            )]
        });
    </script>
```
will be rendered to:
```html
    <span _feature="true" name="feature1" style="display:none">This is "Feature1"</span>
    <span _feature="true" name="feature2" style="display:inline">This is "Feature2"</span>
```


### Modify tag names
The following config attributes are only needed, if an external script creates unexpected behaviours due to the feature tags (because it maybe watches attributes with name "display" or "name"). 
So you can modify the names of the tags / attributes.

#### featureTagName
``` html
    <script>
        var api = featuretoggleapi({
            _plugins: [htmlplugin({
                featureTagName: 'customTag'
            },
            )]
        });
    </script>
    <!-- Without featureTagName set -->
    <feature name="xyz"><!-- some html--></feature>

    <!-- With featureTagName set -->
    <customTag name="xyz"><!-- some html--></customTag>
```

#### nameAttributeName
``` html
    <script>
        var api = featuretoggleapi({
            _plugins: [htmlplugin({
                nameAttributeName: 'customName'
            },
            )]
        });
    </script>
    <!-- Without nameAttributeName set -->
    <feature name="xyz"><!-- some html--></feature>

    <!-- With nameAttributeName set -->
    <feature customName="xyz"><!-- some html--></feature>
```

#### variantAttributeName
``` html
    <script>
        var api = featuretoggleapi({
            _plugins: [htmlplugin({
                variantAttributeName: 'customVariant'
            },
            )]
        });
    </script>
    <!-- Without variantAttributeName set -->
    <feature name="xyz" variant="abc"><!-- some html--></feature>

    <!-- With variantAttributeName set -->
    <feature name="xyz" customVariant="abc"><!-- some html--></feature>
```

#### dataAttributeName
``` html
    <script>
        var api = featuretoggleapi({
            _plugins: [htmlplugin({
                dataAttributeName: 'customData'
            },
            )]
        });
    </script>
    <!-- Without dataAttributeName set -->
    <feature name="xyz" data="somedata"><!-- some html--></feature>

    <!-- With dataAttributeName set -->
    <feature customName="xyz" customData="somedata"><!-- some html--></feature>
```

#### tagAttributeName
``` html
    <script>
        var api = featuretoggleapi({
            _plugins: [htmlplugin({
                tagAttributeName: 'customTag'
            },
            )]
        });
    </script>
    <!-- Without tagAttributeName set -->
    <feature name="xyz" tag="span"><!-- some html--></feature>

    <!-- With tagAttributeName set -->
    <feature name="xyz" customTag="span"><!-- some html--></feature>
```

#### displayAttributeName
``` html
    <script>
        var api = featuretoggleapi({
            _plugins: [htmlplugin({
                displayAttributeName: 'customDisplay'
            },
            )]
        });
    </script>
    <!-- Without displayAttributeName set -->
    <feature name="xyz" display="inline"><!-- some html--></feature>

    <!-- With displayAttributeName set -->
    <feature name="xyz" customDisplay="inline"><!-- some html--></feature>
```
