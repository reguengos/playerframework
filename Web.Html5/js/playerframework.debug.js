window.PlayerFramework = {};
window.PlayerFramework.Plugins = {};

PlayerFramework.defaultOptions = {};
PlayerFramework.resources = [];

PlayerFramework.setDefaultOptions = function(options)
{
	/// <summary>
	///		Sets the default options for the player framework.
	///	</summary>
	/// <param name="options" type="Object">
	///		The options to merge with the default options.
	///	</param>

	PlayerFramework.merge(PlayerFramework.defaultOptions, options);
};

PlayerFramework.setResources = function(name, resources)
{
	/// <summary>
	///		Sets the resources for a language.
	///	</summary>
	/// <param name="name" type="String">
	///		The resource language name (e.g. en, es, en-us).
	///	</param>
	/// <param name="resources" type="Object">
	///		The resources to merge with the default options.
	///	</param>

	PlayerFramework.resources[name] = resources;
	PlayerFramework.setDefaultOptions(resources);
};

PlayerFramework.addEvent = function(obj, type, fun)
{
	/// <summary>
	///		Wraps the different ways to add event listeners to a DOM element or object.
	///		Based on: http://www.quirksmode.org/blog/archives/2005/10/_and_the_winner_1.html
	///	</summary>
	/// <param name="obj" type="Object">
	///		The DOM element or object to add an event listener to.
	///	</param>
	/// <param name="type" type="String">
	///		The type of event to listen for.
	///	</param>
	/// <param name="fun" type="Function">
	///		The function to call when the event is dispatched.
	///	</param>

	if (window.navigator.msPointerEnabled)
	{
		switch (type)
		{
			case "mousemove":
				obj.addEventListener("MSPointerMove", fun, false);
				break;

			case "mouseup":
				obj.addEventListener("MSPointerUp", fun, false);
				break;

			case "mousedown":
				obj.addEventListener("MSPointerDown", fun, false);
				break;

			case "mouseover":
				obj.addEventListener("MSPointerOver", fun, false);
				break;

			case "mouseout":
				window.addEventListener("MSPointerOver", function(e) {
					if (e.srcElement != obj)
						fun(e);
				}, true);

				break;

			default:
				obj.addEventListener(type, fun, false);
				break;
		}
	}
	else if (obj.addEventListener)
	{
		obj.addEventListener(type, fun, false);
	}
	else if (obj.attachEvent)
	{
		obj["e" + type + fun] = fun;
		obj[type + fun] = function() { obj["e" + type + fun](window.event); }
		obj.attachEvent("on" + type, obj[type + fun]);
	}
};

PlayerFramework.getComputedStyle = function(element, name)
{
	///	<summary>
	///		Gets the CSS style for a given element and given style name.
	///		Based on: http://www.quirksmode.org/dom/getstyles.html
	///	</summary>
	///	<param name="element" type="Object">
	///		The element object to get the style for.
	///	</param>
	///	<param name="name" type="String">
	///		The name of the style attribute.
	///	</param>
	///	<returns type="String" />

	if (element.currentStyle)
		return element.currentStyle[name];
	else if (window.getComputedStyle)
		return document.defaultView.getComputedStyle(element, null).getPropertyValue(name);
};

PlayerFramework.removeEvent = function(obj, type, fun)
{
	/// <summary>
	///		Wraps the different ways to remove event listeners from a DOM element or object.
	///		Based on: http://www.quirksmode.org/blog/archives/2005/10/_and_the_winner_1.html
	///	</summary>
	/// <param name="obj" type="Object">
	///		The DOM element or object to remove an event listener from.
	///	</param>
	/// <param name="type" type="String">
	///		The type of event to stop listening for.
	///	</param>
	/// <param name="fun" type="Function">
	///		The function that was to be called when the event was dispatched.
	///	</param>

	if (obj.removeEventListener)
	{
		obj.removeEventListener(type, fun, false);
	}
	else if (obj.detachEvent)
	{
		obj.detachEvent("on" + type, obj[type + fun]);
		obj[type + fun] = null;
		obj["e" + type + fun] = null;
	}
};

PlayerFramework.padString = function(value, padLength, padString)
{
	/// <summary>
	///		Creates a string of a specified length by appending the pad string to the original value.
	///	</summary>
	/// <param name="value" type="String">
	///		The value to pad.
	///	</param>
	/// <param name="padLength" type="Number">
	///		The desired length of the resulting string.
	///	</param>
	/// <param name="padString" type="String">
	///		The string to append the the original value.
	///	</param>
	///	<returns type="String" />

	var result = new String(value);
	
	while (result.length < padLength)
		result = padString + result;
	
	return result;
};

PlayerFramework.typeExtendsFrom = function(derived, base)
{
	/// <summary>
	///		Determines if a derived type extends from a base type.
	///	</summary>
	/// <param name="derived" type="Object">
	///		The derived type.
	///	</param>
	/// <param name="base" type="Object">
	///		The base type.
	///	</param>
	///	<returns type="Boolean" />

	return derived.prototype instanceof base;
};

PlayerFramework.proxy = function(context, fun)
{
	///	<summary>
	///		Creates a delegate function that executes the specified method in the correct context.
	///	</summary>
	///	<param name="context" type="Object">
	///		The instance whose method should be executed.
	///	</param>
	///	<param name="fun" type="Function">
	///		The function to execute.
	///	</param>
	///	<returns type="Function" />
	
	var proxy = function()
	{
		return fun.apply(context, arguments);
	};

	return proxy;
};

PlayerFramework.mouseEventProxy = function(element, eventType)
{
	///	<summary>
	///		Returns a function that, when called, dispatches a mouse event on the specified element.
	///	</summary>
	///	<param name="element" type="Object">
	///		The element from which to dispatch the event.
	///	</param>
	///	<param name="eventType" type="String">
	///		The type of event to dispatch.
	///	</param>
	///	<returns type="Function" />

	if (document.createEvent) {
	    return PlayerFramework.proxy(this, function(e)
	    {
	            var event = document.createEvent("MouseEvents");
	            event.initMouseEvent(eventType, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	            element.dispatchEvent(event);
	    });
    } else {
        return null;
    }
};

PlayerFramework.xhr = function(options, completeCallback, errorCallback)
{
	///	<summary>
	///		Wraps an XMLHttpRequest.
	///	</summary>
	///	<param name="options" type="Object">
	///		The options to use for the request (url, etc.)
	///	</param>
	///	<param name="completeCallback" type="Function">
	///		The function to call when the request has completed.
	///	</param>
	///	<param name="errorCallback" type="Function">
	///		The function to call when the request resulted in an error.
	///	</param>

	var request = null;
	
	// Set the inner request to wrap.
	if (window.XMLHttpRequest)
		request = new XMLHttpRequest();
	else if (window.ActiveXObject)
		request = new ActiveXObject("Microsoft.XMLHTTP");
	else
		throw new Error("XMLHttpRequest unavailable");

	request.onreadystatechange = function()
	{
		if (request.readyState == 4)
		{
			if(request.status >= 200 && request.status <= 300)
			{
				completeCallback(request);
			}
			else
			{
				errorCallback(request);
			}
		}
	};

	request.open(options.method || "GET", options.url, true);

	request.responseType = options.responseType || "";

	if (options.data)
	{
		request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		request.setRequestHeader("Connection", "close");
	}

	request.send(options.data);
};

PlayerFramework.merge = function(destination, source)
{
	///	<summary>
	///		Merges properties from a source object into a destination object.
	///	</summary>
	///	<param name="destination" type="Object">
	///		The destination object.
	///	</param>
	///	<param name="source" type="Object">
	///		The source object.
	///	</param>
	///	<returns type="Object" />

	if (!source)
		return;
	
	for (var i in source)
	{
		var destinationProperty = destination[i];
		var sourceProperty = source[i];
		
		if (sourceProperty == null)
			delete destination[i];
		else if (typeof(destinationProperty) == "object"
				&& typeof(sourceProperty) == "object"
				&& !(destinationProperty instanceof Array))
			PlayerFramework.merge(destinationProperty, sourceProperty);
		else
			destination[i] = sourceProperty;
	}
};

PlayerFramework.mergeOptions = function(superOptions, defaultOptions)
{
	var mergedOptions = {};
	PlayerFramework.merge(mergedOptions, superOptions);
	PlayerFramework.merge(mergedOptions, defaultOptions);
	return mergedOptions;
};

PlayerFramework.convertNodeListToArray = function(nodeList /*, thisp */)
{
	///	<summary>
	///		Takes a NodeList of DOM elements and converts it to an Array.
	///	</summary>
	///	<param name="nodeList" type="Object">
	///		NodeList of DOM elements.
	///	</param>
	///	<returns type="Array" />

	"use strict";

	if (nodeList === void 0 || nodeList === null)
		throw new TypeError();

	var t = Object(nodeList);
	var len = t.length >>> 0;

	var res = [];

	for (var i = t.length; i--; res.unshift(t[i])) {};
	
	return res;
};

PlayerFramework.getCharCode = function (e)
{
	///	<summary>
	///		Gets the character code for an event.
	///	</summary>
	///	<param name="e" type="Object">
	///		The event.
	///	</param>
	///	<returns type="Number" />

	if (e.which == null && (e.charCode != null || e.keyCode != null))
		return (e.charCode != null) ? e.charCode : e.keyCode;
	else
		return e.which;
};

PlayerFramework.getElementsByClass = function (className, node, tag)
{
	///	<summary>
	///		Gets all elements with the specified class name.
	///	</summary>
	///	<param name="className" type="String">
	///		The class name to filter by.
	///	</param>
	///	<param name="node" type="Object">
	///		The optional node to find children under (document is used if no node is specified).
	///	</param>
	///	<param name="tag" type="String">
	///		The optional tag name to filter by.
	///	</param>
	///	<returns type="Array" />

	var classElements = [];

	if (!node)
		node = document;

	if (!tag)
		tag = "*";
	
	var tagElements = node.getElementsByTagName(tag);
	var pattern = new RegExp("(^|\\s)" + className + "(\\s|$)");

	PlayerFramework.forEach(tagElements, function(element)
	{
		if (pattern.test(element.className))
			classElements.push(element);
	});

	return classElements;
};

PlayerFramework.getTotalOffsetLeft = function(element)
{
	///	<summary>
	///		Gets the left position relative to the top-most parent by recursively summing the left position of the parent.
	///	</summary>
	///	<param name="element" type="Number">
	///		The element to find the left position for.
	///	</param>
	///	<returns type="Number" />

	return element ? (element.offsetLeft + PlayerFramework.getTotalOffsetLeft(element.offsetParent)) : 0;
};

PlayerFramework.forEachAsync = function(array, fun /*, thisp */)
{
	///	<summary>
	///		Iterates over an array allowing the called function to explicitly continue iterating
	///		by calling a loop callback function passed to the called function.
	///	</summary>
	///	<param name="array" type="Array">
	///		The array to iterate over.
	///	</param>
	///	<param name="fun" type="Function">
	///		The function to call at each iteration.
	///	</param>

	"use strict";

	if (array === void 0 || array === null)
		throw new TypeError();

	var t = Object(array.concat());

	if (typeof fun !== "function")
		throw new TypeError();

	var loop = function()
	{
		var len = t.length >>> 0;
		if (len === 0)
			return;

		var thisp = arguments[2];
		var i = t.shift();

		fun.call(thisp, loop, i);
	};
	loop();
};

PlayerFramework.first = function(array, fun /*, thisp */)
{
	///	<summary>
	///		Gets the first item in the array that causes the function to return true when the
	///		function is called with the item as a parameter.
	///	</summary>
	///	<param name="array" type="Array">
	///		The array to iterate over.
	///	</param>
	///	<param name="fun" type="Function">
	///		The function to call at each iteration that must return a boolean value to be returned
	///		as the first item.
	///	</param>
	///	<returns type="Object" />

	"use strict";

	if (array === void 0 || array === null)
		throw new TypeError();

	var t = Object(array);
	var len = t.length >>> 0;
	if (typeof fun !== "function")
		throw new TypeError();

	var thisp = arguments[2];
	for (var i = 0; i < len; i++)
	{
		if (i in t && fun.call(thisp, t[i], i, t))
			return t[i];
	}

	return null;
};

PlayerFramework.filter = function(array, fun /*, thisp */)
{
	///	<summary>
	///		Gets all items in the array that cause the function to return true when the function is
	///		called with the item as a parameter.
	///		Based on: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/filter#Compatibility
	///	</summary>
	///	<param name="array" type="Array">
	///		The array to iterate over.
	///	</param>
	///	<param name="fun" type="Function">
	///		The function to call at each iteration that must return a boolean value to be included
	///		in the resulting array.
	///	</param>
	///	<returns type="Array" />

	"use strict";

	if (array === void 0 || array === null)
		throw new TypeError();

	var t = Object(array);
	var len = t.length >>> 0;
	if (typeof fun !== "function")
		throw new TypeError();

	var res = [];
	var thisp = arguments[2];
	for (var i = 0; i < len; i++)
	{
		if (i in t)
		{
		var val = t[i]; // in case fun mutates this
		if (fun.call(thisp, val, i, t))
			res.push(val);
		}
	}

	return res;
};

PlayerFramework.forEach = function(array, fun /*, thisp */)
{
	///	<summary>
	///		Iterates over each item in the array.
	///		Based on: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach#Compatibility
	///	</summary>
	///	<param name="array" type="Array">
	///		The array to iterate over.
	///	</param>
	///	<param name="fun" type="Function">
	///		The function to call at each iteration.
	///	</param>

	"use strict";

	if (array === void 0 || array === null)
		throw new TypeError();

	var t = Object(array);
	var len = t.length >>> 0;
	if (typeof fun !== "function")
		throw new TypeError();

	var thisp = arguments[2];
	for (var i = 0; i < len; i++)
	{
		if (i in t)
			fun.call(thisp, t[i], i, t);
	}
};

PlayerFramework.binarySearch = function (array, value, comparer) {
    /// <summary>Searches a sorted array for the specified value using the binary search algorithm.</summary>
    /// <param name="array" type="Array">The array to search.</param>
    /// <param name="value" type="Object">The value to search for.</param>
    /// <param name="comparer" type="Function">The comparison function by which the array is sorted.</param>
    /// <returns type="Number">The lowest index of the value if found, otherwise the insertion point.</returns>

    var left = 0;
    var right = array.length;
    var middle, compareResult, found;

    while (left < right) {
        middle = (left + right) >> 1;
        compareResult = comparer(value, array[middle]);
        if (compareResult > 0) {
            left = middle + 1;
        } else {
            right = middle;
            found = !compareResult;
        }
    }

    return found ? left : ~left;
};

PlayerFramework.binaryInsert = function (array, value, comparer) {
    /// <summary>Inserts a value into a sorted array if it does not already exist.</summary>
    /// <param name="array" type="Array">The target array.</param>
    /// <param name="value" type="Object">The value to insert.</param>
    /// <param name="comparer" type="Function">The comparison function by which the array is sorted.</param>
    /// <returns type="Boolean">True if the value was inserted.</returns>

    var index = PlayerFramework.binarySearch(array, value, comparer);

    if (index < 0) {
        array.splice(-(index + 1), 0, value);
        return true;
    }

    return false;
};

PlayerFramework.getArray = function (obj) {
    /// <summary>Gets an array from an "enumerable" object.</summary>
    /// <param name="obj" type="Object">The target object.</param>
    /// <returns type="Array">The array.</returns>

    if (obj) {
        if (Array.isArray(obj)) {
            return obj;
        } else if (typeof obj.length !== "undefined") {
            return Array.prototype.slice.call(obj);
        } else if (typeof obj.first === "function") {
            var array = [];

            for (var i = obj.first() ; i.hasCurrent; i.moveNext()) {
                array.push(i.current);
            }

            return array;
        }
    }

    throw invalidArgument;
};

PlayerFramework.parseXml = function (data) {
    var xml;

    try {
        if (window.DOMParser) {
            var domParser = new DOMParser();
            xml = domParser.parseFromString(data, "application/xml");
        }
        else {
            xml = new ActiveXObject("Microsoft.XMLDOM");
            xml.async = false;
            xml.loadXML(data);
        }
    }
    catch (err) {
        xml = null;
    }

    return xml;
};

PlayerFramework.requestAnimationFrame = (function()
{
	///	<summary>
	///		Sets the requestAnimationFrame function using any available browser-specific
	///		requestAnimationFrame or using setTimeout as a substitute. 
	///		Based on: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	///	</summary>
	///	<returns type="Function" />

	var requestAnimationFrameFunction =
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback, element)
		{
			window.setTimeout(callback, 1000 / 60);
		};

	return PlayerFramework.proxy(window, requestAnimationFrameFunction);
})();

PlayerFramework.createElement = function(parentNode, jsonml)
{
	///	<summary>
	///		Creates an HTML element given the formatted JSONML array.
	///	</summary>
	///	<param name="parentNode" type="Object">
	///		The optional parent node to append the created element to.
	///	</param>
	///	<param name="jsonml" type="Array">
	///		The JSONML array containing the tag name and optional attributes and nested elements.
	///	</param>
	///	<returns type="Object" />
	
	if (!(jsonml instanceof Array) || jsonml.length === 0 || typeof(jsonml[0]) !== "string")
		throw new Error("Invalid JSONML.");

	var element = document.createElement(jsonml[0]);
	var attributes = jsonml[1];
	
	// Parse and set the element attributes if specified.
	if (attributes && typeof(attributes) === "object" && !(attributes instanceof Array)) 
	{			
		for (var key in attributes)
		{
			var value = attributes[key];

			if (value !== null && typeof(value) !== "undefined")
			{
				if (typeof(value) !== "string")
					element[key] = value;
				else
					element.setAttribute(key, value);
			}
		}
	}
	
	// Append child nodes.
	for (var i = 1; i < jsonml.length; i++) 
	{
		var childJsonml = jsonml[i];

		if (childJsonml instanceof Array)
			PlayerFramework.createElement(element, childJsonml);
		else if (typeof(childJsonml) === "string")
			element.appendChild(document.createTextNode(childJsonml));
	}

	if (parentNode)
		parentNode.appendChild(element);

	return element;
};

PlayerFramework.domReady = (function()
{
	/// <summary>
	///		Determines when the DOM is fully loaded and fires any registered handlers.
	///		Simplified adaptation based on work by Dean Edwards, John Resig, Matthias Miller, and Diego Perini.
	/// </summary>

	var handlers = [],
		loaded = false;
		
	var domContentLoaded = function ()
	{
		if (document.removeEventListener)
			document.removeEventListener("DOMContentLoaded", domContentLoaded, false);
		else if (document.detachEvent && document.readyState === "complete")
			document.detachEvent("onreadystatechange", domContentLoaded);

		ready();
	};

	var ready = function ()
	{
		if (!loaded)
		{
			loaded = true;

			for (var i = 0, len = handlers.length; i < len; i++)
				handlers[i].call(document);
		}
	};

	if (document.addEventListener)
	{
		document.addEventListener("DOMContentLoaded", domContentLoaded, false);
		window.addEventListener("load", ready, false);
	}
	else if (document.attachEvent)
	{
		document.attachEvent("onreadystatechange", domContentLoaded);
		window.attachEvent("onload", ready);

		if (document.documentElement.doScroll)
		{
			var intervalId = window.setInterval(function ()
			{
				try
				{
					// Throws an error if document is not ready yet
					document.documentElement.doScroll("left");
					window.clearInterval(intervalId);
					ready();
				} catch (e) {}
			}, 10);
		}
	}

	return function (handler)
	{
		// If the DOM is already loaded, execute the handler
		if (loaded)
			handler.call(document);
		else
			handlers.push(handler);
	};
})();
﻿(function()
{
	///	<summary>
	///		Creates the Class extendable structure used by all objects in the framework.
	///		Based on: http://ejohn.org/blog/simple-javascript-inheritance/
	///		"Simple JavaScript Inheritance"
	///		By John Resig http://ejohn.org/
	///		MIT Licensed.
	///	</summary>

	var initializing = false;
	var functionTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

	// The base Class implementation
	PlayerFramework.Class = function() {};
	
	// Create a new Class that inherits from this class
	PlayerFramework.Class.extend = function(properties)
	{
		var _super = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var prototype = new this();
		initializing = false;
		
		// Copy the properties over onto the new prototype
		for (var name in properties)
		{
			// Check if we're overwriting an existing function
			prototype[name] = typeof properties[name] == "function" && 
			typeof _super[name] == "function" && functionTest.test(properties[name]) ?
			(function(name, fun)
			{
				return function()
				{
					var tmp = this._super;

					// Add a new ._super() method that is the same method
					// but on the super-class
					this._super = _super[name];

					// The method only need to be bound temporarily, so we
					// remove it when we're done executing
					var ret = fun.apply(this, arguments);
					this._super = tmp;

					return ret;
				};
			})(name, properties[name]) :
			properties[name];
		}

		// The dummy class constructor
		function Class()
		{
			// All construction is actually done in the init method
			if (!initializing && this.init)
				this.init.apply(this, arguments);
		}

		// Populate our constructed prototype object
		Class.prototype = prototype;

		// Enforce the constructor to be what we expect
		Class.constructor = Class;

		// And make this class extendable
		Class.extend = arguments.callee;
		
		return Class;
	};
})();
﻿PlayerFramework.Object = PlayerFramework.Class.extend(
{
	init: function(options)
	{
		///	<summary>
		///		Initializes an PlayerFramework Object, the base for all objects in the framework.
		///		Stores the object options and provides event listening and dispatching support.
		///	</summary>

		this.options = options || {};
		this.eventListeners = [];
	},

	addEventListener: function (type, callback, capture) 
	{
		///	<summary>
		///		Adds an event listener for a derived class to be called when the event is dispatched.
		///	</summary>
		///	<param name="type" type="String">
		///		The type of event to listen for.
		///	</param>
		///	<param name="callback" type="Function">
		///		The function to call when the event is dispatched.
		///	</param>
		///	<param name="capture" type="Boolean">
		///		Indicates whether the event should be prevented from bubbling up (included for future use and to match the syntax of Node.addEventListener).
		///	</param>

		this.eventListeners.push(
		{
			type: type,
			callback: callback,
			capture: capture
		}); 
	},

	dispatchEvent: function(eventObject)
	{
		///	<summary>
		///		Dispatches an event for a derived class and calls each listener callback.
		///	</summary>
		///	<param name="eventObject" type="Object">
		///		The object containing the type to match and the listener callback.
		///	</param>
		
		PlayerFramework.forEach(this.eventListeners, function(l)
		{
			if (l.type === eventObject.type)
				l.callback(eventObject);
		});
	},

	mergeOptions: function(userOptions, defaultOptions)
	{
		///	<summary>
		///		Merges user specified options with default options.
		///	</summary>
		///	<param name="userOptions" type="Object">
		///		The object containing options specified by the caller creating the instance.
		///	</param>
		///	<param name="defaultOptions" type="Object">
		///		The object containing options specified by the class itself.
		///	</param>

		PlayerFramework.merge(this.options, defaultOptions);
		PlayerFramework.merge(this.options, userOptions);
	}
});
﻿PlayerFramework.Plugin = PlayerFramework.Object.extend(
{
	defaultOptions: function(player)
	{
		return {};
	},

	isEnabled: function(player, options)
	{
		return true;
	},

	init: function(player, options)
	{
		///	<summary>
		///		The plugin base from which all plugins should be derived.
		///		Stores a reference to the Player object for manipulation by the plugin.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>

		this._super(options);

		this.player = player;
	}
});
﻿PlayerFramework.ModulePlugin = PlayerFramework.Plugin.extend(
{
	init: function(player, options)
	{
		///	<summary>
		///		The plugin base for singleton plugins that should only have one instance per
		///		Player object.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>

		this._super(player, options);
		
		if (this.options.playerExtensionPropertyName)
			this.player[this.options.playerExtensionPropertyName] = this;
	}
});
﻿PlayerFramework.MediaPlugin = PlayerFramework.Plugin.extend(
{
	init: function(player, options, playerOptions)
	{
		///	<summary>
		///		Initializes the MediaPlugin base. Used as a base class for plugins that display media content in any form.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the MediaPlugin.
		///	</param>
		///	<param name="playerOptions" type="Object">
		///		The merged player options for the current media source.
		///	</param>
		///	<returns type="MediaPlugin" />

		this._super(player, options);

		this.playerOptions = playerOptions;
		this.element = null;
	},

	// Functions
	checkSupport: function(callback)
	{
		///	<summary>
		///		When overridden in a derived class, determines support for the media element.
		///	</summary>
		///	<param name="callback" type="Function">
		///		The function to call after support has been determined.
		///	</param>

		throw new Error("Not implemented.");
	}
});
﻿PlayerFramework.VideoMediaPlugin = PlayerFramework.MediaPlugin.extend(
{
	init: function(player, options, playerOptions)
	{
		///	<summary>
		///		Initializes the VideoMediaPlugin base.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the VideoMediaPlugin.
		///	</param>
		///	<param name="playerOptions" type="Object">
		///		The merged player options for the current media source.
		///	</param>
		///	<returns type="VideoMediaPlugin" />

		this._super(player, options, playerOptions);

		this.canPlayEvent = { type: "canplay" };
		this.canPlayThroughEvent = { type: "canplaythrough" };
		this.endedEvent = { type: "ended" };
		this.errorEvent = { type: "error" };
		this.fullScreenChangeEvent = { type: "fullscreenchange" };
		this.loadedDataEvent = { type: "loadeddata" };
		this.loadedMetadataEvent = { type: "loadedmetadata" };
		this.loadedMediaPluginEvent = { type: "loadedmediaplugin" };
		this.mouseOutEvent = { type: "mouseout" };
		this.mouseOverEvent = { type: "mouseover" };
		this.networkStateChangeEvent = { type: "networkstatechange" };
		this.pauseEvent = { type: "pause" };				
		this.playEvent = { type: "play" };
		this.progressEvent = { type: "progress" };
		this.seekedEvent = { type: "seeked" };
		this.seekingEvent = { type: "seeking" };
		this.timeUpdateEvent = { type: "timeupdate" };
		this.unloadingMediaPluginEvent = { type: "unloadingmediaplugin" };
		this.volumeChangeEvent = { type: "volumechange" };

		// Extend player
		// Properties
		player.buffered = PlayerFramework.proxy(this, this.buffered);
		player.canPlayType = PlayerFramework.proxy(this, this.canPlayType);
		player.controls = PlayerFramework.proxy(this, this.controls);
		player.currentTime = PlayerFramework.proxy(this, this.currentTime);
		player.displayingFullscreen = PlayerFramework.proxy(this, this.displayingFullscreen);
		player.duration = PlayerFramework.proxy(this, this.duration);
		player.error = PlayerFramework.proxy(this, this.error);
		player.muted = PlayerFramework.proxy(this, this.muted);
		player.networkState = PlayerFramework.proxy(this, this.networkState);
		player.paused = PlayerFramework.proxy(this, this.paused);
		player.poster = PlayerFramework.proxy(this, this.poster);
		player.preload = PlayerFramework.proxy(this, this.preload);
		player.readyState = PlayerFramework.proxy(this, this.readyState);
		player.scrubbing = PlayerFramework.proxy(this, this.seeking);
		player.seeking = PlayerFramework.proxy(this, this.seeking);
		player.volume = PlayerFramework.proxy(this, this.volume);

		// Functions
		player.pause = PlayerFramework.proxy(this, this.pause);
		player.play = PlayerFramework.proxy(this, this.play);
	},

	// Properties
	buffered: function()
	{
		///	<summary>
		///		When overridden in a derived class, gets a TimeRanges object that represents the ranges of the media resource.
		///	</summary>
		///	<returns type="TimeRanges" />

		throw new Error("Not implemented.");
	},

	controls: function(value)
	{
		///	<summary>
		///		When overridden in a derived class, gets or sets a boolean indicating whether the media element displays a control strip.
		///	</summary>
		///	<param name="value" type="Boolean" />
		///	<returns type="Boolean" />

		throw new Error("Not implemented.");
	},

	currentTime: function(value)
	{
		///	<summary>
		///		When overridden in a derived class, gets or sets the current playback position of the media element expressed in seconds.
		///	</summary>
		///	<param name="value" type="Number">
		///		The playback position to seek to.
		///	</param>
		///	<returns type="Number" />

		throw new Error("Not implemented.");
	},

	displayingFullscreen: function()
	{
		///	<summary>
		///		Gets a boolean value indicating whether the media element is displaying full screen.
		///	</summary>
		///	<returns type="Boolean" />

		if (!this.element || !this.element.parentNode)
			return false;

		return this.element.parentNode.className === "pf-container pf-full-browser";
	},

	duration: function()
	{
		///	<summary>
		///		When overridden in a derived class, gets the length of the media loaded in the media element expressed in seconds.
		///	</summary>
		///	<returns type="Number" />

		throw new Error("Not implemented.");
	},

	error: function()
	{
		///	<summary>
		///		Gets the last error the media element encountered.
		///	</summary>
		///	<returns type="Number" />

		throw new Error("Not implemented.");
	},

	muted: function(value)
	{
		///	<summary>
		///		When overridden in a derived class, gets or sets a boolean value indicating whether the media element is muted.
		///	</summary>
		///	<param name="value" type="Boolean" />
		///	<returns type="Boolean" />

		throw new Error("Not implemented.");
	},

	paused: function()
	{
		///	<summary>
		///		When overridden in a derived class, gets a boolean value indicating whether the media element is paused.
		///	</summary>
		///	<returns type="Boolean" />

		throw new Error("Not implemented.");
	},
	
	networkState: function()
	{
		///	<summary>
		///		Returns a value that expresses the current state of the element with respect to
		///		loading a resource over the network, from
		///		PlayerFramework.VideoMediaPlugin.NetworkState.
		///	</summary>
		///	<returns type="Number" />

		throw new Error("Not implemented.");
	},

	poster: function()
	{
		///	<summary>
		///		When overridden in a derived class, gets the URL of the poster image to display before initiating playback.
		///	</summary>
		///	<returns type="Boolean" />

		throw new Error("Not implemented.");
	},

	preload: function()
	{
		///	<summary>
		///		Gets the preload state of "none", "metadata", or "auto".
		///	</summary>
		///	<returns type="String" />

		throw new Error("Not implemented.");
	},

	readyState: function()
	{
		///	<summary>
		///		When overridden in a derived class, returns a value that expresses the current state
		///		of the element with respect to rendering the current playback position, from
		///		PlayerFramework.VideoMediaPlugin.ReadyState.
		///	</summary>
		///	<returns type="Number" />

		throw new Error("Not implemented.");
	},

	scrubbing: function()
	{
		///	<summary>

		///	</summary>
		///	<returns type="Boolean" />

		throw new Error("Not implemented.");
	},

	seeking: function()
	{
		///	<summary>

		///	</summary>
		///	<returns type="Boolean" />

		throw new Error("Not implemented.");
	},

	supportsVolumeSetter: function()
	{
		///	<summary>
		///		When overridden in a derived class, gets a boolean value indicating whether the media element supports setting the volume.
		///	</summary>
		///	<returns type="Boolean" />

		throw new Error("Not implemented.");
	},

	volume: function(value)
	{
		///	<summary>
		///		When overridden in a derived class, gets or sets the volume level in a range of 0.0 to 1.0.
		///	</summary>
		///	<param name="value" type="Number" />
		///	<returns type="Number" />

		throw new Error("Not implemented.");
	},

	// Functions
	canPlayType: function()
	{
		///	<summary>
		///		When overridden in a derived class, gets a boolean indicating whether the media element can play content of the specified type.
		///	</summary>
		///	<param name="type" type="String" />
		///	<returns type="Boolean" />

		throw new Error("Not implemented.");
	},

	pause: function()
	{
		///	<summary>
		///		When overridden in a derived class, pauses the media.
		///	</summary>

		throw new Error("Not implemented.");
	},

	play: function()
	{
		///	<summary>
		///		When overridden in a derived class, plays the media.
		///	</summary>

		throw new Error("Not implemented.");
	},

	setup: function()
	{
		///	<summary>
		///		When overridden in a derived class, completes remaining setup operations after the media plugin is selected as the supported media plugin.
		///	</summary>

		throw new Error("Not implemented.");
	},

	// Event Handlers
	onCanPlay: function()
	{
		///	<summary>
		///		Dispatches the "canplay" event.
		///	</summary>
		
		this.player.dispatchEvent(this.canPlayEvent);
	},

	onCanPlayThrough: function()
	{
		///	<summary>
		///		Dispatches the "canplaythrough" event.
		///	</summary>
		
		this.player.dispatchEvent(this.canPlayThroughEvent);
	},

	onEnded: function()
	{
		///	<summary>
		///		Dispatches the "ended" event on behalf of the Player object.
		///	</summary>

		this.player.dispatchEvent(this.endedEvent);
	},

	onError: function()
	{
		///	<summary>
		///		Dispatches the "error" event on behalf of the Player object.
		///	</summary>

		this.player.dispatchEvent(this.errorEvent);
	},

	onFullScreenChange: function()
	{
		///	<summary>
		///		Dispatches the "fullscreenchange" event on behalf of the Player object.
		///	</summary>

		this.player.dispatchEvent(this.fullScreenChangeEvent);
	},

	onLoadedData: function()
	{
		///	<summary>
		///		Dispatches the "loadeddata" event.
		///	</summary>
		
		this.player.dispatchEvent(this.loadedDataEvent);
	},

	onLoadedMetadata: function()
	{
		///	<summary>
		///		Dispatches the "loadedmetadata" event.
		///	</summary>
		
		this.player.dispatchEvent(this.loadedMetadataEvent);
	},

	onLoadedMediaPlugin: function()
	{
		///	<summary>
		///		Dispatches the "loadedMediaPlugin" event on behalf of the Player object.
		///	</summary>

		this.player.dispatchEvent(this.loadedMediaPluginEvent);
	},

	onNetworkStateChange: function()
	{
		///	<summary>
		///		Dispatches the "networkstatechange" event on behalf of the Player object.
		///	</summary>
		
		this.player.dispatchEvent(this.networkStateChangeEvent);
	},

	onMouseOut: function()
	{
		///	<summary>
		///		Dispatches the "mouseout" event on behalf of the Player object.
		///	</summary>

		this.player.dispatchEvent(this.mouseOutEvent);
	},

	onMouseOver: function()
	{
		///	<summary>
		///		Dispatches the "mouseover" event on behalf of the Player object.
		///	</summary>

		this.player.dispatchEvent(this.mouseOverEvent);
	},

	onPause: function()
	{
		///	<summary>
		///		Dispatches the "pause" event on behalf of the Player object.
		///	</summary>

		this.player.dispatchEvent(this.pauseEvent);
	},

	onPlay: function()
	{	
		///	<summary>
		///		Dispatches the "play" event on behalf of the Player object.
		///	</summary>
		
		this.player.dispatchEvent(this.playEvent);
	},

	onProgress: function()
	{
		///	<summary>
		///		Dispatches the "progress" event on behalf of the Player object.
		///	</summary>

		this.player.dispatchEvent(this.progressEvent);
	},

	onSeeked: function(e)
	{
		///	<summary>
		///		Called when the media plugin has completed seeking.
		///	</summary>

		this.player.dispatchEvent(this.seekedEvent);
	},
	
	onSeeking: function(e)
	{
		///	<summary>
		///		Called continuously while the media plugin is seeking.
		///	</summary>

		this.player.dispatchEvent(this.seekingEvent);
	},

	onTimeUpdate: function()
	{
		///	<summary>
		///		Dispatches the "timeupdate" event on behalf of the Player object.
		///	</summary>
		
		this.player.dispatchEvent(this.timeUpdateEvent);
	},

	onUnloadingMediaPlugin: function()
	{
		///	<summary>
		///		Dispatches the "unloadingmediaplugin" event.
		///	</summary>

		this.player.dispatchEvent(this.unloadingMediaPluginEvent);
	},

	onVolumeChange: function()
	{
		///	<summary>
		///		Dispatches the "volumechange" event on behalf of the Player object.
		///	</summary>

		this.player.dispatchEvent(this.volumeChangeEvent);
	}
});

