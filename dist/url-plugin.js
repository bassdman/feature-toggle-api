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
export { r as urlPlugin };

//# sourceMappingURL=url-plugin.js.map