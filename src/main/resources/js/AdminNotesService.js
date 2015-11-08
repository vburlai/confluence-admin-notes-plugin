/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

/**
 * Main communication point from UI to REST-full back-end storage
 */
var AdminNotesService = {
    '$':         AJS.$, // jQuery
    'endpointUrl': AJS.contextPath() + '/plugins/servlet/confluence-admin-notes/',
    'urlPrefix': '',
    'PLUGINS': 'plugins',
    'MACROS': 'macros',
    'context': undefined
};

/**
 * Switch context to working with Plugins
 */
AdminNotesService.setPluginsContext = function () {
    this.context = this.PLUGINS;
    this.urlPrefix = this.endpointUrl + this.context + '/';
};

/**
 * Switch context to working with Macros
 */
AdminNotesService.setMacrosContext = function () {
    this.context = this.MACROS;
    this.urlPrefix = this.endpointUrl + this.context + '/';
};

/**
 * Returns current context
 */
AdminNotesService.getContext = function () {
    return this.context;
};

/**
 * Get notes for all entries
 *
 * @returns the deferred object, .done function gets the data
 */
AdminNotesService.getEntries = function () {
    var deferred = this.$.Deferred();

    this.$.getJSON(this.urlPrefix)
        .done(function (obj) {
            deferred.resolve(obj);
        })
        .fail(function (xhr, status) {
            deferred.reject();
        });

    return deferred;
};

/**
 * Get notes for the specified key
 *
 * @param   key key
 * @returns the deferred object, .done function gets the value
 */
AdminNotesService.get = function (key) {
    var deferred = this.$.Deferred();

    this.$.getJSON(this.urlPrefix + key + '/')
        .done(function (obj) {
            deferred.resolve(obj[key]);
        })
        .fail(function (xhr, status) {
            deferred.reject();
        });

    return deferred;
};


/**
 * Set notes for the specifie key
 *
 * @param   key   key
 * @param   from  existing value or empty string ""
 * @param   to    new value
 * @returns the deferred object, .fail function gets the value at server (which caused conflict)
 */
AdminNotesService.set = function (key, from, to) {
    var deferred = this.$.Deferred();
    var params = 'from=' + encodeURIComponent(from) + '&to=' + encodeURIComponent(to);

    this.$.ajax(
        this.urlPrefix + key + '/?' + params,
        {'type': 'PUT'})
        .done(function (obj, status, xhr) {
            if (xhr.status == 200) {
                deferred.resolve();
            } else {
                deferred.reject(obj[key]);
            }
        })
        .fail(function (xhr, status) {
            var res = null;
            try {
                var obj = JSON.parse(xhr.responseText);
                res = typeof obj == "object" ? obj[key] : null;
            } catch (e) {};
            deferred.reject(res);
        });

    return deferred;
};


/**
 * Remove notes for the specified key
 *
 * @param   key       key
 * @param   value     existing value
 * @returns the deferred object, .fail function gets the value at server (which was not removed)
 */

AdminNotesService.remove = function (key, value) {
    var deferred = this.$.Deferred();
    var params = 'value=' + encodeURIComponent(value);

    this.$.ajax(
        this.urlPrefix + key + '/?' + params,
        {'type': 'DELETE'})
        .done(function (obj, status, xhr) {
            if (xhr.status == 200) {
                deferred.resolve();
            } else {
                deferred.reject(obj[key]);
            }
        })
        .fail(function (xhr, status) {
            var res = null;
            try {
                var obj = JSON.parse(xhr.responseText);
                res = typeof obj == "object" ? obj[key] : null;
            } catch (e) {};
            deferred.reject(res);
        });

    return deferred;
};


// set default context to working with plugins
AdminNotesService.setPluginsContext();