PlayerFramework.VideoMediaPlugin.ReadyState =
{
	///	<summary>
	///		A JSON object used to store the values of the media plugin's ready state.
	///	</summary>

	HAVE_NOTHING: 0,
	HAVE_METADATA: 1,
	HAVE_CURRENT_DATA: 2,
	HAVE_FUTURE_DATA: 3,
	HAVE_ENOUGH_DATA: 4
};

PlayerFramework.VideoMediaPlugin.NetworkState =
{
	///	<summary>
	///		A JSON object used to store the values of the media plugin's network state.
	///	</summary>

	NETWORK_EMPTY: 0,
	NETWORK_IDLE: 1,
	NETWORK_LOADING: 2,
	NETWORK_NO_SOURCE: 3
};

PlayerFramework.VideoMediaPlugin.MediaError =
{
	///	<summary>
	///		A JSON object used to store the values of the media plugin's media error states.
	///	</summary>

	MEDIA_ERR_ABORTED: 1,
	MEDIA_ERR_NETWORK: 2,
	MEDIA_ERR_DECODE: 3,
	MEDIA_ERR_SRC_NOT_SUPPORTED: 4
};
﻿PlayerFramework.ControlPlugin = PlayerFramework.ModulePlugin.extend(
{
	init: function(player, options)
	{
		///	<summary>
		///		Initializes the ControlPlugin base and listens for events needed to change the state of the controls.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the ControlPlugin.
		///	</param>
		///	<returns type="ControlPlugin" />
		
		this._super(player, options);

		this.player.addEventListener("canplaythrough", PlayerFramework.proxy(this, this.onCanPlayThrough), false);
		this.player.addEventListener("ended", PlayerFramework.proxy(this, this.onEnded), false);
		this.player.addEventListener("error", PlayerFramework.proxy(this, this.onError), false);
		this.player.addEventListener("fullscreenchange", PlayerFramework.proxy(this, this.onFullScreenChange), false);
		this.player.addEventListener("loadedmediaplugin", PlayerFramework.proxy(this, this.onLoadedMediaPlugin), false);
		this.player.addEventListener("mouseout", PlayerFramework.proxy(this, this.onPlayerMouseOut), false);
		this.player.addEventListener("mouseover", PlayerFramework.proxy(this, this.onPlayerMouseOver), false);
		this.player.addEventListener("networkstatechange", PlayerFramework.proxy(this, this.onNetworkStateChange), false);
		this.player.addEventListener("pause", PlayerFramework.proxy(this, this.onPause), false);
		this.player.addEventListener("play", PlayerFramework.proxy(this, this.onPlay), false);
		this.player.addEventListener("progress", PlayerFramework.proxy(this, this.onProgress), false);
		this.player.addEventListener("ready", PlayerFramework.proxy(this, this.onReady), false);
		this.player.addEventListener("seeked", PlayerFramework.proxy(this, this.onSeeked), false);
		this.player.addEventListener("seeking", PlayerFramework.proxy(this, this.onSeeking), false);
		this.player.addEventListener("timeupdate", PlayerFramework.proxy(this, this.onTimeUpdate), false);
		this.player.addEventListener("unloadingmediaplugin", PlayerFramework.proxy(this, this.onUnloadingMediaPlugin), false);
		this.player.addEventListener("volumechange", PlayerFramework.proxy(this, this.onVolumeChange), false);
	},

	// Properties
	mediaPlugin: function()
	{
		///	<summary>
		///		Returns the player's media plugin for convenience.
		///	</summary>

		return this.player.mediaPlugin;
	},

	// Event Handlers
	onCanPlayThrough: function(e)
	{
		///	<summary>
		///		Called when the media element can play through to the end without having to stop for further buffering.
		///	</summary>
	},

	onEnded: function(e)
	{
		///	<summary>
		///		Called when the media playback ends.
		///	</summary>
	},

	onError: function(e)
	{
		///	<summary>
		///		Called when the media element encounters an error.
		///	</summary>
	},

	onFullScreenChange: function(e)
	{
		///	<summary>
		///		Called when the media element changes to and from full screen.
		///	</summary>
	},

	onLoadedMediaPlugin: function(e)
	{
		///	<summary>
		///		Called after the media plugin is loaded.
		///	</summary>
	},

	onPlayerMouseOut: function(e)
	{
		///	<summary>
		///		Called when the mouse leaves the player.
		///	</summary>
	},

	onPlayerMouseOver: function(e)
	{
		///	<summary>
		///		Called when the mouse enters the player.
		///	</summary>
	},

	onNetworkStateChange: function(e)
	{
		///	<summary>
		///		Called when the media element's network state changes.
		///	</summary>
	},

	onPause: function(e)
	{
		///	<summary>
		///		Called when the media pauses.
		///	</summary>
	},

	onPlay: function(e)
	{
		///	<summary>
		///		Called when the media plays.
		///	</summary>
	},

	onProgress: function(e)
	{
		///	<summary>
		///		Called when the media buffers more data.
		///	</summary>
	},

	onReady: function(e)
	{
		///	<summary>
		///		Called when the player is ready for playback.
		///	</summary>
	},

	onSeeked: function(e)
	{
		///	<summary>
		///		
		///	</summary>
	},
	
	onSeeking: function(e)
	{
		///	<summary>
		///		
		///	</summary>
	},
	
	onTimeUpdate: function(e)
	{
		///	<summary>
		///		Called when the current time of the media is updated.
		///	</summary>
	},

	onUnloadingMediaPlugin: function(e)
	{
		///	<summary>
		///		Called when the media element unloads.
		///	</summary>
	},

	onVolumeChange: function(e)
	{
		///	<summary>
		///		Called when the volume level of the media changes.
		///	</summary>
	}
});
﻿PlayerFramework.Plugins.VideoElementMediaPluginBase = PlayerFramework.VideoMediaPlugin.extend(
{
	defaultOptions: function(player, playerOptions)
	{
		return PlayerFramework.mergeOptions(this._super(),
		{
			"class": "pf-video",
			controls: false,
			supportsTrackElements: true
		});
	},

	init: function(player, options, playerOptions)
	{
		///	<summary>
		///		Initializes the VideoMediaPlugin that wraps the HTML5 video element.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the VideoElementMediaPluginBase.
		///	</param>
		///	<param name="playerOptions" type="Object">
		///		The merged player options for the current media source.
		///	</param>
		///	<returns type="VideoElementMediaPluginBase" />

		this._super(player, options, playerOptions);
		
		if (this.options.element)
		{
			if (this.options.element.tagName && this.options.element.tagName.toLowerCase() !== "video")
				throw new TypeError("options.element not a video tag.");

			this.element = this.options.element;
		}
	},

	// VideoMediaPlugin Properties
	buffered: function()
	{
		///	<summary>
		///		Gets a TimeRanges object that represents the ranges of the media resource.
		///	</summary>
		///	<returns type="TimeRanges" />

		return this.element.buffered;
	},

	controls: function(value)
	{
		///	<summary>
		///		Gets or sets a boolean indicating whether the media element displays a control strip.
		///	</summary>
		///	<param name="value" type="Boolean" />
		///	<returns type="Boolean" />

		if (value !== undefined)
			this.element.controls = value;

		return this.element.controls;
	},

	currentTime: function(value)
	{
		///	<summary>
		///		Gets or sets the current playback position of the media element expressed in seconds.
		///	</summary>
		///	<param name="value" type="Number">
		///		The playback position to seek to.
		///	</param>
		///	<returns type="Number" />

		if (value !== undefined)
			this.element.currentTime = value;
		
		return this.element.currentTime;
	},

	duration: function()
	{
		///	<summary>
		///		Gets the length of the media loaded in the media element expressed in seconds.
		///	</summary>
		///	<returns type="Number" />

		return this.element.duration || 0;
	},

	error: function()
	{
		///	<summary>
		///		Gets the last error the media element encountered.
		///	</summary>
		///	<returns type="Number" />

		return this.element.error;
	},

	ended: function()
	{
		///	<summary>
		///		Gets a boolean value indicating whether the media element has ended.
		///	</summary>
		///	<returns type="Boolean" />

		return this.element.ended;
	},

	muted: function(value)
	{
		///	<summary>
		///		Gets or sets a boolean value indicating whether the media element is muted.
		///	</summary>
		///	<param name="value" type="Boolean" />
		///	<returns type="Boolean" />

		if (value !== undefined)
			this.element.muted = value;
		
		return this.element.muted;
	},

	networkState: function()
	{
		///	<summary>
		///		Returns a value that expresses the current state of the element with respect to
		///		loading a resource over the network, from
		///		PlayerFramework.VideoMediaPlugin.NetworkState.
		///	</summary>
		///	<returns type="Number" />

		var networkState;

		switch (this.element.networkState)
		{
			case HTMLMediaElement.NETWORK_EMPTY:
				networkState = PlayerFramework.VideoMediaPlugin.NetworkState.NETWORK_EMPTY;
				break;

			case HTMLMediaElement.NETWORK_IDLE:
				networkState = PlayerFramework.VideoMediaPlugin.NetworkState.NETWORK_IDLE;
				break;

			case HTMLMediaElement.NETWORK_LOADING:
				networkState = PlayerFramework.VideoMediaPlugin.NetworkState.NETWORK_LOADING;
				break;

			case HTMLMediaElement.NETWORK_LOADED:
				// Available only in Safari and not in the W3C spec; Mapped to NETWORK_IDLE.
				networkState = PlayerFramework.VideoMediaPlugin.NetworkState.NETWORK_IDLE;
				break;

			case HTMLMediaElement.NETWORK_NO_SOURCE:
				networkState = PlayerFramework.VideoMediaPlugin.NetworkState.NETWORK_NO_SOURCE;
				break;
		}

		return networkState;
	},

	paused: function()
	{
		///	<summary>
		///		Gets a boolean value indicating whether the media element is paused.
		///	</summary>
		///	<returns type="Boolean" />

		return this.element.paused;
	},

	poster: function()
	{
		///	<summary>
		///		Gets the URL of the poster image to display before initiating playback.
		///	</summary>
		///	<returns type="Boolean" />

		return this.element.poster;
	},

	preload: function()
	{
		///	<summary>
		///		Gets the preload state of "none", "metadata", or "auto".
		///	</summary>
		///	<returns type="String" />

		return this.element.preload;
	},

	readyState: function()
	{
		///	<summary>
		///		Returns a value that expresses the current state of the element with respect to
		///		rendering the current playback position, from
		///		PlayerFramework.VideoMediaPlugin.ReadyState.
		///	</summary>
		///	<returns type="Number" />

		var readyState;

		switch (this.element.readyState)
		{
			case HTMLMediaElement.HAVE_NOTHING:
				readyState = PlayerFramework.VideoMediaPlugin.ReadyState.HAVE_NOTHING;
				break;

			case HTMLMediaElement.HAVE_METADATA:
				readyState = PlayerFramework.VideoMediaPlugin.ReadyState.HAVE_METADATA;
				break;

			case HTMLMediaElement.HAVE_CURRENT_DATA:
				readyState = PlayerFramework.VideoMediaPlugin.ReadyState.HAVE_CURRENT_DATA;
				break;

			case HTMLMediaElement.HAVE_FUTURE_DATA:
				readyState = PlayerFramework.VideoMediaPlugin.ReadyState.HAVE_FUTURE_DATA;
				break;

			case HTMLMediaElement.HAVE_ENOUGH_DATA:
				readyState = PlayerFramework.VideoMediaPlugin.ReadyState.HAVE_ENOUGH_DATA;
				break;
		}

		return readyState;
	},

	scrubbing: function()
	{
		///	<summary>

		///	</summary>
		///	<returns type="Boolean" />

		return this.element.seeking;
	},

	seeking: function()
	{
		///	<summary>

		///	</summary>
		///	<returns type="Boolean" />

		return this.element.seeking;
	},

	supportsVolumeSetter: function()
	{
		///	<summary>
		///		Gets a boolean value indicating whether the media element supports setting the volume.
		///	</summary>
		///	<returns type="Boolean" />

		// Try decrementing the volume level. If the volume level remains at 1, then the volume level
		// cannot be adjusted.
		this.element.volume -= .01;
		var canChangeVolume = this.volume() !== 1;
		if (canChangeVolume)
			this.element.volume += .01;
		return canChangeVolume;
	},

	volume: function(value)
	{
		///	<summary>
		///		Gets or sets the volume level in a range of 0.0 to 1.0.
		///	</summary>
		///	<param name="value" type="Number" />
		///	<returns type="Number" />

		if (value)
			this.element.volume = value;

		return this.element.volume;
	},

	// MediaPlugin Functions
	canPlayType: function(type)
	{
		///	<summary>
		///		Gets a boolean indicating whether the media element can play content of the specified type.
		///	</summary>
		///	<param name="type" type="String" />
		///	<returns type="Boolean" />

	    var videoElement = this.element ? this.element : document.createElement("video");

	    if (videoElement.canPlayType)
	        return videoElement.canPlayType(type);

		return false;
	},

	checkSupport: function(callback)
	{
		///	<summary>
		///		Determines support for the media element.
		///	</summary>
		///	<param name="callback" type="Function">
		///		The function to call after support has been determined.
		///	</param>

		var firstSupportedSource = null;
		
		if (this.element.canPlayType)
		{
			var sourceElementArray = PlayerFramework.convertNodeListToArray(this.element.getElementsByTagName("source"));
			var sources = PlayerFramework.filter(sourceElementArray, PlayerFramework.proxy(this, function(s)
			{
				return s.parentNode === this.element;
			}));

			// Iterate over the video sources and use the video's canPlayType function to determine support.
			firstSupportedSource = PlayerFramework.first(sources, PlayerFramework.proxy(this, function(s)
			{
				return !!this.canPlayType(s.type).replace(/no/, "");
			}));

			// Detect stock Android browser and force .mp4 source if one exists
			// (feature detection is not possible: https://github.com/Modernizr/Modernizr/wiki/Undetectables)
			if (!firstSupportedSource && /Android.*AppleWebKit/i.test(navigator.userAgent))
			{
				firstSupportedSource = PlayerFramework.first(sources, PlayerFramework.proxy(this, function(s)
				{
					return s.type.match(/mp4/);
				}));

				if (firstSupportedSource)
				{
					this.element.src = firstSupportedSource.src;
					this.element.load();
				}
			}
		}

		callback(!!firstSupportedSource);
	},

	pause: function()
	{
		///	<summary>
		///		Pauses the media.
		///	</summary>
		
		this.element.pause();
	},

	play: function()
	{
		///	<summary>
		///		Plays the media.
		///	</summary>
		
		this.element.play();
	},

	setup: function()
	{
		///	<summary>
		///		When overridden in a derived class, completes remaining setup operations after the media plugin is selected as the supported media plugin.
		///	</summary>

		this.controls(!!this.options.controls);
		this.volume(this.playerOptions.initialVolume);

		// Detect iOS by checking if volume can be set using the API.
		// Remove, clone, and re-add video element (iOS seems to prevent controlling the video tag
		// if it isn't displayed or added after initialization).
		if (!this.controls() && !this.supportsVolumeSetter()) 
			this.cloneAndReplaceVideoElement();

		if (this.preload() != "none")
			window.setTimeout(PlayerFramework.proxy(this, function() { this.checkBufferProgress(10, 0, 0); }), 1);
		else
			window.setTimeout(PlayerFramework.proxy(this, this.onCanPlayThrough), 1);

		this.addEventListeners();
		this.checkNetworkState();
	},

	// Functions
	addEventListeners: function()
	{
		///	<summary>
		///		Adds event listeners to the media element.
		///	</summary>
		
		PlayerFramework.addEvent(this.element, "canplay", PlayerFramework.proxy(this, this.onCanPlay));
		PlayerFramework.addEvent(this.element, "canplaythrough", PlayerFramework.proxy(this, this.onCanPlayThrough));
		PlayerFramework.addEvent(this.element, "error", PlayerFramework.proxy(this, this.onError));
		PlayerFramework.addEvent(this.element, "ended", PlayerFramework.proxy(this, this.onEnded));
		PlayerFramework.addEvent(this.element, "loadeddata", PlayerFramework.proxy(this, this.onLoadedData));
		PlayerFramework.addEvent(this.element, "loadedmetadata", PlayerFramework.proxy(this, this.onLoadedMetadata));
		PlayerFramework.addEvent(this.element, "pause", PlayerFramework.proxy(this, this.onPause));
		PlayerFramework.addEvent(this.element, "play", PlayerFramework.proxy(this, this.onPlay));
		PlayerFramework.addEvent(this.element, "progress", PlayerFramework.proxy(this, this.onProgress));
		PlayerFramework.addEvent(this.element, "seeked", PlayerFramework.proxy(this, this.onSeeked));
		PlayerFramework.addEvent(this.element, "seeking", PlayerFramework.proxy(this, this.onSeeking));
		PlayerFramework.addEvent(this.element, "timeupdate", PlayerFramework.proxy(this, this.onTimeUpdate));
		PlayerFramework.addEvent(this.element, "volumechange", PlayerFramework.proxy(this, this.onVolumeChange));
		PlayerFramework.addEvent(this.element, "mouseout", PlayerFramework.proxy(this, this.onMouseOut));
		PlayerFramework.addEvent(this.element, "mouseover", PlayerFramework.proxy(this, this.onMouseOver));
	},

	checkBufferProgress: function(maxBufferPollingIterations, bufferPollingIterations, previousBufferFraction)
	{
		///	<summary>
		///		Workaround for Safari: Waits for the video's ready state to be set to "HAVE_ENOUGH_DATA"
		///		Workaround for Mobile Safari: Polls for changes in the buffer. If there are no
		///		changes in the buffer after maxBufferPollingIterations, then the "canplaythrough"
		///		event is dispatched.
		///	</summary>

		if (this.readyState() === PlayerFramework.VideoMediaPlugin.ReadyState.HAVE_ENOUGH_DATA || this.buffered().length == 0)
		{
			window.setTimeout(PlayerFramework.proxy(this, this.onCanPlayThrough), 1);
			return;
		}
		else if (this.buffered().length > 0)
		{
			var duration = this.duration() > 0 ? this.duration() : 0;
			var bufferFraction = this.duration() > 0 ? this.buffered().end(0) / this.duration() : 0;
			
			if (bufferFraction === previousBufferFraction)
			{
				if (bufferPollingIterations === maxBufferPollingIterations)
				{
					this.onCanPlayThrough();
					return;
				}
				else
				{
					bufferPollingIterations++;
				}
			}
			else
			{
				previousBufferFraction = bufferFraction;
				bufferPollingIterations = 0;
			}
		}
		else if (this.networkState() === PlayerFramework.VideoMediaPlugin.NetworkState.NETWORK_NO_SOURCE || this.error())
		{
			return;
		}

		window.setTimeout(PlayerFramework.proxy(this, function()
		{
			this.checkBufferProgress(maxBufferPollingIterations, bufferPollingIterations, previousBufferFraction);
		}), 100);
	},

	checkNetworkState: function(previousNetworkState)
	{
		///	<summary>
		///		Polls for changes in the media element's network state property.
		///	</summary>

		var currentNetworkState = this.networkState();

		if (currentNetworkState !== previousNetworkState)
		{
			window.setTimeout(PlayerFramework.proxy(this, this.onNetworkStateChange), 1);
			previousNetworkState = currentNetworkState;
		}

		window.setTimeout(PlayerFramework.proxy(this, function()
		{
			this.checkNetworkState(previousNetworkState);
		}), 100);
	},

	cloneAndReplaceVideoElement: function()
	{
		///	<summary>
		///		Clones and replaces the video element. Used in the case of iOS to take control of the video element.
		///	</summary>

		var nextSibling = this.element.nextSibling;
		var parentNode = this.element.parentNode;
		var oldChild = parentNode.removeChild(this.element);
		this.element = oldChild.cloneNode(true);
		// Move off screen until the video starts to hide QuickTime logo.
		this.element.style["-webkit-transform"] = "translateX(-" + 2000 + "px)";
		PlayerFramework.addEvent(this.element, "timeupdate", PlayerFramework.proxy(this, function()
		{
			this.element.style["-webkit-transform"] = "translateX(0)";
		}));
		parentNode.insertBefore(this.element, nextSibling);
	}
});

