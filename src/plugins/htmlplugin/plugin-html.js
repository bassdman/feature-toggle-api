/*
    creates a tag that is shown / hidden, depending on the visibility rules.
    if not configured dynamically, it looks like this:
    <feature name="featurename" variant="variantname" data="data">content </feature>

    Parameter: (config)
    - config.featureTagName: name of the tag. Default: "feature"
    - nameAttributeName: Name of the Name-Attribute: default: "name"
    - variantAttributeName: Name of the Variant-Attribute: default: "variant"
*/
const defaultparams = {
    renderedTag: 'div',
    featureTagName: 'feature',
    tagAttributeName: 'tag',
    nameAttributeName:'name',
    variantAttributeName: 'variant',
    dataAttributeName: 'data',
    displayAttributeName: 'display',
    defaultDisplay: 'block',
}
function parseDataAttribute(attrAsString){
    try{
        return JSON.parse(attrAsString);
    }
    catch(e)
    {
        if(!isNaN(parseFloat(attrAsString)))
            return parseFloat(attrAsString);
        
        return attrAsString;
    }
}

function htmlplugin(config = {}) {
    config = Object.assign({},defaultparams,config);

    function renderFeatureTag(elem,isVisible){
        const tagname = elem.getAttribute(config.tagAttributeName) || config.renderedTag;
        const attributes = Array.from(elem.attributes);
        let attributesAsString = "";
        attributes.forEach(attr => {
            attributesAsString += ` ${attr.nodeName}="${attr.nodeValue.replace(/"/g,"&quot;")}"`;
        });
        const display = isVisible ? (elem.getAttribute(config.displayAttributeName) || config.defaultDisplay) : 'none';
        elem.outerHTML = `<${tagname}  style="display:${display}" _feature="true" ${attributesAsString}>${elem.innerHTML}</${tagname}>`;
    }
    return function (api) {
        var renderedTags = window.document.querySelectorAll(config.featureTagName);
        renderedTags.forEach(tag => { renderFeatureTag(tag,false) });

        api.on('visibilityrule', function (event) {
            var selector = `[_feature][${config.nameAttributeName}="${event.name}"]`;
            if (event.variant) selector += `[${config.variantAttributeName}="${event.variant}"]`;
            var elements = document.querySelectorAll(selector);
            elements.forEach(elem => { 
                const dataAsString = elem.getAttribute(config.dataAttributeName);
                const data = parseDataAttribute(dataAsString);
                
                const isVisible = api.isVisible(event.name,event.variant,data);
                renderFeatureTag(elem, isVisible);
            });
        })

        return { name: 'htmlplugin' };
    }
}
if(typeof window !== 'undefined')
    window.htmlplugin = htmlplugin;

if(typeof module !== 'undefined')
    module.exports = htmlplugin;