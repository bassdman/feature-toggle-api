//#region src/plugins/urlplugin/plugin-url.ts
function e() {
	return {
		isMocked: !0,
		decodeURIComponent: function(e) {
			return e;
		}
	};
}
function t(e) {
	return e === "true";
}
function n(e, n) {
	var r = {};
	if (!e) return [];
	var i = e.split("?");
	return i.length < 2 ? [] : (i[1].split("&").forEach(function(e) {
		var i = e.split("=");
		i[0] = n.decodeURIComponent(i[0]), i[1] = t(n.decodeURIComponent(i[1])), r[i[0]] = i[1] === "undefined" || i[1];
	}), r);
}
function r(t = {}) {
	let r;
	return r = t.useMockedWindow ? e() : window, t = Object.assign({}, {
		url: r.isMocked ? "" : r.location.href,
		prefix: ""
	}, t), function(e) {
		e.url = t.url;
		let i = n(t.url, r), a = t.prefix;
		return Object.keys(i).forEach((t) => {
			if (!t.startsWith(a)) return;
			let n = t.replace(a, "");
			e.visibility(n, i[t]);
		}), { name: "urlplugin" };
	};
}
//#endregion
//#region src/plugins/htmlplugin/plugin-html.ts
var i = {
	renderedTag: "div",
	featureTagName: "feature",
	tagAttributeName: "tag",
	nameAttributeName: "name",
	variantAttributeName: "variant",
	dataAttributeName: "data",
	displayAttributeName: "display",
	defaultDisplay: "block"
};
function a(e) {
	try {
		return JSON.parse(e);
	} catch {
		return isNaN(parseFloat(e)) ? e : parseFloat(e);
	}
}
function o(e = {}) {
	e = Object.assign({}, i, e);
	function t(t, n) {
		let r = t.getAttribute(e.tagAttributeName) || e.renderedTag, i = Array.from(t.attributes), a = "";
		i.forEach((e) => {
			a += ` ${e.nodeName}="${e.nodeValue.replace(/"/g, "&quot;")}"`;
		}), t.outerHTML = `<${r}  style="display:${n ? t.getAttribute(e.displayAttributeName) || e.defaultDisplay : "none"}" _feature="true" ${a}>${t.innerHTML}</${r}>`;
	}
	return function(n) {
		return window.document.querySelectorAll(e.featureTagName).forEach((e) => {
			t(e, !1);
		}), n.on("visibilityrule", function(r) {
			var i = `[_feature][${e.nameAttributeName}="${r.name}"]`;
			r.variant && (i += `[${e.variantAttributeName}="${r.variant}"]`), document.querySelectorAll(i).forEach((i) => {
				let o = a(i.getAttribute(e.dataAttributeName));
				t(i, n.isVisible(r.name, r.variant, o));
			});
		}), { name: "htmlplugin" };
	};
}
//#endregion
//#region src/featureToggle.ts
function s(e) {
	return typeof e == "boolean" ? function() {
		return e;
	} : e;
}
function c(e, t) {
	let n = e.toLowerCase();
	return t && typeof t == "string" && (n += `#${t.toLowerCase()}`), n;
}
function l(e = {}) {
	let t = {};
	return Object.entries(e).forEach(([e, n]) => {
		e.startsWith("_") || e.startsWith("$") || (t[c(e)] = s(n));
	}), t;
}
function u(e = {}) {
	let t = {
		datas: {},
		listeners: {},
		visibilities: l(e),
		showLogs: !1,
		usedPlugins: []
	};
	function n(t) {
		e.$default && t.setDefaultFlag(e.$default), e.$required && t.setRequiredFlag(e.$required);
		let n = e._plugins || [], i = [...e.$plugins || [], ...n];
		n.length && console.log("useFeatureToggle({_plugins:[]}): Key _plugins is deprecated. Use $plugins instead. This attribute will be removed in one of the next major versions."), i.length && i.forEach((e) => {
			if (typeof e != "function") throw Error("featuretoggleapi()-constructor: config.plugins needs functions as entries, not " + typeof e + ".");
			t.addPlugin(e);
		}), r("init");
	}
	function r(e, n) {
		(t.listeners[e] || []).forEach((e) => {
			e(n);
		});
	}
	let i = function(e) {
		if (!t.showLogs) return;
		if (globalThis.window === void 0) {
			let t = e.replaceAll("<b>", "");
			console.log(t);
			return;
		}
		let n = e.includes("<b>"), r = e.includes("visible"), i = e.includes("hidden"), a = e.replaceAll("visible", "%cvisible");
		a = a.replaceAll("hidden", "%chidden"), r ? console.log(a, "color:green;font-weight:bold;") : i ? console.log(a, "color:red;font-weight:bold;") : n ? (a = a.replace("<b>", "%c"), console.log(a, "font-weight:bold;")) : console.log(e);
	}, a = function(e, t) {
		return i(t), i(""), e;
	}, o = function(e, t, n, r, i) {
		if (e == null) return;
		let o = e({
			name: n,
			variant: r ?? void 0,
			data: i
		});
		return typeof o == "boolean" ? o : a(!1, `The ${t} returns ${o}. => Please return true or false. This result (and all non-boolean results) will return false.`);
	};
	function u(e) {
		let n = e.split("#");
		return {
			name: n[0],
			variant: n.length > 1 ? n[1] : void 0,
			data: t.datas[e]
		};
	}
	let d = function(e, t, n, r) {
		if (e === void 0) throw Error("feature.visibility(): 1st parameter name must be defined");
		if (arguments.length === 1) throw Error("feature.visibility(): 2nd parameter name must be a boolean or function, but is empty");
		let i = e, a = null, o = null, s;
		return n === void 0 && r === void 0 ? s = t : r === void 0 ? (a = t, s = n) : (a = t, o = n, s = r), {
			name: i,
			variant: a,
			data: o,
			result: s
		};
	}, f = (e, t, n, r) => {
		let i = {
			name: e,
			variant: t ?? void 0,
			data: n
		};
		return i.key = c(i.name, i.variant), r == null ? i : (i.visibilityFunction = s(r), i.result = i.visibilityFunction({
			name: i.name,
			variant: i.variant,
			data: i.data || {},
			_internalCall: !0,
			description: "When attaching a function, the result must be calculated internally. You can filter this out with the _internalCall:true -Flag."
		}), i);
	};
	function p(e, n, r) {
		let s = t.visibilities, l = r ? ` with data ${JSON.stringify(r)}` : "";
		if (i(`\nCheck Visibility of <b>Feature "${e}", variant "${n ?? ""}"${l}.`), e === void 0) throw Error("The attribute \"name\" is required for tag <feature></feature>. Example: <feature name=\"aname\"></feature>");
		let u = s._required, d = u != null, f = o(u, "requiredVisibility", e, n, r);
		if (!d) i("No requiredVisibility rule specified for this feature.");
		else if (f === !0) i("The requiredVisibility rule returns true. This feature will be shown when no other rule rejects it.");
		else return a(!1, "The requiredVisibility rule returns false. This feature will be hidden.");
		let p = s[c(e, n)], h = p != null, g = o(p, "visibility function", e, n, r);
		if (h) return a(g ?? !1, `The visibility rule returns ${g}. This feature will be ${g ? "visible" : "hidden"}.`);
		i("No visibility rule found matching name and variant.");
		let _ = n != null, v = s[c(e)], y = o(v, "visibility function (only name)", e, n, r);
		if (_ && typeof y == "boolean") return a(y, `Found a visibility rule for name ${e} without variants. The rule returns ${y}. => This feature will be ${y ? "visible" : "hidden"}.`);
		_ && i(`No rules found for name ${e} without variants.`);
		let b = s._default;
		return m(d, _, y, b != null, o(b, "defaultVisibility", e, n, r), e);
	}
	function m(e, t, n, r, o, s) {
		return t && typeof n == "boolean" ? a(n, `Found a visibility rule for name ${s} without variants. The rule returns ${n}. => This feature will be ${n ? "visible" : "hidden"}.`) : (t && i(`No rules found for name ${s} without variants.`), r ? a(o ?? !1, `Found a defaultVisibility rule. The rule returns ${o}. => This feature will be ${o ? "visible" : "hidden"}.`) : (i("No default rule found."), e ? a(!0, "Only the requiredVisibility rule was found. This returned true. => This feature will be visible.") : a(!1, "No rules were found. This feature will be hidden.")));
	}
	let h = {
		name: "feature-toggle-api",
		setData: function(e, n, i) {
			if (e === void 0) throw Error("setData(): The name of the feature must be defined, but is undefined");
			let a = f(e, i === void 0 ? void 0 : n, i === void 0 ? n : i);
			t.datas[a.key] = a.data, r("visibilityrule", a);
		},
		on(e, n, i) {
			t.listeners[e] = t.listeners[e] || [], t.listeners[e].push(n), r("registerEvent", { type: e }), !i?.ignorePreviousRules && Object.keys(t.visibilities).forEach((e) => {
				let r = u(e), i = t.visibilities[e];
				r.result = i(r), n(r);
			});
		},
		trigger: r,
		showLogs: function(e) {
			t.showLogs = e ?? !0;
		},
		isVisible(e, t, n) {
			return console.log("featureToggle.isVisible is deprecated. use featureToggle.isActive instead. This function will be removed in one of the next major versions."), p(e, t, n);
		},
		isActive: p,
		setFlag(e, n, i, a) {
			let o = d(e, n, i, a), s = f(o.name, o.variant, o.data, o.result);
			t.visibilities[s.key] = s.visibilityFunction, t.datas[s.key] = s.data, r("visibilityrule", s);
		},
		visibility: function(e, t, n, r) {
			console.log("featureToggle.visibility is deprecated. use featureToggle.setVisibility instead. This function will be removed in one of the next major versions."), h.setFlag(e, t, n, r);
		},
		requiredVisibility: function(e) {
			console.log("featureToggle.requiredVisibility is deprecated. use featureToggle.setRequiredFlag instead. This function will be removed in one of the next major versions."), h.setRequiredFlag(e);
		},
		defaultVisibility: function(e) {
			console.log("featureToggle.requiredVisibility is deprecated. use featureToggle.setRequiredFlag instead. This function will be removed in one of the next major versions."), h.setDefaultFlag(e);
		},
		setRequiredFlag(e) {
			if (typeof e != "function") throw Error("feature.setRequiredFlag(): 1st parameter must be a function, but is " + typeof e);
			t.visibilities._required = s(e);
		},
		setDefaultFlag(e) {
			if (typeof e != "function") throw Error("feature.defaultVisibility(): 1st parameter must be a function, but is " + typeof e);
			t.visibilities._default = s(e);
		},
		addPlugin: function(e) {
			if (t.usedPlugins.includes(e)) return;
			let n = e(h);
			for (let e of Object.keys(n)) h[e] = n[e];
			t.usedPlugins.push(e);
		}
	};
	return n(h), h;
}
//#endregion
export { o as htmlPlugin, r as urlPlugin, u as useFeatureToggle };

//# sourceMappingURL=feature-toggle.js.map