// Workaround to make video tag styleable in IE<9: http://ejohn.org/blog/html5-shiv
// The script or the following line must appear in the head (before the video tag is parsed by IE) for this to work.
document.createElement("video");
﻿PlayerFramework.Plugins.SilverlightMediaPluginBase = PlayerFramework.VideoMediaPlugin.extend(
{
	defaultOptions: function(player, playerOptions)
	{
		return PlayerFramework.mergeOptions(this._super(),
		{
			"class": "pf-silverlight",
			controls: false,
			supportsTrackElements: false
		});
	},

	init: function(player, options, playerOptions)
	{
		///	<summary>
		///		Initializes the VideoMediaPlugin that wraps the Silverlight player.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the SilverlightMediaPluginBase.
		///	</param>
		///	<param name="playerOptions" type="Object">
		///		The merged player options for the current media source.
		///	</param>
		///	<returns type="SilverlightMediaPluginBase" />
		
		this._super(player, options, playerOptions);

		if (this.options.element)
		{
			if (this.options.element.tagName && this.options.element.tagName.toLowerCase() !== "object")
				throw new TypeError("options.element not a video tag.");

			this.setElement(this.options.element);
		}

		this.seekingValue = false;
	},

	activateTrack: function (track)
	{
	    ///	<summary>
	    ///		Selects a text track on the Silverlight player
	    ///	</summary>
	    ///	<param name="track" type="TextTrack">
	    ///		The text track to be activated.
	    ///	</param>
	    try {
	        this.silverlightPlayer.SelectCaptionStream(track.label);
	    } catch (err) {
	        // Ignore failure here for backward compatibility with older xap files that didn't support smooth captions
	    }
	    
	},

	// VideoMediaPlugin Properties
	controls: function(value)
	{
		///	<summary>
		///		Gets or sets a boolean indicating whether the media element displays a control strip.
		///	</summary>
		///	<param name="value" type="Boolean" />
		///	<returns type="Boolean" />

		if (value !== undefined)
			this.silverlightPlayer.IsControlStripVisible = value;

		return this.silverlightPlayer.IsControlStripVisible;
	},

	currentTime: function(value)
	{
		///	<summary>
		///		Gets or sets the current playback position of the media element expressed in seconds.
		///	</summary>
		///	<param name="value" type="Number">
		///		The playback position to seek to.
		///	</param>
		///	<returns type="Number" />

		try
		{
			if (value)
				this.silverlightPlayer.SeekToPosition(value);
		
			return this.silverlightPlayer.PlaybackPositionSeconds;
		}
		catch(e)
		{
			return 0;
		}
	},

	duration: function()
	{
		///	<summary>
		///		Gets the length of the media loaded in the media element expressed in seconds.
		///	</summary>
		///	<returns type="Number" />

		try
		{
			return this.silverlightPlayer.EndPositionSeconds;
		}
		catch(e)
		{
			return 0;
		}
	},

	error: function()
	{
		///	<summary>
		///		Gets the last error the media element encountered.
		///	</summary>
		///	<returns type="Number" />

		return this.lastError;
	},

	muted: function(value)
	{
		///	<summary>
		///		Gets or sets a boolean value indicating whether the media element is muted.
		///	</summary>
		///	<param name="value" type="Boolean" />
		///	<returns type="Boolean" />

		if (value !== undefined)
		{
			this.silverlightPlayer.IsMuted = value;

			// Silverlight player will not dispatch the "volumechanged" when the IsMuted property changes.
			// The media plugin interface must dispatch the "volumechanged" to indicate that the media element is muted.
			this.silverlightPlayer.SetVolume(this.silverlightPlayer.GetVolume() + .00001);
			this.silverlightPlayer.SetVolume(this.silverlightPlayer.GetVolume() - .00001);
		}
		
		return this.silverlightPlayer.IsMuted;
	},

	networkState: function()
	{
		return PlayerFramework.VideoMediaPlugin.NetworkState.NETWORK_IDLE;
	},

	paused: function()
	{
		///	<summary>
		///		Gets a boolean value indicating whether the media element is paused.
		///	</summary>
		///	<returns type="Boolean" />

		return this.silverlightPlayer.PlayState === PlayerFramework.Plugins.SilverlightMediaPluginBase.PlayState.Paused;
	},

	poster: function()
	{
		///	<summary>
		///		Gets the URL of the poster image to display before initiating playback.
		///	</summary>
		///	<returns type="Boolean" />

		var posterAttribute = this.element.getAttribute("data-poster");

		if (posterAttribute)
			return posterAttribute.valueOf();

		return null;
	},

	preload: function()
	{
		///	<summary>
		///		Gets the preload state of "none", "metadata", or "auto".
		///	</summary>
		///	<returns type="String" />

		return "auto";
	},

	readyState: function()
	{
		///	<summary>
		///		Returns a value that expresses the current state of the element with respect to
		///		rendering the current playback position, from
		///		PlayerFramework.VideoMediaPlugin.ReadyState.
		///	</summary>
		///	<returns type="Number" />

		return this.silverlightPlayer.PlayState > PlayerFramework.Plugins.SilverlightMediaPluginBase.PlayState.Buffering
				? PlayerFramework.VideoMediaPlugin.ReadyState.HAVE_ENOUGH_DATA
				: PlayerFramework.VideoMediaPlugin.ReadyState.HAVE_NOTHING;
	},

	scrubbing: function()
	{
		///	<summary>

		///	</summary>
		///	<returns type="Boolean" />

		return this.seekingValue;
	},

	seeking: function()
	{
		///	<summary>

		///	</summary>
		///	<returns type="Boolean" />

		return this.seekingValue;
	},

	supportsVolumeSetter: function()
	{
		///	<summary>
		///		Gets a boolean value indicating whether the media element supports setting the volume.
		///	</summary>
		///	<returns type="Boolean" />

		return true;
	},

	volume: function(value)
	{
		///	<summary>
		///		Gets or sets the volume level in a range of 0.0 to 1.0.
		///	</summary>
		///	<param name="value" type="Number" />
		///	<returns type="Number" />

		if (value)
			this.silverlightPlayer.SetVolume(value);

		return this.silverlightPlayer.GetVolume();
	},

	// MediaPlugin Functions
	canPlayType: function(type)
	{
		///	<summary>
		///		Gets a boolean indicating whether the media element can play content of the specified type.
		///	</summary>
		///	<param name="type" type="String" />
		///	<returns type="Boolean" />

		var supportedTypes = [ /video\/mp4/i, /text\/xml/i ];

		for (var i = 0; i < supportedTypes.length; i++)
		{
			if (supportedTypes[i].test(type))
				return true;
		}

		return false;
	},

	checkSupport: function(callback)
	{
		///	<summary>
		///		Determines support for the media element.
		///	</summary>
		///	<param name="callback" type="Function">
		///		The function to call after support has been determined.
		///	</param>
		
		var isSupported = false;

		// Check if the Silverlight plugin is available.
		if (navigator.plugins)
		{
			isSupported = !!navigator.plugins["Silverlight Plug-In"];
		}

		// If using IE, check if ActiveXObjects are available and attempt to create a Silverlight plugin.
		if (!isSupported && window.ActiveXObject)
		{
			try
			{
				var slControl = new ActiveXObject("AgControl.AgControl");
				isSupported = true;
			}
			catch (e)
			{
			}
		}
		
		if (this.options.initParams && !this.options.initParams.mediaurl)
			isSupported = false;

		if (isSupported)
		{
			this.checkSupportCallback = callback;
			this.onLoadOrError();
		}
		else
		{
			callback(false);
		}
	},

	pause: function()
	{
		///	<summary>
		///		Pauses the media.
		///	</summary>

		try
		{
			this.silverlightPlayer.Pause();
		}
		catch(e)
		{
		}
	},
	
	play: function()
	{
		///	<summary>
		///		Plays the media.
		///	</summary>

		this.silverlightPlayer.Play();
	},

	setup: function()
	{
		///	<summary>
		///		Completes remaining setup operations after the media plugin is selected as the supported media plugin.
		///	</summary>
	},

	// Functions
	addEventListeners: function()
	{
		///	<summary>
		///		Adds event listeners to the media element.
		///	</summary>

		// Using addEventListener directly instead of PlayerFramework.addEvent because addEventListener will be supported by Silverlight player.
	    this.silverlightPlayer.addEventListener("ApplicationExit", PlayerFramework.proxy(this, this.onUnloadingMediaPlugin), false);
	    this.silverlightPlayer.addEventListener("DataReceived", PlayerFramework.proxy(this, this.onDataReceived), false);
		this.silverlightPlayer.addEventListener("MediaEnded", PlayerFramework.proxy(this, this.onEnded), false);
		this.silverlightPlayer.addEventListener("MediaFailed", PlayerFramework.proxy(this, this.onMediaFailed), false);
		this.silverlightPlayer.addEventListener("MediaOpened", PlayerFramework.proxy(this, this.onMediaOpened), false);
		this.silverlightPlayer.addEventListener("PlayStateChanged", PlayerFramework.proxy(this, this.onPlayStateChanged), false);
		this.silverlightPlayer.addEventListener("PlaybackPositionChanged", PlayerFramework.proxy(this, this.onTimeUpdate), false);
		this.silverlightPlayer.addEventListener("VolumeLevelChanged", PlayerFramework.proxy(this, this.onVolumeChange), false);
		this.silverlightPlayer.addEventListener("SeekCompleted", PlayerFramework.proxy(this, this.onSeekCompleted), false);
		PlayerFramework.addEvent(this.element, "mouseout", PlayerFramework.proxy(this, this.onMouseOut));
		PlayerFramework.addEvent(this.element, "mouseover", PlayerFramework.proxy(this, this.onMouseOver));
	},

	setElement: function(element)
	{
		///	<summary>
		///		Handles needed operations after the element becomes available through either the
		///		declarative approach or the injected approach.
		///	</summary>
		///	<param name="callback" type="Function">
		///		The function to call after support has been determined.
		///	</param>

		this.element = element;
		this.element.style["-webkit-transform"] = "translateX(-" + 2000 + "px)";
		
		// Set callback functions on the element that can be called outside of an instance of a media plugin.
		// Used by the global Silverlight event handlers.
		this.element.onLoadCallback = PlayerFramework.proxy(this, this.onElementLoad);
		this.element.onErrorCallback = PlayerFramework.proxy(this, this.onElementError);
	},

    // Event Handlers
	onDataReceived: function (sender, args)
	{
	    ///	<summary>
	    ///		Notifies the player when text track data has been received.
	    ///	</summary>
	    ///	<param name="sender" type="Object">
	    ///	</param>
	    ///	<param name="args" type="ScriptDataReceivedInfo">
	    ///		A scriptable type defined in the Silverlight player, containing the metadata and payload
        ///     of the text track data chunk just received.
	    ///	</param>

	    this.player.dispatchEvent(
        {
            type: "datareceived",
            dataReceived: 
            {
                data: args.Result.Data,
                timestamp: args.Result.DataChunk.Timestamp,
                duration: args.Result.DataChunk.Duration
            }
        });
	},

	onElementError: function()
	{
		///	<summary>
		///		Error handler callback for this specific instance of the SilverlightMediaPluginBase.
		///	</summary>
		///	<param name="callback" type="Function">
		///		The function to call after support has been determined.
		///	</param>

		this.hasError = true;
		this.onLoadOrError();
	},

	onElementLoad: function(silverlightPlayer)
	{
		///	<summary>
		///		Load handler callback for this specific instance of the SilverlightMediaPlugin.
		///	</summary>
		///	<param name="silverlightPlayer" type="Object">
		///		The JavaScript bridge object for this specific Silverlight player.
		///	</param>

		// Check if the browser is loading the plugin for the first time (some browsers reload the plugin each time it is displayed).
		var isFirstLoad = true;
		if (this.silverlightPlayer)
			isFirstLoad = false;

		this.silverlightPlayer = silverlightPlayer;
		this.isReady = true;
		this.controls(!!this.options.controls);
		this.volume(this.playerOptions.initialVolume);
		
		// Only callback if the plugin is loading for the first time, otherwise reset the timeline.
		if (isFirstLoad)
			this.onLoadOrError();
		else
			this.onTimeUpdate();
			
		if (this.controls())
			this.element.height = 360;

		this.addEventListeners();
		
		this.element.style["-webkit-transform"] = "translateX(0)";

		// Re-add ControlPlugin event listeners when Silverlight reloads.
		if (!isFirstLoad)
			this.onLoadedMediaPlugin();
	},

	onLoadOrError: function()
	{
		///	<summary>
		///		Controls when the checkSupportCallback is called by the checkSupport,
		///		onLoadCallback, and onErrorCallback functions. The checkSupport function must
		///		complete and either the onLoadCallback or the onErrorCallback function must
		///		complete.
		///	</summary>

		if (this.checkSupportCallback)
		{
			if (this.hasError)
				this.checkSupportCallback(false);
			else if (this.isReady)
				this.checkSupportCallback(true);
		}
	},

	onMediaOpened: function () {

	    ///	<summary>
	    ///		Called when media is opened. Caption tracks are read from the Silverlight player
	    ///     and are added to this player.
	    ///	</summary>

	    try {

	        for (var i = 0; i < this.silverlightPlayer.AvailableCaptionStreams.length; i++) {

	            var captionStream = this.silverlightPlayer.AvailableCaptionStreams[i];

	            this.player.addTextTrack("captions", captionStream.Name, captionStream.Language, true);
	        }

	    } catch (err) {
            // Ignore failure here for backward compatibility with older xap files that didn't support smooth captions
	    }
	},

	onMediaFailed: function(e)
	{	
		///	<summary>
		///		Called if the Silverlight player's media fails to download. Creates MediaError
		///		specifying a network error and calls the base onError handler.
		///	</summary>

		this.lastError =
		{
			code: PlayerFramework.VideoMediaPlugin.MediaError.MEDIA_ERR_NETWORK
		};
		
		this.onError();
	},
	
	onPlayStateChanged: function()
	{	
		///	<summary>
		///		Handler that determines if the Silverlight player is in a Playing or Paused stated and calls the
		///		respective media plugin handler.
		///	</summary>

		try
		{
			var playState = this.silverlightPlayer.PlayState;
			if (playState === PlayerFramework.Plugins.SilverlightMediaPluginBase.PlayState.Paused)
				this.onPause();
			else if (playState === PlayerFramework.Plugins.SilverlightMediaPluginBase.PlayState.Playing)
				this.onPlay();
		
			if (playState === PlayerFramework.Plugins.SilverlightMediaPluginBase.PlayState.Playing	||
				playState === PlayerFramework.Plugins.SilverlightMediaPluginBase.PlayState.Paused	||
				playState === PlayerFramework.Plugins.SilverlightMediaPluginBase.PlayState.Stopped	||
				playState === PlayerFramework.Plugins.SilverlightMediaPluginBase.PlayState.ClipPlaying)
				this.onCanPlayThrough();
		}
		catch(e)
		{
		}
	},

	onSeekCompleted: function()
	{
		///	<summary>
		///		Handler that determines if the Silverlight player is currently seeking
		///		or if it has completed seeking.
		///	</summary>

	    var currentSeekTime = Date.now ? Date.now : +new Date;
        
		PlayerFramework.proxy(this, function(previousSeekTime)
		{
			window.setTimeout(PlayerFramework.proxy(this, function()
			{
				this.seekingValue = currentSeekTime != previousSeekTime;

				if (this.seekingValue)
					this.onSeeking();
				else
					this.onSeeked();
			}), 100);
		})(currentSeekTime);
	}
});

PlayerFramework.Plugins.SilverlightMediaPluginBase.PlayState =
{
	///	<summary>
	///		A JSON object used to store the values of the Silverlight player's PlayState enum.
	///		Used by the onPlayStateChanged to determine if the Silverlight player is in a Playing
	///		or Paused stated.
	///	</summary>

	Closed: 0,
	Opening: 1,
	Buffering: 2,
	Playing: 3,
	Paused: 4,
	Stopped: 5,
	Individualizing: 6,
	AcquiringLicense: 7,
	ClipPlaying: 100
};

// Global Silverlight Event Handlers (must be global to be referenced by the param tags in the Silverlight object tag)
var onSilverlightError = function(sender, args)
{
	///	<summary>
	///		Handler for the Silverlight onError event that calls the onErrorCallback set by the
	///		SilverlightMediaPluginBase instance related to that particular object element.
	///	</summary>

	// Check error code to avoid issue where Silverlight throws the following error in FireFox 4:
	//		Unhandled Error in Silverlight Application
	//		Code: 2104
	//		Category: InitializeError
	//		Message: Could not download the Silverlight application. Check web server settings 
	if (args.ErrorCode.toString() !== "2104")
	{
		var element = args.getHost();

		if (element.onErrorCallback)
			element.onErrorCallback();
	}
};

var onSilverlightLoad = function(sender, args)
{
	///	<summary>
	///		Handler for the Silverlight onLoad event that gets a reference to the JavaScript bridge
	///		and calls the onLoadCallback set by the SilverlightMediaPluginBase instance related to
	///		that particular object element.
	///	</summary>
	
	var element = sender.getHost();
	var silverlightPlayer;
	
	try
	{
		silverlightPlayer = element.Content.Player;
	}
	catch (e)
	{
	}

	if (silverlightPlayer && element.onLoadCallback)
		element.onLoadCallback(silverlightPlayer);
};
﻿PlayerFramework.StaticContentMediaPlugin = PlayerFramework.MediaPlugin.extend(
{
	defaultOptions: function(player, playerOptions)
	{
		return PlayerFramework.mergeOptions(this._super(),
		{
			"class": "pf-static"
		});
	},

	init: function(player, options, playerOptions)
	{
		///	<summary>
		///		Initializes the MediaPlugin that provides static content. This is often used as the last fallback in the chain.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the StaticContentMediaPlugin.
		///	</param>
		///	<param name="playerOptions" type="Object">
		///		The merged player options for the current media source.
		///	</param>
		///	<returns type="StaticContentMediaPlugin" />

		this._super(player, options, playerOptions);

		if (this.options.element)
		{
			if (!this.options.element.tagName)
				throw new TypeError("options.element not a DOM element");

			this.element = this.options.element;
		}
	},

	// MediaPlugin Functions
	checkSupport: function(callback)
	{
		///	<summary>
		///		Determines support for the media element.
		///	</summary>
		///	<param name="callback" type="Function">
		///		The function to call after support has been determined.
		///	</param>

		callback(true);
	}
});
﻿PlayerFramework.Plugins.PlaylistPlugin = PlayerFramework.ModulePlugin.extend(
{
	defaultOptions: function(player)
	{
		return PlayerFramework.mergeOptions(this._super(),
		{
			playlistItemEndBehavior: PlayerFramework.Plugins.PlaylistPlugin.PlaylistItemEndBehavior.ADVANCE_AND_PLAY,
			initialPlaylistItemIndex: 0,
			playerExtensionPropertyName: "playlist"
		});
	},

	isEnabled: function(player, options)
	{
		return !!player.options.playlist;
	},

	init: function(player, options)
	{
		///	<summary>
		///		Initializes the PlaylistPlugin that provides an API for playlist management.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the PlaylistPlugin.
		///	</param>
		///	<returns type="PlaylistPlugin" />

		this._super(player, options);
		
		this.playlistItems = [];

		this.loadPlaylistItems();
		
		this.player.addEventListener("ended", PlayerFramework.proxy(this, this.onEnded), false);
	},

	// Properties
	currentPlaylistItem: function()
	{
		///	<summary>
		///		Returns the playlist item representing the currently loaded media.
		///	</summary>
		///	<returns type="Object" />
		
		if (this.currentPlaylistItemIndex + 1 > this.playlistItems.length)
			throw new Error("Invalid playlist item index.");
		
		return this.playlistItems[this.currentPlaylistItemIndex];
	},

	// Event Handlers
	onEnded: function(e)
	{
		///	<summary>
		///		Called when the media playback ends.
		///	</summary>
		
		if (this.options.playlistItemEndBehavior == PlayerFramework.Plugins.PlaylistPlugin.PlaylistItemEndBehavior.NONE
			|| this.currentPlaylistItemIndex == this.playlistItems.length - 1)
			return;

		this.currentPlaylistItemIndex++;
		
		// Call asynchronously to allow other event handlers to fire first.
		window.setTimeout(PlayerFramework.proxy(this, function()
		{
			switch (this.options.playlistItemEndBehavior)
			{
				case PlayerFramework.Plugins.PlaylistPlugin.PlaylistItemEndBehavior.ADVANCE_ONLY:
					this.changeMediaPlugin(
					{
						poster: null,
						autoplay: null
					});
					break;

				case PlayerFramework.Plugins.PlaylistPlugin.PlaylistItemEndBehavior.ADVANCE_AND_PLAY:
					this.changeMediaPlugin(
					{
						poster: null,
						autoplay: "autoplay"
					});
					break;
			}
		}), 1);
	},

	// Functions
	addPlaylistItem: function(playlistItem, index)
	{
		///	<summary>
		///		Adds the playlist item to the array of playlist items.
		///	</summary>
		///	<param name="playlistItem" type="Object">
		///		The playlist item to add.
		///	</param>
		///	<param name="index" type="Number">
		///		Optional index at which to insert the playlist item.
		///	</param>

		this.playlistItems.splice(index != undefined ? index : this.playlistItems.length, 0, playlistItem);
		this.player.dispatchEvent({ type: "playlistitemadded" });
	},

	changeMediaPlugin: function(options)
	{
		///	<summary>
		///		Sets the media plugin given the current playlist item and the specified options.
		///	</summary>
		///	<param name="options" type="Object">
		///		Options specified by the playlist plugin that determine the behavior for changing the playlist item.
		///	</param>
		
		this.player.mediaPlugin.onUnloadingMediaPlugin();
		this.player.mediaPlugin.element.parentNode.removeChild(this.player.mediaPlugin.element);

		var currentPlaylistItemOptions = this.currentPlaylistItem();
		PlayerFramework.merge(currentPlaylistItemOptions, options);
		this.player.setMediaPlugin(currentPlaylistItemOptions);
	},

	loadPlaylistItems: function()
	{
		///	<summary>
		///		Loads the playlist items from the playlist array specified in the options.
		///	</summary>

		if (!this.player.options.playlist || !(this.player.options.playlist instanceof Array))
			throw new Error("Invalid playlist.");

		this.playlistItems = this.player.options.playlist;

		this.setPlaylistItemOptions();
	},

	nextPlaylistItem: function()
	{
		///	<summary>
		///		Sets the playlist item to the next playlist item in the array.
		///	</summary>

		this.setPlaylistItem(this.currentPlaylistItemIndex + 1);
	},

	previousPlaylistItem: function()
	{
		///	<summary>
		///		Sets the playlist item to the previous playlist item in the array.
		///	</summary>

		this.setPlaylistItem(this.currentPlaylistItemIndex - 1);
	},

	removePlaylistItem: function(index)
	{
		///	<summary>
		///		Removes the playlist item located at the specified index.
		///	</summary>
		///	<param name="index" type="Object">
		///		The index of the playlist item to remove.
		///	</param>

		this.playlistItems.splice(index, 1);
		this.player.dispatchEvent({ type: "playlistitemremoved" });
	},
	
	setPlaylistItem: function(index)
	{
		///	<summary>
		///		Sets the current playlist item to the playlist item located at the specified index.
		///	</summary>
		///	<param name="index" type="Object">
		///		The index of the playlist item to use as the current playlist item.
		///	</param>

		if (index < 0
			|| index > this.playlistItems.length - 1)
			return;
		
		this.currentPlaylistItemIndex = index;

		this.changeMediaPlugin(
		{
			poster: null,
			autoplay: "autoplay"
		});
	},

	setPlaylistItemOptions: function()
	{
		///	<summary>
		///		Merges the player's options to the options of the initial playlist item.
		///	</summary>

		this.currentPlaylistItemIndex = this.options.initialPlaylistItemIndex;
		this.player.setMediaPlugin(this.currentPlaylistItem());
	}
});

