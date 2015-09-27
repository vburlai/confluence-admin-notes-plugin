/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

var AdminNotesService = {
    '$':         AJS.$, // jQuery
    'urlPrefix': AJS.contextPath() + '/plugins/servlet/confluence-admin-notes/plugins/'
};

/**
 * Get notes for all plugins
 *
 * @returns the deferred object, .done function get the data
 */
AdminNotesService.getPlugins = function () {
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
 * Get notes for the specified plugin key
 *
 * @param   pluginKey plugin key
 * @returns the deferred object, .done function gets the value
 */
AdminNotesService.get = function (pluginKey) {
    var deferred = this.$.Deferred();

    this.$.getJSON(this.urlPrefix + pluginKey + '/')
        .done(function (obj) {
            deferred.resolve(obj[pluginKey]);
        })
        .fail(function (xhr, status) {
            deferred.reject();
        });

    return deferred;
};


/**
 * Set notes for the specified plugin key
 *
 * @param   pluginKey plugin key
 * @param   from  existing value or empty string ""
 * @param   to    new value
 * @returns the deferred object, .fail function gets the value at server (which caused conflict)
 */
AdminNotesService.set = function (pluginKey, from, to) {
    var deferred = this.$.Deferred();
    var params = 'from=' + encodeURIComponent(from) + '&to=' + encodeURIComponent(to);

    this.$.ajax(
        this.urlPrefix + pluginKey + '/?' + params,
        {'type': 'PUT'})
        .done(function (obj, status, xhr) {
            if (xhr.status == 200) {
                deferred.resolve();
            } else {
                deferred.reject(obj[pluginKey]);
            }
        })
        .fail(function (xhr, status) {
            var obj = JSON.parse(xhr.responseText);
            deferred.reject(typeof obj == "object" ? obj[pluginKey] : null);
        });

    return deferred;
};


/**
 * Remove notes for the specified plugin key
 *
 * @param   pluginKey plugin key
 * @param   value     existing value
 * @returns the deferred object, .fail function gets the value at server (which was not removed)
 */

AdminNotesService.remove = function (pluginKey, value) {
    var deferred = this.$.Deferred();
    var params = 'value=' + encodeURIComponent(value);

    this.$.ajax(
        this.urlPrefix + pluginKey + '/?' + params,
        {'type': 'DELETE'})
        .done(function (obj, status, xhr) {
            if (xhr.status == 200) {
                deferred.resolve();
            } else {
                deferred.reject(obj[pluginKey]);
            }
        })
        .fail(function (xhr, status) {
            var obj = JSON.parse(xhr.responseText);
            deferred.reject(typeof obj == "object" ? obj[pluginKey] : null);
        });

    return deferred;
};

