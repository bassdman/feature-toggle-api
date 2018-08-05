# URL-Plugin

This plugin maps url-parameters to features.

## Usage

### Basic usage
```html
    URL: http://adomain.com?feature1=true&feature2=false&feature3=true

    <html lang="en">
        <head>
            <title>URL-Plugin Test</title>
            <script src="../feature-toggle-api.js"></script>
            <script src="../plugin-url.js"></script>
        </head>
        <body>
            <script>
                var api = featuretoggleapi({
                    _plugins: [urlplugin()]
                });
                api.isVisible("feature1") // true
                api.isVisible("feature2") // false
                api.isVisible("feature3") // true
            </script>
        </body>
</html>
```

### Custom URL
If you want to use a custom url, not the page-url, then set the url in the urlplugin-config.
```html
    URL: http://adomain.com?feature1=true&feature2=false&feature3=true

    <html lang="en">
        <head>
            <title>URL-Plugin Test</title>
            <script src="../feature-toggle-api.js"></script>
            <script src="../plugin-url.js"></script>
        </head>
        <body>
            <script>
                var api = featuretoggleapi({
                    _plugins: [urlplugin({
                        url: "http://anotherdomain.com?feature1=true&feature2=false&feature3=true"
                    })]
                });
                api.isVisible("feature1") // true
                api.isVisible("feature2") // false
                api.isVisible("feature3") // true
            </script>
        </body>
</html>
```

### Custom parameters
Maybe you don't want all parameters to be regarded as features because they're used for anything else.
But you can define a prefix. All urlparameters starting with this prefix are regarded as feature-parameters.

Example: 
<ul>
    <li>prefix is "_"</li>
    <li>url is http://adomain.com?feature1=true&feature2=false&_feature3=true</li>
    <li>feature1 -> false (no _ before urlparameter)</li>
    <li>feature2 -> false (no _ before urlparameter)</li>
    <li>feature3 -> true (_ before urlparameter)</li>
</ul>

```html
    URL: http://adomain.com?feature1=true&feature2=false&feature3=true

    <html lang="en">
        <head>
            <title>URL-Plugin Test</title>
            <script src="../feature-toggle-api.js"></script>
            <script src="../plugin-url.js"></script>
        </head>
        <body>
            <script>
                var api = featuretoggleapi({
                    _plugins: [urlplugin({
                        url: "http://anotherdomain.com?feature1=true&feature2=false&_feature3=true",
                        prefix: "_"
                    })]
                });
                api.isVisible("feature1") // false
                api.isVisible("feature2") // false
                api.isVisible("feature3") // true
            </script>
        </body>
</html>
```