PlayerFramework.Plugins.PlaylistPlugin.PlaylistItemEndBehavior =
{
	///	<summary>
	///		A JSON object used to store the values of the playlist plugin's possible behaviors
	///		once playback has ended for a playlist item.
	///	</summary>

	NONE: 0,
	ADVANCE_ONLY: 1,
	ADVANCE_AND_PLAY: 2
};
﻿PlayerFramework.TrackPlugin = PlayerFramework.ModulePlugin.extend(
{
	defaultOptions: function(player)
	{
		return PlayerFramework.mergeOptions(this._super(),
		{
			displayPreference: PlayerFramework.TextTrack.DisplayPreference.CUSTOM
		});
	},

	init: function(player, options)
	{
		///	<summary>
		///		Initializes the TrackPlugin base.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the TrackPlugin.
		///	</param>
		///	<returns type="TrackPlugin" />

		this._super(player, options);

		this.previousTime = -1;
		this.previousScrubbingValue = false;
		this.lastDirection = 1;
		this.activeTextTrack = null;
		this.isTrackPolyfill = false;

		this.addEventListeners();
	},

	// Event Handlers
	onCueAdded: function(e)
	{
		///	<summary>
		///		When overridden in a derived class, processes an added cue. 
		///	</summary>
	},

	onCueChange: function(e)
	{
		///	<summary>
		///		When overridden in a derived class, processes a changed cue.
		///	</summary>
	},

	onCueLeft: function(e)
	{
		///	<summary>
		///		When overridden in a derived class, processes an newly inactive cue.
		///	</summary>
	},

	onCueReached: function(e)
	{
		///	<summary>
		///		When overridden in a derived class, processes an newly active cue.
		///	</summary>
	},

	onCueRemoved: function(e)
	{
		///	<summary>
		///		When overridden in a derived class, processes a removed cue. 
		///	</summary>
	},

	onCueSkipped: function(e)
	{
		///	<summary>
		///		When overridden in a derived class, processes a skipped cue.
		///	</summary>
	},

	onLoadedMediaPlugin: function(e)
	{
		///	<summary>
		///		Called when the media element unloads.
		///	</summary>
		
		var optionCues = this.player.mediaPlugin.playerOptions[this.options.playerExtensionPropertyName];

		if (optionCues)
		{
			PlayerFramework.forEach(optionCues, PlayerFramework.proxy(this, function(cue)
			{
				this.addCue(cue);
			}));
		}
	},

	onScrubbed: function(e)
	{
		///	<summary>
		///		Called when the timeline is no longer being scrubbed.
		///	</summary>
		
		this.updateCues();
	},
	
	onTimeUpdate: function(e)
	{
		///	<summary>
		///		Called when the current time of the media is updated.
		///	</summary>

		this.updateCues();
	},

	updateCues: function()
	{
		///	<summary>
		///		Determines when to cues have been reached, left, skipped, and changed
		///		depending on if playback is seeking, playing, or if the timeline is being scrubbed.
		///	</summary>

		if (!this.activeTextTrack)
			return;

		var scrubbedTo = this.player.scrubbing() && this.previousScrubbingValue;
		var playedTo = !this.player.scrubbing() && !this.previousScrubbingValue;
		var seekedTo = !this.player.scrubbing() && this.previousScrubbingValue;
		
		var currentTime = this.player.currentTime();
		var previousTime = this.previousTime;
		var cueChange = false;
		var activeCues = [];

		for (var i = 0; i < this.activeTextTrack.cues.length; i++)
		{
			var cue = this.activeTextTrack.cues[i];

			// Cue reached
			if (scrubbedTo && ((previousTime < cue.startTime && currentTime >= cue.startTime) || (previousTime > cue.endTime && currentTime <= cue.endTime)))
			{
				this.onCueReached({ cue: cue, seeked: seekedTo, direction: this.lastDirection });
			}
			else if (!cue.committed && (seekedTo || playedTo) && currentTime >= cue.startTime && currentTime <= cue.endTime)
			{
				cue.committed = true;
				this.onCueReached({ cue: cue, seeked: seekedTo, direction: this.lastDirection });
			}

			// Cue left
			if (scrubbedTo && ((previousTime >= cue.startTime && currentTime < cue.startTime) || (previousTime <= cue.endTime && currentTime > cue.endTime)))
			{
				this.onCueLeft({ cue: cue, seeked: seekedTo, direction: this.lastDirection });
			}
			else if (cue.committed && (seekedTo || playedTo) && (currentTime < cue.startTime || currentTime > cue.endTime))
			{
				cue.committed = false;
				this.onCueLeft({ cue: cue, seeked: seekedTo, direction: this.lastDirection });
			}

			// Cue skipped via seek
			var seekSkipForward = previousTime < cue.startTime && currentTime > cue.endTime;
			var seekSkipBackward = previousTime > cue.endTime && currentTime < cue.startTime;

			if (seekSkipForward || seekSkipBackward)
			{
				var direction = seekSkipForward ? 1 : -1;
				this.onCueSkipped({ cue: cue, direction: direction });
			}

			// Cue skipped via scrub
			var scrubSkipForward = this.scrubStartCurrentTimeValue < cue.startTime && currentTime > cue.endTime;
			var scrubSkipBackward = this.scrubStartCurrentTimeValue > cue.endTime && currentTime < cue.startTime;

			if (!this.scrubStartCurrentTimeValue && this.previousScrubbingValue)
			{
				this.scrubStartCurrentTimeValue = currentTime;
			}
			else if (this.scrubStartCurrentTimeValue && !this.player.scrubbing() && (scrubSkipForward || scrubSkipBackward))
			{
				var direction = scrubSkipForward ? 1 : -1;
				this.onCueSkipped({ cue: cue, direction: direction });
			}

			// Cue enter/exit
			if (currentTime >= cue.startTime && currentTime <= cue.endTime && (previousTime > cue.endTime || previousTime < cue.startTime))
			{
				activeCues.push(cue);
				cue.dispatchEvent({ type: "enter" });
				cueChange = true;
			}
			else if (previousTime >= cue.startTime && previousTime <= cue.endTime && (currentTime > cue.endTime || currentTime < cue.startTime))
			{
				cue.dispatchEvent({ type: "exit" });
				cueChange = true;
			}
		}

		if (cueChange)
		{
			this.activeTextTrack.activeCues = activeCues;
			this.onCueChange();
		}

		if (this.scrubStartCurrentTimeValue && !this.player.scrubbing())
			this.scrubStartCurrentTimeValue = 0;
		
		if (previousTime < currentTime)
			this.lastDirection = 1;
		else if (previousTime > currentTime)
			this.lastDirection = -1;

		this.previousTime = currentTime;
		this.previousScrubbingValue = this.player.scrubbing();
	},

	onUnloadingMediaPlugin: function(e)
	{
		///	<summary>
		///		Called when the media element unloads.
		///	</summary>

		if (!this.activeTextTrack)
			return;

		PlayerFramework.forEach(this.activeTextTrack.cues, PlayerFramework.proxy(this, function(cue)
		{
			this.removeCue(cue);
		}));
	},

	// Functions
	addCue: function(cue)
	{
		///	<summary>
		///		Adds the specified cue to the ordered cue array and calls the addCue
		///		function of the subclass.
		///	</summary>
		///	<param name="cue" type="Object">
		///		The cue to be added.
		///	</param>
		
		if (!this.activeTextTrack)
			return;

		this.activeTextTrack.addCue(cue);
		this.onCueAdded({ cue: cue });
	},

	addEventListeners: function()
	{
		///	<summary>
		///		Adds event listeners to the control's elements.
		///	</summary>
		
		this.player.addEventListener("loadedmediaplugin", PlayerFramework.proxy(this, this.onLoadedMediaPlugin), false);
		this.player.addEventListener("scrubbed", PlayerFramework.proxy(this, this.onScrubbed), false);
		this.player.addEventListener("timeupdate", PlayerFramework.proxy(this, this.onTimeUpdate), false);
		this.player.addEventListener("unloadingmediaplugin", PlayerFramework.proxy(this, this.onUnloadingMediaPlugin), false);
	},

	activateTextTrack: function(textTrack)
	{
		///	<summary>
		///		Handles downloading of a text track if not already downloaded
		///		and then sets the text track as the active text track.
		///	</summary>
		///	<param name="textTrack" type="Object">
		///		The text track to activate.
		///	</param>

		if (!textTrack.xml && textTrack.src)
		{
			textTrack.readyState = PlayerFramework.TextTrack.ReadyState.LOADING;

			PlayerFramework.xhr({ url: textTrack.src }, PlayerFramework.proxy(this, function(result)
			{
				textTrack.xml = result.responseXML;
				this.processTextTrackSource(textTrack, textTrack.xml);
		
				textTrack.readyState = PlayerFramework.TextTrack.ReadyState.LOADED;
				textTrack.dispatchEvent({ type: "load" });

				this.showTextTrack(textTrack);
			}), PlayerFramework.proxy(this, PlayerFramework.proxy(this, function(result)
			{
				textTrack.readyState = PlayerFramework.TextTrack.ReadyState.ERROR;
				this.player.dispatchEvent({ type: "error" });
			})));
		}
		else
		{
			this.showTextTrack(textTrack);
		}
	},

	showTextTrack: function(textTrack)
	{
		///	<summary>
		///		Shows the text track according to the display preference.
		///	</summary>
		///	<param name="textTrack" type="Object">
		///		The text track to show.
		///	</param>

		switch (this.options.displayPreference)
		{
			// NATIVE
			case PlayerFramework.TextTrack.DisplayPreference.NATIVE:
				
				textTrack.mode = PlayerFramework.TextTrack.Mode.OFF;

				if (textTrack.track)
					textTrack.track.mode = PlayerFramework.TextTrack.Mode.SHOWING;

				break;

			// CUSTOM
			case PlayerFramework.TextTrack.DisplayPreference.CUSTOM:

				textTrack.mode = PlayerFramework.TextTrack.Mode.SHOWING;

				if (textTrack.track)
					textTrack.track.mode = PlayerFramework.TextTrack.Mode.OFF;

				break;

			// ALL
			case PlayerFramework.TextTrack.DisplayPreference.ALL:
						
				textTrack.mode = PlayerFramework.TextTrack.Mode.SHOWING;

				if (textTrack.track)
					textTrack.track.mode = PlayerFramework.TextTrack.Mode.SHOWING;
						
				break;
			
			// NONE
			default:

				textTrack.mode = PlayerFramework.TextTrack.Mode.OFF;

				if (textTrack.track)
					textTrack.track.mode = PlayerFramework.TextTrack.Mode.OFF;

				break;
		}

		this.activeTextTrack = textTrack;
		this.previousTime = -1;

		this.updateCues();
	},

	deactivateTextTrack: function(textTrack)
	{
		///	<summary>
		///		Deactivates the text track.
		///	</summary>
		///	<param name="textTrack" type="Object">
		///		The text track to deactivate.
		///	</param>

		textTrack.mode = PlayerFramework.TextTrack.Mode.OFF;

		if (textTrack.track)
			textTrack.track.mode = PlayerFramework.TextTrack.Mode.OFF;

		this.activeTextTrack = null;
		this.clearCaptionContainer();
	},

	isActiveTextTrack: function(textTrack)
	{
		///	<summary>
		///		Determines if the specified text track is the currently active text track.
		///	</summary>
		///	<param name="textTrack" type="Object">
		///		The text track to check if it is active.
		///	</param>

		return this.activeTextTrack == textTrack;
	},

	processTextTrackSource: function(textTrack)
	{
		///	<summary>
		///		Processes a downloaded text track using a TTML parser.
		///	</summary>
		///	<param name="textTrack" type="Object">
		///		The text track to process.
		///	</param>
	},

	removeCue: function(cue)
	{
		///	<summary>
		///		Removes the specified cue to the ordered cue array and calls the removeCue
		///		function of the subclass.
		///	</summary>
		///	<param name="cue" type="Object">
		///		The cue to be added.
		///	</param>

		if (!this.activeTextTrack)
			return;

		this.activeTextTrack.removeCue(cue);
		this.onCueRemoved({ cue: cue });
	}
});
﻿PlayerFramework.Plugins.TrackDataProviderPlugin = PlayerFramework.ModulePlugin.extend(
{
	init: function(player, options)
	{
		///	<summary>
		///		Initializes the TrackDataProviderPlugin that is a polyfill for the W3C <track> implementation.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the CueDataProviderPlugin.
		///	</param>
		///	<returns type="CueDataProviderPlugin" />

		this._super(player, options);

		this.addEventListeners();

		this.isTrackSupported = !!document.createElement("track").track;

		this.player.textTracks = [];

		this.player.addTextTrack = PlayerFramework.proxy(this, this.addTextTrack);
	},

	// Event Handlers
	onLoadedMediaPlugin: function(e)
	{
		///	<summary>
		///		Called when the media element unloads.
		///	</summary>

		// Create or clear textTracks array
		this.player.textTracks = [];

		// Find all track existing elements (both created from options or pre-existing)
		var trackElements = PlayerFramework.convertNodeListToArray(this.player.mediaPlugin.element.getElementsByTagName("track"));
		
		// Extend all track elements with HTML5 Track API and download the referenced source files
		PlayerFramework.forEach(trackElements, PlayerFramework.proxy(this, this.extendTrackElement));

		var textTracks = this.player.mediaPlugin.playerOptions.textTracks;

		// Create tracks that were specified in the options
		if (textTracks)
		{
			for (var i = 0; i < textTracks.length; i++)
			{
				var textTrackOptions = textTracks[i];

				if (this.player.mediaPlugin.options.supportsTrackElements)
				{
					var trackElement = PlayerFramework.createElement(this.player.mediaPlugin.element,
					[
						"track",
						textTrackOptions
					]);
					
					this.extendTrackElement(trackElement);
				}
				else
				{
					var textTrack = this.player.addTextTrack(textTrackOptions.kind, textTrackOptions.label, textTrackOptions.srclang);
					textTrack.src = textTrackOptions.src;
					
					if (textTrackOptions["default"] != undefined && textTrackOptions.src)
						this.activateTextTrack(textTrack);
				}
			}
		}
	},

	// Functions	
	addEventListeners: function()
	{
		///	<summary>
		///		Adds event listeners to the control's elements.
		///	</summary>
		
		this.player.addEventListener("loadedmediaplugin", PlayerFramework.proxy(this, this.onLoadedMediaPlugin), false);
	},

	addTextTrack: function(kind, label, language, inStream)
	{
		///	<summary>
		///		Entry point for added a text track as specified by the W3C.
		///	</summary>
		///	<param name="kind" type="Object">
		///		The category the given track falls into. 
		///	</param>
		///	<param name="label" type="Object">
		///		The label of the track, if known, or the empty string otherwise.
		///	</param>
		///	<param name="language" type="Object">
		///		The language of the given track, if known, or the empty string otherwise.
		///	</param>

		var textTrack = new PlayerFramework.TextTrack();
		textTrack.kind = kind;
		textTrack.label = label;
		textTrack.language = language;
		textTrack.inStream = inStream;

		this.player.textTracks.push(textTrack);

		this.player.dispatchEvent(
		{
			type: "texttrackadded"
		});

		return textTrack;
	},
	
	activateTextTrack: function(textTrack)
	{
		///	<summary>
		///		Delegates activation of a text track to the TrackPlugin with the matching "kind".
		///	</summary>
		///	<param name="textTrack" type="Object">
		///		The text track to activate.
		///	</param>

		var trackPlugin = PlayerFramework.first(this.player.modules, PlayerFramework.proxy(this, function(m)
		{
			return m instanceof PlayerFramework.TrackPlugin && m.options.kind === textTrack.kind;
		}));

		if (trackPlugin)
			trackPlugin.activateTextTrack(textTrack);
	},

	extendTrackElement: function(trackElement)
	{
		///	<summary>
		///		Extends a track element to match the W3C specification.
		///	</summary>
		///	<param name="trackElement" type="Object">
		///		The text track to extend.
		///	</param>

		trackElement.isDefault = trackElement.getAttribute("default") != undefined;
		trackElement.kind = trackElement.getAttribute("kind");
		trackElement.label = trackElement.getAttribute("label");
		trackElement.srclang = trackElement.getAttribute("srclang");
		trackElement.src = trackElement.getAttribute("src");

		var textTrack = this.player.addTextTrack(trackElement.kind, trackElement.label, trackElement.srclang);
		textTrack.src = trackElement.src;
		
		if (this.isTrackSupported && trackElement.track)
		{
			textTrack.track = trackElement.track;
			textTrack.track.mode = PlayerFramework.TextTrack.Mode.OFF;
		}

		trackElement.track = textTrack;

		if (trackElement.isDefault && trackElement.src)
			this.activateTextTrack(textTrack);
	}
});
﻿PlayerFramework.Plugins.ChapterTrackPlugin = PlayerFramework.TrackPlugin.extend(
{
	defaultOptions: function(player)
	{
		return PlayerFramework.mergeOptions(this._super(),
		{
			playerExtensionPropertyName: "chapters",
			kind: "chapters"
		});
	},

	init: function(player, options)
	{
		///	<summary>
		///		Initializes the ChapterTrackPlugin that provides an API for adding, removing, and navigating chapters.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the ChapterTrackPlugin.
		///	</param>
		///	<returns type="ChapterTrackPlugin" />
		
		this._super(player, options);

		this.activeTextTrack = this.player.addTextTrack(this.options.kind);
	},

	// Event Handlers
	onCueAdded: function(e)
	{
		///	<summary>
		///		Processes an added cue.
		///	</summary>
		///	<param name="cue" type="Object">
		///		The added cue.
		///	</param>
		
		e.type = "chaptercueadded";
		this.player.dispatchEvent(e);
	},

	onCueChange: function()
	{
		///	<summary>
		///		Processes a changed cue.
		///	</summary>

		this.player.dispatchEvent(
		{
			type: "chaptercuechange"
		});
	},

	onCueLeft: function(e)
	{
		///	<summary>
		///		Processes an newly inactive cue.
		///	</summary>

		e.type = "chaptercueleft";
		this.player.dispatchEvent(e);
	},

	onCueReached: function(e)
	{
		///	<summary>
		///		Processes a newly active cue.
		///	</summary>

		e.type = "chaptercuereached";
		this.player.dispatchEvent(e);
	},

	onCueRemoved: function(e)
	{
		///	<summary>
		///		Processes a removed cue.
		///	</summary>

		e.type = "chaptercueremoved";
		this.player.dispatchEvent(e);
	},

	onCueSkipped: function(e)
	{
		///	<summary>
		///		Processes a skipped cue.
		///	</summary>

		e.type = "chaptercueskipped";
		this.player.dispatchEvent(e);
	},

	// Functions
	skipBackChapter: function()
	{
		///	<summary>
		///		Skips back one chapter.
		///	</summary>

		var chapterTime;
		for(var i = this.activeTextTrack.cues.length - 1; i >= 0 ; i--)
		{
			var cue = this.activeTextTrack.cues[i];
			
			if (cue.startTime < (this.player.currentTime() - 1))
			{
				chapterTime = cue.startTime;
				break;
			}
		}

		if (!chapterTime)
			chapterTime = 0;

		this.player.currentTime(chapterTime);
	},

	skipForwardChapter: function()
	{
		///	<summary>
		///		Skips forward one chapter.
		///	</summary>

		var chapterTime;
		for(var i = 0; i < this.activeTextTrack.cues.length; i++)
		{
			var cue = this.activeTextTrack.cues[i];
			
			if (cue.startTime > this.player.currentTime())
			{
				chapterTime = cue.startTime;
				break;
			}
		}

		if (!chapterTime)
			chapterTime = this.player.duration();

		this.player.currentTime(chapterTime);
	}
});
﻿PlayerFramework.Plugins.TimelineTrackPlugin = PlayerFramework.TrackPlugin.extend(
{
	defaultOptions: function(player)
	{
		return PlayerFramework.mergeOptions(this._super(),
		{
			playerExtensionPropertyName: "timelineCues",
			kind: "metadata"
		});
	},

	init: function(player, options)
	{
		///	<summary>
		///		Initializes the TimelineTrackPlugin that provides an API for adding, removing, and processing timeline cues.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the TimelineTrackPlugin.
		///	</param>
		///	<returns type="TimelineTrackPlugin" />

		this._super(player, options);

		this.activeTextTrack = this.player.addTextTrack(this.options.kind);
	},

	// Event Handlers
	onCueAdded: function(e)
	{
		///	<summary>
		///		Processes an added cue.
		///	</summary>

		e.type = "timelinecueadded";
		this.player.dispatchEvent(e);
	},

	onCueChange: function()
	{
		///	<summary>
		///		Processes a changed cue.
		///	</summary>

		this.player.dispatchEvent(
		{
			type: "timelinecuechange"
		});
	},

	onCueLeft: function(e)
	{
		///	<summary>
		///		Processes an newly inactive cue.
		///	</summary>

		e.type = "timelinecueleft";
		this.player.dispatchEvent(e);
	},

	onCueReached: function(e)
	{
		///	<summary>
		///		Processes a newly active cue.
		///	</summary>

		e.type = "timelinecuereached";
		this.player.dispatchEvent(e);
	},

	onCueRemoved: function(e)
	{
		///	<summary>
		///		Processes a removed cue.
		///	</summary>

		e.type = "timelinecueremoved";
		this.player.dispatchEvent(e);
	},

	onCueSkipped: function(e)
	{
		///	<summary>
		///		Processes a skipped cue.
		///	</summary>

		e.type = "timelinecueskipped";
		this.player.dispatchEvent(e);
	}
});
﻿PlayerFramework.Plugins.CaptionTrackPlugin = PlayerFramework.TrackPlugin.extend(
{
	defaultOptions: function(player)
	{
		return PlayerFramework.mergeOptions(this._super(),
		{
			playerExtensionPropertyName: "captions",
			kind: "captions"
		});
	},

	init: function(player, options)
	{
		///	<summary>
		///		Initializes the CaptionTrackPlugin that provides an API for adding, removing, and synchronizing captions.
		///		Parses and displays captions over the media.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the CaptionTrackPlugin.
		///	</param>
		///	<returns type="CaptionTrackPlugin" />

		this._super(player, options);
	},

	addEventListeners: function () {
	    ///	<summary>
	    ///		Adds event listeners to the control's elements.
	    ///	</summary>
	    this._super();

	    this.player.addEventListener("ready", PlayerFramework.proxy(this, this.onReady), false);
	    this.player.addEventListener("datareceived", PlayerFramework.proxy(this, this.onDataReceived), false);
	},

	// Event Handlers
	onCueAdded: function(e)
	{
		///	<summary>
		///		Processes an added cue.
		///	</summary>

		e.type = "captioncueadded";
		this.player.dispatchEvent(e);
	},

	onCueChange: function()
	{
		///	<summary>
		///		Processes a changed cue.
		///	</summary>
		
		if (this.activeTextTrack.mode === PlayerFramework.TextTrack.Mode.SHOWING)
		{
			this.clearCaptionContainer();
			
			for (var i = 0; i < this.activeTextTrack.activeCues.length; i++)
			{
				var cueElement = this.activeTextTrack.activeCues[i].getCueAsHTML().cloneNode(true);
				this.element.appendChild(cueElement);
			}
		}

		this.player.dispatchEvent(
		{
			type: "captioncuechange"
		});
	},

	onCueLeft: function(e)
	{
		///	<summary>
		///		Processes an newly inactive cue.
		///	</summary>

		e.type = "captioncueleft";
		this.player.dispatchEvent(e);
	},

	onCueReached: function(e)
	{
		///	<summary>
		///		Processes an newly active cue.
		///	</summary>

		e.type = "captioncuereached";
		this.player.dispatchEvent(e);
	},

	onCueRemoved: function(e)
	{
		///	<summary>
		///		Processes a removed cue.
		///	</summary>

		e.type = "captioncueremoved";
		this.player.dispatchEvent(e);
	},

	onCueSkipped: function(e)
	{
		///	<summary>
		///		Processes a skipped cue.
		///	</summary>

		e.type = "captioncueskipped";
		this.player.dispatchEvent(e);
	},

	onDataReceived: function (e)
	{
	    ///	<summary>
	    ///		Processes in-stream caption data
	    ///	</summary>

	    var startTime = e.dataReceived.timestamp * 1000;
	    var endTime = e.dataReceived.duration * 1000 + startTime;
	    var xml = PlayerFramework.parseXml(e.dataReceived.data);

	    this.processTextTrackSource(this.activeTextTrack, xml, startTime, endTime);
	},

	onReady: function(e)
	{
		///	<summary>
		///		Called when the player is ready for playback.
		///	</summary>

		this.element = PlayerFramework.createElement(null,
		[
			"div",
			{
				"class": "pf-caption-cues-container"
			}
		]);

		this.player.containerElement.insertBefore(this.element, this.player.mediaPlugin.element.nextSibling);
		PlayerFramework.addEvent(this.element, "mouseover", PlayerFramework.mouseEventProxy(this.player, "mouseover"));
		PlayerFramework.addEvent(this.element, "mouseout", PlayerFramework.mouseEventProxy(this.player, "mouseout"));
	},

	// Functions
	activateTextTrack: function (textTrack) {

	    if (textTrack.inStream) {

	        this.player.mediaPlugin.activateTrack(textTrack);

	        textTrack.readyState = PlayerFramework.TextTrack.ReadyState.LOADED;
	        textTrack.dispatchEvent({ type: "load" });

	        this.showTextTrack(textTrack);

	    } else {

	        this._super(textTrack);
	    }
	},

	clearCaptionContainer: function ()
	{
		///	<summary>
		///		Clears the area containing the caption HTML.
		///	</summary>

		this.element.innerHTML = "";
	},

	processTextTrackSource: function(textTrack, ttml, startTime, endTime)
	{
		///	<summary>
		///		Processes a downloaded text track using a TTML parser.
		///	</summary>
		///	<param name="textTrack" type="Object">
		///		The text track to process.
	    ///	</param>
	    ///	<param name="ttml" type="Object">
	    ///		TTML data to process.
	    ///	</param>
	    ///	<param name="startTime" type="Number">
	    ///		The start time in seconds of the provided TTML. Optional.
	    ///	</param>
	    ///	<param name="endTime" type="Number">
	    ///		The end time in seconds of the provided TTML. Optional.
	    ///	</param>

	    var ttmlParser = new PlayerFramework.TtmlParser();

	    ttmlParser.parseTtml(ttml, startTime, endTime);

	    if (!textTrack.cues) {
	        textTrack.cues = new PlayerFramework.TextTrackCueList();
	    }

	    for (var i = 0; i < ttmlParser.cues.length; i++) {

	        var parserCue = ttmlParser.cues[i];

	        var textTrackCue = new PlayerFramework.TextTrackCue(
            {
                track: textTrack,
                id: parserCue.cue.id,
                startTime: parserCue.startTime,
                endTime: parserCue.endTime,
                pauseOnExit: false,
                text: parserCue.cue.innerHTML,
                markup: parserCue.cue,
                uri: parserCue.uri
            });

	        textTrack.cues.push(textTrackCue);
	    }
	}
});
﻿PlayerFramework.Plugins.ControlStripPlugin = PlayerFramework.ControlPlugin.extend(
{
	defaultOptions: function(player)
	{
		return PlayerFramework.mergeOptions(this._super(),
		{
			strings:
			{
				toggleTitle: "Show Controls",
				toggleAltTitle: "Hide Controls",
				playTitle: "Play",
				playAltTitle: "Pause",
				muteTitle: "Mute",
				muteAltTitle: "Unmute",
				fullBrowserTitle: "Full Screen",
				fullBrowserAltTitle: "Exit Full Screen",
				timelineTitle: "Playback: {0}%",
				timelineFillTitle: "Decrement Playback Position",
				timelineEmptyTitle: "Increment Playback Position",
				timeElapsedTitle: "Time Elapsed",
				timeRemainingTitle: "Time Remaining",
				volumeTitle: "Volume: {0}%",
				volumeFillTitle: "Decrement Volume Level",
				volumeEmptyTitle: "Increment Volume Level"
			},
			accessKeys:
			{
				toggleKey: "c",
				playKey: "p",
				muteKey: "m",
				fullBrowserKey: "s"
			}
		});
	},

	init: function(player, options)
	{
		///	<summary>
		///		Initializes the ControlPlugin that creates the default look and behavior for the Player object.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the ControlStripPlugin.
		///	</param>
		///	<returns type="ControlStripPlugin" />

		this._super(player, options);

		this.createControl();

		this.canPlayThrough = false;
		this.playInitiated = false;
		this.isTimelineMouseDown = false;
		this.isVolumeMouseDown = false;
		this.volumeLevelDelta = .1;
		this.currentTimeDelta = 5;
	},

	// Properties
	currentTime: function(value)
	{
		///	<summary>
		///		Gets or sets the current playback position of the media element expressed in seconds.
		///	</summary>
		///	<param name="value" type="Number">
		///		The playback position to seek to.
		///	</param>
		///	<returns type="Number" />
		
		if (value !== undefined)
			this.player.mediaPlugin.currentTime(value);
		
		return this.currentTimeValue;
	},

	// Event Handlers
	onToggleClick: function(e)
	{
		///	<summary>
		///		Called when the the toggle button is clicked and toggles the control strip display.
		///	</summary>

		if (this.element.style.display === "none")
			this.showControlStrip();
		else
			this.hideControlStrip();
	},

	onPlayClick: function(e)
	{
		///	<summary>
		///		Called when the play button is clicked and toggles the media element between play and pause.
		///	</summary>
		
		if (this.player.paused())
			this.player.play();
		else
			this.player.pause();
	},

	onTimelineMouseDown: function(e)
	{
		///	<summary>
		///		Called when the mouse is depressed on the timeline slider.
		///	</summary>
		
		// Prevents text selection.
		document.body.focus();
		document.onselectstart = function () { return false; };
		
		// Store initial measurements while scrubbing - IE reports zero for offset measurements when rendering.
		this.timelineSliderMeasurements = { headWidth: this.timelineHeadElement.offsetWidth, headContainerLeft: PlayerFramework.getTotalOffsetLeft(this.timelineHeadContainerElement), headContainerWidth: this.timelineHeadContainerElement.offsetWidth };
		
		this.isTimelineMouseDown = true;
		this.player.scrubbing = PlayerFramework.proxy(this, this.scrubbing);
		this.player.dispatchEvent({ type: "scrubbing" });

		this.onDocumentMouseMove(e);
	},

	onTimelineFillClick: function(e)
	{
		///	<summary>
		///		Called when filled area of the timeline slider is clicked.
		///	</summary>

		var currentTime = this.player.currentTime();
		if (currentTime - this.currentTimeDelta > 0)
			this.player.currentTime(currentTime - this.currentTimeDelta);
	},

	onTimelineEmptyClick: function(e)
	{
		///	<summary>
		///		Called when empty area of the timeline slider is clicked.
		///	</summary>

		var currentTime = this.player.currentTime();
		if (currentTime + this.currentTimeDelta < this.player.duration())
			this.player.currentTime(currentTime + this.currentTimeDelta);
	},

	onVolumeMouseDown: function(e)
	{
		///	<summary>
		///		Called when the mouse is depressed on the volume slider.
		///	</summary>

		// Prevents text selection.
		document.body.focus();
		document.onselectstart = function () { return false; };
		
		// Store initial measurements while scrubbing - IE reports zero for offset measurements when rendering.
		this.volumeSliderMeasurements = { headWidth: this.volumeHeadElement.offsetWidth, headContainerLeft: PlayerFramework.getTotalOffsetLeft(this.volumeHeadContainerElement), headContainerWidth: this.volumeHeadContainerElement.offsetWidth };
		this.isVolumeMouseDown = true;
		this.onDocumentMouseMove(e);
	},

	onVolumeFillClick: function(e)
	{
		///	<summary>
		///		Called when filled area of the volume slider is clicked.
		///	</summary>

		var volume = this.player.volume();
		if (volume - this.volumeLevelDelta > 0)
			this.player.volume(volume - this.volumeLevelDelta);
	},

	onVolumeEmptyClick: function(e)
	{
		///	<summary>
		///		Called when empty area of the volume slider is clicked.
		///	</summary>

		var volume = this.player.volume();
		if (volume + this.volumeLevelDelta < 1)
			this.player.volume(volume + this.volumeLevelDelta);
	},

	onDocumentMouseMove: function(e)
	{
		///	<summary>
		///		Called when the mouse moves on the document.
		///	</summary>
		
		if (this.isTimelineMouseDown)
		{
			// Adjust the playback position given the mouse position on the timeline slider.
			var timelineFraction = this.getSliderMouseFraction(this.timelineSliderMeasurements, e);
			this.currentTimeValue = timelineFraction * this.player.duration();
			this.player.currentTime(this.currentTimeValue);

			// Adjust the slider manually now because we prevent the slider from being adjusted
			// in response to the "timeupdate" event on the media plugin.
			this.setSliderHeadPosition(this.timelineContainerElement, timelineFraction);
		}
		
		if (this.isVolumeMouseDown)
		{
			// Adjust the volume level given the mouse position on the volume slider slider.
			var volumeFraction = this.getSliderMouseFraction(this.volumeSliderMeasurements, e);
			this.player.volume(volumeFraction);
		}
	},

	onDocumentMouseUp: function(e)
	{
		///	<summary>
		///		Called when the mouse is released on the document.
		///	</summary>

		// Allows text selection.
		document.onselectstart = function () { return true; };

		// Ensure video is paused if scrubbed to the end and released.
		if (this.player.currentTime() === this.player.duration() || (this.player.ended && this.player.ended()))
			this.player.pause();

		this.isTimelineMouseDown = false;
		this.isVolumeMouseDown = false;
		this.player.dispatchEvent({ type: "scrubbed" });
	},

	onDocumentKeyDown: function(e)
	{
		///	<summary>
		///		Called when a key is pressed on the document.
		///	</summary>

		var charCode = PlayerFramework.getCharCode(e);
		
		// exit full screen if escape key is pressed
		if (charCode === 27 && this.player.displayingFullscreen())
			this.exitFullScreen();
	},

	onPlayerMouseOut: function(e)
	{
		///	<summary>
		///		Called when the mouse leaves the player.
		///	</summary>
		
		if (this.player.options.overlayControls)
			this.hideControlStrip();
	},

	onPlayerMouseOver: function(e)
	{
		///	<summary>
		///		Called when the mouse enters the player.
		///	</summary>
		
		if (this.player.options.overlayControls)
			this.showControlStrip();
	},

	onMuteClick: function(e)
	{
		///	<summary>
		///		Called when the mute button is clicked.
		///	</summary>

		this.player.muted(!this.player.muted());
	},

	onFullBrowserClick: function(e)
	{
		///	<summary>
		///		Called when the full browser button is clicked.
		///	</summary>

		if (this.player.displayingFullscreen())
			this.exitFullScreen();
		else
			this.enterFullScreen();

		this.mediaPlugin().onFullScreenChange();
	},

	// ControlPlugin Event Handlers
	onCanPlayThrough: function(e)
	{
		///	<summary>
		///		Called when the media element can play through to the end without having to stop for further buffering.
		///	</summary>

		window.setTimeout(PlayerFramework.proxy(this, function()
		{
			this.canPlayThrough = true;

			if (!this.playInitiated && !(this.player.mediaPlugin instanceof PlayerFramework.StaticContentMediaPlugin))
			{
				if (this.playOverlayControlElement)
					this.playOverlayControlElement.style.display = "block";
				else
					this.showControlStrip();
			}
		}), 500);
	},

	onEnded: function(e)
	{
		///	<summary>
		///		Called when the media playback ends.
		///	</summary>

		if (!this.isTimelineMouseDown)
			this.player.pause();
	},

	onPlay: function(e)
	{
		///	<summary>
		///		Called when the media plays.
		///	</summary>

		if (this.posterElement)
			this.posterElement.style.display = "none";

		if (this.playOverlayControlElement)
			this.playOverlayControlElement.style.display = "none";

		this.playInitiated = true;

		this.playControlElement.className = "pf-pause pf-play-control";
		this.playButtonElement.setAttribute("title", this.options.strings.playAltTitle);
	},

	onPause: function(e)
	{
		///	<summary>
		///		Called when the media pauses.
		///	</summary>

		this.playControlElement.className = "pf-play pf-play-control";
		this.playButtonElement.setAttribute("title", this.options.strings.playTitle);
	},

	onProgress: function(e)
	{
		///	<summary>
		///		Called when the media buffers more data.
		///	</summary>
		
		if (this.player.buffered().length > 0)
			this.timelineLoadElement.style.width = Math.round(100 * (this.player.buffered().end(0) / this.player.duration()), 2) + "%";
	},
	
	onReady: function(e)
	{
		///	<summary>
		///		Called when the player is ready for playback.
		///	</summary>
		
		// Disable volume controls if setting volume is not supported (volume can only be controlled by hardware):
		// http://developer.apple.com/library/safari/#documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html#//apple_ref/doc/uid/TP40009523-CH5-SW11)		
		if (!this.mediaPlugin().supportsVolumeSetter())
			this.element.className += " pf-no-volume";

		// Poster Control
		var posterSource = this.player.poster();
		if (posterSource)
		{
			this.posterElement = PlayerFramework.createElement(null,
			[
				"img",
				{
					"class": "pf-poster",
					src: posterSource
				}
			]);
			this.player.containerElement.insertBefore(this.posterElement, this.mediaPlugin().element.nextSibling);
		}

		// Play Overlay Control
		if (this.player.options.overlayPlayButton)
		{
			this.playOverlayControlElement = PlayerFramework.createElement(this.player.containerElement,
			[
				"div",
				{
					"class": "pf-play-overlay-control"
				},
				[
					"button",
					{
						"class": "pf-button",
						type: "button",
						title: this.options.strings.playTitle,
						accessKey: this.options.accessKeys.playKey
					},
					[
						"span"
					]
				]
			]);
		}

		// Initial adjustment of volume control
		this.onVolumeChange();

		this.addEventListeners();
	},

	onSeeked: function(e)
	{
		///	<summary>
		///		Called when the media plugin has completed seeking.
		///	</summary>
		
		// Set currentTime function asynchronously, otherwise currentTime is earlier than the previous time.
		window.setTimeout(PlayerFramework.proxy(this, function()
		{
			this.player.currentTime = PlayerFramework.proxy(this.player.mediaPlugin, this.player.mediaPlugin.currentTime);
		}), 1);
	},
	
	onSeeking: function(e)
	{
		///	<summary>
		///		Called continuously while the media plugin is seeking.
		///	</summary>

		if (this.isTimelineMouseDown)
			this.player.currentTime = PlayerFramework.proxy(this, this.currentTime);
	},

	onTimeUpdate: function(e)
	{
		///	<summary>
		///		Called when the current time of the media is updated.
		///	</summary>
		
		var currentTime = this.player.currentTime();
		var duration = this.player.duration();

		if (!this.isTimelineMouseDown)
		{
			var currentTimePercentage = currentTime !== 0 ? (currentTime / duration) : 0;
			this.setSliderHeadPosition(this.timelineContainerElement, currentTimePercentage);

			var timelineTitle = this.options.strings.timelineTitle.replace("{0}", Math.round(currentTimePercentage * 100));
			this.timelineButtonElement.setAttribute("title", timelineTitle);
		}

		if (this.previousCurrentTime !== Math.round(currentTime))
		{
			this.previousCurrentTime = Math.round(currentTime);
			this.timeElapsedElement.innerText = this.formatTimeString(currentTime);
			this.timeRemainingElement.innerText = this.formatTimeString(duration - currentTime);
		}
	},
	
	onUnloadingMediaPlugin: function(e)
	{
		///	<summary>
		///		Called when the media element unloads.
		///	</summary>
		
		if (this.playOverlayControlElement)
			this.playOverlayControlElement.style.display = "none";
	},

	onVolumeChange: function(e)
	{
		///	<summary>
		///		Called when the volume level of the media changes.
		///	</summary>

		this.setSliderHeadPosition(this.volumeContainerElement, this.player.volume());

		if (this.player.muted())
		{
			this.muteControlElement.className = "pf-mute pf-mute-control";
			this.muteButtonElement.setAttribute("title", this.options.strings.muteAltTitle);
		}
		else
		{
			this.muteControlElement.className = "pf-sound pf-mute-control";
			this.muteButtonElement.setAttribute("title", this.options.strings.muteTitle);
		}

		var volumeTitle = this.options.strings.volumeTitle.replace("{0}", Math.round(this.player.volume() * 100));
		this.volumeButtonElement.setAttribute("title", volumeTitle);
	},

	// Functions
	addEventListeners: function()
	{
		///	<summary>
		///		Adds event listeners to the control's elements.
		///	</summary>
		
		if (this.posterElement)
			PlayerFramework.addEvent(this.posterElement, "click", PlayerFramework.proxy(this, this.onDocumentMouseUp));
		
		if (this.playOverlayControlElement)
			PlayerFramework.addEvent(this.playOverlayControlElement, "click", PlayerFramework.proxy(this, this.onPlayClick));

		PlayerFramework.addEvent(this.toggleControlElement, "click", PlayerFramework.proxy(this, this.onToggleClick));
		PlayerFramework.addEvent(this.playControlElement, "click", PlayerFramework.proxy(this, this.onPlayClick));
		PlayerFramework.addEvent(this.muteControlElement, "click", PlayerFramework.proxy(this, this.onMuteClick));
		PlayerFramework.addEvent(this.fullBrowserControlElement, "click", PlayerFramework.proxy(this, this.onFullBrowserClick));
		PlayerFramework.addEvent(this.timelineContainerElement, "mousedown", PlayerFramework.proxy(this, this.onTimelineMouseDown));
		PlayerFramework.addEvent(this.timelineFillElement, "click", PlayerFramework.proxy(this, this.onTimelineFillClick));
		PlayerFramework.addEvent(this.timelineEmptyElement, "click", PlayerFramework.proxy(this, this.onTimelineEmptyClick));
		PlayerFramework.addEvent(this.volumeContainerElement, "mousedown", PlayerFramework.proxy(this, this.onVolumeMouseDown));
		PlayerFramework.addEvent(this.volumeFillElement, "click", PlayerFramework.proxy(this, this.onVolumeFillClick));
		PlayerFramework.addEvent(this.volumeEmptyElement, "click", PlayerFramework.proxy(this, this.onVolumeEmptyClick));
		PlayerFramework.addEvent(document, "mousemove", PlayerFramework.proxy(this, this.onDocumentMouseMove));
		PlayerFramework.addEvent(document, "mouseup", PlayerFramework.proxy(this, this.onDocumentMouseUp));
		PlayerFramework.addEvent(document, "keydown", PlayerFramework.proxy(this, this.onDocumentKeyDown));

		var mouseOutProxy = PlayerFramework.mouseEventProxy(this.player, "mouseout");
		var mouseOverProxy = PlayerFramework.mouseEventProxy(this.player, "mouseover");
		PlayerFramework.addEvent(this.element, "mouseout", mouseOutProxy ? mouseOutProxy : PlayerFramework.proxy(this, this.onMouseOut));
		PlayerFramework.addEvent(this.element, "mouseover", mouseOverProxy ? mouseOverProxy : PlayerFramework.proxy(this, this.onMouseOver));
	},

	onMouseOut: function () {
	    this.player.dispatchEvent({ type: "mouseout" });
	},

	onMouseOver: function()
	{
	    this.player.dispatchEvent({ type: "mouseover" });
	},

	createControl: function()
	{
		///	<summary>
		///		Creates and appends all markup for the controls to the DOM.
		///	</summary>

		// Control Strip Container
		this.element = PlayerFramework.createElement(this.player.containerElement,
		[
			"div",
			{
				"class": this.player.options.overlayControls ? "pf-controls pf-controls-overlay" : "pf-controls"
			}
		]);

		// Toggle Control
		this.toggleControlElement = PlayerFramework.createElement(this.element,
		[
			"div",
			{
				"class": "pf-toggle-control"
			}
		]);

		this.toggleButtonElement = PlayerFramework.createElement(this.toggleControlElement,
		[
			"button",
			{
				"class": "pf-button",
				type: "button",
				title: this.options.strings.toggleTitle,
				accessKey: this.options.accessKeys.toggleKey
			},
			[
				"span"
			]
		]);

		// Play/Pause Control
		this.playControlElement = PlayerFramework.createElement(this.element,
		[
			"div",
			{
				"class": "pf-play-control pf-play"
			}
		]);

		this.playButtonElement = PlayerFramework.createElement(this.playControlElement,
		[
			"button",
			{
				"class": "pf-button",
				type: "button",
				title: this.options.strings.playTitle,
				accessKey: this.options.accessKeys.playKey
			},
			[
				"span"
			]
		]);

		// Timeline Control
		this.timelineControlElement = PlayerFramework.createElement(this.element,
		[
			"div",
			{
				"class": "pf-timeline-control"
			}
		]);

		this.timelineButtonElement = PlayerFramework.createElement(this.timelineControlElement,
		[
			"button",
			{
				"class": "pf-button",
				type: "button"
			}
		]);

		this.timelineContainerElement = PlayerFramework.createElement(this.timelineControlElement,
		[
			"div",
			{
				"class": "pf-slider-container"
			},
			[
				"span",
				{
					"class": "pf-slider-range"
				}
			]
		]);

		this.timelineLoadElement = PlayerFramework.createElement(this.timelineContainerElement,
		[
			"span",
			{
				"class": "pf-slider-load"
			}
		]);

		this.timelineFillElement = PlayerFramework.createElement(this.timelineContainerElement,
		[
			"span",
			{
				"class": "pf-slider-fill"
			},
			[
				"button",
				{
					"class": "pf-button",
					type: "button",
					title: this.options.strings.timelineFillTitle
				}
			]
		]);

		this.timelineEmptyElement = PlayerFramework.createElement(this.timelineContainerElement,
		[
			"span",
			{
				"class": "pf-slider-empty"
			},
			[
				"button",
				{
					"class": "pf-button",
					type: "button",
					title: this.options.strings.timelineEmptyTitle
				}
			]
		]);

		this.timelineHeadContainerElement = PlayerFramework.createElement(this.timelineContainerElement,
		[
			"span",
			{
				"class": "pf-slider-head-container"
			}
		]);

		this.timelineHeadElement = PlayerFramework.createElement(this.timelineHeadContainerElement,
		[
			"span",
			{
				"class": "pf-slider-head"
			}
		]);

		// Time Elapsed Control
		this.timeElapsedControlElement = PlayerFramework.createElement(this.element,
		[
			"div",
			{
				"class": "pf-time-elapsed-control pf-time-display",
				title: this.options.strings.timeElapsedTitle
			}
		]);

		this.timeElapsedElement = PlayerFramework.createElement(this.timeElapsedControlElement,
		[
			"div",
			"0:00:00"
		]);

		// Time Divider Control
		this.timeDividerControlElement = PlayerFramework.createElement(this.element,
		[
			"div",
			{
				"class": "pf-time-divider-control pf-time-display"
			},
			[
				"div",
				"/"
			]
		]);

		// Time Remaining Control
		this.timeRemainingControlElement = PlayerFramework.createElement(this.element,
		[
			"div",
			{
				"class": "pf-time-remaining-control pf-time-display",
				title: this.options.strings.timeRemainingTitle
			}
		]);

		this.timeRemainingElement = PlayerFramework.createElement(this.timeRemainingControlElement,
		[
			"div",
			"0:00:00"
		]);

		// Mute Control
		this.muteControlElement = PlayerFramework.createElement(this.element,
		[
			"div",
			{
				"class": "pf-mute-control pf-sound"
			}
		]);

		this.muteButtonElement = PlayerFramework.createElement(this.muteControlElement,
		[
			"button",
			{
				"class": "pf-button",
				type: "button",
				title: this.options.strings.muteTitle,
				accessKey: this.options.accessKeys.muteKey
			},
			[
				"span",
				{
					"class": "pf-mute-icon"
				},
				[
					"span",
					{
						"class": "pf-speaker-base"
					}
				],
				[
					"span",
					{
						"class": "pf-speaker"
					}
				],
				[
					"span",
					{
						"class": "pf-sound-waves"
					},
					[
						"span",
						{
							"class": "pf-sound-wave-1 pf-sound-wave"
						}
					],
					[
						"span",
						{
							"class": "pf-sound-wave-2 pf-sound-wave"
						}
					],
					[
						"span",
						{
							"class": "pf-sound-wave-3 pf-sound-wave"
						}
					]
				]
			]
		]);

		// Volume Control
		this.volumeControlElement = PlayerFramework.createElement(this.element,
		[
			"div",
			{
				"class": "pf-volume-control"
			}
		]);

		this.volumeButtonElement = PlayerFramework.createElement(this.volumeControlElement,
		[
			"button",
			{
				"class": "pf-button",
				type: "button"
			}
		]);

		this.volumeContainerElement = PlayerFramework.createElement(this.volumeControlElement,
		[
			"div",
			{
				"class": "pf-slider-container"
			},
			[
				"span",
				{
					"class": "pf-slider-range"
				}
			]
		]);

		this.volumeFillElement = PlayerFramework.createElement(this.volumeContainerElement,
		[
			"span",
			{
				"class": "pf-slider-fill"
			},
			[
				"button",
				{
					"class": "pf-button",
					type: "button",
					title: this.options.strings.volumeFillTitle
				}
			]
		]);

		this.volumeEmptyElement = PlayerFramework.createElement(this.volumeContainerElement,
		[
			"span",
			{
				"class": "pf-slider-empty"
			},
			[
				"button",
				{
					"class": "pf-button",
					type: "button",
					title: this.options.strings.volumeEmptyTitle
				}
			]
		]);

		this.volumeHeadContainerElement = PlayerFramework.createElement(this.volumeContainerElement,
		[
			"span",
			{
				"class": "pf-slider-head-container"
			}
		]);

		this.volumeHeadElement = PlayerFramework.createElement(this.volumeHeadContainerElement,
		[
			"span",
			{
				"class": "pf-slider-head"
			}
		]);

		// Full Browser Control
		this.fullBrowserControlElement = PlayerFramework.createElement(this.element,
		[
			"div",
			{
				"class": "pf-full-browser-control"
			}
		]);

		this.fullBrowserButtonElement = PlayerFramework.createElement(this.fullBrowserControlElement,
		[
			"button",
			{
				"class": "pf-button",
				type: "button",
				title: this.options.strings.fullBrowserTitle,
				accessKey: this.options.accessKeys.fullBrowserKey
			},
			[
				"span",
				{
					"class": "pf-full-browser-box"
				}
			]
		]);

		this.updateLayout();
	},

	showControlStrip: function()
	{
		///	<summary>
		///		Shows the control strip.
		///	</summary>

		if (this.playInitiated || (this.canPlayThrough && !this.player.options.overlayPlayButton))
		{
			this.element.style.display = "block";
			this.toggleButtonElement.setAttribute("title", this.options.strings.toggleAltTitle);
		}
	},

	hideControlStrip: function()
	{
		///	<summary>
		///		Hides the control strip.
		///	</summary>

		if (this.playInitiated)
		{
			this.element.style.display = "none";
			this.toggleButtonElement.setAttribute("title", this.options.strings.toggleTitle);
		}
	},

	enterFullScreen: function()
	{
		///	<summary>
		///		Expands the media element to the full width and height of the browser. 
		///	</summary>

		this.player.containerElement.className = "pf-container pf-full-browser";
		this.elementWidthBeforeFullBrowser = this.mediaPlugin().element.width;
		this.elementHeightBeforeFullBrowser = this.mediaPlugin().element.height;
		this.player.containerElement.style.width = "";
		this.player.containerElement.style.height = "";
		this.fullBrowserButtonElement.setAttribute("title", this.options.strings.fullBrowserAltTitle);
	},

	exitFullScreen: function()
	{
		///	<summary>
		///		Restores the media element to it's original size. 
		///	</summary>

		this.player.containerElement.className = "pf-container";
		this.mediaPlugin().element.width = this.elementWidthBeforeFullBrowser;
		this.mediaPlugin().element.height = this.elementHeightBeforeFullBrowser;
		this.player.containerElement.style.width = this.mediaPlugin().element.width.toString() + "px";
		this.player.containerElement.style.height = this.mediaPlugin().element.height.toString() + "px";
		this.fullBrowserButtonElement.setAttribute("title", this.options.strings.fullBrowserTitle);
	},

	formatTimeString: function(totalSeconds)
	{
		///	<summary>
		///		Formats the seconds in a string using the template "0:00:00".
		///	</summary>
		///	<param name="totalSeconds" type="Number">
		///		The total seconds to format.
		///	</param>
		///	<returns type="String" />

		var dateTime = new Date(0,0,0,0,0,0,0);
		dateTime.setSeconds(totalSeconds);
		
		var hours = PlayerFramework.padString(dateTime.getHours(), 1, "0");
		var minutes = PlayerFramework.padString(dateTime.getMinutes(), 2, "0");
		var seconds = PlayerFramework.padString(dateTime.getSeconds(), 2, "0");

		return hours + ":" + minutes + ":" + seconds;
	},

	getSliderMouseFraction: function(measurements, mouseEvent)
	{
		///	<summary>
		///		Gets the fraction of the mouse in relation to the slider in a range of 0.0 to 1.0.
		///	</summary>
		///	<param name="measurements" type="Object">
		///		Contains the sizing and positioning of the timeline at the time that the mouse was depressed.
		///	</param>
		///	<param name="mouseEvent" type="Object">
		///		The mouse event object.
		///	</param>

		var mouseTimelineOffset = mouseEvent.clientX - (measurements.headWidth / 2) - measurements.headContainerLeft;
		return Math.min(1, Math.max(0, mouseTimelineOffset / measurements.headContainerWidth));
	},

	scrubbing: function()
	{
		///	<summary>
		///		Indicates if the timeline is currently being scrubbed.
		///	</summary>
		///	<returns type="Boolean" />
		
		return this.isTimelineMouseDown;
	},

	setSliderHeadPosition: function(containerElement, percentage)
	{
		///	<summary>
		///		Sets the position of the slider head in relation to the slider.
		///	</summary>
		///	<param name="containerElement" type="Object">
		///		The container element for the slider.
		///	</param>
		///	<param name="percentage" type="Object">
		///		The fraction of the slider head in relation to the slider in a range of 0.0 to 1.0.
		///	</param>

		var percentString = 100 * percentage + "%";
		var percentEmptyString = 100 * (1 - percentage) + "%";
		PlayerFramework.getElementsByClass("pf-slider-fill", containerElement)[0].style.width = percentString;
		PlayerFramework.getElementsByClass("pf-slider-head", containerElement)[0].style.left = percentString;
		PlayerFramework.getElementsByClass("pf-slider-empty", containerElement)[0].style.width = percentEmptyString;
	},

	updateLayout: function()
	{
		///	<summary>
		///		Updates the layout of the control strip to accomodate all displayed controls.
		///	</summary>

		var childNodes = PlayerFramework.convertNodeListToArray(this.element.childNodes);

		var right = 0;
		for(var i = childNodes.length - 1; i >= 0; i--)
		{
			var node = childNodes[i];

			node.style.right = right + "px";
			
			if (PlayerFramework.getComputedStyle(node, "display") != "none")
				right += parseInt(PlayerFramework.getComputedStyle(node, "width"), 10);

			if (node.className == "pf-timeline-control")
				break;
		}

		var left = 0;
		for(var i = 0; i < childNodes.length; i++)
		{
			var node = childNodes[i];

			node.style.left = left + "px";
			
			if (PlayerFramework.getComputedStyle(node, "display") != "none")
				left += parseInt(PlayerFramework.getComputedStyle(node, "width"), 10);

			if (node.className == "pf-timeline-control")
				break;
		}
	}
});
﻿PlayerFramework.Plugins.ChapterTrackControlPlugin = PlayerFramework.ControlPlugin.extend(
{
	defaultOptions: function(player)
	{
		return PlayerFramework.mergeOptions(this._super(),
		{
			strings:
			{
				skipBackTitle: "Skip Back Chapter",
				skipForwardTitle: "Skip Forward Chapter"
			},
			accessKeys:
			{
				skipBackKey: "b",
				skipForwardKey: "n"
			},
			chapterTrackPlugin: PlayerFramework.first(player.modules, function(m)
			{
				return m instanceof PlayerFramework.Plugins.ChapterTrackPlugin;
			}),
			controlStripPlugin: PlayerFramework.first(player.modules, function(m)
			{
				return m instanceof PlayerFramework.Plugins.ControlStripPlugin;
			})
		});
	},

	isEnabled: function(player, options)
	{
		return !!options.chapterTrackPlugin && !!options.controlStripPlugin;
	},

	init: function(player, options)
	{
		///	<summary>
		///		Initializes the ChapterTrackControlPlugin that provides UI for controlling chapter navigation.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the ChapterTrackControlPlugin.
		///	</param>
		///	<returns type="ChapterTrackControlPlugin" />
		
		this._super(player, options);

		// Find the required plugins.
		this.chapterTrackPlugin = this.options.chapterTrackPlugin;
		this.controlStripPlugin = this.options.controlStripPlugin;

		if (!this.chapterTrackPlugin)
			throw new Error("ChapterTrackPlugin required.");

		if (!this.controlStripPlugin)
			throw new Error("ControlStripPlugin required.");
	},

	// Event Handlers
	onChapterCueAdded: function(e)
	{		
		///	<summary>
		///		Called when a chapter cue is added. Displays the chapter navigation arrows next to the timeline.
		///	</summary>
		
		if (this.controlStripPlugin.element.className.indexOf("pf-chapters") === -1)
			this.controlStripPlugin.element.className += " pf-chapters";

		this.controlStripPlugin.updateLayout();
	},

	onSkipBackClick: function(e)
	{		
		///	<summary>
		///		Called when the skip back chapter button is clicked.
		///	</summary>

		this.chapterTrackPlugin.skipBackChapter();
	},

	onSkipForwardClick: function(e)
	{		
		///	<summary>
		///		Called when the skip forward chapter button is clicked.
		///	</summary>

		this.chapterTrackPlugin.skipForwardChapter();
	},

	onReady: function(e)
	{		
		///	<summary>
		///		Called when the player is ready for playback.
		///	</summary>

		this.createControl();
		this.addEventListeners();
	},

	onUnloadingMediaPlugin: function(e)
	{
		///	<summary>
		///		Called when the media element unloads.
		///	</summary>

		this.controlStripPlugin.element.className = this.controlStripPlugin.element.className.replace("pf-chapters", "");

		this.controlStripPlugin.updateLayout();
	},

	// Functions
	addEventListeners: function()
	{
		///	<summary>
		///		Adds event listeners to the control's elements.
		///	</summary>
		
		PlayerFramework.addEvent(this.player, "chaptercueadded", PlayerFramework.proxy(this, this.onChapterCueAdded));
		PlayerFramework.addEvent(this.skipBackControlElement, "click", PlayerFramework.proxy(this, this.onSkipBackClick));
		PlayerFramework.addEvent(this.skipForwardControlElement, "click", PlayerFramework.proxy(this, this.onSkipForwardClick));
	},

	createControl: function()
	{
		///	<summary>
		///		Creates and appends all markup for the controls to the DOM.
		///	</summary>

		this.skipBackControlElement = PlayerFramework.createElement(null,
		[
			"div",
			{
				"class": "pf-skip-back-chapter-control"
			},
			[
				"button",
				{
					"class": "pf-button",
					type: "button",
					title: this.options.strings.skipBackTitle,
					accessKey: this.options.accessKeys.skipBackKey
				},
				[
					"span",
					{
						"class": "pf-skip-back-chapter-arrow"
					}
				],
				[
					"span",
					{
						"class": "pf-skip-back-chapter-line"
					}
				]
			]
		]);
		
		this.controlStripPlugin.element.insertBefore(this.skipBackControlElement, this.controlStripPlugin.timelineControlElement);

		this.skipForwardControlElement = PlayerFramework.createElement(null,
		[
			"div",
			{
				"class": "pf-skip-forward-chapter-control"
			},
			[
				"button",
				{
					"class": "pf-button",
					type: "button",
					title: this.options.strings.skipForwardTitle,
					accessKey: this.options.accessKeys.skipForwardKey
				},
				[
					"span",
					{
						"class": "pf-skip-forward-chapter-arrow"
					}
				],
				[
					"span",
					{
						"class": "pf-skip-forward-chapter-line"
					}
				]
			]
		]);
		
		this.controlStripPlugin.element.insertBefore(this.skipForwardControlElement, this.controlStripPlugin.timelineControlElement.nextSibling);

		this.controlStripPlugin.updateLayout();
	}
});
﻿PlayerFramework.Plugins.ErrorMessageControlPlugin = PlayerFramework.ControlPlugin.extend(
{
	defaultOptions: function(player)
	{
		return PlayerFramework.mergeOptions(this._super(),
		{
			strings:
			{
				defaultMessage: "An error occurred while attempting to play the video."
			}
		});
	},

	init: function(player, options)
	{
		///	<summary>
		///		Initializes the ControlPlugin that displays a message when the media element encounters an error.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the ErrorMessageControlPlugin.
		///	</param>
		///	<returns type="ErrorMessageControlPlugin" />

		this._super(player, options);
	},

	// ControlPlugin Event Handlers
	onError: function(e)
	{
		///	<summary>
		///		Called when the media element encounters an error.
		///	</summary>

		//console.log("error = " + this.player.error().code);

		if (!this.element)
		{
			if (this.mediaPlugin() && this.player.error() && this.player.error().code)
				this.show(this.options.strings.defaultMessage);
			else
				this.show(this.options.strings.defaultMessage);
		}
	},

	onNetworkStateChange: function(e)
	{
		///	<summary>
		///		Called when the media element's network state changes.
		///	</summary>

		//console.log("network state = " + this.player.networkState());

		if (!this.element)
		{
			// HACK: recover from a common non-error situation in IE
			if (this.player.networkState() === PlayerFramework.VideoMediaPlugin.NetworkState.NETWORK_NO_SOURCE && window.navigator.appName !== "Microsoft Internet Explorer")
				this.show(this.options.strings.defaultMessage);
		}
	},

	// Functions
	show: function(text)
	{
		///	<summary>
		///		Creates a message control with the specified text and adds it to the DOM.
		///	</summary>
		///	<param name="text" type="String">
		///		The text to display.
		///	</param>

		// Error message control
		this.element = PlayerFramework.createElement(this.player.containerElement,
		[
			"div",
			{
				"class": "pf-error-message-control"
			},
			[
				"div",
				{
					"class": "pf-error-message-container"
				},
				text
			]
		]);
	}
});
﻿PlayerFramework.Plugins.HyperlinkMediaPlugin = PlayerFramework.StaticContentMediaPlugin.extend(
{
	defaultOptions: function(player, playerOptions)
	{
		return PlayerFramework.mergeOptions(this._super(),
		{
			strings:
			{
				downloadsLabel: "Downloads:"
			},
			"class": "pf-hyperlinks",
			unsupportedTypes: [ /text\/xml/i ]
		});
	},

	init: function(player, options, playerOptions)
	{
		///	<summary>
		///		Initializes the MediaPlugin that provides hyperlinks for downloading the media to play locally.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the HyperlinkMediaPlugin.
		///	</param>
		///	<param name="playerOptions" type="Object">
		///		The merged player options for the current media source.
		///	</param>
		///	<returns type="HyperlinkMediaPlugin" />

		this._super(player, options, playerOptions);

		this.player.containerElement.style["background-color"] = "#fff";

		this.render();

		this.player.dispatchEvent({ type: "canplaythrough" });
	},

	render: function()
	{
		///	<summary>
		///		Creates and sets the MediaPlugin's element given the plugin and player options
		///		and a specific template.
		///	</summary>
		 
		var sources = this.playerOptions.sources;

		this.element = PlayerFramework.createElement(null,
		[
			"div",
			{
				"class": this.options["class"],
				width: this.playerOptions.width,
				height: this.playerOptions.height,
				controls: "controls", /* Controls must be turned on initially for compatibility with some browsers. */
				poster: this.playerOptions.poster
			},
			[
				"div",
				this.options.strings.downloadsLabel
			]
		]);

		for (var i = 0; i < sources.length; i++)
		{
			var isSourceSupported = true;

			for (var j = 0; j < this.options.unsupportedTypes.length; j++)
			{
				if (this.options.unsupportedTypes[j].test(sources[i].type))
					isSourceSupported = false;
			}

			if (isSourceSupported)
			{
				var sourceUri = sources[i].src;

				PlayerFramework.createElement(this.element,
				[
					"div",
					[
						"a",
						{
							href: sourceUri,
							title: sourceUri
						},
						sourceUri
					]
				]);
			}
		}
	}
});
﻿PlayerFramework.Plugins.MediaRssPlaylistPlugin = PlayerFramework.Plugins.PlaylistPlugin.extend(
{
	isEnabled: function(player, options)
	{
		return !!player.options.mediaRssPlaylistUrl
	},

	init: function(player, options)
	{
		///	<summary>
		///		Initializes the MediaRssPlaylistPlugin that provides an API for playlist management and downloading a media RSS feed.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the MediaRssPlaylistPlugin.
		///	</param>
		///	<returns type="MediaRssPlaylistPlugin" />

		this._super(player, options);
	},

	// Functions
	loadPlaylistItems: function()
	{
		///	<summary>
		///		Loads the playlist items from the media RSS URL specified in the options.
		///	</summary>

		PlayerFramework.xhr({ url: this.player.options.mediaRssPlaylistUrl }, PlayerFramework.proxy(this, function(result)
		{
			this.playlistItems = this.parseMediaRssXml(result.responseXML);
			
			if (this.playlistItems)
				this.setPlaylistItemOptions();
			else
				this.player.dispatchEvent({ type: "error" });
		}),
		PlayerFramework.proxy(this, function(result)
		{
			this.player.dispatchEvent({ type: "error" });
		}));
	},

	parseMediaRssXml: function(xml)
	{
		///	<summary>
		///		Parses the XML document as a media RSS feed.
		///	</summary>
		///	<returns type="Array" />

		var mediaRssObject = this.parseXmlDocument(xml);

		if(!mediaRssObject || !mediaRssObject.rss || !mediaRssObject.rss.channel || !mediaRssObject.rss.channel.item)
			return;
		
		var mediaRssItemNodes = mediaRssObject.rss.channel.item;

		if (!(mediaRssItemNodes instanceof Array))
			mediaRssItemNodes = [ mediaRssItemNodes ];

		var playlistItems = [];
		
		for(var i = 0; i < mediaRssItemNodes.length; i++)
		{
			var mediaRssItemNode = mediaRssItemNodes[i];

			// Parse <media:content> elements. Treat each <media:content> element that
			// isn't in a <media:group> element as a single playlist item.
			var mediaContentNodes = mediaRssItemNode["media:content"];
			if (mediaContentNodes)
				playlistItems = playlistItems.concat(this.parseMediaContentNodes(mediaContentNodes));

			// Parse <media:group> elements. Treat each <media:content> element under the
			// <media:group> element as a different encoding of the same video (<source>).
			var mediaGroupNodes = mediaRssItemNode["media:group"];
			if (mediaGroupNodes)
				playlistItems = playlistItems.concat(this.parseMediaGroupNodes(mediaGroupNodes));
		}

		return playlistItems;
	},

	parseMediaContentNodes: function(nodes)
	{
		///	<summary>
		///		Parses the specified nodes as media content nodes, each representing a single source.
		///	</summary>
		///	<param name="nodes" type="Array">
		///		An array of "media:content" nodes.
		///	</param>
		///	<returns type="Array" />

		var playlistItems = [];
		
		if (!(nodes instanceof Array))
			nodes = [ nodes ];

		for(var i = 0; i < nodes.length; i++)
		{
			var node = nodes[i];

			if (node.url)
			{
				var playlistItem =
				{
					sources: []
				};

				var source =
				{
					src: node.url
				};

				if (node.type)
					source.type = node.type

				if (node["media:title"])
					playlistItem.title = node["media:title"];

				if (node["media:thumbnail"])
					playlistItem.poster = node["media:thumbnail"].url;

				playlistItem.sources.push(source);

				playlistItems.push(playlistItem);
			}
		}

		return playlistItems;
	},

	parseMediaGroupNodes: function(nodes)
	{
		///	<summary>
		///		Parses the specified nodes as media group nodes, each representing a group of sources.
		///	</summary>
		///	<param name="nodes" type="Array">
		///		An array of "media:group" nodes.
		///	</param>
		///	<returns type="Array" />

		var playlistItems = [];		

		if (!(nodes instanceof Array))
			nodes = [ nodes ];
							
		for(var i = 0; i < nodes.length; i++)
		{
			var node = nodes[i];

			var playlistItem =
			{
				sources: []
			};

			var contentNodes = node["media:content"];

			if (!(contentNodes instanceof Array))
				contentNodes = [ contentNodes ];

			for(var j = 0; j < contentNodes.length; j++)
			{
				var contentNode = contentNodes[j];

				if (contentNode.url)
				{
					var source =
					{
						src: contentNode.url
					};

					if (contentNode.type)
						source.type = contentNode.type;

					if (contentNode["media:title"])
						playlistItem.title = contentNode["media:title"];
					else if (node["media:title"])
						playlistItem.title = node["media:title"];

					if (contentNode["media:thumbnail"])
						playlistItem.poster = contentNode["media:thumbnail"].url;
					else if (node["media:thumbnail"])
						playlistItem.poster = node["media:thumbnail"].url;

					playlistItem.sources.push(source);
				}
			}

			if (playlistItem.sources.length > 0)
				playlistItems.push(playlistItem);
		}

		return playlistItems;
	},

	parseXmlDocument: function(document)
	{
		/// <summary>
		///		Parses a JSON object from the specified XML document.
		///		Based on: http://slideshow.codeplex.com/SourceControl/changeset/view/25074#177488
		///	</summary>
		/// <param name="document">
		///		The document to parse.</param>
		/// <returns type="Object">
		///		The parsed object.
		///	</returns>
		
		var element = document.documentElement;
		
		if (!element)
			return;
		
		var elementName = element.nodeName;
		var elementType = element.nodeType;
		var elementValue = this.parseXmlNode(element);
		
		// document fragment
		if (elementType == 11)
			return elementValue;
		
		var obj = {};
		obj[elementName] = elementValue;
		return obj;
	},
	
	parseXmlNode: function(node)
	{
		/// <summary>
		///		Recursively parses a JSON object from the specified XML node.
		///	</summary>
		/// <param name="element" type="Object">
		///		The node to parse.
		///	</param>
		/// <returns type="Object">
		///		The parsed object.
		///	</returns>
		
		switch (node.nodeType)
		{
			// comment
			case 8:
				return;
			
			// text and cdata
			case 3:
			case 4:
			
				var nodeValue = node.nodeValue;
				
				if (!nodeValue.match(/\S/))
					return;
				
				return this.formatValue(nodeValue);
			
			default:
				
				var obj;
				var counter = {};
				var attributes = node.attributes;
				var childNodes = node.childNodes;
				
				if (attributes && attributes.length)
				{
					obj = {};
					
					for (var i = 0, j = attributes.length; i < j; i++)
					{
						var attribute = attributes[i];
						var attributeName = attribute.nodeName.toLowerCase(); // lowered in order to be consistent with Safari
						var attributeValue = attribute.nodeValue;
						
						if (typeof(counter[attributeName]) == "undefined")
							counter[attributeName] = 0;
						
						this.addProperty(obj, attributeName, this.formatValue(attributeValue), ++counter[attributeName]);
					}
				}
				
				if (childNodes && childNodes.length)
				{
					var textOnly = true;
					
					if (obj)
						textOnly = false;
					
					for (var k = 0, l = childNodes.length; k < l && textOnly; k++)
					{
						var childNodeType = childNodes[k].nodeType;
						
						// text or cdata
						if (childNodeType == 3 || childNodeType == 4)
							continue;
						
						textOnly = false;
					}
					
					if (textOnly)
					{
						if (!obj)
							obj = "";
					
						for (var m = 0, n = childNodes.length; m < n; m++)
							obj += this.formatValue(childNodes[m].nodeValue);
					}
					else
					{
						if (!obj)
							obj = {};
						
						for (var o = 0, p = childNodes.length; o < p; o++)
						{
							var childNode = childNodes[o];
							var childName = childNode.nodeName;
							
							if (typeof(childName) != "string")
								continue;
							
							var childValue = this.parseXmlNode(childNode);
							
							if (!childValue)
								continue;
							
							if (typeof(counter[childName]) == "undefined")
								counter[childName] = 0;
							
							this.addProperty(obj, childName, this.formatValue(childValue), ++counter[childName]);
						}
					}
				}
				
				return obj;
		}
	},
	
	formatValue: function(value)
	{
		/// <summary>
		///		Formats the specified value to its most suitable type.
		///	</summary>
		/// <param name="value">
		///		The value to format.
		///	</param>
		/// <returns type="String">
		///		The formatted value or the original value if no more suitable type exists.
		///	</returns>
		
		if (typeof(value) == "string" && value.length > 0)
		{
			var loweredValue = value.toLowerCase();
			
			if (loweredValue == "true")
				return true;
			else if (loweredValue == "false")
				return false;
			
			if (!isNaN(value))
				return new Number(value).valueOf(); // fixes number issue with option values
		}
		
		return value;
	},
	
	addProperty: function(obj, name, value, count)
	{
		/// <summary>
		///		Adds a property to the specified object.
		///	</summary>
		/// <param name="obj" type="Object">
		///		The target object.
		///	</param>
		/// <param name="name" type="String">
		///		The name of the property.
		///	</param>
		/// <param name="value" type="String">
		///		The value of the property.
		///	</param>
		/// <param name="count" type="Number">
		///		A count that indicates whether or not the property should be an array.
		///	</param>
		
		switch (count)
		{
			case 1:
				obj[name] = value;
				break;
				
			case 2:
				obj[name] = [ obj[name], value ];
				break;
				
			default:
				obj[name][obj[name].length] = value;
				break;
		}
	}
});
﻿PlayerFramework.setDefaultOptions(
{
	containerClassName: "pf-container",
	autoplay: false,
	initialVolume: 0.5,
	overlayControls: true,
	overlayPlayButton: true,
	plugins: PlayerFramework.Plugins,
	pluginOptions: {}
});

