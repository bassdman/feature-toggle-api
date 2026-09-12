//#region src/plugins/htmlplugin/plugin-html.ts
var e = {
	renderedTag: "div",
	featureTagName: "feature",
	tagAttributeName: "tag",
	nameAttributeName: "name",
	variantAttributeName: "variant",
	dataAttributeName: "data",
	displayAttributeName: "display",
	defaultDisplay: "block"
};
function t(e) {
	try {
		return JSON.parse(e);
	} catch {
		return isNaN(parseFloat(e)) ? e : parseFloat(e);
	}
}
function n(n = {}) {
	n = Object.assign({}, e, n);
	function r(e, t) {
		let r = e.getAttribute(n.tagAttributeName) || n.renderedTag, i = Array.from(e.attributes), a = "";
		i.forEach((e) => {
			a += ` ${e.nodeName}="${e.nodeValue.replace(/"/g, "&quot;")}"`;
		}), e.outerHTML = `<${r}  style="display:${t ? e.getAttribute(n.displayAttributeName) || n.defaultDisplay : "none"}" _feature="true" ${a}>${e.innerHTML}</${r}>`;
	}
	return function(e) {
		return window.document.querySelectorAll(n.featureTagName).forEach((e) => {
			r(e, !1);
		}), e.on("visibilityrule", function(i) {
			var a = `[_feature][${n.nameAttributeName}="${i.name}"]`;
			i.variant && (a += `[${n.variantAttributeName}="${i.variant}"]`), document.querySelectorAll(a).forEach((a) => {
				let o = t(a.getAttribute(n.dataAttributeName));
				r(a, e.isVisible(i.name, i.variant, o));
			});
		}), { name: "htmlplugin" };
	};
}
//#endregion
export { n as htmlPlugin };

//# sourceMappingURL=html-plugin.js.map