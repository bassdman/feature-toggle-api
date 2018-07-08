module.exports = function () {
    return function (api, window) {
        var featureTags = window.document.querySelectorAll('feature');
        featureTags.forEach(tag => { tag.style.display = 'none' });

        api.on('visibilityrule', function (event) {
            var selector = 'feature[name="' + event.name + '"]';
            if (event.variant) selector += '[variant="' + event.variant + '"]';
            var elements = document.querySelectorAll(selector);
            elements.forEach(elem => { elem.style.display = event.result ? 'block' : none });
        })

        return {name: 'htmlplugin'};
    }
}