PlayerFramework.Player = PlayerFramework.Object.extend(
{
	init: function(element, options)
	{
		///	<summary>
		///		Initializes a Player object, the entry point for the framework.
		///	</summary>
		///	<param name="element" type="String">
		///		The DOM ID of the primary media element. 
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the Player object.
		///	</param>
		///	<returns type="Player" />

		this._super();

		this.mergeOptions(options, PlayerFramework.defaultOptions);

		this.plugins = [];
		this.modules = [];
		this.fallbackMediaPlugins = [];
		this.mediaPlugin = null;
		this.controls = [];
		this.isReady = false;

		PlayerFramework.domReady(PlayerFramework.proxy(this, function()
		{
			if (!element)
				throw new Error("Element is null.");

			// Check if element is a DOM ID.
			if (typeof(element) === "string")
			{
				element = document.getElementById(element);
			
				if (!element)
					throw new Error("Element not found.");
			}

			// Check if element is an HTMLElement.
			if (element.tagName != null)
			{
				if (element.className === this.options.containerClassName)
				{
					this.containerElement = element;
					this.containerElement.style.width = this.options.width;
					this.containerElement.style.height = this.options.height;
				}
				else if (element.parentNode.className !== this.options.containerClassName)
				{
					this.createParentContainer(element);
				}
			}
		
			this.loadPlugins();

			if (!this.options.mediaPluginFallbackOrder)
				this.setMediaPluginFallbackOrderFromDeclaration(element);

			if (!this.options.mediaPluginFallbackOrder || this.options.sources)
				this.setMediaPlugin();
		}), 500);
	},

	// Functions
	createParentContainer: function(element)
	{
		///	<summary>
		///		Creates the parent div container and appends the element passed into the Player Object.
		///	</summary>

		this.containerElement = PlayerFramework.createElement(element.parentNode,
		[
			"div",
			{
				"class": "pf-container",
				style: "width: " + element.width + "px; height: " + element.height + "px;"
			}
		]);
		this.containerElement.appendChild(element);
	},

	loadPlugins: function()
	{
		///	<summary>
		///		Iterates over the plugins, initializing the module plugins and adding them to the
		///		"modules" property on the Player object and adding other plugins the "plugins"
		///		property on the Player object.
		///	</summary>

		if (!this.options || !this.options.plugins)
			return;

		for(var name in this.options.plugins)
		{
			var plugin = PlayerFramework.Plugins[name];
			
			if (PlayerFramework.typeExtendsFrom(plugin, PlayerFramework.ModulePlugin))
			{
				var options = plugin.prototype.defaultOptions(this);
				PlayerFramework.merge(options, this.options.pluginOptions[name]);

				if (plugin.prototype.isEnabled(this, options))
					this.modules.push(new plugin(this, options));
			}
			else
			{
				this.plugins.push(plugin);
			}
		}
	},

	ready: function(callback)
	{
		///	<summary>
		///		Adds an event listner for the "ready" event of the Player object for convenience.
		///	</summary>
		
		if (this.isReady)
		{
			callback();
		}
		else
		{
			this.addEventListener("ready", function()
			{
				window.setTimeout(callback, 1);
			}, false);
		}
	},

	setMediaPluginFallbackOrderFromDeclaration: function(primaryElement)
	{
		///	<summary>
		///		Iterates over the nested fallback elements in the DOM starting with the element
		///		passed to the Player object and finds a matching media plugin using the class name of the element.
		///	</summary>

		var fallbackMediaPlugins = [];

		var mediaPlugins = PlayerFramework.filter(this.plugins, function(p)
		{
			return PlayerFramework.typeExtendsFrom(p, (PlayerFramework.MediaPlugin));
		});

		// Use a recursive function to assign media plugins given the class name of an element.
		var findMediaPluginsForElements = function(elements)
		{
			// Loop through all child elements (some fallback elements, some not).
			for(var i = 0; i < elements.length; i++)
			{
				var element = elements[i];

				if (element.className)
				{
					var matchingPlugin = PlayerFramework.first(mediaPlugins, PlayerFramework.proxy(this, function(p)
					{
						var playerOptions = {};

						// Copy player options.
						PlayerFramework.merge(playerOptions, this.options);

						// Get default plugin options.
						var pluginOptions = p.prototype.defaultOptions(this, playerOptions);

						// Merge plugin options passed during player instantiation with default plugin options.
						PlayerFramework.merge(pluginOptions, this.options.pluginOptions[name]);
						
						return pluginOptions["class"] === element.className && !p.prototype.render;
					}));

					if (!matchingPlugin && i === (elements.length - 1))
						throw new Error("No matching media plugin.");

					// Stop searching once an element with a class name from a media plugin is found.
					if (matchingPlugin)
					{
						fallbackMediaPlugins.push(
						{
							type: matchingPlugin,
							element: element
						});

						PlayerFramework.proxy(this, findMediaPluginsForElements)(element.childNodes);
						break;
					}
				}
			}
		};
		
		PlayerFramework.proxy(this, findMediaPluginsForElements)([ primaryElement ]);

		this.fallbackMediaPlugins = fallbackMediaPlugins;
	},

	setMediaPluginFallbackOrderFromOptions: function(options)
	{
		///	<summary>
		///		Iterates over the media plugin fallback order array and finds a matching media plugin using the item string.
		///	</summary>

		this.fallbackMediaPlugins = [];

		// Loop through the given class names to find matching media plugins.
		for(var i = 0; i < options.mediaPluginFallbackOrder.length; i++)
		{
			var mediaPluginName = options.mediaPluginFallbackOrder[i];
			var matchingPlugin = options.plugins[mediaPluginName];

			if (!matchingPlugin)
				throw new Error("No matching media plugin.");

			this.fallbackMediaPlugins.push(
			{
				type: matchingPlugin,
				name: mediaPluginName
			});
		}
	},

	setMediaPlugin: function(options)
	{
		///	<summary>
		///		Finds and sets a media plugin supported by the browser given the set of media plugins passed in the options.
		///	</summary>

		var playerOptions = {};

		// Copy player options.
		PlayerFramework.merge(playerOptions, this.options);

		// Merge item-specific player options with player options.
		if (options)
			PlayerFramework.merge(playerOptions, options);

		if (playerOptions.mediaPluginFallbackOrder)
			this.setMediaPluginFallbackOrderFromOptions(playerOptions);

		var previousMediaPluginElement = null;
		PlayerFramework.forEachAsync(this.fallbackMediaPlugins, PlayerFramework.proxy(this, function(loopCallback, p)
		{
			// If the element was declared and was a fallback, remove the element from the DOM to promote it.
			if (p.element && previousMediaPluginElement)
			{
				var elementToClone = p.element.parentNode.removeChild(p.element);
				//IE needs a cloned node instead of promoting the existing nested child node.
				p.element = elementToClone.cloneNode(true);
			}

			// Get default plugin options.
			var pluginOptions = p.type.prototype.defaultOptions(this, playerOptions);
			
			if (p.element)
				pluginOptions.element = p.element;

			// Merge plugin options passed during player instantiation with default plugin options.
			PlayerFramework.merge(pluginOptions, this.options.pluginOptions[p.name]);

			// Create new instance of the media plugin.
			var mediaPlugin = new p.type(this, pluginOptions, playerOptions);

			// Add the element to the DOM if it is being promoted or injected.
			if (!mediaPlugin.element.parentNode)
			{
				this.containerElement.insertBefore(mediaPlugin.element, this.containerElement.firstChild);

				if (previousMediaPluginElement)
					this.containerElement.removeChild(previousMediaPluginElement);
			}

			mediaPlugin.checkSupport(PlayerFramework.proxy(this, function(isSupported)
			{
				if (isSupported)
				{
					this.mediaPlugin = mediaPlugin;
			
					if (this.mediaPlugin instanceof PlayerFramework.VideoMediaPlugin)
					{
						this.mediaPlugin.setup();
						
						window.setTimeout(PlayerFramework.proxy(this, function()
						{
							if (this.isReady === false)
							{
								this.isReady = true;
								this.dispatchEvent({ type: "ready" });
							}

							this.mediaPlugin.onLoadedMediaPlugin();
						}), 1);
					}
				}
				else
				{
					previousMediaPluginElement = mediaPlugin.element;
					loopCallback();
				}
			}));
		}));
	}
});
﻿PlayerFramework.Plugins.PlaylistControlPlugin = PlayerFramework.ControlPlugin.extend(
{
	defaultOptions: function(player)
	{
		return PlayerFramework.mergeOptions(this._super(),
		{
			strings:
			{
				toggleLabel: "PLAYLIST",
				toggleTitle: "Show Playlist",
				toggleAltTitle: "Hide Playlist",
				arrowLeftTitle: "Scroll Playlist Left",
				arrowRightTitle: "Scroll Playlist Right"
			},
			accessKeys:
			{
				toggleKey: "l",
				arrowLeftKey: "q",
				arrowRightKey: "w"
			},
			playlistPlugin: PlayerFramework.first(player.modules, function(m)
			{
				return m instanceof PlayerFramework.Plugins.PlaylistPlugin;
			})
		});
	},

	isEnabled: function(player, options)
	{
		return !!options.playlistPlugin;
	},

	init: function(player, options)
	{
		///	<summary>
		///		Initializes the ControlPlugin that provides UI for controlling the playlist.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the PlaylistControlPlugin.
		///	</param>
		///	<returns type="PlaylistControlPlugin" />

		this._super(player, options);

		// Find the required plugins.
		this.playlistPlugin = this.options.playlistPlugin;

		if (!this.playlistPlugin)
			throw new Error("PlaylistPlugin required.");

		this.playlistItemSpacer = 10;
		this.playInitiated = false;
	},

	// Event Handlers
	onLoadedMediaPlugin: function(e)
	{
		///	<summary>
		///		Dispatches the "loadedMediaPlugin" event on behalf of the Player object.
		///	</summary>

		this.setSelectedPlaylistItem();
	},

	onPlayerMouseOut: function(e)
	{
		///	<summary>
		///		Called when the mouse leaves the media element.
		///	</summary>

		if (this.playlistElement && this.playlistToggleElement && this.playInitiated)
		{
			this.playlistToggleElement.style.display = "none";
			
			if (this.playlistElement.style.top === "0px")
				this.playlistElement.style.display = "none";
		}
	},

	onPlayerMouseOver: function(e)
	{
		///	<summary>
		///		Called when the mouse enters the player.
		///	</summary>
		
		if (this.playlistElement && this.playlistToggleElement && this.playInitiated)
		{
			this.playlistToggleElement.style.display = "block";

			if (this.playlistElement.style.top === "0px")
				this.playlistElement.style.display = "block";
		}
	},

	onPlay: function(e)
	{
		///	<summary>
		///		Called when the mouse enters the player.
		///	</summary>
		
		this.playInitiated = true;
	},

	onPlaylistItemAdded: function(e)
	{
		///	<summary>
		///		Called when a playlist item is added.
		///	</summary>
		
		this.playlistItemsElement.innerHTML = "";
		this.createPlaylistItems();
		this.setSelectedPlaylistItem();
	},

	onPlaylistItemRemoved: function(e)
	{
		///	<summary>
		///		Called when a playlist item is removed.
		///	</summary>
		
		this.playlistItemsElement.innerHTML = "";
		this.createPlaylistItems();
		this.setSelectedPlaylistItem();
	},

	onPlaylistItemClick: function(e)
	{
		///	<summary>
		///		Called when a playlist item is clicked.
		///	</summary>

		this.togglePlaylistDisplay(false);
		this.playlistPlugin.setPlaylistItem(e.selectedPlaylistItemIndex);
		this.setSelectedPlaylistItem();
	},

	onPlaylistArrowControlLeftElementClick: function(e)
	{
		///	<summary>
		///		Called when the left playlist navigation arrow is clicked or activated.
		///	</summary>

		if (this.arrowElementMouseDownEventFired)
			this.arrowElementMouseDownEventFired = false;
		else
			this.scrollPlaylist(this.playlistItemWidth + this.playlistItemSpacer);
	},

	onPlaylistArrowControlLeftElementMouseDown: function(e)
	{
		///	<summary>
		///		Called when the left playlist navigation arrow is pressed.
		///	</summary>

		this.arrowElementMouseDown = true;
		this.arrowElementMouseDownEventFired = true;
		this.scrollPlaylist(5);
	},

	onPlaylistArrowControlRightElementClick: function(e)
	{
		///	<summary>
		///		Called when the right playlist navigation arrow is clicked or activated.
		///	</summary>

		if (this.arrowElementMouseDownEventFired)
			this.arrowElementMouseDownEventFired = false;
		else
			this.scrollPlaylist(-(this.playlistItemWidth + this.playlistItemSpacer));
	},

	onPlaylistArrowControlRightElementMouseDown: function(e)
	{
		///	<summary>
		///		Called when the right playlist navigation arrow is pressed.
		///	</summary>

		this.arrowElementMouseDown = true;
		this.arrowElementMouseDownEventFired = true;
		this.scrollPlaylist(-5);	
	},

	onPlaylistArrowElementMouseUp: function(e)
	{
		///	<summary>
		///		Called when the a playlist navigation arrow is released.
		///	</summary>

		this.arrowElementMouseDown = false;
	},

	onPlaylistToggleElementClick: function(e)
	{
		///	<summary>
		///		Called when the the playlist toggle button is clicked.
		///	</summary>

		this.togglePlaylistDisplay(this.playlistElement.style.top !== "0px");
	},

	onReady: function(e)
	{
		///	<summary>
		///		When overridden in a derived class, called when the player is ready for playback.
		///	</summary>

		this.createControl();
		this.addEventListeners();
	},

	// Functions
	addEventListeners: function()
	{
		///	<summary>
		///		Adds event listeners to the control's elements.
		///	</summary>
		
		PlayerFramework.addEvent(this.player, "playlistitemadded", PlayerFramework.proxy(this, this.onPlaylistItemAdded));
		PlayerFramework.addEvent(this.player, "playlistitemremoved", PlayerFramework.proxy(this, this.onPlaylistItemRemoved));
		PlayerFramework.addEvent(this.player, "play", PlayerFramework.proxy(this, this.onPlay));
		PlayerFramework.addEvent(this.playlistElement, "mouseover", PlayerFramework.mouseEventProxy(this.player, "mouseover"));
		PlayerFramework.addEvent(this.playlistElement, "mouseout", PlayerFramework.mouseEventProxy(this.player, "mouseout"));
		PlayerFramework.addEvent(this.playlistToggleElement, "mouseover", PlayerFramework.mouseEventProxy(this.player, "mouseover"));
		PlayerFramework.addEvent(this.playlistToggleElement, "mouseout", PlayerFramework.mouseEventProxy(this.player, "mouseout"));
		PlayerFramework.addEvent(this.playlistToggleElement, "click", PlayerFramework.proxy(this, this.onPlaylistToggleElementClick));
		PlayerFramework.addEvent(this.playlistArrowControlLeftElement, "mousedown", PlayerFramework.proxy(this, this.onPlaylistArrowControlLeftElementMouseDown));
		PlayerFramework.addEvent(this.playlistArrowControlLeftElement, "mouseup", PlayerFramework.proxy(this, this.onPlaylistArrowElementMouseUp));
		PlayerFramework.addEvent(this.playlistArrowControlLeftElement, "click", PlayerFramework.proxy(this, this.onPlaylistArrowControlLeftElementClick));
		PlayerFramework.addEvent(this.playlistArrowControlRightElement, "mousedown", PlayerFramework.proxy(this, this.onPlaylistArrowControlRightElementMouseDown));
		PlayerFramework.addEvent(this.playlistArrowControlRightElement, "mouseup", PlayerFramework.proxy(this, this.onPlaylistArrowElementMouseUp));
		PlayerFramework.addEvent(this.playlistArrowControlRightElement, "click", PlayerFramework.proxy(this, this.onPlaylistArrowControlRightElementClick));
	},

	createControl: function()
	{
		///	<summary>
		///		Creates and appends all markup for the controls to the DOM.
		///	</summary>

		this.playlistToggleElement = PlayerFramework.createElement(this.player.containerElement,
		[
			"div",
			{
				"class": "pf-playlist-toggle"
			}
		]);

		this.playlistToggleButtonElement = PlayerFramework.createElement(this.playlistToggleElement,
		[
			"button",
			{
				"class": "pf-button",
				type: "button",
				title: this.options.strings.toggleTitle,
				accessKey: this.options.accessKeys.toggleKey
			},
			[
				"span",
				{
					"class": "pf-playlist-toggle-text"
				},
				this.options.strings.toggleLabel
			]
		]);

		this.playlistElement = PlayerFramework.createElement(this.player.containerElement,
		[
			"div",
			{
				"class": "pf-playlist",
				style: "display: block;" // Ensure playlist div is displaying to get height below.
			},
			[
				"div",
				{
					"class": "pf-playlist-arrow-control pf-playlist-arrow-control-left"
				},
				[
					"button",
					{
						"class": "pf-button",
						type: "button",
						title: this.options.strings.arrowLeftTitle,
						accessKey: this.options.accessKeys.arrowLeftKey
					},
					[
						"span",
						{
							"class": "pf-playlist-arrow"
						}
					]
				]
			],
			[
				"div",
				{
					"class": "pf-playlist-items-container"
				},
				[
					"div",
					{
						"class": "pf-playlist-items"
					}
				]
			],
			[
				"div",
				{
					"class": "pf-playlist-arrow-control pf-playlist-arrow-control-right"
				},
				[
					"button",
					{
						"class": "pf-button",
						type: "button",
						title: this.options.strings.arrowRightTitle,
						accessKey: this.options.accessKeys.arrowRightKey
					},
					[
						"span",
						{
							"class": "pf-playlist-arrow"
						}
					]
				]
			]
		]);

		this.playlistArrowControlLeftElement = PlayerFramework.getElementsByClass("pf-playlist-arrow-control-left", this.playlistElement)[0];
		this.playlistArrowControlRightElement = PlayerFramework.getElementsByClass("pf-playlist-arrow-control-right", this.playlistElement)[0];
		this.playlistItemsContainerElement = PlayerFramework.getElementsByClass("pf-playlist-items-container", this.playlistElement)[0];
		this.playlistItemsElement = PlayerFramework.getElementsByClass("pf-playlist-items", this.playlistElement)[0];
		this.playlistItemsContainerElementWidth = this.playlistItemsContainerElement.offsetWidth;
		this.playlistElementHeight = this.playlistElement.offsetHeight; // Store for use when toggling playlist display.
		this.playlistItemWidth = this.playlistElement.offsetHeight; // Derived from (4/3) * (3/4) * playlist height (4:3 ratio multiplied by 75% of the playlist height).
		
		this.playlistElement.style.display = "none";

		this.createPlaylistItems();
	},

	createPlaylistItems: function()
	{
		///	<summary>
		///		Creates all playlist items.
		///	</summary>

		for (var i = 0; i < this.playlistPlugin.playlistItems.length; i++)
		{
			this.createPlaylistItemControl(this.playlistPlugin.playlistItems[i], i);
		}
	},

	createPlaylistItemControl: function(playlistItem, playlistItemIndex)
	{
		///	<summary>
		///		Creates a single playlist item control.
		///	</summary>

		var playlistItemElement = PlayerFramework.createElement(this.playlistItemsElement,
		[
			"div",
			{
				"class": "pf-playlist-item",					
				style: "left: " + playlistItemIndex * (this.playlistItemWidth + this.playlistItemSpacer) + "px; width: " + this.playlistItemWidth + "px;"
			}
		]);

		var playlistItemButtonElement = PlayerFramework.createElement(playlistItemElement,
		[
			"button",
			{
				"class": "pf-button",
				type: "button",
				title: playlistItem.title
			}
		]);

		if (playlistItem.poster)
		{
			PlayerFramework.createElement(playlistItemButtonElement,
			[
				"img",
				{
					src: playlistItem.poster,
					style: "width: 100%; height: 100%;"
				}
			]);
		}

		PlayerFramework.proxy(this, function(playlistItemIndex)
		{
			PlayerFramework.addEvent(playlistItemElement, "click", PlayerFramework.proxy(this, function(e)
			{
				this.onPlaylistItemClick(
				{
					selectedPlaylistItemIndex: playlistItemIndex
				});
			}));
		})(playlistItemIndex);
	},

	togglePlaylistDisplay: function(showPlaylist)
	{
		///	<summary>
		///		Toggles the display of the playlist.
		///	</summary>
		///	<param name="showPlaylist" type="Boolean">
		///		Determines whether to show or hide the playlist.
		///	</param>

		if (this.mediaPlugin())
		{
			if (showPlaylist)
			{
				this.playlistElement.style.display = "block";
				this.playlistElement.style.top = "0px";
				this.playlistToggleElement.style.display = "block";
				this.playlistToggleElement.style.top = this.playlistElementHeight + "px";
				this.playlistToggleButtonElement.setAttribute("title", this.options.strings.toggleAltTitle);
			}
			else
			{
				this.playlistElement.style.display = "none";
				this.playlistElement.style.top = -this.playlistElementHeight + "px";
				this.playlistToggleElement.style.display = "none";
				this.playlistToggleElement.style.top = "0px";
				this.playlistToggleButtonElement.setAttribute("title", this.options.strings.toggleTitle);
			}
		}
	},

	setSelectedPlaylistItem: function()
	{
		///	<summary>
		///		Changes the style of the current playlist item control to appear selected and changes
		///		the style of all other playlist item controls to appear deselected.
		///	</summary>

		var playlistItemElements = this.playlistItemsElement.childNodes;
		
		// Reset styles for all playlist items.
		PlayerFramework.forEach(playlistItemElements, function(item)
		{
			item.className = "pf-playlist-item";
		});

		var selectedPlaylistItem = playlistItemElements[this.playlistPlugin.currentPlaylistItemIndex];
		
		// Change style.
		selectedPlaylistItem.className = "pf-playlist-item pf-playlist-item-selected";

		// Scroll into view.
		var leftValue = parseInt(this.playlistItemsElement.style.left || "0px");
		if (leftValue + selectedPlaylistItem.offsetLeft + this.playlistItemWidth > this.playlistItemsContainerElementWidth)
		{
			var offset = this.playlistItemsContainerElementWidth - (this.playlistPlugin.currentPlaylistItemIndex + 1) * (this.playlistItemWidth + this.playlistItemSpacer);
			this.playlistItemsElement.style.left = offset + "px";
		}
	},

	scrollPlaylist: function(delta)
	{	
		///	<summary>
		///		Scrolls the playlist along the x-axis by the given delta.
		///	</summary>
		///	<param name="showPlaylist" type="Boolean">
		///		Determines whether to show or hide the playlist.
		///	</param>

		var leftValue = parseInt(this.playlistItemsElement.style.left || "0px") + delta;
		var maxLeft = (this.playlistPlugin.playlistItems.length - 1) * (this.playlistItemWidth + this.playlistItemSpacer);

		if (leftValue > 0)
			leftValue = 0;
		else if (leftValue < -maxLeft)
			leftValue = -maxLeft;
				
		this.playlistItemsElement.style.left = leftValue + "px";

		// Loop animation while mouse is down.
		window.setTimeout(PlayerFramework.proxy(this, function()
		{
			if (this.arrowElementMouseDown)
				this.scrollPlaylist(delta);
		}), 15);
	}
});
﻿PlayerFramework.Plugins.SilverlightMediaPlugin = PlayerFramework.Plugins.SilverlightMediaPluginBase.extend(
{
	defaultOptions: function(player, playerOptions)
	{
		return PlayerFramework.mergeOptions(this._super(),
		{
			params:
			{
			    source: "http://smf.cloudapp.net/html5/xap/SilverlightPlayer.xap",
				onError: "onSilverlightError",
				onLoad: "onSilverlightLoad",
				minRuntimeVersion: "5.0.61118.0",
				autoUpgrade: false,
				enableGPUAcceleration: true,
				windowless: true
			},
			initParams:
			{
			    scriptablename: "Player",
                captionsvisibility: "hidden",
				autoplay: !!playerOptions.autoplay
			}
		});
	},

	init: function(player, options, playerOptions)
	{
		///	<summary>
		///		Initializes the VideoMediaPlugin that injects and wraps the Silverlight player.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the SilverlightMediaPlugin.
		///	</param>
		///	<param name="playerOptions" type="Object">
		///		The merged player options for the current media source.
		///	</param>
		///	<returns type="SilverlightMediaPlugin" />

		this._super(player, options, playerOptions);

		this.render();
	},

	render: function()
	{
		///	<summary>
		///		Creates and sets the MediaPlugin's element given the plugin and player options
		///		and a specific template.
		///	</summary>

		var element = PlayerFramework.createElement(null,
		[
			"object",
			{
				"class": this.options["class"],
				data: "data:application/x-silverlight-2,",
				type: "application/x-silverlight-2",
				width: this.playerOptions.width,
				height: this.playerOptions.height,
				"data-poster": this.playerOptions.poster || null
			}
		]);

		this.createParams(element);

		// Element is cloned for IE, otherwise it does not display.
		this.setElement(element.cloneNode(true));
	},

	createParams: function(element)
	{
		///	<summary>
		///		Creates param child nodes on the specified element given the media plugin's options.
		///	</summary>

		// Push all object params.
		for(var p in this.options.params)
		{
			PlayerFramework.createElement(element,
			[
				"param",
				{
					name: p,
					value: this.options.params[p]
				}
			]);
		}

		var mediaUrl = this.options.initParams.mediaurl;
        if (!mediaUrl)
        {
            mediaUrl = this.getMediaUrl();
			PlayerFramework.merge(this.options.initParams,
			{
			    mediaurl: mediaUrl
			});
        }

        var deliveryMethod = this.options.initParams.deliveryMethod;
        if (!deliveryMethod) {
            deliveryMethod = this.getDeliveryMethod(mediaUrl);
		    PlayerFramework.merge(this.options.initParams,
			{
			    deliverymethod: deliveryMethod
			});
        }

		var initParams = "";
		// Concatenate and add the special "InitParams" object param.
		for(var p in this.options.initParams)
		{
			if (initParams)
				initParams += ",";

			initParams += p + "=" + this.options.initParams[p];
		}

		PlayerFramework.createElement(element,
		[
			"param",
			{
				name: "InitParams",
				value: initParams
			}
		]);
	},

	getMediaUrl: function()
	{
		var firstSupportedSource = PlayerFramework.first(this.playerOptions.sources, PlayerFramework.proxy(this, function(s)
		{
			return this.canPlayType(s.type);
		}));
		
		if (!firstSupportedSource)
			return null;

		return firstSupportedSource.src.indexOf('://') != -1
											? firstSupportedSource.src
											: this.qualifyURL(firstSupportedSource.src);
	},

	getDeliveryMethod: function(mediaUrl)
	{
	    if (mediaUrl.toLowerCase().indexOf('/manifest') != -1) {
	        return "AdaptiveStreaming";
	    } else {
	        return "ProgressiveDownload";
	    }
	},

	escapeHTML: function(s)
	{
		return s.split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;');
	},

	qualifyURL: function(url)
	{
		var el= document.createElement('div');
		el.innerHTML= '<a href="'+ this.escapeHTML(url) +'">x</a>';
		return el.firstChild.href;
	}
});
﻿PlayerFramework.TextTrack = PlayerFramework.Object.extend(
{
	init: function(options)
	{
		///	<summary>
		///		Initializes a TextTrack that represents a set of cues.
		///	</summary>
		///	<param name="options" type="Object">
		///		The options for the TextTrackCueList.
		///	</param>

		this._super(options);
		
		this.kind = "";
		this.label = "";
		this.language = "";

		this.readyState = PlayerFramework.TextTrack.ReadyState.NONE;
		this.mode = PlayerFramework.TextTrack.Mode.HIDDEN;

		this.cues = new PlayerFramework.TextTrackCueList();
		this.activeCues = new PlayerFramework.TextTrackCueList();
		this.xml = null; // Implementation - not per the W3C specification.

		this.onload = function () { };
		this.onerror = function () { };
		this.oncuechange = null;
	},

	addCue: function(cue)
	{
		///	<summary>
		///		Adds the given cue to the text track's list of cues.
		///	</summary>

		this.cues.push(cue);
		
		this.cues.sort(function(a, b)
		{
			return a.startTime > b.startTime ? 1 : -1;
		});
	},

	removeCue: function(cue)
	{
		///	<summary>
		///		Removes the given cue from the text track's list of cues.
		///	</summary>

		for(var i = 0; i < this.cues.length; i++)
		{
			if (this.cues[i].id == cue.id)
			{
				this.cues.splice(i, 1);
				break;
			}
		}
	}
});

PlayerFramework.TextTrack.ReadyState =
{
	///	<summary>
	///		A JSON object used to store the values of the text track's ready state.
	///	</summary>

	NONE: 0,
	LOADING: 1,
	LOADED: 2,
	ERROR: 3
};

PlayerFramework.TextTrack.Mode =
{
	///	<summary>
	///		A JSON object used to store the values of the text track's mode.
	///	</summary>

	OFF: 0,
	HIDDEN: 1,
	SHOWING: 2
};

PlayerFramework.TextTrack.DisplayPreference =
{
	///	<summary>
	///		A JSON object used to store the values of the text track's display preference.
	///	</summary>

	NONE: 0,
	CUSTOM: 1,
	NATIVE: 2,
	ALL: 3
};
﻿PlayerFramework.TextTrackCue = PlayerFramework.Object.extend(
{
	init: function(options)
	{
		///	<summary>
		///		Initializes a TextTrackCue that is the unit of time-sensitive data in a text track,
		///		corresponding for instance for subtitles and captions to the text that appears
		///		at a particular time and disappears at another time.
		///	</summary>
		///	<param name="options" type="Object">
		///		The options for the TextTrackCue.
		///	</param>

		this._super(options);

		this.track = this.options.track;
		this.id = this.options.id;
		this.startTime = this.options.startTime;
		this.endTime = this.options.endTime;
		this.pauseOnExit = this.options.pauseOnExit;

		this.onenter = null;
		this.onexit = null;
	},
	
	getCueAsSource: function ()
	{
		///	<summary>
		///		Returns the text track cue text in raw unparsed form.
		///	</summary>
	
		return this.options.text;
	},

	getCueAsHTML: function ()
	{
		///	<summary>
		///		Returns the text track cue text as a DocumentFragment of HTML elements and other DOM nodes.
		///	</summary>

		return this.options.markup;
	}
});
﻿PlayerFramework.TextTrackCueList = function(options)
{
	///	<summary>
	///		Initializes a TextTrackCueList that represents a dynamically updating list of text track cues in a given order.
	///	</summary>
	///	<param name="options" type="Object">
	///		The options for the TextTrackCueList.
	///	</param>

	var list = [];

	if (options && options.list)
	{
		PlayerFramework.forEach(options.list, PlayerFramework.proxy(this, function(item)
		{
			list.push(new PlayerFramework.TextTrackCue(
			{
				track: options.track,
				id: item.id,
				startTime: item.start / 1000,
				endTime: item.end / 1000,
				pauseOnExit: false,
				text: item.caption.innerHTML,
				markup: item.caption,
				uri: item.uri
			}));
		}));
	}

	list.getCueById = function (id)
	{
		///	<summary>
		///		Returns the first text track cue (in text track cue order) with text track cue identifier id.
		///	</summary>.

		if (id === "")
			return null;

		var foundCue = PlayerFramework.first(list, function(cue)
		{
			return cue.id === id;
		});

		return foundCue;
	};

	return list;
};
﻿PlayerFramework.Plugins.ThrobberControlPlugin = PlayerFramework.ControlPlugin.extend(
{
	defaultOptions: function(player)
	{
		return PlayerFramework.mergeOptions(this._super(),
		{
			strings:
			{
				throbberTitle: "Buffering"
			},
			nodeCount: 12,
			maxOpacity: 0.85,
			animationDelay: 75 /* milliseconds */
		});
	},

	init: function(player, options)
	{
		///	<summary>
		///		Initializes the ControlPlugin that displays a "spinning wheel" while the UI loads.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the ThrobberControlPlugin.
		///	</param>
		///	<returns type="ThrobberControlPlugin" />

		this._super(player, options);

		this.createControl();
		this.animateNodes();
	},

	// ControlPlugin Event Handlers
	onCanPlayThrough: function(e)
	{
		///	<summary>
		///		Called when the media element can play through to the end without having to stop for further buffering.
		///	</summary>
		
		this.hide();
	},

	onError: function(e)
	{
		///	<summary>
		///		Called when the media element encounters an error.
		///	</summary>

		this.hide();
	},

	onUnloadingMediaPlugin: function(e)
	{
		this.element.style.display = "block";
		this.animateNodes();
	},

	onNetworkStateChange: function(e)
	{
		///	<summary>
		///		Called when the media element's network state changes.
		///	</summary>

		if (this.player.networkState() === PlayerFramework.VideoMediaPlugin.NetworkState.NETWORK_NO_SOURCE)
			this.hide();
	},

	// Functions
	createControl: function()
	{
		///	<summary>
		///		Creates and appends all markup for the controls to the DOM.
		///	</summary>
		
		// Throbber control
		this.element = PlayerFramework.createElement(this.player.containerElement,
		[
			"div",
			{
				"class": "pf-throbber-control",
				title: this.options.strings.throbberTitle
			}
		]);

		// Throbber container
		this.throbberContainerElement = PlayerFramework.createElement(this.element,
		[
			"div",
			{
				"class": "pf-throbber-container"
			}
		]);

		// Create throbber nodes
		this.throbberNodeElements = [];
		this.opacityDifference = this.options.maxOpacity / this.options.nodeCount;
		var separationAngle = (2 * Math.PI) / this.options.nodeCount;
		var throbberRadius = parseInt(PlayerFramework.getComputedStyle(this.throbberContainerElement, "width")) / 2;
		
		for (var i = 0; i < this.options.nodeCount; i++)
		{
			var throbberNodeElement = PlayerFramework.createElement(this.throbberContainerElement,
			[
				"div",
				{
					"class": "pf-throbber-node"
				}
			]);
			this.throbberNodeElements.push(throbberNodeElement);
			
			var nodeRadius = parseInt(PlayerFramework.getComputedStyle(throbberNodeElement, "width")) / 2;
			var x = throbberRadius * (Math.cos(i * separationAngle) + 1) - nodeRadius;
			var y = throbberRadius * (Math.sin(i * separationAngle) + 1) - nodeRadius;
			
			throbberNodeElement.style.left = x.toString() + "px";
			throbberNodeElement.style.top = y.toString() + "px";
			throbberNodeElement.style.opacity = this.options.maxOpacity - ((this.options.nodeCount - i) * this.opacityDifference);
		}
	},

	animateNodes: function()
	{
		if (this.element.style.display === "none")
			return;

		window.setTimeout(PlayerFramework.proxy(this, function()
		{
			PlayerFramework.requestAnimationFrame(PlayerFramework.proxy(this, this.animateNodes));
		}), this.options.animationDelay);

		this.fadeNodes();
	},

	fadeNodes: function()
	{
		for (var i = 0; i < this.options.nodeCount; i++)
		{
			var throbberNodeElement = this.throbberNodeElements[i];
			throbberNodeElement.style.opacity = this.options.maxOpacity - ((this.options.nodeCount - i) * this.opacityDifference);
		}

		this.throbberNodeElements.push(this.throbberNodeElements.shift());
	},

	hide: function()
	{
		window.setTimeout(PlayerFramework.proxy(this, function()
		{
			this.element.style.display = "none";
		}), 500);
	}
});
﻿PlayerFramework.Plugins.TimelineTrackControlPlugin = PlayerFramework.ControlPlugin.extend(
{
	defaultOptions: function(player)
	{
		return PlayerFramework.mergeOptions(this._super(),
		{
			timelineTrackPlugin: PlayerFramework.first(player.modules, function(m)
			{
				return m instanceof PlayerFramework.Plugins.TimelineTrackPlugin;
			}),
			controlStripPlugin: PlayerFramework.first(player.modules, function(m)
			{
				return m instanceof PlayerFramework.Plugins.ControlStripPlugin;
			})
		});
	},

	isEnabled: function(player, options)
	{
		return !!options.timelineTrackPlugin && !!options.controlStripPlugin;
	},

	init: function(player, options)
	{
		///	<summary>
		///		Initializes the TimelineTrackControlPlugin that provides UI for displaying and controlling timeline cues.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the TimelineTrackControlPlugin.
		///	</param>
		///	<returns type="TimelineTrackControlPlugin" />

		this._super(player, options);

		// Find the required plugins.
		this.timelineTrackPlugin = this.options.timelineTrackPlugin;
		this.controlStripPlugin = this.options.controlStripPlugin;

		if (!this.timelineTrackPlugin)
			throw new Error("TimelineTrackPlugin required.");

		if (!this.controlStripPlugin)
			throw new Error("ControlStripPlugin required.");

		this.cuesPositioned = false;
		this.cueElements = [];
	},

	// Event Handlers	
	onTimelineCueAdded: function(e)
	{		
		///	<summary>
		///		Called when a timeline cue is added. Displays the cue control on the timeline.
		///	</summary>
		
		var cueElement = PlayerFramework.createElement(this.timelineCueContainerElement,
		[
			"div",
			{
				"class": "pf-timeline-cue"
			}
		]);

		cueElement.cue = e.cue;

		PlayerFramework.addEvent(cueElement, "click", PlayerFramework.proxy(this, function()
		{
			this.onTimelineCueClicked(e.cue);
		}));

		this.cueElements.push(cueElement);

		if (this.player.duration())
			this.positionCue(cueElement);
	},

	onTimelineCueClicked: function(e)
	{		
		///	<summary>
		///		Called when a timeline cue is clicked. Seeks to the position represented by
		///		the timeline cue.
		///	</summary>
		
		this.player.currentTime(e.startTime);
	},

	onTimelineCueRemoved: function(e)
	{
		///	<summary>
		///		Called when a timeline cue is removed. Removes the cue control from the timeline.
		///	</summary>

		for(var i = 0; i < this.cueElements.length; i++)
		{
			var cueElement = this.cueElements[i];
			if (cueElement.cue == e.cue)
			{
				this.timelineCueContainerElement.removeChild(cueElement);
				this.cueElements.splice(i, 1);
				break;
			}
		}	
	},

	onPlay: function(e)
	{
		///	<summary>
		///		Called when the media plays. Displays and positions all cues. 
		///	</summary>

		if (!this.cuesPositioned)
		{
			this.cuesPositioned = true;
			PlayerFramework.forEach(this.cueElements, PlayerFramework.proxy(this, this.positionCue));
		}
	},

	onReady: function(e)
	{
		///	<summary>
		///		Called when the player is ready for playback. Creates the timeline cue controls and adds event listeners.
		///	</summary>

		this.createControl();
		this.addEventListeners();
	},

	onUnloadingMediaPlugin: function(e)
	{
		///	<summary>
		///		Called when the media element unloads. Removes all cue controls from the timeline.
		///	</summary>

		this.cuesPositioned = false;
		this.cueElements = [];
	},

	// Functions
	addEventListeners: function()
	{
		///	<summary>
		///		Adds event listeners to the control's elements.
		///	</summary>

		PlayerFramework.addEvent(this.player, "timelinecueadded", PlayerFramework.proxy(this, this.onTimelineCueAdded));
		PlayerFramework.addEvent(this.player, "timelinecueremoved", PlayerFramework.proxy(this, this.onTimelineCueRemoved));
		PlayerFramework.addEvent(this.player, "timeupdate", PlayerFramework.proxy(this, this.onTimeUpdate));
	},

	createControl: function()
	{
		///	<summary>
		///		Creates and appends all markup for the controls to the DOM.
		///	</summary>

		this.timelineCueContainerElement = PlayerFramework.createElement(this.controlStripPlugin.timelineControlElement,
		[
			"div",
			{
				"class": "pf-timeline-cues-container"
			}
		]);
	},

	positionCue: function(cueElement)
	{
		///	<summary>
		///		Positions the specified cue element on the timeline.
		///	</summary>
		///	<param name="cueElement" type="Object">
		///		The event object.
		///	</param>
		
		cueElement.style.left = 100 * cueElement.cue.startTime / this.player.duration() + "%";
		cueElement.style.display = "block";
	}
});
﻿PlayerFramework.Plugins.TrackSelectorControlPlugin = PlayerFramework.ControlPlugin.extend(
{
	defaultOptions: function(player)
	{
		return PlayerFramework.mergeOptions(this._super(),
		{
			strings:
			{
				trackSelectorTitle: "Select Captions/Subtitles",
				trackSelectorLabel: "CC",
				trackOffOptionLabel: "(None)"
			},
			accessKeys:
			{
				trackSelectorKey: "t"
			},
			kind: "captions",
			trackPlugin: PlayerFramework.first(player.modules, function(m)
			{
				return m instanceof PlayerFramework.TrackPlugin && m.options.kind == "captions";
			}),
			controlStripPlugin: PlayerFramework.first(player.modules, function(m)
			{
				return m instanceof PlayerFramework.Plugins.ControlStripPlugin;
			})
		});
	},

	isEnabled: function(player, options)
	{
		return !!options.trackPlugin && !!options.controlStripPlugin;
	},

	init: function(player, options)
	{
		///	<summary>
		///		Initializes the TrackSelectorControlPlugin that provides UI for selecting a text track.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the TrackSelectorControlPlugin.
		///	</param>
		///	<returns type="TrackSelectorControlPlugin" />

		this._super(player, options);

		// Find the required plugins.
		this.trackPlugin = this.options.trackPlugin;
		this.controlStripPlugin = this.options.controlStripPlugin;

		if (!this.trackPlugin)
			throw new Error("TrackPlugin required.");

		if (!this.controlStripPlugin)
			throw new Error("ControlStripPlugin required.");
	},

	// Event Handlers
	onTextTrackAdded: function(e)
	{		
		///	<summary>
		///		Called when a chapter cue is added. Displays the chapter navigation arrows next to the timeline.
		///	</summary>

		if (this.controlStripPlugin.element.className.indexOf("pf-track-selector") === -1)
			this.createControl();
	},

	onPlayerMouseOut: function(e)
	{
		///	<summary>
		///		Called when the mouse leaves the player.
		///	</summary>
		
		if (this.popUpSelectorControl && this.player.options.overlayControls)
			this.popUpSelectorControl.style.display = "none";
	},

	onPlayerMouseOver: function(e)
	{
		///	<summary>
		///		Called when the mouse enters the player.
		///	</summary>

		if (this.popUpSelectorControl && this.player.options.overlayControls)
			this.popUpSelectorControl.style.display = "block";		
	},

	onPopUpSelectorOptionClick: function(e)
	{
		if (!this.trackPlugin.isActiveTextTrack(e.textTrack))
		{
			PlayerFramework.forEach(this.player.textTracks, PlayerFramework.proxy(this, function(t)
			{
				if (t.kind == this.options.kind)
					this.trackPlugin.deactivateTextTrack(t);
			}));

			if (e.textTrack.label != this.options.strings.trackOffOptionLabel)
				this.trackPlugin.activateTextTrack(e.textTrack);
		}

		this.removePopUpSelectorControl();
	},

	onSelectTrackClick: function(e)
	{		
		///	<summary>
		///		Called when the skip forward chapter button is clicked.
		///	</summary>

		if (!this.popUpSelectorControl)
			this.createPopUpSelectorControl();
		else
			this.removePopUpSelectorControl();
	},

	onReady: function(e)
	{		
		///	<summary>
		///		Called when the player is ready for playback.
		///	</summary>

		this.addEventListeners();
	},

	// Functions
	addEventListeners: function()
	{
		///	<summary>
		///		Adds event listeners to the control's elements.
		///	</summary>

		PlayerFramework.addEvent(this.player, "texttrackadded", PlayerFramework.proxy(this, this.onTextTrackAdded));		
	},

	createControl: function()
	{
		///	<summary>
		///		Creates and appends all markup for the controls to the DOM.
		///	</summary>

		this.controlStripPlugin.element.className += " pf-track-selector";

		this.selectTrackControlElement = PlayerFramework.createElement(null,
		[
			"div",
			{
				"class": "pf-track-selector-control"
			},
			[
				"button",
				{
					"class": "pf-button",
					type: "button",
					title: this.options.strings.trackSelectorTitle,
					accessKey: this.options.accessKeys.trackSelectorKey
				},
				[
					"span",
					{
						"class": "pf-track-selector-box"
					},
					this.options.strings.trackSelectorLabel
				]
			]
		]);
		
		PlayerFramework.addEvent(this.selectTrackControlElement, "click", PlayerFramework.proxy(this, this.onSelectTrackClick));

		this.controlStripPlugin.element.insertBefore(this.selectTrackControlElement, this.controlStripPlugin.fullBrowserControlElement);

		this.controlStripPlugin.updateLayout();
	},
	
	createPopUpSelectorControl: function()
	{
		var textTracks = PlayerFramework.filter(this.player.textTracks, PlayerFramework.proxy(this, function(t)
		{
			return t.kind == this.options.kind;
		}));

		var selectorHeight = (textTracks.length + 1) * 22;
		var containerHeight = this.player.containerElement.offsetHeight;

		this.popUpSelectorControl = PlayerFramework.createElement(null,
		[
			"div",
			{
				"class": "pf-popup-track-selector-control",
				style: this.style(
				{
					bottom: this.player.options.overlayControls ? this.controlStripPlugin.element.offsetHeight + "px": "0",
					height: (selectorHeight < containerHeight ? selectorHeight : containerHeight) + "px",
					"overflow-x": "hidden",
					"overflow-y": (selectorHeight < containerHeight ? "hidden" : "scroll")
				})
			}
		]);

		var hasActiveTextTrack = false;
		PlayerFramework.forEach(textTracks, PlayerFramework.proxy(this, function(textTrack)
		{
			var isActiveTextTrack = this.trackPlugin.isActiveTextTrack(textTrack);

			if (isActiveTextTrack)
				hasActiveTextTrack = true;

			this.createPopUpSelectorOptionControl(textTrack, isActiveTextTrack);
		}));

		this.createPopUpSelectorOptionControl({ label: this.options.strings.trackOffOptionLabel }, !hasActiveTextTrack);
		
		PlayerFramework.addEvent(this.popUpSelectorControl, "mouseover", PlayerFramework.mouseEventProxy(this.player, "mouseover"));
		PlayerFramework.addEvent(this.popUpSelectorControl, "mouseout", PlayerFramework.mouseEventProxy(this.player, "mouseout"));

		this.player.containerElement.insertBefore(this.popUpSelectorControl, this.trackPlugin.element.nextSibling);
	},

	createPopUpSelectorOptionControl: function(textTrack, isSelected)
	{
		var popUpSelectorOption = PlayerFramework.createElement(this.popUpSelectorControl,
		[
			"div",
			{
				"class": "pf-popup-track-selector-option" + (isSelected ? " selected" : "")
			},
			[
				"button",
				{
					"class": "pf-button",
					type: "button",
					title: textTrack.label
				},
				textTrack.label
			]
		]);

		PlayerFramework.proxy(this, function(textTrack)
		{
			PlayerFramework.addEvent(popUpSelectorOption, "click", PlayerFramework.proxy(this, function(e)
			{
				this.onPopUpSelectorOptionClick(
				{
					textTrack: textTrack
				});
			}));
		})(textTrack);
	},

	removePopUpSelectorControl: function()
	{
		this.player.containerElement.removeChild(this.popUpSelectorControl);
		this.popUpSelectorControl = null;
	},

	style: function(styles)
	{
		var style = "";
		for(var name in styles)
		{
			style += name + ": " + styles[name] + "; ";
		}

		return style;
	}
});
﻿PlayerFramework.TtmlParser = PlayerFramework.Object.extend(
{
    init: function (options) {
        /// <summary>
        ///     Parses a TTML file per the W3C specification: http://www.w3.org/TR/ttaf1-dfxp/
        ///     Based on a library written by Sean Hayes.
        /// </summary>

        this._super();

        this.mergeOptions(options,
        {
            xmlNamespace: "http://www.w3.org/XML/1998/namespace",
            xhtmlNamespace: "http://www.w3.org/1999/xhtml",
            ttmlNamespace: "http://www.w3.org/ns/ttml",
            ttmlStyleNamespace: "http://www.w3.org/ns/ttml#styling",
            ttmlMetaNamespace: "http://www.w3.org/ns/ttml#metadata",
            ttmlNamespaceOld: "http://www.w3.org/2006/10/ttaf1",
            ttmlStyleNamespaceOld: "http://www.w3.org/2006/10/ttaf1#styling",
            ttmlMetaNamespaceOld: "http://www.w3.org/2006/10/ttaf1#metadata",
            smpteNamespace: "http://www.smpte-ra.org/schemas/2052-1/2010/smpte-tt",
            audioNamespace: "http://www.microsoft.com/enable#media",
            trackIdPrefix: "",
            mediaFrameRate: 30,
            mediaFrameRateMultiplier: 1,
            mediaSubFrameRate: 1,
            mediaTickRate: 1000,
            mediaStart: 0,
            mediaDuration: Math.pow(2, 53), // maximum JavaScript integer
            clockTime: /^(\d{2,}):(\d{2}):(\d{2})((?:\.\d{1,})|:(\d{2,}(?:\.\d{1,})?))?$/, // hours ":" minutes ":" seconds ( fraction | ":" frames ( "." sub-frames )? )?
            offsetTime: /^(\d+(\.\d+)?)(ms|[hmsft])$/ // time-count fraction? metric
        });

        this.root = null;
        this.layout = null;
        this.head = null;
        this.body = null;
        this.regions = null;

        // True unless we see a region definition in the TTML.
        this.usingDefaultRegion = true;

        // Ordered list of events containing times (in ms) and corresponding element.
        this.ttmlEvents = [];

        // List of audio descriptions.
        this.descriptions = [];

        // List of cues.
        this.cues = [];

        // Tree of navigation points.
        this.navigation = null;

        // Store styles here because IE doesn't support expandos on XML elements.
        this.styleSetCache = {};
        this.styleSetId = 0;

        // SMPTE-TT image support.
        this.imageCache = {};

        // Keep track of the rightmost element at each level, so that we can include left and right links.
        this.rightMostInLevel = [];

        // TtmlParser Enums
        this.nodeType = {
            elementNode: 1,
            attributeNode: 2,
            textNode: 3,
            cdataSectionNode: 4,
            entityReferenceNode: 5,
            entityNode: 6,
            processingInstructionNode: 7,
            commentNode: 8,
            documentNode: 9,
            documentTypeNode: 10,
            documentFragmentNode: 11,
            notationNode: 12
        };
    },

    parseTtml: function (document, startTime, endTime) {
        // Parse an XML document and returns its TTML captions, audio descriptions, and navigation points.
        if (startTime === undefined) startTime = this.options.mediaStart;
        if (endTime === undefined) endTime = this.options.mediaDuration;

        // Find the tt root node.
        this.root = this.getElementByTagNameNS(document, "tt", this.options.ttmlNamespace);
        if (!this.root) {
            this.options.ttmlNamespace = this.options.ttmlNamespaceOld;
            this.options.ttmlStyleNamespace = this.options.ttmlStyleNamespaceOld;
            this.options.ttmlMetaNamespace = this.options.ttmlMetaNamespaceOld;
            this.root = this.getElementByTagNameNS(document, "tt", this.options.ttmlNamespace);
        }

        if (this.root) {
            // Find the head, body, and layout nodes.
            this.head = this.getElementByTagNameNS(this.root, "head", this.options.ttmlNamespace);
            this.body = this.getElementByTagNameNS(this.root, "body", this.options.ttmlNamespace);
            this.layout = this.head ? this.getElementByTagNameNS(this.head, "layout", this.options.ttmlNamespace) : null;

            // TTML that doesn't declare any layout regions uses a default region.
            if (this.layout) {
                this.regions = this.getElementsByTagNameNS(this.layout, "region", this.options.ttmlNamespace);
                this.usingDefaultRegion = (this.regions.length === 0);
            } else {
                this.regions = [];
                this.usingDefaultRegion = true;
            }

            // Load SMPTE images.
            this.imageCache = {};

            PlayerFramework.forEach(this.getElementsByTagNameNS(this.root, "image", this.options.smpteNamespace), PlayerFramework.proxy(this, function (image) {
                var id = this.getAttributeNS(image, "id", this.options.xmlNamespace);
                if (id !== null) this.imageCache["#" + id] = image.textContent;
            }));

            // Apply the style inheritance over the tree.
            this.applyStyling();

            // Apply the time intervals over the tree.
            this.applyTiming(this.root, { first: startTime, second: endTime }, true);

            // Use the time containment as a structured navigation map.
            this.navigation = this.getNavigation(this.body);

            // Get the cues.
            this.cues = this.getCues();
        }
    },

    applyTiming: function (element, bound, isParallelContext) {
        // Walk the tree to determine the absolute start and end times of all the
        // elements using the TTML subset of the SMIL timing model.
        // The reference times passed in "bound" are absolute times, the result of
        // calling this is to set the local start time and end time to absolute times
        // between these two reference times, based on the begin, end and dur attributes
        // and to recursively set all of the children.

        var startTime, endTime;
        var beginAttr = this.getAttributeNS(element, "begin", this.options.ttmlNamespace);
        var durAttr = this.getAttributeNS(element, "dur", this.options.ttmlNamespace);
        var endAttr = this.getAttributeNS(element, "end", this.options.ttmlNamespace);

        if (beginAttr !== null) {
            // Begin attested.
            startTime = bound.first + this.getTime(beginAttr) + 0.01; // extra time added to fix cues that begin exactly when the previous cue ends
        } else {
            startTime = bound.first;
        }

        if (durAttr !== null && endAttr !== null) {
            // Both dur and end attested, the minimum interval applies.
            endTime = Math.min(Math.min(startTime + this.getTime(durAttr), bound.first + this.getTime(endAttr)), bound.second);
        } else if (endAttr !== null) {
            // Only end attested.
            endTime = Math.min(bound.first + this.getTime(endAttr), bound.second);
        } else if (durAttr !== null) {
            // Only dur attested.
            endTime = Math.min(startTime + this.getTime(durAttr), bound.second);
        } else {
            // No direct timing attested, so use default based on context.
            // "par" children have indefinite default duration, truncated by bounds.
            // "seq" children have zero default duration.
            if (isParallelContext) {
                if (startTime <= bound.second) {
                    endTime = bound.second;
                } else {
                    endTime = 0;
                }
            }
        }

        if (endTime < startTime) {
            endTime = startTime;
        }

        element.setAttribute("data-time-start", startTime);
        element.setAttribute("data-time-end", endTime);

        PlayerFramework.binaryInsert(this.ttmlEvents, { tick: startTime, elementScope: element }, this.compareTtmlEvents);
        PlayerFramework.binaryInsert(this.ttmlEvents, { tick: endTime, elementScope: element }, this.compareTtmlEvents);

        if (this.getAttributeNS(element, "role", this.options.ttmlMetaNamespace)) {
            var uri = this.getAttributeNS(element, "audio", this.options.audioNamespace);
            if (uri) {
                this.descriptions.push({
                    uri: uri,
                    startTime: startTime,
                    endTime: endTime
                });
                this.descriptions.sort(this.compareDescriptions);
            }
        }

        var seqStartTime = startTime;
        var timeContext = this.getAttributeNS(element, "timeContainer", this.options.ttmlNamespace);

        PlayerFramework.forEach(this.getChildElements(element), PlayerFramework.proxy(this, function (childElement) {
            if (timeContext !== "seq") {
                this.applyTiming(childElement, { first: startTime, second: endTime }, true);
            } else {
                this.applyTiming(childElement, { first: seqStartTime, second: endTime }, false);
                seqStartTime = new Number(this.getAttribute(childElement, "data-time-end"));
            }
        }));
    },

    getTime: function (timeExpression) {
        // Utility object to handle TTML time expressions. Could be improved, but seems to do the job.
        // In particular, we are not currently handling TTML parameters for tick rate and so on.

        // NOTE: IE cannot parse time formats containing frames (e.g. "00:00:04.18" works, but not "00:00:04:18")
        // To overlay custom and native captions for testing purposes, use the CaptionsPlugin.displayMode option.

        var v1 = this.options.clockTime.exec(timeExpression);
        var v2 = this.options.offsetTime.exec(timeExpression);

        if (v1 != null) {
            var hours = new Number(v1[1]);
            var minutes = new Number(v1[2]);
            var seconds = new Number(v1[3]);
            var frames = 0;

            if (!isNaN(v1[4])) {
                seconds += new Number(v1[4]);
            }

            if (!isNaN(v1[5])) {
                frames = new Number(v1[5]);
            }

            return hours * this.getMetricMultiplier("h") + minutes * this.getMetricMultiplier("m") + seconds * this.getMetricMultiplier("s") + frames * this.getMetricMultiplier("f");
        } else if (v2 != null) {
            return new Number(v2[1]) * this.getMetricMultiplier(v2[3]);
        } else {
            return 0;
        }
    },

    getMetricMultiplier: function (timeExpression) {
        switch (timeExpression) {
            case "h":
                return 1000 * 60 * 60;
            case "m":
                return 1000 * 60;
            case "s":
                return 1000;
            case "ms":
                return 1;
            case "f":
                return 1000 / this.options.mediaFrameRate;
            case "t":
                return 1000 / this.options.mediaTickRate;
            default:
                return 0;
        }
    },

    compareTtmlEvents: function (a, b) {
        // Compare TTML events for sorting purposes.

        return a.tick - b.tick;
    },

    compareDescriptions: function (a, b) {
        // Compare descriptions for sorting purposes.

        return a.startTime - b.startTime;
    },

    getNavigation: function (element) {
        // Navigation elements are marked with the extensions role="x-nav-..."
        // We want to find the lists of nav-labels, where each label goes in the right level of list.
        // The structure of this is loosely based on daisy NCK files.

        return this.getNavigationPoint(element, null, 0);
    },

    getNavigationList: function (element, parent, level) {
        // A nav list is supposed to be a list of nav points, but a nav point can be a degenerate nav label.

        var list = [];
        var role = this.getAttributeNS(element, "role", this.options.ttmlMetaNamespace);

        if (role !== null && !PlayerFramework.first(role, function (r) { return r === "x-nav-list"; })) {
            var childElements = this.getChildElements(element);
            for (var i = 0; i < childElements.length; i++) {
                var point = this.getNavigationPoint(childElements[i], parent, level);
                if (point != null) {
                    list.push(point);
                }
            }
        }

        return list;
    },

    getNavigationPoint: function (element, parent, level) {
        // A nav point is an element tagged with the x-nav-point role, containing one label, and one list.
        // If the list is empty, then the label can stand on its own for the whole point.

        var label = null;
        var subtree = [];
        var node = {};

        // Keep the high tide mark for how deep in the tree we are.
        if (this.rightMostInLevel.length <= level) {
            this.rightMostInLevel.push(null);
        }

        var role = this.getAttributeNS(element, "role", this.options.ttmlMetaNamespace);

        switch (role) {
            case "x-nav-label": // Degenerate form.
                label = this.getNavigationLabel(element);
                break;
            case "x-nav-point": // Full form contains a label and a list.
                PlayerFramework.forEach(this.getChildElements(element), PlayerFramework.proxy(this, function (childElement) {
                    var childRole = this.getAttributeNS(childElement, "role", this.options.ttmlMetaNamespace);
                    switch (childRole) {
                        // Should only be one of each. but allow last to win.
                        case "x-nav-label":  // Contains text, and use its timing.
                            label = this.getNavigationLabel(childElement);
                            break;
                        case "x-nav-list":   // Contains either a list of navPoints.
                            subtree = this.getNavigationList(childElement, node, level + 1);
                            break;
                        default:
                            break;
                    }
                }));
                break;
            default:
                break;  // Ignore anything else.
        }

        if (label !== null) {
            node.text = label.text;
            node.startTime = new Number(label.startTime) / 1000 + 0.01;
            node.endTime = new Number(label.endTime) / 1000;
            node.parent = parent;
            node.left = this.rightMostInLevel[level];
            node.right = null;
            node.children = subtree;

            if (this.rightMostInLevel[level] !== null) {
                this.rightMostInLevel[level].right = node;
            }

            this.rightMostInLevel[level] = node;

            return node;
        } else {
            return null;
        }
    },

    getNavigationLabel: function (element) {
        // A nav label is just text, but we use its timing to create an interval into the media for navigation.

        var role = this.getAttributeNS(element, "role", this.options.ttmlMetaNamespace);

        if (role !== null && !PlayerFramework.first(role, function (r) { return r === "x-nav-label"; })) {
            return {
                text: element.innerHTML,
                startTime: this.getAttribute(element, "data-time-start"),
                endTime: this.getAttribute(element, "data-time-end")
            };
        }
    },

    getCues: function () {
        // Get all cues for the set of TTML events.
        // Unroll using ttmlEvents and getCuesAtTime.
        // This then makes it easier to use the <track> APIs and also use the same interface for WebVTT, SRT etc.

        var cues = [];

        for (var i = 0; i < this.ttmlEvents.length; i++) {
            var ttmlEvent = this.ttmlEvents[i];

            if (ttmlEvent.elementScope === this.root) {
                continue;
            }

            var ttmlEventCues = this.getCuesAtTime(ttmlEvent.elementScope, ttmlEvent.tick);

            if (i > 0) {
                for (var j = i - 1; j >= 0; j--) {
                    var previousTtmlEvent = this.ttmlEvents[j];

                    if (previousTtmlEvent.elementScope === this.root || previousTtmlEvent.elementScope === ttmlEvent.elementScope) {
                        continue;
                    }

                    var overlappingCues = this.getCuesAtTime(previousTtmlEvent.elementScope, ttmlEvent.tick);

                    if (overlappingCues.length > 0) {
                        ttmlEventCues.push(overlappingCues[0]);
                    } else {
                        break;
                    }
                }
            }

            for (var k = 0; k < ttmlEventCues.length; k++) {
                var ttmlEventCue = ttmlEventCues[k];
                var nextTtmlEvent = this.ttmlEvents[i + 1];

                cues.push({
                    cue: ttmlEventCue,
                    startTime: ttmlEvent.tick / 1000,
                    endTime: (nextTtmlEvent) ? nextTtmlEvent.tick / 1000 : this.options.mediaDuration
                });
            }
        }

        return cues;
    },

    getCuesAtTime: function (element, tick) {
        // Get cues for a given time instant.

        var cues = [];

        if (element && this.isTemporallyActive(element, tick)) {
            if (!this.usingDefaultRegion) {
                PlayerFramework.forEach(this.regions, PlayerFramework.proxy(this, function (region) {
                    var cueElement = this.translateMarkup(region, tick);

                    if (cueElement) {
                        // Create a new subtree for the body element, prune elements not associated
                        // with the region, and if it's not empty then select it into this region by
                        // adding it to cue element container.

                        var regionId = this.getAttributeNS(region, "id", this.options.xmlNamespace);
                        var prunedElement = this.prune(element, regionId, tick);

                        if (prunedElement) {
                            cueElement.appendChild(prunedElement);
                        }

                        if (cueElement.getAttribute("data-showBackground") !== "whenActive" && cueElement.innerHTML.trim() !== "") {
                            cues.push(cueElement);
                        }
                    }
                }));
            } else {
                var cueElement = document.createElement("div");
                cueElement.className = "pf-cue";

                var prunedElement = this.prune(element, "", tick);

                if (prunedElement) {
                    cueElement.appendChild(prunedElement);
                }

                if (this.getChildElements(cueElement).length > 0) {
                    cues.push(cueElement);
                }
            }
        }

        return cues;
    },

    isTemporallyActive: function (element, tick) {
        var startTime = Math.round(1000 * parseFloat(this.getAttribute(element, "data-time-start"))) / 1000;
        var endTime = Math.round(1000 * parseFloat(this.getAttribute(element, "data-time-end"))) / 1000;
        var time = Math.round(1000 * tick) / 1000;

        return (startTime <= time) && (endTime > time);
    },

    translateMarkup: function (element, tick) {
        // Convert elements in TTML to their equivalent in HTML.

        var translation;
        var name = this.getTagNameEquivalent(element);
        var htmlName = "";
        var htmlClass = "";
        var htmlAttrs = {};

        if (element && this.isTemporallyActive(element, tick)) {
            switch (name) {
                case "tt:region":
                case "tt:tt": // We get this if there is no region.
                    htmlClass = "pf-cue "; // To simulate the ::cue selector.
                    htmlName = "div";
                    break;
                case "tt:body":
                case "tt:div":
                    htmlName = "div";
                    break;
                case "tt:p":
                    htmlName = "p";
                    break;
                case "tt:span":
                    htmlName = "span";
                    break;
                case "tt:br":
                    htmlName = "br";
                    break;
                case "":
                    break;
                default:
                    htmlName = name;
                    PlayerFramework.forEach(element.attributes, function (attribute) { htmlAttrs[attribute.name] = attribute.value; });
                    break;
            }

            var roleAttr = this.getAttributeNS(element, "role", this.options.ttmlMetaNamespace);
            if (roleAttr) htmlClass += roleAttr + " ";

            var classAttr = this.getAttributeNS(element, "class", this.options.xhtmlNamespace);
            if (classAttr) htmlClass += classAttr + " ";

            // Hack until display:ruby on other elements works.
            if (roleAttr === "x-ruby") htmlName = "ruby";
            if (roleAttr === "x-rubybase") htmlName = "rb";
            if (roleAttr === "x-rubytext") htmlName = "rt";

            // Convert image based captions here; and move the text into its alt.
            // If I could get inline CSS to work div's then this would be set as style.
            var imageAttr = this.getAttribute(element, "image");
            if (imageAttr !== null) htmlName = "img";

            if (htmlName !== "") {
                translation = document.createElement(htmlName);
                translation.className = htmlClass.trim();

                // Move ID's over. Use trackIdPrefix to ensure there are no name clases on id's already in target doc.
                var idAttr = this.getAttributeNS(element, "id", this.options.xmlNamespace);
                if (idAttr) translation.setAttribute("id", this.options.trackIdPrefix + idAttr);

                // Copy style from element over to html, translating into CSS as we go
                this.translateStyle(element, translation, tick);

                // If we are copying over html elements, then copy any attributes too.
                for (var attr in htmlAttrs) {
                    translation.setAttribute(attr, htmlAttrs[attr]);
                }

                if (imageAttr !== null) {
                    translation.setAttribute("src", imageAttr);
                    translation.setAttribute("alt", element.innerHTML);
                }
            }
        }

        return translation;
    },

    translateStyle: function (element, htmlElement, tick) {
        // Convert from TTML style names to CSS.

        // Clone of the base style set.
        var computedStyleSet = {};
        var styles = this.styleSetCache[this.getAttribute(element, "__styleSet__")];

        for (var name in styles) {
            computedStyleSet[name] = styles[name];
        }

        // Apply inline styles.
        PlayerFramework.forEach(this.getElementsByTagNameNS(element, "set", this.options.ttmlNamespace), PlayerFramework.proxy(this, function (childElement) {
            if (this.isTemporallyActive(childElement, tick)) {
                this.applyInlineStyles(childElement, computedStyleSet);
            }
        }));

        // Apply CSS styles.
        for (var name in computedStyleSet) {
            var value = computedStyleSet[name];
            switch (name) {
                case "origin":
                    var coords = value.split(/\s/);
                    htmlElement.style.position = "absolute";
                    htmlElement.style.left = coords[0];
                    htmlElement.style.top = coords[1];
                    break;
                case "extent":
                    var coords = value.split(/\s/);
                    htmlElement.style.width = coords[0];
                    htmlElement.style.height = coords[1];
                    break;
                case "displayAlign":
                    htmlElement.style.textAlign = value;
                    break;
                case "wrapOption":
                    htmlElement.style.whiteSpace = (value === "nowrap") ? "nowrap" : "normal";
                    break;
                default:
                    htmlElement.style[name] = value;
                    break;
            }
        }
    },

    applyStyling: function () {
        // Apply styling to every element in the body.

        var nodes = this.root.getElementsByTagName("*");

        for (var i = 0; i < nodes.length; i++) {
            this.applyStyle(nodes[i]);
        }
    },

    applyStyle: function (element) {
        // Apply styles in the correct order to element.

        var styleSet = {};

        // Find all the applicable styles and set them as properties on styleSet.
        this.applyStylesheet(element, styleSet);
        this.applyInlineStyles(element, styleSet);

        // Record the applied set to the element
        this.styleSetCache[this.styleSetId] = styleSet;
        element.setAttribute("__styleSet__", this.styleSetId++);
    },

    applyStylesheet: function (element, styleSet) {
        // For each style id on element, find the corresponding style element
        // and then apply the stylesheet into styleset; this recurses over the tree of referenced styles.

        var styleAttr = this.getAttributeNS(element, "style", this.options.ttmlNamespace);

        if (styleAttr !== null) {
            var styleIds = styleAttr.split(/\s/); // Find all the style ID references.
            var isStyleElement = this.hasTagNameNS(element, "style", this.options.ttmlNamespace); // Detect if we are referencing style from a style.

            PlayerFramework.forEach(styleIds, PlayerFramework.proxy(this, function (styleId) {
                // Find all the style elements in the TTML namespace.
                PlayerFramework.forEach(this.getElementsByTagNameNS(this.head, "style", this.options.ttmlNamespace), PlayerFramework.proxy(this, function (styleElement) {
                    if (this.getAttributeNS(styleElement, "id", this.options.xmlNamespace) === styleId) {
                        this.applyStylesheet(styleElement, styleSet);

                        // If the element is region, do nested styles (note regions can only be referenced from elements in the body).
                        if (!isStyleElement && this.hasTagNameNS(styleElement, "region", this.options.ttmlNamespace)) {
                            PlayerFramework.forEach(this.getElementsByTagNameNS(styleElement, "style", this.options.ttmlNamespace), PlayerFramework.proxy(this, function (childElement) {
                                this.applyStylesheet(childElement, styleSet);
                            }));
                        }

                        // Do inline styles.
                        this.applyInlineStyles(styleElement, styleSet);
                    }
                }));
            }));
        }
    },

    applyInlineStyles: function (element, styleSet) {
        // Apply style attributes into styleset.
        PlayerFramework.forEach(element.attributes, PlayerFramework.proxy(this, function (attribute) {
            var ns = this.getNamespace(attribute);
            if (ns === this.options.ttmlStyleNamespace) {
                styleSet[this.getLocalTagName(attribute)] = attribute.nodeValue;
            }
            else if (ns === this.options.smpteNamespace && this.getLocalTagName(attribute) === "backgroundImage") {
                var imageId = attribute.nodeValue;
                if (imageId.indexOf("#") === 0) {
                    element.setAttribute("image", "data:image/png;base64," + this.imageCache[imageId]);
                } else {
                    element.setAttribute("image", imageId);
                }
            }
        }));
    },

    isInRegion: function (element, regionId) {
        // A content element is associated with a region according to the following ordered rules,
        // where the first rule satisfied is used and remaining rules are skipped:

        // Quick test: Out of normal order, but makes following rules simpler.
        if (regionId === "" || regionId === undefined) {
            return this.usingDefaultRegion;
        }

        // 1. If the element specifies a region attribute, then the element is associated with the
        // region referenced by that attribute;
        if (this.getAttributeNS(element, "region", this.options.ttmlNamespace) === regionId) {
            return true;
        }

        // 2. If some ancestor of that element specifies a region attribute, then the element is
        // associated with the region referenced by the most immediate ancestor that specifies
        // this attribute;
        var ancestor = element.parentNode;
        while (ancestor !== null && ancestor.nodeType === this.nodeType.elementNode) {
            var id = this.getAttributeNS(ancestor, "region", this.options.ttmlNamespace);
            if (id) return id === regionId;
            ancestor = ancestor.parentNode;
        }

        // 3. If the element contains a descendant element that specifies a region attribute,
        // then the element is associated with the region referenced by that attribute;
        var nodes = element.getElementsByTagName("*");
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (this.getAttributeNS(node, "region", this.options.ttmlNamespace) === regionId && this.getNamespace(node) === this.options.ttmlNamespace) {
                return true;
            }
        }

        // 4. If a default region was implied (due to the absence of any region element), then
        // the element is associated with the default region;
        if (this.usingDefaultRegion) {
            return regionId === "";
        }

        // 5. The element is not associated with any region.
        return false;
    },

    prune: function (element, regionId, tick) {
        /// Convert the element if it is in the region, then recurse into its contents.
        /// If it ends up with no children, then we dont add it to the region.

        var clone = undefined;

        if (this.isInRegion(element, regionId)) {
            clone = this.translateMarkup(element, tick);

            if (!clone) {
                return clone;
            }

            for (var i = 0; i < element.childNodes.length; i++) {
                var childElement = element.childNodes[i];
                if (childElement.nodeType !== this.nodeType.commentNode) {
                    if (childElement.nodeType === this.nodeType.textNode) {
                        clone.appendChild(document.createTextNode(childElement.data));
                    } else {
                        var prunedChildElement = this.prune(childElement, regionId, tick);
                        if (prunedChildElement) {
                            clone.appendChild(prunedChildElement);
                        }
                    }
                }
            }
        }

        return clone;
    },

    getTagNameEquivalent: function (element) {
        var name = this.getLocalTagName(element);

        switch (this.getNamespace(element)) {
            case this.options.xhtmlNamespace:
                return name;
            case this.options.ttmlNamespace:
                return "tt:" + name;
            case this.options.smpteNamespace:
                return "smpte:" + name;
            default:
                return "";
        }
    },

    getLocalTagName: function (element) {
        if (element.localName) {
            return element.localName;
        } else {
            return element.baseName;
        }
    },

    hasTagNameNS: function (element, name, namespace) {
        if (element.localName) {
            return (name === element.localName && this.getNamespace(element) === namespace);
        } else {
            return (name === element.baseName && this.getNamespace(element) === namespace);
        }
    },

    getElementByTagNameNS: function (element, name, namespace) {
        return this.getElementsByTagNameNS(element, name, namespace)[0] || null;
    },

    getElementsByTagNameNS: function (element, name, namespace) {
        if (element.getElementsByTagNameNS) {
            return PlayerFramework.getArray(element.getElementsByTagNameNS(namespace, name));
        }
        else {
            return PlayerFramework.getArray(element.getElementsByTagName(name)).filter(function (element) { return element.namespaceUri === namespace; });
        }
    },

    getAttributeNS: function (element, name, namespace) {
        var result = element.getAttributeNS(namespace, name);
        if (result === "") {
            result = this.getAttribute(element, name);
        }
        return result;
    },

    getAttribute: function (element, name) {
        if (element.nodeType === this.nodeType.elementNode) {
            var value = element.getAttribute(name);

            if (value) {
                return value;
            } else if (element.prefix) {
                // Bug in Encoder moves unprefixed attributes
                return element.getAttribute(element.prefix + ":" + name);
            }
        }

        return null;
    },

    getNamespace: function (element) {
        return (element.namespaceUri) ? element.namespaceUri : element.namespaceURI;
    },

    getChildElements: function (element) {
        var childElements = [];

        for (var childElement = element.firstChild; childElement; childElement = childElement.nextSibling) {
            if (childElement.nodeType === this.nodeType.elementNode) {
                childElements.push(childElement);
            }
        }

        return childElements;
    }
});

﻿PlayerFramework.Plugins.VideoElementMediaPlugin = PlayerFramework.Plugins.VideoElementMediaPluginBase.extend(
{
	init: function(player, options, playerOptions)
	{
		///	<summary>
		///		Initializes the VideoMediaPlugin that injects and wraps the HTML5 video element.
		///	</summary>
		///	<param name="player" type="Object">
		///		The Player object.
		///	</param>
		///	<param name="options" type="Object">
		///		The options for the VideoElementMediaPlugin.
		///	</param>
		///	<param name="playerOptions" type="Object">
		///		The merged player options for the current media source.
		///	</param>
		///	<returns type="VideoElementMediaPlugin" />

		this._super(player, options, playerOptions);

		this.render();
	},

	render: function()
	{
		///	<summary>
		///		Creates and sets the MediaPlugin's element given the plugin and player options
		///		and a specific template.
		///	</summary>

		this.element = PlayerFramework.createElement(null,
		[
			"video",
			{
				"class": this.options["class"],
				width: this.playerOptions.width,
				height: this.playerOptions.height,
				controls: "controls", /* Controls must be turned on initially for compatibility with some browsers. */
				poster: this.playerOptions.poster || null,
				autoplay: this.playerOptions.autoplay || null
			}
		]);

		for (var i = 0; i < this.playerOptions.sources.length; i++)
		{
			var source = this.playerOptions.sources[i];
			if (this.canPlayType(source.type))
			{
				PlayerFramework.createElement(this.element,
				[
					"source",
					source
				]);
			}
		}
	}
});
